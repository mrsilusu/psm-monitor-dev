import { useMemo } from 'react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { QUARTER_CONFIG } from '../../config/quarterConfig.js';
import { ALL_WEEKS } from '../../config/constants.js';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE } from '../../config/provinceConfig.js';
import { getValorReduzido as getValorReduzidoUtil } from '../../utils/valueUtils.js';

export const useTendencias = ({
  data,
  distribuicaoReparacoes,
  selectedOperator,
  selectedQuarter,
  selectedYear,
  selectedWeek,
  selectedProvince,
  routesByPsm = STATIC_ROUTES_BY_PSM,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
}) => {
  const getValorReduzido = (psm, week, route, tipo) =>
    getValorReduzidoUtil(data, distribuicaoReparacoes, selectedQuarter, selectedYear, QUARTER_CONFIG, psm, week, route, tipo);

  const trendData = useMemo(() => {
    const quarterWeeks = ALL_WEEKS.slice(
      QUARTER_CONFIG[selectedQuarter].start - 1,
      QUARTER_CONFIG[selectedQuarter].end
    );

    if (!quarterWeeks || quarterWeeks.length === 0) return [];

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    const selectedWeekNum = parseInt(selectedWeek.substring(1));
    const weeksAteSelecao = quarterWeeks.filter(week => {
      const weekNum = parseInt(week.substring(1));
      return weekNum <= selectedWeekNum;
    });

    if (weeksAteSelecao.length === 0) return [];

    const trends = [];

    weeksAteSelecao.forEach((week, weekIdx) => {
      let weekStats = {
        week,
        indisponiveis: 0,
        totalReparadas: 0,
        reparadasGlobal: 0,
        fibrasDep: 0,
      };

      routesToProcess.forEach(route => {
        let ultimoIndisp = 0;
        for (let i = 0; i <= weekIdx; i++) {
          const w = weeksAteSelecao[i];
          const routeData = data[selectedOperator]?.[w]?.[route];
          if (routeData) {
            const indisp = parseInt(routeData['Indisponíveis']) || 0;
            if (indisp > 0) ultimoIndisp = indisp;
          }
        }
        weekStats.indisponiveis += ultimoIndisp;
      });

      let reparadasDaSemana = 0;
      routesToProcess.forEach(route => {
        const routeData = data[selectedOperator]?.[week]?.[route];
        if (routeData) {
          reparadasDaSemana += parseInt(routeData['Total Reparadas']) || 0;
        }
      });
      weekStats.totalReparadas = reparadasDaSemana;

      routesToProcess.forEach(route => {
        const fibrasDepReduzido = getValorReduzido(selectedOperator, week, route, `Fibras dependentes da ${selectedOperator}`);
        weekStats.fibrasDep += fibrasDepReduzido;
      });

      trends.push(weekStats);
    });

    let somaTotal = 0;
    trends.forEach(weekData => {
      somaTotal += weekData.totalReparadas;
      weekData.reparadasGlobal = somaTotal;
    });

    return trends;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, distribuicaoReparacoes, selectedOperator, selectedQuarter, selectedYear, selectedWeek, selectedProvince]);

  return { trendData };
};
