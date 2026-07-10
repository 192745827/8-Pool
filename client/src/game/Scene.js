import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import Camera from './Camera';
import Lights from './Lights';
import Environment from './Environment';
import PoolTable from './PoolTable';
import CueStick from './CueStick';
import Balls from './Balls';
export const Scene = () => {
    return (_jsx("div", { className: "w-full aspect-[2/1] bg-slate-950 border-4 border-amber-900 rounded-3xl relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]", children: _jsxs(Canvas, { shadows: { type: THREE.PCFSoftShadowMap }, children: [_jsx(Camera, {}), _jsx(Lights, {}), _jsx(Environment, {}), _jsx(PoolTable, {}), _jsx(CueStick, {}), _jsx(Balls, {})] }) }));
};
export default Scene;
