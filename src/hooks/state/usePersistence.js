import { useEffect, useRef, useState } from 'react';
import { LS_KEYS } from '../../services/localStorageService.js';
import { getQuarterFromWeek } from '../../utils/dateUtils.js';
import { lerTudoDoSupabase, salvarTudoNoSupabase, salvarJustificativasNoSupabase, lerJustificativasDoSupabase } from '../../services/supabaseService.js';
import { carregarDistribuicaoDoSupabase, salvarDistribuicaoNoSupabase } from '../../services/supabaseDistribuicaoService.js';
import { ROUTE_TO_PROVINCE as STATIC_ROUTE_TO_PROVINCE } from '../../config/provinceConfig.js';
import { log } from '../../utils/logger';

export const usePersistence = ({
  data,
  justificativas,
  distribuicaoReparacoes,
  selectedYear,
  selectedQuarter,
  rotasTestadas,
  rotasValidadas,
  setData,
  setJustificativas,
  setRotasTestadas,
  setRotasValidadas,
  setDistribuicaoReparacoes,
  setSaveStatus,
  setLastSaveTime,
  routeToProvince = STATIC_ROUTE_TO_PROVINCE,
  user = null,
}) => {
  const saveTimerRef = useRef(null);
  const justificativasTimerRef = useRef(null);
  const distribuicaoTimerRef = useRef(null);
  const lastSavedDistribuicaoRef = useRef(null);
  const [isLoadingDistribuicao, setIsLoadingDistribuicao] = useState(false);
  const skipNextSaveRef = useRef(false);
  // Impede salvamento no Supabase antes do primeiro load completar (evita race condition)
  const isSupabaseLoadedRef = useRef(false);
  // Ref para routeToProvince: evita closure stale no timer de save
  const routeToProvinceRef = useRef(routeToProvince);
  useEffect(() => { routeToProvinceRef.current = routeToProvince; }, [routeToProvince]);

  // useEffect #1: Carregar dados do Supabase ao iniciar e quando mudar o ano
  // Aguarda sessão autenticada antes de consultar (RLS exige auth)
  useEffect(() => {
    if (!user) return; // Sessão ainda não estabelecida — aguardar
    isSupabaseLoadedRef.current = false; // Reset ao mudar de ano

    const carregarDadosDoSupabase = async () => {
      log('🔄 Carregando dados do Supabase para o ano:', selectedYear);

      const resultado = await lerTudoDoSupabase(selectedYear);

      if (resultado.success && resultado.data && Object.keys(resultado.data).length > 0) {
        log('✅ Dados carregados do Supabase!', resultado.data);
        // Merge profundo por semana: Supabase prevalece por rota mas preserva rotas dinâmicas
        // que ainda não existem no Supabase (entradas locais ainda não persistidas)
        setData(prev => {
          const next = { ...prev };
          for (const psm of Object.keys(resultado.data)) {
            const prevPsm = prev[psm] || {};
            const supPsm = resultado.data[psm];
            const mergedPsm = {};
            const allWeeks = new Set([...Object.keys(prevPsm), ...Object.keys(supPsm)]);
            for (const week of allWeeks) {
              // rotas locais primeiro (preserva rotas ainda não guardadas no Supabase);
              // rotas do Supabase sobrescrevem (source of truth para rotas já persistidas)
              mergedPsm[week] = { ...(prevPsm[week] || {}), ...(supPsm[week] || {}) };
            }
            next[psm] = mergedPsm;
          }
          return next;
        });

        if (resultado.rotasTestadas && Object.keys(resultado.rotasTestadas).length > 0) {
          setRotasTestadas(resultado.rotasTestadas);
        }
        if (resultado.rotasValidadas && Object.keys(resultado.rotasValidadas).length > 0) {
          setRotasValidadas(resultado.rotasValidadas);
        }
      } else {
        log('⚠️ Sem dados no Supabase para o ano', selectedYear);
        // Não apagar dados: manter o que está no localStorage / createInitialData
      }

      // Marcar que o load completou — só agora permite saves no Supabase
      isSupabaseLoadedRef.current = true;

      const resultadoJust = await lerJustificativasDoSupabase(selectedYear);
      if (resultadoJust.success && resultadoJust.data && Object.keys(resultadoJust.data).length > 0) {
        setJustificativas(resultadoJust.data);
      } else {
        setJustificativas({});
      }
    };

    carregarDadosDoSupabase();
  }, [selectedYear, user, setData, setJustificativas, setRotasTestadas, setRotasValidadas]);

  useEffect(() => {
    if (Object.keys(data).length === 0) return;

    setSaveStatus('saving');

    try {
      window.localStorage.setItem(LS_KEYS.DATA, JSON.stringify(data));
    } catch (error) {
      console.error('[DATA] Erro ao salvar localmente:', error);
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      if (!isSupabaseLoadedRef.current) {
        log('⏭️ [DATA] Supabase ainda não carregou — salvamento adiado para evitar sobrescrever dados');
        return;
      }
      if (!user?.id) {
        log('⏭️ [DATA] Utilizador não autenticado — salvamento cancelado');
        return;
      }
      const psmsParaSalvar = Object.keys(data);
      log('💾 [DATA] Salvando no Supabase:', psmsParaSalvar, 'ano:', selectedYear);
      const resultado = await salvarTudoNoSupabase(
        data,
        selectedQuarter,
        selectedYear,
        routeToProvinceRef.current,
        rotasTestadas,
        rotasValidadas,
        user.id
      );

      if (resultado.success) {
        log('✅ [DATA] Dados salvos no Supabase!', resultado);
      } else {
        console.error('❌ [DATA] Erro ao salvar no Supabase:', resultado.error);
        console.error('❌ [DATA] PSMs que tentaram ser salvos:', psmsParaSalvar);
      }
    }, 5000);

    const statusTimer = window.setTimeout(() => {
      setSaveStatus('');
    }, 2000);

    setSaveStatus('saved');
    setLastSaveTime(new Date());

    return () => {
      clearTimeout(statusTimer);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [data, selectedQuarter, rotasTestadas, rotasValidadas, selectedYear, user, setLastSaveTime, setSaveStatus]);

  useEffect(() => {
    log('🔄 [JUSTIFICATIVAS] useEffect executado', {
      quantidade: Object.keys(justificativas).length,
      ano: selectedYear
    });

    try {
      window.localStorage.setItem(LS_KEYS.JUSTIFICATIVAS, JSON.stringify(justificativas));
    } catch (error) {
      console.error('[JUSTIFICATIVAS] Erro ao salvar localmente:', error);
    }

    if (justificativasTimerRef.current) {
      clearTimeout(justificativasTimerRef.current);
    }

    justificativasTimerRef.current = window.setTimeout(async () => {
      log('💾 [JUSTIFICATIVAS] Salvando no Supabase para o ano:', selectedYear);
      try {
        const resultado = await salvarJustificativasNoSupabase(justificativas, selectedYear);
        if (resultado.success) {
          log('✅ [JUSTIFICATIVAS] Salvas no Supabase!', resultado);
        } else {
          console.error('❌ [JUSTIFICATIVAS] Erro ao salvar:', resultado.error);
        }
      } catch (error) {
        console.error('❌ [JUSTIFICATIVAS] Exceção ao salvar:', error);
      }
    }, 3000);

    return () => {
      if (justificativasTimerRef.current) {
        clearTimeout(justificativasTimerRef.current);
      }
    };
  }, [justificativas, selectedYear]);

  useEffect(() => {
    if (!user) return; // Aguardar sessão autenticada antes de carregar distribuição

    const carregarDistribuicaoInicial = async () => {
      setIsLoadingDistribuicao(true);
      log(`📥 [DISTRIBUIÇÃO] Carregando TODOS os quarters de ${selectedYear}...`);

      const dadosCompletos = {};

      for (const quarter of ['Q1', 'Q2', 'Q3']) {
        const distrib = await carregarDistribuicaoDoSupabase(quarter, selectedYear);

        if (Object.keys(distrib).length > 0) {
          log(`✅ [DISTRIBUIÇÃO] ${selectedYear}/${quarter} carregado (${Object.keys(distrib).length} PSMs)`);
          Object.keys(distrib).forEach((psm) => {
            if (!dadosCompletos[psm]) dadosCompletos[psm] = {};
            Object.assign(dadosCompletos[psm], distrib[psm]);
          });
        } else {
          log(`ℹ️ [DISTRIBUIÇÃO] ${selectedYear}/${quarter} sem dados`);
        }
      }

      if (Object.keys(dadosCompletos).length > 0) {
        setDistribuicaoReparacoes((prev) => {
          const updated = JSON.parse(JSON.stringify(prev));
          updated[selectedYear] = dadosCompletos;
          log(`✅ [DISTRIBUIÇÃO] Todos os dados de ${selectedYear} carregados e mesclados`);
          return updated;
        });

        lastSavedDistribuicaoRef.current = JSON.stringify({
          ...dadosCompletos ? { [selectedYear]: dadosCompletos } : {},
          ...distribuicaoReparacoes
        });
      } else {
        log(`ℹ️ [DISTRIBUIÇÃO] Nenhum dado encontrado para ${selectedYear}`);
        setDistribuicaoReparacoes((prev) => {
          const updated = JSON.parse(JSON.stringify(prev));
          delete updated[selectedYear];
          return updated;
        });
        lastSavedDistribuicaoRef.current = JSON.stringify(distribuicaoReparacoes);
      }

      setIsLoadingDistribuicao(false);
    };

    carregarDistribuicaoInicial();
  }, [selectedYear, user, setDistribuicaoReparacoes]);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      log('⏭️ [DISTRIBUIÇÃO] Pulando salvamento (após delete)');
      skipNextSaveRef.current = false;
      return;
    }

    if (isLoadingDistribuicao) {
      log('⏭️ [DISTRIBUIÇÃO] Carregando dados, pulando salvamento');
      return;
    }

    if (Object.keys(distribuicaoReparacoes).length === 0) {
      log('⏭️ [DISTRIBUIÇÃO] Sem dados para salvar');
      return;
    }

    const dadosAtuais = JSON.stringify(distribuicaoReparacoes);
    if (dadosAtuais === lastSavedDistribuicaoRef.current) {
      log('⏭️ [DISTRIBUIÇÃO] Dados não mudaram, pulando salvamento');
      return;
    }

    if (distribuicaoTimerRef.current) {
      clearTimeout(distribuicaoTimerRef.current);
      log('⏱️ [DISTRIBUIÇÃO] Timer anterior cancelado');
    }

    distribuicaoTimerRef.current = window.setTimeout(async () => {
      log('💾 [DISTRIBUIÇÃO] Salvando após debounce (1s)...');
      lastSavedDistribuicaoRef.current = dadosAtuais;

      try {
        window.localStorage.setItem(LS_KEYS.DISTRIBUICAO, dadosAtuais);
        log('💾 [DISTRIBUIÇÃO] Salvo no localStorage v3 (com ano)');
      } catch (error) {
        console.error('❌ [DISTRIBUIÇÃO] Erro ao salvar no localStorage:', error);
      }

      try {
        const dadosDoAno = distribuicaoReparacoes[selectedYear] || {};
        const dadosPorQuarter = { Q1: {}, Q2: {}, Q3: {} };

        Object.keys(dadosDoAno).forEach((psm) => {
          Object.keys(dadosDoAno[psm] || {}).forEach((week) => {
            const quarterDaSemana = getQuarterFromWeek(week);
            if (!dadosPorQuarter[quarterDaSemana][psm]) {
              dadosPorQuarter[quarterDaSemana][psm] = {};
            }
            dadosPorQuarter[quarterDaSemana][psm][week] = dadosDoAno[psm][week];
          });
        });

        for (const quarter of ['Q1', 'Q2', 'Q3']) {
          const dadosDoQuarter = dadosPorQuarter[quarter];
          if (Object.keys(dadosDoQuarter).length > 0) {
            log(`💾 [DISTRIBUIÇÃO] Salvando ${selectedYear}/${quarter}...`);
            const resultado = await salvarDistribuicaoNoSupabase(
              dadosDoQuarter,
              quarter,
              selectedYear
            );
            if (resultado.success) {
              log(`✅ [DISTRIBUIÇÃO] ${selectedYear}/${quarter} salvo com sucesso`);
            } else {
              console.error(`❌ [DISTRIBUIÇÃO] Erro ao salvar ${selectedYear}/${quarter}:`, resultado.error);
            }
          }
        }
      } catch (error) {
        console.error('❌ [DISTRIBUIÇÃO] Erro ao salvar no Supabase:', error);
      }
    }, 1000);

    return () => {
      if (distribuicaoTimerRef.current) {
        clearTimeout(distribuicaoTimerRef.current);
      }
    };
  }, [distribuicaoReparacoes, selectedQuarter, selectedYear, isLoadingDistribuicao]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_KEYS.TESTED_ROUTES, JSON.stringify(rotasTestadas));
      window.localStorage.setItem(LS_KEYS.VALIDATED_ROUTES, JSON.stringify(rotasValidadas));
    } catch (error) {
      console.error('[VALIDAÇÕES] Erro ao salvar no localStorage:', error);
    }
  }, [rotasTestadas, rotasValidadas]);

  useEffect(() => {
    return () => {
      if (distribuicaoTimerRef.current) {
        clearTimeout(distribuicaoTimerRef.current);
      }
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (justificativasTimerRef.current) {
        clearTimeout(justificativasTimerRef.current);
      }
    };
  }, []);

  return { isLoadingDistribuicao };
};
