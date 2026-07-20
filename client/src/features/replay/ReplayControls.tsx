import React from 'react';

interface ReplayControlsProps {
  currentShot: number;
  totalShots: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentShot,
  totalShots,
  isPlaying,
  playbackSpeed,
  onPlayToggle,
  onSpeedChange,
  onStepForward,
  onStepBackward,
}) => {
  return (
    <div className="p-4 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto text-white">
      {/* Step Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStepBackward}
          disabled={currentShot <= 1}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-xl transition text-sm font-bold"
        >
          ⏮ Prev
        </button>

        <button
          onClick={onPlayToggle}
          className="px-5 py-2.5 bg-gradient-to-r from-pool-cyan to-teal-400 text-slate-950 font-black font-display text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentShot >= totalShots}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-xl transition text-sm font-bold"
        >
          Next ⏭
        </button>
      </div>

      {/* Shot Indicator Progress */}
      <div className="text-center font-display text-xs text-slate-300 font-extrabold tracking-wider">
        SHOT <span className="text-pool-cyan">{currentShot}</span> / {totalShots}
      </div>

      {/* Speed Multiplier */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 border border-white/10 rounded-xl">
        {[0.5, 1, 2, 4].map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-display transition ${
              playbackSpeed === speed
                ? 'bg-pool-cyan text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReplayControls;
