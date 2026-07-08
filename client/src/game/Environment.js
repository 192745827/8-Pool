import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Stars } from '@react-three/drei';
export const Environment = () => {
    return (_jsxs(_Fragment, { children: [_jsx("color", { attach: "background", args: ['#07070e'] }), _jsx(Stars, { radius: 80, depth: 40, count: 3000, factor: 4, saturation: 0, fade: true, speed: 1 }), _jsx("gridHelper", { args: [24, 24, '#1e293b', '#0f172a'], position: [0, -0.01, 0] })] }));
};
export default Environment;
