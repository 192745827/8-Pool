import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const JoinRoomModal = ({ isOpen, onClose, onJoin, isJoining = false, }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to join room.');
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { onClick: onClose, className: "absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" }), _jsxs("div", { className: "relative w-full max-w-sm p-6 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden", children: [_jsx("div", { className: "absolute -top-24 -left-24 w-48 h-48 rounded-full bg-pool-cyan/10 blur-3xl pointer-events-none" }), _jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-extrabold font-display text-white", children: "Join Private Game" }), _jsx("p", { className: "text-xs text-slate-500 font-body mt-1", children: "Enter a friend's 6-character room code." })] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-white text-lg p-1 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg transition", children: "\u2715" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display mb-1.5", children: "Room Code" }), _jsx("input", { type: "text", value: code, onChange: (e) => {
                                            setCode(e.target.value.slice(0, 6));
                                            setError(null);
                                        }, placeholder: "e.g. POOL88", className: "w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-bold font-display uppercase tracking-widest text-pool-cyan placeholder:text-slate-700 focus:outline-none focus:border-pool-cyan/60 transition-all duration-300", maxLength: 6, disabled: isJoining, autoFocus: true }), error && (_jsxs("p", { className: "text-rose-400 text-xs font-body mt-2 leading-relaxed text-center", children: ["\u26A0\uFE0F ", error] }))] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, disabled: isJoining, className: "w-1/2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-display font-bold text-xs rounded-xl transition duration-300", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isJoining, className: "w-1/2 py-3 bg-gradient-to-r from-pool-cyan to-pool-cyan/80 text-pool-dark hover:brightness-110 active:scale-95 font-display font-bold text-xs rounded-xl shadow-lg transition duration-300", children: isJoining ? 'Joining...' : 'Enter Room' })] })] })] })] }));
};
export default JoinRoomModal;
