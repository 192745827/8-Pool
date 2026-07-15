import React from 'react';

export const Glow: React.FC = () => {
  const stripWidth = 0.03;
  const stripHeight = 0.015;

  return (
    <group position={[0, 0.28, 0]}>
      {/* Neon Cyan Highlights on long cushions */}
      <mesh position={[-4.6, 0, -1.05]}>
        <boxGeometry args={[stripWidth, stripHeight, 1.8]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>
      <mesh position={[-4.6, 0, 1.05]}>
        <boxGeometry args={[stripWidth, stripHeight, 1.8]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>
      <mesh position={[4.6, 0, -1.05]}>
        <boxGeometry args={[stripWidth, stripHeight, 1.8]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>
      <mesh position={[4.6, 0, 1.05]}>
        <boxGeometry args={[stripWidth, stripHeight, 1.8]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>

      {/* Neon Magenta Highlights on short cushions */}
      <mesh position={[0, 0, -2.1]}>
        <boxGeometry args={[4.2, stripHeight, stripWidth]} />
        <meshBasicMaterial color="#d946ef" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 2.1]}>
        <boxGeometry args={[4.2, stripHeight, stripWidth]} />
        <meshBasicMaterial color="#d946ef" toneMapped={false} />
      </mesh>
    </group>
  );
};

export default Glow;
