# Guia de Persistência de Dados — PSM Monitor

## 1. Estrutura de Dados do App

### Estado Principal `data`

```
data = {
  [PSM]: {                          // ex: "ISISTEL", "FIBRASOL", "ANGLOBAL", "PSM_DINAMICO"
    [WEEK]: {                       // ex: "W1" … "W52"
      [ROUTE]: {                    // ex: "BSC_Cabinda - Quatro"
        'Transporte':                     number | '',
        'Indisponíveis':                  number | '',
        'Total Reparadas':                number | '',
        'Reconhecidas':                   number | '',
        'Dep. de Passagem de Cabo':       number | '',
        'Dep. de Licença':                number | '',
        'Dep. de Cutover':                number | '',
        'Fibras dependentes da [PSM]':    number | '',  // chave muda consoante o PSM
      }
    }
  }
}
```

### PSMs Estáticos vs Dinâmicos

| Tipo | Exemplos | Origem |
|------|----------|--------|
| **Estático** | ISISTEL, FIBRASOL, ANGLOBAL | `src/config/routeConfig.js` (hardcoded) |
| **Dinâmico** | Qualquer outro | Tabela `route_config` no Supabase (criado via Backoffice) |

A distinção no código é feita via:
```js
const STATIC_PSMS = ['ISISTEL', 'FIBRASOL', 'ANGLOBAL'];
const isDynamic = !STATIC_PSMS.includes(psmName);
```

---

## 2. Tabelas Supabase

### `psm_data` — Dados operacionais das rotas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid PK | Gerado automaticamente |
| `psm` | text | Nome do operador |
| `week` | text | Semana (W1–W52) |
| `route` | text | Nome da rota |
| `year` | int | Ano |
| `quarter` | text | Trimestre (Q1, Q2, Q3) |
| `provincia` | text | Província (derivada de `routeToProvince`) |
| `user_id` | uuid FK auth.users | Último utilizador a escrever |
| `transporte` | int | Campo 'Transporte' |
| `indisponiveis` | int | Campo 'Indisponíveis' |
| `total_reparadas` | int | Campo 'Total Reparadas' |
| `reconhecidas` | int | Campo 'Reconhecidas' |
| `dep_passagem` | int | Campo 'Dep. de Passagem de Cabo' |
| `dep_licenca` | int | Campo 'Dep. de Licença' |
| `dep_cutover` | int | Campo 'Dep. de Cutover' |
| `dep_isistel` | int | 'Fibras dep. ISISTEL' (estático) **ou** 'Fibras dep. [PSM]' (dinâmico) |
| `dep_fibrasol` | int | Campo 'Fibras dependentes da FIBRASOL' |
| `dep_anglobal` | int | Campo 'Fibras dependentes da ANGLOBAL' |
| `testada` | boolean | Rota testada nesta semana |
| `validada` | boolean | Rota validada nesta semana |

> **Nota sobre `dep_isistel`:** Para PSMs dinâmicos, esta coluna armazena o campo
> `Fibras dependentes da [NOME_PSM]`. É uma reutilização intencional — o mapeamento
> é feito via `isDynamic` no save e no load.

**Chave de unicidade:** `(psm, week, route, year)` — usar `ON CONFLICT` nesta combinação.

### `route_config` — Catálogo de rotas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid PK | Gerado automaticamente |
| `psm` | text | Nome do operador |
| `route_name` | text | Nome da rota |
| `province` | text | Província |
| `is_active` | boolean | Rota activa? |
| `display_order` | int | Ordem de exibição |

### `psm_distribuicao_reparacoes` — Distribuição de reparações

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `psm` | text | Operador |
| `week` | text | Semana |
| `route` | text | Rota |
| `tipo` | text | Tipo de reparação (string livre) |
| `desconto` | int | Valor |
| `year` | int | Ano |
| `quarter` | text | Trimestre |

**Chave de unicidade:** `(psm, week, route, tipo, year, quarter)`

### `psm_justificativas` — Justificativas trimestrais

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `psm` | text | Operador |
| `quarter` | text | Trimestre |
| `year` | int | Ano |
| `seccao` | text | Secção |
| `regiao` | text | Região |
| `transporte` | int | Valor |
| `indisponiveis` | int | Valor |
| `delta` | int | Delta |
| `justificativa` | text | Texto livre |

---

## 3. Mapeamento App ↔ Supabase

### Save (App → Supabase)

