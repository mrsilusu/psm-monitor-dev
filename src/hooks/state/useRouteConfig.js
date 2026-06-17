import { useState, useEffect, useCallback } from 'react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE, OPERATOR_TO_PROVINCES as STATIC_OPERATOR_TO_PROVINCES } from '../../config/provinceConfig.js';
import { getActiveRoutes, seedRoutesIfEmpty } from '../../services/routeConfigService.js';

// Garante que obj[qualquerChave] sempre retorna [] em vez de undefined
const safeArrayMap = (obj) => new Proxy(obj, {
  get: (target, key) => {
    if (typeof key !== 'string') return target[key];
    return target[key] ?? [];
  }
});

const buildMapsFromRows = (rows) => {
  const routesByPsm = {};
  const routeToProvince = {};
  const operatorToProvinces = {};

  rows.forEach(({ psm, route_name, province }) => {
    if (!routesByPsm[psm]) routesByPsm[psm] = [];
    routesByPsm[psm].push(route_name);

    routeToProvince[route_name] = province;

    if (!operatorToProvinces[psm]) operatorToProvinces[psm] = [];
    if (province && !operatorToProvinces[psm].includes(province)) {
      operatorToProvinces[psm].push(province);
    }
  });

  return {
    routesByPsm: safeArrayMap(routesByPsm),
    routeToProvince,
    operatorToProvinces: safeArrayMap(operatorToProvinces),
  };
};

const STATIC_ALL_PSMS = Object.keys(STATIC_ROUTES_BY_PSM);

export const useRouteConfig = () => {
  const [routes, setRoutes] = useState([]);
  const [routesByPsm, setRoutesByPsm] = useState(() => safeArrayMap(STATIC_ROUTES_BY_PSM));
  const [routeToProvince, setRouteToProvince] = useState(STATIC_ROUTE_TO_PROVINCE);
  const [operatorToProvinces, setOperatorToProvinces] = useState(() => safeArrayMap(STATIC_OPERATOR_TO_PROVINCES));
  const [allPsms, setAllPsms] = useState(STATIC_ALL_PSMS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await seedRoutesIfEmpty(STATIC_ROUTES_BY_PSM, STATIC_ROUTE_TO_PROVINCE);
      const { data, error } = await getActiveRoutes();
      if (error || !data || data.length === 0) throw new Error('empty');
      const maps = buildMapsFromRows(data);
      setRoutes(data);
      setRoutesByPsm(maps.routesByPsm);
      setRouteToProvince(maps.routeToProvince);
      setOperatorToProvinces(maps.operatorToProvinces);
      setAllPsms(Object.keys(maps.routesByPsm));
    } catch {
      setRoutes([]);
      setRoutesByPsm(safeArrayMap(STATIC_ROUTES_BY_PSM));
      setRouteToProvince(STATIC_ROUTE_TO_PROVINCE);
      setOperatorToProvinces(safeArrayMap(STATIC_OPERATOR_TO_PROVINCES));
      setAllPsms(STATIC_ALL_PSMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { routes, routesByPsm, routeToProvince, operatorToProvinces, allPsms, loading, refetch: load };
};
