import React from 'react';

interface MobileControlsOverlayProps {
  aimAngle: number;
  onAngleChange: (newAngle: number) => void;
  power: number;
  onPowerChange: (newPower: number) => void;
  onShoot: () => void;
  disabled?: boolean;
}

export const MobileControlsOverlay: React.FC<MobileControlsOverlayProps> = ({
  aimAngle,
  onAngleChange,
  power,
  onPowerChange,
  onShoot,
  disabled = false,
}) => {
  if (disabled) return null;

  const handleFineAim = (delta: number) => {
    onAngleChange(aimAngle + delta);
  };

  const presets = [
    { label: '25%', val: 25 },
    { label: '50%', val: 50 },
    { label: '75%', val: 75 },
    { label: 'MAX', val: 100 },
  ];

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 max-w-md mx-auto p-3 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col gap-2.5">
      {/* Top Row: Fine Aim Adjust & Power Presets */}
      <div className="flex items-center justify-between gap-2">
        {/* Fine Aim Micro Adjust */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1.5">AIM</span>
          <button
            onClick={() => handleFineAim(-0.015)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-cyan-400 font-extrabold text-xs rounded-xl transition-all"
          >
            ◀ -0.01
          </button>
          <button
            onClick={() => handleFineAim(0.015)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-cyan-400 font-extrabold text-xs rounded-xl transition-all"
          >
            +0.01 ▶
          </button>
        </div>

        {/* Power Presets */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
          {presets.map((p) => (
            <button
              key={p.val}
              onClick={() => onPowerChange(p.val)}
              className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${
                Math.abs(power - p.val) < 5
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Shoot Action Button */}
      <button
        onClick={onShoot}
        disabled={power <= 0}
        className={`w-full py-3 font-display font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${
          power > 0
            ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-black shadow-cyan-500/25 active:scale-95'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
        }`}
      >
        <span>🚀</span>
        <span>{power > 0 ? `EXECUTE SHOT (${power}%)` : 'SET POWER SLIDER FIRST'}</span>
      </button>
    </div>
  );
};

export default MobileControlsOverlay;
