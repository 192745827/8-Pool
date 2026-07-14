import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socket.types';
import { gameRoomManager } from './GameRoomManager';
import { reconnectionManager } from './ReconnectionManager';
import { GAME_EVENTS } from './GameEvents';

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

      const result = match.executeShot(userId, data.angle, data.power);
      if (result.error) {
        socket.emit('game-error', { message: result.error });
        return;
      }

      // Register player connection details for disconnections
      reconnectionManager.registerPlayer(userId, data.roomId, socket.id);

      // Emit granular updates to clients as specified in the architecture
      io.to(data.roomId).emit(GAME_EVENTS.BALL_UPDATE, { balls: result.state.balls });
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
      }

      // Keep GAME_STATE_UPDATE as full state fallback
      io.to(data.roomId).emit(GAME_EVENTS.GAME_STATE_UPDATE, result.state);
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
      socket.emit(GAME_EVENTS.GAME_STATE_UPDATE, match.getState());

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
