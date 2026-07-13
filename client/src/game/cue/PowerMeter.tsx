import React from 'react';

interface PowerMeterProps {
  power: number;
  visible: boolean;
}

export const PowerMeter: React.FC<PowerMeterProps> = ({ power, visible }) => {
  if (!visible || power === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 bg-slate-900/80 backdrop-blur border border-white/15 rounded-full overflow-hidden p-0.5 shadow-lg shadow-black/40 pointer-events-none select-none">
      <div 
        className="h-2 rounded-full bg-gradient-to-r from-pool-cyan via-pool-cyan to-rose-500 transition-all duration-75 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
        style={{ width: `${power}%` }}
      />
      <div className="text-[9px] font-black text-center text-slate-300 mt-1 uppercase tracking-widest">
        SHOT POWER: {Math.round(power)}%
      </div>
    </div>
  );
};

export default PowerMeter;
