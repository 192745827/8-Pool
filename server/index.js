import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { handleConnection } from './src/lobby.js';

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'OK', uptime: process.uptime() });
});

const httpServer = createServer(app);

// Set up Socket.io with CORS allowed for local dev
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For local dev, allow any origin. In production, restrict to client URL.
    methods: ['GET', 'POST']
  }
});

// Pass socket connection to Lobby manager
io.on('connection', (socket) => {
  handleConnection(io, socket);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Pool multiplayer server running on port ${PORT}`);
});
