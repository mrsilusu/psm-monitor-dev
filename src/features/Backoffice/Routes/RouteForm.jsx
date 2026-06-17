import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STATIC_PSM_LIST = ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'];
const STATIC_OPERATOR_TO_PROVINCES = {
  FIBRASOL: ['Zaire', 'Uíge', 'Malanje', 'Cuanza Norte'],
  ISISTEL: ['Cabinda'],
  ANGLOBAL: ['Lunda Norte', 'Lunda Sul', 'Moxico'],
};

const RouteForm = ({
  route = null,
  selectedPsm,
  allPsms = STATIC_PSM_LIST,
  operatorToProvinces = STATIC_OPERATOR_TO_PROVINCES,
  onSave,
  onCancel,
  loading = false,
}) => {
  const isEdit = !!route;

  const [form, setForm] = useState({
    psm: selectedPsm || allPsms[0] || 'FIBRASOL',
    route_name: '',
    province: '',
    tipo_de_rede: 'Backbone',
    is_active: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (route) {
      setForm({
        psm: route.psm,
        route_name: route.route_name,
        province: route.province,
        tipo_de_rede: route.tipo_de_rede || 'Backbone',
        is_active: route.is_active !== false,
      });
    } else if (selectedPsm) {
      const provinces = operatorToProvinces[selectedPsm] || [];
      setForm(f => ({ ...f, psm: selectedPsm, province: provinces[0] || '' }));
    }
  }, [route, selectedPsm]);

  const provinceOptions = operatorToProvinces[form.psm] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.psm.trim()) { setError('O PSM é obrigatório.'); return; }
    if (!form.route_name.trim()) { setError('O nome da rota é obrigatório.'); return; }
    if (!form.province.trim()) { setError('A província é obrigatória.'); return; }
    const result = await onSave({ ...form, psm: form.psm.trim().toUpperCase(), province: form.province.trim() });
    if (result?.error) setError(result.error.message || 'Erro ao guardar.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar Rota' : 'Nova Rota'}
          </h2>
          <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* PSM — combobox: escolhe existente ou escreve novo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PSM *</label>
            <input
              type="text"
              list="psm-options"
              value={form.psm}
              onChange={e => {
                const psm = e.target.value.toUpperCase();
                const provinces = operatorToProvinces[psm] || [];
                setForm(f => ({ ...f, psm, province: provinces[0] || '' }));
              }}
              disabled={isEdit}
              placeholder="Ex: FIBRASOL ou novo PSM"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
            />
            <datalist id="psm-options">
              {allPsms.map(psm => <option key={psm} value={psm} />)}
            </datalist>
          </div>

          {/* Nome da rota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Rota *</label>
            <input
              type="text"
              value={form.route_name}
              onChange={e => setForm(f => ({ ...f, route_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Luanda - Malanje"
            />
          </div>

          {/* Província — combobox: escolhe existente ou escreve nova */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Província *</label>
            <input
              type="text"
              list={`province-options-${form.psm}`}
              value={form.province}
              onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
              placeholder="Ex: Cabinda ou nova província"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <datalist id={`province-options-${form.psm}`}>
              {provinceOptions.map(p => <option key={p} value={p} />)}
            </datalist>
            {provinceOptions.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Sugestões: {provinceOptions.join(', ')} — ou escreve uma nova
              </p>
            )}
          </div>

          {/* Tipo de rede */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Rede</label>
            <div className="flex gap-4">
              {['Backbone', 'Metro'].map(tipo => (
                <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo_de_rede"
                    value={tipo}
                    checked={form.tipo_de_rede === tipo}
                    onChange={() => setForm(f => ({ ...f, tipo_de_rede: tipo }))}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ativa */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Rota ativa</span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'A guardar...' : isEdit ? 'Guardar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteForm;
