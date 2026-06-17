// src/utils/routeUtils.js
// Responsabilidade: queries sobre o estado de rotas testadas/validadas
// Máx. 130 linhas

import { ALL_WEEKS } from '../config/constants.js';
import { QUARTER_CONFIG } from '../config/quarterConfig.js';
import { ROUTES_BY_PSM } from '../config/routeConfig.js';

export const findPSMForRoute = (routeName) => {
  const normalizedRoute = routeName.trim();

  for (const [psm, routes] of Object.entries(ROUTES_BY_PSM)) {
    if (routes.includes(normalizedRoute)) {
      return psm;
    }

    const foundRoute = routes.find(r =>
      r.toLowerCase().replace(/\s+/g, ' ').trim() ===
      normalizedRoute.toLowerCase().replace(/\s+/g, ' ').trim()
    );

    if (foundRoute) {
      return psm;
    }
  }

  return null;
};

export const isRotaTestada = (rotasTestadas, selectedYear, psm, semana, rota) =>
  rotasTestadas?.[selectedYear]?.[psm]?.[semana]?.[rota]?.testada === true;

export const isRotaValidada = (rotasValidadas, selectedYear, psm, semana, rota) =>
  rotasValidadas?.[selectedYear]?.[psm]?.[semana]?.[rota]?.validada === true;

export const getSemanasTestadasNoQuarter = (rotasTestadas, selectedYear, psm, rota, quarter) => {
  if (!rotasTestadas?.[selectedYear]?.[psm]) return [];
  const semanas = [];
  const quarterWeeks = ALL_WEEKS.slice(
    QUARTER_CONFIG[quarter].start - 1,
    QUARTER_CONFIG[quarter].end
  );

  quarterWeeks.forEach(semana => {
    if (rotasTestadas[selectedYear][psm][semana]?.[rota]?.testada === true) {
      semanas.push(semana);
    }
  });

  return semanas.sort();
};

export const getSemanasValidadasNoQuarter = (rotasValidadas, selectedYear, psm, rota, quarter) => {
  if (!rotasValidadas?.[selectedYear]?.[psm]) return [];
  const semanas = [];
  const quarterWeeks = ALL_WEEKS.slice(
    QUARTER_CONFIG[quarter].start - 1,
    QUARTER_CONFIG[quarter].end
  );

  quarterWeeks.forEach(semana => {
    if (rotasValidadas[selectedYear][psm][semana]?.[rota]?.validada === true) {
      semanas.push(semana);
    }
  });

  return semanas.sort();
};

export const getSemanasTestadas = (rotasTestadas, psm, rota) => {
  if (!rotasTestadas?.[psm]) return [];
  const semanas = [];

  Object.keys(rotasTestadas[psm]).forEach(semana => {
    if (rotasTestadas[psm][semana]?.[rota]?.testada === true) {
      semanas.push(semana);
    }
  });

  return semanas.sort();
};

export const getSemanasValidadas = (rotasValidadas, psm, rota) => {
  if (!rotasValidadas?.[psm]) return [];
  const semanas = [];

  Object.keys(rotasValidadas[psm]).forEach(semana => {
    if (rotasValidadas[psm][semana]?.[rota]?.validada === true) {
      semanas.push(semana);
    }
  });

  return semanas.sort();
};

export const isRotaTestadaGlobalNoQuarter = (rotasTestadas, selectedYear, psm, rota, quarter) =>
  getSemanasTestadasNoQuarter(rotasTestadas, selectedYear, psm, rota, quarter).length > 0;

export const isRotaValidadaGlobalNoQuarter = (rotasValidadas, selectedYear, psm, rota, quarter) =>
  getSemanasValidadasNoQuarter(rotasValidadas, selectedYear, psm, rota, quarter).length > 0;

export const isRotaTestadaGlobal = (rotasTestadas, psm, rota) =>
  getSemanasTestadas(rotasTestadas, psm, rota).length > 0;

export const isRotaValidadaGlobal = (rotasValidadas, psm, rota) =>
  getSemanasValidadas(rotasValidadas, psm, rota).length > 0;

export const isRotaValidadaNoQuarter = (rotasValidadas, selectedYear, psm, rota, quarter) =>
  isRotaValidadaGlobalNoQuarter(rotasValidadas, selectedYear, psm, rota, quarter);

export const isRotaTestadaNoQuarter = (rotasTestadas, selectedYear, psm, rota, quarter) =>
  isRotaTestadaGlobalNoQuarter(rotasTestadas, selectedYear, psm, rota, quarter);
