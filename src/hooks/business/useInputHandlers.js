/**
 * useInputHandlers — Input/data-entry handlers extracted from App.jsx (Phase 9 refactoring)
 * Contains: handleInputChange, aplicarReparacaoPorTipo, cancelarModal,
 *           handleBlurTotalReparadas, buscarValorAnterior, getInputValue,
 *           handleRotaClick, handleStatusClick
 */

import { limparDistribuicaoNoSupabase } from '../../services/supabaseDistribuicaoService';
import { QUARTER_CONFIG } from '../../config/quarterConfig';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig';
import { STATUS_CATEGORIES } from '../../config/constants';
import { isValidNumericInput } from '../../utils/validators.js';
import { buscarValorAnterior as buscarValorAnteriorUtil } from '../../utils/valueUtils.js';
import { calcularNovoEstadoFibras } from '../../utils/fibraLogic.js';
import { log } from '../../utils/logger';

export function useInputHandlers({
  data,
  setData,
  justificativas,
  distribuicaoReparacoes,
  setDistribuicaoReparacoes,
  selectedOperator,
  selectedQuarter,
  selectedYear,
  pendingRepairData,
  setPendingRepairData,
  showRepairTypeModal,
  setShowRepairTypeModal,
  valorOriginalRef,
  skipNextSaveRef,
  setSelectedRota,
  setShowModal,
  setSelectedStatusDrilldown,
  setCurrentPageDrilldown,
  setShowStatusDrilldown,
  routesByPsm = STATIC_ROUTES_BY_PSM,
}) {

  // ============================================================================
  // FASE 9: TABELA EDITÁVEL - FUNÇÕES DE INPUT
  // ============================================================================

  /**
   * Busca o último valor conhecido de um tipo em semanas anteriores DO MESMO TRIMESTRE
   */
  const buscarValorAnterior = (psm, week, route, tipo) =>
    buscarValorAnteriorUtil(data, selectedQuarter, QUARTER_CONFIG, psm, week, route, tipo);

  /**
   * Função para manipular mudanças nos inputs da tabela
   */
  const handleInputChange = (psm, week, route, category, value) => {
    if (!isValidNumericInput(value)) return;

    setData(prevData => {
      const result = calcularNovoEstadoFibras({
        prevData,
        psm, week, route, category,
        value,
        distribuicaoReparacoes,
        selectedQuarter,
        selectedYear,
        pendingRepairData,
        valorOriginal: valorOriginalRef.current,
        quarterConfig: QUARTER_CONFIG,
        buscarValorAnteriorFn: buscarValorAnterior,
      });

      if (result.shouldSkipNextSave) skipNextSaveRef.current = true;
      if (result.clearValorOriginal) valorOriginalRef.current = null;
      if (result.setValorOriginal !== null) valorOriginalRef.current = result.setValorOriginal;
      if (result.newDistribuicao) setDistribuicaoReparacoes(result.newDistribuicao);
      if (result.shouldClearDistribuicao && result.clearDistribuicaoArgs) {
        const { psm: p, week: w, route: r, selectedQuarter: q, selectedYear: y } = result.clearDistribuicaoArgs;
        limparDistribuicaoNoSupabase(p, w, r, q, y);
      }
      if (result.newPendingRepairData !== undefined) setPendingRepairData(result.newPendingRepairData);

      return result.newData;
    });
  };

  const aplicarReparacaoPorTipo = (tipoSelecionado) => {
    if (!pendingRepairData) return;

    const { psm, week, route, diferenca, tiposDisponiveis } = pendingRepairData;

    // Encontrar valor atual do tipo selecionado
    const tipoAtual = tiposDisponiveis.find(t => t.tipo === tipoSelecionado);
    if (!tipoAtual) return;

    const valorDisponivel = tipoAtual.valor;
    const descontoAplicado = Math.min(valorDisponivel, diferenca);
    const reparacoesRestantes = diferenca - descontoAplicado;

    // V5.10.16: Registrar distribuição APENAS na semana atual DO ANO SELECIONADO
    setDistribuicaoReparacoes(prevDist => {
      const updated = JSON.parse(JSON.stringify(prevDist));
      if (!updated[selectedYear]) updated[selectedYear] = {};
      if (!updated[selectedYear][psm]) updated[selectedYear][psm] = {};
      if (!updated[selectedYear][psm][week]) updated[selectedYear][psm][week] = {};
      if (!updated[selectedYear][psm][week][route]) updated[selectedYear][psm][week][route] = {};

      // Somar ao desconto já existente desta semana (distribuição sequencial)
      const atual = updated[selectedYear][psm][week][route][tipoSelecionado] || 0;
      updated[selectedYear][psm][week][route][tipoSelecionado] = atual + descontoAplicado;

      log(`✅ ${tipoSelecionado}: +${descontoAplicado} em ${week} (total: ${atual + descontoAplicado})`);

      return updated;
    });

    // Verificar se ainda há reparações restantes
    if (reparacoesRestantes > 0) {
      // Atualizar tipos disponíveis (remover tipos zerados)
      const tiposAtualizados = tiposDisponiveis
        .map(t => {
          if (t.tipo === tipoSelecionado) {
            return { ...t, valor: t.valor - descontoAplicado };
          }
          return t;
        })
        .filter(t => t.valor > 0);

      if (tiposAtualizados.length > 0) {
        // Atualizar pendingRepairData com reparações restantes
        setPendingRepairData({
          ...pendingRepairData,
          diferenca: reparacoesRestantes,
          tiposDisponiveis: tiposAtualizados
        });
        log(`⚠️ Restam ${reparacoesRestantes} reparações. Selecione outro tipo.`);
        // Modal permanece aberto
      } else {
        // Todos os tipos esgotados mas ainda sobram reparações
        log(`⚠️ Todos os tipos esgotados. Ainda restam ${reparacoesRestantes} reparações não distribuídas.`);
        setShowRepairTypeModal(false);
        setPendingRepairData(null);
        valorOriginalRef.current = null;
      }
    } else {
      // Todas as reparações foram distribuídas
      log('✅ Todas as reparações distribuídas!');
      setShowRepairTypeModal(false);
      setPendingRepairData(null);
      valorOriginalRef.current = null;
    }
  };

  const cancelarModal = () => {
    if (!pendingRepairData) return;

    const { psm, week, route, valorAnterior } = pendingRepairData;

    // Reverter Total Reparadas para o valor anterior
    setData(prevData => {
      const updatedData = JSON.parse(JSON.stringify(prevData));
      const currentData = updatedData[psm][week][route];

      currentData['Total Reparadas'] = valorAnterior.toString();

      log(`❌ Modal cancelado. Total Reparadas revertido para: ${valorAnterior}`);

      return updatedData;
    });

    setShowRepairTypeModal(false);
    setPendingRepairData(null);
    valorOriginalRef.current = null;
  };

  const handleBlurTotalReparadas = () => {
    // Abrir modal se houver dados pendentes e modal ainda não estiver aberto
    if (pendingRepairData && !showRepairTypeModal) {
      log('❓ Abrindo modal com dados:', {
        diferenca: pendingRepairData.diferenca,
        tiposDisponiveis: pendingRepairData.tiposDisponiveis,
        week: pendingRepairData.week
      });
      setShowRepairTypeModal(true);
    }
  };

  /**
   * Função auxiliar para obter valor do estado 'data'
   */
  const getInputValue = (psm, week, route, category) => {
    try {
      return data[psm]?.[week]?.[route]?.[category] || '';
    } catch (e) {
      return '';
    }
  };

  // FASE 3: Função busca TODOS os dados da rota
  const handleRotaClick = (rota) => {

    // Buscar últimos valores de cada status do quadrimestre
    const quarterLimits = QUARTER_CONFIG[selectedQuarter];
    const stats = {};

    STATUS_CATEGORIES.forEach(status => {
      let key = status;
      if (status === "Fibras Dependentes") {
        key = 'Fibras dependentes da ' + selectedOperator;
      }

      let lastValue = 0;
      let lastWeek = null;

      // EXCEÇÃO: Total Reparadas deve ser ACUMULADO
      if (status === "Total Reparadas") {
        let acumulado = 0;

        // Somar todas as reparadas do quadrimestre
        for (let i = quarterLimits.start; i <= quarterLimits.end; i++) {
          const week = 'W' + i;
          const val = data[selectedOperator]?.[week]?.[rota]?.[key];
          if (val !== undefined && val > 0) {
            acumulado += parseInt(val) || 0;
            lastWeek = week; // Última semana com reparos
          }
        }

        lastValue = acumulado;
      } else {
        // Para outros status: buscar último valor não-zero do quadrimestre
        for (let i = quarterLimits.end; i >= quarterLimits.start; i--) {
          const week = 'W' + i;
          const val = data[selectedOperator]?.[week]?.[rota]?.[key];
          if (val !== undefined && val !== 0) {
            lastValue = val;
            lastWeek = week;
            break;
          }
        }
      }

      stats[status] = { value: lastValue, week: lastWeek };
    });

    // Buscar justificativa (chave: PSM_Rota) FILTRADA POR QUARTER
    const justKey = selectedOperator + '_' + rota;
    const rawJust = justificativas[justKey];

    // IMPORTANTE: Só usar a justificativa se for do quarter selecionado
    const just = (rawJust && rawJust.quarter === selectedQuarter) ? rawJust : null;

    log('📝 Justificativa (filtrada por quarter):', just);

    setSelectedRota({ name: rota, stats, justification: just });
    setShowModal(true);
  };

  // ============================================================================
  // FUNÇÃO DE DRILL-DOWN: Detalhamento por Status
  // ============================================================================

  const handleStatusClick = (statusLabel) => {

    const quarterLimits = QUARTER_CONFIG[selectedQuarter];
    const routesDetail = [];

    // ✅ MAPEAMENTO CORRETO: Label do card → Chave nos dados
    const labelToKeyMap = {
      // Labels dos cards (podem variar)
      'Indisponíveis': 'Indisponíveis',
      'Total Reparadas': 'Total Reparadas',
      'Reconhecidas': 'Reconhecidas',
      'Dep. Passagens': 'Dep. de Passagem de Cabo',
      'Dep. Licença': 'Dep. de Licença',
      'Dep. Cutover': 'Dep. de Cutover',
      'Fibras Dependentes': `Fibras dependentes da ${selectedOperator}`,
      // Transporte pode ter ano no label
      [`Transporte ${selectedQuarter} (${selectedYear})`]: 'Transporte',
      'Transporte': 'Transporte'
    };

    // Verificar se o label contém "Transporte" (pode ter ano)
    let key = labelToKeyMap[statusLabel];
    if (!key && statusLabel.includes('Transporte')) {
      key = 'Transporte';
    }

    // Se ainda não encontrou, tentar buscar por "Fibras Dep."
    if (!key && statusLabel.includes('Fibras Dep.')) {
      key = `Fibras dependentes da ${selectedOperator}`;
    }

    // Fallback: usar o próprio label
    if (!key) {
      key = statusLabel;
    }

    log('🔍 handleStatusClick:', { statusLabel, key, selectedOperator });

    // Iterar sobre todas as rotas do PSM
    (routesByPsm[selectedOperator] || []).forEach(route => {
      // Buscar último valor não-zero do status para esta rota
      let lastValue = 0;
      let lastWeek = null;

      // Para Total Reparadas: acumular
      if (key === 'Total Reparadas') {
        for (let i = quarterLimits.start; i <= quarterLimits.end; i++) {
          const week = 'W' + i;
          const val = data[selectedOperator]?.[week]?.[route]?.[key];
          if (val !== undefined && val > 0) {
            lastValue += parseInt(val) || 0;
            lastWeek = week;
          }
        }
      } else {
        // Para outros: buscar último valor não-zero
        for (let i = quarterLimits.end; i >= quarterLimits.start; i--) {
          const week = 'W' + i;
          const val = data[selectedOperator]?.[week]?.[route]?.[key];
          if (val !== undefined && val !== 0) {
            lastValue = parseInt(val) || 0;
            lastWeek = week;
            break;
          }
        }
      }

      // Se encontrou valor, adicionar à lista
      if (lastValue > 0) {
        routesDetail.push({
          rota: route,
          valor: lastValue,
          semana: lastWeek
        });
      }
    });

    // Ordenar por valor (decrescente)
    routesDetail.sort((a, b) => b.valor - a.valor);

    // Calcular total
    const total = routesDetail.reduce((sum, r) => sum + r.valor, 0);

    log('✅ Resultado:', { total, rotas: routesDetail.length });

    setSelectedStatusDrilldown({
      label: statusLabel,
      total: total,
      rotas: routesDetail
    });
    setCurrentPageDrilldown(0); // Reset para primeira página
    setShowStatusDrilldown(true);
  };

  return {
    buscarValorAnterior,
    handleInputChange,
    aplicarReparacaoPorTipo,
    cancelarModal,
    handleBlurTotalReparadas,
    getInputValue,
    handleRotaClick,
    handleStatusClick,
  };
}
