export type PlayerType = 'host' | 'guest';

export type BallGroup = 'solids' | 'stripes' | 'none';

export type MatchStatus = 'waiting' | 'break' | 'playing' | 'turn-end' | 'game-over';

export interface MatchState {
  activePlayer: PlayerType;
  hostGroup: BallGroup;
  guestGroup: BallGroup;
  status: MatchStatus;
  winner: PlayerType | null;
  isFirstShot: boolean;
  ballInHand: boolean;
  
  // Statistics gathered during a single shot simulation
  pocketedBallsInTurn: number[];
  firstBallHit: number | null;
  cushionHitsAfterContact: number;
  isCueBallScratched: boolean;
  foulOccurred: boolean;
  foulReason: string | null;
}

export const INITIAL_MATCH_STATE: MatchState = {
  activePlayer: 'host',
  hostGroup: 'none',
  guestGroup: 'none',
  status: 'waiting',
  winner: null,
  isFirstShot: true,
  ballInHand: false,
  pocketedBallsInTurn: [],
  firstBallHit: null,
  cushionHitsAfterContact: 0,
  isCueBallScratched: false,
  foulOccurred: false,
  foulReason: null,
};
