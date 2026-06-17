import { supabase } from './supabaseClient.js';
import { log } from '../utils/logger';

/**
 * V5.08.2: Salvar distribuição de reparações no Supabase (OTIMIZADO)
 * @param {Object} distribuicao - Objeto com distribuições
 * @param {string} quarter - Trimestre (Q1, Q2, Q3)
 * @param {number|string} year - Ano
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const salvarDistribuicaoNoSupabase = async (distribuicao, quarter, year) => {
  const startTime = Date.now();
  
  try {
    log('🔄 [DISTRIBUIÇÃO] Iniciando salvamento...');
    
    const registros = [];
    
    // Converter objeto para array de registros
    Object.keys(distribuicao).forEach(psm => {
      Object.keys(distribuicao[psm] || {}).forEach(week => {
        Object.keys(distribuicao[psm][week] || {}).forEach(route => {
          Object.keys(distribuicao[psm][week][route] || {}).forEach(tipo => {
            const desconto = distribuicao[psm][week][route][tipo];
            if (desconto > 0) {
              registros.push({
                psm,
                week,
                route,
                tipo,
                desconto: parseInt(desconto, 10),
                year: parseInt(year, 10),
                quarter
              });
            }
          });
        });
      });
    });
    
    if (registros.length === 0) {
      log('📝 [DISTRIBUIÇÃO] Nenhuma distribuição para salvar');
      return { success: true };
    }
    
    log(`💾 [DISTRIBUIÇÃO] Salvando ${registros.length} registros...`);
    log('📊 [DISTRIBUIÇÃO] Registros:', JSON.stringify(registros, null, 2));
    
    // Upsert com onConflict otimizado
    const { data, error } = await supabase
      .from('psm_distribuicao_reparacoes')
      .upsert(registros, { 
        onConflict: 'psm,week,route,tipo,year,quarter',
        ignoreDuplicates: false
      })
      .select(); // V5.08.2: Adicionar .select() para confirmar salvamento
    
    if (error) {
      console.error('❌ [DISTRIBUIÇÃO] Erro do Supabase:', error);
      throw error;
    }
    
    const duration = Date.now() - startTime;
    log(`✅ [DISTRIBUIÇÃO] ${registros.length} registros salvos em ${duration}ms`);
    log('📊 [DISTRIBUIÇÃO] Dados salvos:', data);
    
    return { success: true, data, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [DISTRIBUIÇÃO] Erro após ${duration}ms:`, error);
    console.error('❌ [DISTRIBUIÇÃO] Stack:', error.stack);
    return { success: false, error };
  }
};

/**
 * V5.08.2: Carregar distribuição de reparações do Supabase (OTIMIZADO)
 * @param {string} quarter - Trimestre (Q1, Q2, Q3)
 * @param {number|string} year - Ano
 * @returns {Promise<Object>} - Objeto com distribuições
 */
export const carregarDistribuicaoDoSupabase = async (quarter, year) => {
  const startTime = Date.now();
  
  try {
    log(`🔄 [DISTRIBUIÇÃO] Iniciando carregamento (${quarter} ${year})...`);
    
    const { data, error } = await supabase
      .from('psm_distribuicao_reparacoes')
      .select('*')
      .eq('year', parseInt(year, 10))
      .eq('quarter', quarter)
      .order('created_at', { ascending: false }); // V5.08.2: Ordenar por mais recente
    
    if (error) {
      console.error('❌ [DISTRIBUIÇÃO] Erro do Supabase:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      const duration = Date.now() - startTime;
      log(`📝 [DISTRIBUIÇÃO] Nenhum registro encontrado (${duration}ms)`);
      return {};
    }
    
    log(`📊 [DISTRIBUIÇÃO] ${data.length} registros encontrados`);
    log('📊 [DISTRIBUIÇÃO] Primeiros registros:', JSON.stringify(data.slice(0, 3), null, 2));
    
    // Converter array para objeto
    const distribuicao = {};
    
    data.forEach(reg => {
      if (!distribuicao[reg.psm]) distribuicao[reg.psm] = {};
      if (!distribuicao[reg.psm][reg.week]) distribuicao[reg.psm][reg.week] = {};
      if (!distribuicao[reg.psm][reg.week][reg.route]) {
        distribuicao[reg.psm][reg.week][reg.route] = {};
      }
      distribuicao[reg.psm][reg.week][reg.route][reg.tipo] = reg.desconto;
    });
    
    const duration = Date.now() - startTime;
    log(`✅ [DISTRIBUIÇÃO] ${data.length} registros carregados em ${duration}ms`);
    log('📊 [DISTRIBUIÇÃO] Estrutura carregada:', JSON.stringify(distribuicao, null, 2));
    
    return distribuicao;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [DISTRIBUIÇÃO] Erro após ${duration}ms:`, error);
    console.error('❌ [DISTRIBUIÇÃO] Stack:', error.stack);
    return {};
  }
};

/**
 * V5.08.0: Limpar distribuição do Supabase (quando apagar reparadas)
 * @param {string} psm - PSM
 * @param {string} week - Semana
 * @param {string} route - Rota
 * @param {string} quarter - Trimestre
 * @param {number|string} year - Ano
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export const limparDistribuicaoNoSupabase = async (psm, week, route, quarter, year) => {
  try {
    log(`🧹 [DISTRIBUIÇÃO] Limpando (${psm}, ${week}, ${route})...`);
    
    const { error } = await supabase
      .from('psm_distribuicao_reparacoes')
      .delete()
      .eq('psm', psm)
      .eq('week', week)
      .eq('route', route)
      .eq('year', parseInt(year, 10))
      .eq('quarter', quarter);
    
    if (error) throw error;
    
    log('✅ [DISTRIBUIÇÃO] Limpa do Supabase');
    return { success: true };
  } catch (error) {
    console.error('❌ [DISTRIBUIÇÃO] Erro ao limpar do Supabase:', error);
    return { success: false, error };
  }
};