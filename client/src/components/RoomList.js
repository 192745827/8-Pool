import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import RoomCard from './RoomCard';
export const RoomList = ({ rooms, onJoin, joiningRoomId = null, onRefresh, }) => {
    if (rooms.length === 0) {
        return (_jsxs("div", { className: "p-8 text-center bg-slate-900/40 border border-white/5 rounded-2xl", children: [_jsx("span", { className: "text-3xl block mb-3 select-none", children: "\uD83D\uDD73\uFE0F" }), _jsx("h4", { className: "text-sm font-bold font-display text-white", children: "No Public Rooms Available" }), _jsx("p", { className: "text-xs text-slate-500 font-body mt-2 leading-relaxed max-w-[260px] mx-auto", children: "All rooms are currently full or set to private. Create your own room to start!" }), onRefresh && (_jsx("button", { onClick: onRefresh, className: "mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition duration-300 font-display", children: "\uD83D\uDD04 Refresh List" }))] }));
    }
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: rooms.map((room) => (_jsx(RoomCard, { room: room, onJoin: onJoin, isJoining: joiningRoomId === room.roomId }, room.roomId))) }));
};
export default RoomList;
