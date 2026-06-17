// ============================================
// REACT HOOKS - SUPABASE
// Arquivo: src/hooks/useSupabase.js
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { supabase, auth, psmData, justificativas, importHistory } from '../lib/supabase'

// ============================================
// HOOK: useAuth (Autenticacao)
// ============================================

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Obter sessao inicial
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudancas de autenticacao
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    setError(null)
    const result = await auth.signIn(email, password)
    setLoading(false)
    if (result.error) setError(result.error.message)
    return result
  }

  const signUp = async (email, password, metadata) => {
    setLoading(true)
    setError(null)
    const result = await auth.signUp(email, password, metadata)
    setLoading(false)
    if (result.error) setError(result.error.message)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    const result = await auth.signOut()
    setLoading(false)
    if (result.error) setError(result.error.message)
    return result
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }
}

// ============================================
// HOOK: usePSMData (Dados PSM)
// ============================================

export const usePSMData = (psm, quarter, year, options = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { 
    autoFetch = true, 
    onSuccess = null,
    onError = null 
  } = options

  const fetchData = useCallback(async () => {
    if (!psm || !quarter || !year) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: result, error: err } = await psmData.getByPSMQuarter(psm, quarter, year)

      if (err) throw err

      setData(result || [])
      if (onSuccess) onSuccess(result)
    } catch (err) {
      setError(err.message)
      setData([])
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }, [psm, quarter, year, onSuccess, onError])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  const refresh = () => fetchData()

  const insert = async (records) => {
    setLoading(true)
    setError(null)

    try {
      const { data: result, error: err } = await psmData.bulkInsert(records)
      if (err) throw err
      
      await fetchData() // Recarregar dados
      return { success: true, data: result }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const clear = async () => {
    if (!psm || !quarter || !year) return { success: false }

    setLoading(true)
    setError(null)

    try {
      const { error: err } = await psmData.clear(psm, quarter, year)
      if (err) throw err

      setData([])
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { 
    data, 
    loading, 
    error, 
    refresh, 
    insert, 
    clear,
    isEmpty: data.length === 0
  }
}

// ============================================
// HOOK: useJustificativas
// ============================================

export const useJustificativas = (psm, quarter, year, options = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { autoFetch = true } = options

  const fetchData = useCallback(async () => {
    if (!psm || !quarter || !year) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: result, error: err } = await justificativas.getByPSMQuarter(psm, quarter, year)

      if (err) throw err

      setData(result || [])
    } catch (err) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [psm, quarter, year])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  const refresh = () => fetchData()

  const insert = async (records) => {
    setLoading(true)
    setError(null)

    try {
      const { data: result, error: err } = await justificativas.bulkInsert(records)
      if (err) throw err
      
      await fetchData()
      return { success: true, data: result }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const clear = async () => {
    if (!psm || !quarter || !year) return { success: false }

    setLoading(true)
    setError(null)

    try {
      const { error: err } = await justificativas.clear(psm, quarter, year)
      if (err) throw err

      setData([])
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { 
    data, 
    loading, 
    error, 
    refresh, 
    insert, 
    clear,
    isEmpty: data.length === 0
  }
}

// ============================================
// HOOK: usePSMImport (Importar Excel)
// ============================================

export const usePSMImport = () => {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const importData = async (records, metadata = {}) => {
    setImporting(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      // Simular progresso
      setProgress(10)

      // Inserir dados
      const { data, error: err } = await psmData.bulkInsert(records)

      if (err) throw err

      setProgress(80)

      // Registrar historico
      if (metadata.psm && metadata.quarter && metadata.year) {
        await importHistory.create({
          filename: metadata.filename || 'import.xlsx',
          psm: metadata.psm,
          quarter: metadata.quarter,
          year: metadata.year,
          rows_imported: records.length,
          status: 'success'
        })
      }

      setProgress(100)
      setResult({ success: true, count: records.length, data })

      return { success: true, count: records.length, data }
    } catch (err) {
      setError(err.message)
      setResult({ success: false, error: err.message })

      // Registrar erro no historico
      if (metadata.psm && metadata.quarter && metadata.year) {
        await importHistory.create({
          filename: metadata.filename || 'import.xlsx',
          psm: metadata.psm,
          quarter: metadata.quarter,
          year: metadata.year,
          rows_imported: 0,
          status: 'failed',
          error_message: err.message
        })
      }

      return { success: false, error: err.message }
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setProgress(0)
    setError(null)
    setResult(null)
  }

  return { 
    importing, 
    progress, 
    error, 
    result,
    importData, 
    reset 
  }
}

// ============================================
// HOOK: useRealtimeData (Atualizacao em Tempo Real)
// ============================================

export const useRealtimeData = (tableName, filters = {}, callback = null) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel

    const setupRealtime = async () => {
      // Buscar dados iniciais
      let query = supabase.from(tableName).select('*')

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query = query.eq(key, value)
      })

      const { data: initialData, error } = await query

      if (!error) {
        setData(initialData || [])
      }
      setLoading(false)

      // Setup realtime
      channel = supabase
        .channel(`${tableName}-realtime`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            log('Realtime update:', payload)

            // Atualizar dados localmente
            if (payload.eventType === 'INSERT') {
              setData(prev => [...prev, payload.new])
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(item => 
                item.id === payload.new.id ? payload.new : item
              ))
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => item.id !== payload.old.id))
            }

            if (callback) callback(payload)
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [tableName, JSON.stringify(filters), callback])

  return { data, loading }
}

// ============================================
// HOOK: useRoutes (Lista de Rotas)
// ============================================

export const useRoutes = (psm) => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!psm) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error: err } = await psmData.getUniqueRoutes(psm)

        if (err) throw err

        setRoutes(data || [])
      } catch (err) {
        setError(err.message)
        setRoutes([])
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [psm])

  return { routes, loading, error }
}

