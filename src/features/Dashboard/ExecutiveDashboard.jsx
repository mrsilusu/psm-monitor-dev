import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE, OPERATOR_TO_PROVINCES as STATIC_OPERATOR_TO_PROVINCES } from '../../config/provinceConfig';
import { QUARTER_CONFIG } from '../../config/quarterConfig';
import { getValorReduzido as getValorReduzidoUtil } from '../../utils/valueUtils.js';
import { log } from '../../utils/logger';

const ExecutiveDashboard = ({
  selectedOperator,
  selectedProvince,
  selectedQuarter,
  selectedWeek,
  selectedYear,
  executiveDashboard,
  handleStatusClick,
  distribuicaoReparacoes,
  quarterWeeks,
  efetividadeMode,
  setEfetividadeMode,
  efetividadeGlobalMedia,
  efetividadePSMMedia,
  data,
  routesByPsm = STATIC_ROUTES_BY_PSM,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
  operatorToProvinces = STATIC_OPERATOR_TO_PROVINCES,
}) => {
  const getValorReduzido = (psm, week, route, tipo) =>
    getValorReduzidoUtil(data, distribuicaoReparacoes, selectedQuarter, selectedYear, QUARTER_CONFIG, psm, week, route, tipo);

  return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="py-4 px-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Dashboard Executivo</h2>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded"></div>
                <h3 className="text-md font-semibold text-gray-700">
                  Dados Gerais - PSM {selectedOperator}
                  {selectedProvince !== 'Todas' && <span className="text-blue-600"> | {selectedProvince}</span>}
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-1 mb-6" key={`dashboard-${selectedOperator}-${selectedProvince}-${selectedQuarter}`}>
                {(() => {
                  log('🎨 RENDERIZANDO CARDS:', {
                    provincia: selectedProvince,
                    psm: selectedOperator,
                    transporte: executiveDashboard.transporteQ2?.value,
                    indisponiveis: executiveDashboard.indisponiveis?.value
                  });
                  return Object.values(executiveDashboard).map((item, idx) => (
                    <div 
                      key={`${idx}-${item.value}`} 
                    className={`${item.color} ${item.textColor} rounded p-1.5 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200`}
                    onClick={() => handleStatusClick(item.label)}
                    title={`Clique para ver detalhes de ${item.label}`}
                  >
                    <div className="text-[10px] font-medium opacity-90 mb-0.5 flex items-center gap-0.5">
                      <span>{['📦', '⚠️', '✅', '🔍', '👥', '📋', '🔄', '🔌'][idx]}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="text-lg font-bold leading-tight">{item.value}</div>
                  </div>
                  ));
                })()}
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
              
              {/* v3.41.02: 4 CARDS DE ANÁLISE - Por PROVÍNCIA (modo PSM) ou por PSM (modo Global) */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {(() => {
                  // v3.41.02: LÓGICA DIFERENTE para Global vs PSM específico
                  const isGlobalMode = selectedOperator === 'Global';
                  
                  let entidadesDados = [];
                  
                  if (isGlobalMode) {
                    // MODO GLOBAL: Calcular por PSM
                    log('🌍 CARDS MODO GLOBAL - Calculando por PSM');
                    
                    const psmsDisponiveis = ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'];
                    
                    entidadesDados = psmsDisponiveis.map(psm => {
                      let indisponiveis = 0;
                      let reparadas = 0;
                      let reconhecidas = 0;
                      let depPassagem = 0;
                      let depLicenca = 0;
                      let depCutover = 0;
                      
                      (routesByPsm[psm] || []).forEach(route => {
                        let ultimoIndisp = 0;
                        let somaReparadas = 0;
                        let ultimaReconh = 0;
                        let ultimoDepPass = 0;
                        let ultimoDepLic = 0;
                        let ultimoDepCut = 0;
                        
                        quarterWeeks.forEach(week => {
                          const weekNum = parseInt(week.substring(1));
                          const selectedWeekNum = parseInt(selectedWeek.substring(1));
                          
                          if (weekNum <= selectedWeekNum) {
                            const weekData = data[psm]?.[week]?.[route];
                            
                            if (weekData) {
                              const indisp = parseInt(weekData['Indisponíveis']) || 0;
                              const rep = parseInt(weekData['Total Reparadas']) || 0;
                              const reconh = parseInt(weekData['Reconhecidas']) || 0;
                              const depPass = parseInt(weekData['Dep. de Passagem de Cabo']) || 0;
                              const depLic = parseInt(weekData['Dep. de Licença']) || 0;
                              const depCut = parseInt(weekData['Dep. de Cutover']) || 0;
                              
                              if (indisp > 0) ultimoIndisp = indisp;
                              if (reconh > 0) ultimaReconh = reconh;
                              if (depPass > 0) ultimoDepPass = depPass;
                              if (depLic > 0) ultimoDepLic = depLic;
                              if (depCut > 0) ultimoDepCut = depCut;
                              
                              somaReparadas += rep;
                            }
                          }
                        });
                        
                        indisponiveis += ultimoIndisp;
                        reparadas += somaReparadas;
                        reconhecidas += ultimaReconh;
                        depPassagem += ultimoDepPass;
                        depLicenca += ultimoDepLic;
                        depCutover += ultimoDepCut;
                      });
                      
                      const indisponibilidadeLiquida = Math.max(0, Math.round(indisponiveis - reparadas));
                      const efetividadeGlobal = indisponiveis > 0 ? ((reparadas / indisponiveis) * 100) : 0;
                      
                      // V5.10.3: Buscar valor ORIGINAL de Fibras Dep. PSM
                      let fibrasDependentesPSMOriginal = 0;
                      (routesByPsm[psm] || []).forEach(route => {
                        for (let i = quarterWeeks.length - 1; i >= 0; i--) {
                          const week = quarterWeeks[i];
                          const routeData = data[psm]?.[week]?.[route];
                          if (routeData) {
                            const fibrasVal = parseInt(routeData[`Fibras dependentes da ${psm}`]) || 0;
                            if (fibrasVal > 0) {
                              fibrasDependentesPSMOriginal += fibrasVal;
                              break;
                            }
                          }
                        }
                      });
                      
                      // Calcular APENAS reparadas de Fibras Dep. PSM
                      let fibrasPSMReparadas = 0;
                      (routesByPsm[psm] || []).forEach(route => {
                        quarterWeeks.forEach(week => {
                          const weekNum = parseInt(week.substring(1));
                          const selectedWeekNum = parseInt(selectedWeek.substring(1));
                          if (weekNum <= selectedWeekNum) {
                            const distDaSemana = distribuicaoReparacoes[selectedYear]?.[psm]?.[week]?.[route] || {};
                            fibrasPSMReparadas += parseInt(distDaSemana[`Fibras dependentes da ${psm}`]) || 0;
                          }
                        });
                      });
                      
                      let efetividadePSM = 0;
                      if (fibrasDependentesPSMOriginal > 0) {
                        efetividadePSM = Math.min(100, (fibrasPSMReparadas / fibrasDependentesPSMOriginal) * 100);
                      }
                      
                      log(`  📊 ${psm}: Efet.Global=${efetividadeGlobal.toFixed(1)}%, Efet.PSM=${efetividadePSM.toFixed(1)}% (${fibrasPSMReparadas}/${fibrasDependentesPSMOriginal} ORIGINAL)`);
                      
                      return {
                        provincia: psm, // Nome da entidade (será PSM neste caso)
                        indisponiveis: indisponibilidadeLiquida,
                        indisponiveisOriginal: indisponiveis,
                        reparadas,
                        efetividade: efetividadeGlobal,
                        efetividadeGlobal,
                        efetividadePSM,
                        indisponiveisPSM: fibrasDependentesPSMOriginal
                      };
                    });
                    
                  } else {
                    // MODO PSM: Calcular por PROVÍNCIA (código original)
                    const provinciasParaCalcular = selectedProvince !== 'Todas'
                      ? [selectedProvince]
                      : (operatorToProvinces[selectedOperator] || []);
                    
                    log('🗺️ CARDS MODO PSM - Calculando por Província');
                    log('  PSM:', selectedOperator);
                    log('  Província filtrada:', selectedProvince);
                    log('  Províncias a calcular:', provinciasParaCalcular);
                    
                    entidadesDados = provinciasParaCalcular.map(prov => {
                    const rotasProv = (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === prov);
                    
                    log(`  📍 ${prov}:`);
                    log(`     Total rotas: ${rotasProv.length}`);
                    
                    // v3.36.0: Debug específico para Cuango
                    const rotasCuango = rotasProv.filter(r => r.includes('Cuango'));
                    if (rotasCuango.length > 0) {
                      log(`     🔍 Rotas Cuango encontradas:`, rotasCuango);
                    }
                    
                    let indisponiveis = 0;
                    let reparadas = 0;
                    
                    // v3.40.73: Coletar subcategorias para calcular Efetividade PSM
                    let reconhecidas = 0;
                    let depPassagem = 0;
                    let depLicenca = 0;
                    let depCutover = 0;
                    
                    rotasProv.forEach(route => {
                      // Para cada rota, pegar ÚLTIMO valor de Indisponíveis e ACUMULAR Total Reparadas
                      let ultimoIndisp = 0;
                      let somaReparadas = 0;
                      
                      // v3.40.73: Últimos valores das subcategorias
                      let ultimaReconh = 0;
                      let ultimoDepPass = 0;
                      let ultimoDepLic = 0;
                      let ultimoDepCut = 0;
                      
                      // Percorrer todas as semanas do quadrimestre até a semana selecionada
                      quarterWeeks.forEach(week => {
                        const weekNum = parseInt(week.substring(1));
                        const selectedWeekNum = parseInt(selectedWeek.substring(1));
                        
                        if (weekNum <= selectedWeekNum) {
                          const weekData = data[selectedOperator]?.[week]?.[route];
                          
                          // Debug para Cuango (apenas na semana selecionada)
                          if (route.includes('Cuango') && week === selectedWeek) {
                            log(`     🔍 ${route}:`);
                            log(`        selectedWeek: ${selectedWeek}`);
                            log(`        Tem dados?: ${!!weekData}`);
                            if (weekData) {
                              log(`        Indisponíveis: ${weekData['Indisponíveis']}`);
                              log(`        Total Reparadas acumulado: ${somaReparadas}`);
                            }
                          }
                          
                          if (weekData) {
                            const indisp = parseInt(weekData['Indisponíveis']) || 0;
                            const rep = parseInt(weekData['Total Reparadas']) || 0;
                            
                            // v3.40.73: Coletar subcategorias
                            const reconh = parseInt(weekData['Reconhecidas']) || 0;
                            const depPass = parseInt(weekData['Dep. de Passagem de Cabo']) || 0;
                            const depLic = parseInt(weekData['Dep. de Licença']) || 0;
                            const depCut = parseInt(weekData['Dep. de Cutover']) || 0;
                            
                            // Indisponíveis: último valor
                            if (indisp > 0) ultimoIndisp = indisp;
                            
                            // Subcategorias: último valor
                            if (reconh > 0) ultimaReconh = reconh;
                            if (depPass > 0) ultimoDepPass = depPass;
                            if (depLic > 0) ultimoDepLic = depLic;
                            if (depCut > 0) ultimoDepCut = depCut;
                            
                            // Total Reparadas: ACUMULA
                            somaReparadas += rep;
                          }
                        }
                      });
                      
                      indisponiveis += ultimoIndisp;
                      reparadas += somaReparadas;
                      
                      // v3.40.73: Somar subcategorias
                      reconhecidas += ultimaReconh;
                      depPassagem += ultimoDepPass;
                      depLicenca += ultimoDepLic;
                      depCutover += ultimoDepCut;
                      
                      if (ultimoIndisp > 0 || somaReparadas > 0) {
                        log(`     ${route}: ${ultimoIndisp} indisp (último), ${somaReparadas} reparadas (acumulado quadrimestre)`);
                      }
                    });
                    
                    log(`  ✅ ${prov} TOTAL: ${indisponiveis} indisp (último), ${reparadas} reparadas (acumulado)`);
                    
                    // Calcular indisponibilidade LÍQUIDA = Indisponíveis - Total Reparadas
                    // Garantir que seja exatamente 0 se negativo ou muito pequeno
                    const indisponibilidadeLiquida = Math.max(0, Math.round(indisponiveis - reparadas));
                    
                    log(`  💡 ${prov} INDISPONIBILIDADE LÍQUIDA: ${indisponibilidadeLiquida} (${indisponiveis} - ${reparadas})`);
                    
                    // V5.07.1: CALCULAR DUAS EFETIVIDADES COM VALORES REDUZIDOS
                    
                    // 1. Efetividade Global (ATUAL - já existia)
                    const efetividadeGlobal = indisponiveis > 0 ? ((reparadas / indisponiveis) * 100) : 0;
                    
                    // 2. Efetividade PSM (USAR VALORES REDUZIDOS DO DASHBOARD)
                    // V5.07.1: Calcular Fibras Dependentes usando valores REDUZIDOS
                    let reconhecidasReduzido = 0;
                    let depPassagemReduzido = 0;
                    let depLicencaReduzido = 0;
                    let depCutoverReduzido = 0;
                    
                    rotasProv.forEach(route => {
                      reconhecidasReduzido += getValorReduzido(selectedOperator, selectedWeek, route, 'Reconhecidas');
                      depPassagemReduzido += getValorReduzido(selectedOperator, selectedWeek, route, 'Dep. de Passagem de Cabo');
                      depLicencaReduzido += getValorReduzido(selectedOperator, selectedWeek, route, 'Dep. de Licença');
                      depCutoverReduzido += getValorReduzido(selectedOperator, selectedWeek, route, 'Dep. de Cutover');
                    });
                    
                    // V5.10.3: Buscar valor ORIGINAL de Fibras Dep. PSM (sem redução)
                    let fibrasDependentesPSMOriginal = 0;
                    rotasProv.forEach(route => {
                      // Buscar ÚLTIMA semana com dados para esta rota
                      for (let i = quarterWeeks.length - 1; i >= 0; i--) {
                        const week = quarterWeeks[i];
                        const routeData = data[selectedOperator]?.[week]?.[route];
                        if (routeData) {
                          const fibrasVal = parseInt(routeData[`Fibras dependentes da ${selectedOperator}`]) || 0;
                          if (fibrasVal > 0) {
                            fibrasDependentesPSMOriginal += fibrasVal;
                            break; // Pega só o último valor desta rota
                          }
                        }
                      }
                    });
                    
                    // V5.09.3: Calcular APENAS reparadas de Fibras Dep. PSM
                    let fibrasPSMReparadas = 0;
                    rotasProv.forEach(route => {
                      quarterWeeks.forEach(week => {
                        const weekNum = parseInt(week.substring(1));
                        const selectedWeekNum = parseInt(selectedWeek.substring(1));
                        if (weekNum <= selectedWeekNum) {
                          const distDaSemana = distribuicaoReparacoes[selectedYear]?.[selectedOperator]?.[week]?.[route] || {};
                          fibrasPSMReparadas += parseInt(distDaSemana[`Fibras dependentes da ${selectedOperator}`]) || 0;
                        }
                      });
                    });
                    
                    // REGRA: Só atinge 100% se reparar TODAS as fibras dependentes do PSM
                    let efetividadePSM = 0;
                    
                    if (fibrasDependentesPSMOriginal > 0) {
                      // Percentagem = (reparadas de Fibras PSM / valor ORIGINAL) * 100
                      efetividadePSM = Math.min(100, (fibrasPSMReparadas / fibrasDependentesPSMOriginal) * 100);
                      
                      log(`  📊 ${prov} Efetividade PSM: ${efetividadePSM.toFixed(1)}% (${fibrasPSMReparadas}/${fibrasDependentesPSMOriginal} ORIGINAL) - ${fibrasPSMReparadas >= fibrasDependentesPSMOriginal ? '✅ TODAS REPARADAS' : '⚠️ AINDA FALTAM'}`);
                    } else {
                      // Não há fibras dependentes do PSM
                      efetividadePSM = 0;
                      log(`  📊 ${prov} Efetividade PSM: 0% (sem fibras dependentes do PSM) - outras causas: ${reconhecidasReduzido + depPassagemReduzido + depLicencaReduzido + depCutoverReduzido}`);
                    }
                    
                    log(`  📊 ${prov} Efetividade Global: ${efetividadeGlobal.toFixed(1)}% (${reparadas}/${indisponiveis})`);
                    
                    return { 
                      provincia: prov, 
                      indisponiveis: indisponibilidadeLiquida, // Usar valor líquido para o gráfico
                      indisponiveisOriginal: indisponiveis, // Guardar original para referência
                      reparadas, 
                      efetividade: efetividadeGlobal, // GLOBAL (compatibilidade)
                      efetividadeGlobal,  // v3.40.73: GLOBAL explícito
                      efetividadePSM,     // v3.40.73: PSM (nova lógica rigorosa v3.49.25)
                      indisponiveisPSM: fibrasDependentesPSMOriginal    // V5.10.3: Usar valor original
                    };
                  });
                  } // Fim do else (modo PSM)
                  
                  // v3.41.03: Usar efetividade correta baseada no modo selecionado
                  const totalIndisponiveisProv = entidadesDados.reduce((acc, p) => acc + p.indisponiveis, 0);
                  const maisProdutiva = entidadesDados.reduce((max, p) => p.reparadas > max.reparadas ? p : max, entidadesDados[0] || {});
                  
                  // v3.41.03: maisEfetiva e emAlerta usam efetividade baseada no modo
                  const maisEfetiva = entidadesDados.reduce((max, p) => {
                    const efetAtual = efetividadeMode === 'psm' ? p.efetividadePSM : p.efetividadeGlobal;
                    const efetMax = efetividadeMode === 'psm' ? max.efetividadePSM : max.efetividadeGlobal;
                    return efetAtual > efetMax ? p : max;
                  }, entidadesDados[0] || {});
                  
                  const emAlerta = entidadesDados.reduce((min, p) => {
                    const efetAtual = efetividadeMode === 'psm' ? p.efetividadePSM : p.efetividadeGlobal;
                    const efetMin = efetividadeMode === 'psm' ? min.efetividadePSM : min.efetividadeGlobal;
                    return (efetAtual < efetMin && p.indisponiveisOriginal > 0) ? p : min;
                  }, entidadesDados[0] || {});
                  
                  // v3.41.04: LOGS DETALHADOS DE DEBUG
                  log('═══════════════════════════════════════════════');
                  log('🔍 DEBUG CARD "PRECISA ATENÇÃO"');
                  log('═══════════════════════════════════════════════');
                  log(`📊 Modo Efetividade Selecionado: "${efetividadeMode}"`);
                  log(`📊 Total de Entidades: ${entidadesDados.length}`);
                  log('');
                  
                  // Mostrar ranking completo
                  log('📋 RANKING COMPLETO (por efetividade selecionada):');
                  entidadesDados
                    .filter(p => p.indisponiveisOriginal > 0)
                    .sort((a, b) => {
                      const efetA = efetividadeMode === 'psm' ? a.efetividadePSM : a.efetividadeGlobal;
                      const efetB = efetividadeMode === 'psm' ? b.efetividadePSM : b.efetividadeGlobal;
                      return efetB - efetA;
                    })
                    .forEach((p, idx) => {
                      const efet = efetividadeMode === 'psm' ? p.efetividadePSM : p.efetividadeGlobal;
                      const emoji = idx === 0 ? '🥇' : (idx === entidadesDados.filter(x => x.indisponiveisOriginal > 0).length - 1 ? '🚨' : '  ');
                      log(`  ${emoji} ${idx + 1}º ${p.provincia}: ${efet.toFixed(1)}% (Indisp: ${p.indisponiveisOriginal}, Rep: ${p.reparadas})`);
                    });
                  log('');
                  
                  // Mostrar cards calculados
                  log('🎯 CARDS CALCULADOS:');
                  log(`  ✅ Mais Efetiva: ${maisEfetiva.provincia}`);
                  log(`     - Efet. Global: ${maisEfetiva.efetividadeGlobal?.toFixed(1)}%`);
                  log(`     - Efet. PSM: ${maisEfetiva.efetividadePSM?.toFixed(1)}%`);
                  log(`     - Usando: ${efetividadeMode === 'psm' ? maisEfetiva.efetividadePSM?.toFixed(1) : maisEfetiva.efetividadeGlobal?.toFixed(1)}%`);
                  log('');
                  log(`  ⚠️ Precisa Atenção: ${emAlerta.provincia}`);
                  log(`     - Efet. Global: ${emAlerta.efetividadeGlobal?.toFixed(1)}%`);
                  log(`     - Efet. PSM: ${emAlerta.efetividadePSM?.toFixed(1)}%`);
                  log(`     - Usando: ${efetividadeMode === 'psm' ? emAlerta.efetividadePSM?.toFixed(1) : emAlerta.efetividadeGlobal?.toFixed(1)}%`);
                  log(`     - Indisponíveis: ${emAlerta.indisponiveisOriginal}`);
                  log(`     - Reparadas: ${emAlerta.reparadas}`);
                  log('═══════════════════════════════════════════════');
                  log('');
                  
                  // Cores para o gráfico pizza
                  const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
                  
                  return (
                    <>
                      {/* Card 1: Indisponibilidade por Província (Gráfico Pizza) */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-blue-900">Peso de Indisponibilidade por Província</h4>
                        </div>
                        
                        {/* v3.39.0: Gráfico de Pizza ORDENADO (menor → maior) */}
                        <div className="flex justify-center items-center">
                          {(() => {
                            // CALCULAR TOTAL DE TODAS AS PROVÍNCIAS DO PSM (não só as filtradas)
                            const todasProvinciasPSM = operatorToProvinces[selectedOperator] || [];
                            const totalGeralIndisponiveis = todasProvinciasPSM.reduce((sum, prov) => {
                              const rotasProv = (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === prov);
                              let indisponiveisProvTotal = 0;
                              
                              rotasProv.forEach(route => {
                                let ultimoIndisp = 0;
                                quarterWeeks.forEach(week => {
                                  const routeData = data[selectedOperator]?.[week]?.[route];
                                  if (routeData) {
                                    const indisp = parseInt(routeData['Indisponíveis']) || 0;
                                    if (indisp > 0) ultimoIndisp = indisp;
                                  }
                                });
                                indisponiveisProvTotal += ultimoIndisp;
                              });
                              
                              return sum + indisponiveisProvTotal;
                            }, 0);
                            
                            // Dados para o GRÁFICO: apenas províncias com indisponibilidade > 0
                            const dadosPizzaGrafico = entidadesDados
                              .filter(p => p.indisponiveis > 0)
                              .sort((a, b) => a.indisponiveis - b.indisponiveis);  // Crescente
                            
                            // Dados para a LEGENDA: TODAS as províncias do filtro (incluindo 0)
                            const dadosPizzaLegenda = entidadesDados
                              .sort((a, b) => b.indisponiveis - a.indisponiveis);  // Decrescente para legenda
                            
                            if (dadosPizzaGrafico.length === 0) return <p className="text-xs text-gray-500">Sem dados</p>;
                            
                            // Usar total do gráfico para desenhar (províncias filtradas)
                            // mas totalGeralIndisponiveis para calcular percentagens
                            const totalGrafico = dadosPizzaGrafico.reduce((acc, p) => acc + p.indisponiveis, 0);
                            let currentAngle = 0;
                            const radius = 68;  // Reduzido 15%: 80 × 0.85 = 68
                            const centerX = 90; // Ajustado proporcionalmente: 105 × 0.857 ≈ 90
                            const centerY = 90; // Ajustado proporcionalmente: 105 × 0.857 ≈ 90
                            
                            return (
                              <div className="flex flex-col">
                                {/* Gráfico centralizado com altura fixa */}
                                <div className="flex justify-center items-center" style={{height: '180px'}}>
                                  <svg width="180" height="180" viewBox="0 0 180 180">
                                  {dadosPizzaGrafico.map((prov, idx) => {
                                    // Usar totalGrafico para desenhar (mantém proporções visuais)
                                    const percentage = (prov.indisponiveis / totalGrafico) * 100;
                                    const angle = (percentage / 100) * 360;
                                    const startAngle = currentAngle;
                                    const endAngle = currentAngle + angle;
                                    currentAngle = endAngle;
                                    
                                    // Converter ângulos para coordenadas
                                    const startRad = (startAngle - 90) * (Math.PI / 180);
                                    const endRad = (endAngle - 90) * (Math.PI / 180);
                                    
                                    const x1 = centerX + radius * Math.cos(startRad);
                                    const y1 = centerY + radius * Math.sin(startRad);
                                    const x2 = centerX + radius * Math.cos(endRad);
                                    const y2 = centerY + radius * Math.sin(endRad);
                                    
                                    const largeArc = angle > 180 ? 1 : 0;
                                    
                                    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                                    
                                    return (
                                      <g key={prov.provincia}>
                                        <path
                                          d={path}
                                          fill={cores[idx % cores.length]}
                                          stroke="white"
                                          strokeWidth="2"
                                        />
                                      </g>
                                    );
                                  })}
                                  {/* Círculo branco no centro para efeito donut */}
                                  <circle cx={centerX} cy={centerY} r="30" fill="white" />
                                  <text x={centerX} y={centerY - 6} textAnchor="middle" fontSize="17" fontWeight="bold" fill="#1e40af">
                                    {totalGrafico}
                                  </text>
                                  <text x={centerX} y={centerY + 10} textAnchor="middle" fontSize="12" fill="#64748b">
                                    fibras
                                  </text>
                                  </svg>
                                </div>
                                
                                {/* Legenda - TODAS as províncias (incluindo 0%) */}
                                <div className="mt-2 space-y-1 w-full">
                                  {dadosPizzaLegenda.map((prov, idx) => {
                                    // Percentual sobre o TOTAL GERAL do PSM (não apenas filtradas)
                                    const percentual = totalGeralIndisponiveis > 0 
                                      ? ((prov.indisponiveis / totalGeralIndisponiveis) * 100).toFixed(1) 
                                      : '0.0';
                                    // Encontrar índice da cor no gráfico (apenas para províncias com valor > 0)
                                    const graficoIdx = dadosPizzaGrafico.findIndex(p => p.provincia === prov.provincia);
                                    const cor = graficoIdx >= 0 ? cores[graficoIdx % cores.length] : '#d1d5db'; // Cinza para 0
                                    
                                    return (
                                      <div key={prov.provincia} className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center space-x-1.5">
                                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cor }}></div>
                                          <span className={`font-medium ${prov.indisponiveis > 0 ? 'text-blue-800' : 'text-gray-400'}`}>
                                            {prov.provincia}
                                          </span>
                                        </div>
                                        <span className={`font-bold ${prov.indisponiveis > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                          {percentual}% ({prov.indisponiveis})
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Card 2: Província Mais Produtiva */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-emerald-900">Mais Produtiva</h4>
                        </div>
                        
                        {/* PROVÍNCIA MAIS PRODUTIVA CENTRALIZADA com altura fixa */}
                        <div className="flex flex-col items-center justify-center" style={{height: '180px'}}>
                          <div className="text-2xl font-bold text-emerald-700 mb-1">
                            {maisProdutiva?.provincia || 'N/A'}
                          </div>
                          <div className="text-3xl font-bold text-emerald-600 mb-1">
                            {maisProdutiva?.reparadas || 0}
                          </div>
                          <div className="text-xs text-emerald-700">
                            fibras reparadas em {selectedQuarter}
                          </div>
                        </div>
                        
                        {/* Lista das outras províncias - ORDEM DECRESCENTE com espaçamento dinâmico */}
                        <div className="mt-2 pt-3 border-t border-emerald-200">
                          {(() => {
                            const outrasProvincias = entidadesDados
                              .filter(p => p.provincia !== maisProdutiva?.provincia && p.reparadas > 0)
                              .sort((a, b) => b.reparadas - a.reparadas);  // DECRESCENTE: maior → menor
                            
                            // Espaçamento dinâmico: aumenta conforme mais províncias aparecem
                            const numProvincias = outrasProvincias.length;
                            let marginTop = 'mt-3';  // Padrão
                            
                            if (numProvincias >= 6) {
                              marginTop = 'mt-1';  // Muito próximo (6+ províncias)
                            } else if (numProvincias >= 4) {
                              marginTop = 'mt-2';  // Próximo (4-5 províncias)
                            } else if (numProvincias >= 2) {
                              marginTop = 'mt-3';  // Médio (2-3 províncias)
                            } else {
                              marginTop = 'mt-4';  // Mais longe (1 província)
                            }
                            
                            // Ajustar altura máxima dinamicamente baseado na quantidade
                            const maxHeight = numProvincias > 5 ? 'max-h-28' : 'max-h-20';
                            
                            return (
                              <div className={`${marginTop} space-y-1 ${maxHeight} overflow-y-auto`}>
                                {outrasProvincias.map((prov, idx) => (
                                  <div key={prov.provincia} className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-medium text-emerald-700">
                                        #{idx + 2} {prov.provincia}
                                      </span>
                                    </div>
                                    <span className="font-bold text-emerald-600">
                                      {prov.reparadas}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Card 3: Taxa de Efetividade - VELOCÍMETRO */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 shadow-sm relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            
                            {/* v3.49.31: Layout responsivo para título e badge */}
                            <div className="flex items-center gap-2 xl:gap-3">
                              <h4 className="text-sm font-semibold text-purple-900">
                                Efetividade {efetividadeMode === 'global' ? 'Global' : 'PSM'}
                              </h4>
                              
                              {/* Badge - Posicionamento Responsivo */}
                              <button
                                onClick={() => setEfetividadeMode(efetividadeMode === 'global' ? 'psm' : 'global')}
                                className={`
                                  text-[9px] lg:text-[10px] font-semibold 
                                  px-2 lg:px-2.5 py-0.5 lg:py-1
                                  rounded-full bg-purple-100 text-purple-600 
                                  hover:bg-purple-200 hover:text-purple-800 
                                  transition-all duration-200 active:scale-95
                                  lg:absolute lg:top-2 lg:right-3
                                `}
                                title={`Trocar para modo ${efetividadeMode === 'global' ? 'PSM' : 'Global'}`}
                              >
                                {efetividadeMode === 'global' ? 'PSM' : 'Global'}
                              </button>
                            </div>
                            
                            {/* Tooltip info - pequeno ícone */}
                            <div 
                              className="group relative cursor-help"
                              title={efetividadeMode === 'psm' 
                                ? "PSM: Só Fibras Dependentes. Max 100%/prov." 
                                : "Global: Todas indisponíveis"}
                            >
                              <svg className={`w-3.5 h-3.5 transition-colors ${
                                efetividadeMode === 'psm' ? 'text-purple-500' : 'text-blue-500'
                              }`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              
                              {/* Tooltip expandido no hover */}
                              <div className="hidden group-hover:block absolute top-5 right-0 bg-gray-900 text-white text-[10px] rounded-lg p-2 shadow-2xl w-44 z-50 animate-fadeIn">
                                {efetividadeMode === 'psm' ? (
                                  <>
                                    <p className="font-bold text-purple-300 mb-1">PSM (Rigoroso)</p>
                                    <p className="text-gray-300 text-[9px] leading-tight">
                                      Só Fibras Dependentes PSM<br/>
                                      Max 100% por província<br/>
                                      Outras causas = 0%
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-bold text-blue-300 mb-1">Global (Completo)</p>
                                    <p className="text-gray-300 text-[9px] leading-tight">
                                      Todas indisponíveis<br/>
                                      Qualquer causa conta<br/>
                                      Pode &gt; 100%
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* VELOCÍMETRO AJUSTADO com altura fixa */}
                        <div className="flex justify-center items-center" style={{height: '180px'}}>
                          {(() => {
                            // V5.10.7: Filtrar províncias baseado no MODO
                            const provinciasComDados = efetividadeMode === 'psm'
                              ? entidadesDados.filter(p => p.indisponiveisPSM > 0)  // PSM: só com Fibras PSM
                              : entidadesDados.filter(p => p.indisponiveisOriginal > 0);  // Global: com qualquer indisp
                            
                            // Usar efetividade baseada no modo selecionado
                            const somaEfetividade = provinciasComDados.reduce((sum, p) => {
                              const efet = efetividadeMode === 'psm' ? p.efetividadePSM : p.efetividadeGlobal;
                              return sum + efet;
                            }, 0);
                            
                            const mediaEfetividade = provinciasComDados.length > 0 
                              ? somaEfetividade / provinciasComDados.length 
                              : 0;
                            
                            // Configuração do velocímetro (aumentado para melhor visibilidade)
                            const percentage = Math.min(Math.max(mediaEfetividade, 0), 100);
                            const centerX = 105;  // Aumentado de 84
                            const centerY = 105;  // Aumentado de 84
                            const radius = 80;    // Aumentado de 63
                            const startAngle = -135;
                            const endAngle = 135;
                            const totalAngle = endAngle - startAngle;
                            
                            // Calcular ângulo da agulha baseado na percentagem
                            const needleAngle = startAngle + (percentage / 100) * totalAngle;
                            
                            // Função para criar arco de cor
                            const createColorArc = (start, end, color) => {
                              const startRad = (start - 90) * Math.PI / 180;
                              const endRad = (end - 90) * Math.PI / 180;
                              const x1 = centerX + radius * Math.cos(startRad);
                              const y1 = centerY + radius * Math.sin(startRad);
                              const x2 = centerX + radius * Math.cos(endRad);
                              const y2 = centerY + radius * Math.sin(endRad);
                              const largeArc = (end - start) > 180 ? 1 : 0;
                              
                              return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                            };
                            
                            // Calcular ponto da agulha
                            const needleRad = (needleAngle - 90) * Math.PI / 180;
                            const needleLength = radius - 9;
                            const needleX = centerX + needleLength * Math.cos(needleRad);
                            const needleY = centerY + needleLength * Math.sin(needleRad);
                            
                            // Calcular posições dos labels 0% e 100%
                            const labelRadius = radius + 2; // Pouco abaixo do arco
                            const label0Rad = (startAngle - 90) * Math.PI / 180;
                            const label100Rad = (endAngle - 90) * Math.PI / 180;
                            const label0X = centerX + labelRadius * Math.cos(label0Rad);
                            const label0Y = centerY + labelRadius * Math.sin(label0Rad) + 8;
                            const label100X = centerX + labelRadius * Math.cos(label100Rad);
                            const label100Y = centerY + labelRadius * Math.sin(label100Rad) + 8;
                            
                            return (
                              <div className="flex flex-col items-center">
                                <svg width="210" height="150" viewBox="0 0 210 150" className="w-full">
                                  {/* Background cinza claro */}
                                  <path
                                    d={createColorArc(startAngle, endAngle, '#e5e7eb')}
                                    fill="#e5e7eb"
                                    opacity="0.3"
                                  />
                                  
                                  {/* Gradiente de cores: Vermelho -> Laranja -> Amarelo -> Verde claro -> Verde */}
                                  {/* Vermelho: 0-20% */}
                                  <path
                                    d={createColorArc(startAngle, startAngle + totalAngle * 0.2, '#ef4444')}
                                    fill="#ef4444"
                                  />
                                  
                                  {/* Laranja: 20-40% */}
                                  <path
                                    d={createColorArc(startAngle + totalAngle * 0.2, startAngle + totalAngle * 0.4, '#f97316')}
                                    fill="#f97316"
                                  />
                                  
                                  {/* Amarelo: 40-60% */}
                                  <path
                                    d={createColorArc(startAngle + totalAngle * 0.4, startAngle + totalAngle * 0.6, '#eab308')}
                                    fill="#eab308"
                                  />
                                  
                                  {/* Verde-amarelo: 60-80% */}
                                  <path
                                    d={createColorArc(startAngle + totalAngle * 0.6, startAngle + totalAngle * 0.8, '#84cc16')}
                                    fill="#84cc16"
                                  />
                                  
                                  {/* Verde: 80-100% */}
                                  <path
                                    d={createColorArc(startAngle + totalAngle * 0.8, endAngle, '#22c55e')}
                                    fill="#22c55e"
                                  />
                                  
                                  {/* Círculo interno roxo transparente */}
                                  <circle cx={centerX} cy={centerY} r={radius - 27} fill="rgba(243, 232, 255, 0.5)" />
                                  
                                  {/* Marcações brancas */}
                                  {[0, 25, 50, 75, 100].map(mark => {
                                    const angle = startAngle + (mark / 100) * totalAngle;
                                    const rad = (angle - 90) * Math.PI / 180;
                                    const x1 = centerX + (radius - 30) * Math.cos(rad);
                                    const y1 = centerY + (radius - 30) * Math.sin(rad);
                                    const x2 = centerX + (radius - 4) * Math.cos(rad);
                                    const y2 = centerY + (radius - 4) * Math.sin(rad);
                                    return <line key={mark} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2.5" />;
                                  })}
                                  
                                  {/* Agulha */}
                                  <line x1={centerX} y1={centerY} x2={needleX} y2={needleY} stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                                  
                                  {/* Centro da agulha */}
                                  <circle cx={centerX} cy={centerY} r="7" fill="#374151" />
                                  <circle cx={centerX} cy={centerY} r="4.5" fill="#6b7280" />
                                  
                                  {/* Percentagem no centro */}
                                  <text x={centerX} y={centerY + 38} textAnchor="middle" className="text-2xl font-bold" fill="#7c3aed">
                                    {percentage.toFixed(1)}%
                                  </text>
                                  
                                  {/* Labels 0% e 100% nas extremidades (abaixo das cores) */}
                                  <text x={label0X} y={label0Y} textAnchor="middle" className="text-[11px]" fill="#dc2626" fontWeight="700">0%</text>
                                  <text x={label100X} y={label100Y} textAnchor="middle" className="text-[11px]" fill="#16a34a" fontWeight="700">100%</text>
                                </svg>
                                <div className="text-center -mt-2">
                                  <div className="text-[10px] text-purple-700 font-medium">Média {selectedOperator}</div>
                                  <div className="text-[9px] text-purple-600">{provinciasComDados.length} províncias</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        
                        {/* RANKING DAS PROVÍNCIAS - ALINHADO com mt-2 */}
                        <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                          {entidadesDados
                            .filter(p => p.indisponiveisOriginal > 0) // Usar original, não o líquido
                            .sort((a, b) => {
                              // v3.40.73: Ordenar baseado no modo selecionado
                              const efetA = efetividadeMode === 'psm' ? a.efetividadePSM : a.efetividadeGlobal;
                              const efetB = efetividadeMode === 'psm' ? b.efetividadePSM : b.efetividadeGlobal;
                              return efetB - efetA;
                            })
                            .map((prov, idx) => {
                              // v3.40.73: Usar efetividade do modo selecionado
                              const efetividade = efetividadeMode === 'psm' ? prov.efetividadePSM : prov.efetividadeGlobal;
                              const efetividadeValor = efetividade.toFixed(0);
                              const percentage = Math.min(Math.max(efetividade, 0), 100);
                              
                              // Função para determinar a cor baseada na percentagem (mesmo do velocímetro)
                              const getColorFromPercentage = (pct) => {
                                if (pct >= 80) return { bg: '#22c55e', text: '#15803d' }; // Verde: 80-100%
                                if (pct >= 60) return { bg: '#84cc16', text: '#4d7c0f' }; // Verde-amarelo: 60-80%
                                if (pct >= 40) return { bg: '#eab308', text: '#a16207' }; // Amarelo: 40-60%
                                if (pct >= 20) return { bg: '#f97316', text: '#c2410c' }; // Laranja: 20-40%
                                return { bg: '#ef4444', text: '#b91c1c' }; // Vermelho: 0-20%
                              };
                              
                              const colors = getColorFromPercentage(percentage);
                              
                              return (
                                <div key={prov.provincia} className="flex items-center justify-between text-[10px]">
                                  <span className="font-medium text-purple-800">
                                    #{idx + 1} {prov.provincia}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="h-1.5 rounded-full transition-colors"
                                        style={{ 
                                          width: `${percentage}%`,
                                          backgroundColor: colors.bg
                                        }}
                                      ></div>
                                    </div>
                                    <span 
                                      className="font-bold w-9 text-right"
                                      style={{ color: colors.text }}
                                    >
                                      {efetividadeValor}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        
                        <div className="text-[9px] text-purple-700 mt-2 pt-2 border-t border-purple-200 text-center">
                          {efetividadeMode === 'psm' 
                            ? 'Reparadas / Dep. PSM' 
                            : 'Reparadas / Indisponíveis'}
                        </div>
                      </div>

                      {/* Card 4: Província em Alerta */}
                      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-red-900">Precisa Atenção</h4>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            {emAlerta?.provincia || 'N/A'}
                          </div>
                          <div className="flex justify-center items-center space-x-2 mb-2">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-700">{emAlerta?.indisponiveisOriginal || 0}</div>
                              <div className="text-[9px] text-red-600">Indisponíveis</div>
                            </div>
                            <div className="text-red-400">|</div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{emAlerta?.reparadas || 0}</div>
                              <div className="text-[9px] text-green-700">Reparadas</div>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-red-700">
                            Efetividade: {efetividadeMode === 'psm' 
                              ? (emAlerta?.efetividadePSM?.toFixed(1) || 0)
                              : (emAlerta?.efetividadeGlobal?.toFixed(1) || 0)}%
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
  );
};

export default ExecutiveDashboard;
