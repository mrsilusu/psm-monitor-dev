import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { useSettings } from './useSettings.js';
import OperatorSettings from './OperatorSettings.jsx';

const AppSettings = () => {
  const { settings, loading, error, saving, save } = useSettings();
  const [appName, setAppName] = useState('');
  const [availableYears, setAvailableYears] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      setAppName(settings.app_name || '');
      setAvailableYears((settings.available_years || []).join(', '));
    }
  }, [loading, settings]);

  const handleSave = async () => {
    const years = availableYears
      .split(',')
      .map(y => y.trim())
      .filter(Boolean);

    const result = await save({ app_name: appName, available_years: years });
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        A carregar configurações...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Geral</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Aplicação
          </label>
          <input
            type="text"
            value={appName}
            onChange={e => setAppName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anos disponíveis
          </label>
          <input
            type="text"
            value={availableYears}
            onChange={e => setAvailableYears(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2024, 2025, 2026"
          />
          <p className="text-xs text-gray-400 mt-1">Separar por vírgulas</p>
        </div>
      </div>

      <OperatorSettings settings={settings} onSave={save} />

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'A guardar...' : 'Guardar Alterações'}
        </button>
        {saved && <span className="text-sm text-green-600">Guardado ✓</span>}
      </div>
    </div>
  );
};

export default AppSettings;
