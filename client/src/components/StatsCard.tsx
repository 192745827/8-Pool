import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  colorClass?: string;
}

export const StatsCard: React.FC<StatsCardProps> = React.memo(({
  label,
  value,
  icon,
  description,
  colorClass = 'text-white',
}) => {
  return (
    <div className="stats-card-item opacity-0 p-5 bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col justify-between hover:border-pool-cyan/40 hover:shadow-pool-cyan/5 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">
          {label}
        </span>
        <div className="text-xl p-2 bg-white/5 border border-white/10 rounded-xl">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className={`text-2xl font-extrabold font-display tracking-tight ${colorClass}`}>
          {value}
        </div>
        {description && (
          <p className="text-[11px] text-slate-500 font-body mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});

export default StatsCard;
