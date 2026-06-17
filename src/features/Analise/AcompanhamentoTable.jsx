import React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig';

const AcompanhamentoTable = ({
  selectedOperator,
  selectedQuarter,
  selectedWeek,
  selectedYear,
  acompanhamentoData,
  currentPageAcomp,
  setCurrentPageAcomp,
  itemsPerPageAcomp,
  handleInputChange,
  getInputValue,
  manualDataExpanded,
  setManualDataExpanded,
  handleBlurTotalReparadas,
  handleLimparJustificativas,
  quarterAnterior,
  routesByPsm = STATIC_ROUTES_BY_PSM,
}) => {
  const totalPagesAcomp = Math.ceil(acompanhamentoData.length / itemsPerPageAcomp);
  const startIndexAcomp = currentPageAcomp * itemsPerPageAcomp;
  const endIndexAcomp = startIndexAcomp + itemsPerPageAcomp;
  const currentDataAcomp = acompanhamentoData.slice(startIndexAcomp, endIndexAcomp);

  const goToNextPageAcomp = () => {
    if (currentPageAcomp < totalPagesAcomp - 1) {
      setCurrentPageAcomp(currentPageAcomp + 1);
    }
  };

  const goToPrevPageAcomp = () => {
    if (currentPageAcomp > 0) {
      setCurrentPageAcomp(currentPageAcomp - 1);
    }
  };

  return (
    <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  📋 Acompanhamento Transporte vs Degradação - {selectedOperator} {selectedQuarter} {selectedYear}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* Contador de importados */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    {acompanhamentoData.length} importados
                  </span>
                </div>
                {/* Botão Limpar Dados */}
                {acompanhamentoData.length > 0 && (
                  <button
                    onClick={handleLimparJustificativas}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg transition-colors group"
                    title="Limpar todas as justificativas deste PSM e Quarter"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                    <span className="text-xs font-medium text-red-600 group-hover:text-red-700">
                      Limpar Dados
                    </span>
                  </button>
                )}
              </div>
            </div>
            {acompanhamentoData.length === 0 ? (
              // MENSAGEM QUANDO NÃO HÁ DADOS
              <div className="p-6">
                <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-8 text-center">
                  <div className="text-6xl mb-4">📥</div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhuma justificativa importada para {selectedOperator} - {selectedQuarter}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Use o botão "📥 Importar Justificativas" no menu lateral para carregar os dados.
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: .xlsx, .xls, .csv
                  </p>
                </div>
              </div>
            ) : (
              // TABELA COM DADOS - OTIMIZADA
              <div className="p-4">
                {/* Container com scroll após 7 linhas */}
                <div 
                  className="overflow-auto border border-gray-200 rounded-lg"
                    style={{ maxHeight: acompanhamentoData.length > 7 ? '420px' : 'none' }}
                  >
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-yellow-100 border-b-2 border-yellow-300">
                          <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-800 border-r border-yellow-200 sticky left-0 bg-yellow-100 z-30">Secção</th>
                          <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-800 border-r border-yellow-200">Região</th>
                          <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-800 border-r border-yellow-200 bg-slate-100">Transp. {quarterAnterior.label}</th>
                          <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-800 border-r border-yellow-200 bg-red-100">Indisp.</th>
                          <th className="px-2 py-1.5 text-center text-xs font-bold text-gray-800 border-r border-yellow-200">Delta</th>
                          <th className="px-2 py-1.5 text-left text-xs font-bold text-gray-800">Justificativa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDataAcomp.map((row, index) => (
                          <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                            <td className="px-2 py-1.5 text-xs font-semibold text-gray-800 border-r border-gray-200 sticky left-0 bg-inherit z-10">
                              {row.seccao}
                            </td>
                            <td className="px-2 py-1.5 text-center text-xs text-gray-700 border-r border-gray-200">
                              {row.regiao}
                            </td>
                            <td className="px-2 py-1.5 text-center text-xs font-bold text-gray-800 border-r border-gray-200 bg-slate-50">
                              {row.transporteQ2}
                            </td>
                            <td className="px-2 py-1.5 text-center text-xs font-bold text-red-700 border-r border-gray-200 bg-red-50">
                              {row.indisponiveis}
                            </td>
                            <td className="px-2 py-1.5 text-center text-xs font-bold border-r border-gray-200">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                row.deltaIndisponibilidade.startsWith('+') 
                                  ? 'bg-red-100 text-red-700' 
                                  : row.deltaIndisponibilidade === '0' 
                                    ? 'bg-gray-100 text-gray-700' 
                                    : 'bg-green-100 text-green-700'
                              }`}>
                                {row.deltaIndisponibilidade}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-xs text-gray-600 leading-snug max-w-lg">
                              {row.justificativa}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINAÇÃO + Contador */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-300 px-4 py-3 mt-0 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      
                      {/* Botão Anterior */}
                      <button
                        onClick={goToPrevPageAcomp}
                        disabled={currentPageAcomp === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white transition-all shadow-sm"
                      >
                        <span className="text-lg">←</span>
                        <span className="text-xs font-semibold text-blue-700">Anterior</span>
                      </button>
                      
                      {/* Indicador Central */}
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-600 mb-1">
                          Mostrando <strong>{startIndexAcomp + 1}</strong> a <strong>{Math.min(endIndexAcomp, acompanhamentoData.length)}</strong> de <strong>{acompanhamentoData.length}</strong> secções
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-blue-700">
                            Página {currentPageAcomp + 1} de {totalPagesAcomp}
                          </span>
                          {/* Bolinhas indicadoras */}
                          <div className="flex space-x-1 ml-3">
                            {Array.from({ length: Math.min(totalPagesAcomp, 5) }, (_, i) => {
                              let pageIndex;
                              if (totalPagesAcomp <= 5) {
                                pageIndex = i;
                              } else if (currentPageAcomp < 2) {
                                pageIndex = i;
                              } else if (currentPageAcomp > totalPagesAcomp - 3) {
                                pageIndex = totalPagesAcomp - 5 + i;
                              } else {
                                pageIndex = currentPageAcomp - 2 + i;
                              }
                              return (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    pageIndex === currentPageAcomp 
                                      ? 'bg-blue-600 w-6' 
                                      : 'bg-blue-300'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Botão Próximo */}
                      <button
                        onClick={goToNextPageAcomp}
                        disabled={currentPageAcomp >= totalPagesAcomp - 1}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white transition-all shadow-sm"
                      >
                        <span className="text-xs font-semibold text-blue-700">Próximo</span>
                        <span className="text-lg">→</span>
                      </button>
                      
                    </div>
                  </div>
              </div>
            )}
          </div>

            {/* Tabela de Introdução Manual - FASE 9: INPUTS CONTROLADOS */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div 
              className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setManualDataExpanded(!manualDataExpanded)}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    📝 Introdução Manual dos Dados - {selectedOperator} {selectedWeek} {selectedQuarter} {selectedYear}
                  </h2>
                  {!manualDataExpanded && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(routesByPsm[selectedOperator] || []).length} rotas disponíveis • Clique para expandir
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-600 font-medium">Editável</span>
                </div>
                <button 
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setManualDataExpanded(!manualDataExpanded);
                  }}
                  title={manualDataExpanded ? "Recolher seção" : "Expandir seção"}
                >
                  {manualDataExpanded ? (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                manualDataExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4">

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                <p className="text-xs text-blue-800">
                  💡 <strong>Dica:</strong> Digite valores numéricos. Salvamento automático.
                </p>
                <p className="text-xs text-purple-800 mt-1">
                  🔄 <strong>Lógica:</strong> Total Reparadas ↑ → Fibras Dependentes ↓
                </p>
              </div>
              
              {/* Container com scroll após 10 rotas */}
              <div 
                className="overflow-auto border border-gray-200 rounded-lg"
                style={{ maxHeight: (routesByPsm[selectedOperator] || []).length > 10 ? '500px' : 'none' }}
              >
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-yellow-50 border-b-2 border-yellow-200">
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700 border-r border-yellow-200 sticky left-0 bg-yellow-50 z-30">Rota</th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border-r border-yellow-200">Transporte</th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border-r border-yellow-200">Indisponíveis</th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border-r border-yellow-200 bg-green-100">
                        <div className="flex items-center justify-center space-x-1">
                          <span>Total Reparadas</span>
                          <span className="text-green-600" title="Conectado a Fibras Dependentes">🔗</span>
                        </div>
                      </th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border-r border-yellow-200">Reconhecidas</th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border-r border-yellow-200">Dep. de Passagem de Cabo</th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border-r border-yellow-200">Dep. de Licença</th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 border-r border-yellow-200">Dep. de Cutover</th>
                      <th className="px-2 py-1.5 text-center text-xs font-semibold text-gray-700 bg-purple-100">
                        <div className="flex items-center justify-center space-x-1">
                          <span>Fibras dependentes da {selectedOperator}</span>
                          <span className="text-purple-600" title="Reduz automaticamente">🔗</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(routesByPsm[selectedOperator] || []).map((route, index) => (
                      <tr key={index} className={`h-4 border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                        <td className="px-1 py-0 text-[10px] leading-none text-gray-700 font-medium border-r border-gray-200 sticky left-0 bg-inherit z-10 max-h-5">{route}</td>
                        <td className="px-1.5 py-0 text-center text-xs text-gray-600 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, 'Transporte')}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, 'Transporte', e.target.value)}
                            className="w-full h-4 text-center border border-gray-300 rounded px-1 py-0 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors" 
                            placeholder="-"
                            maxLength="4"
                          />
                        </td>
                        <td className="px-1.5 py-0 text-center text-xs text-gray-600 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, 'Indisponíveis')}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, 'Indisponíveis', e.target.value)}
                            className="w-full h-4 text-center border border-gray-300 rounded px-1 py-0 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors" 
                            placeholder="-"
                            maxLength="4"
                          />
                        </td>
                        <td className="px-1.5 py-0 text-center text-xs text-gray-600 border-r border-gray-200 bg-green-50">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, 'Total Reparadas')}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, 'Total Reparadas', e.target.value)}
                            onBlur={handleBlurTotalReparadas}
                            className="w-full text-center border border-green-300 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition-colors bg-white" 
                            placeholder="-"
                            maxLength="4"
                            title="🔄 Altera automaticamente as Fibras Dependentes"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, 'Reconhecidas')}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, 'Reconhecidas', e.target.value)}
                            className="w-full h-4 text-center border border-gray-300 rounded px-1 py-0 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors" 
                            placeholder="-"
                            maxLength="4"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, 'Dep. de Passagem de Cabo')}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, 'Dep. de Passagem de Cabo', e.target.value)}
                            className="w-full h-4 text-center border border-gray-300 rounded px-1 py-0 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors" 
                            placeholder="-"
                            maxLength="4"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, 'Dep. de Licença')}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, 'Dep. de Licença', e.target.value)}
                            className="w-full h-4 text-center border border-gray-300 rounded px-1 py-0 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors" 
                            placeholder="-"
                            maxLength="4"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, 'Dep. de Cutover')}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, 'Dep. de Cutover', e.target.value)}
                            className="w-full h-4 text-center border border-gray-300 rounded px-1 py-0 text-[10px] leading-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors" 
                            placeholder="-"
                            maxLength="4"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 bg-purple-50">
                          <input 
                            type="text" 
                            value={getInputValue(selectedOperator, selectedWeek, route, `Fibras dependentes da ${selectedOperator}`)}
                            onChange={(e) => handleInputChange(selectedOperator, selectedWeek, route, `Fibras dependentes da ${selectedOperator}`, e.target.value)}
                            className="w-full text-center border-2 border-purple-400 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-500 transition-colors bg-white" 
                            placeholder="-"
                            maxLength="4"
                            title="🔄 Reduz automaticamente quando Total Reparadas aumenta"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">
                Mostrando todas as {(routesByPsm[selectedOperator] || []).length} rotas do PSM {selectedOperator}
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default AcompanhamentoTable;