```
'Transporte'                        → transporte          (parseInt || 0)
'Indisponíveis'                     → indisponiveis        (parseInt || 0)
'Total Reparadas'                   → total_reparadas      (parseInt || 0)
'Reconhecidas'                      → reconhecidas         (parseInt || 0)
'Dep. de Passagem de Cabo'          → dep_passagem         (parseInt || 0)
'Dep. de Licença'                   → dep_licenca          (parseInt || 0)
'Dep. de Cutover'                   → dep_cutover          (parseInt || 0)
'Fibras dependentes da ISISTEL'     → dep_isistel   (só se PSM estático ISISTEL)
'Fibras dependentes da [PSM]'       → dep_isistel   (PSMs dinâmicos)
'Fibras dependentes da FIBRASOL'    → dep_fibrasol         (parseInt || 0)
'Fibras dependentes da ANGLOBAL'    → dep_anglobal         (parseInt || 0)
rotasTestadas[psm][week][route]     → testada              (boolean)
rotasValidadas[psm][week][route]    → validada             (boolean)
```

### Load (Supabase → App)

```
transporte      → 'Transporte'
indisponiveis   → 'Indisponíveis'
total_reparadas → 'Total Reparadas'
reconhecidas    → 'Reconhecidas'
dep_passagem    → 'Dep. de Passagem de Cabo'
dep_licenca     → 'Dep. de Licença'
dep_cutover     → 'Dep. de Cutover'
dep_isistel     → 'Fibras dependentes da ISISTEL' (se PSM estático)
dep_isistel     → 'Fibras dependentes da [PSM]'   (se PSM dinâmico)
dep_fibrasol    → 'Fibras dependentes da FIBRASOL'
dep_anglobal    → 'Fibras dependentes da ANGLOBAL'
testada=true    → rotasTestadas[psm][week][route] = { testada: true }
validada=true   → rotasValidadas[psm][week][route] = { validada: true }
```

---

## 4. Estratégia de Save — Boas Práticas

### Princípio: UPSERT em vez de SELECT → INSERT/UPDATE

O padrão actual (SELECT todos os existentes → decidir INSERT vs UPDATE) tem um problema
crítico: se o SELECT devolver vazio (ex: por RLS, auth timing, ou ausência de dados),
**tudo vai para INSERT** e falha com erros de constraint.

**A solução correcta é usar UPSERT** (`INSERT ... ON CONFLICT DO UPDATE`), que o
Supabase suporta nativamente:

```js
const { error } = await supabase
  .from('psm_data')
  .upsert(registos, { onConflict: 'psm,week,route,year' })
  .select();
```

Isto elimina a necessidade de buscar registos existentes antes de guardar.

### Regra de inserção

**Só criar/actualizar uma linha se tiver dados reais:**

```js
const temDados = (row) =>
  row.transporte !== 0 ||
  row.indisponiveis !== 0 ||
  row.total_reparadas !== 0 ||
  row.reconhecidas !== 0 ||
  row.dep_passagem !== 0 ||
  row.dep_licenca !== 0 ||
  row.dep_cutover !== 0 ||
  row.dep_isistel !== 0 ||
  row.dep_fibrasol !== 0 ||
  row.dep_anglobal !== 0 ||
  row.testada === true ||
  row.validada === true;
```

> **Nunca incluir `user_id` nem campos de texto na verificação `temDados`** —
> são metadados, não dados operacionais.

### Campos obrigatórios em cada registo

```js
{
  psm,          // string — nome do PSM
  week,         // string — "W1"…"W52"
  route,        // string — nome completo da rota
  year,         // number — ano ex: 2026
  quarter,      // string — "Q1", "Q2", "Q3"
  provincia,    // string — derivada de routeToProvince[route] || ''
  user_id,      // uuid — obrigatório para RLS (auth.uid())
  // + campos numéricos e booleanos
}
```

### Autenticação antes de qualquer operação

```js
// ✅ CORRECTO: usar user do AuthContext (já validado, sem chamada de rede extra)
const { user } = useAuth();
if (!user?.id) return; // Aguardar sessão

// ❌ EVITAR dentro de timers/callbacks:
const { data: { user } } = await supabase.auth.getUser(); // chamada de rede pode falhar
```

### Debounce de 5 segundos

O save no Supabase só dispara 5 segundos após a última alteração. O localStorage
é actualizado imediatamente para não perder dados em caso de refresh.

```
Alteração → localStorage (imediato) → [5s debounce] → Supabase UPSERT
```

---

