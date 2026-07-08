import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Lobby from '../pages/Lobby';
import Game from '../pages/Game';
import Leaderboard from '../pages/Leaderboard';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
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
