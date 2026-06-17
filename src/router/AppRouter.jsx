import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes';
import ProtectedRoute from '../auth/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import MainPage from '../pages/MainPage';
import BackofficePage from '../pages/BackofficePage';
import NotFoundPage from '../pages/NotFoundPage';

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', border: '2px solid #fca5a5', borderRadius: '12px', padding: '2rem', maxWidth: '700px', width: '100%' }}>
            <h2 style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Erro no render da aplicação
            </h2>
            <p style={{ color: '#b91c1c', fontFamily: 'monospace', fontSize: '0.9rem', background: '#fef2f2', padding: '1rem', borderRadius: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error.toString()}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '1rem' }}>
              Stack: {this.state.error.stack?.split('\n').slice(0, 4).join('\n')}
            </p>
            <button onClick={() => this.setState({ error: null })} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.MAIN} element={
        <ProtectedRoute>
          <AppErrorBoundary>
            <MainPage />
          </AppErrorBoundary>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.BACKOFFICE + '/*'} element={<ProtectedRoute><BackofficePage /></ProtectedRoute>} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
