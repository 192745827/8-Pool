import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Stars, Environment as DreiEnvironment } from '@react-three/drei';
export const Environment = () => {
    return (_jsxs(_Fragment, { children: [_jsx("color", { attach: "background", args: ['#07070e'] }), _jsx(Stars, { radius: 80, depth: 40, count: 3000, factor: 4, saturation: 0, fade: true, speed: 1 }), _jsx("gridHelper", { args: [24, 24, '#1e293b', '#0f172a'], position: [0, -2.99, 0] }), _jsxs("mesh", { receiveShadow: true, position: [0, -3, 0], rotation: [-Math.PI / 2, 0, 0], children: [_jsx("planeGeometry", { args: [40, 40] }), _jsx("meshStandardMaterial", { color: "#0b0f19", roughness: 0.65, metalness: 0.15 })] }), _jsx(DreiEnvironment, { preset: "studio" })] }));
};
export default Environment;
