import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import * as roomService from '../services/room.service';
import { Room } from '../models/Room';
import { gameRoomManager, GAME_EVENTS } from './game';

// Shared ready states Map to handle transient status in-memory (not persisted in DB)
export const roomReadyStates = new Map<string, { hostReady: boolean; guestReady: boolean }>();

/**
 * Retrieves or initializes the ready status entry for a room ID in-memory.
 */
export const getRoomReadyState = (roomId: string) => {
  const normalizedCode = roomId.trim().toUpperCase();
  if (!roomReadyStates.has(normalizedCode)) {
    roomReadyStates.set(normalizedCode, { hostReady: false, guestReady: false });
  }
  return roomReadyStates.get(normalizedCode)!;
};

/**
 * Helper to append the in-memory ready flags onto the room payload before broadcasting.
 */
export const serializeRoomWithReadyState = (roomDocument: any) => {
  if (!roomDocument) return null;
  const plainRoom = typeof roomDocument.toJSON === 'function' ? roomDocument.toJSON() : roomDocument;
  const readyState = getRoomReadyState(plainRoom.roomId);

  return {
    ...plainRoom,
    hostReady: readyState.hostReady,
    guestReady: readyState.guestReady,
  };
};

export const registerRoomHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  const userId = socket.user?.id;

  if (!userId) return;

  // 1. CREATE ROOM EVENT
  socket.on('create-room', async (data: { isPrivate: boolean }) => {
    try {
      const room = await roomService.createRoom(userId, !!data.isPrivate);
      
      // Initialize in-memory ready state
      roomReadyStates.set(room.roomId.trim().toUpperCase(), { hostReady: false, guestReady: false });

      // Join the socket channel
      socket.join(room.roomId);
      
      // Reply to host with ready states appended
      socket.compress(true).emit('room-created', serializeRoomWithReadyState(room));
    } catch (err: any) {
      socket.emit('room-error', { message: err.message || 'Failed to create room via socket' });
    }
  });

  // 2. JOIN ROOM EVENT
  socket.on('join-room', async (data: { roomId: string; asSpectator?: boolean }) => {
    try {
      const room = await roomService.joinRoom(data.roomId, userId, !!data.asSpectator);
      
      // Join socket channel
      socket.join(room.roomId);
      
      // Broadcast updated room status to all players and spectators in the room channel
      io.to(room.roomId).compress(true).emit('room-updated', serializeRoomWithReadyState(room));
    } catch (err: any) {
      socket.emit('room-error', { message: err.message || 'Failed to join room via socket' });
    }
  });

  // 3. LEAVE ROOM EVENT
  socket.on('leave-room', async (data: { roomId: string }) => {
    try {
      const updatedRoom = await roomService.leaveRoom(data.roomId, userId);
      
      socket.leave(data.roomId);

      if (updatedRoom && updatedRoom.status === 'ended') {
        roomReadyStates.delete(data.roomId.trim().toUpperCase());
        io.to(data.roomId).emit('room-ended', { message: 'The host has ended this room session.' });
      } else if (updatedRoom) {
        // Reset opponent ready state in-memory since guest left
        const readyState = getRoomReadyState(data.roomId);
        readyState.guestReady = false;

        io.to(data.roomId).compress(true).emit('room-updated', serializeRoomWithReadyState(updatedRoom));
      }
    } catch (err: any) {
      socket.emit('room-error', { message: err.message || 'Failed to leave room' });
    }
  });

  // 4. PLAYER READY EVENT
  socket.on('player-ready', async (data: { roomId: string }) => {
    try {
      const room = await Room.findOne({ roomId: data.roomId.trim().toUpperCase() });
      if (!room) {
        throw new Error('Room not found');
      }

      const readyState = getRoomReadyState(room.roomId);

      if (room.host.toString() === userId) {
        readyState.hostReady = true;
      } else if (room.guest && room.guest.toString() === userId) {
        readyState.guestReady = true;
      } else {
        throw new Error('You do not belong to this room');
      }

      // Check if both ready -> transition game start
      if (readyState.hostReady && readyState.guestReady) {
        room.status = 'playing';
        await room.save();
      }

      const populatedRoom = await Room.findById(room._id)
        .populate('host', 'username avatar coins xp wins losses rank')
        .populate('guest', 'username avatar coins xp wins losses rank');

      const roomPayload = serializeRoomWithReadyState(populatedRoom);

      // Sync ready updates with the room
      io.to(room.roomId).compress(true).emit('room-updated', roomPayload);

      // Auto start game trigger
      if (readyState.hostReady && readyState.guestReady) {
        // Initialize authoritative server-side match session
        const hostId = room.host._id ? room.host._id.toString() : room.host.toString();
        const guestId = room.guest && room.guest._id ? room.guest._id.toString() : (room.guest ? room.guest.toString() : '');
        gameRoomManager.createMatch(room.roomId, hostId, guestId);

        // Clean ready states from map since game started
        roomReadyStates.delete(room.roomId.trim().toUpperCase());
        io.to(room.roomId).compress(true).emit('start-game', roomPayload);
        io.to(room.roomId).emit(GAME_EVENTS.START_MATCH, {
          roomId: room.roomId,
          matchState: gameRoomManager.getMatch(room.roomId)?.getState(),
        });
      }
    } catch (err: any) {
      socket.emit('room-error', { message: err.message || 'Failed to update ready state' });
    }
  });

  // 5. PLAYER NOT READY EVENT
  socket.on('player-not-ready', async (data: { roomId: string }) => {
    try {
      const room = await Room.findOne({ roomId: data.roomId.trim().toUpperCase() });
      if (!room) {
        throw new Error('Room not found');
      }

      const readyState = getRoomReadyState(room.roomId);

      if (room.host.toString() === userId) {
        readyState.hostReady = false;
      } else if (room.guest && room.guest.toString() === userId) {
        readyState.guestReady = false;
      } else {
        throw new Error('You do not belong to this room');
      }

      const populatedRoom = await Room.findById(room._id)
        .populate('host', 'username avatar coins xp wins losses rank')
        .populate('guest', 'username avatar coins xp wins losses rank');

      io.to(room.roomId).compress(true).emit('room-updated', serializeRoomWithReadyState(populatedRoom));
    } catch (err: any) {
      socket.emit('room-error', { message: err.message || 'Failed to update ready state' });
    }
  });

  // 6. CLEAN UP DISCONNECTED USERS
  socket.on('disconnect', async () => {
    try {
      const activeRoom = await Room.findOne({
        status: 'lobby',
        $or: [{ host: userId }, { guest: userId }]
      });

      if (activeRoom) {
        const updatedRoom = await roomService.leaveRoom(activeRoom.roomId, userId);
        if (activeRoom.host.toString() === userId) {
          roomReadyStates.delete(activeRoom.roomId.trim().toUpperCase());
          io.to(activeRoom.roomId).emit('room-ended', { message: 'Host disconnected' });
        } else if (updatedRoom) {
          const readyState = getRoomReadyState(activeRoom.roomId);
          readyState.guestReady = false;
          io.to(activeRoom.roomId).compress(true).emit('room-updated', serializeRoomWithReadyState(updatedRoom));
        }
      }
    } catch (err) {
      console.error('Error cleaning up disconnected player:', err);
    }
  });
};
