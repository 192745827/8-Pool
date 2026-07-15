import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

interface GameLoaderProps {
  onEnter: () => void;
}

export const GameLoader: React.FC<GameLoaderProps> = ({ onEnter }) => {
  const { active, progress, item } = useProgress();
  const [fadeAway, setFadeAway] = useState(false);

  const isReady = progress >= 100 || !active;

  const handleEnterClick = () => {
    setFadeAway(true);
    // Smooth transition delay before calling onEnter to clear the screen
    setTimeout(() => {
      onEnter();
    }, 500);
  };

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md transition-all duration-500 ease-out select-none ${
        fadeAway ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background visual neon cues */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-pool-cyan/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-pool-purple/10 blur-[80px] pointer-events-none" />

      <div className="max-w-md w-full px-6 flex flex-col items-center text-center space-y-8 relative z-10">
        {/* Animated Custom 3D-Like Pulsing Pool Ball Loader */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Inner shadow/ring visual effects */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-slate-900 to-black border-2 border-white/10 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-black/60 flex items-center justify-center border border-white/5">
            <span className="text-3xl animate-bounce">🎱</span>
          </div>
          {/* Outer glowing orbit rings */}
          <div className="absolute -inset-1 rounded-full border border-pool-cyan/30 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute -inset-2 rounded-full border border-dashed border-pool-purple/20 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Status Texts */}
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pool-cyan to-pool-purple uppercase">
            {isReady ? 'MATCH ENVIRONMENT READY' : 'PREPARING 3D ENVIRONMENT'}
          </h3>
          <p className="text-xs text-slate-400 font-body max-w-xs mx-auto truncate h-4">
            {!isReady ? (item ? `Loading: ${item}` : 'Initializing shaders & textures...') : 'Ready to enter game'}
          </p>
        </div>

        {/* Progress Bar & Buttons Area */}
        <div className="w-full">
          {!isReady ? (
            <div className="space-y-2">
              {/* Progress track */}
              <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pool-cyan to-pool-purple transition-all duration-300 ease-out shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  style={{ width: `${Math.round(progress)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-slate-400 font-display">
                <span>ASSETS LOADING</span>
                <span className="text-pool-cyan">{Math.round(progress)}%</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEnterClick}
              className="w-full py-3.5 px-8 bg-gradient-to-r from-pool-cyan to-pool-purple hover:brightness-110 active:scale-95 text-slate-950 font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.45)] transition duration-300 transform cursor-pointer"
            >
              ENTER GAME 🎮
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLoader;
