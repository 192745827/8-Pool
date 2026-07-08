import React from 'react';

interface BallProps {
  number: number;
  color: string;
}

export const Ball: React.FC<BallProps> = ({ number, color }) => {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-white/5 rounded-lg">
      <span className="text-[10px]" style={{ color }}>●</span>
      <span className="text-[9px] font-bold text-slate-300 font-display">Ball #{number}</span>
    </div>
  );
};

export default Ball;
