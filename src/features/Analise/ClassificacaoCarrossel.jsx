import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig';
import { QUARTER_CONFIG } from '../../config/quarterConfig';
import { ALL_WEEKS } from '../../config/constants';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE } from '../../config/provinceConfig';
import { getValorReduzido as getValorReduzidoUtil } from '../../utils/valueUtils.js';
import { log } from '../../utils/logger';

const STATUS_COLORS = {
  'Transporte': '#334155',
  'Indisponíveis': '#ef4444',
  'Total Reparadas': '#22c55e',
  'Reconhecidas': '#06b6d4',
  'Dep. de Passagem de Cabo': '#3b82f6',
  'Dep. de Licença': '#f97316',
  'Dep. de Cutover': '#9333ea',
};
const getFibrasDepColor = () => '#475569';

const ClassificacaoCarrossel = ({
  selectedOperator,
  selectedProvince,
  selectedQuarter,
  selectedWeek,
  selectedYear,
  handleRotaClick,
  data,
  distribuicaoReparacoes,
  routesByPsm = STATIC_ROUTES_BY_PSM,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
}) => {
  const [viewMode, setViewMode] = useState('carousel');
  const [viewModeClassificacao, setViewModeClassificacao] = useState('all');
  const [currentGraph, setCurrentGraph] = useState(0);
  const [currentGraphClassificacao, setCurrentGraphClassificacao] = useState(0);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const goToNextGraphClassificacao = () => setCurrentGraphClassificacao((prev) => (prev + 1) % 3);
  const goToPrevGraphClassificacao = () => setCurrentGraphClassificacao((prev) => (prev - 1 + 3) % 3);
  const goToGraphClassificacao = (index) => setCurrentGraphClassificacao(index);
  const toggleViewModeClassificacao = () => setViewModeClassificacao((prev) => (prev === 'carousel' ? 'all' : 'carousel'));

  const quarterWeeks = ALL_WEEKS.slice(
    QUARTER_CONFIG[selectedQuarter].start - 1,
    QUARTER_CONFIG[selectedQuarter].end
  );

  const getValorReduzido = (psm, week, route, tipo) =>
    getValorReduzidoUtil(data, distribuicaoReparacoes, selectedQuarter, selectedYear, QUARTER_CONFIG, psm, week, route, tipo);

  return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            {/* HEADER COM BOTÃO TOGGLE */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  📊 Gráficos por Classificação
                  {selectedProvince !== 'Todas' && <span className="text-blue-600"> | {selectedProvince}</span>}
                </h2>
                
                <button
                  onClick={toggleViewModeClassificacao}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200"
                >
                  {viewModeClassificacao === 'carousel' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <span className="text-sm font-medium">Ver Resumo</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm font-medium">Ver Detalhado</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* CONTEÚDO DA SEÇÃO */}
            <div className="p-6">
              {(() => {
                // Preparar dados das rotas com valores
                // v3.22.0: Calcular dados ACUMULADOS desde a primeira semana com dados até semana selecionada
                const routesData = (routesByPsm[selectedOperator] || [])
                  .map(rota => {
                    // Encontrar primeira semana com dados para esta rota no quadrimestre
                    const quarterWeeks = ALL_WEEKS.slice(
                      QUARTER_CONFIG[selectedQuarter].start - 1,
                      QUARTER_CONFIG[selectedQuarter].end
                    );
                    
                    let primeiraSemanaDados = null;
                    let weekNumSelecionada = parseInt(selectedWeek.substring(1)); // W50 -> 50
                    
                    // Procurar primeira semana com dados
                    for (let week of quarterWeeks) {
                      const weekNum = parseInt(week.substring(1));
                      if (weekNum > weekNumSelecionada) break; // Parar se passou da semana selecionada
                      
                      const weekData = data[selectedOperator]?.[week]?.[rota];
                      if (weekData) {
                        const temDados = (parseInt(weekData['Transporte']) || 0) > 0 ||
                                        (parseInt(weekData['Indisponíveis']) || 0) > 0 ||
                                        (parseInt(weekData['Total Reparadas']) || 0) > 0;
                        if (temDados && !primeiraSemanaDados) {
                          primeiraSemanaDados = week;
                          break;
                        }
                      }
                    }
                    
                    // Se não há dados até a semana selecionada, retornar vazio
                    if (!primeiraSemanaDados) {
                      return null;
                    }
                    
                    // Calcular valores ACUMULADOS desde primeira semana até semana selecionada
                    let transporte = 0;
                    let indisponiveis = 0;
                    let totalReparadas = 0;
                    let reconhecidas = 0;
                    let depPassagem = 0;
                    let depLicenca = 0;
                    let depCutover = 0;
                    let fibrasDep = 0;
                    
                    for (let week of quarterWeeks) {
                      const weekNum = parseInt(week.substring(1));
                      if (weekNum > weekNumSelecionada) break; // Parar na semana selecionada
                      
                      const weekData = data[selectedOperator]?.[week]?.[rota];
                      if (weekData && weekNum >= parseInt(primeiraSemanaDados.substring(1))) {
                        // Transporte e Indisponíveis: pegar último valor (não somar)
                        const transporteVal = parseInt(weekData['Transporte']) || 0;
                        const indisponiveisVal = parseInt(weekData['Indisponíveis']) || 0;
                        if (transporteVal > 0) transporte = transporteVal;
                        if (indisponiveisVal > 0) indisponiveis = indisponiveisVal;
                        
                        // Total Reparadas: SOMAR (acumulado) - ÚNICO QUE ACUMULA
                        totalReparadas += parseInt(weekData['Total Reparadas'], 10) || 0;
                        
                        // V5.08.3: Usar valores REDUZIDOS (com desconto aplicado)
                        // Reconhecidas, Dependências e Fibras Dep.: pegar último valor REDUZIDO
                        const reconhecidasVal = getValorReduzido(selectedOperator, week, rota, 'Reconhecidas');
                        const depPassagemVal = getValorReduzido(selectedOperator, week, rota, 'Dep. de Passagem de Cabo');
                        const depLicencaVal = getValorReduzido(selectedOperator, week, rota, 'Dep. de Licença');
                        const depCutoverVal = getValorReduzido(selectedOperator, week, rota, 'Dep. de Cutover');
                        const fibrasDepVal = getValorReduzido(selectedOperator, week, rota, `Fibras dependentes da ${selectedOperator}`);
                        
                        if (reconhecidasVal > 0) reconhecidas = reconhecidasVal;
                        if (depPassagemVal > 0) depPassagem = depPassagemVal;
                        if (depLicencaVal > 0) depLicenca = depLicencaVal;
                        if (depCutoverVal > 0) depCutover = depCutoverVal;
                        if (fibrasDepVal > 0) fibrasDep = fibrasDepVal;
                      }
                    }
                    
                    return {
                      rota,
                      transporte,
                      indisponiveis,
                      totalReparadas, // Acumulado desde primeira semana
                      reconhecidas,
                      depPassagem,
                      depLicenca,
                      depCutover,
                      fibrasDep,
                      primeiraSemanaDados // Para debug
                    };
                  })
                  .filter(r => r !== null) // Remover rotas sem dados até semana selecionada
                  .filter(r => (r.transporte + r.indisponiveis + r.totalReparadas + r.reconhecidas + r.depPassagem + r.depLicenca + r.depCutover + r.fibrasDep) > 0)
                  // v3.20.0 FASE 4: Filtrar por província ANTES da classificação (afeta DADOS GERAIS)
                  .filter(r => selectedProvince === 'Todas' || routeToProvince[r.rota] === selectedProvince);
                
                log('📊 GRÁFICOS POR CLASSIFICAÇÃO - Acumulado desde introdução:', {
                  provincia: selectedProvince,
                  semanaSelecionada: selectedWeek,
                  totalRotas: (routesByPsm[selectedOperator] || []).length,
                  rotasComDados: routesData.length,
                  amostra: routesData.slice(0, 2).map(r => ({
                    rota: r.rota,
                    primeira: r.primeiraSemanaDados,
                    reparadas: r.totalReparadas
                  }))
                });
                
                // CLASSIFICAR ROTAS BASEADO EM: Transporte vs Indisponíveis
                let rotasDegradadas = routesData.filter(r => r.transporte < r.indisponiveis);
                let rotasComGanho = routesData.filter(r => r.transporte > r.indisponiveis);
                let rotasEstaveis = routesData.filter(r => r.transporte === r.indisponiveis);
                
                // FASE 1: Filtro adicional removido - já filtrado acima
                // (mantido para compatibilidade mas não faz nada pois routesData já está filtrado)
                
                // FASE 2: Renderizar Dashboard Provincial (se província selecionada)
                const renderProvincialDashboard = () => {
                  if (selectedProvince === 'Todas') return null;
                  
                  const psmRoutes = routesByPsm[selectedOperator] || [];
                  const rotasProvincia = Object.entries(routeToProvince)
                    .filter(([_, prov]) => prov === selectedProvince)
                    .map(([rota]) => rota)
                    .filter(rota => psmRoutes.includes(rota));
                  
                  const rotasDegradadasProv = routesData.filter(r => r.transporte < r.indisponiveis && routeToProvince[r.rota] === selectedProvince);
                  const rotasGanhoProv = routesData.filter(r => r.transporte > r.indisponiveis && routeToProvince[r.rota] === selectedProvince);
                  const rotasEstaveisProv = routesData.filter(r => r.transporte === r.indisponiveis && routeToProvince[r.rota] === selectedProvince);
                  
                  const totalTransporte = routesData.filter(r => routeToProvince[r.rota] === selectedProvince).reduce((sum, r) => sum + r.transporte, 0);
                  const totalIndisponiveis = routesData.filter(r => routeToProvince[r.rota] === selectedProvince).reduce((sum, r) => sum + r.indisponiveis, 0);
                  const totalReparadas = routesData.filter(r => routeToProvince[r.rota] === selectedProvince).reduce((sum, r) => sum + r.totalReparadas, 0);
                  const totalGeral = totalTransporte + totalIndisponiveis + totalReparadas;
                  
                  return (
                    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span className="text-lg font-bold text-blue-900">{selectedProvince}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-3 text-sm">
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <span className="text-gray-600 block text-xs">Total Rotas</span>
                          <span className="font-bold text-xl text-gray-900">{rotasProvincia.length}</span>
                        </div>
                        <div className="bg-red-50 p-2 rounded border border-red-200">
                          <span className="text-gray-600 block text-xs">Degradadas</span>
                          <span className="font-bold text-xl text-red-600">{rotasDegradadasProv.length}</span>
                        </div>
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <span className="text-gray-600 block text-xs">Com Ganho</span>
                          <span className="font-bold text-xl text-green-600">{rotasGanhoProv.length}</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <span className="text-gray-600 block text-xs">Estáveis</span>
                          <span className="font-bold text-xl text-blue-600">{rotasEstaveisProv.length}</span>
                        </div>
                        <div className="bg-purple-50 p-2 rounded border border-purple-200">
                          <span className="text-gray-600 block text-xs">Total Fibras</span>
                          <span className="font-bold text-xl text-purple-600">{totalGeral}</span>
                        </div>
                      </div>
                    </div>
                  );
                };
                
                const colors = {
                  transporte: STATUS_COLORS['Transporte'],
                  indisponiveis: STATUS_COLORS['Indisponíveis'],
                  totalReparadas: STATUS_COLORS['Total Reparadas'],
                  reconhecidas: STATUS_COLORS['Reconhecidas'],
                  depPassagem: STATUS_COLORS['Dep. de Passagem de Cabo'],
                  depLicenca: STATUS_COLORS['Dep. de Licença'],
                  depCutover: STATUS_COLORS['Dep. de Cutover'],
                  fibrasDep: getFibrasDepColor(),
                };
                
                // Função para renderizar gráfico com ROTAS INDIVIDUAIS (nome completo, barras alinhadas)
                const renderCompactRoutesChart = (routes, title, borderColor, maxNameWidth) => {
                  const containerClass = borderColor === 'red' ? 'bg-white rounded-lg border-2 border-red-400 p-3 shadow-lg h-full flex flex-col overflow-hidden' :
                                        borderColor === 'green' ? 'bg-white rounded-lg border-2 border-green-400 p-3 shadow-lg h-full flex flex-col overflow-hidden' :
                                        'bg-white rounded-lg border-2 border-blue-400 p-3 shadow-lg h-full flex flex-col overflow-hidden';
                  
                  const headerClass = borderColor === 'red' ? 'bg-gradient-to-r from-red-50 to-red-100 -mx-3 -mt-3 px-3 py-2 mb-2 border-b-2 border-red-300' :
                                     borderColor === 'green' ? 'bg-gradient-to-r from-green-50 to-green-100 -mx-3 -mt-3 px-3 py-2 mb-2 border-b-2 border-green-300' :
                                     'bg-gradient-to-r from-blue-50 to-blue-100 -mx-3 -mt-3 px-3 py-2 mb-2 border-b-2 border-blue-300';
                  
                  if (!routes || routes.length === 0) {
                    return (
                      <div className={containerClass}>
                        <div className={headerClass}>
                          <h3 className="text-center text-xs font-bold text-gray-800">{title}</h3>
                        </div>
                        <div className="flex items-center justify-center flex-1">
                          <p className="text-gray-500 text-xs">Sem rotas</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Calcular valor máximo para escala (incluindo Total Reparadas)
                  const maxValue = Math.max(...routes.map(r => r.transporte + r.indisponiveis + r.totalReparadas));
                  
                  // Altura dinâmica baseada no número de rotas
                  const barHeight = routes.length <= 3 ? 'h-6' : routes.length <= 5 ? 'h-5' : routes.length <= 8 ? 'h-4' : 'h-3.5';
                  const fontSize = routes.length <= 5 ? 'text-[10px]' : 'text-[9px]';
                  
                  return (
                    <div className={containerClass}>
                      <div className={headerClass}>
                        <h3 className="text-center text-xs font-bold text-gray-800">{title}</h3>
                      </div>
                      <p className="text-center text-[10px] font-semibold mb-2">Total: {routes.length} rotas</p>
                      
                      {/* Legenda COMPLETA - 3 status */}
                      <div className="flex justify-center gap-3 mb-2 text-[9px]">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2" style={{backgroundColor: colors.transporte}}></div>
                          <span>Transp.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2" style={{backgroundColor: colors.indisponiveis}}></div>
                          <span>Indisp.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2" style={{backgroundColor: colors.totalReparadas}}></div>
                          <span>Reparadas</span>
                        </div>
                      </div>
                      
                      {/* Todas as rotas - Barras alinhadas após nome mais longo */}
                      <div className="flex-1 flex flex-col justify-evenly min-h-0 gap-0.5">
                        {routes.map((route, idx) => {
                          const transpWidth = maxValue > 0 ? (route.transporte / maxValue) * 100 : 0;
                          const indispWidth = maxValue > 0 ? (route.indisponiveis / maxValue) * 100 : 0;
                          const reparadasWidth = maxValue > 0 ? (route.totalReparadas / maxValue) * 100 : 0;
                          
                          // v3.22.1: Verificar se tem reparação na semana selecionada
                          const weekData = data[selectedOperator]?.[selectedWeek]?.[route.rota];
                          const reparadasNaSemana = weekData ? (parseInt(weekData['Total Reparadas']) || 0) : 0;
                          const temReparacao = reparadasNaSemana > 0;
                          
                          return (
                            <div key={idx} className="flex items-center gap-1.5 min-w-0">
                              {/* Nome COMPLETO - VERDE se tem reparação */}
                              <div 
                                className={`${fontSize} font-medium flex-shrink-0 ${temReparacao ? 'text-green-600 font-bold' : 'text-gray-700'}`}
                                style={{ width: `${maxNameWidth}px` }}
                                title={route.rota}
                              >
                                {route.rota}
                              </div>
                              
                              {/* Barra empilhada - 3 segmentos: T + I + R */}
                              <div className={`flex ${barHeight} bg-gray-100 rounded overflow-hidden border border-gray-300 flex-1 min-w-0`}>
                                {/* Segmento Transporte */}
                                {route.transporte > 0 && (
                                  <div 
                                    className={`flex items-center justify-center text-white font-bold ${fontSize}`}
                                    style={{
                                      width: `${transpWidth}%`,
                                      backgroundColor: colors.transporte,
                                      minWidth: '0'
                                    }}
                                  >
                                    {route.transporte}
                                  </div>
                                )}
                                
                                {/* Segmento Indisponíveis */}
                                {route.indisponiveis > 0 && (
                                  <div 
                                    className={`flex items-center justify-center text-white font-bold ${fontSize}`}
                                    style={{
                                      width: `${indispWidth}%`,
                                      backgroundColor: colors.indisponiveis,
                                      minWidth: '0'
                                    }}
                                  >
                                    {route.indisponiveis}
                                  </div>
                                )}
                                
                                {/* Segmento Total Reparadas */}
                                {route.totalReparadas > 0 && (
                                  <div 
                                    className={`flex items-center justify-center text-white font-bold ${fontSize}`}
                                    style={{
                                      width: `${reparadasWidth}%`,
                                      backgroundColor: colors.totalReparadas,
                                      minWidth: '0'
                                    }}
                                  >
                                    {route.totalReparadas}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                };
                
                // Função para renderizar gráfico DADOS GERAIS (barra horizontal empilhada - 8 status)
                const renderCompactChart = (routes, title, borderColor) => {
                  const containerClass = 'bg-white rounded-lg border-2 border-gray-400 p-3 shadow-lg h-full flex flex-col';
                  const headerClass = 'bg-gradient-to-r from-gray-50 to-gray-100 -mx-3 -mt-3 px-3 py-2 mb-3 border-b-2 border-gray-300';
                  
                  if (!routes || routes.length === 0) {
                    return (
                      <div className={containerClass}>
                        <div className={headerClass}>
                          <h3 className="text-center text-sm font-bold text-gray-800">{title}</h3>
                        </div>
                        <div className="flex items-center justify-center flex-1">
                          <p className="text-gray-500 text-sm">Sem dados</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // V5.08.6: Calcular totais
                  // Transporte é ISOLADO (mostra valor mas não entra em percentagem)
                  const totals = {
                    transporte: routes.reduce((sum, r) => sum + r.transporte, 0),
                    totalReparadas: routes.reduce((sum, r) => sum + r.totalReparadas, 0),
                    reconhecidas: routes.reduce((sum, r) => sum + r.reconhecidas, 0),
                    depPassagem: routes.reduce((sum, r) => sum + r.depPassagem, 0),
                    depLicenca: routes.reduce((sum, r) => sum + r.depLicenca, 0),
                    depCutover: routes.reduce((sum, r) => sum + r.depCutover, 0),
                    fibrasDep: routes.reduce((sum, r) => sum + r.fibrasDep, 0)
                  };
                  
                  // V5.08.6: Indisponíveis = soma das subcategorias
                  totals.indisponiveis = totals.reconhecidas + totals.depPassagem + 
                                         totals.depLicenca + totals.depCutover + totals.fibrasDep;
                  
                  // V5.08.7: Total para percentagem = APENAS Reparadas + Indisponíveis
                  // Transporte NÃO entra no cálculo de percentagem (isolado)
                  const totalSum = totals.totalReparadas + totals.indisponiveis;
                  
                  // V5.08.7: Total GERAL para largura da barra (inclui Transporte)
                  const totalGeral = totals.transporte + totals.totalReparadas + totals.indisponiveis;
                  
                  const statusLabels = {
                    transporte: 'Transporte', // V5.08.6: Isolado (sem %)
                    totalReparadas: 'Total Reparadas',
                    indisponiveis: 'Indisponíveis',
                    reconhecidas: 'Reconhecidas',
                    depPassagem: 'Dep. Passagem',
                    depLicenca: 'Dep. Licença',
                    depCutover: 'Dep. Cutover',
                    fibrasDep: 'Fibras Dep.'
                  };
                  
                  return (
                    <div className={containerClass}>
                      <div className={headerClass}>
                        <h3 className="text-center text-sm font-bold text-gray-800">{title}</h3>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center px-4">
                        <p className="text-center text-xs font-semibold mb-3">Total: {routes.length} rotas</p>
                        
                        {/* V5.08.14: Barra com subtipos ordenados CRESCENTE + FONTE FIXA 10px */}
                        <div className="mb-4">
                          <div className="flex h-10 bg-gray-100 rounded overflow-hidden border-2 border-gray-300 shadow-sm">
                            {(() => {
                              // V5.08.12: Ordenar subtipos por valor crescente
                              const subtipos = ['reconhecidas', 'depPassagem', 'depLicenca', 'depCutover', 'fibrasDep'];
                              const subtiposOrdenados = subtipos
                                .map(key => ({ key, value: totals[key] }))
                                .sort((a, b) => a.value - b.value) // Crescente
                                .map(item => item.key);
                              
                              // Ordem final: Transporte → Indisponíveis → Subtipos (crescente) → Total Reparadas
                              const ordem = ['transporte', 'indisponiveis', ...subtiposOrdenados, 'totalReparadas'];
                              
                              return ordem.map(key => {
                                const value = totals[key];
                                if (value === 0) return null;
                                
                                const width = (value / totalGeral) * 100;
                                
                                // V5.08.14: FONTE FIXA - sempre 10px, nunca reduz
                                
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center justify-center text-white font-bold text-[10px]"
                                    style={{
                                      width: `${width}%`,
                                      backgroundColor: colors[key]
                                    }}
                                    title={`${statusLabels[key]}: ${value}`}
                                  >
                                    <span className="px-0.5">{value}</span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                        
                        {/* V5.08.12: Legenda com subtipos em ordem CRESCENTE */}
                        <div className="flex justify-center items-start gap-6 text-[10px]">
                          {/* Transporte */}
                          {totals.transporte > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{backgroundColor: colors.transporte}}></div>
                              <span className="whitespace-nowrap font-medium">
                                <strong>Transporte:</strong> {totals.transporte}
                              </span>
                            </div>
                          )}
                          
                          {/* Indisponíveis com subtipos abaixo (ordenados crescente) */}
                          {totals.indisponiveis > 0 && (
                            <div className="flex flex-col items-start">
                              {/* Indisponíveis principal */}
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{backgroundColor: colors.indisponiveis}}></div>
                                <span className="whitespace-nowrap font-medium">
                                  <strong>Indisponíveis:</strong> {totals.indisponiveis}
                                  <span className="text-gray-600"> ({((totals.indisponiveis / totalSum) * 100).toFixed(1)}%)</span>
                                </span>
                              </div>
                              
                              {/* V5.08.12: Subtipos ORDENADOS por valor crescente */}
                              <div className="flex flex-col gap-0.5 pl-5 text-[9px]">
                                {(() => {
                                  const subtipos = ['reconhecidas', 'depPassagem', 'depLicenca', 'depCutover', 'fibrasDep'];
                                  
                                  // Ordenar por valor crescente
                                  return subtipos
                                    .map(key => ({ key, value: totals[key] }))
                                    .sort((a, b) => a.value - b.value)
                                    .map(({ key, value }) => {
                                      if (value === 0) return null;
                                      
                                      const percentage = totals.indisponiveis > 0 
                                        ? ((value / totals.indisponiveis) * 100).toFixed(1) 
                                        : 0;
                                      
                                      return (
                                        <div key={key} className="flex items-center gap-1.5">
                                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{backgroundColor: colors[key]}}></div>
                                          <span className="whitespace-nowrap">
                                            {statusLabels[key]}: <strong>{value}</strong>
                                            <span className="text-gray-500"> ({percentage}%)</span>
                                          </span>
                                        </div>
                                      );
                                    });
                                })()}
                              </div>
                            </div>
                          )}
                          
                          {/* Total Reparadas */}
                          {totals.totalReparadas > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{backgroundColor: colors.totalReparadas}}></div>
                              <span className="whitespace-nowrap font-medium">
                                <strong>Total Reparadas:</strong> {totals.totalReparadas}
                                <span className="text-gray-600"> ({((totals.totalReparadas / totalSum) * 100).toFixed(1)}%)</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                };
                
                // Função para renderizar um gráfico
                const renderChart = (routes, title, borderColor, bgColor, dotColor) => {
                  if (routes.length === 0) {
                    return (
                      <div className={bgColor === 'red' ? 'bg-red-50 rounded-lg border-2 border-red-200 p-8 text-center' : 
                                     bgColor === 'green' ? 'bg-green-50 rounded-lg border-2 border-green-200 p-8 text-center' : 
                                     'bg-blue-50 rounded-lg border-2 border-blue-200 p-8 text-center'}>
                        <p className={borderColor === 'red' ? 'text-red-600 font-semibold' : 
                                     borderColor === 'green' ? 'text-green-600 font-semibold' : 
                                     'text-blue-600 font-semibold'}>
                          ✓ Sem rotas {title.toLowerCase()} em {selectedWeek}
                        </p>
                      </div>
                    );
                  }
                  
                  const maxValue = Math.max(...routes.map(r => 
                    Math.max(r.transporte, r.indisponiveis, r.totalReparadas, r.reconhecidas, r.depPassagem, r.depLicenca, r.depCutover, r.fibrasDep)
                  ));
                  
                  // LARGURAS DINÂMICAS baseadas no número de rotas
                  const numRotas = routes.length;
                  const containerWidth = 1200; // Largura fixa do container
                  const margins = 200; // Margens lateral
                  const availableWidth = containerWidth - margins;
                  
                  // Calcular largura de cada grupo dinamicamente
                  const groupGap = numRotas <= 5 ? 40 : numRotas <= 10 ? 20 : 10;
                  const totalGaps = (numRotas - 1) * groupGap;
                  const widthPerGroup = (availableWidth - totalGaps) / numRotas;
                  
                  // Calcular largura de cada barra (8 barras por grupo)
                  const barGap = 2;
                  const totalBarGaps = 7 * barGap; // 7 gaps entre 8 barras
                  const barWidth = Math.max(3, (widthPerGroup - totalBarGaps) / 8); // Mínimo 3px
                  
                  const groupWidth = (barWidth * 8) + totalBarGaps;
                  const svgWidth = containerWidth;
                  
                  // v3.24.1: Altura dinâmica baseada no número de rotas
                  // Menos rotas = menos espaço para nomes oblíquos
                  const labelSpaceNeeded = numRotas <= 3 ? 60 : numRotas <= 6 ? 80 : numRotas <= 10 ? 100 : 110;
                  const svgHeight = 280 + labelSpaceNeeded; // Base 280 + espaço para labels
                  
                  const chartTop = 50;
                  const chartBottom = svgHeight - labelSpaceNeeded;
                  const chartHeight = chartBottom - chartTop;
                  
                  // Classes fixas por cor
                  const containerClass = borderColor === 'red' ? 'bg-white rounded-lg shadow-xl border-2 border-red-400 p-6' :
                                        borderColor === 'green' ? 'bg-white rounded-lg shadow-xl border-2 border-green-400 p-6' :
                                        'bg-white rounded-lg shadow-xl border-2 border-blue-400 p-6';
                  
                  const headerClass = borderColor === 'red' ? 'bg-gradient-to-r from-red-50 to-white border-b-2 border-red-300 pb-4 mb-4 -mx-6 -mt-6 px-6 pt-4' :
                                     borderColor === 'green' ? 'bg-gradient-to-r from-green-50 to-white border-b-2 border-green-300 pb-4 mb-4 -mx-6 -mt-6 px-6 pt-4' :
                                     'bg-gradient-to-r from-blue-50 to-white border-b-2 border-blue-300 pb-4 mb-4 -mx-6 -mt-6 px-6 pt-4';
                  
                  const dotClass = borderColor === 'red' ? 'w-3 h-3 bg-red-500 rounded-full' :
                                  borderColor === 'green' ? 'w-3 h-3 bg-green-500 rounded-full' :
                                  'w-3 h-3 bg-blue-500 rounded-full';
                  
                  const totalClass = borderColor === 'red' ? 'font-bold text-sm text-red-600' :
                                    borderColor === 'green' ? 'font-bold text-sm text-green-600' :
                                    'font-bold text-sm text-blue-600';
                  
                  return (
                    <div className={containerClass} style={{ position: 'relative' }}>
                      {/* v3.25.0: Estilos para hover */}
                      <style>{`
                        .rota-group:hover .hover-bg {
                          opacity: 0.6 !important;
                        }
                        .rota-group:hover .bar-rect {
                          filter: brightness(1.15);
                          stroke: #1e40af !important;
                          stroke-width: 2 !important;
                        }
                        .rota-group text {
                          transition: all 0.2s ease;
                        }
                        .rota-group:hover text {
                          font-weight: bold !important;
                          filter: brightness(0.85);
                        }
                      `}</style>
                      
                      {/* HEADER DO GRÁFICO */}
                      <div className={headerClass}>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <div className={dotClass}></div>
                            <h3 className="text-lg font-bold text-gray-800">{title} - {selectedOperator}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{selectedWeek} - Quadrimestre {selectedQuarter} {selectedYear}</p>
                        </div>
                      </div>
                      
                      <div className="text-center mb-3">
                        <p className="text-xs text-gray-600">
                          Total de rotas: <span className={totalClass}>{routes.length}</span>
                        </p>
                      </div>
                      
                      {/* v3.24.0: LEGENDA NO TOPO para otimizar espaço */}
                      <div className="mb-4 flex justify-center">
                        <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                          {[
                            { label: 'Transporte', color: colors.transporte },
                            { label: 'Indisponíveis', color: colors.indisponiveis },
                            { label: 'Total Reparadas', color: colors.totalReparadas },
                            { label: 'Reconhecidas', color: colors.reconhecidas },
                            { label: 'Dep. Passagem', color: colors.depPassagem },
                            { label: 'Dep. Licença', color: colors.depLicenca },
                            { label: 'Dep. Cutover', color: colors.depCutover },
                            { label: `Fibras Dep. ${selectedOperator}`, color: colors.fibrasDep }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{backgroundColor: item.color}}></div>
                              <span className="text-[10px] text-gray-600">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* SEM overflow-x-auto - Tudo cabe na largura fixa */}
                      <div className="flex justify-center">
                        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
                          {/* Grid horizontal */}
                          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                            const y = chartBottom - (pct * chartHeight);
                            const value = Math.round(pct * maxValue);
                            return (
                              <g key={pct}>
                                <line x1="80" y1={y} x2={svgWidth - 40} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                                <text x="70" y={y + 4} fontSize="10" fill="#6b7280" textAnchor="end">{value}</text>
                              </g>
                            );
                          })}
                          
                          {/* Barras agrupadas */}
                          {routes.map((route, idx) => {
                            const x = 100 + (idx * (groupWidth + groupGap));
                            const bars = [
                              { value: route.transporte, color: colors.transporte, label: 'Transporte' },
                              { value: route.indisponiveis, color: colors.indisponiveis, label: 'Indisponíveis' },
                              { value: route.totalReparadas, color: colors.totalReparadas, label: 'Total Reparadas' },
                              { value: route.reconhecidas, color: colors.reconhecidas, label: 'Reconhecidas' },
                              { value: route.depPassagem, color: colors.depPassagem, label: 'Dep. Passagem' },
                              { value: route.depLicenca, color: colors.depLicenca, label: 'Dep. Licença' },
                              { value: route.depCutover, color: colors.depCutover, label: 'Dep. Cutover' },
                              { value: route.fibrasDep, color: colors.fibrasDep, label: 'Fibras Dep.' }
                            ];
                            
                            return (
                              <g 
                                key={idx}
                                className="rota-group"
                                style={{cursor: 'pointer'}}
                                onClick={() => handleRotaClick(route.rota)}
                                onMouseEnter={() => {
                                  setTooltipData({
                                    rota: route.rota,
                                    transporte: route.transporte,
                                    indisponiveis: route.indisponiveis,
                                    totalReparadas: route.totalReparadas,
                                    reconhecidas: route.reconhecidas,
                                    depPassagem: route.depPassagem,
                                    depLicenca: route.depLicenca,
                                    depCutover: route.depCutover,
                                    fibrasDep: route.fibrasDep
                                  });
                                }}
                                onMouseMove={(e) => {
                                  // v3.26.0: Capturar posição do mouse relativa ao SVG
                                  const svg = e.currentTarget.ownerSVGElement;
                                  const pt = svg.createSVGPoint();
                                  pt.x = e.clientX;
                                  pt.y = e.clientY;
                                  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
                                  setTooltipPosition({ x: svgP.x, y: svgP.y });
                                }}
                                onMouseLeave={() => {
                                  setTooltipData(null);
                                }}
                              >
                                {/* v3.25.1: Área invisível de hover (sem title SVG nativo) */}
                                <rect
                                  x={x - 5}
                                  y={chartTop - 10}
                                  width={groupWidth + 10}
                                  height={svgHeight - chartTop}
                                  fill="transparent"
                                  className="hover-area"
                                />
                                
                                {/* Retângulo de fundo que aparece no hover */}
                                <rect
                                  x={x - 5}
                                  y={chartTop - 10}
                                  width={groupWidth + 10}
                                  height={chartBottom - chartTop + 15}
                                  fill="#f0f9ff"
                                  opacity="0"
                                  className="hover-bg"
                                  pointerEvents="none"
                                />
                                
                                {bars.map((bar, barIdx) => {
                                  const barX = x + (barIdx * (barWidth + barGap));
                                  const barHeight = (bar.value / maxValue) * chartHeight;
                                  const barY = chartBottom - barHeight;
                                  
                                  return (
                                    <g key={barIdx}>
                                      {bar.value > 0 && (
                                        <>
                                          <rect
                                            x={barX}
                                            y={barY}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={bar.color}
                                            stroke="#fff"
                                            strokeWidth="1"
                                            rx="2"
                                            className="bar-rect"
                                          />
                                          <text
                                            x={barX + barWidth / 2}
                                            y={barY - 4}
                                            fontSize="9"
                                            fontWeight="bold"
                                            fill={bar.color}
                                            textAnchor="middle"
                                            pointerEvents="none"
                                          >
                                            {bar.value}
                                          </text>
                                        </>
                                      )}
                                    </g>
                                  );
                                })}
                                
                                {/* v3.24.4: Nomes ALINHADOS na mesma linha vertical */}
                                {(() => {
                                  // Verificar reparação na semana
                                  const weekData = data[selectedOperator]?.[selectedWeek]?.[route.rota];
                                  const reparadasNaSemana = weekData ? (parseInt(weekData['Total Reparadas']) || 0) : 0;
                                  const temReparacao = reparadasNaSemana > 0;
                                  const textColor = temReparacao ? "#16a34a" : "#4b5563"; // Verde ou cinza
                                  const fontWeight = temReparacao ? "bold" : "normal";
                                  
                                  // Quebrar no hífen
                                  const parts = route.rota.split(' - ');
                                  const parte1 = parts[0] || '';
                                  const parte2 = parts[1] || '';
                                  
                                  // Ponto de ancoragem ABAIXO do eixo
                                  const anchorY = chartBottom + 5;
                                  const baseX = x + groupWidth / 2;
                                  
                                  // v3.24.4: Para rotação -45°, ajustar X da segunda linha
                                  // Se Y aumenta 12px, X deve aumentar 12px para manter alinhamento vertical
                                  const deltaY = 12;
                                  const deltaX = deltaY; // Mesmo valor para -45°
                                  
                                  return (
                                    <>
                                      {/* Primeira parte */}
                                      <text
                                        x={baseX}
                                        y={anchorY}
                                        fontSize="9"
                                        fill={textColor}
                                        fontWeight={fontWeight}
                                        textAnchor="end"
                                        transform={`rotate(-45 ${baseX} ${anchorY})`}
                                      >
                                        {parte1}
                                      </text>
                                      
                                      {/* Segunda parte - X ajustado para alinhar */}
                                      {parte2 && (
                                        <text
                                          x={baseX + deltaX}
                                          y={anchorY + deltaY}
                                          fontSize="9"
                                          fill={textColor}
                                          fontWeight={fontWeight}
                                          textAnchor="end"
                                          transform={`rotate(-45 ${baseX + deltaX} ${anchorY + deltaY})`}
                                        >
                                          {parte2}
                                        </text>
                                      )}
                                    </>
                                  );
                                })()}
                              </g>
                            );
                          })}
                          
                          {/* v3.26.1: Tooltip SVG melhorado */}
                          {tooltipData && tooltipPosition && (() => {
                            // v3.26.1: Largura maior para evitar sobreposição
                            const tooltipWidth = 240;
                            const tooltipPadding = 10;
                            const isRightSide = tooltipPosition.x > svgWidth / 2;
                            const tooltipX = isRightSide ? 
                              tooltipPosition.x - tooltipWidth - tooltipPadding : 
                              tooltipPosition.x + tooltipPadding;
                            const tooltipY = tooltipPosition.y - 10;
                            
                            // v3.26.1: Quebrar nome no hífen
                            const rotaParts = tooltipData.rota.split(' - ');
                            const rotaParte1 = rotaParts[0] || '';
                            const rotaParte2 = rotaParts[1] || '';
                            
                            // Contar quantos status têm valor > 0 com cores corretas
                            const statusList = [];
                            if (tooltipData.transporte > 0) statusList.push({ 
                              label: 'Transporte', 
                              value: tooltipData.transporte, 
                              textColor: '#fff',
                              dotColor: colors.transporte 
                            });
                            if (tooltipData.indisponiveis > 0) statusList.push({ 
                              label: 'Indisponíveis', 
                              value: tooltipData.indisponiveis, 
                              textColor: '#ef4444',
                              dotColor: colors.indisponiveis 
                            });
                            if (tooltipData.totalReparadas > 0) statusList.push({ 
                              label: 'Total Reparadas', 
                              value: tooltipData.totalReparadas, 
                              textColor: '#22c55e',
                              dotColor: colors.totalReparadas 
                            });
                            if (tooltipData.reconhecidas > 0) statusList.push({ 
                              label: 'Reconhecidas', 
                              value: tooltipData.reconhecidas, 
                              textColor: '#fff',
                              dotColor: colors.reconhecidas 
                            });
                            if (tooltipData.depPassagem > 0) statusList.push({ 
                              label: 'Dep. de Passagem de Cabo', 
                              value: tooltipData.depPassagem, 
                              textColor: '#fff',
                              dotColor: colors.depPassagem 
                            });
                            if (tooltipData.depLicenca > 0) statusList.push({ 
                              label: 'Dep. de Licença', 
                              value: tooltipData.depLicenca, 
                              textColor: '#fff',
                              dotColor: colors.depLicenca 
                            });
                            if (tooltipData.depCutover > 0) statusList.push({ 
                              label: 'Dep. de Cutover', 
                              value: tooltipData.depCutover, 
                              textColor: '#fff',
                              dotColor: colors.depCutover 
                            });
                            if (tooltipData.fibrasDep > 0) statusList.push({ 
                              label: `Fibras dependentes da ${selectedOperator}`, 
                              value: tooltipData.fibrasDep, 
                              textColor: '#fff',
                              dotColor: colors.fibrasDep 
                            });
                            
                            const lineHeight = 16;
                            const headerHeight = rotaParte2 ? 38 : 24; // Mais alto se tem 2 linhas
                            const tooltipHeight = headerHeight + (statusList.length * lineHeight) + 16;
                            
                            return (
                              <g style={{ transition: 'all 0.15s ease-out' }}>
                                {/* Fundo do tooltip */}
                                <rect
                                  x={tooltipX}
                                  y={tooltipY}
                                  width={tooltipWidth}
                                  height={tooltipHeight}
                                  fill="rgba(31, 41, 55, 0.95)"
                                  stroke="#60a5fa"
                                  strokeWidth="1"
                                  rx="6"
                                  filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"
                                />
                                
                                {/* v3.26.1: Título quebrado em 2 linhas */}
                                <text
                                  x={tooltipX + 10}
                                  y={tooltipY + 15}
                                  fontSize="12"
                                  fontWeight="bold"
                                  fill="white"
                                >
                                  {rotaParte1}
                                </text>
                                {rotaParte2 && (
                                  <text
                                    x={tooltipX + 10}
                                    y={tooltipY + 30}
                                    fontSize="12"
                                    fontWeight="bold"
                                    fill="white"
                                  >
                                    {rotaParte2}
                                  </text>
                                )}
                                
                                {/* Linha separadora */}
                                <line
                                  x1={tooltipX + 10}
                                  y1={tooltipY + headerHeight}
                                  x2={tooltipX + tooltipWidth - 10}
                                  y2={tooltipY + headerHeight}
                                  stroke="rgba(255, 255, 255, 0.2)"
                                  strokeWidth="1"
                                />
                                
                                {/* Status com bolinhas coloridas */}
                                {statusList.map((status, idx) => (
                                  <g key={idx}>
                                    {/* v3.26.1: Bolinha colorida */}
                                    <circle
                                      cx={tooltipX + 15}
                                      cy={tooltipY + headerHeight + 8 + (idx * lineHeight)}
                                      r="4"
                                      fill={status.dotColor}
                                    />
                                    
                                    {/* Label */}
                                    <text
                                      x={tooltipX + 24}
                                      y={tooltipY + headerHeight + 12 + (idx * lineHeight)}
                                      fontSize="10"
                                      fill="#9ca3af"
                                    >
                                      {status.label}:
                                    </text>
                                    
                                    {/* Valor alinhado à direita */}
                                    <text
                                      x={tooltipX + tooltipWidth - 10}
                                      y={tooltipY + headerHeight + 12 + (idx * lineHeight)}
                                      fontSize="10"
                                      fontWeight="bold"
                                      fill={status.textColor}
                                      textAnchor="end"
                                    >
                                      {status.value}
                                    </text>
                                  </g>
                                ))}
                              </g>
                            );
                          })()}
                        </svg>
                      </div>
                      
                    </div>
                  );
                };
                
                return (
                  <div>
                    {/* Renderizar Dashboard Provincial */}
                    {renderProvincialDashboard()}
                    
                    {/* Gráficos */}
                    {(() => {
                      // MODO VER TODOS (LAYOUT DINÂMICO INTELIGENTE)
                      if (viewModeClassificacao === 'all') {
                  // Calcular nome mais longo em TODAS as rotas
                  const allRouteNames = [
                    ...rotasDegradadas.map(r => r.rota),
                    ...rotasComGanho.map(r => r.rota),
                    ...rotasEstaveis.map(r => r.rota)
                  ];
                  const longestName = allRouteNames.reduce((a, b) => a.length > b.length ? a : b, '');
                  // Estimar largura: 7px por caractere
                  const maxNameWidth = Math.min(Math.max(longestName.length * 7, 120), 250);
                  
                  // Criar array apenas dos 3 cards de rotas (excluir DADOS GERAIS)
                  const routeCards = [
                    { component: renderCompactRoutesChart(rotasDegradadas, "ROTAS DEGRADADAS", "red", maxNameWidth), count: rotasDegradadas.length, type: 'degradadas' },
                    { component: renderCompactRoutesChart(rotasComGanho, "ROTAS COM GANHO", "green", maxNameWidth), count: rotasComGanho.length, type: 'ganho' },
                    { component: renderCompactRoutesChart(rotasEstaveis, "ROTAS ESTÁVEIS", "blue", maxNameWidth), count: rotasEstaveis.length, type: 'estaveis' }
                  ];
                  
                  // Ordenar por quantidade (crescente) para pegar o menor
                  const sortedByCount = [...routeCards].sort((a, b) => a.count - b.count);
                  const cardComMenosRotas = sortedByCount[0]; // Menor
                  const outrosCards = sortedByCount.slice(1).sort((a, b) => b.count - a.count); // Outros 2, ordenados decrescente
                  
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {/* LINHA 1: DADOS GERAIS (fixo) + Card com MENOS rotas */}
                      <div key="dados">
                        {renderCompactChart(
                          routesData, 
                          `DADOS GERAIS - PSM ${selectedOperator}${selectedProvince !== 'Todas' ? ` | ${selectedProvince}` : ''}`, 
                          'gray'
                        )}
                      </div>
                      <div key={cardComMenosRotas.type}>
                        {cardComMenosRotas.component}
                      </div>
                      
                      {/* LINHA 2: Outros 2 cards ordenados por quantidade (decrescente) */}
                      {outrosCards.map((card) => (
                        <div key={card.type}>{card.component}</div>
                      ))}
                    </div>
                  );
                }
                
                // MODO CARROSSEL
                return (
                  <div className="relative">
                    {/* Botão Anterior */}
                    <button 
                      onClick={goToPrevGraphClassificacao} 
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-3 shadow-lg border hover:bg-white hover:scale-110 transition-all disabled:opacity-30" 
                      disabled={currentGraphClassificacao === 0}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Container do Carrossel */}
                    <div className="overflow-hidden">
                      <div 
                        className="flex transition-transform duration-500 ease-in-out" 
                        style={{ transform: `translateX(-${currentGraphClassificacao * 100}%)` }}
                      >
                        {/* Slide 1: ROTAS DEGRADADAS */}
                        <div className="w-full flex-shrink-0 px-4">
                          {renderChart(rotasDegradadas, "ROTAS DEGRADADAS", "red", "red")}
                        </div>
                        
                        {/* Slide 2: ROTAS COM GANHO */}
                        <div className="w-full flex-shrink-0 px-4">
                          {renderChart(rotasComGanho, "ROTAS COM GANHO", "green", "green")}
                        </div>
                        
                        {/* Slide 3: ROTAS ESTÁVEIS */}
                        <div className="w-full flex-shrink-0 px-4">
                          {renderChart(rotasEstaveis, "ROTAS ESTÁVEIS", "blue", "blue")}
                        </div>
                      </div>
                    </div>

                    {/* Botão Próximo */}
                    <button 
                      onClick={goToNextGraphClassificacao} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-3 shadow-lg border hover:bg-white hover:scale-110 transition-all disabled:opacity-30" 
                      disabled={currentGraphClassificacao === 2}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Indicadores */}
                    <div className="flex justify-center gap-2 mt-6">
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          onClick={() => goToGraphClassificacao(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            currentGraphClassificacao === index 
                              ? 'bg-blue-600 w-8' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Ir para gráfico ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                );
                    })()}
                  </div>
                );
              })()}
            </div>
          </div>
  );
};

export default ClassificacaoCarrossel;
