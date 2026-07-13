import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RapierRigidBody, useRapier } from '@react-three/rapier';
import InputManager from './InputManager';
import ShotController from './ShotController';
import CueStick from './CueStick';
import AimLine from './AimLine';

interface CueControllerProps {
  cueBallRef: React.RefObject<RapierRigidBody | null>;
  turnState: 'aiming' | 'shooting' | 'simulating';
  setTurnState: (state: 'aiming' | 'shooting' | 'simulating') => void;
  power: number;
  setPower: (power: number) => void;
}

export const CueController: React.FC<CueControllerProps> = ({
  cueBallRef,
  turnState,
  setTurnState,
  power,
  setPower,
}) => {
  const { gl } = useThree();
  const { world, rapier } = useRapier();

  const inputManagerRef = useRef<InputManager | null>(null);
  
  const cueStickRef = useRef<THREE.Group>(null);
  const aimLineRef = useRef<THREE.Group>(null);

  const aimAngleRef = useRef(0);
  const pullbackRef = useRef(0);
  const powerRef = useRef(0);

  const pauseTimeRef = useRef(0.18); // 180ms pause at peak pullback

  // Reset pause timer when returning to aiming state
  useEffect(() => {
    if (turnState === 'aiming') {
      pauseTimeRef.current = 0.18;
    }
  }, [turnState]);

  // Sync state power to ref for hot path useFrame access
  useEffect(() => {
    powerRef.current = power;
  }, [power]);

  // Instantiate InputManager
  useEffect(() => {
    const inputManager = new InputManager(gl);
    inputManagerRef.current = inputManager;

    return () => {
      inputManager.deactivate();
    };
  }, [gl]);

  // Activate/deactivate inputs depending on turnState
  useEffect(() => {
    const inputManager = inputManagerRef.current;
    if (!inputManager) return;

    if (turnState === 'aiming') {
      inputManager.activate((finalPower) => {
        setTurnState('shooting');
      });
    } else {
      inputManager.deactivate();
    }
  }, [turnState, setTurnState]);

  useFrame((state, delta) => {
    if (!cueBallRef.current || !inputManagerRef.current) return;

    const translation = cueBallRef.current.translation();
    const cueBallPos = new THREE.Vector3(translation.x, 0.28, translation.z);

    if (turnState === 'aiming') {
      // 1. Calculate angle from camera ray
      aimAngleRef.current = InputManager.calculateAimAngle(state.raycaster, cueBallPos);

      // 2. Fetch current power
      const currentPower = inputManagerRef.current.getPower();
      setPower(currentPower);

      // 3. Compute pullback distance
      pullbackRef.current = (currentPower / 100) * 1.5;

      // 4. Update CueStick position/rotation
      if (cueStickRef.current) {
        cueStickRef.current.visible = true;
        cueStickRef.current.position.copy(cueBallPos);
        cueStickRef.current.rotation.set(0.12, aimAngleRef.current, 0, 'YXZ');
        
        const inner = cueStickRef.current.children[0] as THREE.Group;
        if (inner) {
          inner.position.z = 0.22 + pullbackRef.current;
        }
      }

      // 5. Calculate Smart Aim Line & deflection paths via Rapier Shape Cast
      const dir = new THREE.Vector3(
        Math.sin(aimAngleRef.current - Math.PI),
        0,
        Math.cos(aimAngleRef.current - Math.PI)
      ).normalize();

      const shape = new rapier.Ball(0.18); // Ball radius 0.18
      const cueBallCollider = cueBallRef.current.collider(0);

      const hit = world.castShape(
        { x: cueBallPos.x, y: cueBallPos.y, z: cueBallPos.z },
        { x: 0, y: 0, z: 0, w: 1 },
        { x: dir.x, y: dir.y, z: dir.z },
        shape,
        0.0,  // targetDistance
        15.0, // maxToi (Max lookahead distance)
        true, // stopAtPenetration
        undefined,
        undefined,
        cueBallCollider || undefined
      );

      const aimLine = aimLineRef.current;
      if (aimLine) {
        aimLine.visible = true;

        const primary = aimLine.getObjectByName('primaryLine') as THREE.Mesh;
        const ghost = aimLine.getObjectByName('ghostBall') as THREE.Mesh;
        const targetL = aimLine.getObjectByName('targetLine') as THREE.Mesh;
        const deflectL = aimLine.getObjectByName('deflectionLine') as THREE.Mesh;

        if (hit) {
          const dist = hit.time_of_impact;
          const contactPos = new THREE.Vector3().copy(cueBallPos).addScaledVector(dir, dist);
          
          const hitColliderParent = hit.collider.parent();
          const isBall = hitColliderParent && hitColliderParent.isDynamic();

          // A. Draw main path to contact point
          if (primary) {
            primary.visible = true;
            primary.position.copy(cueBallPos).add(contactPos).multiplyScalar(0.5);
            primary.position.y = 0.28 - 0.05;
            primary.scale.set(1, 1, dist);
            primary.rotation.set(0, Math.atan2(dir.x, dir.z), 0);
          }

          // B. Draw Ghost Ball contact sphere outline
          if (ghost) {
            ghost.visible = true;
            ghost.position.copy(contactPos);
          }

          if (isBall && hitColliderParent) {
            const rawTargetPos = hitColliderParent.translation();
            const targetBallPos = new THREE.Vector3(rawTargetPos.x, 0.28, rawTargetPos.z);

            // C. Target ball path: pushed along line of centers at contact
            const targetDir = new THREE.Vector3().subVectors(targetBallPos, contactPos).normalize();
            if (targetL) {
              targetL.visible = true;
              targetL.position.copy(contactPos).addScaledVector(targetDir, 0.75);
              targetL.position.y = 0.28 - 0.05;
              targetL.scale.set(1, 1, 1.5);
              targetL.rotation.set(0, Math.atan2(targetDir.x, targetDir.z), 0);
            }

            // D. Cue ball deflection path: perpendicular to line of centers
            const dot = dir.dot(targetDir);
            const deflectDir = new THREE.Vector3().subVectors(dir, targetDir.clone().multiplyScalar(dot)).normalize();
            if (deflectL) {
              deflectL.visible = true;
              deflectL.position.copy(contactPos).addScaledVector(deflectDir, 0.75);
              deflectL.position.y = 0.28 - 0.05;
              deflectL.scale.set(1, 1, 1.5);
              deflectL.rotation.set(0, Math.atan2(deflectDir.x, deflectDir.z), 0);
            }

          } else {
            // Cushion hit: simple specular reflection vector
            if (targetL) targetL.visible = false;

            const rawNormal = hit.normal2;
            const normal = new THREE.Vector3(rawNormal.x, 0, rawNormal.z).normalize();
            const deflectDir = dir.clone().reflect(normal).normalize();

            if (deflectL) {
              deflectL.visible = true;
              deflectL.position.copy(contactPos).addScaledVector(deflectDir, 0.75);
              deflectL.position.y = 0.28 - 0.05;
              deflectL.scale.set(1, 1, 1.5);
              deflectL.rotation.set(0, Math.atan2(deflectDir.x, deflectDir.z), 0);
            }
          }
        } else {
          // No contact: extend aim line to max length, hide ghost/split lines
          const dist = 6.0;
          const contactPos = new THREE.Vector3().copy(cueBallPos).addScaledVector(dir, dist);

          if (primary) {
            primary.visible = true;
            primary.position.copy(cueBallPos).add(contactPos).multiplyScalar(0.5);
            primary.position.y = 0.28 - 0.05;
            primary.scale.set(1, 1, dist);
            primary.rotation.set(0, Math.atan2(dir.x, dir.z), 0);
          }

          if (ghost) ghost.visible = false;
          if (targetL) targetL.visible = false;
          if (deflectL) deflectL.visible = false;
        }
      }

    } else if (turnState === 'shooting') {
      // 1. Backswing peak pause
      if (pauseTimeRef.current > 0) {
        pauseTimeRef.current -= delta;
        
        // Maintain stick visual at its pullback peak during the pause
        if (cueStickRef.current) {
          cueStickRef.current.visible = true;
          cueStickRef.current.position.copy(cueBallPos);
          cueStickRef.current.rotation.set(0.12, aimAngleRef.current, 0, 'YXZ');
          
          const inner = cueStickRef.current.children[0] as THREE.Group;
          if (inner) {
            inner.position.z = 0.22 + pullbackRef.current;
          }
        }
        return; // Pause execution
      }

      // 2. Strike animation: slide stick forward rapidly
      const strikeSpeed = 20.0; // Slightly faster for a snappier feel post-pause
      pullbackRef.current = Math.max(0, pullbackRef.current - strikeSpeed * delta);

      if (cueStickRef.current) {
        cueStickRef.current.visible = true;
        cueStickRef.current.position.copy(cueBallPos);
        cueStickRef.current.rotation.set(0.12, aimAngleRef.current, 0, 'YXZ');
        
        const inner = cueStickRef.current.children[0] as THREE.Group;
        if (inner) {
          inner.position.z = 0.22 + pullbackRef.current;
        }
      }

      if (aimLineRef.current) {
        aimLineRef.current.visible = false;
      }

      if (pullbackRef.current === 0) {
        // Strike contact! Execute physics impulse
        setTurnState('simulating');
        ShotController.executeShot(cueBallRef, powerRef.current, aimAngleRef.current);
        setPower(0);
        pauseTimeRef.current = 0.18; // Reset pause time for next shot
      }

    } else {
      // Hide visuals during simulation
      if (cueStickRef.current) {
        cueStickRef.current.visible = false;
      }
      if (aimLineRef.current) {
        aimLineRef.current.visible = false;
      }
    }
  });

  return (
    <>
      <CueStick ref={cueStickRef} />
      <AimLine ref={aimLineRef} />
    </>
  );
};

export default CueController;
