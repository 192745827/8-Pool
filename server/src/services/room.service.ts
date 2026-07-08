import { Room, IRoom } from '../models/Room';
import { User } from '../models/User';

/**
 * Generates a random 6-character uppercase alphanumeric room code.
 */
const generateUniqueRoomCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  
  while (attempts < 100) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness in database
    const existing = await Room.findOne({ roomId: code });
    if (!existing) {
      return code;
    }
    attempts++;
  }
  
  throw new Error('Failed to generate a unique room code.');
};

/**
 * Creates a new game room.
 * @param hostId The user ID of the host player.
 * @param isPrivate Whether the room is private (hidden from public list).
 */
export const createRoom = async (hostId: string, isPrivate: boolean): Promise<IRoom> => {
  // Check if host user exists
  const hostUser = await User.findById(hostId);
  if (!hostUser) {
    throw new Error('Host user not found.');
  }

  // Create unique room code
  const roomId = await generateUniqueRoomCode();

  const newRoom = new Room({
    roomId,
    host: hostId,
    isPrivate,
    status: 'lobby',
    guest: null,
  });

  await newRoom.save();

  // Populate host info
  const populatedRoom = await Room.findById(newRoom._id)
    .populate('host', 'username avatar coins xp wins losses rank')
    .populate('guest', 'username avatar coins xp wins losses rank');

  if (!populatedRoom) {
    throw new Error('Failed to retrieve newly created room.');
  }

  return populatedRoom;
};

/**
 * Joins an existing game room.
 * @param roomId The 6-digit room code to join.
 * @param guestId The user ID of the guest player joining.
 */
export const joinRoom = async (roomId: string, guestId: string): Promise<IRoom> => {
  const normalizedRoomId = roomId.trim().toUpperCase();

  // Find the room
  const room = await Room.findOne({ roomId: normalizedRoomId });
  if (!room) {
    throw new Error('Room not found.');
  }

  // Check room status
  if (room.status !== 'lobby') {
    throw new Error('Game has already started or ended in this room.');
  }

  // Check if host is attempting to join as guest
  if (room.host.toString() === guestId) {
    // If they are the host, allow them to re-enter without error
    const populatedRoom = await Room.findById(room._id)
      .populate('host', 'username avatar coins xp wins losses rank')
      .populate('guest', 'username avatar coins xp wins losses rank');
    return populatedRoom!;
  }

  // Check if room is full
  if (room.guest) {
    // If the guest joining is already in the room, just return it
    if (room.guest.toString() === guestId) {
      const populatedRoom = await Room.findById(room._id)
        .populate('host', 'username avatar coins xp wins losses rank')
        .populate('guest', 'username avatar coins xp wins losses rank');
      return populatedRoom!;
    }
    throw new Error('Room is full.');
  }

  // Add the player as guest
  room.guest = guestId as any;
  await room.save();

  // Return populated room
  const populatedRoom = await Room.findById(room._id)
    .populate('host', 'username avatar coins xp wins losses rank')
    .populate('guest', 'username avatar coins xp wins losses rank');

  if (!populatedRoom) {
    throw new Error('Room joined but failed to populate metadata.');
  }

  return populatedRoom;
};

/**
 * Leaves a game room.
 * @param roomId The 6-digit room code to leave.
 * @param userId The user ID of the player leaving.
 */
export const leaveRoom = async (roomId: string, userId: string): Promise<IRoom | null> => {
  const room = await Room.findOne({ roomId: roomId.trim().toUpperCase() });
  if (!room) {
    throw new Error('Room not found.');
  }

  // If host leaves, we can close/end the room
  if (room.host.toString() === userId) {
    room.status = 'ended';
    await room.save();
    return room;
  }

  // If guest leaves, clear the guest slot
  if (room.guest && room.guest.toString() === userId) {
    room.guest = null;
    await room.save();
  }

  const populatedRoom = await Room.findById(room._id)
    .populate('host', 'username avatar coins xp wins losses rank')
    .populate('guest', 'username avatar coins xp wins losses rank');

  return populatedRoom;
};

/**
 * Returns all active, public lobby rooms (not private, not full, status is lobby).
 */
export const getPublicLobbyRooms = async (): Promise<IRoom[]> => {
  return Room.find({
    isPrivate: false,
    status: 'lobby',
    guest: null,
  })
    .populate('host', 'username avatar coins xp wins losses rank')
    .sort({ createdAt: -1 });
};

/**
 * Fetches specific details of a single room by its code.
 * @param roomId 6-digit room code.
 */
export const getRoomDetails = async (roomId: string): Promise<IRoom> => {
  const room = await Room.findOne({ roomId: roomId.trim().toUpperCase() })
    .populate('host', 'username avatar coins xp wins losses rank')
    .populate('guest', 'username avatar coins xp wins losses rank');

  if (!room) {
    throw new Error('Room not found.');
  }

  return room;
};
