// src/services/auditService.js
// Responsabilidade: registo de auditoria de ações do utilizador
// Máx. 80 linhas

import { supabase } from './supabaseClient.js';

export const logAction = async ({ action, entity, entityId = null, oldValue = null, newValue = null }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_log').insert([{
      user_id: user?.id,
      user_email: user?.email,
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
    }]);
  } catch {
    // Falha silenciosa — auditoria não deve bloquear operações principais
  }
};

export const getAuditLog = async ({ userId = null, entity = null, dateFrom = null, dateTo = null, page = 0, pageSize = 50 } = {}) => {
  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (userId) query = query.eq('user_id', userId);
  if (entity) query = query.eq('entity', entity);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error, count } = await query;
  return { data, error, count };
};
