import React from 'react';
import { QUARTER_CONFIG } from '../../config/quarterConfig';

const StatusDrilldown = ({
  showStatusDrilldown,
  setShowStatusDrilldown,
  selectedStatusDrilldown,
  selectedOperator,
  selectedQuarter,
  currentPageDrilldown,
  setCurrentPageDrilldown,
  itemsPerPageDrilldown,
  data,
  handleRotaClick,
}) => {
  if (!showStatusDrilldown || !selectedStatusDrilldown) return null;

  // Calcular paginação (16 rotas por página = 4 linhas × 4 colunas)
  const totalPages = Math.ceil(selectedStatusDrilldown.rotas.length / itemsPerPageDrilldown);
  const startIdx = currentPageDrilldown * itemsPerPageDrilldown;
  const endIdx = startIdx + itemsPerPageDrilldown;
  const currentRotas = selectedStatusDrilldown.rotas.slice(startIdx, endIdx);

  const goToNextPage = () => {
    if (currentPageDrilldown < totalPages - 1) {
      setCurrentPageDrilldown(currentPageDrilldown + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageDrilldown > 0) {
      setCurrentPageDrilldown(currentPageDrilldown - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8"
      onClick={() => setShowStatusDrilldown(false)}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 flex justify-between items-center flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold truncate">📊 {selectedStatusDrilldown.label}</h2>
            <p className="text-[10px] text-blue-100 truncate">
              {selectedOperator} • {selectedQuarter} • Total: {selectedStatusDrilldown.total} • Página {currentPageDrilldown + 1}/{totalPages}
            </p>
          </div>
          <button
            onClick={() => setShowStatusDrilldown(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 ml-2 transition-colors flex-shrink-0"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Conteúdo - GRID 4 COLUNAS × 4 LINHAS = 16 rotas */}
        <div className="flex-1 overflow-hidden p-2 flex items-center">
          {currentRotas.length > 0 ? (
            <div className="w-full grid grid-cols-4 gap-2">
              {currentRotas.map((rota, idx) => {
                const percentage = ((rota.valor / selectedStatusDrilldown.total) * 100).toFixed(1);

                // v3.49.43: Buscar dados de reparadas para esta rota (se estiver em "Indisponíveis")
                let reparadas = 0;
                let percentagemReparadas = 0;

                if (selectedStatusDrilldown.label === 'Indisponíveis' || selectedStatusDrilldown.label.includes('Indisponíveis')) {
                  // Buscar total de reparadas para esta rota no quarter
                  const quarterLimits = QUARTER_CONFIG[selectedQuarter];
                  for (let i = quarterLimits.start; i <= quarterLimits.end; i++) {
                    const week = 'W' + i;
                    const val = data[selectedOperator]?.[week]?.[rota.rota]?.['Total Reparadas'];
                    if (val !== undefined && val > 0) {
                      reparadas += parseInt(val) || 0;
                    }
                  }

                  // Calcular percentagem de reparadas em relação aos indisponíveis
                  if (rota.valor > 0) {
                    percentagemReparadas = ((reparadas / rota.valor) * 100).toFixed(1);
                  }
                }

                return (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded px-2 py-1.5 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer flex flex-col h-full"
                    onClick={() => {
                      setShowStatusDrilldown(false);
                      handleRotaClick(rota.rota);
                    }}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-gray-800 truncate leading-tight" title={rota.rota}>
                          {rota.rota}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-blue-600">{rota.valor}</p>
                      </div>
                    </div>

                    <p className="text-[8px] text-gray-500 leading-tight mb-1">
                      {rota.semana} • {percentage}%
                    </p>

                    {/* v3.49.43: Barra AZUL de indisponíveis */}
                    <div className="bg-gray-200 rounded-sm h-1.5 overflow-hidden mb-1">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* v5.02.0: Barra VERDE de reparadas com NÚMERO (sem semana) */}
                    {reparadas > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[8px] text-gray-500 leading-tight">
                            {percentagemReparadas}%
                          </p>
                          <p className="text-[9px] font-bold text-green-600">
                            {reparadas}
                          </p>
                        </div>
                        <div className="bg-gray-200 rounded-sm h-1.5 overflow-hidden">
                          <div
                            className="bg-green-500 h-full transition-all duration-300"
                            style={{ width: `${Math.min(parseFloat(percentagemReparadas), 100)}%` }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <p className="text-[8px] text-gray-400 italic mt-auto">
                        Sem reparações
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 w-full">
              <p className="text-xs">Nenhuma rota nesta página</p>
            </div>
          )}
        </div>

        {/* Footer com navegação de carrossel */}
        <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600">
              {selectedStatusDrilldown.rotas.length} rotas • Mostrando {startIdx + 1}-{Math.min(endIdx, selectedStatusDrilldown.rotas.length)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Anterior */}
            <button
              onClick={goToPrevPage}
              disabled={currentPageDrilldown === 0}
              className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1 ${
                currentPageDrilldown === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <span>←</span> Anterior
            </button>

            {/* Indicador de página */}
            <span className="text-xs text-gray-600 font-medium px-2">
              {currentPageDrilldown + 1} / {totalPages}
            </span>

            {/* Botão Próximo */}
            <button
              onClick={goToNextPage}
              disabled={currentPageDrilldown >= totalPages - 1}
              className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1 ${
                currentPageDrilldown >= totalPages - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Próximo <span>→</span>
            </button>

            {/* Botão Fechar */}
            <button
              onClick={() => setShowStatusDrilldown(false)}
              className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors ml-2"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDrilldown;
