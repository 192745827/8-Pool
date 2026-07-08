// Shared constants and type definitions for the Multiplayer 8-Ball Pool Game

export const TABLE_CONFIG = {
  WIDTH: 800,
  HEIGHT: 400,
  BALL_RADIUS: 10,
  POCKET_RADIUS: 20
};

export interface SharedUser {
  _id: string;
  username: string;
  email?: string;
  avatar: string;
  coins: number;
  xp: number;
  wins: number;
  losses: number;
  rank: string;
}

export interface GameRoom {
  _id?: string;
  roomId: string;
  host: SharedUser | string;
  guest?: SharedUser | string | null;
  hostReady: boolean;
  guestReady: boolean;
  status: 'lobby' | 'playing' | 'ended';
  isPrivate: boolean;
  maxPlayers: number;
  createdAt?: string | Date;
}

export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  score: number;
}
