import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
    <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
    <p className="text-gray-500 text-sm mb-6">A página que procura não existe ou foi movida.</p>
    <Link to="/" className="text-blue-600 hover:underline">← Voltar ao início</Link>
  </div>
);

export default NotFoundPage;
