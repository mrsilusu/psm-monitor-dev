import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const SaveStatus = ({ saveStatus, lastSaveTime }) => (
  <div className="flex items-center space-x-3">
    {saveStatus === 'saving' && (
      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-blue-700">Salvando...</span>
      </div>
    )}
    {saveStatus === 'saved' && (
      <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 animate-fade-in">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-xs font-medium text-green-700">Dados salvos</span>
      </div>
    )}
    {saveStatus === 'error' && (
      <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
        <XCircle className="w-4 h-4 text-red-600" />
        <span className="text-xs font-medium text-red-700">Erro ao salvar</span>
      </div>
    )}
    {lastSaveTime && saveStatus === '' && (
      <div className="text-xs text-gray-500">
        Último salvamento: {lastSaveTime.toLocaleTimeString('pt-BR')}
      </div>
    )}
  </div>
);

export default SaveStatus;
