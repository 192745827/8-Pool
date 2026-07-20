import React from 'react';
import { getRankDetails } from '../utils/rankUtils';

interface RankPromotionModalProps {
  isOpen: boolean;
  newRankName: string;
  onClose: () => void;
}

export const RankPromotionModal: React.FC<RankPromotionModalProps> = ({
  isOpen,
  newRankName,
  onClose,
}) => {
  if (!isOpen) return null;

  // Dummy ELO for details lookup based on rank name
  const dummyElo =
    newRankName === 'Bronze' ? 900 :
    newRankName === 'Silver' ? 1200 :
    newRankName === 'Gold' ? 1400 :
    newRankName === 'Platinum' ? 1600 :
    newRankName === 'Diamond' ? 1800 : 2000;

  const tier = getRankDetails(dummyElo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-amber-500/40 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.2)] text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_15px_#f59e0b]" />

        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border-2 border-amber-400 flex items-center justify-center text-5xl mb-4 animate-bounce">
          {tier.icon}
        </div>

        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
          RANK PROMOTION!
        </span>

        <h2 className="text-2xl font-black text-white tracking-wide mt-3 uppercase">
          PROMOTED TO {tier.name.toUpperCase()} TIER!
        </h2>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {tier.description}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
        >
          CLAIM RANK BADGE 🏆
        </button>
      </div>
    </div>
  );
};

export default RankPromotionModal;
