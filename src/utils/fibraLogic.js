// src/utils/fibraLogic.js
// Responsabilidade: algoritmo de redução automática de fibras dependentes
// Função pura: recebe estado actual, devolve novo estado + acções necessárias
// O chamador (handleInputChange) é responsável por aplicar os setters.

const EMPTY_ROUTE = (psm) => ({
  'Transporte': '', 'Indisponíveis': '', 'Total Reparadas': '',
  'Reconhecidas': '', 'Dep. de Passagem de Cabo': '', 'Dep. de Licença': '',
  'Dep. de Cutover': '', [`Fibras dependentes da ${psm}`]: '',
});

/**
 * Calcula o novo estado dos dados após uma alteração de input.
 *
 * @param {Object} p
 * @param {Object} p.prevData              - Estado actual de data (prevData do setData callback)
 * @param {string} p.psm                   - Operador (FIBRASOL / ISISTEL / ANGLOBAL)
 * @param {string} p.week                  - Semana (W1..W52)
 * @param {string} p.route                 - Nome da rota
 * @param {string} p.category              - Campo a alterar
 * @param {string} p.value                 - Novo valor (string, pode ser vazio)
 * @param {Object} p.distribuicaoReparacoes - Estado actual de distribuicao
 * @param {string} p.selectedQuarter       - Quarter activo (Q1/Q2/Q3)
 * @param {number} p.selectedYear          - Ano activo
 * @param {Object|null} p.pendingRepairData - Distribuição pendente do modal
 * @param {number|null} p.valorOriginal    - valorOriginalRef.current (valor antes de editar)
 * @param {Object} p.quarterConfig         - QUARTER_CONFIG
 * @param {Function} p.buscarValorAnteriorFn - buscarValorAnterior(psm, week, route, tipo)
 *
 * @returns {{
 *   newData: Object,
 *   newDistribuicao: Object|null,
 *   shouldClearDistribuicao: boolean,
 *   clearDistribuicaoArgs: Object|null,
 *   newPendingRepairData: Object|null|undefined,
 *   shouldSkipNextSave: boolean,
 *   clearValorOriginal: boolean,
 *   setValorOriginal: number|null,
 * }}
 */
export const calcularNovoEstadoFibras = ({
  prevData,
  psm,
  week,
  route,
  category,
  value,
  distribuicaoReparacoes,
  selectedQuarter,
  selectedYear,
  pendingRepairData,
  valorOriginal,
  quarterConfig,
  buscarValorAnteriorFn,
}) => {
  const result = {
    newData: null,
    newDistribuicao: null,
    shouldClearDistribuicao: false,
    clearDistribuicaoArgs: null,
    newPendingRepairData: undefined,
    shouldSkipNextSave: false,
    clearValorOriginal: false,
    setValorOriginal: null,
  };

  const newData = JSON.parse(JSON.stringify(prevData));
  if (!newData[psm]) newData[psm] = {};
  if (!newData[psm][week]) newData[psm][week] = {};
  if (!newData[psm][week][route]) newData[psm][week][route] = EMPTY_ROUTE(psm);

  const currentData = newData[psm][week][route];
  const currentTotalReparadas = parseInt(currentData['Total Reparadas'], 10) || 0;
  const newTotalReparadas = category === 'Total Reparadas' ? (parseInt(value, 10) || 0) : currentTotalReparadas;

  if (category === 'Total Reparadas') {
    if (value === '' || value === '0') {
      result.shouldSkipNextSave = true;

      const newDist = JSON.parse(JSON.stringify(distribuicaoReparacoes));
      if (newDist[selectedYear]?.[psm]?.[week]?.[route]) {
        delete newDist[selectedYear][psm][week][route];
        result.shouldClearDistribuicao = true;
        result.clearDistribuicaoArgs = { psm, week, route, selectedQuarter, selectedYear };
      }
      result.newDistribuicao = newDist;
      result.clearValorOriginal = true;
      result.newPendingRepairData = null;
      currentData[category] = value;
      result.newData = newData;
      return result;
    }

    if (!pendingRepairData && valorOriginal === null) {
      result.setValorOriginal = currentTotalReparadas;
    }

    const baseValorOriginal = valorOriginal !== null ? valorOriginal : currentTotalReparadas;
    const diferenca = newTotalReparadas - baseValorOriginal;

    if (diferenca > 0) {
      const tiposDefs = [
        'Reconhecidas',
        'Dep. de Passagem de Cabo',
        'Dep. de Licença',
        'Dep. de Cutover',
        `Fibras dependentes da ${psm}`,
      ];

      const weekNum = parseInt(week.replace('W', ''), 10);
      const trimestreAtual = quarterConfig[selectedQuarter];

      const tiposComValor = tiposDefs.map((campo) => {
        let original = parseInt(currentData[campo], 10) || 0;
        if (original === 0) original = buscarValorAnteriorFn(psm, week, route, campo);

        let descontoAcumulado = 0;
        for (let w = trimestreAtual.start; w <= weekNum; w++) {
          const semana = `W${w}`;
          descontoAcumulado += distribuicaoReparacoes[selectedYear]?.[psm]?.[semana]?.[route]?.[campo] || 0;
        }
        return { tipo: campo, valor: Math.max(0, original - descontoAcumulado) };
      }).filter((item) => item.valor > 0);

      if (tiposComValor.length > 1) {
        currentData[category] = value;
        result.newPendingRepairData = {
          psm, week, route, diferenca,
          valorAnterior: valorOriginal !== null ? valorOriginal : currentTotalReparadas,
          tiposDisponiveis: tiposComValor,
          newData,
        };
        result.newData = newData;
        return result;
      }

      if (tiposComValor.length === 1) {
        const tipoUnico = tiposComValor[0];
        const descontoAplicado = Math.min(tipoUnico.valor, diferenca);
        const newDist = JSON.parse(JSON.stringify(distribuicaoReparacoes));
        if (!newDist[selectedYear]) newDist[selectedYear] = {};
        if (!newDist[selectedYear][psm]) newDist[selectedYear][psm] = {};
        if (!newDist[selectedYear][psm][week]) newDist[selectedYear][psm][week] = {};
        if (!newDist[selectedYear][psm][week][route]) newDist[selectedYear][psm][week][route] = {};
        newDist[selectedYear][psm][week][route][tipoUnico.tipo] = descontoAplicado;
        result.newDistribuicao = newDist;
      }
    }
  }

  currentData[category] = value;
  result.newData = newData;
  return result;
};
