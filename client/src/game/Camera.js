import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
export const Camera = () => {
    return (_jsxs(_Fragment, { children: [_jsx(PerspectiveCamera, { makeDefault: true, position: [0, 6, 7], fov: 45 }), _jsx(OrbitControls, { maxPolarAngle: Math.PI / 2.1, minDistance: 4, maxDistance: 25 })] }));
};
export default Camera;
