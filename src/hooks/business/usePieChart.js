import { useMemo } from 'react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { QUARTER_CONFIG } from '../../config/quarterConfig.js';
import { ALL_WEEKS } from '../../config/constants.js';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE } from '../../config/provinceConfig.js';
import { getValorReduzido as getValorReduzidoUtil } from '../../utils/valueUtils.js';

export const usePieChart = ({
  data,
  distribuicaoReparacoes,
  selectedOperator,
  selectedQuarter,
  selectedYear,
  selectedProvince,
  routesByPsm = STATIC_ROUTES_BY_PSM,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
}) => {
  const getValorReduzido = (psm, week, route, tipo) =>
    getValorReduzidoUtil(data, distribuicaoReparacoes, selectedQuarter, selectedYear, QUARTER_CONFIG, psm, week, route, tipo);

  const pieChartData = useMemo(() => {
    const quarterWeeks = ALL_WEEKS.slice(
      QUARTER_CONFIG[selectedQuarter].start - 1,
      QUARTER_CONFIG[selectedQuarter].end
    );

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    let totals = {
      transporte: 0,
      indisponiveis: 0,
      totalReparadas: 0,
      reconhecidas: 0,
      depPassagem: 0,
      depLicenca: 0,
      depCutover: 0,
      fibrasDep: 0,
    };

    routesToProcess.forEach(route => {
      let ultimoTransporte = 0;
      let somaReparadas = 0;

      quarterWeeks.forEach(week => {
        const routeData = data[selectedOperator]?.[week]?.[route];
        if (routeData) {
          const transVal = parseInt(routeData['Transporte'], 10) || 0;
          if (transVal > 0) ultimoTransporte = transVal;
          somaReparadas += parseInt(routeData['Total Reparadas'], 10) || 0;
        }
      });

      const ultimaSemana = quarterWeeks[quarterWeeks.length - 1];
      const reconhecidasReduzido = getValorReduzido(selectedOperator, ultimaSemana, route, 'Reconhecidas');
      const depPassagemReduzido = getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Passagem de Cabo');
      const depLicencaReduzido = getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Licença');
      const depCutoverReduzido = getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Cutover');
      const fibrasDepReduzido = getValorReduzido(selectedOperator, ultimaSemana, route, `Fibras dependentes da ${selectedOperator}`);

      const indisponiveisLiquidos = reconhecidasReduzido + depPassagemReduzido +
                                     depLicencaReduzido + depCutoverReduzido + fibrasDepReduzido;

      totals.totalReparadas += somaReparadas;
      totals.indisponiveis += indisponiveisLiquidos;
      totals.fibrasDep += fibrasDepReduzido;
      totals.depCutover += depCutoverReduzido;
      totals.depLicenca += depLicencaReduzido;
      totals.depPassagem += depPassagemReduzido;
      totals.reconhecidas += reconhecidasReduzido;
      totals.transporte += ultimoTransporte;
    });

    const totalGeral = Object.values(totals).reduce((sum, val) => sum + val, 0);

    if (totalGeral === 0) {
      return {
        outer: [
          { label: 'Total Reparadas', percentage: 0, value: 0, color: '#22c55e' },
          { label: 'Indisponíveis', percentage: 0, value: 0, color: '#ef4444' },
        ],
        inner: [
          { label: 'Reconhecidas', percentage: 0, value: 0, color: '#06b6d4' },
          { label: 'Dep. Passagem', percentage: 0, value: 0, color: '#3b82f6' },
          { label: 'Dep. Licença', percentage: 0, value: 0, color: '#f97316' },
          { label: 'Dep. Cutover', percentage: 0, value: 0, color: '#9333ea' },
          { label: `Dep. ${selectedOperator}`, percentage: 0, value: 0, color: '#64748b' },
        ],
      };
    }

    const totalPrincipal = totals.totalReparadas + totals.indisponiveis;

    const outerData = [
      {
        label: 'Total Reparadas',
        percentage: parseFloat(((totals.totalReparadas / totalPrincipal) * 100).toFixed(1)),
        value: totals.totalReparadas,
        color: '#22c55e',
      },
      {
        label: 'Indisponíveis',
        percentage: parseFloat(((totals.indisponiveis / totalPrincipal) * 100).toFixed(1)),
        value: totals.indisponiveis,
        color: '#ef4444',
      },
    ];

    const totalSubcategorias = totals.reconhecidas + totals.depPassagem +
                               totals.depLicenca + totals.depCutover + totals.fibrasDep;

    const innerData = totalSubcategorias > 0 ? [
      { label: 'Reconhecidas', percentage: parseFloat(((totals.reconhecidas / totalSubcategorias) * 100).toFixed(1)), value: totals.reconhecidas, color: '#06b6d4' },
      { label: 'Dep. Passagem', percentage: parseFloat(((totals.depPassagem / totalSubcategorias) * 100).toFixed(1)), value: totals.depPassagem, color: '#3b82f6' },
      { label: 'Dep. Licença', percentage: parseFloat(((totals.depLicenca / totalSubcategorias) * 100).toFixed(1)), value: totals.depLicenca, color: '#f97316' },
      { label: 'Dep. Cutover', percentage: parseFloat(((totals.depCutover / totalSubcategorias) * 100).toFixed(1)), value: totals.depCutover, color: '#9333ea' },
      { label: `Dep. ${selectedOperator}`, percentage: parseFloat(((totals.fibrasDep / totalSubcategorias) * 100).toFixed(1)), value: totals.fibrasDep, color: '#64748b' },
    ] : [];

    return { outer: outerData, inner: innerData };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, distribuicaoReparacoes, selectedOperator, selectedQuarter, selectedYear, selectedProvince]);

  return { pieChartData };
};
