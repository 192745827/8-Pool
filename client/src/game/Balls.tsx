import React from 'react';
import Ball from './Ball';

export const Balls: React.FC = () => {
  return (
    <group>
      {/* Cue Ball (White) */}
      <Ball number={0} color="#ffffff" position={[-2.5, 0.28, 0]} />

      {/* Row 1 (1 ball) */}
      <Ball number={1} color="#eab308" position={[1.5, 0.28, 0]} />

      {/* Row 2 (2 balls) */}
      <Ball number={9} color="#fef08a" position={[1.812, 0.28, -0.18]} />
      <Ball number={2} color="#2563eb" position={[1.812, 0.28, 0.18]} />

      {/* Row 3 (3 balls) */}
      <Ball number={10} color="#60a5fa" position={[2.124, 0.28, -0.36]} />
      <Ball number={8} color="#111111" position={[2.124, 0.28, 0]} />
      <Ball number={3} color="#dc2626" position={[2.124, 0.28, 0.36]} />

      {/* Row 4 (4 balls) */}
      <Ball number={11} color="#f87171" position={[2.436, 0.28, -0.54]} />
      <Ball number={4} color="#9333ea" position={[2.436, 0.28, -0.18]} />
      <Ball number={12} color="#c084fc" position={[2.436, 0.28, 0.18]} />
      <Ball number={5} color="#ea580c" position={[2.436, 0.28, 0.54]} />

      {/* Row 5 (5 balls) */}
      <Ball number={7} color="#7f1d1d" position={[2.748, 0.28, -0.72]} /> {/* Solid Corner */}
      <Ball number={6} color="#16a34a" position={[2.748, 0.28, -0.36]} />
      <Ball number={14} color="#4ade80" position={[2.748, 0.28, 0]} />
      <Ball number={13} color="#fdba74" position={[2.748, 0.28, 0.36]} />
      <Ball number={15} color="#fda4af" position={[2.748, 0.28, 0.72]} /> {/* Stripe Corner */}
    </group>
  );
};

export default Balls;
