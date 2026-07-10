import React from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

export const Camera: React.FC = () => {
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 6, 7]} 
        fov={45} 
      />
      <OrbitControls 
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={4} 
        maxDistance={25} 
      />
    </>
  );
};

export default Camera;
