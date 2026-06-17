import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../services/supabaseClient.js';
import { logAction } from '../../../services/auditService.js';

const SETTINGS_TABLE = 'app_settings';
const SETTINGS_KEY = 'app_config';

const DEFAULT_SETTINGS = {
  app_name: 'PSM Monitor',
  active_operators: ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'],
  available_years: ['2024', '2025', '2026'],
  max_quarters: 3,
};

export const useSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(SETTINGS_TABLE)
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();
      if (err) throw err;
      if (data?.value) setSettings({ ...DEFAULT_SETTINGS, ...data.value });
    } catch {
      // Usa defaults silenciosamente se a tabela não estiver pronta
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (updates) => {
    setSaving(true);
    setError(null);
    try {
      const newSettings = { ...settings, ...updates };

      // Tenta UPDATE primeiro (linha já existe)
      const { data: updated, error: updateErr } = await supabase
        .from(SETTINGS_TABLE)
        .update({ value: newSettings })
        .eq('key', SETTINGS_KEY)
        .select();

      if (updateErr) throw updateErr;

      // Se não actualizou nenhuma linha, faz INSERT
      if (!updated || updated.length === 0) {
        const { error: insertErr } = await supabase
          .from(SETTINGS_TABLE)
          .insert({ key: SETTINGS_KEY, value: newSettings });
        if (insertErr) throw insertErr;
      }

      setSettings(newSettings);
      await logAction({ action: 'UPDATE', entity: 'settings', newValue: updates });
      setSaving(false);
      return {};
    } catch (e) {
      setError(e.message);
      setSaving(false);
      return { error: e };
    }
  };

  return { settings, loading, error, saving, save, reload: load };
};
