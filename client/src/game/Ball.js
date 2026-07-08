import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Ball = ({ number, color }) => {
    return (_jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-white/5 rounded-lg", children: [_jsx("span", { className: "text-[10px]", style: { color }, children: "\u25CF" }), _jsxs("span", { className: "text-[9px] font-bold text-slate-300 font-display", children: ["Ball #", number] })] }));
};
export default Ball;