## 5. Estratégia de Load — Boas Práticas

### Princípio: aguardar auth antes de consultar

```js
useEffect(() => {
  if (!user) return; // RLS bloqueará sem sessão — aguardar
  carregarDados();
}, [selectedYear, user]);
```

### Query mínima e directa

```js
const { data, error } = await supabase
  .from('psm_data')
  .select('*')
  .eq('year', year)
  .order('psm')
  .order('week');
```

### Merge com dados locais

O merge preserva rotas locais ainda não persistidas no Supabase:

```
Para cada PSM/semana no resultado do Supabase:
  → dados do Supabase prevalecem (source of truth para o que já foi guardado)
  → dados locais extra (rotas novas ainda não salvas) são preservados
```

### Tratamento de estado vazio

Se o Supabase devolver vazio (sem dados para o ano), **não apagar** o que está
em memória — pode ser dados que ainda não foram persistidos neste ano.

---

## 6. RLS — Row Level Security

### Política recomendada para `psm_data`

```sql
-- Activar RLS
ALTER TABLE psm_data ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer utilizador autenticado vê todos os dados
-- (app colaborativa — múltiplos utilizadores, mesmos PSMs)
CREATE POLICY "authenticated read psm_data"
ON psm_data FOR SELECT
TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE: utilizador autenticado pode escrever
-- user_id é para auditoria, não para restringir leitura
CREATE POLICY "authenticated write psm_data"
ON psm_data FOR ALL
TO authenticated
USING (true)
WITH CHECK (user_id = auth.uid());
```

### Dados históricos sem `user_id`

Antes de activar RLS com `WITH CHECK (user_id = auth.uid())`, atribuir
um `user_id` às linhas existentes que têm `NULL`:

```sql
UPDATE psm_data
SET user_id = '<UUID_DO_ADMIN>'
WHERE user_id IS NULL;
```

O UUID do admin está em **Supabase Dashboard → Authentication → Users**.

---

## 7. Implementação Recomendada

### `salvarTudoNoSupabase` — versão limpa

```js
export const salvarTudoNoSupabase = async (
  allData, quarter, year, routeToProvince, rotasTestadas, rotasValidadas, userId
) => {
  if (!userId) return { success: false, error: new Error('not_authenticated') };

  const ano = year || new Date().getFullYear();
  const registos = [];

  for (const psm of Object.keys(allData)) {
    const isDynamic = !STATIC_PSMS.includes(psm);

    for (const week of Object.keys(allData[psm] || {})) {
      for (const route of Object.keys(allData[psm][week] || {})) {
        const d = allData[psm][week][route];

        const row = {
          psm, week, route, year: ano, quarter: quarter || 'Q1',
          provincia: routeToProvince[route] || '',
          user_id: userId,
          transporte:      parseOrZero(d['Transporte']),
          indisponiveis:   parseOrZero(d['Indisponíveis']),
          total_reparadas: parseOrZero(d['Total Reparadas']),
          reconhecidas:    parseOrZero(d['Reconhecidas']),
          dep_passagem:    parseOrZero(d['Dep. de Passagem de Cabo']),
          dep_licenca:     parseOrZero(d['Dep. de Licença']),
          dep_cutover:     parseOrZero(d['Dep. de Cutover']),
          dep_isistel: isDynamic
            ? parseOrZero(d[`Fibras dependentes da ${psm}`])
            : parseOrZero(d['Fibras dependentes da ISISTEL']),
          dep_fibrasol: parseOrZero(d['Fibras dependentes da FIBRASOL']),
          dep_anglobal: parseOrZero(d['Fibras dependentes da ANGLOBAL']),
          testada:  rotasTestadas?.[psm]?.[week]?.[route]?.testada  === true,
          validada: rotasValidadas?.[psm]?.[week]?.[route]?.validada === true,
        };

        if (temDados(row)) registos.push(row);
      }
    }
  }

  if (registos.length === 0) return { success: true, total: 0 };

  // UPSERT — sem SELECT prévio, sem risco de conflito
  const BATCH = 200;
  let total = 0;
  for (let i = 0; i < registos.length; i += BATCH) {
    const { error } = await supabase
      .from('psm_data')
      .upsert(registos.slice(i, i + BATCH), { onConflict: 'psm,week,route,year' });

    if (error) {
      console.error('❌ UPSERT falhou:', error);
      return { success: false, error };
    }
    total += Math.min(BATCH, registos.length - i);
  }

  return { success: true, total };
};
```

