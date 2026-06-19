import { useMemo } from 'react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { QUARTER_CONFIG } from '../../config/quarterConfig.js';
import { ALL_WEEKS } from '../../config/constants.js';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE } from '../../config/provinceConfig.js';

export const useIntervencoes = ({
  data,
  selectedOperator,
  selectedQuarter,
  selectedWeek,
  selectedProvince,
  routesByPsm = STATIC_ROUTES_BY_PSM,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
}) => {
  const intervencoesRecentes = useMemo(() => {
    const quarterWeeks = ALL_WEEKS.slice(
      QUARTER_CONFIG[selectedQuarter].start - 1,
      QUARTER_CONFIG[selectedQuarter].end
    );

    const selectedWeekNum = parseInt(selectedWeek.substring(1));
    const weeksAteSelecao = quarterWeeks.filter(week => {
      const weekNum = parseInt(week.substring(1));
      return weekNum <= selectedWeekNum;
    }).reverse();

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    const intervencoes = [];

    routesToProcess.forEach(route => {
      let routeIntervencao = {
        rota: route,
        semanas: [],
        totalReparadas: 0,
        ultimaSemana: null,
      };

      weeksAteSelecao.forEach(week => {
        if (data[selectedOperator]?.[week]?.[route]) {
          const routeData = data[selectedOperator][week][route];
          const reparadas = parseInt(routeData['Total Reparadas']) || 0;
          if (reparadas > 0) {
            routeIntervencao.semanas.push(week);
            routeIntervencao.totalReparadas += reparadas;
            if (!routeIntervencao.ultimaSemana) {
              routeIntervencao.ultimaSemana = week;
            }
          }
        }
      });

      if (routeIntervencao.totalReparadas > 0) {
        intervencoes.push(routeIntervencao);
      }
    });

    intervencoes.sort((a, b) => {
      const weekNumA = parseInt(a.ultimaSemana.substring(1));
      const weekNumB = parseInt(b.ultimaSemana.substring(1));
      if (weekNumB !== weekNumA) return weekNumB - weekNumA;
      return b.totalReparadas - a.totalReparadas;
    });

    return intervencoes.map(item => ({
      rota: item.rota,
      status: item.semanas.slice(0, 3).join(' '),
      reps: item.totalReparadas,
      semanas: item.semanas,
      ultimaSemana: item.ultimaSemana,
    }));
  }, [data, selectedOperator, selectedQuarter, selectedProvince, selectedWeek]);

  const rotasNormalizadas = useMemo(() => {
    const quarterLimits = QUARTER_CONFIG[selectedQuarter];

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    const normalizadas = [];

    routesToProcess.forEach(route => {
      let wasNormalized = false;
      let normalizationWeek = null;
      let normalizationCondition = null;

      for (let checkWeek = quarterLimits.start; checkWeek <= quarterLimits.end; checkWeek++) {
        const week = 'W' + checkWeek;

        let totalReparadas = 0;
        for (let i = quarterLimits.start; i <= checkWeek; i++) {
          const w = 'W' + i;
          const weekData = data[selectedOperator]?.[w]?.[route];
          if (weekData && weekData['Total Reparadas']) {
            totalReparadas += parseInt(weekData['Total Reparadas']) || 0;
          }
        }

        if (totalReparadas === 0) continue;

        // Procurar o último valor de Indisponíveis até à semana actual
        let indisponiveis = null;
        for (let i = checkWeek; i >= quarterLimits.start; i--) {
          const w = 'W' + i;
          const weekData = data[selectedOperator]?.[w]?.[route];
          if (!weekData) continue;
          if ('Indisponíveis' in weekData) {
            const val = weekData['Indisponíveis'];
            if (val !== undefined && val !== null && val !== '') {
              indisponiveis = parseInt(val) || 0;
              break;
            }
          }
        }

        if (indisponiveis === null) continue;

        // Rota normalizada quando Indisponíveis === Total Reparadas
        const isNormalized = indisponiveis > 0 && indisponiveis === totalReparadas;

        if (isNormalized) {
          wasNormalized = true;
          normalizationWeek = week;
          normalizationCondition = 'Normalizada';
          break;
        }
      }

      if (wasNormalized) {
        normalizadas.push({
          rota: route,
          status: `Normalizada em ${normalizationWeek}`,
          semanaNormalizacao: normalizationWeek,
          condition: normalizationCondition,
          icon: '✓',
        });
      }
    });

    normalizadas.sort((a, b) => {
      const weekNumA = parseInt(a.semanaNormalizacao.substring(1));
      const weekNumB = parseInt(b.semanaNormalizacao.substring(1));
      return weekNumB - weekNumA;
    });

    if (normalizadas.length === 0) {
      return [
        { rota: 'Nenhuma rota normalizada', status: '-', icon: '○' },
        { rota: 'Nenhuma rota normalizada', status: '-', icon: '○' },
        { rota: 'Nenhuma rota normalizada', status: '-', icon: '○' },
      ];
    }

    return normalizadas;
  }, [data, selectedOperator, selectedQuarter, selectedProvince]);

  const rotasMaisIntervencionadas = useMemo(() => {
    const quarterWeeks = ALL_WEEKS.slice(
      QUARTER_CONFIG[selectedQuarter].start - 1,
      QUARTER_CONFIG[selectedQuarter].end
    );

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    const rotasComReparadas = [];

    routesToProcess.forEach(route => {
      let totalReparadas = 0;
      quarterWeeks.forEach(week => {
        if (data[selectedOperator]?.[week]?.[route]) {
          totalReparadas += parseInt(data[selectedOperator][week][route]['Total Reparadas']) || 0;
        }
      });
      if (totalReparadas > 0) {
        rotasComReparadas.push({ rota: route, totalReparadas });
      }
    });

    const top5 = rotasComReparadas
      .sort((a, b) => b.totalReparadas - a.totalReparadas)
      .slice(0, 5)
      .map((item, idx) => ({ rank: idx + 1, rota: item.rota, value: item.totalReparadas }));

    while (top5.length < 5) {
      top5.push({ rank: top5.length + 1, rota: '-', value: 0 });
    }

    return top5;
  }, [data, selectedOperator, selectedQuarter, selectedProvince]);

  const rotasSemIntervencao = useMemo(() => {
    const quarterWeeks = ALL_WEEKS.slice(
      QUARTER_CONFIG[selectedQuarter].start - 1,
      QUARTER_CONFIG[selectedQuarter].end
    );

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    const rotasSemReparadas = [];

    routesToProcess.forEach(route => {
      let totalReparadas = 0;
      let temDados = false;

      quarterWeeks.forEach(week => {
        if (data[selectedOperator]?.[week]?.[route]) {
          const routeData = data[selectedOperator][week][route];
          totalReparadas += parseInt(routeData['Total Reparadas']) || 0;
          const transporte = parseInt(routeData['Transporte']) || 0;
          const indisponiveis = parseInt(routeData['Indisponíveis']) || 0;
          if (transporte > 0 || indisponiveis > 0) temDados = true;
        }
      });

      if (temDados && totalReparadas === 0) {
        rotasSemReparadas.push({ rota: route });
      }
    });

    return rotasSemReparadas;
  }, [data, selectedOperator, selectedQuarter, selectedProvince]);

  return { intervencoesRecentes, rotasNormalizadas, rotasMaisIntervencionadas, rotasSemIntervencao };
};
