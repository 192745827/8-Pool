import React from 'react';
import { Link } from 'react-router-dom';

export const Lobby: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-md p-8 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pool-cyan to-pool-purple bg-clip-text text-transparent mb-3">
          8-BALL LOBBY
        </h1>
        <p className="text-slate-400 mb-6 text-sm">
          Production-quality React + TypeScript monorepo client starter. Ready for matchmaking and lobby services.
        </p>

        <div className="space-y-4">
          <Link
            to="/game/room-demo"
            className="block w-full py-3 px-6 bg-gradient-to-r from-pool-cyan to-pool-purple text-pool-dark hover:brightness-110 font-bold rounded-xl shadow-lg transition duration-300"
          >
            Enter Demo Room
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Lobby;
