// src/utils/valueUtils.js
// Responsabilidade: obter valores de fibras com lógica de redução por prioridade
// ATENÇÃO: Estas funções recebem o objeto 'data' e 'distribuicaoReparacoes' como parâmetro
// Máx. 110 linhas

export const buscarValorAnterior = (data, selectedQuarter, quarterConfig, psm, week, route, tipo) => {
  if (!data?.[psm]) return 0;

  const weekNum = parseInt(week.replace('W', ''), 10);
  const trimestreAtual = quarterConfig[selectedQuarter];
  const semanaMinima = trimestreAtual.start;

  for (let w = weekNum - 1; w >= semanaMinima; w--) {
    const semanaAnterior = `W${w}`;
    const valor = parseInt(data[psm]?.[semanaAnterior]?.[route]?.[tipo], 10) || 0;
    if (valor > 0) {
      return valor;
    }
  }

  return 0;
};

export const getValorReduzido = (data, distribuicaoReparacoes, selectedQuarter, selectedYear, quarterConfig, psm, week, route, tipo) => {
  let original = parseInt(data?.[psm]?.[week]?.[route]?.[tipo], 10) || 0;

  if (original === 0) {
    original = buscarValorAnterior(data, selectedQuarter, quarterConfig, psm, week, route, tipo);
  }

  const weekNum = parseInt(week.replace('W', ''), 10);
  const trimestreAtual = quarterConfig[selectedQuarter];

  let descontoAcumulado = 0;
  for (let w = trimestreAtual.start; w <= weekNum; w++) {
    const semana = `W${w}`;
    descontoAcumulado += distribuicaoReparacoes?.[selectedYear]?.[psm]?.[semana]?.[route]?.[tipo] || 0;
  }

  return Math.max(0, original - descontoAcumulado);
};

export const getValorOriginal = (data, psm, week, route, tipo) =>
  parseInt(data?.[psm]?.[week]?.[route]?.[tipo], 10) || 0;
