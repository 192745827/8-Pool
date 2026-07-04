import { updatePhysicsStep, areBallsStationary, initialize8BallRack } from '../../shared/physics.js';
import { TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS, GAME_STATES } from '../../shared/constants.js';
import { CanvasRenderer } from './canvas.js';
import { InputHandler } from './input.js';

// Synthesized Sound Effects using Web Audio API (No files required!)
class SoundSynthesizer {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playCollision(intensity = 1) {
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Billiards ball sharp 'clack' - triangle wave + quick frequency sweep
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.02);

    const vol = Math.min(0.4, 0.1 + (intensity * 0.3)); // scale sound based on hit power
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playCushion(intensity = 1) {
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Low-frequency cushion thud - sine wave
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

    const vol = Math.min(0.5, 0.15 + (intensity * 0.02)); // scale sound
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playPocket() {
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Pocket sink - slide down in pitch with a muffled texture
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.22);
  }
}

export class GameController {
  constructor(canvas, network) {
    this.canvas = canvas;
    this.network = network;

    this.renderer = new CanvasRenderer(canvas);
    this.sound = new SoundSynthesizer();

    // Local Game State Variables
    this.balls = initialize8BallRack();
    this.gameState = GAME_STATES.LOBBY;
    this.activePlayerId = null;
    this.playerAssignments = {};
    
    this.myTurn = false;
    this.isBallInHand = false; // Player can place the cue ball anywhere
    
    // Simulation state
    this.isSimulating = false;
    this.accumulator = 0;
    this.lastTime = 0;
    this.pocketedThisTurn = [];

    // Shot callback bindings
    this.inputHandler = new InputHandler(
      canvas, 
      (angle, power) => this.handleLocalShot(angle, power),
      (x, y) => this.handleCueBallDrag(x, y)
    );

    // Start game rendering loop
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  /**
   * Called when matchmaking pairs us up
   */
  startMatch(matchData) {
    this.balls = matchData.gameState.balls;
    this.activePlayerId = matchData.gameState.activePlayerId;
    this.playerAssignments = matchData.gameState.playerAssignments;
    this.gameState = matchData.gameState.gameState;
    
    this.syncTurnState();
  }

  /**
   * Sync active turn parameters (is it my turn? is it ball-in-hand?)
   */
  syncTurnState() {
    const myId = this.network.getSocketId();
    this.myTurn = (this.activePlayerId === myId);
    
    // Ball-In-Hand criteria: cue ball is at reset or flagged by server scratch
    const cueBall = this.balls.find(b => b.id === 0);
    this.isBallInHand = this.myTurn && (cueBall && cueBall.x === 200 && cueBall.y === 200);

    // Let the input handler know
    this.inputHandler.updateState(cueBall, this.myTurn, this.isBallInHand, this.balls);
  }

  /**
   * Sync official state update from server (e.g. after turn completes or opponent disconnects)
   */
  updateGameState(serverState) {
    this.balls = serverState.balls;
    this.activePlayerId = serverState.activePlayerId;
    this.playerAssignments = serverState.playerAssignments;
    this.gameState = serverState.gameState;
    
    this.isSimulating = false;
    this.pocketedThisTurn = [];

    this.syncTurnState();
  }

  handleCueBallDrag(x, y) {
    const cueBall = this.balls.find(b => b.id === 0);
    if (cueBall) {
      cueBall.x = x;
      cueBall.y = y;
    }
  }

  /**
   * Triggered when this client shoots
   */
  handleLocalShot(angle, power) {
    const cueBall = this.balls.find(b => b.id === 0);
    if (!cueBall) return;

    // Play synthesized collision sounds to unlock audio context
    this.sound.init();

    // Send shot to server
    this.network.shoot(angle, power, { x: cueBall.x, y: cueBall.y });

    // Apply impulse locally
    // Max shot speed: 450 units/s
    const maxVelocity = 480;
    cueBall.vx = Math.cos(angle) * power * maxVelocity;
    cueBall.vy = Math.sin(angle) * power * maxVelocity;

    this.isSimulating = true;
    this.gameState = GAME_STATES.SHOOTING;
    this.pocketedThisTurn = [];
    
    this.syncTurnState();
  }

  /**
   * Triggered when the opponent shoots
   */
  handleOpponentShot(shotData) {
    const cueBall = this.balls.find(b => b.id === 0);
    if (!cueBall) return;

    // Make sure starting positions are perfectly synchronized
    if (shotData.cueBall) {
      cueBall.x = shotData.cueBall.x;
      cueBall.y = shotData.cueBall.y;
    }

    const maxVelocity = 480;
    cueBall.vx = Math.cos(shotData.angle) * shotData.power * maxVelocity;
    cueBall.vy = Math.sin(shotData.angle) * shotData.power * maxVelocity;

    this.isSimulating = true;
    this.gameState = GAME_STATES.SHOOTING;
    this.pocketedThisTurn = [];
    
    this.syncTurnState();
  }

  /**
   * Local physics loop callback when a ball is pocketed
   */
  onBallPocketed(ball, pocketId) {
    console.log(`Ball pocketed: id=${ball.id}, type=${ball.type}`);
    this.pocketedThisTurn.push(ball.id);
    this.sound.playPocket();
  }

  /**
   * Local physics loop callback when a bounce occurs (play audio)
   */
  onCollision(type, intensity) {
    // Normalise intensity values for synthesized volume levels
    const vol = Math.min(1, intensity / 200);
    if (type === 'ball') {
      this.sound.playCollision(vol);
    } else if (type === 'cushion') {
      this.sound.playCushion(vol);
    }
  }

  /**
   * Main game rendering and physics ticking loop
   */
  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const elapsedSeconds = Math.min(0.1, (timestamp - this.lastTime) / 1000); // capped at 100ms
    this.lastTime = timestamp;

    if (this.isSimulating) {
      // Run fixed timestep 60Hz physics (0.016s per tick) to ensure determinism
      const timestep = 0.016;
      this.accumulator += elapsedSeconds;

      while (this.accumulator >= timestep) {
        updatePhysicsStep(
          this.balls, 
          timestep, 
          (ball, pId) => this.onBallPocketed(ball, pId),
          (type, intensity) => this.onCollision(type, intensity)
        );
        this.accumulator -= timestep;
      }

      // Check if all balls stopped moving
      if (areBallsStationary(this.balls)) {
        this.isSimulating = false;
        this.accumulator = 0;
        console.log(`Simulation stopped. Pocketed this turn:`, this.pocketedThisTurn);
        
        // If we were the player who shot, report the outcome to the server
        if (this.myTurn) {
          this.gameState = GAME_STATES.SYNCING;
          this.network.syncTurnResult(this.balls, this.pocketedThisTurn);
        }
      }
    }

    // Render Table and HUD elements
    const cueBall = this.balls.find(b => b.id === 0);
    const isAimingState = (this.gameState === GAME_STATES.AIMING && !this.isSimulating);

    this.renderer.draw(
      this.balls,
      cueBall,
      isAimingState,
      this.inputHandler.angle,
      this.inputHandler.power,
      this.myTurn,
      this.isBallInHand
    );

    // Continue loop
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}
