import React from 'react';

export interface ShopCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  isOwned?: boolean;
  isEquipped?: boolean;
  onBuy?: (id: string) => void;
  onEquip?: (id: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({
  id,
  name,
  category,
  price,
  icon,
  rarity,
  isOwned = false,
  isEquipped = false,
  onBuy,
  onEquip,
}) => {
  const rarityColors = {
    Common: 'bg-slate-800 text-slate-300 border-slate-700',
    Rare: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Epic: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Legendary: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse',
  };

  return (
    <div className="p-5 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl hover:border-pool-cyan/40 transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border rounded-full ${rarityColors[rarity]}`}>
            {rarity}
          </span>
          <span className="text-[10px] text-slate-500 font-display font-bold uppercase">
            {category}
          </span>
        </div>

        <div className="text-4xl my-4 text-center select-none transform hover:scale-110 transition duration-300">
          {icon}
        </div>

        <h4 className="text-base font-extrabold font-display text-white text-center tracking-wide">
          {name}
        </h4>
      </div>

      <div className="mt-5 pt-3 border-t border-white/5">
        {isEquipped ? (
          <button
            disabled
            className="w-full py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black font-display text-xs uppercase tracking-widest rounded-xl"
          >
            ✓ EQUIPPED
          </button>
        ) : isOwned ? (
          <button
            onClick={() => onEquip && onEquip(id)}
            className="w-full py-2 bg-pool-cyan/20 border border-pool-cyan/40 hover:bg-pool-cyan/30 text-pool-cyan font-black font-display text-xs uppercase tracking-widest rounded-xl transition"
          >
            EQUIP ITEM
          </button>
        ) : (
          <button
            onClick={() => onBuy && onBuy(id)}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-display text-xs uppercase tracking-widest rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
          >
            <span>🪙 {price.toLocaleString()}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopCard;
