/**
 * useRouteChecks — Route testing/validation wrappers extracted from App.jsx (Phase 9 refactoring)
 */

import {
  isRotaTestada as isRotaTestadaUtil,
  isRotaValidada as isRotaValidadaUtil,
  getSemanasTestadasNoQuarter as getSemanasTestadasNoQuarterUtil,
  getSemanasValidadasNoQuarter as getSemanasValidadasNoQuarterUtil,
  getSemanasTestadas as getSemanasTestadasUtil,
  getSemanasValidadas as getSemanasValidadasUtil,
  isRotaTestadaGlobalNoQuarter as isRotaTestadaGlobalNoQuarterUtil,
  isRotaValidadaGlobalNoQuarter as isRotaValidadaGlobalNoQuarterUtil,
  isRotaTestadaGlobal as isRotaTestadaGlobalUtil,
  isRotaValidadaGlobal as isRotaValidadaGlobalUtil,
  isRotaValidadaNoQuarter as isRotaValidadaNoQuarterUtil,
  isRotaTestadaNoQuarter as isRotaTestadaNoQuarterUtil,
} from '../../utils/routeUtils.js';

export function useRouteChecks({ rotasTestadas, rotasValidadas, selectedYear }) {
  const isRotaTestada = (psm, semana, rota) =>
    isRotaTestadaUtil(rotasTestadas, selectedYear, psm, semana, rota);

  const isRotaValidada = (psm, semana, rota) =>
    isRotaValidadaUtil(rotasValidadas, selectedYear, psm, semana, rota);

  const getSemanasTestadasNoQuarter = (psm, rota, quarter) =>
    getSemanasTestadasNoQuarterUtil(rotasTestadas, selectedYear, psm, rota, quarter);

  const getSemanasValidadasNoQuarter = (psm, rota, quarter) =>
    getSemanasValidadasNoQuarterUtil(rotasValidadas, selectedYear, psm, rota, quarter);

  const getSemanasTestadas = (psm, rota) =>
    getSemanasTestadasUtil(rotasTestadas, psm, rota);

  const getSemanasValidadas = (psm, rota) =>
    getSemanasValidadasUtil(rotasValidadas, psm, rota);

  const isRotaTestadaGlobalNoQuarter = (psm, rota, quarter) =>
    isRotaTestadaGlobalNoQuarterUtil(rotasTestadas, selectedYear, psm, rota, quarter);

  const isRotaValidadaGlobalNoQuarter = (psm, rota, quarter) =>
    isRotaValidadaGlobalNoQuarterUtil(rotasValidadas, selectedYear, psm, rota, quarter);

  const isRotaTestadaGlobal = (psm, rota) =>
    isRotaTestadaGlobalUtil(rotasTestadas, psm, rota);

  const isRotaValidadaGlobal = (psm, rota) =>
    isRotaValidadaGlobalUtil(rotasValidadas, psm, rota);

  const isRotaValidadaNoQuarter = (psm, rota, quarter) =>
    isRotaValidadaNoQuarterUtil(rotasValidadas, selectedYear, psm, rota, quarter);

  const isRotaTestadaNoQuarter = (psm, rota, quarter) =>
    isRotaTestadaNoQuarterUtil(rotasTestadas, selectedYear, psm, rota, quarter);

  return {
    isRotaTestada,
    isRotaValidada,
    getSemanasTestadasNoQuarter,
    getSemanasValidadasNoQuarter,
    getSemanasTestadas,
    getSemanasValidadas,
    isRotaTestadaGlobalNoQuarter,
    isRotaValidadaGlobalNoQuarter,
    isRotaTestadaGlobal,
    isRotaValidadaGlobal,
    isRotaValidadaNoQuarter,
    isRotaTestadaNoQuarter,
  };
}
