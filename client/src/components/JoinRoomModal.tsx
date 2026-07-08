import React, { useState } from 'react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomId: string) => Promise<void>;
  isJoining?: boolean;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  isJoining = false,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a room code.');
      return;
    }
    if (cleanCode.length !== 6) {
      setError('Room code must be exactly 6 characters long.');
      return;
    }

    try {
      await onJoin(cleanCode);
      setCode('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to join room.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
      />

      <div className="relative w-full max-w-sm p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-pool-cyan/10 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-extrabold font-display text-white">Join Private Game</h3>
            <p className="text-xs text-slate-500 font-body mt-1">Enter a friend's 6-character room code.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.slice(0, 6));
                setError(null);
              }}
              placeholder="e.g. POOL88"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-bold font-display uppercase tracking-widest text-pool-cyan placeholder:text-slate-700 focus:outline-none focus:border-pool-cyan/60 transition-all duration-300"
              maxLength={6}
              disabled={isJoining}
              autoFocus
            />
            {error && (
              <p className="text-rose-400 text-xs font-body mt-2 leading-relaxed text-center">
                ⚠️ {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isJoining}
              className="w-1/2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-display font-bold text-xs rounded-xl transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isJoining}
              className="w-1/2 py-3 bg-gradient-to-r from-pool-cyan to-pool-cyan/80 text-pool-dark hover:brightness-110 active:scale-95 font-display font-bold text-xs rounded-xl shadow-lg transition duration-300"
            >
              {isJoining ? 'Joining...' : 'Enter Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;
