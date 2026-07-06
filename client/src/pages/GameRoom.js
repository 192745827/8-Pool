import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from 'react-router-dom';
export const GameRoom = () => {
    const { roomId } = useParams();
    return (_jsx("div", { className: "flex flex-col items-center justify-center min-h-[60vh] text-center px-4", children: _jsxs("div", { className: "max-w-xl p-8 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl shadow-xl w-full", children: [_jsx("h1", { className: "text-3xl font-bold text-pool-cyan mb-2", children: "GAME ROOM" }), _jsxs("p", { className: "text-slate-400 text-sm mb-6", children: ["Room ID: ", roomId || 'demo-room'] }), _jsx("div", { className: "aspect-[2/1] bg-pool-felt rounded-xl mb-6 flex items-center justify-center border border-white/10 relative overflow-hidden", children: _jsx("span", { className: "text-white/40 font-bold text-sm tracking-wider", children: "POOL TABLE VIEWPORT (COMING SOON)" }) }), _jsx(Link, { to: "/", className: "text-slate-400 hover:text-white underline text-sm transition", children: "Leave Room & Return to Lobby" })] }) }));
};
export default GameRoom;
