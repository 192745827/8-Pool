import { io } from 'socket.io-client';

export class NetworkManager {
  /**
   * @param {Object} callbacks - Dictionary of callback functions to map server events to client actions
   */
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.socket = null;
    
    // Auto-detect server URL (assumes server runs on port 3000 in dev)
    const hostname = window.location.hostname;
    const serverUrl = hostname === 'localhost' || hostname === '127.0.0.1' 
      ? `http://${hostname}:3000`
      : window.location.origin; // If deployed together, use same origin
      
    console.log(`Connecting to game server at: ${serverUrl}`);
    
    this.socket = io(serverUrl);
    this.setupListeners();
  }

  setupListeners() {
    // 1. Connection updates
    this.socket.on('connect', () => {
      console.log('Connected to server. Socket ID:', this.socket.id);
      if (this.callbacks.onConnect) this.callbacks.onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      if (this.callbacks.onDisconnect) this.callbacks.onDisconnect();
    });

    // 2. Lobby & Stats
    this.socket.on('online-stats', (data) => {
      if (this.callbacks.onOnlineStats) this.callbacks.onOnlineStats(data);
    });

    this.socket.on('lobby-joined', (data) => {
      if (this.callbacks.onLobbyJoined) this.callbacks.onLobbyJoined(data);
    });

    // 3. Matchmaking
    this.socket.on('matchmaking-started', () => {
      if (this.callbacks.onMatchmakingStarted) this.callbacks.onMatchmakingStarted();
    });

    this.socket.on('matchmaking-cancelled', () => {
      if (this.callbacks.onMatchmakingCancelled) this.callbacks.onMatchmakingCancelled();
    });

    this.socket.on('match-found', (data) => {
      console.log('Match found! Room ID:', data.roomId);
      if (this.callbacks.onMatchFound) this.callbacks.onMatchFound(data);
    });

    // 4. In-Game events
    this.socket.on('opponent-shot', (data) => {
      console.log('Opponent shot received:', data);
      if (this.callbacks.onOpponentShot) this.callbacks.onOpponentShot(data);
    });

    this.socket.on('game-state-update', (data) => {
      console.log('Game state sync received from server:', data.gameMessage);
      if (this.callbacks.onGameStateUpdate) this.callbacks.onGameStateUpdate(data);
    });

    this.socket.on('opponent-left', (data) => {
      if (this.callbacks.onOpponentLeft) this.callbacks.onOpponentLeft(data);
    });

    this.socket.on('error-msg', (data) => {
      alert(`Server Error: ${data.message}`);
    });
  }

  // Emitters
  joinLobby(username) {
    this.socket.emit('join-lobby', { username });
  }

  findMatch() {
    this.socket.emit('find-match');
  }

  cancelMatchmaking() {
    this.socket.emit('cancel-matchmaking');
  }

  shoot(angle, power) {
    this.socket.emit('shoot', { angle, power });
  }

  syncTurnResult(balls, pocketedThisTurn) {
    this.socket.emit('sync-turn-result', { balls, pocketedThisTurn });
  }

  leaveGame() {
    this.socket.emit('leave-game');
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}
