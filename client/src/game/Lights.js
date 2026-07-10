import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export const Lights = () => {
    return (_jsxs(_Fragment, { children: [_jsx("ambientLight", { intensity: 0.6 }), _jsx("directionalLight", { castShadow: true, position: [4, 12, 4], intensity: 1.5, "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, "shadow-bias": -0.0005, "shadow-camera-far": 40, "shadow-camera-left": -8, "shadow-camera-right": 8, "shadow-camera-top": 8, "shadow-camera-bottom": -8 }), _jsx("pointLight", { position: [-8, 8, -8], intensity: 0.4 })] }));
};
export default Lights;
