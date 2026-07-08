import React from 'react';

export const Environment: React.FC = () => {
  return (
    <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-left">
      <h4 className="text-xs font-bold text-slate-300 font-display flex items-center gap-2">
        <span>🌌</span> 3D Studio Environment
      </h4>
      <p className="text-[10px] text-slate-500 font-body mt-1 leading-normal">
        Placeholder view. Studio HDRI environment lighting reflections and skybox textures will be mounted here in the next phase.
      </p>
    </div>
  );
};

export default Environment;
