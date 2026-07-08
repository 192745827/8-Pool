import React from 'react';
import { Canvas } from '@react-three/fiber';
import Camera from './Camera';
import Lights from './Lights';
import Environment from './Environment';
import PoolTable from './PoolTable';
import CueStick from './CueStick';
import Balls from './Balls';

export const Scene: React.FC = () => {
  return (
    <div className="w-full aspect-[2/1] bg-slate-950 border-4 border-amber-900 rounded-3xl relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
      <Canvas shadows>
        <Camera />
        <Lights />
        <Environment />
        <PoolTable />
        <CueStick />
        <Balls />
      </Canvas>
    </div>
  );
};

export default Scene;
