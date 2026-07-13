import React from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export const CameraController: React.FC = () => {
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
        mouseButtons={{
          LEFT: -1 as any, // Disable left-click rotation (used for shooting)
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE, // Use right-click for camera controls
        }}
      />
    </>
  );
};

export default CameraController;
