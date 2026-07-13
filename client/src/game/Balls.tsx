import React from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import Ball from './Ball';
import { PhysicsConstants } from './physics/PhysicsConstants';

interface BallsProps {
  activeBalls: number[];
  cueBallRef: React.RefObject<RapierRigidBody | null>;
  ballRefs: React.MutableRefObject<Map<number, RapierRigidBody>>;
}

const BALL_CONFIGS = [
  { number: 0, color: '#ffffff', position: PhysicsConstants.CUE_BALL_SPAWN },
  { number: 1, color: '#eab308', position: [1.5, 0.28, 0] as [number, number, number] },
  { number: 9, color: '#fef08a', position: [1.812, 0.28, -0.18] as [number, number, number] },
  { number: 2, color: '#2563eb', position: [1.812, 0.28, 0.18] as [number, number, number] },
  { number: 10, color: '#60a5fa', position: [2.124, 0.28, -0.36] as [number, number, number] },
  { number: 8, color: '#111111', position: [2.124, 0.28, 0] as [number, number, number] },
  { number: 3, color: '#dc2626', position: [2.124, 0.28, 0.36] as [number, number, number] },
  { number: 11, color: '#f87171', position: [2.436, 0.28, -0.54] as [number, number, number] },
  { number: 4, color: '#9333ea', position: [2.436, 0.28, -0.18] as [number, number, number] },
  { number: 12, color: '#c084fc', position: [2.436, 0.28, 0.18] as [number, number, number] },
  { number: 5, color: '#ea580c', position: [2.436, 0.28, 0.54] as [number, number, number] },
  { number: 7, color: '#7f1d1d', position: [2.748, 0.28, -0.72] as [number, number, number] },
  { number: 6, color: '#16a34a', position: [2.748, 0.28, -0.36] as [number, number, number] },
  { number: 14, color: '#4ade80', position: [2.748, 0.28, 0] as [number, number, number] },
  { number: 13, color: '#fdba74', position: [2.748, 0.28, 0.36] as [number, number, number] },
  { number: 15, color: '#fda4af', position: [2.748, 0.28, 0.72] as [number, number, number] },
];

export const Balls: React.FC<BallsProps> = ({ activeBalls, cueBallRef, ballRefs }) => {
  return (
    <group>
      {BALL_CONFIGS.map((config) => {
        if (!activeBalls.includes(config.number)) return null;
        
        return (
          <Ball
            key={config.number}
            number={config.number}
            color={config.color}
            position={config.position}
            ref={(node) => {
              if (config.number === 0) {
                // Assign to cueBallRef
                (cueBallRef as any).current = node;
              } else {
                // Assign to ballRefs map
                if (node) {
                  ballRefs.current.set(config.number, node);
                } else {
                  ballRefs.current.delete(config.number);
                }
              }
            }}
          />
        );
      })}
    </group>
  );
};

export default Balls;
