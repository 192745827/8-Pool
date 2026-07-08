import React from 'react';

export const CueStick: React.FC = () => {
  return (
    <group position={[-2, 0.4, 0.8]} rotation={[0.3, -0.6, 0]}>
      {/* Wood Shaft */}
      <mesh castShadow>
        <cylinderGeometry args={[0.03, 0.06, 3.5, 12]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      {/* Tip */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
    </group>
  );
};

export default CueStick;
