import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STATIC_PSM_OPTIONS = ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'];
const ROLE_OPTIONS = ['admin', 'editor', 'viewer'];

const UserForm = ({ user = null, onSave, onCancel, loading = false, allPsms = [] }) => {
  const psmOptions = allPsms.length > 0 ? allPsms : STATIC_PSM_OPTIONS;
  const isEdit = !!user;

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'viewer',
    psm_access: [],
    is_active: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'viewer',
        psm_access: user.psm_access || [],
        is_active: user.is_active !== false,
      });
    }
  }, [user]);

  const togglePsm = (psm) => {
    setForm(prev => ({
      ...prev,
      psm_access: prev.psm_access.includes(psm)
        ? prev.psm_access.filter(p => p !== psm)
        : [...prev.psm_access, psm],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email) { setError('O email é obrigatório.'); return; }
    const result = await onSave(form);
    if (result?.error) setError(result.error.message || 'Erro ao guardar.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar Utilizador' : 'Novo Utilizador'}
          </h2>
          <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do utilizador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              disabled={isEdit}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="email@empresa.ao"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Acesso PSM</label>
            <div className="flex flex-wrap gap-3">
              {psmOptions.map(psm => (
                <label key={psm} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.psm_access.includes(psm)}
                    onChange={() => togglePsm(psm)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{psm}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Nenhum selecionado = acesso a todos</p>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Utilizador ativo</span>
            </label>
          )}

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
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'A guardar...' : isEdit ? 'Guardar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
