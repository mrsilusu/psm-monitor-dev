import React from 'react';
import { ROUTES_BY_PSM } from '../../config/routeConfig';
import { log } from '../../utils/logger';

const TestesAnalises = ({
  showTestesAnalises,
  setShowTestesAnalises,
  selectedOperator,
  selectedQuarter,
  selectedYear,
  selectedWeek,
  testesData,
  todosTestesData,
  rotasTestadas,
  setRotasTestadas,
  rotasValidadas,
  setRotasValidadas,
  tabelaValidacaoAberta,
  setTabelaValidacaoAberta,
  isRotaTestada,
  isRotaValidada,
  getSemanasTestadasNoQuarter,
  getSemanasValidadasNoQuarter,
  isRotaValidadaNoQuarter,
  isRotaTestadaNoQuarter,
}) => {
  if (!showTestesAnalises) return null;

  return (
          <div className="px-5 py-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg border-2 border-blue-200 relative">
              {/* Botão Fechar (X) */}
              <button
                onClick={() => setShowTestesAnalises(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-white hover:bg-red-50 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
                title="Fechar painel"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header do Painel */}
              <div className="py-4 px-4 border-b-2 border-blue-300">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">Testes e Análises - {selectedOperator}</h2>
                    <p className="text-sm text-blue-700">{selectedQuarter} {selectedYear} • {ROUTES_BY_PSM[selectedOperator]?.length || 0} rotas cadastradas</p>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Painel */}
              <div className="p-6">
                {/* v3.49.07: PRIMEIRA LINHA - Resumo de Rotas e Status Técnico */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  
                  {/* COLUNA 1: Resumo de Rotas */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📊 Resumo de Rotas</h3>
                    
                    {/* v3.49.06: Estatísticas em Cards (sem gráfico, sem percentagens) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Rotas Cadastradas</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">{testesData.cadastradas}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Rotas Testadas</span>
                        </div>
                        <span className="text-xl font-bold text-yellow-600">{testesData.testadas}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Rotas Validadas</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">{testesData.semIndisponibilidade}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Pendentes</span>
                        </div>
                        <span className="text-xl font-bold text-red-600">{testesData.pendentes}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Não Testadas</span>
                        </div>
                        <span className="text-xl font-bold text-gray-600">{testesData.naoTestadas}</span>
                      </div>
                    </div>
                  </div>
                  
                  
                  {/* COLUNA 2: Status Técnico das Rotas */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">🔧 Status Técnico das Rotas</h3>
                    <p className="text-xs text-gray-500 text-center mb-4">Baseado em Transporte vs Indisponíveis</p>
                    
                    <div className="space-y-3">
                      {/* 1. SEM INDISPONIBILIDADE (zeradas) */}
                      <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">✅</span>
                            <span className="text-sm font-medium text-gray-700">Sem Indisponibilidade</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">{testesData.semIndisponibilidadeTecnica || 0}</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${testesData.testadas > 0 ? ((testesData.semIndisponibilidadeTecnica || 0) / testesData.testadas) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          {testesData.testadas > 0 ? (((testesData.semIndisponibilidadeTecnica || 0) / testesData.testadas) * 100).toFixed(1) : 0}% das testadas • Indisponíveis = 0
                        </div>
                      </div>
                      
                      {/* 2. COM GANHO (melhorando) */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">📈</span>
                            <span className="text-sm font-medium text-gray-700">Com Ganho (Melhorando)</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">{testesData.comGanho || 0}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${testesData.testadas > 0 ? ((testesData.comGanho || 0) / testesData.testadas) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          {testesData.testadas > 0 ? (((testesData.comGanho || 0) / testesData.testadas) * 100).toFixed(1) : 0}% das testadas • Reduzindo indisponíveis
                        </div>
                      </div>
                      
                      {/* 3. ESTÁVEIS */}
                      <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">⚖️</span>
                            <span className="text-sm font-medium text-gray-700">Rotas Estáveis</span>
                          </div>
                          <span className="text-lg font-bold text-gray-600">{testesData.estaveis || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${testesData.testadas > 0 ? ((testesData.estaveis || 0) / testesData.testadas) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          {testesData.testadas > 0 ? (((testesData.estaveis || 0) / testesData.testadas) * 100).toFixed(1) : 0}% das testadas • Sem variação
                        </div>
                      </div>
                      
                      {/* 4. DEGRADADAS (piorando) - NOVO! */}
                      <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">📉</span>
                            <span className="text-sm font-medium text-gray-700">Rotas Degradadas (Piorando)</span>
                          </div>
                          <span className="text-lg font-bold text-red-600">{testesData.degradadas || 0}</span>
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${testesData.testadas > 0 ? ((testesData.degradadas || 0) / testesData.testadas) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-red-700 mt-1">
                          {testesData.testadas > 0 ? (((testesData.degradadas || 0) / testesData.testadas) * 100).toFixed(1) : 0}% das testadas • Aumentando indisponíveis ⚠️
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                {/* v3.49.06: TERCEIRA LINHA - Gráficos de Barras (LADO A LADO SEMPRE) */}
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* Gráfico 1: Comparação de Status */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">🔄 Comparação de Status</h3>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Rotas Cadastradas', value: testesData.cadastradas, max: testesData.cadastradas, color: 'bg-blue-500', bgColor: 'bg-blue-100' },
                        { label: 'Rotas Testadas', value: testesData.testadas, max: testesData.cadastradas, color: 'bg-cyan-500', bgColor: 'bg-cyan-100' },
                        { label: 'Rotas Validadas', value: testesData.semIndisponibilidade, max: testesData.cadastradas, color: 'bg-green-500', bgColor: 'bg-green-100' },
                        { label: 'Rotas Pendentes', value: testesData.pendentes, max: testesData.cadastradas, color: 'bg-orange-500', bgColor: 'bg-orange-100' },
                        { label: 'Não Testadas', value: testesData.naoTestadas, max: testesData.cadastradas, color: 'bg-gray-500', bgColor: 'bg-gray-100' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className="w-32 text-sm font-medium text-gray-700">{item.label}</div>
                          <div className="flex-1">
                            <div className={`w-full ${item.bgColor} rounded-full h-8 relative`}>
                              <div 
                                className={`${item.color} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${item.max > 0 ? (item.value / item.max) * 100 : 0}%` }}
                              >
                                <span className="text-xs font-bold text-white">
                                  {item.value}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-16 text-sm font-bold text-gray-700 text-right">
                            {item.max > 0 ? ((item.value / item.max) * 100).toFixed(0) : 0}%
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Legenda */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-600 text-center">
                        Base de cálculo: {testesData.cadastradas} rotas cadastradas
                      </div>
                    </div>
                  </div>
                  
                  {/* Gráfico 2: Performance Detalhada */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📈 Performance Detalhada</h3>
                    
                    <div className="space-y-3">
                      {[
                        { 
                          label: 'Taxa de Testes', 
                          value: testesData.cadastradas > 0 ? (testesData.testadas / testesData.cadastradas) * 100 : 0, 
                          color: 'bg-blue-500', 
                          bgColor: 'bg-blue-100',
                          icon: '🧪'
                        },
                        { 
                          label: 'Taxa de Validação', 
                          value: testesData.testadas > 0 ? (testesData.semIndisponibilidade / testesData.testadas) * 100 : 0, 
                          color: 'bg-green-500', 
                          bgColor: 'bg-green-100',
                          icon: '✅'
                        },
                        { 
                          label: 'Taxa de Conclusão', 
                          value: testesData.testadas > 0 ? (testesData.concluidas / testesData.testadas) * 100 : 0, 
                          color: 'bg-purple-500', 
                          bgColor: 'bg-purple-100',
                          icon: '🎯'
                        },
                        { 
                          label: 'Taxa de Melhoria', 
                          value: testesData.testadas > 0 ? (testesData.comGanho / testesData.testadas) * 100 : 0, 
                          color: 'bg-orange-500', 
                          bgColor: 'bg-orange-100',
                          icon: '📈'
                        },
                        { 
                          label: 'Taxa de Estabilidade', 
                          value: testesData.testadas > 0 ? (testesData.estaveis / testesData.testadas) * 100 : 0, 
                          color: 'bg-cyan-500', 
                          bgColor: 'bg-cyan-100',
                          icon: '⚖️'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className="w-6 text-center">{item.icon}</div>
                          <div className="w-36 text-sm font-medium text-gray-700">{item.label}</div>
                          <div className="flex-1">
                            <div className={`w-full ${item.bgColor} rounded-full h-8 relative`}>
                              <div 
                                className={`${item.color} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${Math.min(item.value, 100)}%` }}
                              >
                                <span className="text-xs font-bold text-white">
                                  {item.value.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
                
                
                {/* v3.42.03: COMPARAÇÃO ENTRE PSMs */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-900">Comparação entre PSMs</h3>
                        <p className="text-sm text-purple-700">{selectedQuarter} {selectedYear}</p>
                      </div>
                    </div>
                    
                    {/* Botão Exportar */}
                    <button
                      onClick={() => {
                        // Preparar dados para exportação
                        const relatorio = `RELATÓRIO DE TESTES E ANÁLISES
════════════════════════════════════════════════════════════
Período: ${selectedQuarter} ${selectedYear}
Data: ${new Date().toLocaleString('pt-BR')}

PSM ATUAL: ${selectedOperator}
════════════════════════════════════════════════════════════
Rotas Cadastradas: ${testesData.cadastradas}
Rotas Testadas: ${testesData.testadas} (${testesData.cadastradas > 0 ? ((testesData.testadas/testesData.cadastradas)*100).toFixed(1) : 0}%)
Rotas Validadas: ${testesData.semIndisponibilidade} (${testesData.testadas > 0 ? ((testesData.semIndisponibilidade/testesData.testadas)*100).toFixed(1) : 0}%)
Rotas Pendentes: ${testesData.pendentes}
Não Testadas: ${testesData.naoTestadas || 0}

PERFORMANCE:
- Taxa de Testes: ${testesData.cadastradas > 0 ? ((testesData.testadas/testesData.cadastradas)*100).toFixed(1) : 0}%
- Taxa de Validação: ${testesData.testadas > 0 ? ((testesData.semIndisponibilidade/testesData.testadas)*100).toFixed(1) : 0}%
- Taxa de Conclusão: ${testesData.testadas > 0 ? ((testesData.concluidas/testesData.testadas)*100).toFixed(1) : 0}%
- Taxa de Melhoria: ${testesData.testadas > 0 ? ((testesData.comGanho/testesData.testadas)*100).toFixed(1) : 0}%

COMPARAÇÃO ENTRE TODOS OS PSMs:
════════════════════════════════════════════════════════════
${Object.keys(todosTestesData).filter(psm => todosTestesData[psm]).map(psm => {
  const dados = todosTestesData[psm];
  return `
${psm}:
- Cadastradas: ${dados.cadastradas} | Testadas: ${dados.testadas} | Validadas: ${dados.semIndisponibilidade || dados.validadas || 0}
- Pendentes: ${dados.pendentes} | Não Testadas: ${dados.naoTestadas || 0}
- Taxa Testes: ${dados.taxaTestes.toFixed(1)}%
- Taxa Validação: ${dados.taxaValidacao.toFixed(1)}%
`;
}).join('')}

════════════════════════════════════════════════════════════
Gerado por: PSM Monitor v3.42.03
════════════════════════════════════════════════════════════`;

                        // Criar arquivo e baixar
                        const blob = new Blob([relatorio], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Testes_Analises_${selectedOperator}_${selectedQuarter}_${selectedYear}_${new Date().getTime()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        log('📄 Relatório exportado!');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Exportar Relatório</span>
                    </button>
                  </div>
                  
                  {/* Tabela de Comparação */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-purple-100 border-b-2 border-purple-300">
                          <th className="text-left p-3 font-bold text-purple-900">Métrica</th>
                          {Object.keys(todosTestesData).map(psm => (
                            <th key={psm} className={`text-center p-3 font-bold ${psm === selectedOperator ? 'bg-purple-200 text-purple-900' : 'text-purple-800'}`}>
                              {psm}
                              {psm === selectedOperator && <span className="ml-1 text-xs">✓</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Rotas Cadastradas', key: 'cadastradas', format: (v) => v },
                          { label: 'Rotas Testadas', key: 'testadas', format: (v) => v },
                          { label: 'Rotas Validadas', key: 'semIndisponibilidade', format: (v) => v },
                          { label: 'Rotas Pendentes', key: 'pendentes', format: (v) => v },
                          { label: 'Não Testadas', key: 'naoTestadas', format: (v) => v },
                          { label: 'Taxa de Testes', key: 'taxaTestes', format: (v) => `${v.toFixed(1)}%`, isPercentage: true },
                          { label: 'Taxa de Validação', key: 'taxaValidacao', format: (v) => `${v.toFixed(1)}%`, isPercentage: true }
                        ].map((metrica, idx) => (
                          <tr key={idx} className={`border-b border-purple-100 hover:bg-purple-50 ${metrica.highlight ? 'bg-amber-50 font-bold' : ''}`}>
                            <td className="p-3 text-gray-700">
                              {metrica.highlight && <span className="mr-2">🏆</span>}
                              {metrica.label}
                            </td>
                            {Object.keys(todosTestesData).map(psm => {
                              const dados = todosTestesData[psm];
                              if (!dados) return <td key={psm} className="text-center p-3 text-gray-400">-</td>;
                              
                              const valor = dados[metrica.key];
                              const melhor = metrica.isPercentage && Math.max(...Object.values(todosTestesData).filter(d => d).map(d => d[metrica.key]));
                              const isMelhor = metrica.isPercentage && valor === melhor && valor > 0;
                              
                              return (
                                <td key={psm} className={`text-center p-3 ${psm === selectedOperator ? 'bg-purple-50' : ''}`}>
                                  <span className={`${isMelhor ? 'text-green-600 font-bold' : metrica.highlight ? 'text-amber-600' : 'text-gray-800'}`}>
                                    {metrica.format(valor)}
                                    {isMelhor && <span className="ml-1">👑</span>}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Legenda */}
                  <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-purple-200 rounded"></div>
                      <span>PSM Selecionado</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👑</span>
                      <span>Melhor Performance</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>🏆</span>
                      <span>Índice Global</span>
                    </div>
                  </div>
                </div>
                
                {/* v3.42.02: RESUMO EXECUTIVO */}
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border-2 border-indigo-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-indigo-900 mb-2">Resumo Executivo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-gray-600 mb-1">Status Geral</div>
                          <div className="font-bold text-lg">
                            {testesData.pendentes === 0 ? (
                              <span className="text-green-600">✅ Completo</span>
                            ) : testesData.testadas === 0 ? (
                              <span className="text-red-600">⏳ Não Iniciado</span>
                            ) : (
                              <span className="text-blue-600">🔄 Em Progresso</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-gray-600 mb-1">Próxima Ação</div>
                          <div className="font-bold text-lg text-orange-600">
                            {testesData.pendentes > 0 ? (
                              <span>Testar {testesData.pendentes} rotas</span>
                            ) : testesData.comIndisponibilidades > 0 ? (
                              <span>Resolver {testesData.comIndisponibilidades} rotas</span>
                            ) : (
                              <span>✅ Nenhuma</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-gray-600 mb-1">Período</div>
                          <div className="font-bold text-lg text-gray-800">
                            {selectedQuarter} {selectedYear}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* v3.43.00: TABELA DE VALIDAÇÃO DE ROTAS */}
                <div className="mt-6 bg-white rounded-lg shadow-md border-2 border-green-200">
                  {/* Header da Tabela - Clicável para expandir/colapsar */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-green-50 transition-colors flex items-center justify-between"
                    onClick={() => setTabelaValidacaoAberta(!tabelaValidacaoAberta)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-900">Tabela de Validação de Rotas</h3>
                        <p className="text-sm text-green-700">
                          {testesData.cadastradas} rotas cadastradas • {testesData.testadas} testadas • {testesData.semIndisponibilidade} validadas
                        </p>
                      </div>
                    </div>
                    
                    {/* Ícone expandir/colapsar */}
                    <svg 
                      className={`w-6 h-6 text-green-600 transition-transform duration-200 ${tabelaValidacaoAberta ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* Conteúdo da Tabela - Expansível */}
                  {tabelaValidacaoAberta && (
                    <div className="p-4 border-t-2 border-green-200">
                      {/* Ações em Massa */}
                      <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">{ROUTES_BY_PSM[selectedOperator]?.length || 0}</span> rotas do PSM <span className="font-bold text-green-700">{selectedOperator}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const novasTestadas = { ...rotasTestadas };
                              // V5.10.16: Incluir ANO na estrutura
                              if (!novasTestadas[selectedYear]) novasTestadas[selectedYear] = {};
                              if (!novasTestadas[selectedYear][selectedOperator]) novasTestadas[selectedYear][selectedOperator] = {};
                              if (!novasTestadas[selectedYear][selectedOperator][selectedWeek]) novasTestadas[selectedYear][selectedOperator][selectedWeek] = {};
                              
                              ROUTES_BY_PSM[selectedOperator]?.forEach(rota => {
                                novasTestadas[selectedYear][selectedOperator][selectedWeek][rota] = {
                                  testada: true
                                };
                              });
                              setRotasTestadas(novasTestadas);
                              log('✅ Todas as rotas marcadas como testadas em', selectedWeek, selectedYear);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            ✓ Marcar Todas Testadas ({selectedWeek})
                          </button>
                          <button
                            onClick={() => {
                              const novasValidadas = { ...rotasValidadas };
                              // V5.10.16: Incluir ANO na estrutura
                              if (!novasValidadas[selectedYear]) novasValidadas[selectedYear] = {};
                              if (!novasValidadas[selectedYear][selectedOperator]) novasValidadas[selectedYear][selectedOperator] = {};
                              if (!novasValidadas[selectedYear][selectedOperator][selectedWeek]) novasValidadas[selectedYear][selectedOperator][selectedWeek] = {};
                              
                              ROUTES_BY_PSM[selectedOperator]?.forEach(rota => {
                                // Só validar se estiver testada NESTA semana
                                if (isRotaTestada(selectedOperator, selectedWeek, rota)) {
                                  novasValidadas[selectedYear][selectedOperator][selectedWeek][rota] = {
                                    validada: true
                                  };
                                }
                              });
                              setRotasValidadas(novasValidadas);
                              log('✅ Todas as rotas testadas em', selectedWeek, selectedYear, 'marcadas como validadas');
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            ✓ Validar Todas Testadas ({selectedWeek})
                          </button>
                          <button
                            onClick={() => {
                              // v3.48.02: FIX - Limpar semana com deep clone
                              if (!confirm(`⚠️ Tem certeza que deseja limpar TODAS as validações da semana ${selectedWeek}?\n\nEsta ação não pode ser desfeita.`)) {
                                return;
                              }
                              
                              // Deep clone para forçar re-render
                              const novasTestadas = JSON.parse(JSON.stringify(rotasTestadas));
                              const novasValidadas = JSON.parse(JSON.stringify(rotasValidadas));
                              
                              // Limpar APENAS esta semana
                              if (novasTestadas[selectedOperator]?.[selectedWeek]) {
                                delete novasTestadas[selectedOperator][selectedWeek];
                                log(`🗑️ Testadas da semana ${selectedWeek} deletadas`);
                              }
                              if (novasValidadas[selectedOperator]?.[selectedWeek]) {
                                delete novasValidadas[selectedOperator][selectedWeek];
                                log(`🗑️ Validadas da semana ${selectedWeek} deletadas`);
                              }
                              
                              setRotasTestadas(novasTestadas);
                              setRotasValidadas(novasValidadas);
                              log(`✅ Validações da semana ${selectedWeek} limpas com sucesso`);
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            ✗ Limpar Semana ({selectedWeek})
                          </button>
                        </div>
                      </div>
                      
                      {/* Tabela de Rotas */}
                      <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-green-100 sticky top-0">
                            <tr>
                              <th className="text-left p-3 font-bold text-green-900 w-12">#</th>
                              <th className="text-left p-3 font-bold text-green-900">Rota</th>
                              <th className="text-center p-3 font-bold text-blue-900 w-24">
                                🧪 Testada
                              </th>
                              <th className="text-center p-3 font-bold text-blue-700 w-24">
                                Semana
                              </th>
                              <th className="text-center p-3 font-bold text-green-900 w-24">
                                ✅ Validada
                              </th>
                              <th className="text-center p-3 font-bold text-green-700 w-24">
                                Semana
                              </th>
                              <th className="text-center p-3 font-bold text-gray-700 w-32">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(ROUTES_BY_PSM[selectedOperator] || []).map((rota, idx) => {
                              // v3.48.00: Verificar APENAS semana atual (para checkboxes)
                              const testada = isRotaTestada(selectedOperator, selectedWeek, rota);
                              const validada = isRotaValidada(selectedOperator, selectedWeek, rota);
                              
                              // v3.48.02: Obter semanas APENAS DO QUARTER SELECIONADO
                              const semanasTestadas = getSemanasTestadasNoQuarter(selectedOperator, rota, selectedQuarter);
                              const semanasValidadas = getSemanasValidadasNoQuarter(selectedOperator, rota, selectedQuarter);
                              
                              // v3.48.03: Status persiste no quarter inteiro após validação
                              const statusValidadaNoQuarter = isRotaValidadaNoQuarter(selectedOperator, rota, selectedQuarter);
                              const statusTestadaNoQuarter = isRotaTestadaNoQuarter(selectedOperator, rota, selectedQuarter);
                              
                              return (
                                <tr 
                                  key={rota} 
                                  className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${
                                    statusValidadaNoQuarter ? 'bg-green-50' : statusTestadaNoQuarter ? 'bg-yellow-50' : ''
                                  }`}
                                >
                                  <td className="p-3 text-gray-600">{idx + 1}</td>
                                  <td className="p-3 font-medium text-gray-800">{rota}</td>
                                  
                                  {/* Checkbox Testada */}
                                  <td className="text-center p-3">
                                    <button
                                      onClick={() => {
                                        const novas = { ...rotasTestadas };
                                        if (!novas[selectedOperator]) novas[selectedOperator] = {};
                                        if (!novas[selectedOperator][selectedWeek]) novas[selectedOperator][selectedWeek] = {};
                                        
                                        if (testada) {
                                          // Desmarcar APENAS desta semana
                                          delete novas[selectedOperator][selectedWeek][rota];
                                          
                                          // Limpar semana vazia
                                          if (Object.keys(novas[selectedOperator][selectedWeek]).length === 0) {
                                            delete novas[selectedOperator][selectedWeek];
                                          }
                                          
                                          // Desmarcar validada desta semana
                                          const novasVal = { ...rotasValidadas };
                                          if (novasVal[selectedOperator]?.[selectedWeek]) {
                                            delete novasVal[selectedOperator][selectedWeek][rota];
                                            if (Object.keys(novasVal[selectedOperator][selectedWeek]).length === 0) {
                                              delete novasVal[selectedOperator][selectedWeek];
                                            }
                                          }
                                          setRotasValidadas(novasVal);
                                        } else {
                                          // Marcar APENAS nesta semana
                                          novas[selectedOperator][selectedWeek][rota] = {
                                            testada: true
                                          };
                                        }
                                        
                                        setRotasTestadas(novas);
                                        log(`🧪 ${rota} ${testada ? 'desmarcada' : 'marcada'} em ${selectedWeek}`);
                                      }}
                                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        testada 
                                          ? 'bg-blue-600 border-blue-600 text-white' 
                                          : 'bg-white border-gray-300 hover:border-blue-400'
                                      }`}
                                    >
                                      {testada && <span className="text-lg">✓</span>}
                                    </button>
                                  </td>
                                  
                                  {/* Semanas Testadas */}
                                  <td className="text-center p-3">
                                    {semanasTestadas.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 justify-center">
                                        {semanasTestadas.map(sem => (
                                          <span 
                                            key={sem}
                                            className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                                              sem === selectedWeek 
                                                ? 'bg-blue-600 text-white font-bold' 
                                                : 'bg-blue-100 text-blue-700'
                                            }`}
                                          >
                                            {sem}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">-</span>
                                    )}
                                  </td>
                                  
                                  {/* Checkbox Validada */}
                                  <td className="text-center p-3">
                                    <button
                                      onClick={() => {
                                        // Só pode validar se estiver testada NESTA semana
                                        if (!testada) {
                                          alert(`⚠️ A rota precisa estar marcada como Testada em ${selectedWeek} primeiro!`);
                                          return;
                                        }
                                        
                                        const novas = { ...rotasValidadas };
                                        if (!novas[selectedOperator]) novas[selectedOperator] = {};
                                        if (!novas[selectedOperator][selectedWeek]) novas[selectedOperator][selectedWeek] = {};
                                        
                                        if (validada) {
                                          // Desmarcar APENAS desta semana
                                          delete novas[selectedOperator][selectedWeek][rota];
                                          
                                          // Limpar semana vazia
                                          if (Object.keys(novas[selectedOperator][selectedWeek]).length === 0) {
                                            delete novas[selectedOperator][selectedWeek];
                                          }
                                        } else {
                                          // Marcar APENAS nesta semana
                                          novas[selectedOperator][selectedWeek][rota] = {
                                            validada: true
                                          };
                                        }
                                        
                                        setRotasValidadas(novas);
                                        log(`✅ ${rota} ${validada ? 'desmarcada' : 'marcada'} em ${selectedWeek}`);
                                      }}
                                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        validada 
                                          ? 'bg-green-600 border-green-600 text-white' 
                                          : testada
                                          ? 'bg-white border-gray-300 hover:border-green-400'
                                          : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                                      }`}
                                      disabled={!testada}
                                    >
                                      {validada && <span className="text-lg">✓</span>}
                                    </button>
                                  </td>
                                  
                                  {/* Semanas Validadas */}
                                  <td className="text-center p-3">
                                    {semanasValidadas.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 justify-center">
                                        {semanasValidadas.map(sem => (
                                          <span 
                                            key={sem}
                                            className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                                              sem === selectedWeek 
                                                ? 'bg-green-600 text-white font-bold' 
                                                : 'bg-green-100 text-green-700'
                                            }`}
                                          >
                                            {sem}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">-</span>
                                    )}
                                  </td>
                                  
                                  {/* Status - v3.48.03: Persiste após validação no quarter */}
                                  <td className="text-center p-3">
                                    {statusValidadaNoQuarter ? (
                                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                        ✅ Validada
                                      </span>
                                    ) : statusTestadaNoQuarter ? (
                                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                                        ⏳ Pendente
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                                        ⚪ Não Testada
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Resumo da Tabela */}
                      <div className="mt-4 flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                        <div className="flex space-x-6 text-sm">
                          <div>
                            <span className="text-gray-600">Total: </span>
                            <span className="font-bold text-gray-800">{ROUTES_BY_PSM[selectedOperator]?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">🧪 Testadas: </span>
                            <span className="font-bold text-blue-700">{testesData.testadas}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({testesData.cadastradas > 0 ? ((testesData.testadas/testesData.cadastradas)*100).toFixed(0) : 0}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">✅ Validadas: </span>
                            <span className="font-bold text-green-700">{testesData.semIndisponibilidade}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({testesData.testadas > 0 ? ((testesData.semIndisponibilidade/testesData.testadas)*100).toFixed(0) : 0}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">⏳ Pendentes: </span>
                            <span className="font-bold text-red-700">{testesData.pendentes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
);
};

export default TestesAnalises;
