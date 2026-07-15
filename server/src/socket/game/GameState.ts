export interface BallState {
  id: number;
  x: number;
  y: number;
  z: number;
  isActive: boolean;
}

export type PlayerType = 'host' | 'guest';
export type BallGroup = 'solids' | 'stripes' | 'none';
export type MatchStatus = 'waiting' | 'break' | 'playing' | 'turn-end' | 'game-over';

export interface PlayerStats {
  shotsPlayed: number;
  successfulPots: number;
  accuracy: number;
  fouls: number;
  longestPot: number; // in meters
  unlockedAchievements: string[];
}

export interface MatchStats {
  gameDuration: number; // in seconds
  winner: PlayerType | null;
  host: PlayerStats;
  guest: PlayerStats;
}

export interface AuthoritativeGameState {
  roomId: string;
  activePlayer: PlayerType;
  hostGroup: BallGroup;
  guestGroup: BallGroup;
  status: MatchStatus;
  winner: PlayerType | null;
  isFirstShot: boolean;
  ballInHand: boolean;
  balls: BallState[];
  stats?: MatchStats;
  
  // Turn metrics gathered during simulation
  firstBallHit: number | null;
  pocketedBallsInTurn: number[];
  cushionHitsAfterContact: number;
  isCueBallScratched: boolean;
  foulOccurred: boolean;
  foulReason: string | null;
}

export const createInitialBalls = (): BallState[] => {
  // Spawns mirror the client configuration coordinates
  return [
    { id: 0, x: -2.5, y: 0.28, z: 0, isActive: true },
    { id: 1, x: 1.5, y: 0.28, z: 0, isActive: true },
    { id: 9, x: 1.812, y: 0.28, z: -0.18, isActive: true },
    { id: 2, x: 1.812, y: 0.28, z: 0.18, isActive: true },
    { id: 10, x: 2.124, y: 0.28, z: -0.36, isActive: true },
    { id: 8, x: 2.124, y: 0.28, z: 0, isActive: true },
    { id: 3, x: 2.124, y: 0.28, z: 0.36, isActive: true },
    { id: 11, x: 2.436, y: 0.28, z: -0.54, isActive: true },
    { id: 4, x: 2.436, y: 0.28, z: -0.18, isActive: true },
    { id: 12, x: 2.436, y: 0.28, z: 0.18, isActive: true },
    { id: 5, x: 2.436, y: 0.28, z: 0.54, isActive: true },
    { id: 7, x: 2.748, y: 0.28, z: -0.72, isActive: true },
    { id: 6, x: 2.748, y: 0.28, z: -0.36, isActive: true },
    { id: 14, x: 2.748, y: 0.28, z: 0, isActive: true },
    { id: 13, x: 2.748, y: 0.28, z: 0.36, isActive: true },
    { id: 15, x: 2.748, y: 0.28, z: 0.72, isActive: true },
  ];
};

export const createInitialGameState = (roomId: string): AuthoritativeGameState => {
  return {
    roomId,
    activePlayer: 'host',
    hostGroup: 'none',
    guestGroup: 'none',
    status: 'break',
    winner: null,
    isFirstShot: true,
    ballInHand: false,
    balls: createInitialBalls(),
    firstBallHit: null,
    pocketedBallsInTurn: [],
    cushionHitsAfterContact: 0,
    isCueBallScratched: false,
    foulOccurred: false,
    foulReason: null,
  };
};
