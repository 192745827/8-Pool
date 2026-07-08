import React from 'react';

export const PoolTable: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Green Felt Bed */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.2, 5]} />
        <meshStandardMaterial color="#0e7490" roughness={0.85} metalness={0.15} />
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
    </group>
  );
};

export default PoolTable;
