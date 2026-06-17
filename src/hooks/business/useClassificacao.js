import { useMemo } from 'react';
import { ROUTES_BY_PSM } from '../../config/routeConfig.js';

export const useClassificacao = ({
  data,
  selectedOperator,
  selectedWeek,
  selectedQuarter,
}) => {
  const classificacaoRotas = useMemo(() => {
    const classificacao = {
      degradadas: [],
      comGanho: [],
      estaveis: [],
    };

    (ROUTES_BY_PSM[selectedOperator] || []).forEach(rota => {
      let mostRecentWeek = null;
      const weekNum = parseInt(selectedWeek.substring(1));

      for (let i = weekNum; i >= 1; i--) {
        const checkWeek = 'W' + i;
        const weekData = data[selectedOperator]?.[checkWeek]?.[rota] || {};
        const hasData = (weekData['Transporte'] || 0) > 0 || (weekData['Indisponíveis'] || 0) > 0;
        if (hasData) {
          mostRecentWeek = checkWeek;
          break;
        }
      }

      if (!mostRecentWeek) return;

      const rotaData = data[selectedOperator]?.[mostRecentWeek]?.[rota] || {};
      const transporte = parseInt(rotaData['Transporte']) || 0;
      const indisponiveis = parseInt(rotaData['Indisponíveis']) || 0;

      let totalReparadasAcumulado = 0;
      for (let i = 1; i <= weekNum; i++) {
        const checkWeek = 'W' + i;
        const weekData = data[selectedOperator]?.[checkWeek]?.[rota] || {};
        totalReparadasAcumulado += parseInt(weekData['Total Reparadas']) || 0;
      }

      const currentWeekData = data[selectedOperator]?.[selectedWeek]?.[rota] || {};
      const isRepairedThisWeek = (parseInt(currentWeekData['Total Reparadas']) || 0) > 0;

      if (transporte === 0 && indisponiveis === 0) return;

      const routeInfo = {
        rota,
        transporte,
        indisponiveis,
        totalReparadas: totalReparadasAcumulado,
        isRepaired: isRepairedThisWeek,
      };

      if (indisponiveis > transporte) {
        classificacao.degradadas.push(routeInfo);
      } else if (transporte > indisponiveis) {
        classificacao.comGanho.push(routeInfo);
      } else if (transporte === indisponiveis) {
        classificacao.estaveis.push(routeInfo);
      }
    });

    return classificacao;
  }, [data, selectedOperator, selectedWeek, selectedQuarter]);

  return { classificacaoRotas };
};
