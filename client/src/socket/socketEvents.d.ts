export declare const SOCKET_EVENTS: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly CREATE_ROOM: "create-room";
    readonly JOIN_ROOM: "join-room";
    readonly LEAVE_ROOM: "leave-room";
    readonly ROOM_CREATED: "room-created";
    readonly ROOM_UPDATED: "room-updated";
    readonly ROOM_ENDED: "room-ended";
    readonly ROOM_ERROR: "room-error";
    readonly PLAYER_READY: "player-ready";
    readonly PLAYER_NOT_READY: "player-not-ready";
    readonly SEND_MESSAGE: "send-message";
    readonly RECEIVE_MESSAGE: "receive-message";
    readonly START_GAME: "start-game";
};
export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
//# sourceMappingURL=socketEvents.d.ts.map