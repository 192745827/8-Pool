import { NetworkManager } from './network.js';
import { GameController } from './game.js';
import { GAME_STATES } from '../../shared/constants.js';

// DOM elements mapping
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const findMatchBtn = document.getElementById('find-match-btn');
const matchmakingStatus = document.getElementById('matchmaking-status');
const cancelMatchmakingBtn = document.getElementById('cancel-matchmaking-btn');
const onlineCountText = document.getElementById('online-count');

const player1Panel = document.getElementById('player1-panel');
const player1Name = document.getElementById('player1-name');
const player1Type = document.getElementById('player1-type');

const player2Panel = document.getElementById('player2-panel');
const player2Name = document.getElementById('player2-name');
const player2Type = document.getElementById('player2-type');

const gameStatusMsg = document.getElementById('game-status-msg');
const leaveGameBtn = document.getElementById('leave-game-btn');
const poolCanvas = document.getElementById('pool-canvas');

let networkManager = null;
let gameController = null;
let currentOpponentName = 'Opponent';

// Initialize network and tie together actions
function initApp() {
  // Bind network callbacks
  networkManager = new NetworkManager({
    onConnect: () => {
      console.log('Connected to server!');
    },
    
    onDisconnect: () => {
      alert('Disconnected from pool server. Retrying...');
      showScreen('lobby');
    },

    onOnlineStats: (data) => {
      onlineCountText.textContent = `🟢 ${data.onlineCount} Players Online | ${data.activeRooms} Active Matches`;
    },

    onLobbyJoined: (data) => {
      // Username confirmed, start matchmaking search
      networkManager.findMatch();
    },

    onMatchmakingStarted: () => {
      findMatchBtn.disabled = true;
      matchmakingStatus.classList.remove('hidden');
    },

    onMatchmakingCancelled: () => {
      findMatchBtn.disabled = false;
      matchmakingStatus.classList.add('hidden');
    },

    onMatchFound: (matchData) => {
      console.log('Match Found! Starting GameController...', matchData);
      
      // Determine which player in the UI is which
      const myId = networkManager.getSocketId();
      
      // If I am player 1, display player 2 as opponent, and vice versa
      const isPlayer1 = matchData.players.player1.id === myId;
      const me = isPlayer1 ? matchData.players.player1 : matchData.players.player2;
      const opponent = isPlayer1 ? matchData.players.player2 : matchData.players.player1;
      
      currentOpponentName = opponent.name;

      // Update HUD names
      player1Name.textContent = `${me.name} (You)`;
      player2Name.textContent = opponent.name;
      
      player1Type.textContent = 'Undecided';
      player2Type.textContent = 'Undecided';

      // Setup and start local game loop
      if (!gameController) {
        gameController = new GameController(poolCanvas, networkManager);
      }
      gameController.startMatch(matchData);

      // Trigger screen transition
      showScreen('game');
      updateHUD(matchData.gameState);
    },

    onOpponentShot: (shotData) => {
      if (gameController) {
        gameController.handleOpponentShot(shotData);
      }
    },

    onGameStateUpdate: (serverState) => {
      if (gameController) {
        gameController.updateGameState(serverState);
      }
      updateHUD(serverState);
    },

    onOpponentLeft: (data) => {
      alert(`Opponent left the match: ${data.reason}`);
      showScreen('lobby');
    }
  });

  // UI Event Listeners
  findMatchBtn.addEventListener('click', () => {
    let name = usernameInput.value.trim();
    if (!name) name = 'Guest Pooler';
    
    // Set username on server, matching begins when server responds
    networkManager.joinLobby(name);
  });

  cancelMatchmakingBtn.addEventListener('click', () => {
    networkManager.cancelMatchmaking();
  });

  leaveGameBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to forfeit this match?')) {
      networkManager.leaveGame();
      showScreen('lobby');
    }
  });
}

// Switch view screen helper
function showScreen(screenType) {
  if (screenType === 'lobby') {
    gameScreen.classList.remove('active');
    setTimeout(() => {
      gameScreen.style.display = 'none';
      lobbyScreen.style.display = 'flex';
      setTimeout(() => {
        lobbyScreen.classList.add('active');
      }, 50);
    }, 400);

    findMatchBtn.disabled = false;
    matchmakingStatus.classList.add('hidden');
  } else if (screenType === 'game') {
    lobbyScreen.classList.remove('active');
    setTimeout(() => {
      lobbyScreen.style.display = 'none';
      gameScreen.style.display = 'flex';
      setTimeout(() => {
        gameScreen.classList.add('active');
      }, 50);
    }, 400);
  }
}

// Update player assignments, turn active indicators and message headers
function updateHUD(gameState) {
  const myId = networkManager.getSocketId();
  const isP1Turn = (gameState.activePlayerId === myId);

  // 1. Highlight turn panel
  if (isP1Turn) {
    player1Panel.classList.add('active');
    player2Panel.classList.remove('active');
  } else {
    player2Panel.classList.add('active');
    player1Panel.classList.remove('active');
  }

  // 2. Update ball assignments
  const myAssignment = gameState.playerAssignments[myId];
  const opponentId = Object.keys(gameState.playerAssignments).find(id => id !== myId);
  const oppAssignment = opponentId ? gameState.playerAssignments[opponentId] : null;

  player1Type.textContent = myAssignment ? `${myAssignment}s` : 'Undecided';
  player2Type.textContent = oppAssignment ? `${oppAssignment}s` : 'Undecided';

  // 3. Update status message
  if (gameState.gameState === GAME_STATES.GAME_OVER) {
    if (gameState.winnerId === myId) {
      gameStatusMsg.textContent = '🎉 YOU WIN!';
      gameStatusMsg.style.color = 'var(--accent-cyan)';
    } else {
      gameStatusMsg.textContent = '💀 DEFEAT';
      gameStatusMsg.style.color = '#ef4444';
    }
    alert(`Game Over! ${gameState.gameMessage}`);
    setTimeout(() => showScreen('lobby'), 3000);
  } else {
    if (isP1Turn) {
      gameStatusMsg.textContent = gameState.isScratch ? 'BALL-IN-HAND' : 'YOUR TURN';
      gameStatusMsg.style.color = 'var(--accent-cyan)';
    } else {
      gameStatusMsg.textContent = `${currentOpponentName.toUpperCase()}'S TURN`;
      gameStatusMsg.style.color = 'var(--accent-gold)';
    }
  }
}

// Start application
initApp();
