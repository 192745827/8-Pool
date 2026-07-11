import React, { forwardRef } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import BallPhysics from './physics/BallPhysics';

interface BallProps {
  number: number;
  color: string;
  position: [number, number, number];
}

export const Ball = forwardRef<RapierRigidBody, BallProps>(({ number, color, position }, ref) => {
  return (
    <BallPhysics 
      ref={ref} 
      position={position}
      userData={{ type: 'ball', ballId: number }}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.12} metalness={0.1} />
      </mesh>
    </BallPhysics>
  );
});

Ball.displayName = 'Ball';
export default Ball;
