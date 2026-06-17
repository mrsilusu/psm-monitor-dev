// src/utils/validators.js
// Responsabilidade: validação centralizada de todos os inputs do app
// Máx. 80 linhas

export const isValidNumericInput = (value) =>
  value === '' || /^\d+$/.test(String(value));

export const sanitizeNumericInput = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = parseInt(String(value).trim(), 10);
  return isNaN(num) || num < 0 ? '' : String(num);
};

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));

export const isValidPSM = (psm) =>
  ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'].includes(psm);

export const isValidWeek = (week) =>
  /^W([1-9]|[1-4]\d|5[0-2])$/.test(week);

export const isValidQuarter = (q) =>
  ['Q1', 'Q2', 'Q3'].includes(q);

export const isValidYear = (year) => {
  const num = parseInt(year, 10);
  return !isNaN(num) && num >= 2020 && num <= 2100;
};
