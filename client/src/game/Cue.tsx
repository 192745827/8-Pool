import React from 'react';

export const Cue: React.FC = () => {
  return (
    <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left">
      <h4 className="text-xs font-bold text-slate-300 font-display flex items-center gap-2">
        <span>🦯</span> 3D Cue Stick Mesh & Target Guide
      </h4>
      <p className="text-[10px] text-slate-500 font-body mt-1 leading-normal">
        Placeholder view. Cue stick angle rotation and shot power overlays will be implemented here in the next phase.
      </p>
    </div>
  );
};

export default Cue;
