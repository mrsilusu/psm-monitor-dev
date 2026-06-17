// src/services/userService.js
// Responsabilidade: operações CRUD de utilizadores e perfis
// Máx. 120 linhas

import { supabase } from './supabaseClient.js';

const TABLE = 'user_profiles';

export const getUsers = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([userData])
    .select();
  return { data, error };
};

export const updateUser = async (id, updates) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
};

export const deactivateUser = async (id) => updateUser(id, { is_active: false });

export const getUserPsmAccess = async (userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('psm_access')
    .eq('id', userId)
    .single();
  return { data: data?.psm_access, error };
};

export const updateUserPsmAccess = async (userId, psmList) =>
  updateUser(userId, { psm_access: psmList });
