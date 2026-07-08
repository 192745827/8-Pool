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
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocketServer(io);

server.listen(port, () => {
  console.log(`Pool Multiplayer server listening on port ${port}`);
});
