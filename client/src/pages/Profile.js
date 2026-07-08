import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
export const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [searchUsername, setSearchUsername] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const res = await api.get('/api/users/me');
                setProfile(res.data);
            }
            catch (err) {
                console.error('Error fetching profile:', err);
                navigate('/login');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchMyProfile();
    }, [navigate]);
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchUsername.trim())
            return;
        setSearchError(null);
        setSearchResult(null);
        try {
            const res = await api.get(`/api/users/${searchUsername.trim()}`);
            setSearchResult(res.data);
        }
        catch (err) {
            console.error('Search error:', err);
            const msg = err.response?.data?.error || 'Player not found.';
            setSearchError(msg);
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "max-w-md mx-auto text-center py-12", children: [_jsx("div", { className: "text-4xl mb-4 animate-spin", children: "\uD83C\uDFB1" }), _jsx("p", { className: "text-slate-400 font-body text-sm font-semibold tracking-wide uppercase", children: "Loading player profile..." })] }));
    }
    const myGamesPlayed = (profile?.wins || 0) + (profile?.losses || 0);
    const myWinRate = myGamesPlayed > 0
        ? Math.round(((profile?.wins || 0) / myGamesPlayed) * 100)
        : 0;
    const searchGamesPlayed = searchResult
        ? searchResult.wins + searchResult.losses
        : 0;
    const searchWinRate = searchGamesPlayed > 0
        ? Math.round(((searchResult?.wins || 0) / searchGamesPlayed) * 100)
        : 0;
    return (_jsxs("div", { className: "max-w-2xl mx-auto w-full flex flex-col gap-8 px-6 py-8", children: [_jsxs("div", { className: "bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl", children: [_jsx("h3", { className: "text-lg font-bold tracking-wider font-display text-white mb-4 uppercase", children: "\uD83D\uDD0D Lookup Player Stats" }), _jsxs("form", { onSubmit: handleSearch, className: "flex gap-4", children: [_jsx("input", { type: "text", value: searchUsername, onChange: (e) => setSearchUsername(e.target.value), placeholder: "Enter username to search", className: "flex-grow px-4 py-2 bg-pool-dark/50 border border-white/10 focus:border-pool-cyan focus:outline-none rounded-xl text-white font-body text-sm" }), _jsx("button", { type: "submit", className: "py-2 px-6 bg-pool-cyan hover:bg-pool-cyan/90 text-pool-dark font-display font-bold rounded-xl shadow-lg transition-all", children: "Search" })] }), searchError && (_jsxs("div", { className: "mt-4 text-rose-400 text-sm font-semibold", children: ["\u274C ", searchError] })), searchResult && (_jsxs("div", { className: "mt-6 p-4 bg-pool-dark/50 border border-white/5 rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsxs("h4", { className: "text-md font-bold text-pool-cyan font-display", children: ["Player Found: ", searchResult.username] }), _jsx("span", { className: "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-pool-cyan/15 text-pool-cyan border border-pool-cyan/20 rounded-md", children: searchResult.rank })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { className: "p-3 bg-pool-dark/40 border border-white/5 rounded-lg text-center", children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display uppercase", children: "Coins" }), _jsxs("div", { className: "text-lg font-extrabold text-amber-400 font-display mt-0.5", children: ["\uD83E\uDE99 ", searchResult.coins] })] }), _jsxs("div", { className: "p-3 bg-pool-dark/40 border border-white/5 rounded-lg text-center", children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display uppercase", children: "XP" }), _jsxs("div", { className: "text-lg font-extrabold text-pool-purple font-display mt-0.5", children: ["\u2728 ", searchResult.xp] })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-2 text-center border-t border-white/5 pt-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display uppercase", children: "Games" }), _jsx("div", { className: "text-md font-bold text-white font-display mt-0.5", children: searchGamesPlayed })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display uppercase", children: "Wins" }), _jsx("div", { className: "text-md font-bold text-emerald-400 font-display mt-0.5", children: searchResult.wins })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display uppercase", children: "Losses" }), _jsx("div", { className: "text-md font-bold text-rose-400 font-display mt-0.5", children: searchResult.losses })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display uppercase", children: "Win Rate" }), _jsxs("div", { className: "text-md font-bold text-pool-cyan font-display mt-0.5", children: [searchWinRate, "%"] })] })] }), _jsxs("div", { className: "mt-4 text-xs text-slate-500 text-center font-body border-t border-white/5 pt-3", children: ["Member Since: ", new Date(searchResult.createdAt).toLocaleDateString()] })] }))] }), _jsxs("div", { className: "bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: "text-lg font-bold tracking-wider font-display text-white uppercase", children: "\uD83D\uDC64 Your Player Profile" }), _jsx(Link, { to: "/dashboard", className: "text-xs text-pool-cyan hover:underline font-semibold font-display uppercase", children: "Back to Dashboard" })] }), profile && (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-pool-purple/20 border border-pool-purple/35 flex items-center justify-center text-3xl shadow-lg shadow-pool-purple/10", children: "\uD83C\uDFB1" }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h4", { className: "text-2xl font-extrabold text-white font-display leading-none", children: profile.username }), _jsx("span", { className: "px-2 py-0.5 text-[9px] font-bold bg-pool-purple/20 text-pool-purple border border-pool-purple/30 rounded-md font-display uppercase tracking-wide", children: profile.rank })] }), _jsxs("p", { className: "text-slate-500 text-xs mt-1.5 font-body", children: ["Email: ", profile.email] })] })] }), _jsx("hr", { className: "border-white/5" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-pool-dark/30 border border-white/5 rounded-xl text-center", children: [_jsx("div", { className: "text-xs text-slate-500 font-display font-semibold uppercase", children: "Total Coins" }), _jsxs("div", { className: "text-2xl font-extrabold text-amber-400 font-display mt-1", children: ["\uD83E\uDE99 ", profile.coins.toLocaleString()] })] }), _jsxs("div", { className: "p-4 bg-pool-dark/30 border border-white/5 rounded-xl text-center", children: [_jsx("div", { className: "text-xs text-slate-500 font-display font-semibold uppercase", children: "Experience (XP)" }), _jsxs("div", { className: "text-2xl font-extrabold text-pool-purple font-display mt-1", children: ["\u2728 ", profile.xp] })] })] }), _jsxs("div", { className: "grid grid-cols-4 gap-2 text-center border-t border-white/5 pt-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display font-semibold uppercase", children: "Played" }), _jsx("div", { className: "text-xl font-extrabold text-white font-display mt-1", children: myGamesPlayed })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display font-semibold uppercase", children: "Wins" }), _jsx("div", { className: "text-xl font-extrabold text-emerald-400 font-display mt-1", children: profile.wins })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display font-semibold uppercase", children: "Losses" }), _jsx("div", { className: "text-xl font-extrabold text-rose-400 font-display mt-1", children: profile.losses })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] text-slate-500 font-display font-semibold uppercase", children: "Win Rate" }), _jsxs("div", { className: "text-xl font-extrabold text-pool-cyan font-display mt-1", children: [myWinRate, "%"] })] })] }), _jsxs("div", { className: "text-center text-xs text-slate-500 font-body border-t border-white/5 pt-4", children: ["Account created on ", new Date(profile.createdAt).toLocaleDateString()] })] }))] })] }));
};
export default Profile;
