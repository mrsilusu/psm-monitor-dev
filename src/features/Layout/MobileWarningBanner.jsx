import React from 'react';

const MobileWarningBanner = ({ isMobileDevice, showMobileWarning, setShowMobileWarning }) => {
  if (!isMobileDevice || !showMobileWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl animate-slideDown">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1 flex items-center">
              <span className="mr-2">📱</span>
              Dispositivo Móvel Detectado
            </p>
            <p className="text-xs leading-relaxed opacity-90">
              Para melhor experiência, recomendamos usar um <strong>computador desktop</strong>.
              Algumas funcionalidades podem ter visualização limitada em dispositivos móveis.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMobileWarning(false)}
          className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors active:scale-95"
          title="Dispensar aviso"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MobileWarningBanner;
