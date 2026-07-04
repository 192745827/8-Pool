// Shared game constants for 8-ball pool

export const TABLE_WIDTH = 800;
export const TABLE_HEIGHT = 400;
export const CUSHION_WIDTH = 30; // Border thickness

export const BALL_RADIUS = 10;
export const BALL_DIAMETER = BALL_RADIUS * 2;

// Physics parameters
export const FRICTION = 0.99; // Velocity multiplier per frame
export const STOP_THRESHOLD = 0.05; // Speed below which ball is considered stopped
export const ELASTICITY = 0.97; // Ball-to-ball and ball-to-cushion elasticity (energy retention)

// Pockets definitions (relative to the active playing area, which is 0 to TABLE_WIDTH, 0 to TABLE_HEIGHT)
// Pocket radius is larger than ball radius to allow balls to drop in
export const POCKET_RADIUS = 20;
export const POCKETS = [
  { id: 'top-left', x: 0, y: 0 },
  { id: 'top-middle', x: TABLE_WIDTH / 2, y: -5 }, // slightly offset upwards for easier entry
  { id: 'top-right', x: TABLE_WIDTH, y: 0 },
  { id: 'bottom-left', x: 0, y: TABLE_HEIGHT },
  { id: 'bottom-middle', x: TABLE_WIDTH / 2, y: TABLE_HEIGHT + 5 }, // slightly offset downwards
  { id: 'bottom-right', x: TABLE_WIDTH, y: TABLE_HEIGHT }
];

// Initial layout configurations
export const D_LINE_X = TABLE_WIDTH * 0.25; // Cue ball line (the "kitchen" line)
export const APEX_X = TABLE_WIDTH * 0.70;   // Where the 8-ball rack starts
export const APEX_Y = TABLE_HEIGHT * 0.5;

// Game states
export const GAME_STATES = {
  LOBBY: 'LOBBY',
  MATCHMAKING: 'MATCHMAKING',
  AIMING: 'AIMING',
  SHOOTING: 'SHOOTING',
  SYNCING: 'SYNCING',
  GAME_OVER: 'GAME_OVER'
};

// Turn states
export const TURN_STATES = {
  PLAYER_1: 'PLAYER_1',
  PLAYER_2: 'PLAYER_2'
};

// Ball types
export const BALL_TYPES = {
  CUE: 'CUE',
  SOLID: 'SOLID',
  STRIPE: 'STRIPE',
  BLACK: 'BLACK'
};
