import React, { useEffect, useState } from 'react';
import socketService from '../socket/socket';

export const NetworkError: React.FC = () => {
  const [isConnected, setIsConnected] = useState(() => socketService.getSocket()?.connected ?? true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setIsReconnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsReconnecting(true);
    };

    const handleConnectError = () => {
      setIsConnected(false);
      setIsReconnecting(true);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const handleManualReconnect = () => {
    setIsReconnecting(true);
    socketService.disconnect();
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
  };

  if (isConnected) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 p-4 bg-rose-950/90 backdrop-blur-md border-b border-rose-500/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-white shadow-lg shadow-black/40 animate-slide-down">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-sm animate-pulse">
          ⚠️
        </div>
        <div className="text-left">
          <div className="text-xs font-black uppercase tracking-wider font-display text-rose-300">
            CONNECTION LOST
          </div>
          <div className="text-[10px] text-slate-300 font-body">
            {isReconnecting 
              ? 'Attempting to re-establish secure WebSocket tunnel...' 
              : 'Disconnected from authoritative server lobby.'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isReconnecting && (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
        )}
        <button
          onClick={handleManualReconnect}
          disabled={isReconnecting}
          className="py-1.5 px-4 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
          {isReconnecting ? 'Reconnecting...' : 'Force Reconnect'}
        </button>
      </div>
    </div>
  );
};

export default NetworkError;
