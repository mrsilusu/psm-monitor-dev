export default function TestEnv() {
  const allEnv = import.meta.env;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'black',
      color: 'lime',
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 99999,
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h2>🔍 ENVIRONMENT VARIABLES TEST</h2>
      <pre>{JSON.stringify({
        'VITE_SUPABASE_URL': allEnv.VITE_SUPABASE_URL || '❌ NÃO ENCONTRADA',
        'VITE_SUPABASE_ANON_KEY': allEnv.VITE_SUPABASE_ANON_KEY ? '✅ EXISTE' : '❌ NÃO ENCONTRADA',
        'MODE': allEnv.MODE,
        'DEV': allEnv.DEV,
        'PROD': allEnv.PROD,
        'BASE_URL': allEnv.BASE_URL,
        'Todas as VITE_': Object.keys(allEnv).filter(k => k.startsWith('VITE_'))
      }, null, 2)}</pre>
    </div>
  );
}