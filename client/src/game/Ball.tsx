import React from 'react';

interface BallProps {
  number: number;
  color: string;
  position: [number, number, number];
}

export const Ball: React.FC<BallProps> = ({ number, color, position }) => {
  return (
    <mesh castShadow receiveShadow position={position}>
      <sphereGeometry args={[0.18, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.12} metalness={0.1} />
    </mesh>
  );
};

export default Ball;
