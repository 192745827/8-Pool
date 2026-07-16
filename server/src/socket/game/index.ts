import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket.types';
import { gameRoomManager } from './GameRoomManager';
import { reconnectionManager } from './ReconnectionManager';
import { GAME_EVENTS } from './GameEvents';
import { User } from '../../models/User';
import { handleTournamentMatchCompletion } from '../tournament.socket';

const getRankByXp = (xp: number): string => {
  const level = Math.floor(xp / 1000) + 1;
  if (level >= 17) return 'Grandmaster';
  if (level >= 12) return 'Master';
  if (level >= 8) return 'Pro';
  if (level >= 5) return 'Semi-Pro';
  if (level >= 3) return 'Amateur';
  return 'Beginner';
};

const updatePlayerProgression = async (
  hostId: string,
  guestId: string,
  winnerRole: 'host' | 'guest' | null,
  matchDetails: {
    hostFouls: number;
    guestFouls: number;
    hostPots: number;
    guestPots: number;
    hostMaxCombo: number;
    guestMaxCombo: number;
    hostPocketedOnBreak: boolean;
    guestPocketedOnBreak: boolean;
  }
): Promise<{ hostUnlocked: string[]; guestUnlocked: string[] }> => {
  try {
    const hostUser = await User.findById(hostId);
    const guestUser = await User.findById(guestId);

    const hostUnlocked: string[] = [];
    const guestUnlocked: string[] = [];

    if (hostUser && guestUser) {
      const checkUnlock = (user: any, ach: string) => {
        if (!user.achievements) {
          user.achievements = [];
        }
        if (!user.achievements.includes(ach)) {
          user.achievements.push(ach);
          return true;
        }
        return false;
      };

      if (winnerRole === 'host') {
        // Host wins: +100 XP, +250 Coins
        hostUser.xp += 100;
        hostUser.coins += 250;
        hostUser.wins += 1;
        hostUser.rank = getRankByXp(hostUser.xp);

        // Guest loses: +30 XP, +50 Coins
        guestUser.xp += 30;
        guestUser.coins += 50;
        guestUser.losses += 1;
        guestUser.rank = getRankByXp(guestUser.xp);

        // Host Achievements checks:
        if (hostUser.wins === 1) {
          if (checkUnlock(hostUser, 'First Win')) hostUnlocked.push('First Win');
        }
        if (hostUser.wins === 10) {
          if (checkUnlock(hostUser, '10 Wins')) hostUnlocked.push('10 Wins');
        }
        if (hostUser.wins === 50) {
          if (checkUnlock(hostUser, '50 Wins')) hostUnlocked.push('50 Wins');
        }
        if (matchDetails.hostFouls === 0) {
          if (checkUnlock(hostUser, 'No Fouls')) hostUnlocked.push('No Fouls');
        }
        if (matchDetails.guestPots === 0) {
          if (checkUnlock(hostUser, 'Perfect Game')) hostUnlocked.push('Perfect Game');
        }
        if (matchDetails.hostPocketedOnBreak) {
          if (checkUnlock(hostUser, 'Break Master')) hostUnlocked.push('Break Master');
        }
        if (matchDetails.hostMaxCombo >= 3) {
          if (checkUnlock(hostUser, 'Combo King')) hostUnlocked.push('Combo King');
        }

      } else if (winnerRole === 'guest') {
        // Guest wins: +100 XP, +250 Coins
        guestUser.xp += 100;
        guestUser.coins += 250;
        guestUser.wins += 1;
        guestUser.rank = getRankByXp(guestUser.xp);

        // Host loses: +30 XP, +50 Coins
        hostUser.xp += 30;
        hostUser.coins += 50;
        hostUser.losses += 1;
        hostUser.rank = getRankByXp(hostUser.xp);

        // Guest Achievements checks:
        if (guestUser.wins === 1) {
          if (checkUnlock(guestUser, 'First Win')) guestUnlocked.push('First Win');
        }
        if (guestUser.wins === 10) {
          if (checkUnlock(guestUser, '10 Wins')) guestUnlocked.push('10 Wins');
        }
        if (guestUser.wins === 50) {
          if (checkUnlock(guestUser, '50 Wins')) guestUnlocked.push('50 Wins');
        }
        if (matchDetails.guestFouls === 0) {
          if (checkUnlock(guestUser, 'No Fouls')) guestUnlocked.push('No Fouls');
        }
        if (matchDetails.hostPots === 0) {
          if (checkUnlock(guestUser, 'Perfect Game')) guestUnlocked.push('Perfect Game');
        }
        if (matchDetails.guestPocketedOnBreak) {
          if (checkUnlock(guestUser, 'Break Master')) guestUnlocked.push('Break Master');
        }
        if (matchDetails.guestMaxCombo >= 3) {
          if (checkUnlock(guestUser, 'Combo King')) guestUnlocked.push('Combo King');
        }
      }

      // Universal checks:
      if (hostUser.wins + hostUser.losses === 100) {
        if (checkUnlock(hostUser, '100 Matches')) hostUnlocked.push('100 Matches');
      }
      if (guestUser.wins + guestUser.losses === 100) {
        if (checkUnlock(guestUser, '100 Matches')) guestUnlocked.push('100 Matches');
      }

      await hostUser.save();
      await guestUser.save();
    }

    return { hostUnlocked, guestUnlocked };
  } catch (error) {
    console.error('Error updating player match rewards & achievements:', error);
    return { hostUnlocked: [], guestUnlocked: [] };
  }
};

