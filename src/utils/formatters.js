// src/utils/formatters.js
// Responsabilidade: formatação de valores para exibição na UI
// Máx. 50 linhas

export const formatPercentage = (value, decimals = 1) =>
  `${Number(value).toFixed(decimals)}%`;

export const formatNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0' : num.toLocaleString('pt-AO');
};

export const formatWeekLabel = (week) =>
  week ? week.replace('W', 'Semana ') : '';

export const formatQuarterLabel = (quarter, year) =>
  quarter && year ? `${quarter} / ${year}` : '';
