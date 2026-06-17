import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const ENTITY_OPTIONS = ['', 'user_profile', 'settings', 'data'];

const AuditFilters = ({ filters, onChange, onReset }) => (
  <div className="flex flex-wrap gap-3 items-end">
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Entidade</label>
      <select
        value={filters.entity || ''}
        onChange={e => onChange({ ...filters, entity: e.target.value || null })}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {ENTITY_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt || 'Todas'}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">De</label>
      <input
        type="date"
        value={filters.dateFrom || ''}
        onChange={e => onChange({ ...filters, dateFrom: e.target.value || null })}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Até</label>
      <input
        type="date"
        value={filters.dateTo || ''}
        onChange={e => onChange({ ...filters, dateTo: e.target.value || null })}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button
      onClick={onReset}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      Limpar
    </button>
  </div>
);

export default AuditFilters;
