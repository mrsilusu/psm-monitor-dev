import React from 'react';
import { BarChart3, TrendingUp, XCircle, CheckCircle, AlertTriangle, Users, Clock, MapPin } from 'lucide-react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE } from '../../config/provinceConfig';
import { QUARTER_CONFIG } from '../../config/quarterConfig';

const PresentationMode = ({
  currentSlide,
  setCurrentSlide,
  setPresentationMode,
  selectedOperator,
  selectedProvince,
  selectedQuarter,
  selectedWeek,
  selectedYear,
  executiveDashboard,
  efetividadeMode,
  setEfetividadeMode,
  efetividadeGlobalMedia,
  efetividadePSMMedia,
  distribuicaoReparacoes,
  headerCardsData,
  quarterWeeks,
  showStatusDrilldown,
  setShowStatusDrilldown,
  selectedStatusDrilldown,
  currentPageDrilldown,
  setCurrentPageDrilldown,
  itemsPerPageDrilldown,
  data,
  handleStatusClick,
  routesByPsm = STATIC_ROUTES_BY_PSM,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
}) => {
  const summaryCards = headerCardsData ? [
    { label: headerCardsData.transporteQ2.label, value: headerCardsData.transporteQ2.value, bgColor: headerCardsData.transporteQ2.color, icon: <TrendingUp className="w-3 h-3" /> },
    { label: headerCardsData.indisponiveis.label, value: headerCardsData.indisponiveis.value, bgColor: headerCardsData.indisponiveis.color, icon: <XCircle className="w-3 h-3" /> },
    { label: headerCardsData.totalReparadas.label, value: headerCardsData.totalReparadas.value, bgColor: headerCardsData.totalReparadas.color, icon: <CheckCircle className="w-3 h-3" /> },
    { label: headerCardsData.reconhecidas.label, value: headerCardsData.reconhecidas.value, bgColor: headerCardsData.reconhecidas.color, icon: <AlertTriangle className="w-3 h-3" /> },
    { label: headerCardsData.depPassagens.label, value: headerCardsData.depPassagens.value, bgColor: headerCardsData.depPassagens.color, icon: <Users className="w-3 h-3" /> },
    { label: headerCardsData.depLicenca.label, value: headerCardsData.depLicenca.value, bgColor: headerCardsData.depLicenca.color, icon: <Clock className="w-3 h-3" /> },
    { label: headerCardsData.depCutover.label, value: headerCardsData.depCutover.value, bgColor: headerCardsData.depCutover.color, icon: <MapPin className="w-3 h-3" /> },
    { label: headerCardsData.fibrasDep.label, value: headerCardsData.fibrasDep.value, bgColor: headerCardsData.fibrasDep.color, icon: <TrendingUp className="w-3 h-3" /> },
  ] : [];

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Barra de Controle */}
      <div className="flex justify-between items-center px-6 py-3 bg-slate-900 border-b border-slate-700 flex-shrink-0">
        <span className="text-lg font-semibold">
          📽️ Modo Apresentação — Slide {currentSlide + 1} de 7
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 text-white"
          >
            ◀ Anterior
          </button>

          <button
            onClick={() => setCurrentSlide(s => Math.min(6, s + 1))}
            disabled={currentSlide === 6}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 text-white"
          >
            Próximo ▶
          </button>

          <button
            onClick={() => {
              setPresentationMode(false);
              setCurrentSlide(0);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white ml-2"
          >
            ✕ Sair
          </button>
        </div>
      </div>

      {/* Conteúdo dos Slides */}
      <div className="flex-1 overflow-auto p-0 bg-white">

        {/* SLIDE 0: Dashboard Executivo - USA SEÇÃO REAL DO APP */}
        {currentSlide === 0 && (
          <div className="p-6">
            {/* Copiando estrutura EXATA da seção Dashboard Executivo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="py-4 px-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Dashboard Executivo</h2>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded"></div>
                  <h3 className="text-md font-semibold text-gray-700">
                    Dados Gerais - PSM {selectedOperator}
                    {selectedProvince !== 'Todas' && <span className="text-blue-600"> | {selectedProvince}</span>}
                  </h3>
                </div>

                {/* 8 Cards principais - CLICÁVEIS */}
                <div className="grid grid-cols-4 gap-1 mb-6">
                  {Object.values(executiveDashboard).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleStatusClick(item.label)}
                      className={`${item.color} ${item.textColor} rounded p-1.5 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200`}
                      title={`Clique para ver detalhes de ${item.label}`}
                    >
                      <div className="text-[10px] font-medium opacity-90 mb-0.5 flex items-center gap-0.5">
                        <span>{['📦', '⚠️', '✅', '🔍', '👥', '📋', '🔄', '🔌'][idx]}</span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="text-lg font-bold leading-tight">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* V5.09.1: Nova Seção - Distribuição por Tipo de Reparação */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-green-500 rounded"></div>
                    <h4 className="text-sm font-semibold text-gray-700">Distribuição por Tipo de Reparação</h4>
                  </div>

                  <div className="grid grid-cols-5 gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    {(() => {
                      // V5.09.1: Calcular reparadas POR TIPO baseado em distribuicaoReparacoes
                      let depLicencaReparadas = 0;
                      let reconhecidasReparadas = 0;
                      let depPassagensReparadas = 0;
                      let depCutoverReparadas = 0;
                      let fibrasPSMReparadas = 0;

                      // Rotas a processar (com filtro de província se aplicável)
                      const routesToProcess = selectedProvince !== 'Todas'
                        ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
                        : (routesByPsm[selectedOperator] || []);

                      // Percorrer todas as rotas e semanas do quarter
                      routesToProcess.forEach(route => {
                        quarterWeeks.forEach(week => {
                          const weekNum = parseInt(week.substring(1));
                          const selectedWeekNum = parseInt(selectedWeek.substring(1));

                          // V5.09.1: Só contar até a semana selecionada
                          if (weekNum <= selectedWeekNum) {
                            const distDaSemana = distribuicaoReparacoes[selectedYear]?.[selectedOperator]?.[week]?.[route] || {};

                            // Somar reparadas de cada tipo (NOMES CORRETOS!)
                            depLicencaReparadas += parseInt(distDaSemana['Dep. de Licença']) || 0;
                            reconhecidasReparadas += parseInt(distDaSemana['Reconhecidas']) || 0;
                            depPassagensReparadas += parseInt(distDaSemana['Dep. de Passagem de Cabo']) || 0;
                            depCutoverReparadas += parseInt(distDaSemana['Dep. de Cutover']) || 0;
                            fibrasPSMReparadas += parseInt(distDaSemana[`Fibras dependentes da ${selectedOperator}`]) || 0;
                          }
                        });
                      });

                      // Total de reparadas (soma de todos os tipos)
                      const totalReparadas = depLicencaReparadas + reconhecidasReparadas +
                                            depPassagensReparadas + depCutoverReparadas + fibrasPSMReparadas;

                      // Array com os dados dos cards
                      const tiposDistribuicao = [
                        {
                          label: 'Dep. Licença',
                          valor: depLicencaReparadas,
                          cor: 'bg-orange-500',
                          percent: totalReparadas > 0 ? Math.round((depLicencaReparadas / totalReparadas) * 100) : 0
                        },
                        {
                          label: 'Reconhecidas',
                          valor: reconhecidasReparadas,
                          cor: 'bg-cyan-500',
                          percent: totalReparadas > 0 ? Math.round((reconhecidasReparadas / totalReparadas) * 100) : 0
                        },
                        {
                          label: 'Dep. Passagens',
                          valor: depPassagensReparadas,
                          cor: 'bg-indigo-500',
                          percent: totalReparadas > 0 ? Math.round((depPassagensReparadas / totalReparadas) * 100) : 0
                        },
                        {
                          label: 'Dep. Cutover',
                          valor: depCutoverReparadas,
                          cor: 'bg-purple-500',
                          percent: totalReparadas > 0 ? Math.round((depCutoverReparadas / totalReparadas) * 100) : 0
                        },
                        {
                          label: `Fibras Dep. ${selectedOperator}`,
                          valor: fibrasPSMReparadas,
                          cor: 'bg-gray-600',
                          percent: totalReparadas > 0 ? Math.round((fibrasPSMReparadas / totalReparadas) * 100) : 0
                        }
                      ];

                      return tiposDistribuicao.map((tipo, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-gray-100">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`w-2.5 h-2.5 rounded-full ${tipo.cor} flex-shrink-0`}></div>
                              <span className="text-[11px] font-semibold text-gray-600 truncate">{tipo.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl font-bold text-gray-900">{tipo.valor}</span>
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                ({tipo.percent}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* 4 Cards de análise - grid 4 colunas */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Card: Peso de Indisponibilidade */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-blue-900">Peso de Indisponibilidade por Província</h4>
                    </div>
                    <p className="text-xs text-gray-600">Sem dados</p>
                  </div>

                  {/* Card: Mais Produtiva */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-green-900">Mais Produtiva</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-700">Zaire</p>
                    <p className="text-xs text-gray-600">0 fibras reparadas em Q3</p>
                  </div>

                  {/* Card: Efetividade Global - CLICÁVEL PARA ALTERNAR */}
                  <div
                    onClick={() => setEfetividadeMode(efetividadeMode === 'global' ? 'psm' : 'global')}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 cursor-pointer hover:shadow-lg transition-shadow"
                    title="Clique para alternar entre Global e PSM"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-purple-900">
                        Efetividade {efetividadeMode === 'psm' ? 'PSM' : 'Global'}
                      </h4>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-4xl font-bold text-purple-700">
                        {efetividadeMode === 'global'
                          ? efetividadeGlobalMedia.toFixed(1)
                          : efetividadePSMMedia.toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-1">Média {selectedOperator}</p>
                    <p className="text-[10px] text-center text-purple-600 mt-1">🔄 Clique para alternar</p>
                  </div>

                  {/* Card: Precisa Atenção */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-red-900">Precisa Atenção</h4>
                    </div>
                    <p className="text-2xl font-bold text-red-700">Zaire</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold text-red-600">0 Indisponíveis</span>
                      <span className="text-xs font-semibold text-green-600">0 Reparadas</span>
                    </div>
                    <p className="text-xs text-center text-red-600 font-semibold mt-1">Efetividade: 0.0%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: Performance */}
        {currentSlide === 1 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold border-b-4 border-green-500 pb-4">
              🎯 Performance das Rotas
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {summaryCards.map((card, i) => (
                <div key={i} className="bg-slate-800 p-6 rounded-lg">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 2: Comparativa */}
        {currentSlide === 2 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold border-b-4 border-purple-500 pb-4">
              📈 Análise Comparativa
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {summaryCards.map((card, i) => (
                <div key={i} className="bg-slate-800 p-6 rounded-lg">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 3: Classificação */}
        {currentSlide === 3 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold border-b-4 border-orange-500 pb-4">
              📊 Gráficos por Classificação
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {summaryCards.map((card, i) => (
                <div key={i} className="bg-slate-800 p-6 rounded-lg">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 4: Acompanhamento */}
        {currentSlide === 4 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold border-b-4 border-red-500 pb-4">
              🚦 Acompanhamento
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {summaryCards.map((card, i) => (
                <div key={i} className="bg-slate-800 p-6 rounded-lg">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 5: Manual */}
        {currentSlide === 5 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold border-b-4 border-gray-500 pb-4">
              📝 Introdução Manual
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {summaryCards.map((card, i) => (
                <div key={i} className="bg-slate-800 p-6 rounded-lg">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 6: Testes */}
        {currentSlide === 6 && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold border-b-4 border-yellow-500 pb-4">
              🧪 Testes e Análises
            </h2>
            <div className="bg-slate-800 p-6 rounded-lg">
              <p className="text-slate-300 text-lg">Dados de testes para {selectedOperator}</p>
            </div>
          </div>
        )}

      </div>

      {/* MODAL STATUS DRILLDOWN - MODO APRESENTAÇÃO */}
      {showStatusDrilldown && selectedStatusDrilldown && (() => {
        const totalPages = Math.ceil(selectedStatusDrilldown.rotas.length / itemsPerPageDrilldown);
        const startIdx = currentPageDrilldown * itemsPerPageDrilldown;
        const endIdx = startIdx + itemsPerPageDrilldown;
        const currentRotas = selectedStatusDrilldown.rotas.slice(startIdx, endIdx);

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8"
            onClick={() => setShowStatusDrilldown(false)}
          >
            <div
              className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 flex justify-between items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold">📊 {selectedStatusDrilldown.label}</h2>
                  <p className="text-[10px] text-blue-100">
                    {selectedOperator} • {selectedQuarter} • Total: {selectedStatusDrilldown.total}
                  </p>
                </div>
                <button
                  onClick={() => setShowStatusDrilldown(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {currentRotas.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {currentRotas.map((rota, idx) => {
                      const percentage = ((rota.valor / selectedStatusDrilldown.total) * 100).toFixed(1);

                      let reparadas = 0;
                      let percentagemReparadas = 0;

                      if (selectedStatusDrilldown.label.includes('Indisponíveis')) {
                        const quarterLimits = QUARTER_CONFIG[selectedQuarter];
                        for (let i = quarterLimits.start; i <= quarterLimits.end; i++) {
                          const week = 'W' + i;
                          const val = data[selectedOperator]?.[week]?.[rota.rota]?.['Total Reparadas'];
                          if (val) reparadas += parseInt(val) || 0;
                        }
                        if (rota.valor > 0) {
                          percentagemReparadas = ((reparadas / rota.valor) * 100).toFixed(1);
                        }
                      }

                      return (
                        <div key={idx} className="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="text-[10px] font-medium text-gray-800 truncate" title={rota.rota}>
                              {rota.rota}
                            </p>
                            <p className="text-sm font-bold text-blue-600">{rota.valor}</p>
                          </div>

                          <p className="text-[8px] text-gray-500 mb-1">
                            {rota.semana} • {percentage}%
                          </p>

                          <div className="bg-gray-200 rounded-sm h-1.5 overflow-hidden mb-1">
                            <div className="bg-blue-500 h-full" style={{ width: `${percentage}%` }}></div>
                          </div>

                          {reparadas > 0 && (
                            <>
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-[8px] text-gray-500">{percentagemReparadas}%</p>
                                <p className="text-[9px] font-bold text-green-600">{reparadas}</p>
                              </div>
                              <div className="bg-gray-200 rounded-sm h-1.5 overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${percentagemReparadas}%` }}></div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">Sem dados</p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="sticky bottom-0 z-10 bg-white px-2 py-2 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPageDrilldown(Math.max(0, currentPageDrilldown - 1))}
                    disabled={currentPageDrilldown === 0}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded disabled:bg-gray-300"
                  >
                    ◀
                  </button>
                  <span className="text-xs">Pág {currentPageDrilldown + 1}/{totalPages}</span>
                  <button
                    onClick={() => setCurrentPageDrilldown(Math.min(totalPages - 1, currentPageDrilldown + 1))}
                    disabled={currentPageDrilldown >= totalPages - 1}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded disabled:bg-gray-300"
                  >
                    ▶
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default PresentationMode;
