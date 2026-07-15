import React from 'react';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from '@/errors/ErrorBoundary';
import NetworkError from '@/errors/NetworkError';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <NetworkError />
      <AppRoutes />
    </ErrorBoundary>
  );
};

export default App;