### `lerTudoDoSupabase` — versão limpa

```js
export const lerTudoDoSupabase = async (year) => {
  const ano = year || new Date().getFullYear();

  const { data: rows, error } = await supabase
    .from('psm_data')
    .select('*')
    .eq('year', ano)
    .order('psm')
    .order('week');

  if (error) return { success: false, error, data: {}, rotasTestadas: {}, rotasValidadas: {} };
  if (!rows?.length) return { success: true, data: {}, rotasTestadas: {}, rotasValidadas: {} };

  const allData = {}, rotasTestadas = {}, rotasValidadas = {};

  for (const row of rows) {
    const { psm, week, route } = row;
    const isDynamic = !STATIC_PSMS.includes(psm);

    allData[psm] ??= {};
    allData[psm][week] ??= {};
    allData[psm][week][route] = {
      'Transporte':                  row.transporte      || 0,
      'Indisponíveis':               row.indisponiveis   || 0,
      'Total Reparadas':             row.total_reparadas || 0,
      'Reconhecidas':                row.reconhecidas    || 0,
      'Dep. de Passagem de Cabo':    row.dep_passagem    || 0,
      'Dep. de Licença':             row.dep_licenca     || 0,
      'Dep. de Cutover':             row.dep_cutover     || 0,
      'Fibras dependentes da FIBRASOL': row.dep_fibrasol || 0,
      'Fibras dependentes da ANGLOBAL': row.dep_anglobal || 0,
      ...(isDynamic
        ? { [`Fibras dependentes da ${psm}`]: row.dep_isistel || 0 }
        : { 'Fibras dependentes da ISISTEL': row.dep_isistel  || 0 }),
    };

    if (row.testada) {
      rotasTestadas[psm] ??= {};
      rotasTestadas[psm][week] ??= {};
      rotasTestadas[psm][week][route] = { testada: true };
    }
    if (row.validada) {
      rotasValidadas[psm] ??= {};
      rotasValidadas[psm][week] ??= {};
      rotasValidadas[psm][week][route] = { validada: true };
    }
  }

  return { success: true, data: allData, rotasTestadas, rotasValidadas };
};
```

### Função auxiliar `parseOrZero`

```js
// Converter string vazia, null, undefined ou NaN para 0
const parseOrZero = (value) => {
  if (value === '' || value == null) return 0;
  const n = parseInt(value, 10);
  return isNaN(n) ? 0 : n;
};
```

### Função auxiliar `temDados`

```js
// Só guardar no Supabase se houver pelo menos um valor real
const temDados = (row) =>
  row.testada || row.validada ||
  row.transporte      !== 0 || row.indisponiveis   !== 0 ||
  row.total_reparadas !== 0 || row.reconhecidas    !== 0 ||
  row.dep_passagem    !== 0 || row.dep_licenca     !== 0 ||
  row.dep_cutover     !== 0 || row.dep_isistel     !== 0 ||
  row.dep_fibrasol    !== 0 || row.dep_anglobal    !== 0;
```

---

## 8. Constraint de Unicidade em `psm_data`

Para que o UPSERT funcione, a tabela precisa de um índice único em `(psm, week, route, year)`.
Executar **uma única vez** no Supabase Dashboard → SQL Editor:

```sql
-- Criar índice de unicidade para suportar UPSERT via ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS psm_data_upsert_key
ON psm_data (psm, week, route, year);
```

Verificar se já existe:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'psm_data';
```

---

## 9. Checklist de Implementação

- [ ] Criar índice único `(psm, week, route, year)` em `psm_data` no Supabase
- [ ] Aplicar RLS em `psm_data` (policies de SELECT e ALL)
- [ ] Atribuir `user_id` às linhas históricas com `NULL` (passo 0 da migração RLS)
- [ ] Substituir `salvarTudoNoSupabase` pela versão com UPSERT
- [ ] Substituir `lerTudoDoSupabase` pela versão limpa
- [ ] Extrair `parseOrZero` e `temDados` para `src/utils/dataUtils.js`
- [ ] Garantir que `usePersistence` passa `user.id` (já feito) e guarda load atrás de `if (!user) return`
- [ ] Testar: PSM estático (ISISTEL) salva e busca correctamente
- [ ] Testar: PSM dinâmico salva e busca correctamente (campo `dep_isistel` mapeado)
- [ ] Testar: reload de página não perde dados
- [ ] Testar: dois utilizadores em simultâneo não se bloqueiam mutuamente
