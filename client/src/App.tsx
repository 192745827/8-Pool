import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Lobby from './pages/Lobby.js';
import GameRoom from './pages/GameRoom.js';

// Setup routing directly within the App container to match client/src/ hierarchy
const router = createBrowserRouter([
  {
    path: '/',
    element: <Lobby />,
  },
  {
    path: '/game/:roomId',
    element: <GameRoom />,
  },
]);

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-pool-dark text-slate-100 font-body">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-50 py-4 px-6 bg-pool-dark/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎱</span>
            <span className="font-display font-extrabold text-lg tracking-wider text-white">
              8-POOL MULTIPLAYER
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
              Restructured Client Setup
            </span>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-grow flex flex-col justify-center max-w-6xl mx-auto w-full py-8">
        <RouterProvider router={router} />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-white/5">
        &copy; 2026 Antigravity 8-Pool. Restructured client workspace.
      </footer>
    </div>
  );
};
export default App;
