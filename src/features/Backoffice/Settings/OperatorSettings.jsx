import React, { useState, useEffect } from 'react';
import { useRouteConfig } from '../../../hooks/state/useRouteConfig.js';

const STATIC_OPERATORS = ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'];

const OperatorSettings = ({ settings, onSave }) => {
  const { allPsms } = useRouteConfig();
  const [active, setActive] = useState([]);
  const [saved, setSaved] = useState(false);

  // Combina PSMs das rotas com os estáticos (sem duplicados)
  const allOperators = [...new Set([...STATIC_OPERATORS, ...allPsms])];

  useEffect(() => {
    setActive(settings.active_operators || STATIC_OPERATORS);
  }, [settings.active_operators]);

  const toggle = (op) => {
    setActive(prev =>
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    );
  };

  const handleSave = async () => {
    const result = await onSave({ active_operators: active });
    if (!result?.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-gray-900">Operadores Ativos</h3>
      <p className="text-xs text-gray-400">Seleciona quais PSMs aparecem nos filtros da app</p>
      <div className="space-y-2">
        {allOperators.map(op => (
          <label key={op} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active.includes(op)}
              onChange={() => toggle(op)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{op}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Aplicar operadores
        </button>
        {saved && <span className="text-xs text-green-600">Guardado ✓</span>}
      </div>
    </div>
  );
};

export default OperatorSettings;
