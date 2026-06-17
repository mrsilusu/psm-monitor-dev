import React from 'react';

const RouteDetailModal = ({
  showModal,
  selectedRota,
  setShowModal,
  selectedOperator,
  selectedQuarter,
  selectedYear,
}) => {
  if (!showModal || !selectedRota) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{zIndex: 9999}} onClick={() => setShowModal(false)}>
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold">Detalhes da Rota</h2>
            <p className="text-sm mt-0.5">{selectedRota.name}</p>
          </div>
          <button onClick={() => setShowModal(false)} className="text-3xl leading-none hover:bg-white/20 px-3 py-1 rounded">×</button>
        </div>

        <div className="p-5">

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 mb-4 border-2 border-orange-200">
            <p className="text-sm font-bold text-orange-900">
              PSM: {selectedOperator} | {selectedQuarter} ({selectedYear}) - Últimos valores registrados
            </p>
          </div>

          <div className="grid grid-cols-8 gap-2 mb-4">
            {[
              {
                status:'Transporte',
                label: (() => {
                  if (selectedQuarter === 'Q1') {
                    return `Transporte Q3 (${parseInt(selectedYear) - 1})`;
                  } else if (selectedQuarter === 'Q2') {
                    return `Transporte Q1`;
                  } else if (selectedQuarter === 'Q3') {
                    return `Transporte Q2`;
                  }
                  return `Transporte Q1`;
                })(),
                bg:'from-slate-700 to-slate-900',
                icon:'🔄'
              },
              {status:'Indisponíveis', label:'Indisponíveis', bg:'from-red-500 to-red-600', icon:'🚫'},
              {status:'Total Reparadas', label:'Total Reparadas', bg:'from-green-500 to-green-600', icon:'✅', highlight: true},
              {status:'Reconhecidas', label:'Reconhecidas', bg:'from-teal-500 to-teal-600', icon:'🤝'},
              {status:'Dep. de Passagem de Cabo', label:'Dep. Passagem', bg:'from-blue-500 to-blue-600', icon:'🧵'},
              {status:'Dep. de Licença', label:'Dep. Licença', bg:'from-orange-500 to-orange-600', icon:'📄'},
              {status:'Dep. de Cutover', label:'Dep. Cutover', bg:'from-purple-500 to-purple-600', icon:'✂️'},
              {status:'Fibras Dependentes', label:`Fibras Dep. ${selectedOperator}`, bg:'from-slate-600 to-slate-700', icon:'⏳'}
            ].map((item, idx) => {
              const st = selectedRota.stats[item.status] || {value: 0, week: null};
              const isReparadas = item.highlight;
              return (
                <div key={idx} className={`bg-gradient-to-br ${item.bg} rounded-lg p-2 text-white shadow-md ${isReparadas ? 'ring-2 ring-green-300 ring-offset-2' : ''}`}>
                  <div className="flex flex-col items-center text-center mb-1">
                    <span className="text-sm mb-0.5">{item.icon}</span>
                    <p className="text-[11px] font-semibold leading-tight">{item.label}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isReparadas ? 'text-green-100' : ''}`}>{st.value}</p>
                    {st.week && <p className="text-[7px] opacity-80 mt-0.5">{st.week}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedRota.justification ? (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-400">
              <h4 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
                📝 Justificativa de Degradação
              </h4>
              <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200 shadow-sm">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedRota.justification.justificativa || 'Sem texto'}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {selectedRota.justification.regiao && (
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <p className="text-[9px] text-gray-600 font-semibold mb-0.5">Região</p>
                    <p className="text-xs font-bold text-gray-900">{selectedRota.justification.regiao}</p>
                  </div>
                )}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded p-2 border border-gray-200">
                  <p className="text-[9px] text-gray-600 font-semibold mb-0.5">
                    {selectedQuarter === 'Q1'
                      ? `Transporte Q3 (${parseInt(selectedYear) - 1})`
                      : selectedQuarter === 'Q2'
                        ? 'Transporte Q1'
                        : 'Transporte Q2'
                    }
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedRota.justification.transporteQ2 || selectedRota.justification.transporte || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded p-2 border border-red-200">
                  <p className="text-[9px] text-red-700 font-semibold mb-0.5">Indisponíveis</p>
                  <p className="text-base font-bold text-red-700">{selectedRota.justification.indisponiveis || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded p-2 border border-green-200 ring-2 ring-green-300">
                  <p className="text-[9px] text-green-700 font-semibold mb-0.5">✅ Reparadas</p>
                  <p className="text-base font-bold text-green-700">{selectedRota.stats['Total Reparadas']?.value || 0}</p>
                </div>
                <div className={`bg-gradient-to-br rounded p-2 border ${
                  (selectedRota.justification.delta || 0) > 0 ? 'from-red-50 to-red-100 border-red-200' :
                  (selectedRota.justification.delta || 0) < 0 ? 'from-green-50 to-green-100 border-green-200' :
                  'from-gray-50 to-gray-100 border-gray-200'
                }`}>
                  <p className={`text-[9px] font-semibold mb-0.5 ${
                    (selectedRota.justification.delta || 0) > 0 ? 'text-red-700' :
                    (selectedRota.justification.delta || 0) < 0 ? 'text-green-700' : 'text-gray-600'
                  }`}>Delta Δ</p>
                  <p className={`text-base font-bold ${
                    (selectedRota.justification.delta || 0) > 0 ? 'text-red-700' :
                    (selectedRota.justification.delta || 0) < 0 ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {(selectedRota.justification.delta || 0) > 0 ? '+' : ''}{selectedRota.justification.delta || 0}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-300 text-center">
              <p className="text-base text-blue-800 font-medium">
                ℹ️ Nenhuma justificativa registrada para esta rota no trimestre {selectedQuarter}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RouteDetailModal;
