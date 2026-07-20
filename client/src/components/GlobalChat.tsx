import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import socketService from '../socket/socket';
import { SOCKET_EVENTS } from '../socket/socketEvents';

interface ChatMessage {
  id: string;
  senderId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: string | Date;
  channel?: string;
  roomId?: string;
}

interface PrivateMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  recipientId: string;
  message: string;
  timestamp: string | Date;
}

interface OnlineUser {
  userId: string;
  username: string;
  avatar: string;
  rank: string;
}

export const GlobalChat: React.FC = () => {
  const user = useGameStore((state) => state.user);
  const currentRoom = useGameStore((state) => state.currentRoom);
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lobby' | 'game' | 'private'>('lobby');
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  // Message store
  const [lobbyMessages, setLobbyMessages] = useState<ChatMessage[]>([]);
  const [gameMessages, setGameMessages] = useState<ChatMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, PrivateMessage[]>>({});

  // Active DM recipient
  const [activeDmUser, setActiveDmUser] = useState<OnlineUser | null>(null);

  // Online users list
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Typing state
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Connect & Join Global Lobby Socket
  useEffect(() => {
    if (!user) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.JOIN_GLOBAL_CHAT);

      // Listeners
      const handleOnlineUsers = (users: OnlineUser[]) => {
        setOnlineUsers(users.filter((u) => u.userId !== user.id));
      };

      const handleReceiveMessage = (msg: ChatMessage) => {
        if (msg.roomId === 'GLOBAL_LOBBY') {
          setLobbyMessages((prev) => [...prev.slice(-100), msg]);
        } else {
          setGameMessages((prev) => [...prev.slice(-100), msg]);
        }

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      };

      const handleReceivePrivateMessage = (msg: PrivateMessage) => {
        const otherUserId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
        setPrivateMessages((prev) => ({
          ...prev,
          [otherUserId]: [...(prev[otherUserId] || []).slice(-50), msg],
        }));

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      };

      const handleTyping = (data: { userId: string; username: string; isTyping: boolean }) => {
        if (data.userId !== user.id) {
          setTypingUser(data.isTyping ? data.username : null);
        }
      };

      socket.on(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);
      socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.on(SOCKET_EVENTS.RECEIVE_PRIVATE_MESSAGE, handleReceivePrivateMessage);
      socket.on(SOCKET_EVENTS.TYPING, handleTyping);

      return () => {
        socket.off(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);
        socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
        socket.off(SOCKET_EVENTS.RECEIVE_PRIVATE_MESSAGE, handleReceivePrivateMessage);
        socket.off(SOCKET_EVENTS.TYPING, handleTyping);
        socket.emit(SOCKET_EVENTS.LEAVE_GLOBAL_CHAT);
      };
    }
  }, [user, isOpen]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lobbyMessages, gameMessages, privateMessages, activeTab, isOpen]);

  // Reset unread count when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Handle typing indicator emission
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.TYPING, {
        channel: activeTab,
        roomId: activeTab === 'game' ? currentRoom?.roomId : undefined,
        recipientId: activeTab === 'private' ? activeDmUser?.userId : undefined,
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit(SOCKET_EVENTS.TYPING, {
          channel: activeTab,
          roomId: activeTab === 'game' ? currentRoom?.roomId : undefined,
          recipientId: activeTab === 'private' ? activeDmUser?.userId : undefined,
          isTyping: false,
        });
      }, 1500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    if (activeTab === 'lobby') {
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        roomId: 'GLOBAL_LOBBY',
        message: messageInput.trim(),
        channel: 'lobby',
      });
    } else if (activeTab === 'game' && currentRoom?.roomId) {
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        roomId: currentRoom.roomId,
        message: messageInput.trim(),
        channel: 'game',
      });
    } else if (activeTab === 'private' && activeDmUser) {
      socket.emit(SOCKET_EVENTS.PRIVATE_MESSAGE, {
        targetUserId: activeDmUser.userId,
        message: messageInput.trim(),
      });
    }

    setMessageInput('');
  };

  const startPrivateChat = (targetUser: OnlineUser) => {
    setActiveDmUser(targetUser);
    setActiveTab('private');
    setShowOnlineUsers(false);
  };

  // Don't render on login/register pages
  if (['/login', '/register'].includes(location.pathname) || !user) {
    return null;
  }

  // Active messages based on current tab
  const getActiveMessages = () => {
    if (activeTab === 'lobby') return lobbyMessages;
    if (activeTab === 'game') return gameMessages;
    if (activeTab === 'private' && activeDmUser) {
      return (privateMessages[activeDmUser.userId] || []).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        username: m.senderUsername,
        avatar: m.senderAvatar,
        message: m.message,
        timestamp: m.timestamp,
      }));
    }
    return [];
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Collapsed Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-3 px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105"
        >
          <span className="text-xl">💬</span>
          <span className="text-sm font-bold text-white tracking-wide">Global Chat</span>
          <span className="text-xs px-2 py-0.5 font-bold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
            {onlineUsers.length + 1} Online
          </span>

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-[11px] font-extrabold text-white shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Window Drawer */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[540px] bg-slate-950/95 border border-cyan-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900/80 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <div>
                <h3 className="font-extrabold text-white text-base leading-none">Global Chat Engine</h3>
                <p className="text-[11px] text-slate-400 mt-1">Multi-Channel & Direct Messaging</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  showOnlineUsers
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Online Players"
              >
                👥 {onlineUsers.length + 1}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Channel Tabs */}
          <div className="flex bg-slate-900/50 border-b border-slate-800 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('lobby')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'lobby'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              🌐 Lobby
            </button>
            {currentRoom && (
              <button
                onClick={() => setActiveTab('game')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'game'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                🎱 Game Room
              </button>
            )}
            <button
              onClick={() => setActiveTab('private')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'private'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              ✉️ Private DMs
            </button>
          </div>

          {/* Online Users List Overlay Drawer */}
          {showOnlineUsers ? (
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-slate-950/90">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Online Players ({onlineUsers.length + 1})
              </h4>

              {/* Self */}
              <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-black text-xs">
                    YOU
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user.username} (You)</p>
                    <p className="text-[10px] text-cyan-400">Online</p>
                  </div>
                </div>
              </div>

              {/* Other Online Players */}
              {onlineUsers.map((onlineUser) => (
                <div
                  key={onlineUser.userId}
                  className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">
                      👤
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{onlineUser.username}</p>
                      <p className="text-[10px] text-slate-400">{onlineUser.rank || 'Player'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => startPrivateChat(onlineUser)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-500 hover:bg-pink-400 text-white transition-all shadow-sm"
                  >
                    💬 Message
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Private DM Recipient Selector */}
              {activeTab === 'private' && (
                <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Recipient:</span>
                  {activeDmUser ? (
                    <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 px-3 py-1 rounded-lg">
                      <span className="text-xs font-bold text-pink-300">👤 {activeDmUser.username}</span>
                      <button
                        onClick={() => setActiveDmUser(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Select player from 👥 Online list</span>
                  )}
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {getActiveMessages().length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-10">
                    <span className="text-3xl mb-2">💬</span>
                    <p className="text-xs font-medium">No messages in this channel yet.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Start the conversation below!</p>
                  </div>
                ) : (
                  getActiveMessages().map((msg) => {
                    const isSelf = msg.senderId === user.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            {isSelf ? 'You' : msg.username}
                          </span>
                          <span className="text-[9px] text-slate-600">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium break-words shadow-md ${
                            isSelf
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none'
                              : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing status indicator */}
                {typingUser && (
                  <div className="text-[11px] text-cyan-400 italic animate-pulse pt-1">
                    ✍️ {typingUser} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/80 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder={
                    activeTab === 'private' && !activeDmUser
                      ? 'Select player from 👥 Online list first'
                      : `Message #${activeTab}...`
                  }
                  disabled={activeTab === 'private' && !activeDmUser}
                  value={messageInput}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || (activeTab === 'private' && !activeDmUser)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalChat;
