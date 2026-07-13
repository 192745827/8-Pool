import React, { forwardRef } from 'react';
import * as THREE from 'three';

export const CueStick = forwardRef<THREE.Group>((_, ref) => {
  return (
    <group ref={ref} visible={false}>
      {/* Inner group representing physical stick offset and shot pullback */}
      <group position={[0, 0, 0.22]}>
        {/* Wood Shaft */}
        <mesh castShadow position={[0, 0, 1.85]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 3.5, 12]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Tip */}
        <mesh castShadow position={[0, 0, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
});

CueStick.displayName = 'CueStick';
export default CueStick;
