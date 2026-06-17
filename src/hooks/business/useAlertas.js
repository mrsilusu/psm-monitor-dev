import { useMemo } from 'react';
import { ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { QUARTER_CONFIG } from '../../config/quarterConfig.js';
import { ALL_WEEKS } from '../../config/constants.js';
import { ROUTE_TO_PROVINCE } from '../../config/provinceConfig.js';

export const useAlertas = ({
  data,
  selectedOperator,
  selectedQuarter,
  selectedWeek,
  selectedProvince,
  alertasLidos,
}) => {
  const alertas = useMemo(() => {
    const alertasDetectados = [];

    const routesToCheck = selectedProvince !== 'Todas'
      ? (ROUTES_BY_PSM[selectedOperator] || []).filter(route => ROUTE_TO_PROVINCE[route] === selectedProvince)
      : (ROUTES_BY_PSM[selectedOperator] || []);

    const selectedWeekNum = parseInt(selectedWeek.substring(1));

    routesToCheck.forEach(route => {
      let totalReparadasAcumulado = 0;

      for (let i = QUARTER_CONFIG[selectedQuarter].start; i <= selectedWeekNum; i++) {
        const w = `W${i}`;
        const wData = data[selectedOperator]?.[w]?.[route];
        if (wData && wData['Total Reparadas']) {
          totalReparadasAcumulado += parseInt(wData['Total Reparadas']) || 0;
        }
      }

      if (totalReparadasAcumulado === 0) return;

      let maiorIndisponiveis = null;
      let temIndisponiveisRegistrado = false;

      for (let i = QUARTER_CONFIG[selectedQuarter].start; i <= selectedWeekNum; i++) {
        const w = `W${i}`;
        const wData = data[selectedOperator]?.[w]?.[route];
        if (wData && wData['Indisponíveis'] !== undefined && wData['Indisponíveis'] !== null && wData['Indisponíveis'] !== '') {
          temIndisponiveisRegistrado = true;
          const indispAtual = parseInt(wData['Indisponíveis']) || 0;
          if (maiorIndisponiveis === null || indispAtual > maiorIndisponiveis) {
            maiorIndisponiveis = indispAtual;
          }
        }
      }

      if (!temIndisponiveisRegistrado) return;

      let deveAlertar = false;
      let motivoAlerta = '';

      if (totalReparadasAcumulado > maiorIndisponiveis) {
        deveAlertar = true;
        motivoAlerta = `Acumulado(${totalReparadasAcumulado}) > Maior Indisponíveis(${maiorIndisponiveis})`;
      }

      if (maiorIndisponiveis === 0 && totalReparadasAcumulado > 0) {
        deveAlertar = true;
        motivoAlerta = `Indisponíveis=0 mas Acumulado=${totalReparadasAcumulado}`;
      }

      if (deveAlertar) {
        const alertaId = `alerta-${route}-${selectedQuarter}`;
        if (!alertasLidos.includes(alertaId)) {
          alertasDetectados.push({
            id: alertaId,
            tipo: 'info',
            rota: route,
            provincia: ROUTE_TO_PROVINCE[route],
            reparadasAcumulado: totalReparadasAcumulado,
            indisponiveis: maiorIndisponiveis,
            diferenca: totalReparadasAcumulado - maiorIndisponiveis,
            semanaDeteccao: selectedWeek,
            timestamp: new Date().toISOString(),
            lido: false,
          });
        }
      }
    });

    routesToCheck.forEach(route => {
      const weekData = data[selectedOperator]?.[selectedWeek]?.[route];
      if (!weekData) return;

      const indisponiveis = parseInt(weekData['Indisponíveis']) || 0;
      if (indisponiveis === 0) return;

      const reconhecidas = parseInt(weekData['Reconhecidas']) || 0;
      const depPassagem = parseInt(weekData['Dep. de Passagem de Cabo']) || 0;
      const depLicenca = parseInt(weekData['Dep. de Licença']) || 0;
      const depCutover = parseInt(weekData['Dep. de Cutover']) || 0;
      const fibrasDependentes = parseInt(weekData[`Fibras dependentes da ${selectedOperator}`]) || 0;

      const somaJustificativas = reconhecidas + depPassagem + depLicenca + depCutover + fibrasDependentes;

      if (somaJustificativas !== indisponiveis) {
        const alertaId = `indisp-sem-explicacao-${route}-${selectedWeek}-${selectedQuarter}`;
        if (!alertasLidos.includes(alertaId)) {
          const diferenca = indisponiveis - somaJustificativas;
          alertasDetectados.push({
            id: alertaId,
            tipo: 'indisponivel-sem-explicacao',
            rota: route,
            provincia: ROUTE_TO_PROVINCE[route],
            indisponiveis,
            somaJustificativas,
            diferenca,
            detalhes: { reconhecidas, depPassagem, depLicenca, depCutover, fibrasDependentes },
            semanaDeteccao: selectedWeek,
            timestamp: new Date().toISOString(),
            lido: false,
          });
        }
      }
    });

    alertasDetectados.sort((a, b) => {
      const weekNumA = parseInt(a.semanaDeteccao.substring(1));
      const weekNumB = parseInt(b.semanaDeteccao.substring(1));
      return weekNumB - weekNumA;
    });

    return alertasDetectados;
  }, [data, selectedOperator, selectedQuarter, selectedWeek, selectedProvince, alertasLidos]);

  return { alertas };
};
