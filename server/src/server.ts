import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { connectDB } from './config/db';
import { initSocketServer } from './socket';

const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.CORS_ORIGIN || 'http://localhost:5173') 
      : (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocketServer(io);

server.listen(Number(port), '0.0.0.0', () => {
  console.log(`Pool Multiplayer server listening on port ${port} (LAN accessible)`);
});
