export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_CREATED: 'room-created',
  ROOM_UPDATED: 'room-updated',
  ROOM_ENDED: 'room-ended',
  ROOM_ERROR: 'room-error',
  PLAYER_READY: 'player-ready',
  PLAYER_NOT_READY: 'player-not-ready',
  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',
  START_GAME: 'start-game',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
