// src/utils/dateUtils.js
// Responsabilidade: cálculos relacionados com semanas, quarters e anos
// Todas as funções são puras — recebem parâmetros, devolvem valores
// Máx. 70 linhas

import { QUARTER_CONFIG } from '../config/quarterConfig.js';

export const getQuarterFromWeek = (week) => {
  const weekNum = parseInt(week.substring(1), 10);
  if (weekNum >= 1 && weekNum <= 18) return 'Q1';
  if (weekNum >= 19 && weekNum <= 35) return 'Q2';
  if (weekNum >= 36 && weekNum <= 52) return 'Q3';
  return 'Q1';
};

export const getWeeksForQuarter = (quarter) => {
  const config = QUARTER_CONFIG[quarter];
  return Array.from({ length: config.weeks }, (_, i) => `W${config.start + i}`);
};

export const getQuarterAnterior = (currentQuarter, currentYear) => {
  const quarterMap = {
    Q1: { quarter: 'Q3', yearOffset: -1 },
    Q2: { quarter: 'Q1', yearOffset: 0 },
    Q3: { quarter: 'Q2', yearOffset: 0 }
  };

  const result = quarterMap[currentQuarter];
  if (!result) return { quarter: 'Q1', year: currentYear, label: 'Q1' };

  const year = currentYear + result.yearOffset;
  let label = result.quarter;
  if (result.yearOffset !== 0) {
    label = `${result.quarter} ${year}`;
  }

  return { quarter: result.quarter, year, label };
};
