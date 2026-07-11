import React from 'react';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import { PhysicsConstants } from './PhysicsConstants';

interface PocketSensorProps {
  onBallPocketed?: (ballId: number, pocketId: string) => void;
}

export const PocketSensor: React.FC<PocketSensorProps> = ({ onBallPocketed }) => {
  return (
    <group>
      {PhysicsConstants.POCKETS.map((pocket) => (
        <RigidBody 
          key={pocket.id}
          type="fixed" 
          sensor={true}
          position={pocket.position}
        >
          {/* Cylinder collider with [halfHeight, radius] */}
          {/* Pos Y is slightly offset down to detect when ball is dropping into pocket */}
          <CylinderCollider
            args={[0.1, pocket.radius]}
            position={[0, -0.05, 0]}
            sensor={true}
            onIntersectionEnter={(event) => {
              const otherBody = event.other.rigidBodyObject;
              if (otherBody && otherBody.userData && otherBody.userData.type === 'ball') {
                const ballId = otherBody.userData.ballId;
                onBallPocketed?.(ballId, pocket.id);
              }
            }}
          />
        </RigidBody>
      ))}
    </group>
  );
};

export default PocketSensor;
