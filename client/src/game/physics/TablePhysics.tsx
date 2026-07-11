import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { PhysicsConstants } from './PhysicsConstants';

export const TablePhysics: React.FC = () => {
  return (
    <group>
      {/* Table Bed (Slate) Static Collider */}
      {/* Size is [10, 0.2, 5], positioned at [0, 0, 0]. The top face is at Y = 0.1 */}
      <RigidBody type="fixed" friction={PhysicsConstants.BALL_FRICTION} restitution={0.1}>
        <CuboidCollider args={[5, 0.1, 2.5]} position={[0, 0, 0]} />
      </RigidBody>

      {/* Cushion/Rail Static Colliders */}
      {/* Restitution (bounciness) and friction are higher for cushions */}
      <RigidBody 
        type="fixed" 
        restitution={PhysicsConstants.CUSHION_RESTITUTION} 
        friction={PhysicsConstants.CUSHION_FRICTION}
      >
        {/* Top-Left Rail Segment (X from -4.5 to -0.3, Z = -2.5) */}
        {/* Collider half-sizes: X=2.1, Y=0.2, Z=0.2. Centered at [-2.4, 0.2, -2.7] */}
        <CuboidCollider args={[2.1, 0.2, 0.2]} position={[-2.4, 0.2, -2.7]} />

        {/* Top-Right Rail Segment (X from 0.3 to 4.5, Z = -2.5) */}
        {/* Centered at [2.4, 0.2, -2.7] */}
        <CuboidCollider args={[2.1, 0.2, 0.2]} position={[2.4, 0.2, -2.7]} />

        {/* Bottom-Left Rail Segment (X from -4.5 to -0.3, Z = 2.5) */}
        {/* Centered at [-2.4, 0.2, 2.7] */}
        <CuboidCollider args={[2.1, 0.2, 0.2]} position={[-2.4, 0.2, 2.7]} />

        {/* Bottom-Right Rail Segment (X from 0.3 to 4.5, Z = 2.5) */}
        {/* Centered at [2.4, 0.2, 2.7] */}
        <CuboidCollider args={[2.1, 0.2, 0.2]} position={[2.4, 0.2, 2.7]} />

        {/* Left Rail (X = -5.0, Z from -2.0 to 2.0) */}
        {/* Collider half-sizes: X=0.2, Y=0.2, Z=2.0. Centered at [-5.2, 0.2, 0] */}
        <CuboidCollider args={[0.2, 0.2, 2.0]} position={[-5.2, 0.2, 0]} />

        {/* Right Rail (X = 5.0, Z from -2.0 to 2.0) */}
        {/* Centered at [5.2, 0.2, 0] */}
        <CuboidCollider args={[0.2, 0.2, 2.0]} position={[5.2, 0.2, 0]} />
      </RigidBody>
    </group>
  );
};

export default TablePhysics;
