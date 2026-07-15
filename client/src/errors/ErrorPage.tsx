import React from 'react';

interface ErrorPageProps {
  error: Error | null;
  resetError?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
  const handleReload = () => {
    if (resetError) {
      resetError();
    }
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-[70vh] w-full max-w-xl mx-auto px-6 py-12 flex flex-col justify-center items-center text-center">
      <div className="p-8 bg-slate-900 border border-rose-500/20 rounded-3xl shadow-2xl relative overflow-hidden w-full">
        {/* Neon Glow Highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl mb-6 mx-auto animate-pulse">
          🚨
        </div>

        <h2 className="text-2xl font-extrabold font-display text-white uppercase tracking-wider">
          Application Error
        </h2>
        
        <p className="text-xs text-slate-400 font-body mt-3 leading-relaxed max-w-sm mx-auto">
          An unexpected error occurred and crashed the current render tree. Please try resetting or reloading the application.
        </p>

        {error && (
          <div className="mt-6 p-4 bg-slate-950/80 border border-white/5 rounded-xl text-left overflow-x-auto text-[10px] font-mono text-rose-300 max-h-40 scrollbar-thin">
            <span className="font-bold text-rose-400">{error.name}:</span> {error.message}
            {error.stack && (
              <pre className="mt-2 text-slate-500 leading-normal whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {resetError && (
            <button
              onClick={resetError}
              className="py-3 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display font-bold text-xs rounded-xl shadow transition duration-200 cursor-pointer"
            >
              🔄 Clear Error & Retry
            </button>
          )}
          <button
            onClick={handleReload}
            className="py-3 px-8 bg-gradient-to-r from-rose-500 to-orange-500 hover:brightness-110 active:scale-95 text-white font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition duration-200 cursor-pointer shadow-rose-500/20"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
