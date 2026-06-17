import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const PsmProvinceSettings = ({ settings, onSave, saving }) => {
  const [psmList, setPsmList] = useState([]);
  const [provincesByPsm, setProvincesByPsm] = useState({});
  const [newPsm, setNewPsm] = useState('');
  const [newProvince, setNewProvince] = useState({});
  const [expandedPsm, setExpandedPsm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPsmList(settings.psm_list || []);
    setProvincesByPsm(settings.provinces_by_psm || {});
  }, [settings.psm_list, settings.provinces_by_psm]);

  const handleSave = async () => {
    setError('');
    const result = await onSave({ psm_list: psmList, provinces_by_psm: provincesByPsm });
    if (result?.error) {
      setError(result.error.message || 'Erro ao guardar.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const addPsm = () => {
    const name = newPsm.trim().toUpperCase();
    if (!name) return;
    if (psmList.includes(name)) { setError(`PSM "${name}" já existe.`); return; }
    setError('');
    setPsmList(prev => [...prev, name]);
    setProvincesByPsm(prev => ({ ...prev, [name]: [] }));
    setNewPsm('');
    setExpandedPsm(name);
  };

  const removePsm = (psm) => {
    if (!window.confirm(`Remover PSM "${psm}"? As rotas associadas não serão apagadas.`)) return;
    setPsmList(prev => prev.filter(p => p !== psm));
    setProvincesByPsm(prev => {
      const next = { ...prev };
      delete next[psm];
      return next;
    });
  };

  const addProvince = (psm) => {
    const name = (newProvince[psm] || '').trim();
    if (!name) return;
    const current = provincesByPsm[psm] || [];
    if (current.includes(name)) { setError(`Província "${name}" já existe em ${psm}.`); return; }
    setError('');
    setProvincesByPsm(prev => ({ ...prev, [psm]: [...(prev[psm] || []), name] }));
    setNewProvince(prev => ({ ...prev, [psm]: '' }));
  };

  const removeProvince = (psm, province) => {
    setProvincesByPsm(prev => ({
      ...prev,
      [psm]: (prev[psm] || []).filter(p => p !== province),
    }));
  };

  const PSM_COLORS = {
    FIBRASOL: 'bg-blue-500',
    ISISTEL: 'bg-green-500',
    ANGLOBAL: 'bg-orange-500',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">PSMs e Províncias</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {saving ? 'A guardar...' : saved ? 'Guardado ✓' : 'Guardar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Lista de PSMs */}
      <div className="space-y-2">
        {psmList.map(psm => {
          const isOpen = expandedPsm === psm;
          const provinces = provincesByPsm[psm] || [];
          const dotColor = PSM_COLORS[psm] || 'bg-gray-400';

          return (
            <div key={psm} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header do PSM */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50">
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => setExpandedPsm(isOpen ? null : psm)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span className="text-sm font-semibold text-gray-800">{psm}</span>
                  <span className="text-xs text-gray-400">{provinces.length} {provinces.length === 1 ? 'província' : 'províncias'}</span>
                  {isOpen
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                    : <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto" />}
                </button>
                <button
                  onClick={() => removePsm(psm)}
                  className="ml-2 p-1 text-gray-300 hover:text-red-500 transition-colors rounded"
                  title="Remover PSM"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Províncias (expandido) */}
              {isOpen && (
                <div className="px-4 py-3 space-y-2 border-t border-gray-100">
                  {provinces.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Sem províncias configuradas</p>
                  )}
                  {provinces.map(prov => (
                    <div key={prov} className="flex items-center justify-between group">
                      <span className="text-sm text-gray-700">{prov}</span>
                      <button
                        onClick={() => removeProvince(psm, prov)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 transition-all rounded"
                        title="Remover província"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Adicionar província */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newProvince[psm] || ''}
                      onChange={e => setNewProvince(prev => ({ ...prev, [psm]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addProvince(psm)}
                      placeholder="Nova província..."
                      className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      onClick={() => addProvince(psm)}
                      className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-600 px-2 py-1 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Adicionar novo PSM */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <input
          type="text"
          value={newPsm}
          onChange={e => setNewPsm(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && addPsm()}
          placeholder="Novo PSM (ex: NOVOPSM)"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={addPsm}
          className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo PSM
        </button>
      </div>
    </div>
  );
};

export default PsmProvinceSettings;
