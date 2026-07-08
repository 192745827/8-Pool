import React from 'react';
import { Stars } from '@react-three/drei';

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#07070e']} />
      <Stars 
        radius={80} 
        depth={40} 
        count={3000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
      <gridHelper args={[24, 24, '#1e293b', '#0f172a']} position={[0, -0.01, 0]} />
    </>
  );
};

export default Environment;
