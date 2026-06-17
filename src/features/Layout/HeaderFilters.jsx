import React from 'react';
import { BarChart3, Menu, TrendingUp, XCircle, CheckCircle, AlertTriangle, Users, Clock, MapPin, Shield, LogOut } from 'lucide-react';
import { OPERATOR_TO_PROVINCES as STATIC_OPERATOR_TO_PROVINCES } from '../../config/provinceConfig';
import { getWeeksForQuarter } from '../../utils/dateUtils.js';
import SaveStatus from '../../components/feedback/SaveStatus.jsx';
import useAuth from '../../auth/useAuth.js';

const STATIC_ALL_PSMS = Object.keys(STATIC_OPERATOR_TO_PROVINCES);

const HeaderFilters = ({
  headerVisible,
  isMobileDevice,
  showMobileWarning,
  menuOpen,
  setMenuOpen,
  saveStatus,
  lastSaveTime,
  selectedOperator,
  setSelectedOperator,
  selectedProvince,
  setSelectedProvince,
  selectedWeek,
  setSelectedWeek,
  selectedQuarter,
  setSelectedQuarter,
  selectedYear,
  setSelectedYear,
  showTestesAnalises,
  setShowTestesAnalises,
  alertasAbertos,
  setAlertasAbertos,
  alertas,
  alertasLidos,
  setAlertasLidos,
  headerCardsData,
  handleStatusClick,
  operatorToProvinces = STATIC_OPERATOR_TO_PROVINCES,
  allPsms = STATIC_ALL_PSMS,
}) => {
  const { user, profile, signOut } = useAuth();

  const role = profile?.role ?? user?.user_metadata?.roles?.[0] ?? null;
  const isAdmin = role === 'admin';
  const displayName = profile?.full_name || user?.email || '';
  const initials = displayName
    .split(/[\s@]/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');

  const ROLE_STYLE = {
    admin:  'bg-purple-100 text-purple-700',
    editor: 'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-600',
  };

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
    <div
      className={`sticky z-50 bg-white shadow-md transition-all duration-300 ${
        headerVisible ? 'translate-y-0' : '-translate-y-[60px]'
      }`}
      style={{ top: (isMobileDevice && showMobileWarning) ? '72px' : '0' }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-5 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Botão Hamburguer para Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Performance Clean Up Advanced</h1>
              <p className="text-xs text-gray-500">v5.02.0 - Sem Semana Rep! 🎨✨</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SaveStatus saveStatus={saveStatus} lastSaveTime={lastSaveTime} />

            {/* User info */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${isAdmin ? 'bg-purple-600' : 'bg-gray-400'}`}>
                {initials || '?'}
              </div>

              {/* Nome + role */}
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">{displayName}</span>
                {role && (
                  <span className={`text-[10px] font-semibold rounded px-1 py-0.5 w-fit ${ROLE_STYLE[role] ?? ROLE_STYLE.viewer}`}>
                    {role}
                  </span>
                )}
              </div>

              {/* Backoffice link — só admin */}
              {isAdmin && (
                <button
                  onClick={() => { window.location.href = '/backoffice'; }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
                  title="Backoffice"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Backoffice</span>
                </button>
              )}

              {/* Logout */}
              <button
                onClick={async () => { await signOut(); window.location.href = '/login'; }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Terminar sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS E CARDS DE RESUMO */}
      <div className="border-b border-gray-200 px-5 py-2.5">
      <div className="flex items-center justify-between mb-4">
        {/* Filtros */}
        <div className="flex items-center space-x-3">
          <select value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            {allPsms.map(psm => (
              <option key={psm} value={psm}>{psm}</option>
            ))}
          </select>

          {/* FILTRO DE PROVÍNCIA - Texto simples */}
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Todas">Todas as Províncias</option>
            {(operatorToProvinces[selectedOperator] || []).map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>

          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            {getWeeksForQuarter(selectedQuarter).map(week => (
              <option key={week} value={week}>{week}</option>
            ))}
          </select>
          <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="Q3">Q3</option>
            <option value="Q2">Q2</option>
            <option value="Q1">Q1</option>
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="2030">2030</option>
            <option value="2029">2029</option>
            <option value="2028">2028</option>
            <option value="2027">2027</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        {/* v3.49.29: BOTÃO TESTES E ANÁLISES MODERNIZADO */}
        <button
          onClick={() => setShowTestesAnalises(!showTestesAnalises)}
          className={`group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
            showTestesAnalises
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
              : 'bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md hover:scale-105'
          }`}
          title={showTestesAnalises ? "Fechar Testes e Análises" : "Abrir Testes e Análises"}
        >
          {/* Ícone com animação */}
          <div className={`transition-transform duration-200 ${showTestesAnalises ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>

          {/* Texto */}
          <span className="whitespace-nowrap">Testes e Análises</span>

          {/* Badge indicador quando aberto */}
          {showTestesAnalises && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse border-2 border-white"></span>
          )}

          {/* Ícone de chevron quando fechado */}
          {!showTestesAnalises && (
            <svg className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* v3.40.27: SINO DE ALERTAS */}
        <div className="relative">
          <button
            onClick={() => setAlertasAbertos(!alertasAbertos)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={`${alertas.filter(a => !alertasLidos.includes(a.id)).length} alertas`}
          >
            {/* Ícone do sino */}
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Badge com contador (apenas não lidos) */}
            {alertas.filter(a => !alertasLidos.includes(a.id)).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {alertas.filter(a => !alertasLidos.includes(a.id)).length}
              </span>
            )}
          </button>

          {/* Dropdown de alertas */}
          {alertasAbertos && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    🔔 Alertas ({alertas.filter(a => !alertasLidos.includes(a.id)).length} não lidos)
                  </h3>
                  <button
                    onClick={() => {
                      setAlertasLidos(alertas.map(a => a.id));
                      setAlertasAbertos(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar todos como lidos
                  </button>
                </div>
              </div>

              {/* Lista de alertas */}
              <div className="overflow-y-auto flex-1">
                {alertas.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    ✅ Nenhum alerta no momento
                  </div>
                ) : (
                  alertas.map((alerta, idx) => {
                    const isLido = alertasLidos.includes(alerta.id);

                    return (
                      <div
                        key={alerta.id}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                          !isLido ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Ícone condicional baseado no tipo */}
                          <div className="flex-shrink-0 mt-0.5">
                            {alerta.tipo === 'indisponivel-sem-explicacao' ? (
                              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-semibold uppercase ${
                                alerta.tipo === 'indisponivel-sem-explicacao' ? 'text-amber-600' : 'text-blue-600'
                              }`}>
                                {alerta.tipo === 'indisponivel-sem-explicacao'
                                  ? 'Indisp. com Cálculo Inconsistente'
                                  : 'Inconsistência de Dados'}
                              </span>
                              {!isLido && (
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  alerta.tipo === 'indisponivel-sem-explicacao' ? 'bg-amber-500' : 'bg-blue-500'
                                }`}></span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-800 mb-1">
                              {alerta.rota}
                            </p>

                            {/* Conteúdo específico por tipo */}
                            {alerta.tipo === 'indisponivel-sem-explicacao' ? (
                              <>
                                <p className="text-xs text-gray-600 mb-2">
                                  Indisponíveis ({alerta.indisponiveis}) ≠ Soma Justificativas ({alerta.somaJustificativas}) em {alerta.semanaDeteccao}
                                </p>
                                <div className="text-xs text-gray-500 mb-2 space-y-0.5">
                                  {alerta.detalhes.reconhecidas > 0 && (
                                    <div>• Reconhecidas: {alerta.detalhes.reconhecidas}</div>
                                  )}
                                  {alerta.detalhes.depPassagem > 0 && (
                                    <div>• Dep. Passagem: {alerta.detalhes.depPassagem}</div>
                                  )}
                                  {alerta.detalhes.depLicenca > 0 && (
                                    <div>• Dep. Licença: {alerta.detalhes.depLicenca}</div>
                                  )}
                                  {alerta.detalhes.depCutover > 0 && (
                                    <div>• Dep. Cutover: {alerta.detalhes.depCutover}</div>
                                  )}
                                  {alerta.detalhes.fibrasDependentes > 0 && (
                                    <div>
                                      • Fibras Dependentes: {alerta.detalhes.fibrasDependentes}
                                      {alerta.detalhes.totalReparadas > 0 && (
                                        <span className="text-blue-600 ml-1">
                                          (atual: {alerta.detalhes.fibrasDependentesAtual} + reparadas: {alerta.detalhes.totalReparadas})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-medium ${
                                    alerta.diferenca > 0 ? 'text-red-600' : 'text-amber-600'
                                  }`}>
                                    {alerta.provincia} • {alerta.diferenca > 0 ? 'Faltam' : 'Sobram'} {Math.abs(alerta.diferenca)} fibra(s)
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (!isLido) {
                                        setAlertasLidos([...alertasLidos, alerta.id]);
                                      }
                                    }}
                                    className="text-xs text-amber-600 hover:text-amber-800"
                                  >
                                    {isLido ? '✓ Lido' : 'Marcar como lido'}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-xs text-gray-600 mb-2">
                                  Reparadas Acumulado ({alerta.reparadasAcumulado}) {'>'} Indisponíveis ({alerta.indisponiveis}) em {alerta.semanaDeteccao}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {alerta.provincia} • Diferença: +{alerta.diferenca}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (!isLido) {
                                        setAlertasLidos([...alertasLidos, alerta.id]);
                                      }
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    {isLido ? '✓ Lido' : 'Marcar como lido'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {alertas.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-center">
                  <p className="text-xs text-gray-600">
                    Total: {alertas.length} alerta{alertas.length !== 1 ? 's' : ''} detectado{alertas.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards de Resumo Superiores - COMPACTOS EM UMA LINHA (8 cards) */}
      <div className="grid grid-cols-8 gap-2">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} text-white rounded-lg p-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200`}
            onClick={() => handleStatusClick(card.label)}
            title={`Clique para ver detalhes de ${card.label}`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-medium opacity-90 leading-tight">{card.label}</span>
              <div className="w-3 h-3">{card.icon}</div>
            </div>
            <div className="flex items-end space-x-1">
              <span className="text-xl font-bold leading-none">{card.value}</span>
              {card.total && <span className="text-[10px] opacity-75 mb-0.5">de {card.total}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default HeaderFilters;
