import { supabase } from './supabaseClient.js';

const TABLE = 'route_config';

export const getActiveRoutes = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('psm')
    .order('display_order')
    .order('route_name');
  return { data, error };
};

export const getAllRoutes = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('psm')
    .order('display_order')
    .order('route_name');
  return { data, error };
};

// Colunas conhecidas da tabela route_config — filtra campos extra do formulário (ex: tipo_de_rede)
const pickRouteFields = ({ psm, route_name, province, is_active, display_order }) => ({
  psm,
  route_name,
  province,
  is_active: is_active !== false,
  display_order: display_order ?? 0,
});

export const createRoute = async (route) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([pickRouteFields(route)])
    .select();
  return { data, error };
};

export const updateRoute = async (id, updates) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...pickRouteFields(updates), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  return { data, error };
};

export const deleteRoute = async (id) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);
  return { error };
};

export const seedRoutesIfEmpty = async (staticRoutesByPsm, staticRouteToProvince) => {
  const { count, error: countError } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true });

  if (countError || count > 0) return { seeded: false, error: countError };

  const rows = [];
  Object.entries(staticRoutesByPsm).forEach(([psm, routes]) => {
    routes.forEach((route_name, idx) => {
      rows.push({
        psm,
        route_name,
        province: staticRouteToProvince[route_name] || '',
        is_active: true,
        display_order: idx,
      });
    });
  });

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'psm,route_name' });
  return { seeded: !error, error };
};
