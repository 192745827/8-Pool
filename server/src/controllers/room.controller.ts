import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as roomService from '../services/room.service';
import { roomReadyStates } from '../socket/room.socket';

/**
 * Controller to handle room creation.
 * Route: POST /api/rooms/create
 */
export const createRoomController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized, player identity missing' });
      return;
    }

    const { isPrivate } = req.body;
    const room = await roomService.createRoom(req.user.id, !!isPrivate);

    // Initialize mock ready states on return
    const roomPayload = {
      ...room.toJSON(),
      hostReady: false,
      guestReady: false,
    };

    res.status(201).json(roomPayload);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create room' });
  }
};

/**
 * Controller to handle joining a room.
 * Route: POST /api/rooms/join
 */
export const joinRoomController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized, player identity missing' });
      return;
    }

    const { roomId } = req.body;
    if (!roomId || typeof roomId !== 'string') {
      res.status(400).json({ error: 'Room ID code is required to join.' });
      return;
    }

    const room = await roomService.joinRoom(roomId, req.user.id);
    
    // Merge in-memory ready status
    const normalizedCode = roomId.trim().toUpperCase();
    const readyState = roomReadyStates.get(normalizedCode) || { hostReady: false, guestReady: false };
    const roomPayload = {
      ...room.toJSON(),
      hostReady: readyState.hostReady,
      guestReady: readyState.guestReady,
    };

    res.status(200).json(roomPayload);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to join room' });
  }
};

/**
 * Controller to handle leaving a room.
 * Route: POST /api/rooms/leave
 */
export const leaveRoomController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized, player identity missing' });
      return;
    }

    const { roomId } = req.body;
    if (!roomId || typeof roomId !== 'string') {
      res.status(400).json({ error: 'Room ID is required to leave.' });
      return;
    }

    const updatedRoom = await roomService.leaveRoom(roomId, req.user.id);
    
    let roomPayload = null;
    if (updatedRoom) {
      const normalizedCode = roomId.trim().toUpperCase();
      const readyState = roomReadyStates.get(normalizedCode) || { hostReady: false, guestReady: false };
      roomPayload = {
        ...updatedRoom.toJSON(),
        hostReady: readyState.hostReady,
        guestReady: readyState.guestReady,
      };
    }

    res.status(200).json({ message: 'Successfully left the room', room: roomPayload });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to leave room' });
  }
};

/**
 * Controller to retrieve all public lobby rooms.
 * Route: GET /api/rooms
 */
export const getRoomsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await roomService.getPublicLobbyRooms();
    
    // Merge in-memory ready states for the lobby list search response
    const roomsPayload = rooms.map(room => {
      const readyState = roomReadyStates.get(room.roomId.trim().toUpperCase()) || { hostReady: false, guestReady: false };
      return {
        ...room.toJSON(),
        hostReady: readyState.hostReady,
        guestReady: readyState.guestReady,
      };
    });

    res.status(200).json(roomsPayload);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch rooms' });
  }
};

/**
 * Controller to fetch details of a single room.
 * Route: GET /api/rooms/:roomId
 */
export const getRoomDetailsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      res.status(400).json({ error: 'Room ID parameter is required' });
      return;
    }

    const room = await roomService.getRoomDetails(roomId);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Merge in-memory ready states for this specific room
    const normalizedCode = roomId.trim().toUpperCase();
    const readyState = roomReadyStates.get(normalizedCode) || { hostReady: false, guestReady: false };
    const roomPayload = {
      ...room.toJSON(),
      hostReady: readyState.hostReady,
      guestReady: readyState.guestReady,
    };

    res.status(200).json(roomPayload);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to fetch room details' });
  }
};
