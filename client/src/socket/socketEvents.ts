export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Room Events
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

  // Match Events
  START_MATCH: 'start-match',
  END_MATCH: 'end-match',
  PAUSE_MATCH: 'pause-match',
  RESUME_MATCH: 'resume-match',

  // Gameplay Events
  AIM: 'aim',
  SHOOT: 'shoot',
  BALL_UPDATE: 'ball-update',
  TURN_UPDATE: 'turn-update',
  SCORE_UPDATE: 'score-update',
  FOUL: 'foul',
  GAME_OVER: 'game-over',

  // System Reconnection Hook
  RECONNECT_MATCH: 'reconnect-match',
  GAME_STATE_UPDATE: 'game-state-update',
  PLAYER_DISCONNECTED: 'player-disconnected',
  PLAYER_RECONNECTED: 'player-reconnected',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
