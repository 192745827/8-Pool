import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import JoinRoomModal from '../components/JoinRoomModal';
import CreateRoomButton from '../components/CreateRoomButton';
export const Dashboard = () => {
    const user = useGameStore((state) => state.user);
    const setUser = useGameStore((state) => state.setUser);
    const setRoom = useGameStore((state) => state.setRoom);
    const resetStore = useGameStore((state) => state.reset);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [actionError, setActionError] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/users/me');
                setProfile(res.data);
                // Sync with store
                setUser({
                    id: res.data._id,
                    username: res.data.username,
                    email: res.data.email,
                    avatar: res.data.avatar,
                    coins: res.data.coins,
                    xp: res.data.xp,
                    wins: res.data.wins,
                    losses: res.data.losses,
                    rank: res.data.rank,
                });
            }
            catch (err) {
                console.error('Auth error on dashboard:', err);
                localStorage.removeItem('token');
                resetStore();
                navigate('/login');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [setUser, resetStore, navigate]);
    const handleLogout = () => {
        localStorage.removeItem('token');
        resetStore();
        navigate('/login');
    };
    const handleQuickPlay = async () => {
        setIsActionLoading(true);
        setActionError(null);
        try {
            // Find public lobbies
            const roomsRes = await api.get('/api/rooms');
            const publicRooms = roomsRes.data;
            if (publicRooms.length > 0) {
                // Join the first available room
                const targetRoom = publicRooms[0];
                const joinRes = await api.post('/api/rooms/join', { roomId: targetRoom.roomId });
                setRoom(joinRes.data);
                navigate(`/game/${targetRoom.roomId}`);
            }
            else {
                // Create a new public room
                const createRes = await api.post('/api/rooms/create', { isPrivate: false });
                setRoom(createRes.data);
                navigate(`/game/${createRes.data.roomId}`);
            }
        }
        catch (err) {
            setActionError(err.response?.data?.error || err.message || 'Failed to matchmake.');
        }
        finally {
            setIsActionLoading(false);
        }
    };
    const handleCreateRoom = async (isPrivate) => {
        setIsActionLoading(true);
        setActionError(null);
        try {
            const res = await api.post('/api/rooms/create', { isPrivate });
            setRoom(res.data);
            navigate(`/game/${res.data.roomId}`);
        }
        catch (err) {
            setActionError(err.response?.data?.error || err.message || 'Failed to create room.');
        }
        finally {
            setIsActionLoading(false);
        }
    };
    const handleJoinSubmit = async (roomId) => {
        setIsActionLoading(true);
        setActionError(null);
        try {
            const res = await api.post('/api/rooms/join', { roomId });
            setRoom(res.data);
            navigate(`/game/${res.data.roomId}`);
        }
        catch (err) {
            setActionError(err.response?.data?.error || err.message || 'Failed to join room.');
            throw err; // throw back to let the modal show the error
        }
        finally {
            setIsActionLoading(false);
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "max-w-md mx-auto text-center py-24", children: [_jsx("div", { className: "text-5xl mb-6 animate-bounce", children: "\uD83C\uDFB1" }), _jsx("p", { className: "text-slate-400 font-display text-sm font-semibold tracking-wide uppercase", children: "Loading player profile..." })] }));
    }
    // Experience level calculation
    const xp = profile?.xp || 0;
    const level = Math.floor(xp / 1000) + 1;
    const currentXPProgress = xp % 1000;
    const xpPercent = Math.min((currentXPProgress / 1000) * 100, 100);
    // Dynamic border glow based on Rank
    const getRankGlowClass = (rankName = '') => {
        const name = rankName.toLowerCase();
        if (name.includes('grandmaster') || name.includes('legend'))
            return 'border-amber-500 shadow-amber-500/25';
        if (name.includes('master') || name.includes('pro'))
            return 'border-pool-purple shadow-pool-purple/25';
        return 'border-pool-cyan shadow-pool-cyan/20';
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto w-full px-4 py-8", children: [actionError && (_jsxs("div", { className: "mb-6 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-xl text-sm font-body text-center flex items-center justify-between", children: [_jsxs("span", { children: ["\u26A0\uFE0F ", actionError] }), _jsx("button", { onClick: () => setActionError(null), className: "text-xs hover:text-white", children: "\u2715" })] })), _jsxs("div", { className: "p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-80 h-80 rounded-full bg-pool-cyan/5 blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 left-0 w-80 h-80 rounded-full bg-pool-purple/5 blur-3xl pointer-events-none" }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-5 relative z-10 w-full md:w-auto", children: [_jsxs("div", { className: `w-20 h-20 rounded-full bg-gradient-to-tr from-pool-dark to-slate-800 border-2 ${getRankGlowClass(profile?.rank)} shadow-lg flex items-center justify-center text-4xl relative`, children: [_jsx("span", { children: profile?.avatar === 'avatar_1' ? '👤' : profile?.avatar || '👤' }), _jsxs("div", { className: "absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pool-cyan border border-slate-950 flex items-center justify-center text-[10px] font-bold text-slate-950 font-display", children: ["L", level] })] }), _jsxs("div", { className: "text-center sm:text-left", children: [_jsxs("div", { className: "flex items-center justify-center sm:justify-start gap-2", children: [_jsx("h2", { className: "text-2xl font-extrabold tracking-wider font-display text-white", children: profile?.username }), _jsx("span", { className: "px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/20 rounded-md", children: profile?.rank })] }), _jsx("p", { className: "text-slate-500 text-xs mt-1 font-body", children: profile?.email }), _jsxs("div", { className: "mt-3 w-56", children: [_jsxs("div", { className: "flex justify-between text-[9px] font-bold text-slate-400 font-display mb-1 uppercase tracking-wide", children: [_jsxs("span", { children: ["LVL ", level] }), _jsxs("span", { children: [currentXPProgress, "/1,000 XP"] })] }), _jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5", children: _jsx("div", { className: "bg-gradient-to-r from-pool-cyan to-pool-purple h-full transition-all duration-500", style: { width: `${xpPercent}%` } }) })] })] })] }), _jsx("button", { onClick: handleLogout, className: "py-2.5 px-5 bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-slate-300 font-display text-xs font-semibold rounded-xl transition duration-300 shrink-0 relative z-10 self-center", children: "Sign Out" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsx("h3", { className: "text-lg font-bold font-display text-white tracking-wide border-b border-white/5 pb-2", children: "\uD83C\uDFC6 Player Statistics" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(StatsCard, { label: "Coins Balance", value: `🪙 ${(profile?.coins || 0).toLocaleString()}`, icon: "\uD83D\uDCB0", description: "Used to enter competitive matches and buy visual items.", colorClass: "text-amber-400" }), _jsx(StatsCard, { label: "Experience Points", value: `${profile?.xp} XP`, icon: "\u2728", description: "Play games to level up your status and show on your card.", colorClass: "text-pool-cyan" }), _jsx(StatsCard, { label: "Wins Record", value: `${profile?.wins} Matches`, icon: "\uD83E\uDD47", description: "Total number of competitive matches won.", colorClass: "text-emerald-400" }), _jsx(StatsCard, { label: "Losses Record", value: `${profile?.losses} Matches`, icon: "\uD83E\uDD4A", description: "Matches lost in multiplayer queue rooms.", colorClass: "text-rose-400" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-bold font-display text-white tracking-wide border-b border-white/5 pb-2", children: "\uD83C\uDFAE Menu Actions" }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("button", { onClick: handleQuickPlay, disabled: isActionLoading, className: "py-4 px-6 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:shadow-lg hover:shadow-pool-cyan/15 text-pool-dark font-display font-bold text-base rounded-xl transition duration-300 transform active:scale-95 text-center flex items-center justify-center gap-2.5 disabled:opacity-50", children: [_jsx("span", { children: "\u25B6\uFE0F" }), " ", isActionLoading ? 'Matching...' : 'Play Quick Match'] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(CreateRoomButton, { isPrivate: false, onClick: () => handleCreateRoom(false), isLoading: isActionLoading, className: "w-full" }), _jsx(CreateRoomButton, { isPrivate: true, onClick: () => handleCreateRoom(true), isLoading: isActionLoading, className: "w-full" })] }), _jsxs("button", { onClick: () => setIsJoinOpen(true), disabled: isActionLoading, className: "py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display font-bold text-xs rounded-xl transition duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50", children: [_jsx("span", { children: "\uD83D\uDD11" }), " Join Room Code"] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mt-2", children: [_jsxs(Link, { to: "/leaderboard", className: "py-3 px-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-display font-semibold text-[10px] uppercase tracking-wider rounded-xl transition duration-300 text-center flex flex-col items-center justify-center gap-1", children: [_jsx("span", { children: "\uD83C\uDFC6" }), " Leaderboard"] }), _jsxs(Link, { to: "/profile", className: "py-3 px-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-display font-semibold text-[10px] uppercase tracking-wider rounded-xl transition duration-300 text-center flex flex-col items-center justify-center gap-1", children: [_jsx("span", { children: "\uD83D\uDC64" }), " Profile"] }), _jsxs(Link, { to: "/settings", className: "py-3 px-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-display font-semibold text-[10px] uppercase tracking-wider rounded-xl transition duration-300 text-center flex flex-col items-center justify-center gap-1", children: [_jsx("span", { children: "\u2699\uFE0F" }), " Settings"] })] })] })] })] }), _jsx(JoinRoomModal, { isOpen: isJoinOpen, onClose: () => setIsJoinOpen(false), onJoin: handleJoinSubmit, isJoining: isActionLoading })] }));
};
export default Dashboard;
