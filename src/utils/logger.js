// src/utils/logger.js
// Responsabilidade: logging controlado por ambiente de execução
// Em produção, logs de debug são silenciados automaticamente
// Máx. 25 linhas

const isDev = process.env.NODE_ENV === 'development';

export const log = (...args) => {
  if (isDev) console.log(...args);
};

export const warn = (...args) => {
  if (isDev) console.warn(...args);
};

export const error = (...args) => {
  // Sempre activo — erros nunca são silenciados
  console.error(...args);
};

export const group = (label, fn) => {
  if (isDev) {
    console.group(label);
    try { fn(); } catch (e) { console.error(e); }
    console.groupEnd();
  }
};
