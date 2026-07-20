export interface RankTierInfo {
  name: string;
  minElo: number;
  maxElo: number;
  icon: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description: string;
}

export const RANK_TIERS: RankTierInfo[] = [
  {
    name: 'Bronze',
    minElo: 0,
    maxElo: 1099,
    icon: '🥉',
    bgGradient: 'from-amber-700 to-amber-900',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-700/20 text-amber-300 border-amber-600/40',
    description: 'Entry-level competitive tier. Learn table angles and cue ball positioning.',
  },
  {
    name: 'Silver',
    minElo: 1100,
    maxElo: 1299,
    icon: '🥈',
    bgGradient: 'from-slate-400 to-slate-600',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-200',
    badgeBg: 'bg-slate-400/20 text-slate-200 border-slate-300/40',
    description: 'Developing competitor. Consistent shot execution and basic bank shots.',
  },
  {
    name: 'Gold',
    minElo: 1300,
    maxElo: 1499,
    icon: '🥇',
    bgGradient: 'from-amber-400 to-yellow-600',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    description: 'Skilled pool player. Strategic spin control, combo shots, and solid safety play.',
  },
  {
    name: 'Platinum',
    minElo: 1500,
    maxElo: 1699,
    icon: '💠',
    bgGradient: 'from-cyan-400 to-teal-600',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    description: 'Expert competitor. High accuracy, advanced spin management, and pocket clearing.',
  },
  {
    name: 'Diamond',
    minElo: 1700,
    maxElo: 1899,
    icon: '💎',
    bgGradient: 'from-purple-400 to-indigo-600',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    description: 'Master tactician. Flawless rack runs, high combo execution, and minimal fouls.',
  },
  {
    name: 'Master',
    minElo: 1900,
    maxElo: 9999,
    icon: '👑',
    bgGradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-400',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    description: 'Pinnacle of pool mastery. Top ranked global legends on the leaderboard.',
  },
];

export const getRankDetails = (elo: number = 1200): RankTierInfo => {
  const found = RANK_TIERS.find((tier) => elo >= tier.minElo && elo <= tier.maxElo);
  return found || RANK_TIERS[1]; // default to Silver if missing
};

export const getRankProgress = (elo: number = 1200): number => {
  const currentTier = getRankDetails(elo);
  if (currentTier.name === 'Master') return 100;

  const totalRange = currentTier.maxElo - currentTier.minElo + 1;
  const currentGain = elo - currentTier.minElo;
  return Math.min(Math.max(Math.round((currentGain / totalRange) * 100), 0), 100);
};

export const getNextRankTier = (elo: number = 1200): { nextTier: RankTierInfo | null; pointsNeeded: number } => {
  const currentIdx = RANK_TIERS.findIndex((t) => elo >= t.minElo && elo <= t.maxElo);
  if (currentIdx === -1 || currentIdx >= RANK_TIERS.length - 1) {
    return { nextTier: null, pointsNeeded: 0 };
  }

  const nextTier = RANK_TIERS[currentIdx + 1];
  const pointsNeeded = nextTier.minElo - elo;
  return { nextTier, pointsNeeded };
};
