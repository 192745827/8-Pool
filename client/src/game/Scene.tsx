import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import Lights from './Lights';
import Environment from './Environment';
import PoolTable from './PoolTable';
import { CameraController, CueController, PowerMeter } from './cue';
import Balls from './Balls';
import { PhysicsWorld, TablePhysics, PocketSensor } from './physics';
import { PhysicsConstants } from './physics/PhysicsConstants';
import { GameManager, MatchState, INITIAL_MATCH_STATE } from './rules';
import { collisionManager } from './physics/CollisionManager';

// Sub-component to monitor ball movement and reset turns on each physics frame
const TurnController: React.FC<{
  cueBallRef: React.RefObject<RapierRigidBody | null>;
  ballRefs: React.MutableRefObject<Map<number, RapierRigidBody>>;
  turnState: 'idle' | 'aiming' | 'charging' | 'shooting' | 'balls-moving';
  setTurnState: (state: 'idle' | 'aiming' | 'charging' | 'shooting' | 'balls-moving') => void;
  cueBallScratched: boolean;
  respawnCueBall: () => void;
  gameManager: GameManager;
  activeBalls: number[];
}> = ({ cueBallRef, ballRefs, turnState, setTurnState, cueBallScratched, respawnCueBall, gameManager, activeBalls }) => {
  useFrame(() => {
    if (turnState !== 'balls-moving') return;

    let anyBallMoving = false;

    // Check cue ball linear velocity
    if (cueBallRef.current) {
      const v = cueBallRef.current.linvel();
      const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      if (speed > 0.02) {
        anyBallMoving = true;
      }
    }

    // Check object balls linear velocity
    if (!anyBallMoving) {
      for (const body of ballRefs.current.values()) {
        const v = body.linvel();
        const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        if (speed > 0.02) {
          anyBallMoving = true;
          break;
        }
      }
    }

    // When all balls stop rolling, conclude the turn
    if (!anyBallMoving) {
      const nextState = gameManager.endShotSimulation(activeBalls, cueBallScratched);
      if (nextState.status !== 'game-over') {
        if (cueBallScratched) {
          respawnCueBall();
        } else {
          setTurnState('idle');
        }
      }
    }
  });

  return null;
};

// HUD Colors mapped for remaining balls indicator
const HUD_BALL_COLORS: Record<number, string> = {
  1: '#eab308', 2: '#2563eb', 3: '#dc2626', 4: '#9333ea', 5: '#ea580c',
  6: '#16a34a', 7: '#7f1d1d', 8: '#111111', 9: '#fef08a', 10: '#60a5fa',
  11: '#f87171', 12: '#c084fc', 13: '#fdba74', 14: '#4ade80', 15: '#fda4af',
};

