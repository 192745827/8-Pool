import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';

interface CameraControllerProps {
  cueBallRef: React.RefObject<RapierRigidBody | null>;
}

export const CameraController: React.FC<CameraControllerProps> = ({ cueBallRef }) => {
  const orbitControlsRef = useRef<any>(null);

  useFrame(() => {
    if (!cueBallRef.current || !orbitControlsRef.current) return;

    const translation = cueBallRef.current.translation();
    
    // Ignore updates if the cue ball is pocketed/scratched and teleported deep under the table Y=-10
    if (translation.y < -2) return;

    const targetPos = new THREE.Vector3(translation.x, 0.28, translation.z);

    // Smoothly lerp camera focus (target) to track the cue ball cinematically
    orbitControlsRef.current.target.lerp(targetPos, 0.08);
    orbitControlsRef.current.update();
  });

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 6, 7]} 
        fov={45} 
      />
      <OrbitControls 
        ref={orbitControlsRef}
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={4} 
        maxDistance={25} 
        enableDamping
        dampingFactor={0.05}
        mouseButtons={{
          LEFT: -1 as any, // Disable left-click camera rotation (used for shooting drag)
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE, // Use right-click to orbit camera
        }}
      />
    </>
  );
};

export default CameraController;
