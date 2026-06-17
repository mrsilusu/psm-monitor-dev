// src/services/localStorageService.js
// Responsabilidade: abstração de localStorage e limpeza de keys antigas
// Máx. 120 linhas

import { CURRENT_DATA_VERSION } from '../config/constants.js';
import { log } from '../utils/logger';

export const LS_KEYS = {
  DATA_VERSION: 'psm_data_version',
  DATA: 'psm_rotas_data_v3',
  DISTRIBUICAO: 'psm_distribuicao_reparacoes_v3',
  JUSTIFICATIVAS: 'psm_justificativas_v1',
  TESTED_ROUTES: 'psm_rotas_testadas_v2',
  VALIDATED_ROUTES: 'psm_rotas_validadas_v2',
  OPERATOR: 'psm_selectedOperator',
  WEEK: 'psm_selectedWeek',
  QUARTER: 'psm_selectedQuarter',
  YEAR: 'psm_selectedYear',
  PROVINCE: 'psm_selectedProvince',
  LEGACY_DISTRIBUICAO: 'psm_distribuicao_reparacoes',
  LEGACY_DISTRIBUICAO_V1: 'psm_distribuicao_reparacoes_v1',
  LEGACY_DATA: 'psm_rotas_data_v2',
  LEGACY_JUSTIFICATIVAS: 'psm_justificativas',
};

const parseJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const lsGet = (key) => {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue === null) return null;
    return parseJSON(rawValue);
  } catch (error) {
    console.error('[localStorage] Erro ao ler chave:', key, error);
    return null;
  }
};

export const lsSet = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('[localStorage] Erro ao gravar chave:', key, error);
  }
};

export const lsGetRaw = (key) => window.localStorage.getItem(key);
export const lsSetRaw = (key, value) => window.localStorage.setItem(key, value);
export const lsRemove = (key) => window.localStorage.removeItem(key);

export const cleanupOldData = () => {
  try {
    const savedVersion = window.localStorage.getItem(LS_KEYS.DATA_VERSION);
    const versionNumber = savedVersion ? parseInt(savedVersion, 10) : 0;

    log(`🔍 [CLEANUP] Versão localStorage: ${versionNumber}, Versão atual: ${CURRENT_DATA_VERSION}`);

    if (versionNumber < CURRENT_DATA_VERSION) {
      log('🧹 [CLEANUP] Limpando localStorage antigo...');

      const keysToRemove = [
        LS_KEYS.LEGACY_DISTRIBUICAO,
        LS_KEYS.LEGACY_DISTRIBUICAO_V1,
        LS_KEYS.LEGACY_DATA,
        LS_KEYS.DATA,
        LS_KEYS.LEGACY_JUSTIFICATIVAS,
        LS_KEYS.JUSTIFICATIVAS,
      ];

      keysToRemove.forEach(key => {
        if (window.localStorage.getItem(key)) {
          log(`🗑️ [CLEANUP] Removendo: ${key}`);
          window.localStorage.removeItem(key);
        }
      });

      window.localStorage.setItem(LS_KEYS.DATA_VERSION, CURRENT_DATA_VERSION.toString());
      log('✅ [CLEANUP] localStorage limpo e atualizado para versão', CURRENT_DATA_VERSION);
      log('ℹ️ [CLEANUP] Dados locais foram atualizados. Tudo será recarregado do servidor.');

      return true;
    }

    log('✅ [CLEANUP] localStorage já está na versão atual');
    return false;
  } catch (error) {
    console.error('❌ [CLEANUP] Erro ao limpar localStorage:', error);
    return false;
  }
};