// ============================================
// HOOK: useImportHistory (Historico de Importacoes)
// ============================================

export const useImportHistory = (limit = 10) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await importHistory.getUserHistory(limit)

      if (err) throw err

      setHistory(data || [])
    } catch (err) {
      setError(err.message)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refresh: fetchHistory }
}

// ============================================
// HOOK: useSupabaseQuery (Query Customizada)
// ============================================

export const useSupabaseQuery = (queryFn, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const executeQuery = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      setData(result)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [queryFn, ...dependencies])

  useEffect(() => {
    executeQuery()
  }, [executeQuery])

  return { data, loading, error, refetch: executeQuery }
}

// ============================================
// HOOK: useDebounce (Utilidade)
// ============================================

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ============================================
// EXEMPLOS DE USO
// ============================================

/*

// 1. AUTENTICACAO
import { useAuth } from './hooks/useSupabase'

function LoginComponent() {
  const { user, loading, signIn, signOut } = useAuth()

  const handleLogin = async () => {
    const { error } = await signIn('email@exemplo.com', 'senha')
    if (error) alert(error)
  }

  if (loading) return <div>Carregando...</div>
  if (user) return <button onClick={signOut}>Sair</button>

  return <button onClick={handleLogin}>Entrar</button>
}

// 2. DADOS PSM
import { usePSMData } from './hooks/useSupabase'

function DataComponent() {
  const { data, loading, error, refresh, insert } = usePSMData('FIBRASOL', 'Q1', 2025)

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      <button onClick={refresh}>Atualizar</button>
      {data.map(item => (
        <div key={item.id}>{item.route}: {item.indisponiveis}</div>
      ))}
    </div>
  )
}

// 3. IMPORTACAO
import { usePSMImport } from './hooks/useSupabase'

function ImportComponent() {
  const { importing, progress, importData } = usePSMImport()

  const handleImport = async (records) => {
    const result = await importData(records, {
      psm: 'FIBRASOL',
      quarter: 'Q1',
      year: 2025,
      filename: 'dados.xlsx'
    })

    if (result.success) {
      alert(`Importados ${result.count} registros`)
    }
  }

  return (
    <div>
      {importing && <div>Progresso: {progress}%</div>}
      <button onClick={() => handleImport(dados)}>Importar</button>
    </div>
  )
}

// 4. REALTIME
import { useRealtimeData } from './hooks/useSupabase'
import { log } from './utils/logger';

function RealtimeComponent() {
  const { data, loading } = useRealtimeData('psm_data', 
    { psm: 'FIBRASOL', quarter: 'Q1' },
    (payload) => log('Atualizado:', payload)
  )

  return (
    <div>
      {data.length} registros (atualiza em tempo real)
    </div>
  )
}

*/

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  useAuth,
  usePSMData,
  useJustificativas,
  usePSMImport,
  useRealtimeData,
  useRoutes,
  useImportHistory,
  useSupabaseQuery,
  useDebounce
}