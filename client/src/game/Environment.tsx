import React from 'react';
import { Stars, Environment as DreiEnvironment } from '@react-three/drei';

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
      <gridHelper args={[24, 24, '#1e293b', '#0f172a']} position={[0, -2.99, 0]} />
      
      {/* Solid Floor Plane to receive shadows from table legs and balls */}
      <mesh receiveShadow position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.65} metalness={0.15} />
      </mesh>

      {/* HDR environment preset for high-fidelity specular reflections and ambient probe fills */}
      <DreiEnvironment preset="studio" />
    </>
  );
};

export default Environment;
