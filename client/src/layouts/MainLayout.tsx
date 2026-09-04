import React from 'react';
import { Outlet } from 'react-router-dom';
import GlobalChat from '../components/GlobalChat';
import LanguageSelector from '../components/LanguageSelector';
import { CinematicBackground } from '../components/CinematicBackground';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#040608] text-slate-100 font-body relative overflow-hidden">
      {/* Cinematic Ambient Background */}
      <CinematicBackground />


      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-50 py-3.5 px-6 bg-[#0a0d14]/70 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 md:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#2a2d35] to-[#12141a] border border-white/10 shadow-[0_0_15px_rgba(148,163,184,0.15)] group-hover:shadow-[0_0_20px_rgba(148,163,184,0.3)] transition-all duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="#111" stroke="#94a3b8" strokeWidth="1.5" className="opacity-80 group-hover:opacity-100 transition-opacity"/>
                <circle cx="12" cy="9.5" r="4.5" fill="white"/>
                <path d="M11.5 8.5C11.5 8.08579 11.8358 7.75 12.25 7.75C12.6642 7.75 13 8.08579 13 8.5C13 8.8028 12.8208 9.06502 12.5629 9.181C12.8208 9.29698 13 9.5592 13 9.862C13 10.2762 12.6642 10.612 12.25 10.612C11.8358 10.612 11.5 10.2762 11.5 9.862C11.5 9.5592 11.6792 9.29698 11.9371 9.181C11.6792 9.06502 11.5 8.8028 11.5 8.5Z" fill="#111"/>
              </svg>
            </div>
            <span className="font-display font-black text-lg tracking-[0.15em] text-white group-hover:text-pool-cyan transition-colors duration-300">
              8-POOL ULTRA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector compact={true} />
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pool-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pool-cyan shadow-[0_0_8px_#94a3b8]"></span>
              </span>
              <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-grow flex flex-col justify-center max-w-[1440px] mx-auto w-full px-4 md:px-8 py-8 z-10 relative">
        <React.Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-pool-cyan animate-spin mb-6"></div>
            <p className="text-pool-cyan font-display text-xs font-bold tracking-[0.2em] uppercase animate-pulse">
              Entering Arena...
            </p>
          </div>
        }>
          <Outlet />
        </React.Suspense>
      </main>

      {/* Floating Global Chat Engine */}
      <div className="z-40">
        <GlobalChat />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-[11px] text-slate-500 font-medium tracking-wider border-t border-white/5 bg-[#080b10]/80 backdrop-blur-sm">
        &copy; 2026 8-POOL ULTRA &middot; BUILT FOR COMPETITIVE PLAYERS
      </footer>
    </div>
  );
};

export default MainLayout;
