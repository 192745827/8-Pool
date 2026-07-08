import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Camera from './Camera';
import Lighting from './Lighting';
import Table from './Table';
import Cue from './Cue';
import Environment from './Environment';
import Ball from './Ball';
export const Scene = () => {
    return (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Camera, {}), _jsx(Lighting, {}), _jsx(Environment, {}), _jsx(Table, {}), _jsx(Cue, {}), _jsxs("div", { className: "p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-bold text-slate-300 font-display flex items-center gap-2", children: [_jsx("span", { children: "\uD83D\uDD34" }), " Billiard Balls Configuration"] }), _jsx("p", { className: "text-[10px] text-slate-500 font-body mt-1 leading-normal", children: "Active game status. Spherical physical mesh instances will be loaded here dynamically in the next phase." })] }), _jsxs("div", { className: "flex gap-2 justify-start py-2 flex-wrap", children: [_jsx(Ball, { number: 0, color: "#ffffff" }), _jsx(Ball, { number: 8, color: "#0d0d0d" }), _jsx(Ball, { number: 1, color: "#fbbf24" })] })] })] }) }));
};
export default Scene;
