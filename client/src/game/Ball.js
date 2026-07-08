import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Ball = ({ number, color, position }) => {
    return (_jsxs("mesh", { castShadow: true, receiveShadow: true, position: position, children: [_jsx("sphereGeometry", { args: [0.18, 32, 32] }), _jsx("meshStandardMaterial", { color: color, roughness: 0.12, metalness: 0.1 })] }));
};
export default Ball;
