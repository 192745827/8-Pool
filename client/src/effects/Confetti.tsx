import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CONFETTI_COUNT = 150;
const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#06b6d4', '#f97316'];

// Deterministic pseudorandom number generator (LCG) to satisfy React purity rules
let lcgSeed = 42;
const nextRandom = (): number => {
  lcgSeed = (lcgSeed * 9301 + 49297) % 233280;
  return lcgSeed / 233280;
};

export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      data.push({
        position: new THREE.Vector3(
          (nextRandom() - 0.5) * 12,
          5 + nextRandom() * 5,
          (nextRandom() - 0.5) * 6
        ),
        velocity: new THREE.Vector3(
          (nextRandom() - 0.5) * 1.5,
          -1.5 - nextRandom() * 2,
          (nextRandom() - 0.5) * 1.5
        ),
        rotation: new THREE.Vector3(
          nextRandom() * Math.PI,
          nextRandom() * Math.PI,
          nextRandom() * Math.PI
        ),
        rotationSpeed: new THREE.Vector3(
          nextRandom() * 4,
          nextRandom() * 4,
          nextRandom() * 4
        ),
        color: new THREE.Color(COLORS[Math.floor(nextRandom() * COLORS.length)]),
        scale: 0.05 + nextRandom() * 0.08,
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();
    
    particles.forEach((p, idx) => {
      if (active) {
        p.position.addScaledVector(p.velocity, delta);
        p.rotation.x += p.rotationSpeed.x * delta;
        p.rotation.y += p.rotationSpeed.y * delta;
        p.rotation.z += p.rotationSpeed.z * delta;

        // Respawn above table on ground fall
        if (p.position.y < -2) {
          p.position.y = 5 + nextRandom() * 3;
          p.position.x = (nextRandom() - 0.5) * 12;
          p.position.z = (nextRandom() - 0.5) * 6;
        }
      } else {
        p.position.y = -100; // Park out of sight
      }

      tempObject.position.copy(p.position);
      tempObject.rotation.setFromVector3(p.rotation);
      tempObject.scale.set(p.scale, p.scale * 0.5, p.scale);
      tempObject.updateMatrix();

      meshRef.current!.setMatrixAt(idx, tempObject.matrix);
      meshRef.current!.setColorAt(idx, p.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONFETTI_COUNT]}
      castShadow
    />
  );
};

export default Confetti;
