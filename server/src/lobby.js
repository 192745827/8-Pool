import { GameSession } from './gameSession.js';

// In-memory data store for players and games
export const players = new Map(); // socket.id -> player state
export const games = new Map();   // roomId -> GameSession

let matchmakingQueue = [];

// Broadcast online count to all players in the lobby
function broadcastOnlineCount(io) {
  const onlineCount = players.size;
  io.emit('online-stats', { onlineCount, activeRooms: games.size });
}

export function handleConnection(io, socket) {
  console.log(`Socket connected: ${socket.id}`);
  
  // Register player in system
  players.set(socket.id, {
    id: socket.id,
    name: 'Anonymous Player',
    status: 'lobby', // 'lobby', 'searching', 'playing'
    roomId: null,
    socket: socket
  });
  
  broadcastOnlineCount(io);

  // 1. Join Lobby (Set Username)
  socket.on('join-lobby', (data) => {
    const player = players.get(socket.id);
    if (player) {
      player.name = data.username ? data.username.trim().substring(0, 15) : 'Guest Pooler';
      console.log(`Player ${socket.id} set username to: ${player.name}`);
      socket.emit('lobby-joined', { name: player.name });
    }
  });

  // 2. Start Matchmaking
  socket.on('find-match', () => {
    const player = players.get(socket.id);
    if (!player || player.status !== 'lobby') return;

    player.status = 'searching';
    matchmakingQueue.push(socket.id);
    console.log(`Player ${player.name} (${socket.id}) entered matchmaking queue`);

    socket.emit('matchmaking-started');

    // Attempt to match players
    checkAndMatchPlayers(io);
  });

  // 3. Cancel Matchmaking
  socket.on('cancel-matchmaking', () => {
    const player = players.get(socket.id);
    if (!player || player.status !== 'searching') return;

    player.status = 'lobby';
    matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id);
    console.log(`Player ${player.name} (${socket.id}) cancelled matchmaking`);

    socket.emit('matchmaking-cancelled');
  });

  // 4. Player shoots (cue angle and power)
  socket.on('shoot', (data) => {
    const player = players.get(socket.id);
    if (!player || player.status !== 'playing' || !player.roomId) return;

    const game = games.get(player.roomId);
    if (!game) return;

    // Validate that it's this player's turn to shoot
    if (!game.isPlayerTurn(socket.id)) {
      socket.emit('error-msg', { message: 'Not your turn!' });
      return;
    }

    console.log(`Shot made by ${player.name} in room ${player.roomId}: angle=${data.angle}, power=${data.power}`);
    
    // Sync cue ball start position if provided (essential for ball-in-hand placement)
    if (data.cueBall) {
      const cueBall = game.balls.find(b => b.id === 0);
      if (cueBall) {
        cueBall.x = data.cueBall.x;
        cueBall.y = data.cueBall.y;
      }
    }

    // Broadcast the shot parameters to the other player in the room
    socket.to(player.roomId).emit('opponent-shot', {
      angle: data.angle,
      power: data.power,
      cueBall: data.cueBall
    });

    game.registerShot();
  });

  // 5. Client reports final stationary state
  socket.on('sync-turn-result', (data) => {
    const player = players.get(socket.id);
    if (!player || player.status !== 'playing' || !player.roomId) return;

    const game = games.get(player.roomId);
    if (!game) return;

    // We verify the turn result.
    // The player details are updated on the server.
    const result = game.resolveTurnResult(socket.id, data.balls, data.pocketedThisTurn);
    
    // Broadcast the updated state to both players
    io.to(player.roomId).emit('game-state-update', result);
  });

  // 6. Leave Game (Forfeit)
  socket.on('leave-game', () => {
    handleForfeit(io, socket);
  });

  // 7. Disconnect
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    // Remove from matchmaking queue if present
    matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id);

    // If player was in a game, forfeit the game
    const player = players.get(socket.id);
    if (player && player.status === 'playing' && player.roomId) {
      handleForfeit(io, socket);
    }

    players.delete(socket.id);
    broadcastOnlineCount(io);
  });
}

// Check matchmaking queue and pair players
function checkAndMatchPlayers(io) {
  // Clean up queue of stale sockets just in case
  matchmakingQueue = matchmakingQueue.filter(id => {
    const p = players.get(id);
    return p && p.status === 'searching';
  });

  if (matchmakingQueue.length < 2) return;

  const player1Id = matchmakingQueue.shift();
  const player2Id = matchmakingQueue.shift();

  const p1 = players.get(player1Id);
  const p2 = players.get(player2Id);

  if (!p1 || !p2) {
    // Put remaining active player back in queue
    if (p1 && p1.status === 'searching') matchmakingQueue.unshift(player1Id);
    if (p2 && p2.status === 'searching') matchmakingQueue.unshift(player2Id);
    return;
  }

  // Create room
  const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  p1.status = 'playing';
  p1.roomId = roomId;
  p2.status = 'playing';
  p2.roomId = roomId;

  // Sockets join room
  p1.socket.join(roomId);
  p2.socket.join(roomId);

  // Initialize Game Session
  const game = new GameSession(roomId, p1, p2);
  games.set(roomId, game);

  console.log(`Match created in room ${roomId} between ${p1.name} and ${p2.name}`);

  // Notify players
  io.to(roomId).emit('match-found', {
    roomId: roomId,
    players: {
      player1: { id: p1.id, name: p1.name },
      player2: { id: p2.id, name: p2.name }
    },
    gameState: game.getState()
  });

  broadcastOnlineCount(io);
}

// Handle client forfeit or disconnection during a match
function handleForfeit(io, socket) {
  const player = players.get(socket.id);
  if (!player || !player.roomId) return;

  const roomId = player.roomId;
  const game = games.get(roomId);
  if (!game) return;

  const opponentId = game.getOpponentId(socket.id);
  const opponent = players.get(opponentId);

  console.log(`Player ${player.name} left/forfeited game in room ${roomId}`);

  // Notify opponent that they won by forfeit
  io.to(roomId).emit('opponent-left', {
    winnerId: opponentId,
    reason: `${player.name} has left the match.`
  });

  // Reset opponent player status
  if (opponent) {
    opponent.status = 'lobby';
    opponent.roomId = null;
    opponent.socket.leave(roomId);
  }

  // Reset forfeiting player status (if still connected)
  player.status = 'lobby';
  player.roomId = null;
  socket.leave(roomId);

  // Clean up room
  games.delete(roomId);
  broadcastOnlineCount(io);
}
