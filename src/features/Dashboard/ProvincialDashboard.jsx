import React from 'react';
import { TrendingDown, TrendingUp, AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ROUTES_BY_PSM } from '../../config/routeConfig';
import { ROUTE_TO_PROVINCE } from '../../config/provinceConfig';
import { log } from '../../utils/logger';

const ProvincialDashboard = ({
  selectedOperator,
  selectedProvince,
  selectedQuarter,
  selectedWeek,
  topRotasCriticas,
  intervencoesRecentes,
  rotasNormalizadas,
  rotasMaisIntervencionadas,
  rotasSemIntervencao,
  handleRotaClick,
  data,
  currentPageNormalizadas,
  setCurrentPageNormalizadas,
  currentPageIntervencoes,
  setCurrentPageIntervencoes,
  currentPageSemIntervencao,
  setCurrentPageSemIntervencao,
  itemsPerPageIntervencoes,
  itemsPerPageSemIntervencao,
  itemsPerPageNormalizadas,
}) => {
  const totalPagesNormalizadas = Math.ceil((rotasNormalizadas?.length || 0) / (itemsPerPageNormalizadas || 6));
  const currentDataNormalizadas = (rotasNormalizadas || []).slice(
    currentPageNormalizadas * (itemsPerPageNormalizadas || 6),
    (currentPageNormalizadas + 1) * (itemsPerPageNormalizadas || 6)
  );
  const goToNextPageNormalizadas = () => setCurrentPageNormalizadas(p => Math.min(p + 1, totalPagesNormalizadas - 1));
  const goToPrevPageNormalizadas = () => setCurrentPageNormalizadas(p => Math.max(p - 1, 0));
  const goToNextPageIntervencoes = () => setCurrentPageIntervencoes(p => Math.min(p + 1, Math.ceil((intervencoesRecentes?.length || 0) / (itemsPerPageIntervencoes || 5)) - 1));
  const goToPrevPageIntervencoes = () => setCurrentPageIntervencoes(p => Math.max(p - 1, 0));
  const goToNextPageSemIntervencao = () => setCurrentPageSemIntervencao(p => Math.min(p + 1, Math.ceil((rotasSemIntervencao?.length || 0) / (itemsPerPageSemIntervencao || 5)) - 1));
  const goToPrevPageSemIntervencao = () => setCurrentPageSemIntervencao(p => Math.max(p - 1, 0));

  return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="py-4 px-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Performance das Rotas
                  {selectedProvince !== 'Todas' && <span className="text-blue-600"> | {selectedProvince}</span>}
                </h2>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-5 gap-4">
                {/* Top 5 Rotas Críticas - GRÁFICO DE BARRAS HORIZONTAL */}
                <div className="bg-red-50 rounded-lg border border-red-200 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <h3 className="text-xs font-semibold text-red-700">Top 5 Rotas Críticas - {selectedQuarter}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {(() => {
                      // Calcular valor máximo para escala
                      const maxValue = Math.max(...topRotasCriticas.map(r => r.value), 1);
                      
                      return topRotasCriticas.map((item) => {
                        const percentage = (item.value / maxValue) * 100;
                        const reparadasPercentage = item.value > 0 ? (item.reparadas / item.value) * 100 : 0;
                        
                        return (
                          <div 
                            key={item.rank} 
                            className="relative cursor-pointer group"
                            onClick={() => handleRotaClick(item.rota)}
                          >
                            {/* Barra de fundo */}
                            <div className="relative h-10 rounded-lg overflow-hidden bg-white border border-red-200 group-hover:border-red-400 transition-all duration-200">
                              {/* Barra vermelha (Indisponíveis) */}
                              <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
                                style={{ width: `${Math.max(percentage, 15)}%` }}
                              >
                                {/* Efeito de brilho */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                              </div>
                              
                              {/* v3.49.34: Barrinha verde sólida e vibrante (Reparadas) */}
                              {item.reparadas > 0 && (
                                <div 
                                  className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-500 ease-out shadow-sm"
                                  style={{ width: `${Math.max(percentage * (reparadasPercentage / 100), 5)}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                              )}
                              
                              {/* Conteúdo sobre a barra */}
                              <div className="relative h-full flex items-center justify-between px-3 z-10">
                                {/* Lado esquerdo: Ranking + Nome da Rota */}
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="text-xs font-bold text-white bg-red-700/80 rounded-full w-5 h-5 flex items-center justify-center">
                                    {item.rank}
                                  </span>
                                  <div className="flex flex-col">
                                    {/* v3.49.33: Nome sempre em cinza escuro */}
                                    <span className="text-xs font-bold leading-tight text-gray-700">
                                      {item.rota}
                                    </span>
                                    {item.reparadas > 0 && (
                                      <span className="text-[10px] font-bold leading-tight text-green-500">
                                        {item.reparadas} reparadas ({reparadasPercentage.toFixed(0)}%)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* v3.49.37: Valor em círculo branco compacto */}
                                <div className="flex items-center justify-center w-7 h-7 bg-white rounded-full shadow-sm border border-red-200">
                                  <span className="text-[11px] font-bold text-red-600">
                                    {item.value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-red-200">
                    <div className="text-xs text-red-700 font-medium text-center">
                      {topRotasCriticas.filter(r => r.value > 0).length} rotas com indisponíveis
                    </div>
                  </div>
                </div>

                {/* Intervenções Recentes - ULTRA COMPACTO COM PAGINAÇÃO */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-semibold text-blue-700">Intervenções Recentes - {selectedQuarter}</h3>
                    </div>
                    {/* Setas discretas - só aparecem se houver mais de 5 rotas */}
                    {intervencoesRecentes.length > 5 && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={goToPrevPageIntervencoes}
                          disabled={currentPageIntervencoes === 0}
                          className="text-blue-600 hover:text-blue-800 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors p-0.5"
                          title="Anterior"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="text-[9px] text-blue-600 font-medium px-1">
                          {currentPageIntervencoes + 1}/{Math.ceil(intervencoesRecentes.length / itemsPerPageIntervencoes)}
                        </span>
                        <button
                          onClick={goToNextPageIntervencoes}
                          disabled={currentPageIntervencoes >= Math.ceil(intervencoesRecentes.length / itemsPerPageIntervencoes) - 1}
                          className="text-blue-600 hover:text-blue-800 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors p-0.5"
                          title="Próxima"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      // Paginação
                      const startIdx = currentPageIntervencoes * itemsPerPageIntervencoes;
                      const endIdx = startIdx + itemsPerPageIntervencoes;
                      const paginatedItems = intervencoesRecentes.slice(startIdx, endIdx);
                      
                      log('📄 PAGINAÇÃO INTERVENÇÕES:', {
                        totalItems: intervencoesRecentes.length,
                        currentPage: currentPageIntervencoes,
                        itemsPerPage: itemsPerPageIntervencoes,
                        startIdx,
                        endIdx,
                        itemsNaPagina: paginatedItems.length
                      });
                      
                      if (paginatedItems.length === 0) {
                        return (
                          <div className="bg-white rounded p-3 border border-blue-100 text-center">
                            <p className="text-xs text-gray-500">Sem intervenções neste quadrimestre</p>
                          </div>
                        );
                      }
                      
                      return paginatedItems.map((item, idx) => {
                        // v3.22.1: Calcular reparações na semana selecionada
                        const weekData = data[selectedOperator]?.[selectedWeek]?.[item.rota];
                        const reparadasNaSemana = weekData ? (parseInt(weekData['Total Reparadas']) || 0) : 0;
                        
                        return (
                          <div key={idx} className="bg-white rounded p-1.5 border border-blue-100">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-gray-700 leading-tight truncate">
                                    {item.rota}
                                  </p>
                                  {reparadasNaSemana > 0 && (
                                    <span className="text-[10px] font-semibold text-green-600 whitespace-nowrap">
                                      (+{reparadasNaSemana} ↑)
                                    </span>
                                  )}
                                </div>
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-medium px-1 py-0.5 rounded inline-block mt-0.5">{item.status}</span>
                              </div>
                              <span className="text-lg font-bold text-blue-600 flex-shrink-0">{item.reps}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-blue-200">
                    {(() => {
                      // v3.20.5: Calcular intervenções e reparações das 2 últimas semanas
                      const routesToProcess = selectedProvince !== 'Todas'
                        ? (ROUTES_BY_PSM[selectedOperator] || []).filter(route => ROUTE_TO_PROVINCE[route] === selectedProvince)
                        : (ROUTES_BY_PSM[selectedOperator] || []);
                      
                      // Semana atual - contar intervenções e total de reparações
                      let totalSemanaSelecionada = 0;
                      let intervencoesSemanaAtual = 0;
                      routesToProcess.forEach(route => {
                        if (data[selectedOperator]?.[selectedWeek]?.[route]) {
                          const routeData = data[selectedOperator][selectedWeek][route];
                          const reparadas = parseInt(routeData['Total Reparadas']) || 0;
                          if (reparadas > 0) {
                            intervencoesSemanaAtual++;
                            totalSemanaSelecionada += reparadas;
                          }
                        }
                      });
                      
                      // Semana anterior
                      const selectedWeekNum = parseInt(selectedWeek.substring(1)); // W50 -> 50
                      const previousWeekNum = selectedWeekNum - 1;
                      const previousWeek = previousWeekNum >= 1 ? `W${previousWeekNum}` : null;
                      
                      let totalSemanaAnterior = 0;
                      if (previousWeek) {
                        routesToProcess.forEach(route => {
                          if (data[selectedOperator]?.[previousWeek]?.[route]) {
                            const routeData = data[selectedOperator][previousWeek][route];
                            totalSemanaAnterior += parseInt(routeData['Total Reparadas']) || 0;
                          }
                        });
                      }
                      
                      const total2Semanas = totalSemanaSelecionada + totalSemanaAnterior;
                      
                      return (
                        <div className="text-xs text-blue-700 font-medium text-center">
                          <div>
                            {intervencoesSemanaAtual > 0 
                              ? `${intervencoesSemanaAtual} intervenções na ${selectedWeek}`
                              : `Sem intervenções na ${selectedWeek}`
                            }
                          </div>
                          <div className="text-[10px] mt-0.5">
                            {previousWeek && <span>{previousWeek}: {totalSemanaAnterior} | </span>}
                            {selectedWeek}: {totalSemanaSelecionada}
                            <span className="font-bold ml-1">({total2Semanas} total)</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Rotas Normalizadas - ULTRA COMPACTO COM PAGINAÇÃO */}
                <div className="bg-green-50 rounded-lg border border-green-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h3 className="text-xs font-semibold text-green-700">Rotas Normalizadas - {selectedQuarter}</h3>
                    </div>
                    {/* Setas discretas - só aparecem se houver mais de 6 rotas */}
                    {rotasNormalizadas.length > 6 && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={goToPrevPageNormalizadas}
                          disabled={currentPageNormalizadas === 0}
                          className="text-green-600 hover:text-green-800 disabled:text-green-300 disabled:cursor-not-allowed transition-colors p-0.5"
                          title="Anterior"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="text-[9px] text-green-600 font-medium px-1">
                          {currentPageNormalizadas + 1}/{totalPagesNormalizadas}
                        </span>
                        <button
                          onClick={goToNextPageNormalizadas}
                          disabled={currentPageNormalizadas >= totalPagesNormalizadas - 1}
                          className="text-green-600 hover:text-green-800 disabled:text-green-300 disabled:cursor-not-allowed transition-colors p-0.5"
                          title="Próximo"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {currentDataNormalizadas.map((item, idx) => (
                      <div key={idx} className="bg-white rounded p-1.5 border border-green-100">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 leading-tight truncate">{item.rota}</p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[10px] text-green-600 font-medium">{item.status}</span>
                              {item.condition && (
                                <span className="text-[9px] text-gray-500 italic">{item.condition}</span>
                              )}
                            </div>
                          </div>
                          <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{item.icon}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-green-200">
                    <div className="text-xs text-green-700 font-medium text-center">
                      {rotasNormalizadas.filter(r => r.icon === '✓').length} rotas normalizadas
                    </div>
                  </div>
                </div>
                {/* v3.23.0: ROTAS MAIS INTERVENCIONADAS - TOP 5 */}
                <div className="bg-purple-50 rounded-lg border border-purple-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <h3 className="text-xs font-semibold text-purple-700">Top 5 Mais Intervencionadas - {selectedQuarter}</h3>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {rotasMaisIntervencionadas.map((item) => (
                      <div 
                        key={item.rank} 
                        className="bg-white rounded p-1.5 border border-purple-100 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        onClick={() => item.rota !== '-' && handleRotaClick(item.rota)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 flex-1">
                            <span className="text-sm font-bold text-purple-600 w-5">#{item.rank}</span>
                            <div className="flex flex-col">
                              <p className="text-xs font-medium text-gray-700 leading-tight">{item.rota}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-purple-600 ml-2">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-purple-200">
                    <div className="text-xs text-purple-700 font-medium text-center">
                      {rotasMaisIntervencionadas.filter(r => r.value > 0).length} rotas com reparações
                    </div>
                  </div>
                </div>


                {/* v3.23.0: ROTAS SEM INTERVENÇÃO - CARROSSEL */}
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <h3 className="text-xs font-semibold text-orange-700">Rotas Sem Intervenção - {selectedQuarter}</h3>
                    </div>
                    {/* Setas do carrossel - só aparecem se houver mais de 7 rotas */}
                    {rotasSemIntervencao.length > 7 && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={goToPrevPageSemIntervencao}
                          disabled={currentPageSemIntervencao === 0}
                          className="text-orange-600 hover:text-orange-800 disabled:text-orange-300 disabled:cursor-not-allowed transition-colors p-0.5"
                          title="Anterior"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="text-[9px] text-orange-600 font-medium px-1">
                          {currentPageSemIntervencao + 1}/{Math.ceil(rotasSemIntervencao.length / itemsPerPageSemIntervencao)}
                        </span>
                        <button
                          onClick={goToNextPageSemIntervencao}
                          disabled={currentPageSemIntervencao >= Math.ceil(rotasSemIntervencao.length / itemsPerPageSemIntervencao) - 1}
                          className="text-orange-600 hover:text-orange-800 disabled:text-orange-300 disabled:cursor-not-allowed transition-colors p-0.5"
                          title="Próximo"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {rotasSemIntervencao.length > 0 ? (
                      rotasSemIntervencao
                        .slice(
                          currentPageSemIntervencao * itemsPerPageSemIntervencao,
                          (currentPageSemIntervencao + 1) * itemsPerPageSemIntervencao
                        )
                        .map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-white rounded p-1.5 border border-orange-100 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors"
                            onClick={() => handleRotaClick(item.rota)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-gray-700 leading-tight truncate flex-1">{item.rota}</p>
                              <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">0</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="bg-white rounded p-3 border border-orange-100 text-center">
                        <p className="text-xs text-gray-500">Todas as rotas tiveram intervenção</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-orange-200">
                    <div className="text-xs text-orange-700 font-medium text-center">
                      {rotasSemIntervencao.length} rotas sem reparações
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  );
};

export default ProvincialDashboard;
