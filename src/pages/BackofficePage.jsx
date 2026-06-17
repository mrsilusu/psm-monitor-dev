import React from 'react';
import RoleGuard from '../auth/RoleGuard.jsx';
import BackofficeLayout from '../features/Backoffice/BackofficeLayout.jsx';

const BackofficePage = () => (
  <RoleGuard roles={['admin']} fallback={
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-gray-500 text-lg">Acesso negado</p>
        <p className="text-gray-400 text-sm mt-1">Apenas administradores podem aceder ao backoffice.</p>
      </div>
    </div>
  }>
    <BackofficeLayout />
  </RoleGuard>
);

export default BackofficePage;
