import React from 'react';
import Ball from './Ball';

export const Balls: React.FC = () => {
  return (
    <group>
      {/* Cue Ball (White) */}
      <Ball number={0} color="#ffffff" position={[-2.5, 0.28, 0]} />

      {/* 8-Ball (Black) */}
      <Ball number={8} color="#111111" position={[1.5, 0.28, 0]} />

      {/* Rack Placeholder Balls */}
      <Ball number={1} color="#eab308" position={[1.9, 0.28, -0.22]} />
      <Ball number={2} color="#2563eb" position={[1.9, 0.28, 0.22]} />
      
      <Ball number={3} color="#dc2626" position={[2.3, 0.28, -0.44]} />
      <Ball number={4} color="#9333ea" position={[2.3, 0.28, 0]} />
      <Ball number={5} color="#ea580c" position={[2.3, 0.28, 0.44]} />
    </group>
  );
};

export default Balls;
