import React, { ReactNode } from 'react';
import { Physics } from '@react-three/rapier';

interface PhysicsWorldProps {
  children: ReactNode;
}

export const PhysicsWorld: React.FC<PhysicsWorldProps> = ({ children }) => {
  return (
    <Physics gravity={[0, -1.0, 0]}>
      {children}
    </Physics>
  );
};

export default PhysicsWorld;
