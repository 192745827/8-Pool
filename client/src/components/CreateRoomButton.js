import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const CreateRoomButton = ({ isPrivate = false, onClick, isLoading = false, className = '', }) => {
    return (_jsxs("button", { onClick: onClick, disabled: isLoading, className: `py-3 px-4 text-white font-display font-bold text-xs rounded-xl border transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${isPrivate
            ? 'bg-slate-800/80 border-white/10 hover:border-pool-purple/45 hover:bg-slate-800'
            : 'bg-slate-900/60 border-white/10 hover:border-pool-purple/45 hover:bg-slate-900'} ${className}`, children: [_jsx("span", { children: isPrivate ? '🔒' : '➕' }), _jsx("span", { children: isLoading ? 'Creating...' : isPrivate ? 'Create Private' : 'Create Public' })] }));
};
export default CreateRoomButton;
