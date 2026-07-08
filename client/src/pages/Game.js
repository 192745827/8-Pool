import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import PlayerCard from '../components/PlayerCard';
import socketService from '../socket/socket';
import { SOCKET_EVENTS } from '../socket/socketEvents';
import Scene from '../game/Scene';
export const Game = () => {
    const { roomId } = useParams();
    const currentRoom = useGameStore((state) => state.currentRoom);
    const setRoom = useGameStore((state) => state.setRoom);
    const user = useGameStore((state) => state.user);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState(false);
    // Game start transition placeholder state
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState(null);
    // Temporary chat message logs
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);
    // Fetch initial room details and verify connection on mount
    useEffect(() => {
        const fetchRoomDetails = async () => {
            if (!roomId)
                return;
            setIsLoading(true);
            setError(null);
            try {
                const res = await api.get(`/api/rooms/${roomId}`);
                setRoom(res.data);
            }
            catch (err) {
                console.error('Error fetching room details:', err);
                setError(err.response?.data?.error || err.message || 'Room not found.');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchRoomDetails();
        const token = localStorage.getItem('token');
        if (token) {
            socketService.connect(token);
        }
    }, [roomId, setRoom]);
    // Setup Socket listeners for real-time room updates
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket || !roomId)
            return;
        // Join room channel immediately
        socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });
        socket.on(SOCKET_EVENTS.ROOM_UPDATED, (updatedRoom) => {
            setRoom(updatedRoom);
            // If we are currently playing, sync status
            if (updatedRoom.status === 'playing') {
                setGameStarted(true);
            }
            else {
                setGameStarted(false);
            }
        });
        socket.on(SOCKET_EVENTS.ROOM_ENDED, (data) => {
            setRoom(null);
            setError(data.message || 'Room has been closed by host.');
            setGameStarted(false);
            setCountdown(null);
        });
        socket.on(SOCKET_EVENTS.ROOM_ERROR, (errData) => {
            setError(errData.message);
        });
        // Auto Start Game Listener
        socket.on(SOCKET_EVENTS.START_GAME, (roomDetails) => {
            setRoom(roomDetails);
            // Trigger a 3-second countdown transition
            let count = 3;
            setCountdown(count);
            const timer = setInterval(() => {
                count -= 1;
                if (count <= 0) {
                    clearInterval(timer);
                    setCountdown(null);
                    setGameStarted(true);
                }
                else {
                    setCountdown(count);
                }
            }, 1000);
        });
        // Message listener
        socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (payload) => {
            setMessages((prev) => [...prev, payload]);
        });
        return () => {
            socket.off(SOCKET_EVENTS.ROOM_UPDATED);
            socket.off(SOCKET_EVENTS.ROOM_ENDED);
            socket.off(SOCKET_EVENTS.ROOM_ERROR);
            socket.off(SOCKET_EVENTS.START_GAME);
            socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE);
        };
    }, [roomId, setRoom]);
    const handleToggleReady = () => {
        if (!currentRoom || !user || !roomId)
            return;
        const host = typeof currentRoom.host === 'object' ? currentRoom.host : null;
        const guest = typeof currentRoom.guest === 'object' ? currentRoom.guest : null;
        const isHost = host && user.id === host._id;
        const isGuest = guest && user.id === guest._id;
        if (isHost) {
            if (currentRoom.hostReady) {
                socketService.emit(SOCKET_EVENTS.PLAYER_NOT_READY, { roomId });
            }
            else {
                socketService.emit(SOCKET_EVENTS.PLAYER_READY, { roomId });
            }
        }
        else if (isGuest) {
            if (currentRoom.guestReady) {
                socketService.emit(SOCKET_EVENTS.PLAYER_NOT_READY, { roomId });
            }
            else {
                socketService.emit(SOCKET_EVENTS.PLAYER_READY, { roomId });
            }
        }
    };
    const handleLeaveRoom = () => {
        if (!roomId)
            return;
        socketService.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
        setRoom(null);
        navigate('/dashboard');
    };
    const handleCopyCode = () => {
        if (!roomId)
            return;
        navigator.clipboard.writeText(roomId);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };
    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSendChatMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !roomId)
            return;
        socketService.emit(SOCKET_EVENTS.SEND_MESSAGE, { roomId, message: chatInput.trim() });
        setChatInput('');
    };
    if (isLoading) {
        return (_jsxs("div", { className: "max-w-md mx-auto text-center py-24", children: [_jsx("div", { className: "text-5xl mb-6 animate-bounce", children: "\uD83C\uDFB1" }), _jsx("p", { className: "text-slate-400 font-display text-sm font-semibold tracking-wide uppercase", children: "Loading game room details..." })] }));
    }
    if (error || !currentRoom) {
        return (_jsxs("div", { className: "max-w-md mx-auto text-center py-20 px-6 bg-slate-900 border border-white/10 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-4xl block mb-4", children: "\u26A0\uFE0F" }), _jsx("h3", { className: "text-lg font-bold font-display text-white", children: "Lobby Error" }), _jsx("p", { className: "text-xs text-slate-400 font-body mt-2 leading-relaxed", children: error || 'Unable to join the room.' }), _jsx(Link, { to: "/dashboard", className: "mt-6 inline-block py-2.5 px-6 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 text-pool-dark font-display font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition", children: "Return to Dashboard" })] }));
    }
    const host = typeof currentRoom.host === 'object' ? currentRoom.host : null;
    const guest = typeof currentRoom.guest === 'object' ? currentRoom.guest : null;
    const isHost = host && user && user.id === host._id;
    const isGuest = guest && user && user.id === guest._id;
    const currentUserReady = isHost ? currentRoom.hostReady : isGuest ? currentRoom.guestReady : false;
    // ─── PLAYING VIEW (GAME STARTED PLACEHOLDER) ───
    if (gameStarted) {
        return (_jsx("div", { className: "max-w-4xl mx-auto w-full px-4 py-8", children: _jsxs("div", { className: "p-8 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden text-center", children: [_jsx("div", { className: "absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pool-cyan via-pool-purple to-pool-cyan shadow-[0_0_15px_#00f0ff]" }), _jsx("h2", { className: "text-3xl font-extrabold font-display text-white tracking-widest uppercase animate-pulse", children: "\uD83C\uDFB1 MATCH IN PROGRESS" }), _jsx("p", { className: "text-xs text-pool-cyan font-body mt-2", children: "Dynamic waiting room countdown finished. Game successfully initialized!" }), _jsx("div", { className: "my-8 max-w-3xl mx-auto", children: _jsx(Scene, {}) }), _jsxs("div", { className: "flex justify-center items-center gap-8 mb-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm font-bold text-white font-display truncate max-w-[120px]", children: host?.username }), _jsx("div", { className: "text-[10px] font-bold text-pool-cyan uppercase tracking-wider mt-0.5", children: "Host" })] }), _jsx("div", { className: "text-slate-600 font-display text-2xl font-bold", children: "VS" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm font-bold text-white font-display truncate max-w-[120px]", children: guest?.username }), _jsx("div", { className: "text-[10px] font-bold text-pool-purple uppercase tracking-wider mt-0.5", children: "Opponent" })] })] }), _jsx("button", { onClick: handleLeaveRoom, className: "py-3 px-8 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-display font-bold text-xs rounded-xl shadow transition duration-300 transform active:scale-95", children: "Leave Match & Exit" })] }) }));
    }
    // ─── WAITING ROOM VIEW WITH SOCKET SYNC ───
    return (_jsxs("div", { className: "max-w-2xl mx-auto w-full px-4 py-8", children: [countdown !== null && (_jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl", children: [_jsx("div", { className: "text-8xl font-black font-display text-pool-cyan animate-ping", children: countdown }), _jsx("p", { className: "text-sm font-bold text-slate-400 font-display uppercase tracking-widest mt-6", children: "Both players ready! Launching match..." })] })), _jsxs("div", { className: "p-8 bg-slate-900 border border-white/10 rounded-2xl shadow-xl relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-64 h-64 rounded-full bg-pool-cyan/5 blur-3xl pointer-events-none" }), _jsxs("div", { className: "text-center mb-8", children: [_jsx("span", { className: "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/35 rounded-full select-none", children: "Match Waiting Room" }), _jsxs("h2", { className: "text-3xl font-extrabold font-display text-white mt-4 tracking-wide", children: ["ROOM CODE: ", _jsx("span", { className: "text-pool-cyan select-all", children: currentRoom.roomId })] }), _jsxs("div", { className: "flex justify-center items-center gap-3 mt-3", children: [_jsx("button", { onClick: handleCopyCode, className: "py-1 px-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-xs font-semibold text-slate-300 transition duration-300 font-display flex items-center gap-1.5 active:scale-95", children: copyFeedback ? '✓ Copied' : '📋 Copy Code' }), _jsx("span", { className: "text-slate-600 font-display", children: "|" }), _jsx("span", { className: "text-slate-400 font-body text-xs", children: currentRoom.isPrivate ? '🔒 Private' : '🌐 Public' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2 flex items-center justify-center gap-1.5", children: [_jsx("span", { children: "Player 1 (Host)" }), currentRoom.hostReady ? (_jsx("span", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-ping" })) : (_jsx("span", { className: "w-2 h-2 bg-rose-500 rounded-full" }))] }), _jsx(PlayerCard, { user: host, isHost: true, label: currentRoom.hostReady ? 'READY' : 'WAITING' })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2 flex items-center justify-center gap-1.5", children: [_jsx("span", { children: "Player 2 (Opponent)" }), guest && (currentRoom.guestReady ? (_jsx("span", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-ping" })) : (_jsx("span", { className: "w-2 h-2 bg-rose-500 rounded-full" })))] }), _jsx(PlayerCard, { user: guest, isHost: false, label: guest ? (currentRoom.guestReady ? 'READY' : 'WAITING') : undefined })] })] }), _jsx("div", { className: "p-4 bg-slate-950 border border-white/5 rounded-xl text-center mb-6", children: guest ? (_jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("p", { className: "text-emerald-400 font-display font-semibold text-sm", children: "Opponent Joined! Ready up to start match." }), _jsx("button", { onClick: handleToggleReady, className: `py-2.5 px-6 font-display font-bold text-xs rounded-xl shadow-md transition-all duration-300 transform active:scale-95 ${currentUserReady
                                        ? 'bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400'
                                        : 'bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:brightness-110 text-pool-dark hover:shadow-lg hover:shadow-pool-cyan/10'}`, children: currentUserReady ? '✕ Set Not Ready' : '✓ Set Ready' })] })) : (_jsxs("div", { children: [_jsxs("p", { className: "text-pool-cyan font-display font-semibold text-sm flex items-center justify-center gap-2", children: [_jsx("span", { className: "inline-block w-2 h-2 bg-pool-cyan rounded-full animate-ping" }), "Waiting for an opponent to join..."] }), _jsx("p", { className: "text-[11px] text-slate-500 font-body mt-1 leading-normal", children: "Give friends the code above or keep it public for matchmaking." })] })) }), _jsxs("div", { className: "mb-6 bg-slate-950/60 border border-white/5 rounded-xl p-4 flex flex-col h-[280px]", children: [_jsx("div", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-2 border-b border-white/5 pb-2 text-left", children: "\uD83D\uDCAC Lobby Chat (Temporary)" }), _jsxs("div", { className: "flex-grow overflow-y-auto mb-3 space-y-2 pr-1 text-left", children: [messages.length === 0 ? (_jsx("div", { className: "h-full flex items-center justify-center text-xs text-slate-600 font-body select-none", children: "No messages yet. Start typing below!" })) : (messages.map((msg, index) => {
                                        const isSelf = msg.senderId === user?.id;
                                        return (_jsxs("div", { className: `flex items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : ''}`, children: [_jsxs("div", { className: "w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs overflow-hidden shrink-0", children: [msg.avatar ? (_jsx("img", { src: `/src/assets/avatars/${msg.avatar}.png`, alt: "Avatar", className: "w-full h-full object-cover", onError: (e) => {
                                                                e.target.style.display = 'none';
                                                            } })) : null, _jsx("span", { className: "text-[10px]", children: "\uD83D\uDC64" })] }), _jsxs("div", { className: "max-w-[75%]", children: [_jsx("div", { className: `text-[9px] text-slate-500 font-display mb-0.5 ${isSelf ? 'text-right' : 'text-left'}`, children: msg.username }), _jsx("div", { className: `py-1.5 px-3 rounded-xl text-xs font-body break-words leading-relaxed ${isSelf
                                                                ? 'bg-pool-cyan/15 border border-pool-cyan/25 text-pool-cyan rounded-tr-none'
                                                                : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none'}`, children: msg.message })] })] }, index));
                                    })), _jsx("div", { ref: chatEndRef })] }), _jsxs("form", { onSubmit: handleSendChatMessage, className: "flex gap-2", children: [_jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), placeholder: "Type a message...", className: "flex-grow px-3 py-2 bg-slate-900 border border-white/5 focus:border-pool-cyan focus:outline-none rounded-lg text-white font-body text-xs transition duration-200" }), _jsx("button", { type: "submit", className: "py-2 px-4 bg-pool-cyan hover:brightness-110 active:scale-95 text-pool-dark font-display font-bold text-xs rounded-lg transition", children: "Send" })] })] }), _jsx("div", { className: "flex gap-4", children: _jsx("button", { onClick: handleLeaveRoom, disabled: isActionLoading, className: "w-full py-3.5 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-slate-300 font-display font-bold text-xs rounded-xl shadow transition duration-300 transform active:scale-95 disabled:opacity-50", children: isActionLoading ? 'Leaving...' : '🚪 Leave Room' }) })] })] }));
};
export default Game;
