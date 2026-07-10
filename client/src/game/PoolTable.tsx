import React from 'react';

export const PoolTable: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Green Felt Bed */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.2, 5]} />
        <meshStandardMaterial color="#0e7490" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* Pockets */}
      {/* Top-Left Corner */}
      <mesh position={[-4.8, 0.11, -2.3]}>
        <cylinderGeometry args={[0.26, 0.26, 0.01, 24]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      {/* Top-Right Corner */}
      <mesh position={[4.8, 0.11, -2.3]}>
        <cylinderGeometry args={[0.26, 0.26, 0.01, 24]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      {/* Bottom-Left Corner */}
      <mesh position={[-4.8, 0.11, 2.3]}>
        <cylinderGeometry args={[0.26, 0.26, 0.01, 24]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      {/* Bottom-Right Corner */}
      <mesh position={[4.8, 0.11, 2.3]}>
        <cylinderGeometry args={[0.26, 0.26, 0.01, 24]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      {/* Top-Middle */}
      <mesh position={[0, 0.11, -2.4]}>
        <cylinderGeometry args={[0.24, 0.24, 0.01, 24]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      {/* Bottom-Middle */}
      <mesh position={[0, 0.11, 2.4]}>
        <cylinderGeometry args={[0.24, 0.24, 0.01, 24]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Wooden Rails (borders) */}
      {/* Top Rail */}
      <mesh castShadow receiveShadow position={[0, 0.2, -2.7]}>
        <boxGeometry args={[10.8, 0.4, 0.4]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>
      {/* Bottom Rail */}
      <mesh castShadow receiveShadow position={[0, 0.2, 2.7]}>
        <boxGeometry args={[10.8, 0.4, 0.4]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>
      {/* Left Rail */}
      <mesh castShadow receiveShadow position={[-5.2, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 5.8]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>
      {/* Right Rail */}
      <mesh castShadow receiveShadow position={[5.2, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 5.8]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>

      {/* Table Legs (extending down to Y=-3) */}
      {/* Top-Left Leg */}
      <mesh castShadow receiveShadow position={[-4.8, -1.5, -2.3]}>
        <boxGeometry args={[0.5, 3.0, 0.5]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>
      {/* Top-Right Leg */}
      <mesh castShadow receiveShadow position={[4.8, -1.5, -2.3]}>
        <boxGeometry args={[0.5, 3.0, 0.5]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>
      {/* Bottom-Left Leg */}
      <mesh castShadow receiveShadow position={[-4.8, -1.5, 2.3]}>
        <boxGeometry args={[0.5, 3.0, 0.5]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>
      {/* Bottom-Right Leg */}
      <mesh castShadow receiveShadow position={[4.8, -1.5, 2.3]}>
        <boxGeometry args={[0.5, 3.0, 0.5]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.4} />
      </mesh>
    </group>
  );
};

export default PoolTable;
