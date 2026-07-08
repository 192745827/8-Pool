import { Socket } from 'socket.io-client';
declare class SocketService {
    private socket;
    connect(token: string): Socket;
    disconnect(): void;
    getSocket(): Socket | null;
    emit(event: string, data: any): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
}
export declare const socketService: SocketService;
export default socketService;
//# sourceMappingURL=socket.d.ts.map