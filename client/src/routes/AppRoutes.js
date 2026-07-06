import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.js';
import Landing from '../pages/Landing.js';
import Login from '../pages/Login.js';
import Register from '../pages/Register.js';
import Dashboard from '../pages/Dashboard.js';
import Lobby from '../pages/Lobby.js';
import Game from '../pages/Game.js';
import Leaderboard from '../pages/Leaderboard.js';
import Profile from '../pages/Profile.js';
import Settings from '../pages/Settings.js';
import NotFound from '../pages/NotFound.js';
const router = createBrowserRouter([
    {
        element: _jsx(MainLayout, {}),
        children: [
            {
                path: '/',
                element: _jsx(Landing, {}),
            },
            {
                path: '/login',
                element: _jsx(Login, {}),
            },
            {
                path: '/register',
                element: _jsx(Register, {}),
            },
            {
                path: '/dashboard',
                element: _jsx(Dashboard, {}),
            },
            {
                path: '/lobby',
                element: _jsx(Lobby, {}),
            },
            {
                path: '/game/:roomId',
                element: _jsx(Game, {}),
            },
            {
                path: '/leaderboard',
                element: _jsx(Leaderboard, {}),
            },
            {
                path: '/profile',
                element: _jsx(Profile, {}),
            },
            {
                path: '/settings',
                element: _jsx(Settings, {}),
            },
            {
                path: '*',
                element: _jsx(NotFound, {}),
            },
        ],
    },
]);
export const AppRoutes = () => {
    return _jsx(RouterProvider, { router: router });
};
export default AppRoutes;
