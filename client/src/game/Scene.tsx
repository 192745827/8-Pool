import React from 'react';
import Camera from './Camera';
import Lighting from './Lighting';
import Table from './Table';
import Cue from './Cue';
import Environment from './Environment';
import Ball from './Ball';

export const Scene: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 3D Scene Viewport Wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Camera />
        <Lighting />
        <Environment />
        <Table />
        <Cue />
        <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300 font-display flex items-center gap-2">
              <span>🔴</span> Billiard Balls Configuration
            </h4>
            <p className="text-[10px] text-slate-500 font-body mt-1 leading-normal">
              Active game status. Spherical physical mesh instances will be loaded here dynamically in the next phase.
            </p>
          </div>
          <div className="flex gap-2 justify-start py-2 flex-wrap">
            <Ball number={0} color="#ffffff" />
            <Ball number={8} color="#0d0d0d" />
            <Ball number={1} color="#fbbf24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scene;
