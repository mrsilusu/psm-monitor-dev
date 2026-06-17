import React from 'react';
import { AuthProvider } from './auth/AuthProvider';
import AppRouter from './router/AppRouter';

const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