export const Scene: React.FC = () => {
  const [activeBalls, setActiveBalls] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
  ]);
  const [turnState, setTurnState] = useState<'idle' | 'aiming' | 'charging' | 'shooting' | 'balls-moving'>('idle');
  const [power, setPower] = useState<number>(0);
  const [cueBallScratched, setCueBallScratched] = useState<boolean>(false);

  const cueBallRef = useRef<RapierRigidBody | null>(null);
  const ballRefs = useRef<Map<number, RapierRigidBody>>(new Map());

  const gameManagerRef = useRef<GameManager>(new GameManager({
    ...INITIAL_MATCH_STATE,
    status: 'break'
  }));
  const [matchState, setMatchState] = useState<MatchState>(gameManagerRef.current.getState());

  useEffect(() => {
    const gm = gameManagerRef.current;
    gm.onStateChange = (nextState) => {
      setMatchState(nextState);
    };

    // Connect Rapier physics collisions to GameManager rule metrics
    collisionManager.onCollisionEvent = (ballId1, ballId2) => {
      if (ballId2 === 'cushion') {
        gm.recordCushionCollision(ballId1);
      } else {
        gm.recordBallCollision(ballId1, ballId2);
      }
    };

    return () => {
      collisionManager.onCollisionEvent = undefined;
      gm.onStateChange = undefined;
    };
  }, []);

  // Handle pocket collisions from sensor
  const handleBallPocketed = (ballId: number, pocketId: string) => {
    gameManagerRef.current.recordBallPocketed(ballId);

    if (ballId === 0) {
      if (!cueBallScratched) {
        setCueBallScratched(true);
        // Safely move cue ball out of sight & zero velocities
        if (cueBallRef.current) {
          cueBallRef.current.setTranslation({ x: 0, y: -10, z: 0 }, true);
          cueBallRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          cueBallRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
      }
    } else {
      // Remove object ball from play list
      setActiveBalls((prev) => prev.filter((id) => id !== ballId));
    }
  };

  // Reset cue ball back to starting spot
  const respawnCueBall = () => {
    if (cueBallRef.current) {
      cueBallRef.current.setTranslation(
        { x: PhysicsConstants.CUE_BALL_SPAWN[0], y: PhysicsConstants.CUE_BALL_SPAWN[1], z: PhysicsConstants.CUE_BALL_SPAWN[2] },
        true
      );
      cueBallRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      cueBallRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      setCueBallScratched(false);
      setTurnState('idle');
    }
  };

  // Restart match logic
  const handleRestart = () => {
    setActiveBalls([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    setCueBallScratched(false);
    setTurnState('idle');
    setPower(0);

    gameManagerRef.current.resetGame({
      ...INITIAL_MATCH_STATE,
      status: 'break'
    });
    
    if (cueBallRef.current) {
      cueBallRef.current.setTranslation(
        { x: PhysicsConstants.CUE_BALL_SPAWN[0], y: PhysicsConstants.CUE_BALL_SPAWN[1], z: PhysicsConstants.CUE_BALL_SPAWN[2] },
        true
      );
      cueBallRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      cueBallRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  };

  const handleConfirmPlacement = () => {
    gameManagerRef.current.resetBallInHand();
  };

  const isGameOver = matchState.status === 'game-over';

  return (
    <div 
      className="w-full aspect-[2/1] bg-slate-950 border-4 border-amber-900 rounded-3xl relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D Canvas rendering the environment, physics, and gameplay entities */}
      <Canvas shadows={{ type: THREE.PCFSoftShadowMap }}>
        <CameraController cueBallRef={cueBallRef} />
        <Lights />
        <Environment />
        <PhysicsWorld>
          <PoolTable />
          <TablePhysics />
          <PocketSensor onBallPocketed={handleBallPocketed} />
          <Balls 
            activeBalls={activeBalls} 
            cueBallRef={cueBallRef} 
            ballRefs={ballRefs} 
          />
          <TurnController
            cueBallRef={cueBallRef}
            ballRefs={ballRefs}
            turnState={turnState}
            setTurnState={setTurnState}
            cueBallScratched={cueBallScratched}
            respawnCueBall={respawnCueBall}
            gameManager={gameManagerRef.current}
            activeBalls={activeBalls}
          />
        </PhysicsWorld>
        <CueController
          cueBallRef={cueBallRef}
          turnState={turnState}
          setTurnState={setTurnState}
          power={power}
          setPower={setPower}
          gameManager={gameManagerRef.current}
        />
      </Canvas>

      {/* ─── MODERN NEON GLOWING HUD OVERLAYS ─── */}

      {/* 1. Turn State & Active Player Badges */}
      <div className="absolute top-4 left-4 flex gap-2 items-center pointer-events-none select-none">
        {/* Turn State (Aiming, Simulating, etc) */}
        <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full shadow border transition-all duration-300 ${
          turnState === 'idle'
            ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            : turnState === 'aiming' 
            ? 'bg-pool-cyan/10 text-pool-cyan border-pool-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.15)] animate-pulse'
            : turnState === 'charging'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)] animate-pulse'
            : turnState === 'shooting'
            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          {turnState === 'idle' 
            ? '● IDLE' 
            : turnState === 'aiming' 
            ? '● AIMING' 
            : turnState === 'charging' 
            ? '● CHARGING' 
            : turnState === 'shooting' 
            ? '● STRIKING' 
            : '○ SIMULATING'}
        </span>

        {/* Active Player Indicator */}
        <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full shadow border transition-all duration-300 ${
          matchState.activePlayer === 'host'
            ? 'bg-pool-cyan/15 text-pool-cyan border-pool-cyan/30 shadow-[0_0_8px_rgba(0,240,255,0.1)]'
            : 'bg-pool-purple/15 text-pool-purple border-pool-purple/30 shadow-[0_0_8px_rgba(147,51,234,0.1)]'
        }`}>
          👤 {matchState.activePlayer === 'host' ? 'HOST\'S TURN' : 'GUEST\'S TURN'}
        </span>

        {/* Ball Group Assignments */}
        <span className="px-3 py-1 text-[10px] font-bold text-slate-400 bg-slate-900/60 backdrop-blur border border-white/5 rounded-full">
          HOST: <span className={matchState.hostGroup === 'solids' ? 'text-amber-400 font-extrabold' : matchState.hostGroup === 'stripes' ? 'text-purple-400 font-extrabold' : 'text-slate-500'}>
            {matchState.hostGroup === 'none' ? 'OPEN' : matchState.hostGroup.toUpperCase()}
          </span>
          <span className="mx-1.5 text-white/10">|</span>
          GUEST: <span className={matchState.guestGroup === 'solids' ? 'text-amber-400 font-extrabold' : matchState.guestGroup === 'stripes' ? 'text-purple-400 font-extrabold' : 'text-slate-500'}>
            {matchState.guestGroup === 'none' ? 'OPEN' : matchState.guestGroup.toUpperCase()}
          </span>
        </span>
      </div>

      {/* 2. Foul Notification Banner */}
      {matchState.foulOccurred && (
        <div className="absolute top-16 left-4 bg-rose-500/90 backdrop-blur-md border border-rose-400 rounded-xl px-4 py-2 flex items-center gap-3 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse select-none pointer-events-none">
          <span className="text-sm">⚠️</span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-wider text-rose-200">FOUL COMMITTED</span>
            <span>{matchState.foulReason || 'Illegal shot'}</span>
          </div>
        </div>
      )}

      {/* 3. Remaining Object Balls Rack */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 pointer-events-none select-none shadow-md">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">RACK:</span>
        <div className="flex gap-1">
          {Object.keys(HUD_BALL_COLORS).map((numStr) => {
            const num = parseInt(numStr);
            const isActive = activeBalls.includes(num);
            const color = HUD_BALL_COLORS[num];
            const isStripe = num > 8;

            return (
              <div 
                key={num}
                className={`w-3.5 h-3.5 rounded-full relative flex items-center justify-center text-[7px] font-bold border transition-all duration-300 ${
                  isActive 
                    ? 'border-white/20 opacity-100 scale-100 shadow-[inset_0_1px_3px_rgba(255,255,255,0.3)]' 
                    : 'border-white/5 opacity-25 scale-75 line-through'
                }`}
                style={{
                  backgroundColor: color,
                  color: num === 8 || num === 7 ? '#ffffff' : '#000000',
                  boxShadow: isActive ? `0 0 4px ${color}44` : 'none',
                }}
              >
                {/* Visual striping indicator */}
                {isActive && isStripe && (
                  <div className="absolute inset-0 bg-white/40 h-1/2 top-1/4 pointer-events-none z-0" />
                )}
                <span className="relative z-10">{num}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Pullback Drag Power Bar */}
      <PowerMeter power={power} visible={turnState === 'idle' || turnState === 'aiming' || turnState === 'charging'} />

      {/* 5. Controls Tip Banner */}
      {matchState.ballInHand ? (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur border border-amber-500/35 rounded-full flex gap-2 text-[10px] font-bold text-amber-300 shadow-md select-none pointer-events-none animate-pulse">
          <span>🎯 Ball in Hand: Left-Click & Drag Cue Ball to place anywhere on the table</span>
        </div>
      ) : (
        (turnState === 'idle' || turnState === 'aiming') && power === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/70 backdrop-blur border border-white/5 rounded-full flex gap-3 text-[10px] font-bold text-slate-300 shadow-md select-none pointer-events-none">
            <span>🖱️ Left-Click & Drag to Pullback</span>
            <span className="text-white/20">|</span>
            <span>🔄 Right-Click & Drag to Orbit Camera</span>
          </div>
        )
      )}

      {/* 6. Ball-in-Hand Confirmation HUD Button */}
      {matchState.ballInHand && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none z-20">
          <button
            onClick={handleConfirmPlacement}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer shadow-emerald-500/25"
          >
            Confirm Placement ✓
          </button>
        </div>
      )}

      {/* 7. Game Over / Victory Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="text-center p-8 bg-slate-900/80 border border-pool-cyan/20 rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.15)] max-w-sm w-full mx-4">
            <span className="text-6xl animate-bounce block mb-4">🏆</span>
            <h2 className="text-3xl font-black font-display text-white tracking-widest uppercase bg-gradient-to-r from-pool-cyan to-pool-purple bg-clip-text text-transparent">
              {matchState.winner === 'host' ? 'HOST WINS!' : 'GUEST WINS!'}
            </h2>
            <p className="text-xs text-slate-400 font-body mt-2 leading-relaxed">
              {matchState.foulReason || 'Congratulations! Pockets cleared and game successfully won.'}
            </p>
            <button
              onClick={handleRestart}
              className="mt-6 w-full py-3 bg-gradient-to-r from-pool-cyan to-pool-cyan/85 hover:brightness-110 text-pool-dark font-display font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer shadow-pool-cyan/25"
            >
              Play Again 🎱
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scene;
