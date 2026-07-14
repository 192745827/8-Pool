import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { registerGameHandlers as registerAuthoritativeGameHandlers } from './game';

export const registerGameHandlers = (io: Server, socket: AuthenticatedSocket): void => {
  registerAuthoritativeGameHandlers(io, socket);
};

export default registerGameHandlers;
