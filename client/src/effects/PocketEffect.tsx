import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PocketEffectProps {
  x: number;
  y: number;
  z: number;
  color: string;
  onComplete: () => void;
}

const PARTICLE_COUNT = 24;

// Deterministic pseudorandom number generator (LCG) to satisfy React purity rules
let lcgSeed = 100;
const nextRandom = (): number => {
  lcgSeed = (lcgSeed * 9301 + 49297) % 233280;
  return lcgSeed / 233280;
};

export const PocketEffect: React.FC<PocketEffectProps> = ({ x, y, z, color, onComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ageRef = useRef(0);
  const duration = 0.5; // 500ms duration

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const speed = 1.0 + nextRandom() * 1.5;
      data.push({
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          1.5 + nextRandom() * 2.0, // Spray upwards
          Math.sin(angle) * speed
        ),
        position: new THREE.Vector3(0, 0, 0),
        scale: 0.04 + nextRandom() * 0.04,
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    ageRef.current += delta;
    if (ageRef.current >= duration) {
      onComplete();
      return;
    }

    const t = ageRef.current / duration; // 0 to 1

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, idx) => {
        const p = particles[idx];
        if (p) {
          // Explode position
          p.position.addScaledVector(p.velocity, delta);
          // Apply gravity drag
          p.velocity.y -= 9.8 * delta;

          mesh.position.copy(p.position);
          
          // Fade shrink scale
          const s = Math.max(0.001, p.scale * (1 - t));
          mesh.scale.set(s, s, s);
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {particles.map((_, idx) => (
        <mesh key={idx}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

export default PocketEffect;
