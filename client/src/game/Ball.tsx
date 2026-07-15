import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import BallPhysics from './physics/BallPhysics';

interface BallProps {
  number: number;
  color: string;
  position: [number, number, number];
}

// 1. REUSE GEOMETRY: Shared sphere geometry instantiated once at module scope
const sphereGeometry = new THREE.SphereGeometry(0.18, 32, 32);

// 2. REUSE MATERIALS: Cached material instances mapped by color code
const materialCache: Record<string, THREE.MeshStandardMaterial> = {};

const getBallMaterial = (color: string): THREE.MeshStandardMaterial => {
  if (!materialCache[color]) {
    materialCache[color] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.12,
      metalness: 0.1,
    });
  }
  return materialCache[color];
};

export const Ball = forwardRef<RapierRigidBody, BallProps>(({ number, color, position }, ref) => {
  const ballMaterial = getBallMaterial(color);

  return (
    <BallPhysics 
      ref={ref} 
      position={position}
      userData={{ type: 'ball', ballId: number }}
    >
      {/* Explicitly apply the shared geometry and cached material with frustum culling enabled */}
      <mesh 
        castShadow 
        receiveShadow
        geometry={sphereGeometry}
        material={ballMaterial}
        frustumCulled={true}
      />
    </BallPhysics>
  );
});

Ball.displayName = 'Ball';
export default Ball;
