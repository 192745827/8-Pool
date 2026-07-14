export const GAME_EVENTS = {
  // Room Events
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',

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

export type GameEvent = typeof GAME_EVENTS[keyof typeof GAME_EVENTS];
export default GAME_EVENTS;
