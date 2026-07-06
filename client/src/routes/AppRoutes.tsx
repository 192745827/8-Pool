import React from 'react';
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
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/lobby',
        element: <Lobby />,
      },
      {
        path: '/game/:roomId',
        element: <Game />,
      },
      {
        path: '/leaderboard',
        element: <Leaderboard />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
