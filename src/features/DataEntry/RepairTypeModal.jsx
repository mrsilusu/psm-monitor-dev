import React from 'react';

const RepairTypeModal = ({
  showRepairTypeModal,
  pendingRepairData,
  aplicarReparacaoPorTipo,
  cancelarModal,
}) => {
  if (!showRepairTypeModal || !pendingRepairData) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={cancelarModal}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-t-xl flex-shrink-0">
          <h2 className="text-lg font-bold">🔧 Tipo de Reparação</h2>
          <p className="text-xs text-purple-100 mt-0.5">
            {pendingRepairData.route} • {pendingRepairData.week}
          </p>
        </div>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-900">
              <strong>A distribuir:</strong> {pendingRepairData.diferenca} fibra(s)
            </p>
            <p className="text-xs text-blue-700 mt-1">
              💡 {pendingRepairData.tiposDisponiveis.length > 1
                ? 'Selecione o tipo reparado'
                : 'Último tipo disponível'}
            </p>
          </div>

          <div className="space-y-2">
            {pendingRepairData.tiposDisponiveis.map((item, idx) => {
              const cores = {
                'Reconhecidas': 'from-teal-500 to-teal-600',
                'Dep. de Passagem de Cabo': 'from-blue-500 to-blue-600',
                'Dep. de Licença': 'from-orange-500 to-orange-600',
                'Dep. de Cutover': 'from-purple-500 to-purple-600'
              };

              const icones = {
                'Reconhecidas': '🤝',
                'Dep. de Passagem de Cabo': '🧵',
                'Dep. de Licença': '📄',
                'Dep. de Cutover': '✂️'
              };

              const cor = cores[item.tipo] || 'from-gray-600 to-gray-700';
              const icone = icones[item.tipo] || '⏳';
              const nome = item.tipo.includes('Fibras dependentes')
                ? `Fibras Dep. ${pendingRepairData.psm}`
                : item.tipo;

              return (
                <button
                  key={idx}
                  onClick={() => aplicarReparacaoPorTipo(item.tipo)}
                  className={`w-full bg-gradient-to-r ${cor} hover:opacity-90 text-white rounded-lg p-3 shadow-md transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{icone}</span>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{nome}</p>
                        <p className="text-xs opacity-90">Atual: {item.valor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-90">Desconto:</p>
                      <p className="text-lg font-bold">
                        -{Math.min(item.valor, pendingRepairData.diferenca)}
                      </p>
                      <p className="text-[10px] opacity-75">
                        → {Math.max(0, item.valor - pendingRepairData.diferenca)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer fixo */}
        <div className="px-4 py-3 bg-gray-50 rounded-b-xl flex justify-between items-center flex-shrink-0 border-t">
          <p className="text-xs text-gray-600">Clique no tipo</p>
          <button
            onClick={cancelarModal}
            className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairTypeModal;
