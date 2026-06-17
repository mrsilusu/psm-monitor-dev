import { useEffect } from 'react';
import { ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { QUARTER_CONFIG } from '../../config/quarterConfig.js';
import { ALL_WEEKS } from '../../config/constants.js';

export const useTestes = ({
  data,
  rotasTestadas,
  rotasValidadas,
  selectedOperator,
  selectedQuarter,
  setTestesData,
  setTodosTestesData,
  isRotaTestadaGlobalNoQuarter,
  isRotaValidadaGlobalNoQuarter,
  getSemanasValidadasNoQuarter,
}) => {
  useEffect(() => {
    if (!selectedOperator || selectedOperator === 'Global') return;

    const rotas = ROUTES_BY_PSM[selectedOperator] || [];
    const totalRotas = rotas.length;

    let testadas = 0;
    let validadas = 0;
    let pendentes = 0;
    let naoTestadas = 0;
    let semIndisponibilidade = 0;
    let estaveis = 0;
    let comGanho = 0;
    let degradadas = 0;
    const concluidas = 0;
    const comIndisponibilidades = 0;

    rotas.forEach(rota => {
      const foiTestada = isRotaTestadaGlobalNoQuarter(selectedOperator, rota, selectedQuarter);
      const foiValidada = isRotaValidadaGlobalNoQuarter(selectedOperator, rota, selectedQuarter);

      if (!foiTestada) {
        naoTestadas++;
      } else {
        testadas++;
        if (foiValidada) {
          validadas++;
        } else {
          pendentes++;
        }
      }

      if (foiValidada) {
        const semanasValidadas = getSemanasValidadasNoQuarter(selectedOperator, rota, selectedQuarter);

        semanasValidadas.forEach((week) => {
          const weekData = data[selectedOperator]?.[week]?.[rota];
          if (weekData) {
            const transp = parseInt(weekData['Transporte']) || 0;
            const indisp = parseInt(weekData['Indisponíveis']) || 0;
            if (indisp === 0) {
              semIndisponibilidade++;
            } else if (indisp < transp && transp > 0) {
              comGanho++;
            } else if (transp === indisp && indisp > 0) {
              estaveis++;
            } else if (indisp > transp) {
              degradadas++;
            }
          } else {
            semIndisponibilidade++;
          }
        });
      }
    });

    setTestesData({
      cadastradas: totalRotas,
      testadas,
      validadas,
      pendentes,
      naoTestadas,
      semIndisponibilidade: validadas,
      semIndisponibilidadeTecnica: semIndisponibilidade,
      estaveis,
      concluidas,
      comGanho,
      degradadas,
      comIndisponibilidades,
    });
  }, [selectedOperator, selectedQuarter, data, rotasTestadas, rotasValidadas,
    isRotaTestadaGlobalNoQuarter, isRotaValidadaGlobalNoQuarter, getSemanasValidadasNoQuarter,
    setTestesData]);

  useEffect(() => {
    const psms = ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'];
    const novosDados = {};

    psms.forEach(psm => {
      const rotas = ROUTES_BY_PSM[psm] || [];
      const totalRotas = rotas.length;

      const quarterWeeks = ALL_WEEKS.slice(
        QUARTER_CONFIG[selectedQuarter].start - 1,
        QUARTER_CONFIG[selectedQuarter].end
      );

      let testadas = 0;
      let validadas = 0;
      let pendentes = 0;
      let naoTestadas = 0;
      let semIndisponibilidade = 0;
      let estaveis = 0;
      let comGanho = 0;
      let degradadas = 0;
      const concluidas = 0;
      const comIndisponibilidades = 0;

      rotas.forEach(rota => {
        const foiTestada = isRotaTestadaGlobalNoQuarter(psm, rota, selectedQuarter);
        const foiValidada = isRotaValidadaGlobalNoQuarter(psm, rota, selectedQuarter);

        if (!foiTestada) {
          naoTestadas++;
        } else {
          testadas++;
          if (foiValidada) {
            validadas++;
          } else {
            pendentes++;
          }
        }

        if (foiValidada) {
          quarterWeeks.forEach((week) => {
            const weekData = data[psm]?.[week]?.[rota];
            if (weekData) {
              const transp = parseInt(weekData['Transporte']) || 0;
              const indisp = parseInt(weekData['Indisponíveis']) || 0;
              if (indisp === 0) {
                semIndisponibilidade++;
              } else if (indisp < transp && transp > 0) {
                comGanho++;
              } else if (transp === indisp && indisp > 0) {
                estaveis++;
              } else if (indisp > transp) {
                degradadas++;
              }
            } else {
              semIndisponibilidade++;
            }
          });
        }
      });

      novosDados[psm] = {
        cadastradas: totalRotas,
        testadas,
        validadas,
        pendentes,
        naoTestadas,
        semIndisponibilidade: validadas,
        semIndisponibilidadeTecnica: semIndisponibilidade,
        estaveis,
        comGanho,
        degradadas,
        concluidas,
        comIndisponibilidades,
        taxaTestes: totalRotas > 0 ? (testadas / totalRotas) * 100 : 0,
        taxaValidacao: testadas > 0 ? (validadas / testadas) * 100 : 0,
        taxaConclusao: testadas > 0 ? (concluidas / testadas) * 100 : 0,
        taxaMelhoria: testadas > 0 ? (comGanho / testadas) * 100 : 0,
        indiceExcelencia: testadas > 0 ? (
          ((validadas / testadas) * 0.3) +
          ((concluidas / testadas) * 0.25) +
          ((comGanho / testadas) * 0.25) +
          ((estaveis / testadas) * 0.2)
        ) * 100 : 0,
      };
    });

    setTodosTestesData(novosDados);
  }, [selectedQuarter, data, rotasTestadas, rotasValidadas,
    isRotaTestadaGlobalNoQuarter, isRotaValidadaGlobalNoQuarter, setTodosTestesData]);
};
