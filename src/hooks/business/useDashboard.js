import { useMemo } from 'react';
import { ROUTES_BY_PSM as STATIC_ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { QUARTER_CONFIG } from '../../config/quarterConfig.js';
import { ALL_WEEKS } from '../../config/constants.js';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE, OPERATOR_TO_PROVINCES as STATIC_OPERATOR_TO_PROVINCES } from '../../config/provinceConfig.js';
import { getValorReduzido as getValorReduzidoUtil } from '../../utils/valueUtils.js';

export const useDashboard = ({
  data,
  distribuicaoReparacoes,
  justificativas,
  selectedOperator,
  selectedQuarter,
  selectedYear,
  selectedWeek,
  selectedProvince,
  routesByPsm = STATIC_ROUTES_BY_PSM,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
  operatorToProvinces = STATIC_OPERATOR_TO_PROVINCES,
}) => {
  const getValorReduzido = (psm, week, route, tipo) =>
    getValorReduzidoUtil(data, distribuicaoReparacoes, selectedQuarter, selectedYear, QUARTER_CONFIG, psm, week, route, tipo);

  const dashboardData = useMemo(() => {
    const quarterWeeks = ALL_WEEKS.slice(
      QUARTER_CONFIG[selectedQuarter].start - 1,
      QUARTER_CONFIG[selectedQuarter].end
    );

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    let stats = {
      transporteSum: 0,
      indisponiveisSum: 0,
      totalReparadasSum: 0,
      reconhecidasSum: 0,
      depPassagensSum: 0,
      depLicencaSum: 0,
      depCutoverSum: 0,
      fibrasDependentesLast: 0,
    };

    routesToProcess.forEach(route => {
      let ultimoTransporte = 0;
      quarterWeeks.forEach(week => {
        const routeData = data[selectedOperator]?.[week]?.[route];
        if (routeData) {
          const transporte = parseInt(routeData['Transporte']) || 0;
          if (transporte > 0) ultimoTransporte = transporte;
        }
      });
      if (ultimoTransporte > 0) stats.transporteSum += ultimoTransporte;
    });

    const routeLastValues = {};
    routesToProcess.forEach(route => {
      routeLastValues[route] = {
        indisponiveis: 0, totalReparadas: 0, reconhecidas: 0,
        depPassagem: 0, depLicenca: 0, depCutover: 0, fibrasDep: 0,
      };
      quarterWeeks.forEach(week => {
        const routeData = data[selectedOperator]?.[week]?.[route];
        if (routeData) {
          const indispVal = parseInt(routeData['Indisponíveis'], 10) || 0;
          const reconhVal = parseInt(routeData['Reconhecidas'], 10) || 0;
          const depPassVal = parseInt(routeData['Dep. de Passagem de Cabo'], 10) || 0;
          const depLicVal = parseInt(routeData['Dep. de Licença'], 10) || 0;
          const depCutVal = parseInt(routeData['Dep. de Cutover'], 10) || 0;
          const fibrasVal = parseInt(routeData[`Fibras dependentes da ${selectedOperator}`], 10) || 0;
          if (indispVal > 0) routeLastValues[route].indisponiveis = indispVal;
          if (reconhVal > 0) routeLastValues[route].reconhecidas = reconhVal;
          if (depPassVal > 0) routeLastValues[route].depPassagem = depPassVal;
          if (depLicVal > 0) routeLastValues[route].depLicenca = depLicVal;
          if (depCutVal > 0) routeLastValues[route].depCutover = depCutVal;
          if (fibrasVal > 0) routeLastValues[route].fibrasDep = fibrasVal;
          routeLastValues[route].totalReparadas += parseInt(routeData['Total Reparadas'], 10) || 0;
        }
      });
    });

    const statsOriginais = {
      transporteSum: stats.transporteSum,
      totalReparadasSum: stats.totalReparadasSum,
      indisponiveisSum: 0, reconhecidasSum: 0, depPassagensSum: 0,
      depLicencaSum: 0, depCutoverSum: 0, fibrasDependentesLast: 0,
    };

    Object.values(routeLastValues).forEach(values => {
      const indisponiveisOriginais = values.reconhecidas + values.depPassagem +
                                      values.depLicenca + values.depCutover + values.fibrasDep;
      statsOriginais.indisponiveisSum += indisponiveisOriginais;
      statsOriginais.reconhecidasSum += values.reconhecidas;
      statsOriginais.depPassagensSum += values.depPassagem;
      statsOriginais.depLicencaSum += values.depLicenca;
      statsOriginais.depCutoverSum += values.depCutover;
      statsOriginais.fibrasDependentesLast += values.fibrasDep;
    });

    const selectedWeekNum = parseInt(selectedWeek.substring(1));
    const weeksAteSelecao = quarterWeeks.filter(week => {
      const weekNum = parseInt(week.substring(1));
      return weekNum <= selectedWeekNum;
    });

    const routeValuesAteSelecao = {};
    routesToProcess.forEach(route => {
      routeValuesAteSelecao[route] = {
        totalReparadas: 0, reconhecidas: 0, depPassagem: 0,
        depLicenca: 0, depCutover: 0, fibrasDep: 0,
      };
      weeksAteSelecao.forEach(week => {
        const routeData = data[selectedOperator]?.[week]?.[route];
        if (routeData) {
          const reconhVal = parseInt(routeData['Reconhecidas']) || 0;
          const depPassVal = parseInt(routeData['Dep. de Passagem de Cabo']) || 0;
          const depLicVal = parseInt(routeData['Dep. de Licença']) || 0;
          const depCutVal = parseInt(routeData['Dep. de Cutover']) || 0;
          const fibrasVal = parseInt(routeData[`Fibras dependentes da ${selectedOperator}`]) || 0;
          if (reconhVal > 0) routeValuesAteSelecao[route].reconhecidas = reconhVal;
          if (depPassVal > 0) routeValuesAteSelecao[route].depPassagem = depPassVal;
          if (depLicVal > 0) routeValuesAteSelecao[route].depLicenca = depLicVal;
          if (depCutVal > 0) routeValuesAteSelecao[route].depCutover = depCutVal;
          if (fibrasVal > 0) routeValuesAteSelecao[route].fibrasDep = fibrasVal;
          routeValuesAteSelecao[route].totalReparadas += parseInt(routeData['Total Reparadas']) || 0;
        }
      });
    });

    routesToProcess.forEach(route => {
      let ultimaSemana = null;
      for (let i = weeksAteSelecao.length - 1; i >= 0; i--) {
        const week = weeksAteSelecao[i];
        const routeData = data[selectedOperator]?.[week]?.[route];
        if (routeData) { ultimaSemana = week; break; }
      }
      if (ultimaSemana) {
        stats.reconhecidasSum += getValorReduzido(selectedOperator, ultimaSemana, route, 'Reconhecidas');
        stats.depPassagensSum += getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Passagem de Cabo');
        stats.depLicencaSum += getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Licença');
        stats.depCutoverSum += getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Cutover');
        stats.fibrasDependentesLast += getValorReduzido(selectedOperator, ultimaSemana, route, `Fibras dependentes da ${selectedOperator}`);
        stats.totalReparadasSum += routeValuesAteSelecao[route].totalReparadas;
      }
    });

    stats.indisponiveisSum = stats.reconhecidasSum + stats.depPassagensSum +
                             stats.depLicencaSum + stats.depCutoverSum +
                             stats.fibrasDependentesLast;

    const provinciasParaMedia = selectedProvince !== 'Todas'
      ? [selectedProvince]
      : (operatorToProvinces[selectedOperator] || []);

    let somatorioEfetGlobal = 0;
    let somatorioEfetPSM = 0;
    let provinciasComDadosGlobal = 0;
    let provinciasComDadosPSM = 0;

    provinciasParaMedia.forEach(prov => {
      const rotasProv = routesToProcess.filter(route => routeToProvince[route] === prov);
      if (rotasProv.length === 0) return;

      let indisponiveisProv = 0;
      let reparadasProv = 0;
      let fibrasPSMOriginalProv = 0;
      let fibrasPSMReparadasProv = 0;

      rotasProv.forEach(route => {
        let ultimaSemana = null;
        for (let i = weeksAteSelecao.length - 1; i >= 0; i--) {
          const week = weeksAteSelecao[i];
          const routeData = data[selectedOperator]?.[week]?.[route];
          if (routeData) { ultimaSemana = week; break; }
        }
        if (ultimaSemana) {
          const reconhReduz = getValorReduzido(selectedOperator, ultimaSemana, route, 'Reconhecidas');
          const depPassReduz = getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Passagem de Cabo');
          const depLicReduz = getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Licença');
          const depCutReduz = getValorReduzido(selectedOperator, ultimaSemana, route, 'Dep. de Cutover');
          const fibrasReduz = getValorReduzido(selectedOperator, ultimaSemana, route, `Fibras dependentes da ${selectedOperator}`);
          indisponiveisProv += reconhReduz + depPassReduz + depLicReduz + depCutReduz + fibrasReduz;
          reparadasProv += routeValuesAteSelecao[route].totalReparadas;

          for (let i = quarterWeeks.length - 1; i >= 0; i--) {
            const week = quarterWeeks[i];
            const rd = data[selectedOperator]?.[week]?.[route];
            if (rd) {
              const fibVal = parseInt(rd[`Fibras dependentes da ${selectedOperator}`]) || 0;
              if (fibVal > 0) { fibrasPSMOriginalProv += fibVal; break; }
            }
          }

          quarterWeeks.forEach(week => {
            const wNum = parseInt(week.substring(1));
            const selNum = parseInt(selectedWeek.substring(1));
            if (wNum <= selNum) {
              const dist = distribuicaoReparacoes[selectedOperator]?.[week]?.[route] || {};
              fibrasPSMReparadasProv += parseInt(dist[`Fibras dependentes da ${selectedOperator}`]) || 0;
            }
          });
        }
      });

      const efetGlobalProv = indisponiveisProv > 0 ? (reparadasProv / indisponiveisProv) * 100 : 0;
      const efetPSMProv = fibrasPSMOriginalProv > 0 ? (fibrasPSMReparadasProv / fibrasPSMOriginalProv) * 100 : 0;

      if (indisponiveisProv > 0) { somatorioEfetGlobal += efetGlobalProv; provinciasComDadosGlobal++; }
      if (fibrasPSMOriginalProv > 0) { somatorioEfetPSM += efetPSMProv; provinciasComDadosPSM++; }
    });

    const efetividadeGlobalMedia = provinciasComDadosGlobal > 0 ? somatorioEfetGlobal / provinciasComDadosGlobal : 0;
    const efetividadePSMMedia = provinciasComDadosPSM > 0 ? somatorioEfetPSM / provinciasComDadosPSM : 0;

    const transporteLabel = (() => {
      if (selectedQuarter === 'Q1') return `Transporte Q3 (${parseInt(selectedYear) - 1})`;
      if (selectedQuarter === 'Q2') return 'Transporte Q1';
      if (selectedQuarter === 'Q3') return 'Transporte Q2';
      return 'Transporte Q1';
    })();

    const headerCardsData = {
      transporteQ2: { label: transporteLabel, value: statsOriginais.transporteSum, color: 'bg-slate-700', textColor: 'text-white' },
      indisponiveis: { label: 'Indisponíveis', value: statsOriginais.indisponiveisSum, color: 'bg-red-500', textColor: 'text-white' },
      totalReparadas: { label: 'Total Reparadas', value: stats.totalReparadasSum, color: 'bg-green-500', textColor: 'text-white' },
      reconhecidas: { label: 'Reconhecidas', value: statsOriginais.reconhecidasSum, color: 'bg-cyan-500', textColor: 'text-white' },
      depPassagens: { label: 'Dep. Passagens', value: statsOriginais.depPassagensSum, color: 'bg-blue-500', textColor: 'text-white' },
      depLicenca: { label: 'Dep. Licença', value: statsOriginais.depLicencaSum, color: 'bg-orange-500', textColor: 'text-white' },
      depCutover: { label: 'Dep. Cutover', value: statsOriginais.depCutoverSum, color: 'bg-purple-600', textColor: 'text-white' },
      fibrasDep: { label: `Fibras Dep. ${selectedOperator}`, value: statsOriginais.fibrasDependentesLast, color: 'bg-slate-600', textColor: 'text-white' },
    };

    const executiveDashboard = {
      transporteQ2: { label: transporteLabel, value: stats.transporteSum, color: 'bg-slate-700', textColor: 'text-white' },
      indisponiveis: { label: 'Indisponíveis', value: stats.indisponiveisSum, color: 'bg-red-500', textColor: 'text-white' },
      totalReparadas: { label: 'Total Reparadas', value: stats.totalReparadasSum, color: 'bg-green-500', textColor: 'text-white' },
      reconhecidas: { label: 'Reconhecidas', value: stats.reconhecidasSum, color: 'bg-cyan-500', textColor: 'text-white' },
      depPassagens: { label: 'Dep. Passagens', value: stats.depPassagensSum, color: 'bg-blue-500', textColor: 'text-white' },
      depLicenca: { label: 'Dep. Licença', value: stats.depLicencaSum, color: 'bg-orange-500', textColor: 'text-white' },
      depCutover: { label: 'Dep. Cutover', value: stats.depCutoverSum, color: 'bg-purple-600', textColor: 'text-white' },
      fibrasDep: { label: `Fibras Dep. ${selectedOperator}`, value: stats.fibrasDependentesLast, color: 'bg-slate-600', textColor: 'text-white' },
    };

    return { executiveDashboard, headerCardsData, efetividadeGlobalMedia, efetividadePSMMedia };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, distribuicaoReparacoes, selectedOperator, selectedQuarter, selectedYear, selectedWeek, selectedProvince]);

  const topRotasCriticas = useMemo(() => {
    const quarterWeeks = ALL_WEEKS.slice(
      QUARTER_CONFIG[selectedQuarter].start - 1,
      QUARTER_CONFIG[selectedQuarter].end
    );

    const routesToProcess = selectedProvince !== 'Todas'
      ? (routesByPsm[selectedOperator] || []).filter(route => routeToProvince[route] === selectedProvince)
      : (routesByPsm[selectedOperator] || []);

    const routeStats = {};
    routesToProcess.forEach(route => {
      routeStats[route] = { rota: route, totalIndisponiveis: 0, maxIndisponiveis: 0, totalReparadas: 0, semanas: [] };
    });

    quarterWeeks.forEach(week => {
      if (data[selectedOperator]?.[week]) {
        routesToProcess.forEach(route => {
          const routeData = data[selectedOperator][week][route];
          if (routeData) {
            const indisponiveis = parseInt(routeData['Indisponíveis']) || 0;
            const reparadas = parseInt(routeData['Total Reparadas']) || 0;
            if (indisponiveis > 0) {
              routeStats[route].totalIndisponiveis += indisponiveis;
              routeStats[route].maxIndisponiveis = Math.max(routeStats[route].maxIndisponiveis, indisponiveis);
              routeStats[route].semanas.push({ week, value: indisponiveis });
            }
            if (reparadas > 0) routeStats[route].totalReparadas += reparadas;
          }
        });
      }
    });

    const sortedRoutes = Object.values(routeStats)
      .filter(r => r.maxIndisponiveis > 0)
      .sort((a, b) => b.maxIndisponiveis - a.maxIndisponiveis);

    const top5 = sortedRoutes.slice(0, 5).map((route, index) => ({
      rank: index + 1,
      rota: route.rota,
      value: route.maxIndisponiveis,
      total: route.totalIndisponiveis,
      reparadas: route.totalReparadas,
      semanas: route.semanas,
    }));

    if (top5.length === 0) {
      return [1, 2, 3, 4, 5].map(rank => ({ rank, rota: 'Sem dados', value: 0, total: 0, reparadas: 0, semanas: [] }));
    }

    while (top5.length < 5) {
      top5.push({ rank: top5.length + 1, rota: '-', value: 0, total: 0, reparadas: 0, semanas: [] });
    }

    return top5;
  }, [data, selectedOperator, selectedQuarter, selectedProvince]);

  const acompanhamentoData = useMemo(() => {
    return Object.entries(justificativas)
      .filter(([, just]) => just.psm === selectedOperator && just.quarter === selectedQuarter)
      .map(([, just]) => {
        const deltaValue = just.delta || 0;
        const deltaStr = deltaValue > 0 ? `+${deltaValue}` : deltaValue === 0 ? '0' : `${deltaValue}`;
        return {
          seccao: just.seccao,
          regiao: just.regiao || '',
          transporteQ2: just.transporte || 0,
          indisponiveis: just.indisponiveis || 0,
          deltaIndisponibilidade: deltaStr,
          justificativa: just.justificativa || '',
          origem: 'importado',
        };
      });
  }, [justificativas, selectedOperator, selectedQuarter]);

  const executiveDashboard = dashboardData?.executiveDashboard;
  const headerCardsData = dashboardData?.headerCardsData;
  const efetividadeGlobalMedia = dashboardData?.efetividadeGlobalMedia ?? 0;
  const efetividadePSMMedia = dashboardData?.efetividadePSMMedia ?? 0;

  return {
    executiveDashboard,
    headerCardsData,
    topRotasCriticas,
    acompanhamentoData,
    efetividadeGlobalMedia,
    efetividadePSMMedia,
  };
};
