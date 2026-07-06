import React from 'react';
import { Link, useParams } from 'react-router-dom';

export const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-xl p-8 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl font-bold text-pool-cyan mb-2">GAME ROOM</h1>
        <p className="text-slate-400 text-sm mb-6">Room ID: {roomId || 'demo-room'}</p>

        {/* Dynamic Pool Table placeholder for future phases */}
        <div className="aspect-[2/1] bg-pool-felt rounded-xl mb-6 flex items-center justify-center border border-white/10 relative overflow-hidden">
          <span className="text-white/40 font-bold text-sm tracking-wider">POOL TABLE VIEWPORT (COMING SOON)</span>
        </div>

        <Link to="/" className="text-slate-400 hover:text-white underline text-sm transition">
          Leave Room & Return to Lobby
        </Link>
      </div>
    </div>
  );
};
export default GameRoom;
