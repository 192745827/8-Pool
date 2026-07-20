import React, { useEffect, useState } from 'react';

export const LandscapePrompt: React.FC = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobileWidth = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobileWidth && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortraitMobile || dismissed) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm p-3 bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-black rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in duration-300 border border-amber-300/40">
      <div className="flex items-center gap-2.5">
        <span className="text-xl animate-bounce">📱</span>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider">Rotate for Best View</h4>
          <p className="text-[10px] font-bold opacity-90">
            Landscape mode gives full 3D table visibility!
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/30 text-black font-black text-xs flex items-center justify-center shrink-0 transition-all"
      >
        ✕
      </button>
    </div>
  );
};

export default LandscapePrompt;
