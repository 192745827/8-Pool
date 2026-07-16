import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { Tournament } from '../models/Tournament';
import { Room } from '../models/Room';
import { gameRoomManager } from './game';

// Helper to find or create the active tournament
const getOrCreateActiveTournament = async () => {
  let tournament = await Tournament.findOne({ status: { $ne: 'completed' } })
    .populate('registeredPlayers', 'username avatar rank wins losses xp coins')
    .populate('champion', 'username avatar')
    .populate('matches.player1', 'username avatar')
    .populate('matches.player2', 'username avatar')
    .populate('matches.winner', 'username avatar');

  if (!tournament) {
    tournament = new Tournament({
      tournamentId: 'TOURNAMENT_MAIN',
      name: 'ANTIGRAVITY 8-POOL CHAMPIONSHIP',
      status: 'registration',
      registeredPlayers: [],
      matches: [],
    });
    await tournament.save();
  }
  return tournament;
};

export const registerTournamentHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const userId = socket.user?.id;
  if (!userId) return;

  // 1. GET TOURNAMENT BRACKET
  socket.on('get-tournament-bracket', async () => {
    try {
      const tournament = await getOrCreateActiveTournament();
      socket.emit('tournament-updated', tournament);
    } catch (err: any) {
      socket.emit('tournament-error', { message: err.message || 'Failed to fetch bracket' });
    }
  });

  // 2. JOIN TOURNAMENT
  socket.on('join-tournament', async () => {
    try {
      const tournament = await getOrCreateActiveTournament();
      if (tournament.status !== 'registration') {
        throw new Error('Tournament registration is closed');
      }

      const isRegistered = tournament.registeredPlayers.some(
        (p: any) => p._id.toString() === userId
      );
      if (isRegistered) {
        throw new Error('You are already registered');
      }

      tournament.registeredPlayers.push(userId as any);

      // Check if registration is complete (4 players)
      if (tournament.registeredPlayers.length >= 4) {
        tournament.status = 'semi-final';
        
        // Generate brackets
        const players = tournament.registeredPlayers;
        
        // Match 1: Player 0 vs Player 1
        const roomId1 = `TOURNAMENT_SF1`;
        const match1 = {
          matchId: 'SF_MATCH_1',
          round: 'semi-final' as const,
          player1: players[0],
          player2: players[1],
          roomId: roomId1,
          status: 'pending' as const,
        };

        // Match 2: Player 2 vs Player 3
        const roomId2 = `TOURNAMENT_SF2`;
        const match2 = {
          matchId: 'SF_MATCH_2',
          round: 'semi-final' as const,
          player1: players[2],
          player2: players[3],
          roomId: roomId2,
          status: 'pending' as const,
        };

        tournament.matches = [match1, match2];

        // Clean old rooms if they exist
        await Room.deleteMany({ roomId: { $in: [roomId1, roomId2] } });

        // Initialize Rapier Match Sessions & Database Rooms
        await Room.create({
          roomId: roomId1,
          host: players[0],
          guest: players[1],
          status: 'playing',
          isPrivate: true,
        });
        gameRoomManager.createMatch(roomId1, players[0].toString(), players[1].toString());

        await Room.create({
          roomId: roomId2,
          host: players[2],
          guest: players[3],
          status: 'playing',
          isPrivate: true,
        });
        gameRoomManager.createMatch(roomId2, players[2].toString(), players[3].toString());
      }

      await tournament.save();

      // Fetch freshly populated tournament
      const updated = await Tournament.findById(tournament._id)
        .populate('registeredPlayers', 'username avatar rank wins losses xp coins')
        .populate('champion', 'username avatar')
        .populate('matches.player1', 'username avatar')
        .populate('matches.player2', 'username avatar')
        .populate('matches.winner', 'username avatar');

      io.emit('tournament-updated', updated);
    } catch (err: any) {
      socket.emit('tournament-error', { message: err.message || 'Failed to join tournament' });
    }
  });

  // 3. LEAVE TOURNAMENT
  socket.on('leave-tournament', async () => {
    try {
      const tournament = await getOrCreateActiveTournament();
      if (tournament.status !== 'registration') {
        throw new Error('Tournament already started, cannot deregister');
      }

      tournament.registeredPlayers = tournament.registeredPlayers.filter(
        (p: any) => p._id.toString() !== userId
      );

      await tournament.save();

      // Fetch freshly populated tournament
      const updated = await Tournament.findById(tournament._id)
        .populate('registeredPlayers', 'username avatar rank wins losses xp coins')
        .populate('champion', 'username avatar')
        .populate('matches.player1', 'username avatar')
        .populate('matches.player2', 'username avatar')
        .populate('matches.winner', 'username avatar');

      io.emit('tournament-updated', updated);
    } catch (err: any) {
      socket.emit('tournament-error', { message: err.message || 'Failed to leave tournament' });
    }
  });
};

export const handleTournamentMatchCompletion = async (
  roomId: string,
  winnerUserId: string,
  io: Server
): Promise<void> => {
  try {
    const tournament = await Tournament.findOne({ status: { $ne: 'completed' } });
    if (!tournament) return;

    const matchIndex = tournament.matches.findIndex((m) => m.roomId === roomId);
    if (matchIndex === -1) return;

    const match = tournament.matches[matchIndex];
    if (match.status === 'completed') return;

    match.status = 'completed';
    match.winner = winnerUserId as any;

    if (match.round === 'final') {
      tournament.champion = winnerUserId as any;
      tournament.status = 'completed';
    } else if (match.round === 'semi-final') {
      const allCompleted = tournament.matches
        .filter((m) => m.round === 'semi-final')
        .every((m) => m.status === 'completed');

      if (allCompleted) {
        tournament.status = 'final';
        const sf1 = tournament.matches.find((m) => m.matchId === 'SF_MATCH_1');
        const sf2 = tournament.matches.find((m) => m.matchId === 'SF_MATCH_2');
        
        if (sf1 && sf2 && sf1.winner && sf2.winner) {
          const finalRoomId = 'TOURNAMENT_FINAL';
          const finalMatch = {
            matchId: 'FINAL_MATCH',
            round: 'final' as const,
            player1: sf1.winner,
            player2: sf2.winner,
            roomId: finalRoomId,
            status: 'pending' as const,
          };
          tournament.matches.push(finalMatch);

          // Clean old room if exists
          await Room.deleteMany({ roomId: finalRoomId });

          // Initialize database Room & Rapier match session
          await Room.create({
            roomId: finalRoomId,
            host: sf1.winner,
            guest: sf2.winner,
            status: 'playing',
            isPrivate: true,
          });
          gameRoomManager.createMatch(finalRoomId, sf1.winner.toString(), sf2.winner.toString());
        }
      }
    }

    await tournament.save();

    // Fetch and emit fresh state
    const updated = await Tournament.findById(tournament._id)
      .populate('registeredPlayers', 'username avatar rank wins losses xp coins')
      .populate('champion', 'username avatar')
      .populate('matches.player1', 'username avatar')
      .populate('matches.player2', 'username avatar')
      .populate('matches.winner', 'username avatar');

    io.emit('tournament-updated', updated);
  } catch (err) {
    console.error('Error in handleTournamentMatchCompletion:', err);
  }
};
