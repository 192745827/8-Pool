import React, { forwardRef } from 'react';
import * as THREE from 'three';

export const AimLine = forwardRef<THREE.Group>((_, ref) => {
  return (
    <group ref={ref} visible={false}>
      {/* 1. Primary Aim Line (Thin box) */}
      <mesh name="primaryLine">
        <boxGeometry args={[0.012, 0.001, 1]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
      </mesh>

      {/* 2. Ghost Ball representation at contact point */}
      <mesh name="ghostBall">
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25} wireframe />
      </mesh>

      {/* 3. Target Ball Path line */}
      <mesh name="targetLine">
        <boxGeometry args={[0.01, 0.001, 1]} />
        <meshBasicMaterial color="#bd00ff" transparent opacity={0.5} />
      </mesh>

      {/* 4. Cue Ball Deflection line */}
      <mesh name="deflectionLine">
        <boxGeometry args={[0.01, 0.001, 1]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
});

AimLine.displayName = 'AimLine';
export default AimLine;