export * from './GameEvents';
export * from './GameState';
export * from './PhysicsSync';
export * from './TurnSync';
export * from './RuleSync';
export * from './MatchManager';
export * from './GameRoomManager';
export * from './ReconnectionManager';

/**
 * Registers WebSocket handlers for authoritative match interactions on the server.
 */
export const registerGameHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const userId = socket.user?.id;
  if (!userId) return;

  // 1. AIM EVENT: Relays aiming stick rotation to the opponent in real-time
  socket.on(GAME_EVENTS.AIM, (data: { roomId: string; angle: number }) => {
    socket.to(data.roomId).emit(GAME_EVENTS.AIM, { userId, angle: data.angle });
  });

  // 2. SHOOT EVENT: Triggers physics simulation and rule evaluations
  socket.on(GAME_EVENTS.SHOOT, (data: { roomId: string; angle: number; power: number }) => {
    try {
      const match = gameRoomManager.getMatch(data.roomId);
      if (!match) {
        throw new Error('Active match session not found');
      }

      // Relay shot payload to opponent client for local visual replication
      socket.to(data.roomId).emit(GAME_EVENTS.SHOOT, { angle: data.angle, power: data.power });

      const result = match.executeShot(userId, data.angle, data.power);
      if (result.error) {
        socket.emit('game-error', { message: result.error });
        return;
      }

      // Register player connection details for disconnections
      reconnectionManager.registerPlayer(userId, data.roomId, socket.id);

      // Emit granular updates to clients as specified in the architecture
      io.to(data.roomId).compress(true).emit(GAME_EVENTS.BALL_UPDATE, { balls: result.state.balls });
      io.to(data.roomId).emit(GAME_EVENTS.TURN_UPDATE, { activePlayer: result.state.activePlayer });
      io.to(data.roomId).emit(GAME_EVENTS.SCORE_UPDATE, {
        hostGroup: result.state.hostGroup,
        guestGroup: result.state.guestGroup,
      });

      if (result.state.foulOccurred) {
        io.to(data.roomId).emit(GAME_EVENTS.FOUL, { reason: result.state.foulReason });
      }

      if (result.state.status === 'game-over') {
        io.to(data.roomId).emit(GAME_EVENTS.GAME_OVER, {
          winner: result.state.winner,
          reason: result.state.foulReason,
        });

        const winnerUserId = result.state.winner === 'host' ? match.getHostUserId() : match.getGuestUserId();

        // If it's a tournament match room, handle bracket updates
        if (data.roomId.toUpperCase().startsWith('TOURNAMENT_')) {
          handleTournamentMatchCompletion(data.roomId, winnerUserId, io);
        }

        // Trigger authoritative player rewards & achievements updates
        updatePlayerProgression(
          match.getHostUserId(),
          match.getGuestUserId(),
          result.state.winner,
          match.getAchievementDetails()
        ).then(({ hostUnlocked, guestUnlocked }) => {
          if (result.state.stats) {
            result.state.stats.host.unlockedAchievements = hostUnlocked;
            result.state.stats.guest.unlockedAchievements = guestUnlocked;
          }
          // Re-emit updated state snapshots
          io.to(data.roomId).compress(true).emit(GAME_EVENTS.GAME_STATE_UPDATE, result.state);
        });
      }

      // Keep GAME_STATE_UPDATE as full state fallback
      io.to(data.roomId).compress(true).emit(GAME_EVENTS.GAME_STATE_UPDATE, result.state);
    } catch (err: any) {
      socket.emit('game-error', { message: err.message || 'Shot execution failed' });
    }
  });

  // 3. END MATCH EVENT: Manually terminates match session
  socket.on(GAME_EVENTS.END_MATCH, (data: { roomId: string }) => {
    gameRoomManager.endMatch(data.roomId);
    io.to(data.roomId).emit(GAME_EVENTS.END_MATCH, { message: 'Match concluded' });
  });

  // 4. RECONNECT MATCH EVENT: Syncs rejoining clients and resumes play
  socket.on(GAME_EVENTS.RECONNECT_MATCH, (data: { roomId: string }) => {
    try {
      const match = gameRoomManager.getMatch(data.roomId);
      if (!match) {
        throw new Error('Active match session not found');
      }

      reconnectionManager.registerPlayer(userId, data.roomId, socket.id);
      socket.join(data.roomId);

      // Sync player with complete authoritative game snapshot
      socket.compress(true).emit(GAME_EVENTS.GAME_STATE_UPDATE, match.getState());

      // Notify room to resume gameplay timer
      io.to(data.roomId).emit(GAME_EVENTS.RESUME_MATCH, { userId, message: 'Opponent reconnected. Match resumed.' });
      io.to(data.roomId).emit(GAME_EVENTS.PLAYER_RECONNECTED, { userId, message: 'Player reconnected' });
    } catch (err: any) {
      socket.emit('game-error', { message: err.message || 'Reconnection sync failed' });
    }
  });

  // 5. DISCONNECT EVENT: Catches disconnections, triggers match pause
  socket.on('disconnect', () => {
    const roomId = reconnectionManager.getPlayerRoom(userId);
    if (roomId) {
      reconnectionManager.handleDisconnect(userId);
      // Broadcast pause warning to remaining opponent in room
      io.to(roomId).emit(GAME_EVENTS.PAUSE_MATCH, { userId, message: 'Opponent disconnected. Match paused.' });
      io.to(roomId).emit(GAME_EVENTS.PLAYER_DISCONNECTED, { userId, message: 'Player disconnected' });
    }
  });
};

export default registerGameHandlers;
