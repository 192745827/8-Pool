// Shared constants and type definitions for the Multiplayer 8-Ball Pool Game

export const TABLE_CONFIG = {
  WIDTH: 800,
  HEIGHT: 400,
  BALL_RADIUS: 10,
  POCKET_RADIUS: 20
};

export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  score: number;
}

export interface GameRoom {
  id: string;
  players: Player[];
  status: 'lobby' | 'playing' | 'ended';
  activePlayerId?: string;
}
