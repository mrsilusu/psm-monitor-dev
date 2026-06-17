import React from 'react';
import { Download, Upload, FileJson, Calendar, BarChart, FileText, DownloadCloud } from 'lucide-react';

const Sidebar = ({
  menuOpen,
  setPresentationMode,
  handleDownloadCSV,
  handleImportData,
  handleUploadJustificativas,
  handleExportJSON,
  handleExportJustificativasCSV,
  handleViewState,
}) => {
  return (
    <div className={`${menuOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0`}>
      <div className="p-4">
        <nav className="space-y-1">
          <button
            onClick={() => setPresentationMode(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors border-2 border-purple-700"
          >
            <span className="text-lg">📽️</span>
            <span className="text-sm font-bold">Modo Apresentação</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors border-2 border-blue-500"
          >
            <Download className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">💾 Salvar Dados PSM (CSV)</span>
          </button>
          <button
            onClick={handleImportData}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-medium">Importar Dados PSM</span>
          </button>
          <label className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer border-2 border-yellow-500">
            <DownloadCloud className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">📥 Importar Justificativas</span>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleUploadJustificativas}
            />
          </label>
          <button
            onClick={handleExportJSON}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileJson className="w-5 h-5" />
            <span className="text-sm font-medium">JSON Backup</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-medium">Baixar Dados CSV</span>
          </button>
          <button
            onClick={handleExportJustificativasCSV}
            className="w-full flex items-center space-x-3 px-4 py-3 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-medium">Exportar Justificativas</span>
          </button>
          <div className="py-2">
            <div className="border-t border-gray-200"></div>
            <p className="text-xs font-semibold text-gray-400 mt-3 mb-2 px-4">RECURSOS FUTUROS</p>
          </div>
          <button
            disabled
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed opacity-60"
            title="Funcionalidade em desenvolvimento - Fase futura"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Selecionar Semanas</span>
          </button>
          <div className="py-2">
            <div className="border-t border-gray-200"></div>
            <p className="text-xs font-semibold text-gray-400 mt-3 mb-2 px-4">RECURSOS FUTUROS</p>
          </div>
          <button
            disabled
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed opacity-60"
            title="Funcionalidade em desenvolvimento - Fase futura"
          >
            <BarChart className="w-5 h-5" />
            <span className="text-sm font-medium">Ver Top 5 Semanas</span>
          </button>

          {/* v3.40.82: Novos recursos futuros */}
          <button
            disabled
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed opacity-60"
            title="Funcionalidade em desenvolvimento - Transferir responsabilidade entre PSMs"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-sm font-medium">Transferir Responsabilidade</span>
          </button>

          <button
            disabled
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed opacity-60"
            title="Funcionalidade em desenvolvimento - Projeção de custos de manutenção"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Previsão de Custos</span>
          </button>

          <div className="py-2">
            <div className="border-t border-gray-200"></div>
            <p className="text-xs font-semibold text-gray-500 mt-3 mb-2 px-4">DEBUG</p>
          </div>
          <button
            onClick={handleViewState}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Ver Estado (Console)</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
