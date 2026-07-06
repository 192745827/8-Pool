import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export const Lobby = () => {
    return (_jsx("div", { className: "flex flex-col items-center justify-center min-h-[60vh] text-center px-4", children: _jsxs("div", { className: "max-w-md p-8 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl shadow-xl", children: [_jsx("h1", { className: "text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pool-cyan to-pool-purple bg-clip-text text-transparent mb-3", children: "8-BALL LOBBY" }), _jsx("p", { className: "text-slate-400 mb-6 text-sm", children: "Production-quality React + TypeScript monorepo client starter. Ready for matchmaking and lobby services." }), _jsx("div", { className: "space-y-4", children: _jsx(Link, { to: "/game/room-demo", className: "block w-full py-3 px-6 bg-gradient-to-r from-pool-cyan to-pool-purple text-pool-dark hover:brightness-110 font-bold rounded-xl shadow-lg transition duration-300", children: "Enter Demo Room" }) })] }) }));
};
export default Lobby;
