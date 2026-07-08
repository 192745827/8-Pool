import React from 'react';

interface CreateRoomButtonProps {
  isPrivate?: boolean;
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

export const CreateRoomButton: React.FC<CreateRoomButtonProps> = ({
  isPrivate = false,
  onClick,
  isLoading = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`py-3 px-4 text-white font-display font-bold text-xs rounded-xl border transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
        isPrivate
          ? 'bg-slate-800/80 border-white/10 hover:border-pool-purple/45 hover:bg-slate-800'
          : 'bg-slate-900/60 border-white/10 hover:border-pool-purple/45 hover:bg-slate-900'
      } ${className}`}
    >
      <span>{isPrivate ? '🔒' : '➕'}</span>
      <span>{isLoading ? 'Creating...' : isPrivate ? 'Create Private' : 'Create Public'}</span>
    </button>
  );
};

export default CreateRoomButton;
