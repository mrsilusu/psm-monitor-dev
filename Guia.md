# PSM Monitor — Script de Refactoring para Agente Autónomo
## Instruções para Claude Code / Codespace Agent

---

## IDENTIDADE E MISSÃO

Tu és um engenheiro de software sénior a executar um refactoring de arquitectura num projecto React/Supabase chamado **PSM Monitor**.

A tua missão é transformar o ficheiro monolítico `src/App.jsx` (11.571 linhas) numa arquitectura modular com múltiplos ficheiros, conforme especificado em detalhe no documento `PSM_Monitor_Plano_Modular.md` que se encontra na raiz do projecto.

---

## REGRAS ABSOLUTAS — NUNCA VIOLAR

1. **Não alterar nenhuma lógica de negócio.** Mover código é o único objectivo. O comportamento do app deve ser exactamente idêntico antes e depois de cada fase.
2. **Não alterar nenhum CSS ou classe Tailwind.** Nenhuma classe `className` pode ser modificada.
3. **Não alterar a estrutura dos objectos de dados** (`data`, `distribuicaoReparacoes`, `justificativas`).
4. **Não alterar nenhuma chave de `localStorage`** (`psm_rotas_data_v3`, `psm_distribuicao_reparacoes_v3`, `psm_justificativas_v1`, `psm_rotas_testadas_v2`, `psm_rotas_validadas_v2`).
5. **Não alterar a ordem dos `useEffect`** de sincronização — alterar a ordem muda o comportamento.
6. **Não alterar a estrutura de tabelas do Supabase** — nenhum SQL de DROP ou ALTER em tabelas existentes.
7. **Não renomear variáveis internas** dentro de funções movidas — apenas os nomes de export podem mudar (e mesmo assim, com cuidado).
8. **Uma fase de cada vez.** Nunca avançar para a fase seguinte sem o critério de conclusão da fase actual estar satisfeito.
9. **Verificar que o app compila sem erros** depois de cada ficheiro criado ou modificado.
10. **Nunca apagar o `App.jsx` original** — apenas reduzir gradualmente através de extracções.

---

## CONTEXTO DO PROJECTO

**Stack:** React 18, Tailwind CSS, Supabase (PostgreSQL + Auth), Lucide React (ícones)
**Branch actual:** `Development`
**Ficheiro principal:** `src/App.jsx` — 11.571 linhas, todo o código num único componente
**Serviços existentes:** `src/services/supabaseService.js` e `src/services/supabaseDistribuicaoService.js` já existem
**Documento de arquitectura:** `PSM_Monitor_Plano_Modular.md` na raiz do projecto

---

## PROCEDIMENTO DE INÍCIO OBRIGATÓRIO

Antes de executar qualquer fase, executa estes passos na ordem indicada:

```bash
# 1. Confirmar que estás na branch correcta
git branch --show-current
# Deve mostrar: Development

# 2. Verificar estado do repositório — sem alterações pendentes
git status

# 3. Ler o documento de arquitectura completo
cat PSM_Monitor_Plano_Modular.md

# 4. Ler o App.jsx para confirmar a estrutura actual
wc -l src/App.jsx
head -30 src/App.jsx

# 5. Verificar serviços existentes
ls src/services/

# 6. Verificar se .env existe e tem as variáveis necessárias
grep -l "SUPABASE" .env 2>/dev/null || echo "ATENÇÃO: .env não encontrado ou sem variáveis Supabase"
```

Se qualquer passo falhar ou mostrar um resultado inesperado, **parar e reportar** antes de continuar.

---

## FORMATO DE TRABALHO POR FASE

Para cada fase, seguir este formato exacto:

```
=== INICIANDO FASE N — [NOME] ===
Propósito: [1 frase]
Ficheiros a criar: [lista]
Ficheiros a modificar: [lista]
O que NÃO será feito: [lista]

[Execução passo a passo]

=== VERIFICAÇÃO DA FASE N ===
- [ ] App compila sem erros: yarn start / npm start
- [ ] [Critério específico 1]
- [ ] [Critério específico 2]
Commit: git commit -m "refactor(fase-N): [descrição]"
=== FASE N CONCLUÍDA ===
```

---

## FASE 0 — PREPARAÇÃO E AMBIENTE

### Propósito
Criar condições de segurança e rastreabilidade. Criar toda a estrutura de pastas vazia.

### O que NÃO é feito nesta fase
Não se move nenhuma linha de código do `App.jsx`.

### Passo 0.1 — Verificar .env e .gitignore
```bash
# Verificar se .gitignore tem .env
grep "^\.env" .gitignore || echo "ADICIONAR .env ao .gitignore"

# Verificar se variáveis Supabase estão em .env (não no código)
grep -r "supabase.co" src/ --include="*.js" --include="*.jsx" | grep -v "node_modules" | grep -v ".env"
# Se este comando mostrar resultados com URLs hardcoded, registar os ficheiros para tratar na Fase 2
```

### Passo 0.2 — Criar toda a estrutura de pastas
```bash
mkdir -p src/config
mkdir -p src/services
mkdir -p src/auth
mkdir -p src/hooks/state
mkdir -p src/hooks/business
mkdir -p src/utils
mkdir -p src/features/DataEntry/hooks
mkdir -p src/features/Dashboard/charts
mkdir -p src/features/Analise
mkdir -p src/features/Testes
mkdir -p src/features/Apresentacao/slides
mkdir -p src/features/ImportExport/hooks
mkdir -p src/features/Backoffice/Users
mkdir -p src/features/Backoffice/Roles
mkdir -p src/features/Backoffice/Audit
mkdir -p src/features/Backoffice/Settings
mkdir -p src/pages
mkdir -p src/components/layout
mkdir -p src/components/ui
mkdir -p src/components/feedback
mkdir -p src/components/form
mkdir -p src/router
```

### Passo 0.3 — Criar ficheiro logger.js
Criar o ficheiro `src/utils/logger.js` com o conteúdo exacto:

```javascript
// src/utils/logger.js
// Responsabilidade: logging controlado por ambiente de execução
// Em produção, logs de debug são silenciados automaticamente
// Máx. 25 linhas

const isDev = process.env.NODE_ENV === 'development';

export const log = (...args) => {
  if (isDev) console.log(...args);
};

export const warn = (...args) => {
  if (isDev) console.warn(...args);
};

export const error = (...args) => {
  // Sempre activo — erros nunca são silenciados
  console.error(...args);
};

export const group = (label, fn) => {
  if (isDev) {
    console.group(label);
    fn();
    console.groupEnd();
  }
};
```

### Passo 0.4 — Criar ficheiros stub para todos os módulos
Para cada ficheiro listado abaixo, criar com o conteúdo mínimo indicado.
Isto garante que imports futuros não quebram enquanto o código está a ser migrado.

**Ficheiros de config (stubs):**
```bash
# Criar cada ficheiro com comentário TODO
echo "// TODO: Fase 1 — Mover constantes de App.jsx" > src/config/constants.js
echo "// TODO: Fase 1 — Mover routesByPSM de App.jsx" > src/config/routeConfig.js
echo "// TODO: Fase 1 — Mover routeToProvince de App.jsx" > src/config/provinceConfig.js
echo "// TODO: Fase 1 — Mover quarterConfig de App.jsx" > src/config/quarterConfig.js
```

**Ficheiros de services (stubs):**
```bash
echo "// TODO: Fase 2 — Cliente Supabase centralizado" > src/services/supabaseClient.js
echo "// TODO: Fase 2 — CRUD de utilizadores" > src/services/userService.js
echo "// TODO: Fase 2 — Registo de auditoria" > src/services/auditService.js
echo "// TODO: Fase 2 — Abstracção localStorage" > src/services/localStorageService.js
```

**Ficheiros de auth (stubs):**
```bash
echo "// TODO: Fase 4 — AuthContext" > src/auth/AuthContext.jsx
echo "// TODO: Fase 4 — AuthProvider" > src/auth/AuthProvider.jsx
echo "// TODO: Fase 4 — ProtectedRoute" > src/auth/ProtectedRoute.jsx
echo "// TODO: Fase 4 — RoleGuard" > src/auth/RoleGuard.jsx
echo "// TODO: Fase 4 — useAuth hook" > src/auth/useAuth.js
echo "// TODO: Fase 4 — usePermissions hook" > src/auth/usePermissions.js
```

**Ficheiros de hooks/state (stubs):**
```bash
echo "// TODO: Fase 5 — Estado global da aplicação" > src/hooks/state/useAppState.js
echo "// TODO: Fase 5 — Sincronização Supabase + localStorage" > src/hooks/state/usePersistence.js
echo "// TODO: Fase 5 — Filtros de navegação" > src/hooks/state/useFilters.js
echo "// TODO: Fase 5 — Scroll do header" > src/hooks/state/useScrollHeader.js
```

**Ficheiros de hooks/business (stubs):**
```bash
echo "// TODO: Fase 6 — Cálculo do dashboard executivo" > src/hooks/business/useDashboard.js
echo "// TODO: Fase 6 — Classificação de rotas" > src/hooks/business/useClassificacao.js
echo "// TODO: Fase 6 — Alertas automáticos" > src/hooks/business/useAlertas.js
echo "// TODO: Fase 6 — Dados de testes e efetividade" > src/hooks/business/useTestes.js
echo "// TODO: Fase 6 — Série temporal para gráficos" > src/hooks/business/useTendencias.js
echo "// TODO: Fase 6 — Dados do gráfico circular" > src/hooks/business/usePieChart.js
echo "// TODO: Fase 6 — Intervenções e normalizações" > src/hooks/business/useIntervencoes.js
```

**Ficheiros de utils (stubs):**
```bash
echo "// TODO: Fase 3 — Utilitários de datas e quarters" > src/utils/dateUtils.js
echo "// TODO: Fase 3 — Utilitários de rotas" > src/utils/routeUtils.js
echo "// TODO: Fase 3 — Utilitários de valores de fibras" > src/utils/valueUtils.js
echo "// TODO: Fase 3 — Lógica de fibras dependentes" > src/utils/fibraLogic.js
echo "// TODO: Fase 3 — Import/Export CSV e Excel" > src/utils/exportImport.js
echo "// TODO: Fase 3 — Validação de inputs" > src/utils/validators.js
echo "// TODO: Fase 3 — Formatação de valores" > src/utils/formatters.js
```

**Ficheiros de pages (stubs):**
```bash
echo "// TODO: Fase 4 — Página de login" > src/pages/LoginPage.jsx
echo "// TODO: Fase 10 — Página principal (do antigo App.jsx)" > src/pages/MainPage.jsx
echo "// TODO: Fase 7 — Wrapper do backoffice" > src/pages/BackofficePage.jsx
echo "// TODO: Fase 10 — Página 404" > src/pages/NotFoundPage.jsx
```

**Ficheiros de router (stubs):**
```bash
echo "// TODO: Fase 10 — Definição de rotas" > src/router/routes.js
echo "// TODO: Fase 10 — Router principal" > src/router/AppRouter.jsx
echo "// TODO: Fase 10 — Guards de rota" > src/router/routeGuards.js
```

### Passo 0.5 — Verificar que o app ainda compila
```bash
npm run build 2>&1 | tail -20
# OU
yarn build 2>&1 | tail -20
```
O app deve compilar sem erros. Os ficheiros stub não afectam nada porque não são importados ainda.

### Verificação da Fase 0
- [ ] Todas as pastas criadas (`ls -la src/`)
- [ ] `src/utils/logger.js` criado com conteúdo completo
- [ ] Todos os ficheiros stub criados
- [ ] App compila sem erros
- [ ] Nenhuma linha de `App.jsx` foi alterada

```bash
git add -A
git commit -m "refactor(fase-0): criar estrutura de pastas e ficheiros stub"
```

---

## FASE 1 — CONFIGURAÇÃO E CONSTANTES

### Propósito
Extrair dados estáticos imutáveis do `App.jsx` para ficheiros de configuração dedicados.

### O que NÃO é feito nesta fase
Não se move nenhuma função, hook, ou componente. Apenas dados estáticos (objectos e arrays que nunca mudam).

### Passo 1.1 — Ler as linhas relevantes do App.jsx
```bash
sed -n '1,30p' src/App.jsx          # Verificar imports existentes
sed -n '18,22p' src/App.jsx          # CURRENT_DATA_VERSION
sed -n '255,270p' src/App.jsx        # quarterConfig e allWeeks
sed -n '265,280p' src/App.jsx        # statusCategories
sed -n '277,400p' src/App.jsx        # routesByPSM
sed -n '85,260p' src/App.jsx         # routeToProvince, provinceToOperator, operatorToProvinces
```

### Passo 1.2 — Criar src/config/constants.js
Ler as linhas 18 e 262–275 do App.jsx e criar:

```javascript
// src/config/constants.js
// Responsabilidade: constantes globais imutáveis da aplicação
// Não importar nenhum módulo React aqui
// Máx. 30 linhas

export const CURRENT_DATA_VERSION = 2;

export const ALL_WEEKS = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);

export const STATUS_CATEGORIES = [
  'Transporte',
  'Indisponíveis',
  'Total Reparadas',
  'Reconhecidas',
  'Dep. de Passagem de Cabo',
  'Dep. de Licença',
  'Dep. de Cutover',
];

export const ALL_OPERATORS = ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'];
```

**ATENÇÃO:** Copiar os valores EXACTOS do App.jsx. Não interpretar nem simplificar.

### Passo 1.3 — Criar src/config/quarterConfig.js
Ler as linhas 255–264 do App.jsx e criar:

```javascript
// src/config/quarterConfig.js
// Responsabilidade: configuração dos quarters anuais
// Máx. 20 linhas

export const QUARTER_CONFIG = {
  // Copiar o objecto quarterConfig EXACTO do App.jsx linha 255
  // Exemplo: Q1: { start: 1, end: 17 }
};
```

**Instrução para o agente:** Ler o objecto `quarterConfig` exacto do App.jsx (linha ~255) e reproduzir integralmente.

### Passo 1.4 — Criar src/config/routeConfig.js
Ler as linhas 277–396 do App.jsx e criar:

```javascript
// src/config/routeConfig.js
// Responsabilidade: lista de rotas por operador PSM
// Este é o único lugar onde se adicionam ou removem rotas
// Máx. 150 linhas

export const ROUTES_BY_PSM = {
  // Copiar o objecto routesByPSM EXACTO do App.jsx linhas 277-396
  // FIBRASOL: [...],
  // ISISTEL: [...],
  // ANGLOBAL: [...],
};
```

**Instrução para o agente:** Extrair o conteúdo completo do objecto `routesByPSM` sem omitir nenhuma rota.

### Passo 1.5 — Criar src/config/provinceConfig.js
Ler as linhas 89–253 do App.jsx e criar:

```javascript
// src/config/provinceConfig.js
// Responsabilidade: mapeamento entre rotas, províncias e operadores
// Máx. 200 linhas

export const ROUTE_TO_PROVINCE = {
  // Copiar routeToProvince EXACTO do App.jsx (linhas ~89-229)
};

export const PROVINCE_TO_OPERATOR = {
  // Copiar provinceToOperator EXACTO do App.jsx (linha ~231)
};

export const OPERATOR_TO_PROVINCES = {
  // Copiar operatorToProvinces EXACTO do App.jsx (linha ~244)
};
```

### Passo 1.6 — Actualizar App.jsx com imports e substituição de referências

No início do `App.jsx`, adicionar os imports dos novos módulos de config:
```javascript
import { CURRENT_DATA_VERSION, ALL_WEEKS, STATUS_CATEGORIES } from './config/constants';
import { QUARTER_CONFIG } from './config/quarterConfig';
import { ROUTES_BY_PSM } from './config/routeConfig';
import { ROUTE_TO_PROVINCE, PROVINCE_TO_OPERATOR, OPERATOR_TO_PROVINCES } from './config/provinceConfig';
```

Em seguida, dentro do componente `PSMMonitorApp`, remover as definições locais e substituir todas as referências:
- `routesByPSM` → `ROUTES_BY_PSM`
- `routeToProvince` → `ROUTE_TO_PROVINCE`
- `provinceToOperator` → `PROVINCE_TO_OPERATOR`
- `operatorToProvinces` → `OPERATOR_TO_PROVINCES`
- `quarterConfig` → `QUARTER_CONFIG`
- `allWeeks` → `ALL_WEEKS`
- `statusCategories` → `STATUS_CATEGORIES`
- `CURRENT_DATA_VERSION` → mantém o mesmo nome (já importado)

**Verificação:** Confirmar que nenhuma outra string ficou por substituir:
```bash
grep -n "const routesByPSM\|const routeToProvince\|const provinceToOperator\|const operatorToProvinces\|const quarterConfig\b\|const allWeeks\b\|const statusCategories" src/App.jsx
# Este comando não deve devolver resultados após a substituição
```

### Verificação da Fase 1
- [ ] `src/config/constants.js` criado com valores correctos
- [ ] `src/config/quarterConfig.js` criado com valores correctos
- [ ] `src/config/routeConfig.js` criado com todas as rotas
- [ ] `src/config/provinceConfig.js` criado com todos os mapeamentos
- [ ] `App.jsx` importa os novos módulos
- [ ] Todas as referências antigas substituídas
- [ ] App compila sem erros: `npm run build`
- [ ] Filtros de PSM e Província continuam a funcionar

```bash
git add -A
git commit -m "refactor(fase-1): extrair configuração e constantes para src/config/"
```

---

## FASE 2 — SERVIÇOS DE DADOS

### Propósito
Centralizar toda a comunicação com Supabase e localStorage numa camada de serviços sem React.

### O que NÃO é feito nesta fase
Não se move nenhum hook, estado React, ou componente UI.

### Passo 2.1 — Criar src/services/supabaseClient.js

```javascript
// src/services/supabaseClient.js
// Responsabilidade: única instância do cliente Supabase em toda a aplicação
// REGRA: Este é o ÚNICO ficheiro que importa @supabase/supabase-js
// Máx. 20 linhas

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[PSM Monitor] Variáveis de ambiente Supabase não configuradas.\n' +
    'Verificar: REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY no ficheiro .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Passo 2.2 — Actualizar supabaseService.js existente
Ler o conteúdo actual de `src/services/supabaseService.js` e:
- Substituir a criação interna do cliente Supabase pelo import de `supabaseClient.js`
- Não alterar nenhuma outra lógica

```javascript
// Adicionar no topo (ou substituir criação existente):
import { supabase } from './supabaseClient';
// Remover: import { createClient } from '@supabase/supabase-js';
// Remover: const supabase = createClient(...);
```

### Passo 2.3 — Actualizar supabaseDistribuicaoService.js existente
Mesma operação que 2.2 para `src/services/supabaseDistribuicaoService.js`.

### Passo 2.4 — Criar src/services/localStorageService.js
Ler as linhas 24–68 do `App.jsx` (função `cleanupLocalStorage`) e criar:

```javascript
// src/services/localStorageService.js
// Responsabilidade: abstracção do localStorage com versionamento
// Máx. 100 linhas

import { CURRENT_DATA_VERSION } from '../config/constants';

const PREFIX = 'psm_';

// Chaves tipadas — evita strings mágicas espalhadas pelo código
export const LS_KEYS = {
  DATA:         'rotas_data_v3',
  DISTRIBUICAO: 'distribuicao_reparacoes_v3',
  JUSTIFICATIVAS: 'justificativas_v1',
  TESTADAS:     'rotas_testadas_v2',
  VALIDADAS:    'rotas_validadas_v2',
  OPERATOR:     'selectedOperator',
  WEEK:         'selectedWeek',
  QUARTER:      'selectedQuarter',
  YEAR:         'selectedYear',
  VERSION:      'data_version',
};

export const lsGet = (key) => {
  try {
    const value = window.localStorage.getItem(PREFIX + key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const lsSet = (key, value) => {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('[localStorage] Erro ao guardar:', key, e);
  }
};

export const lsGetRaw = (key) => window.localStorage.getItem(key);
export const lsSetRaw = (key, value) => window.localStorage.setItem(key, value);
export const lsRemove = (key) => window.localStorage.removeItem(PREFIX + key);

// Copiar a função cleanupLocalStorage EXACTA do App.jsx (linhas 24-68)
// Renomear para cleanupOldData e adaptar para usar as constantes acima
export const cleanupOldData = () => {
  // [Conteúdo exacto da função cleanupLocalStorage do App.jsx]
};
```

**Instrução para o agente:** Ler a função `cleanupLocalStorage` do App.jsx (linhas 24–68) e copiar o corpo para `cleanupOldData`, mantendo a lógica exacta.

### Passo 2.5 — Criar src/services/userService.js

```javascript
// src/services/userService.js
// Responsabilidade: operações CRUD de perfis de utilizador
// Todas as funções são async e devolvem { data, error }
// Máx. 150 linhas

import { supabase } from './supabaseClient';

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const createUser = async (userData) => {
  // 1. Criar auth user via Supabase Admin (ou invite)
  // 2. Criar perfil em user_profiles
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([userData])
    .select()
    .single();
  return { data, error };
};

export const updateUser = async (id, updates) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deactivateUser = async (id) => {
  return updateUser(id, { is_active: false });
};

export const getUserPsmAccess = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('psm_access')
    .eq('id', userId)
    .single();
  return { data: data?.psm_access, error };
};

export const updateUserPsmAccess = async (userId, psmList) => {
  return updateUser(userId, { psm_access: psmList });
};
```

### Passo 2.6 — Criar src/services/auditService.js

```javascript
// src/services/auditService.js
// Responsabilidade: registo de auditoria de acções do utilizador
// Máx. 80 linhas

import { supabase } from './supabaseClient';

export const logAction = async ({ action, entity, entityId = null, oldValue = null, newValue = null }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_log').insert([{
      user_id:    user?.id,
      user_email: user?.email,
      action,
      entity,
      entity_id:  entityId,
      old_value:  oldValue,
      new_value:  newValue,
    }]);
  } catch {
    // Falha silenciosa — auditoria não deve bloquear operações principais
  }
};

export const getAuditLog = async ({ userId = null, entity = null, dateFrom = null, dateTo = null, page = 0, pageSize = 50 } = {}) => {
  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (userId) query = query.eq('user_id', userId);
  if (entity) query = query.eq('entity', entity);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error, count } = await query;
  return { data, error, count };
};
```

### Verificação da Fase 2
- [ ] `src/services/supabaseClient.js` criado
- [ ] `supabaseService.js` actualizado para usar `supabaseClient.js`
- [ ] `supabaseDistribuicaoService.js` actualizado para usar `supabaseClient.js`
- [ ] `localStorageService.js` criado com `cleanupOldData` e `LS_KEYS`
- [ ] `userService.js` criado
- [ ] `auditService.js` criado
- [ ] Nenhuma URL Supabase hardcoded no código: `grep -r "supabase.co" src/ | grep -v ".env"`
- [ ] App compila sem erros
- [ ] Dados sincronizam correctamente com Supabase

```bash
git add -A
git commit -m "refactor(fase-2): centralizar serviços de dados em src/services/"
```

---

## FASE 3 — UTILITÁRIOS PUROS

### Propósito
Extrair funções puras (sem efeitos secundários, sem estado React) para ficheiros utilitários testáveis.

### O que NÃO é feito nesta fase
Não se move nenhum `useState`, `useEffect`, `useMemo`, nem nenhum componente.

### Passo 3.1 — Criar src/utils/dateUtils.js
Ler do App.jsx e copiar exactamente (sem alterar a lógica):
- `getQuarterFromWeek(week)` — linha ~655
- `getWeeksForQuarter(quarter)` — linha ~1077
- `getQuarterAnterior(currentQuarter, currentYear)` — linha ~5236

```javascript
// src/utils/dateUtils.js
// Responsabilidade: cálculos relacionados com semanas, quarters e anos
// Todas as funções são puras — recebem parâmetros, devolvem valores
// Máx. 70 linhas

import { QUARTER_CONFIG } from '../config/quarterConfig';

// Copiar getQuarterFromWeek EXACTO do App.jsx
export const getQuarterFromWeek = (week) => {
  // [conteúdo exacto]
};

// Copiar getWeeksForQuarter EXACTO do App.jsx
export const getWeeksForQuarter = (quarter) => {
  // [conteúdo exacto]
};

// Copiar getQuarterAnterior EXACTO do App.jsx
export const getQuarterAnterior = (currentQuarter, currentYear) => {
  // [conteúdo exacto]
};
```

**Instrução para o agente:** Após criar o ficheiro, verificar que as funções exportadas têm o mesmo comportamento:
```bash
node -e "
const { getQuarterFromWeek } = require('./src/utils/dateUtils.js');
console.assert(getQuarterFromWeek('W1') === 'Q1', 'W1 deve ser Q1');
console.assert(getQuarterFromWeek('W18') === 'Q2', 'W18 deve ser Q2');
console.assert(getQuarterFromWeek('W36') === 'Q3', 'W36 deve ser Q3');
console.log('dateUtils OK');
"
```

### Passo 3.2 — Criar src/utils/routeUtils.js
Ler do App.jsx e copiar exactamente:
- `findPSMForRoute(routeName)` — linha ~1166
- `isRotaTestada(psm, semana, rota)` — linha ~666
- `isRotaValidada(psm, semana, rota)` — linha ~671
- `getSemanasTestadasNoQuarter(psm, rota, quarter)` — linha ~677
- `getSemanasValidadasNoQuarter(psm, rota, quarter)` — linha ~694
- `getSemanasTestadas(psm, rota)` — linha ~711
- `getSemanasValidadas(psm, rota)` — linha ~722
- `isRotaTestadaGlobalNoQuarter(psm, rota, quarter)` — linha ~734
- `isRotaValidadaGlobalNoQuarter(psm, rota, quarter)` — linha ~738
- `isRotaTestadaGlobal(psm, rota)` — linha ~742
- `isRotaValidadaGlobal(psm, rota)` — linha ~746

```javascript
// src/utils/routeUtils.js
// Responsabilidade: queries sobre o estado de rotas (testadas/validadas)
// ATENÇÃO: Funções que recebem rotasTestadas/rotasValidadas como parâmetro
//          NÃO acedem directamente ao estado — isso é intencional
// Máx. 130 linhas

import { ROUTES_BY_PSM } from '../config/routeConfig';
import { ALL_WEEKS } from '../config/constants';
import { QUARTER_CONFIG } from '../config/quarterConfig';

// [copiar cada função exactamente]
```

### Passo 3.3 — Criar src/utils/valueUtils.js
Ler do App.jsx e copiar exactamente:
- `buscarValorAnterior(psm, week, route, tipo)` — linha ~3209
- `getValorReduzido(psm, week, route, tipo)` — linha ~3256
- `getValorOriginal(psm, week, route, tipo)` — linha ~3284

```javascript
// src/utils/valueUtils.js
// Responsabilidade: obter valores de fibras com lógica de redução por prioridade
// ATENÇÃO: Estas funções recebem o objecto 'data' e 'distribuicaoReparacoes'
//          como parâmetro — não acedem a estado directamente
// Máx. 110 linhas
```

### Passo 3.4 — Criar src/utils/validators.js
Criar novo (não existe no App.jsx — é código novo):

```javascript
// src/utils/validators.js
// Responsabilidade: validação centralizada de todos os inputs do app
// Máx. 80 linhas

export const isValidNumericInput = (value) =>
  value === '' || /^\d+$/.test(String(value));

export const sanitizeNumericInput = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = parseInt(String(value).trim(), 10);
  return isNaN(num) || num < 0 ? '' : String(num);
};

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));

export const isValidPSM = (psm) =>
  ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'].includes(psm);

export const isValidWeek = (week) =>
  /^W([1-9]|[1-4]\d|5[0-2])$/.test(week);

export const isValidQuarter = (q) =>
  ['Q1', 'Q2', 'Q3'].includes(q);

export const isValidYear = (year) => {
  const num = parseInt(year, 10);
  return !isNaN(num) && num >= 2020 && num <= 2100;
};
```

### Passo 3.5 — Criar src/utils/formatters.js
Criar novo:

```javascript
// src/utils/formatters.js
// Responsabilidade: formatação de valores para exibição na UI
// Máx. 50 linhas

export const formatPercentage = (value, decimals = 1) =>
  `${Number(value).toFixed(decimals)}%`;

export const formatNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? '0' : num.toLocaleString('pt-AO');
};

export const formatWeekLabel = (week) =>
  week ? week.replace('W', 'Semana ') : '';

export const formatQuarterLabel = (quarter, year) =>
  quarter && year ? `${quarter} / ${year}` : '';
```

### Passo 3.6 — Criar src/utils/fibraLogic.js
**Esta é a extracção mais crítica da Fase 3.**

Ler as linhas 2900–3188 do App.jsx — o núcleo da lógica `handleInputChange`.
O objectivo é extrair o algoritmo de redução de fibras como uma função pura.

```javascript
// src/utils/fibraLogic.js
// Responsabilidade: algoritmo de redução automática de fibras dependentes
// Esta é a lógica de negócio mais crítica do PSM Monitor
// INPUT e OUTPUT claramente definidos — sem acesso a estado externo
// Máx. 220 linhas

import { QUARTER_CONFIG } from '../config/quarterConfig';

/**
 * Calcula o novo estado dos dados após uma alteração de input.
 * Função pura: recebe o estado actual, devolve o novo estado.
 *
 * @param {Object} params
 * @param {string} params.psm - Operador (FIBRASOL, ISISTEL, ANGLOBAL)
 * @param {string} params.week - Semana (W1..W52)
 * @param {string} params.route - Nome completo da rota
 * @param {string} params.category - Campo a alterar (ex: 'Total Reparadas')
 * @param {string} params.value - Novo valor (string, pode ser vazio)
 * @param {Object} params.currentData - Estado actual de data
 * @param {Object} params.distribuicaoReparacoes - Estado actual de distribuicao
 * @param {string} params.selectedQuarter - Quarter activo
 * @param {number} params.selectedYear - Ano activo
 * @param {number|null} params.valorOriginalRef - Valor antes de começar a editar
 * @param {Object|null} params.pendingRepairData - Distribuição pendente
 *
 * @returns {Object} { newData, shouldOpenModal, pendingRepairData, clearDistribuicao, weekToClean }
 */
export const calcularNovoEstadoFibras = (params) => {
  // [Copiar a lógica interna do handleInputChange do App.jsx, linhas 2900-3188]
  // Adaptar para função pura: em vez de chamar setData(), construir newData e devolver
  // Em vez de chamar setPendingRepairData(), devolver { shouldOpenModal, pendingRepairData }
};
```

**Instrução para o agente:** Esta extracção é a mais complexa. O padrão é:
1. Ler o corpo completo de `handleInputChange` do App.jsx
2. Separar a lógica de cálculo (que vai para fibraLogic.js) dos efeitos (que ficam no hook)
3. A função pura recebe todos os dados como parâmetros e devolve os novos valores
4. Quem chama a função é responsável por chamar `setData()`, `setPendingRepairData()`, etc.

### Passo 3.7 — Criar src/utils/exportImport.js
Ler do App.jsx e copiar exactamente:
- `loadXLSX()` — linha ~1196
- `processExcelFile(file)` — linha ~1214
- `processCSVFile(file)` — linha ~1441
- `handleSaveData()` — linha ~2008 (a parte de geração de CSV)
- `handleExportJSON(data, selectedYear)` — linha ~2577
- Função de geração de CSV para download — linhas ~2610–2775
- `handleExportJustificativasCSV(justificativas, selectedYear)` — linha ~2783

```javascript
// src/utils/exportImport.js
// Responsabilidade: parse de ficheiros de entrada e geração de ficheiros de saída
// Máx. 280 linhas — se ultrapassar, dividir em importUtils.js e exportUtils.js
```

### Passo 3.8 — Actualizar App.jsx com imports dos utilitários
Adicionar imports no topo do App.jsx:
```javascript
import { getQuarterFromWeek, getWeeksForQuarter, getQuarterAnterior } from './utils/dateUtils';
import { findPSMForRoute, isRotaTestada, isRotaValidada, /* ... restantes */ } from './utils/routeUtils';
import { getValorReduzido, getValorOriginal, buscarValorAnterior } from './utils/valueUtils';
import { isValidNumericInput } from './utils/validators';
import { calcularNovoEstadoFibras } from './utils/fibraLogic';
import { processExcelFile, processCSVFile, handleExportJSON } from './utils/exportImport';
```

Remover as definições locais correspondentes do App.jsx.

### Verificação da Fase 3
- [ ] Todos os ficheiros utilitários criados
- [ ] Cada ficheiro tem responsabilidade única
- [ ] Nenhuma função importa React (são funções puras)
- [ ] App compila sem erros
- [ ] Importação de ficheiros Excel funciona
- [ ] Importação de ficheiros CSV funciona
- [ ] Exportação de dados funciona
- [ ] Cálculo de fibras dependentes funciona (testar: editar Total Reparadas numa rota)

```bash
git add -A
git commit -m "refactor(fase-3): extrair funções puras para src/utils/"
```

---

## FASE 4 — AUTENTICAÇÃO E GESTÃO DE UTILIZADORES

### Propósito
Introduzir a camada de autenticação usando Supabase Auth. Funcionalidade nova — não altera nada existente.

### Pré-requisito
Confirmar que as seguintes tabelas existem no Supabase antes de continuar:
```sql
-- Verificar no painel Supabase ou via API:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
Se `user_profiles`, `audit_log` e `app_settings` não existirem, criar com o SQL do Ponto 3.1 do documento `PSM_Monitor_Plano_Modular.md`.

### Passo 4.1 — Criar src/auth/AuthContext.jsx

```jsx
// src/auth/AuthContext.jsx
// Responsabilidade: providenciar o contexto de autenticação
// Máx. 15 linhas

import { createContext } from 'react';

export const AuthContext = createContext(null);
```

### Passo 4.2 — Criar src/auth/AuthProvider.jsx

```jsx
// src/auth/AuthProvider.jsx
// Responsabilidade: inicializar sessão Supabase e gerir estado de autenticação
// Expõe: { user, profile, session, loading, signIn, signOut }
// Máx. 100 linhas

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { getUserById } from '../services/userService';
import { logAction } from '../services/auditService';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId) => {
    const { data } = await getUserById(userId);
    setProfile(data);
  };

  useEffect(() => {
    // Obter sessão actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    // Subscrever a mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await loadProfile(session.user.id);
          if (event === 'SIGNED_IN') {
            await logAction({ action: 'LOGIN', entity: 'auth', entityId: session.user.id });
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await logAction({ action: 'LOGOUT', entity: 'auth' });
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut, user: session?.user }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Passo 4.3 — Criar src/auth/useAuth.js

```javascript
// src/auth/useAuth.js
// Responsabilidade: interface limpa para consumir AuthContext
// Uso: const { user, profile, signIn, signOut } = useAuth();
// Máx. 20 linhas

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
```

### Passo 4.4 — Criar src/auth/usePermissions.js

```javascript
// src/auth/usePermissions.js
// Responsabilidade: verificar permissões de forma declarativa baseada no role
// Máx. 60 linhas

import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { profile } = useAuth();
  const role = profile?.role ?? 'viewer';
  const psmAccess = profile?.psm_access ?? [];

  return {
    role,
    psmAccess,
    canEdit:             ['admin', 'manager', 'operator'].includes(role),
    canImport:           ['admin', 'manager', 'operator'].includes(role),
    canExport:           ['admin', 'manager', 'viewer'].includes(role),
    canAccessBackoffice: role === 'admin',
    canManageUsers:      role === 'admin',
    canViewAllPSMs:      ['admin', 'manager'].includes(role),
    isAdmin:             role === 'admin',
    isManager:           role === 'manager',
    isOperator:          role === 'operator',
    isViewer:            role === 'viewer',
    hasPsmAccess: (psm) => ['admin', 'manager'].includes(role) || psmAccess.includes(psm),
  };
};
```

### Passo 4.5 — Criar src/auth/ProtectedRoute.jsx

```jsx
// src/auth/ProtectedRoute.jsx
// Responsabilidade: redirecionar para /login se utilizador não autenticado
// Máx. 25 linhas

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
```

### Passo 4.6 — Criar src/auth/RoleGuard.jsx

```jsx
// src/auth/RoleGuard.jsx
// Responsabilidade: redirecionar se role insuficiente para a rota
// Uso: <RoleGuard allowedRoles={['admin']}><BackofficePage /></RoleGuard>
// Máx. 35 linhas

import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from './usePermissions';

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { role } = usePermissions();

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h1>
        <p className="text-gray-600 mb-6">
          Não tens permissão para aceder a esta área.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};
```

### Passo 4.7 — Criar pages/LoginPage.jsx

```jsx
// src/pages/LoginPage.jsx
// Responsabilidade: formulário de autenticação (email + password)
// Máx. 150 linhas

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError('Email ou password incorrectos.');
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">PSM Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">Performance & Service Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="utilizador@empresa.ao"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'A autenticar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
```

### Passo 4.8 — Instalar react-router-dom se não instalado
```bash
npm list react-router-dom 2>/dev/null || npm install react-router-dom
```

### Verificação da Fase 4
- [ ] `AuthProvider`, `AuthContext`, `useAuth`, `usePermissions` criados
- [ ] `ProtectedRoute` e `RoleGuard` criados
- [ ] `LoginPage` criada
- [ ] App compila sem erros
- [ ] **NÃO integrar ainda no App.jsx** — isso é feito na Fase 10
- [ ] Testar os ficheiros existem: `ls src/auth/`

```bash
git add -A
git commit -m "refactor(fase-4): criar camada de autenticação e controlo de acesso"
```

---

## FASE 5 — HOOKS DE ESTADO

### Propósito
Extrair os 47 useState e os useEffect de sincronização do App.jsx para hooks dedicados.

### O que NÃO é feito nesta fase
Não se move nenhum useMemo de cálculo de negócio. Não se move nenhum componente UI.

### Passo 5.1 — Criar src/hooks/state/useFilters.js
Ler do App.jsx e mover:
- `selectedOperator` e `setSelectedOperator` (linha ~475)
- `selectedWeek` e `setSelectedWeek` (linha ~479)
- `selectedQuarter` e `setSelectedQuarter` (linha ~482)
- `selectedYear` e `setSelectedYear` (linha ~485)
- `selectedProvince` e `setSelectedProvince` (linha ~1050)
- Os `useEffect` que guardam filtros no localStorage (linhas ~496–510)

```javascript
// src/hooks/state/useFilters.js
// Responsabilidade: estado e persistência dos filtros de navegação do app
// Máx. 90 linhas

import { useState, useEffect } from 'react';
import { lsGetRaw, lsSetRaw } from '../../services/localStorageService';

export const useFilters = () => {
  const [selectedOperator, setSelectedOperator] = useState(
    () => localStorage.getItem('psm_selectedOperator') || 'FIBRASOL'
  );
  const [selectedWeek, setSelectedWeek] = useState(
    () => localStorage.getItem('psm_selectedWeek') || 'W1'
  );
  const [selectedQuarter, setSelectedQuarter] = useState(
    () => localStorage.getItem('psm_selectedQuarter') || 'Q1'
  );
  const [selectedYear, setSelectedYear] = useState(
    () => parseInt(localStorage.getItem('psm_selectedYear')) || new Date().getFullYear()
  );
  const [selectedProvince, setSelectedProvince] = useState('Todas');

  // Persistir no localStorage — copiar os useEffects EXACTOS do App.jsx
  useEffect(() => { localStorage.setItem('psm_selectedOperator', selectedOperator); }, [selectedOperator]);
  useEffect(() => { localStorage.setItem('psm_selectedWeek', selectedWeek); }, [selectedWeek]);
  useEffect(() => { localStorage.setItem('psm_selectedQuarter', selectedQuarter); }, [selectedQuarter]);
  useEffect(() => { localStorage.setItem('psm_selectedYear', String(selectedYear)); }, [selectedYear]);

  return {
    selectedOperator, setSelectedOperator,
    selectedWeek, setSelectedWeek,
    selectedQuarter, setSelectedQuarter,
    selectedYear, setSelectedYear,
    selectedProvince, setSelectedProvince,
  };
};
```

### Passo 5.2 — Criar src/hooks/state/useAppState.js
Mover do App.jsx os estados de dados e UI:

```javascript
// src/hooks/state/useAppState.js
// Responsabilidade: estado central dos dados e UI do app
// Máx. 180 linhas (muitos estados relacionados)

import { useState, useRef } from 'react';

export const useAppState = () => {
  // --- DADOS PRINCIPAIS ---
  const [data, setData] = useState(() => {
    // Copiar a função de inicialização EXACTA do App.jsx (linha ~397-435)
  });

  const [distribuicaoReparacoes, setDistribuicaoReparacoes] = useState(() => {
    // Copiar a função de inicialização EXACTA do App.jsx (linha ~436-452)
  });

  const [justificativas, setJustificativas] = useState(() => {
    // Copiar a função de inicialização EXACTA do App.jsx (linha ~453-465)
  });

  const [rotasTestadas, setRotasTestadas] = useState(() => {
    // Copiar EXACTO do App.jsx (linha ~604)
  });

  const [rotasValidadas, setRotasValidadas] = useState(() => {
    // Copiar EXACTO do App.jsx (linha ~616)
  });

  // --- ESTADOS DE UI ---
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [manualDataExpanded, setManualDataExpanded] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const [alertasLidos, setAlertasLidos] = useState([]);
  const [efetividadeMode, setEfetividadeMode] = useState('global');
  const [showTestesAnalises, setShowTestesAnalises] = useState(false);
  const [tabelaValidacaoAberta, setTabelaValidacaoAberta] = useState(false);

  // --- ESTADOS DO MODAL DE REPARAÇÃO ---
  const [showModal, setShowModal] = useState(false);
  const [selectedRota, setSelectedRota] = useState(null);
  const [showRepairTypeModal, setShowRepairTypeModal] = useState(false);
  const [pendingRepairData, setPendingRepairData] = useState(null);
  const modalTimerRef = useRef(null);
  const valorOriginalRef = useRef(null);
  const skipNextSaveRef = useRef(false);

  // --- ESTADOS DE STATUS DRILLDOWN ---
  const [showStatusDrilldown, setShowStatusDrilldown] = useState(false);
  const [selectedStatusDrilldown, setSelectedStatusDrilldown] = useState(null);

  // --- PAGINAÇÃO ---
  const [currentPageDrilldown, setCurrentPageDrilldown] = useState(0);
  const [currentPageAcomp, setCurrentPageAcomp] = useState(0);
  const [currentPageNormalizadas, setCurrentPageNormalizadas] = useState(0);
  const [currentPageIntervencoes, setCurrentPageIntervencoes] = useState(0);
  const [currentPageSemIntervencao, setCurrentPageSemIntervencao] = useState(0);

  // --- VISUALIZAÇÃO DOS GRÁFICOS ---
  const [viewMode, setViewMode] = useState('carousel');
  const [viewModeClassificacao, setViewModeClassificacao] = useState('all');
  const [currentGraph, setCurrentGraph] = useState(0);
  const [currentGraphClassificacao, setCurrentGraphClassificacao] = useState(0);

  // --- FEEDBACK DE GRAVAÇÃO ---
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // --- HOVER E TOOLTIP ---
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null);
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // --- LOADING ---
  const [isLoadingDistribuicao, setIsLoadingDistribuicao] = useState(false);
  const lastSavedDistribuicaoRef = useRef(null);
  const saveDistribuicaoTimerRef = useRef(null);

  return {
    // Dados
    data, setData,
    distribuicaoReparacoes, setDistribuicaoReparacoes,
    justificativas, setJustificativas,
    rotasTestadas, setRotasTestadas,
    rotasValidadas, setRotasValidadas,
    // UI
    isMobileDevice, setIsMobileDevice,
    showMobileWarning, setShowMobileWarning,
    menuOpen, setMenuOpen,
    manualDataExpanded, setManualDataExpanded,
    presentationMode, setPresentationMode,
    currentSlide, setCurrentSlide,
    alertasAbertos, setAlertasAbertos,
    alertasLidos, setAlertasLidos,
    efetividadeMode, setEfetividadeMode,
    showTestesAnalises, setShowTestesAnalises,
    tabelaValidacaoAberta, setTabelaValidacaoAberta,
    // Modal
    showModal, setShowModal,
    selectedRota, setSelectedRota,
    showRepairTypeModal, setShowRepairTypeModal,
    pendingRepairData, setPendingRepairData,
    modalTimerRef, valorOriginalRef, skipNextSaveRef,
    // Drilldown
    showStatusDrilldown, setShowStatusDrilldown,
    selectedStatusDrilldown, setSelectedStatusDrilldown,
    // Paginação
    currentPageDrilldown, setCurrentPageDrilldown,
    currentPageAcomp, setCurrentPageAcomp,
    currentPageNormalizadas, setCurrentPageNormalizadas,
    currentPageIntervencoes, setCurrentPageIntervencoes,
    currentPageSemIntervencao, setCurrentPageSemIntervencao,
    // Gráficos
    viewMode, setViewMode,
    viewModeClassificacao, setViewModeClassificacao,
    currentGraph, setCurrentGraph,
    currentGraphClassificacao, setCurrentGraphClassificacao,
    // Feedback
    saveStatus, setSaveStatus,
    lastSaveTime, setLastSaveTime,
    isLoadingDistribuicao, setIsLoadingDistribuicao,
    lastSavedDistribuicaoRef, saveDistribuicaoTimerRef,
    // Tooltip
    hoveredPieSlice, setHoveredPieSlice,
    hoveredWeekIndex, setHoveredWeekIndex,
    tooltipData, setTooltipData,
    tooltipPosition, setTooltipPosition,
  };
};
```

### Passo 5.3 — Criar src/hooks/state/usePersistence.js
Mover os useEffects de sincronização das linhas 1698–1975 do App.jsx:

```javascript
// src/hooks/state/usePersistence.js
// Responsabilidade: sincronização automática entre estado, localStorage e Supabase
// ATENÇÃO CRÍTICA: Manter a ORDEM EXACTA dos useEffects do App.jsx original
// Máx. 160 linhas

import { useEffect, useRef } from 'react';
import { lerTudoDoSupabase, salvarTudoNoSupabase, salvarJustificativasNoSupabase, lerJustificativasDoSupabase } from '../../services/supabaseService';
import { salvarDistribuicaoNoSupabase, carregarDistribuicaoDoSupabase } from '../../services/supabaseDistribuicaoService';
import { getQuarterFromWeek } from '../../utils/dateUtils';
import { QUARTER_CONFIG } from '../../config/quarterConfig';

export const usePersistence = ({
  data, setData,
  justificativas, setJustificativas,
  distribuicaoReparacoes, setDistribuicaoReparacoes,
  rotasTestadas, setRotasTestadas,
  rotasValidadas, setRotasValidadas,
  selectedYear, selectedQuarter, selectedOperator,
  setSaveStatus, setLastSaveTime, setIsLoadingDistribuicao,
  lastSavedDistribuicaoRef, saveDistribuicaoTimerRef,
  skipNextSaveRef,
}) => {
  // IMPORTANTE: Copiar os useEffects das linhas 1698-1975 do App.jsx
  // Manter exactamente a mesma ordem
  // useEffect #1: Carregar dados do Supabase ao iniciar / mudar de ano
  // useEffect #2: Salvar data no localStorage + Supabase (com debounce)
  // useEffect #3: Salvar justificativas no Supabase
  // useEffect #4: Carregar e salvar distribuição (com debounce)
  // useEffect #5: Salvar rotasTestadas e rotasValidadas no localStorage
};
```

### Passo 5.4 — Criar src/hooks/state/useScrollHeader.js
Mover as linhas 762–799 do App.jsx:

```javascript
// src/hooks/state/useScrollHeader.js
// Responsabilidade: mostrar/esconder header ao scroll
// Máx. 45 linhas

import { useState, useRef, useEffect } from 'react';

export const useScrollHeader = () => {
  const scrollContainerRef = useRef(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    // Copiar o useEffect de scroll EXACTO do App.jsx (linhas ~773-799)
  });

  return { scrollContainerRef, headerVisible };
};
```

### Passo 5.5 — Actualizar App.jsx
Adicionar imports dos novos hooks e chamar cada um no início do componente:

```javascript
import { useFilters } from './hooks/state/useFilters';
import { useAppState } from './hooks/state/useAppState';
import { usePersistence } from './hooks/state/usePersistence';
import { useScrollHeader } from './hooks/state/useScrollHeader';

const PSMMonitorApp = () => {
  const filters = useFilters();
  const appState = useAppState();
  const { scrollContainerRef, headerVisible } = useScrollHeader();
  usePersistence({ ...appState, ...filters });
  
  // Remover os useState e useEffects migrados
  // Substituir referências: selectedOperator -> filters.selectedOperator
  // ... etc para todos os estados migrados
```

### Verificação da Fase 5
- [ ] `useFilters`, `useAppState`, `usePersistence`, `useScrollHeader` criados
- [ ] Estados migrados correctamente
- [ ] Filtros persistem ao recarregar a página
- [ ] Dados sincronizam com Supabase ao editar
- [ ] Scroll do header funciona
- [ ] App compila sem erros

```bash
git add -A
git commit -m "refactor(fase-5): extrair hooks de estado para src/hooks/state/"
```

---

## FASE 6 — HOOKS DE LÓGICA DE NEGÓCIO

### Propósito
Extrair cada useMemo complexo para um hook dedicado com responsabilidade única.

### Regra desta fase
Cada hook recebe parâmetros explícitos. Nunca o objecto `state` inteiro.

### Passo 6.1 — Criar src/hooks/business/useDashboard.js
Mover as linhas 3289–3706 do App.jsx (useMemo da FASE 11):

```javascript
// src/hooks/business/useDashboard.js
// Responsabilidade: calcular KPIs do dashboard executivo
// Máx. 220 linhas

import { useMemo } from 'react';
import { getValorReduzido } from '../../utils/valueUtils';
import { QUARTER_CONFIG } from '../../config/quarterConfig';

export const useDashboard = ({ data, routesByPSM, selectedOperator, selectedWeek, selectedQuarter, selectedYear, rotasValidadas, distribuicaoReparacoes, selectedProvince, routeToProvince }) => {
  const executiveDashboard = useMemo(() => {
    // Copiar o useMemo exacto do App.jsx (linhas 3289-3706)
    // Mover getValorReduzido de dentro do useMemo para chamar da função importada
  }, [data, selectedOperator, selectedWeek, selectedQuarter, selectedYear, rotasValidadas, distribuicaoReparacoes, selectedProvince]);

  return { executiveDashboard };
};
```

### Passo 6.2 — Criar src/hooks/business/useClassificacao.js
Mover as linhas 4670–4770 (useMemo FASE 15):

```javascript
// src/hooks/business/useClassificacao.js
// Responsabilidade: classificar rotas em Degradadas, Com Ganho, Estáveis
// Máx. 110 linhas

import { useMemo } from 'react';

export const useClassificacao = ({ data, selectedOperator, selectedWeek, selectedQuarter, selectedYear, selectedProvince, routeToProvince }) => {
  const { degradadas, comGanho, estaveis } = useMemo(() => {
    // Copiar useMemo exacto do App.jsx (FASE 15, linhas ~4680-4770)
  }, [data, selectedOperator, selectedWeek, selectedQuarter, selectedYear, selectedProvince]);

  return { degradadas, comGanho, estaveis };
};
```

### Passo 6.3 — Criar src/hooks/business/useAlertas.js
Mover linha ~4403:

```javascript
// src/hooks/business/useAlertas.js
// Responsabilidade: detectar automaticamente alertas e anomalias nas rotas
// Máx. 130 linhas

import { useMemo } from 'react';

export const useAlertas = ({ data, selectedOperator, selectedQuarter, selectedYear, alertasLidos }) => {
  const alertas = useMemo(() => {
    // Copiar useMemo exacto do App.jsx (linha ~4403)
  }, [data, selectedOperator, selectedQuarter, selectedYear]);

  const alertasNaoLidos = alertas.filter(a => !alertasLidos.includes(a.id));

  return { alertas, alertasNaoLidos };
};
```

### Passo 6.4 — Criar src/hooks/business/useTestes.js
Mover as linhas 800–1032 (useEffect de cálculo de testesData):

```javascript
// src/hooks/business/useTestes.js
// Responsabilidade: calcular efetividade de testes por PSM e totais globais
// Máx. 160 linhas

import { useState, useEffect } from 'react';

export const useTestes = ({ data, rotasTestadas, rotasValidadas, selectedOperator, selectedQuarter, selectedYear, routesByPSM }) => {
  const [testesData, setTestesData] = useState({ /* estado inicial EXACTO do App.jsx linha ~580 */ });
  const [todosTestesData, setTodosTestesData] = useState({ /* estado inicial EXACTO linha ~596 */ });

  useEffect(() => {
    // Copiar o useEffect de cálculo EXACTO do App.jsx (linhas ~800-1032)
  }, [data, rotasTestadas, rotasValidadas, selectedOperator, selectedQuarter, selectedYear]);

  return { testesData, todosTestesData };
};
```

### Passo 6.5 — Criar src/hooks/business/useTendencias.js
Mover as linhas 4900–5053 (useMemo FASE 16):

```javascript
// src/hooks/business/useTendencias.js
// Responsabilidade: calcular série temporal para gráfico de tendências
// Máx. 110 linhas

import { useMemo } from 'react';

export const useTendencias = ({ data, selectedOperator, selectedQuarter, selectedYear, distribuicaoReparacoes }) => {
  const trendData = useMemo(() => {
    // Copiar useMemo exacto do App.jsx (FASE 16, linhas ~4900-5053)
  }, [data, selectedOperator, selectedQuarter, selectedYear, distribuicaoReparacoes]);

  return { trendData };
};
```

### Passo 6.6 — Criar src/hooks/business/usePieChart.js
Mover as linhas 5054–5210:

```javascript
// src/hooks/business/usePieChart.js
// Responsabilidade: calcular dados para o gráfico circular de anel duplo
// Máx. 110 linhas

import { useMemo } from 'react';

export const usePieChart = ({ data, selectedOperator, selectedWeek, selectedQuarter, selectedYear, distribuicaoReparacoes, selectedProvince, routeToProvince }) => {
  const pieData = useMemo(() => {
    // Copiar useMemo exacto do App.jsx (FASE 14, linhas ~5054-5210)
  }, [data, selectedOperator, selectedWeek, selectedQuarter, selectedYear, distribuicaoReparacoes, selectedProvince]);

  return { pieData };
};
```

### Passo 6.7 — Criar src/hooks/business/useIntervencoes.js
Mover linhas ~4084, ~4187 e ~4400:

```javascript
// src/hooks/business/useIntervencoes.js
// Responsabilidade: calcular listas de intervenções, normalizações e rotas sem intervenção
// Máx. 130 linhas

import { useMemo } from 'react';

export const useIntervencoes = ({ data, selectedOperator, selectedWeek, selectedQuarter, selectedYear, rotasValidadas, selectedProvince, routeToProvince }) => {
  const intervencoesRecentes = useMemo(() => {
    // Copiar useMemo EXACTO do App.jsx (linha ~4084)
  }, [data, selectedOperator, selectedWeek, selectedQuarter, selectedYear]);

  const rotasNormalizadas = useMemo(() => {
    // Copiar useMemo EXACTO do App.jsx (linha ~4187)
  }, [data, selectedOperator, selectedWeek, selectedQuarter, selectedYear]);

  const rotasSemIntervencao = useMemo(() => {
    // Copiar useMemo EXACTO do App.jsx (linha ~4400)
  }, [data, selectedOperator, selectedWeek, selectedQuarter, selectedYear]);

  return { intervencoesRecentes, rotasNormalizadas, rotasSemIntervencao };
};
```

### Verificação da Fase 6
- [ ] 7 hooks de negócio criados
- [ ] Dashboard executivo mostra valores correctos
- [ ] Classificação de rotas correcta (Degradadas/Ganho/Estáveis)
- [ ] Alertas detectados automaticamente
- [ ] Gráfico de tendências com dados correctos
- [ ] Pie chart com percentagens correctas
- [ ] App compila sem erros

```bash
git add -A
git commit -m "refactor(fase-6): extrair lógica de negócio para src/hooks/business/"
```

---

## FASE 7 — BACKOFFICE

### Propósito
Criar módulo de administração completo. Funcionalidade nova, não interfere com nada existente.

### Passo 7.1 — Criar src/features/Backoffice/Users/useUsers.js

```javascript
// src/features/Backoffice/Users/useUsers.js
// Responsabilidade: estado e operações CRUD de utilizadores no backoffice
// Máx. 110 linhas

import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deactivateUser } from '../../../services/userService';
import { logAction } from '../../../services/auditService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getUsers();
    if (error) setError(error.message);
    else setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreateUser = async (userData) => {
    const { data, error } = await createUser(userData);
    if (!error) {
      await logAction({ action: 'CREATE', entity: 'user_profiles', entityId: data?.id, newValue: userData });
      await loadUsers();
    }
    return { data, error };
  };

  const handleUpdateUser = async (id, updates) => {
    const old = users.find(u => u.id === id);
    const { data, error } = await updateUser(id, updates);
    if (!error) {
      await logAction({ action: 'UPDATE', entity: 'user_profiles', entityId: id, oldValue: old, newValue: updates });
      await loadUsers();
    }
    return { data, error };
  };

  const handleDeactivateUser = async (id) => {
    const old = users.find(u => u.id === id);
    const { data, error } = await deactivateUser(id);
    if (!error) {
      await logAction({ action: 'DELETE', entity: 'user_profiles', entityId: id, oldValue: old });
      await loadUsers();
    }
    return { data, error };
  };

  return {
    users, loading, error,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deactivateUser: handleDeactivateUser,
    reload: loadUsers,
  };
};
```

### Passo 7.2 — Criar src/features/Backoffice/Users/UserList.jsx

```jsx
// src/features/Backoffice/Users/UserList.jsx
// Responsabilidade: tabela de utilizadores com acções
// Máx. 150 linhas

import React, { useState } from 'react';

const ROLE_LABELS = { admin: 'Administrador', manager: 'Gestor', operator: 'Operador', viewer: 'Visualizador' };
const ROLE_COLORS = { admin: 'bg-red-100 text-red-700', manager: 'bg-blue-100 text-blue-700', operator: 'bg-green-100 text-green-700', viewer: 'bg-gray-100 text-gray-600' };

const UserList = ({ users, onEdit, onDeactivate, loading }) => {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-8 text-gray-500">A carregar utilizadores...</div>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou email..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome', 'Email', 'Role', 'PSMs', 'Estado', 'Acções'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{(user.psm_access || []).join(', ') || 'Todos'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm space-x-2">
                  <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                  {user.is_active && (
                    <button onClick={() => onDeactivate(user.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Desactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-6 text-gray-500 text-sm">Nenhum utilizador encontrado.</div>}
      </div>
    </div>
  );
};

export default UserList;
```

### Passo 7.3 — Criar src/features/Backoffice/Users/UserForm.jsx

```jsx
// src/features/Backoffice/Users/UserForm.jsx
// Responsabilidade: formulário de criação/edição de utilizador
// Máx. 150 linhas

import React, { useState, useEffect } from 'react';

const ALL_PSM = ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'];

const UserForm = ({ user, onSave, onCancel }) => {
  const [form, setForm] = useState({
    full_name: '', email: '', role: 'viewer', psm_access: [], is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || '', email: user.email || '', role: user.role || 'viewer', psm_access: user.psm_access || [], is_active: user.is_active !== false });
  }, [user]);

  const togglePsm = (psm) => {
    setForm(f => ({ ...f, psm_access: f.psm_access.includes(psm) ? f.psm_access.filter(p => p !== psm) : [...f.psm_access, psm] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await onSave(form);
    if (error) { setError(error.message || 'Erro ao guardar.'); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{user ? 'Editar Utilizador' : 'Novo Utilizador'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input type="text" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required disabled={!!user} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="viewer">Visualizador</option>
              <option value="operator">Operador</option>
              <option value="manager">Gestor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Acesso a PSMs</label>
            <div className="flex gap-3">
              {ALL_PSM.map(psm => (
                <label key={psm} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.psm_access.includes(psm)} onChange={() => togglePsm(psm)} className="rounded" />
                  {psm}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Admin e Gestor têm acesso a todos automaticamente.</p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium">{saving ? 'A guardar...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
```

### Passo 7.4 — Criar src/features/Backoffice/Audit/useAuditLog.js

```javascript
// src/features/Backoffice/Audit/useAuditLog.js
// Máx. 70 linhas

import { useState, useEffect, useCallback } from 'react';
import { getAuditLog } from '../../../services/auditService';

export const useAuditLog = (filters = {}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await getAuditLog({ ...filters, page });
    setLogs(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  return { logs, loading, total, page, setPage, reload: load };
};
```

### Passo 7.5 — Criar src/features/Backoffice/Audit/AuditLog.jsx

```jsx
// src/features/Backoffice/Audit/AuditLog.jsx
// Responsabilidade: tabela de auditoria com filtros
// Máx. 150 linhas

import React, { useState } from 'react';
import { useAuditLog } from './useAuditLog';

const ACTION_COLORS = { CREATE: 'text-green-700 bg-green-50', UPDATE: 'text-blue-700 bg-blue-50', DELETE: 'text-red-700 bg-red-50', LOGIN: 'text-purple-700 bg-purple-50', EXPORT: 'text-amber-700 bg-amber-50' };

const AuditLog = () => {
  const [filters, setFilters] = useState({});
  const { logs, loading, total, page, setPage } = useAuditLog(filters);
  const pageSize = 50;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Registo de Auditoria</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Data/Hora', 'Utilizador', 'Acção', 'Entidade', 'Detalhe'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">A carregar...</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(log.created_at).toLocaleString('pt-AO')}</td>
                <td className="px-4 py-3 text-gray-900">{log.user_email || '—'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action}</span></td>
                <td className="px-4 py-3 text-gray-600">{log.entity}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{log.entity_id || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>{total} registos</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
          <button onClick={() => setPage(p => p+1)} disabled={(page+1)*pageSize >= total} className="px-3 py-1 border rounded disabled:opacity-40">Seguinte</button>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
```

### Passo 7.6 — Criar src/features/Backoffice/BackofficeLayout.jsx

```jsx
// src/features/Backoffice/BackofficeLayout.jsx
// Responsabilidade: layout do backoffice com navegação lateral
// Máx. 80 linhas

import React, { useState } from 'react';
import { useUsers } from './Users/useUsers';
import UserList from './Users/UserList';
import UserForm from './Users/UserForm';
import AuditLog from './Audit/AuditLog';

const TABS = [
  { id: 'users', label: '👥 Utilizadores' },
  { id: 'audit', label: '📋 Auditoria' },
  { id: 'settings', label: '⚙️ Configurações' },
];

const BackofficeLayout = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { users, loading, createUser, updateUser, deactivateUser } = useUsers();

  const handleSave = async (data) => {
    const result = editingUser ? await updateUser(editingUser.id, data) : await createUser(data);
    if (!result.error) { setShowForm(false); setEditingUser(null); }
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Backoffice — PSM Monitor</h1>
        <a href="/" className="text-sm text-blue-600 hover:text-blue-800">← Voltar ao App</a>
      </div>
      <div className="flex">
        <div className="w-48 bg-white border-r border-gray-200 min-h-screen p-4">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>{tab.label}</button>
            ))}
          </nav>
        </div>
        <div className="flex-1 p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Utilizadores</h2>
                <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ Novo Utilizador</button>
              </div>
              <UserList users={users} loading={loading} onEdit={u => { setEditingUser(u); setShowForm(true); }} onDeactivate={deactivateUser} />
            </div>
          )}
          {activeTab === 'audit' && <AuditLog />}
          {activeTab === 'settings' && <div className="text-gray-500 text-sm">Configurações — em desenvolvimento</div>}
        </div>
      </div>
      {showForm && <UserForm user={editingUser} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingUser(null); }} />}
    </div>
  );
};

export default BackofficeLayout;
```

### Passo 7.7 — Criar src/pages/BackofficePage.jsx

```jsx
// src/pages/BackofficePage.jsx
// Máx. 20 linhas

import React from 'react';
import { RoleGuard } from '../auth/RoleGuard';
import BackofficeLayout from '../features/Backoffice/BackofficeLayout';

const BackofficePage = () => (
  <RoleGuard allowedRoles={['admin']}>
    <BackofficeLayout />
  </RoleGuard>
);

export default BackofficePage;
```

### Verificação da Fase 7
- [ ] Backoffice acessível em `/backoffice`
- [ ] Admin consegue criar/editar utilizadores
- [ ] Log de auditoria mostra registos
- [ ] Utilizador não-admin é bloqueado
- [ ] App principal não foi alterado

```bash
git add -A
git commit -m "refactor(fase-7): criar módulo de backoffice com gestão de utilizadores"
```

---

## FASE 8 — COMPONENTES UI PARTILHADOS

### Propósito
Extrair componentes UI reutilizáveis para a biblioteca interna `src/components/`.

### Passo 8.1 — Criar src/components/ui/Modal.jsx

```jsx
// src/components/ui/Modal.jsx
// Responsabilidade: wrapper modal reutilizável com overlay
// Props: { isOpen, onClose, title, children, size }
// Máx. 70 linhas

import React, { useEffect } from 'react';

const SIZE_CLASSES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', full: 'max-w-5xl' };

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${SIZE_CLASSES[size]} max-h-[90vh] overflow-auto`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
```

### Passo 8.2 — Criar src/components/ui/Button.jsx

```jsx
// src/components/ui/Button.jsx
// Máx. 50 linhas

import React from 'react';

const VARIANTS = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-transparent',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-600 border-transparent',
};
const SIZES = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };

const Button = ({ variant = 'primary', size = 'md', loading = false, disabled = false, onClick, children, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
  >
    {loading && <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
    {children}
  </button>
);

export default Button;
```

### Passo 8.3 — Criar src/components/ui/ConfirmDialog.jsx

```jsx
// src/components/ui/ConfirmDialog.jsx
// Substitui os confirm() nativos do browser
// Máx. 60 linhas

import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, danger = false, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
    <p className="text-sm text-gray-600 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
```

### Passo 8.4 — Criar src/components/feedback/ErrorBoundary.jsx

```jsx
// src/components/feedback/ErrorBoundary.jsx
// Responsabilidade: capturar erros em componentes filhos sem derrubar o app
// Máx. 60 linhas

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }

  static getDerivedStateFromError(error) { return { hasError: true, error }; }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-2">
          <p className="text-sm font-medium text-red-800">⚠️ Erro neste componente</p>
          <p className="text-xs text-red-600 mt-1">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-2 text-xs text-red-700 underline">Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Passo 8.5 — Criar src/components/feedback/SaveStatus.jsx
Mover do App.jsx o indicador de estado de gravação:

```jsx
// src/components/feedback/SaveStatus.jsx
// Máx. 40 linhas

import React from 'react';

const SaveStatus = ({ saveStatus, lastSaveTime }) => {
  if (!saveStatus && !lastSaveTime) return null;
  return (
    <div className="flex items-center gap-1 text-xs">
      {saveStatus === 'saving' && <span className="text-blue-600 animate-pulse">💾 A guardar...</span>}
      {saveStatus === 'saved' && <span className="text-green-600">✓ Guardado</span>}
      {saveStatus === 'error' && <span className="text-red-600">✗ Erro ao guardar</span>}
      {!saveStatus && lastSaveTime && <span className="text-gray-400">Guardado às {new Date(lastSaveTime).toLocaleTimeString('pt-AO')}</span>}
    </div>
  );
};

export default SaveStatus;
```

### Verificação da Fase 8
- [ ] `Modal`, `Button`, `ConfirmDialog` criados
- [ ] `ErrorBoundary`, `SaveStatus` criados
- [ ] Componentes compilam sem erros

```bash
git add -A
git commit -m "refactor(fase-8): criar biblioteca de componentes UI partilhados"
```

---

## FASE 9 — FEATURES UI

### Propósito
Extrair as grandes secções do JSX do App.jsx para componentes de feature.

### Regra desta fase
Extrair um componente de cada vez. Após cada extracção, verificar que o app funciona antes de continuar.

### Ordem de extracção

**9.1 — PresentationMode** (o mais isolado — já é um `return` separado)
- Ler as linhas do `if (presentationMode) return (...)` do App.jsx
- Criar `src/features/Apresentacao/PresentationMode.jsx`
- No App.jsx, substituir por `<PresentationMode {...props necessários} />`
- Testar: activar modo apresentação, navegar slides

**9.2 — TestesAnalises** (isolado por `showTestesAnalises`)
- Ler o bloco `{showTestesAnalises && (...)}` do App.jsx
- Criar `src/features/Testes/TestesAnalises.jsx`
- Dividir em sub-componentes se ultrapassar 100 linhas
- Testar: abrir painel de testes, fechar

**9.3 — RepairTypeModal** (modal de distribuição de reparações)
- Ler o bloco do modal de tipo de reparação do App.jsx
- Criar `src/features/DataEntry/RepairTypeModal.jsx`
- Testar: editar Total Reparadas, confirmar que o modal abre

**9.4 — DataEntryTable** (tabela editável)
- Ler a secção da tabela de inputs do App.jsx
- Criar `src/features/DataEntry/DataEntryTable.jsx`
- Mover `handleInputChange` e `handleBlurTotalReparadas` para `src/features/DataEntry/hooks/useDataEntry.js`
- Testar: editar uma célula, confirmar que guarda

**9.5 — ExecutiveDashboard** (8 KPI cards + drilldown)
- Criar `src/features/Dashboard/KpiCard.jsx`
- Criar `src/features/Dashboard/KpiCardGrid.jsx`
- Criar `src/features/Dashboard/ExecutiveDashboard.jsx`
- Criar `src/features/Dashboard/StatusDrilldown.jsx`
- Criar `src/features/Dashboard/Top5Criticas.jsx`
- Testar: dashboard mostra valores, clicar em status abre drilldown

**9.6 — Gráficos**
- Criar `src/features/Dashboard/charts/PieChartAnelDuplo.jsx`
- Criar `src/features/Analise/TendenciasChart.jsx`
- Criar `src/features/Analise/ClassificacaoChart.jsx`
- Criar `src/features/Analise/AcompanhamentoTable.jsx`
- Testar: gráficos renderizam com dados

**9.7 — ImportExport**
- Criar `src/features/ImportExport/hooks/useImportData.js`
- Criar `src/features/ImportExport/hooks/useExportData.js`
- Criar `src/features/ImportExport/ImportPanel.jsx`
- Criar `src/features/ImportExport/ExportPanel.jsx`
- Testar: importar ficheiro CSV/Excel, exportar dados

### Padrão de extracção para CADA componente
```
1. Identificar o bloco JSX no App.jsx (início e fim exactos)
2. Identificar todos os props necessários (estado e callbacks)
3. Criar o novo ficheiro com os props explícitos
4. Colar o JSX exacto no novo componente
5. No App.jsx, substituir o bloco pelo componente importado
6. Verificar que o app compila
7. Testar a funcionalidade específica
8. Commit atómico: git commit -m "refactor(fase-9): extrair [NomeComponente]"
```

### Verificação da Fase 9
- [ ] Cada componente extraído funciona correctamente
- [ ] App.jsx tem menos de 400 linhas
- [ ] Todas as interacções funcionam (edição, modais, gráficos)
- [ ] Importação e exportação de ficheiros funcionam

```bash
git add -A
git commit -m "refactor(fase-9): extrair todos os componentes de feature para src/features/"
```

---

## FASE 10 — ROTEAMENTO E APP SHELL FINAL

### Propósito
Criar o sistema de roteamento e reduzir o App.jsx a um orquestrador puro.

### Passo 10.1 — Criar src/router/routes.js

```javascript
// src/router/routes.js
export const ROUTES = {
  LOGIN:      '/login',
  MAIN:       '/',
  BACKOFFICE: '/backoffice',
  NOT_FOUND:  '*',
};
```

### Passo 10.2 — Criar src/pages/MainPage.jsx
Mover o JSX principal do App.jsx para este ficheiro:

```jsx
// src/pages/MainPage.jsx
// Responsabilidade: composição do app principal
// Máx. 120 linhas — apenas composição de hooks e features

import React from 'react';
import { useFilters } from '../hooks/state/useFilters';
import { useAppState } from '../hooks/state/useAppState';
import { usePersistence } from '../hooks/state/usePersistence';
import { useScrollHeader } from '../hooks/state/useScrollHeader';
import { useDashboard } from '../hooks/business/useDashboard';
import { useClassificacao } from '../hooks/business/useClassificacao';
import { useAlertas } from '../hooks/business/useAlertas';
import { useTestes } from '../hooks/business/useTestes';
import { useTendencias } from '../hooks/business/useTendencias';
import { usePieChart } from '../hooks/business/usePieChart';
import { useIntervencoes } from '../hooks/business/useIntervencoes';
import { usePermissions } from '../auth/usePermissions';
import PresentationMode from '../features/Apresentacao/PresentationMode';
import TestesAnalises from '../features/Testes/TestesAnalises';
// ... restantes imports

const MainPage = () => {
  const filters = useFilters();
  const appState = useAppState();
  const { scrollContainerRef, headerVisible } = useScrollHeader();
  usePersistence({ ...appState, ...filters });
  const dashboard = useDashboard({ ...appState, ...filters });
  const classificacao = useClassificacao({ ...appState, ...filters });
  const alertas = useAlertas({ ...appState, ...filters });
  const testes = useTestes({ ...appState, ...filters });
  const tendencias = useTendencias({ ...appState, ...filters });
  const pieChart = usePieChart({ ...appState, ...filters });
  const intervencoes = useIntervencoes({ ...appState, ...filters });
  const { canEdit, canExport } = usePermissions();

  if (appState.presentationMode) {
    return <PresentationMode {...appState} {...filters} {...dashboard} {...classificacao} onClose={() => appState.setPresentationMode(false)} />;
  }

  return (
    <div ref={scrollContainerRef} className="...">
      {/* Composição dos componentes de feature */}
    </div>
  );
};

export default MainPage;
```

### Passo 10.3 — Criar src/router/AppRouter.jsx

```jsx
// src/router/AppRouter.jsx
// Máx. 50 linhas

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { RoleGuard } from '../auth/RoleGuard';
import LoginPage from '../pages/LoginPage';
import MainPage from '../pages/MainPage';
import BackofficePage from '../pages/BackofficePage';
import NotFoundPage from '../pages/NotFoundPage';
import { ROUTES } from './routes';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.MAIN} element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      <Route path={ROUTES.BACKOFFICE + '/*'} element={<ProtectedRoute><RoleGuard allowedRoles={['admin']}><BackofficePage /></RoleGuard></ProtectedRoute>} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
```

### Passo 10.4 — Criar src/pages/NotFoundPage.jsx

```jsx
// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center p-8">
    <div className="text-8xl mb-4">404</div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
    <Link to="/" className="text-blue-600 hover:underline mt-4">← Voltar ao início</Link>
  </div>
);

export default NotFoundPage;
```

### Passo 10.5 — Simplificar App.jsx para ~60 linhas

```jsx
// src/App.jsx
// APÓS REFACTORING COMPLETO — apenas providers e router
// Máx. 60 linhas

import React from 'react';
import { AuthProvider } from './auth/AuthProvider';
import AppRouter from './router/AppRouter';
import './App.css';

const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
```

### Verificação da Fase 10
- [ ] App.jsx tem menos de 60 linhas
- [ ] Login redireciona para `/`
- [ ] Utilizador não autenticado vai para `/login`
- [ ] `/backoffice` acessível apenas para admin
- [ ] Funcionalidade completa do app principal está preservada

```bash
git add -A
git commit -m "refactor(fase-10): criar router e simplificar App.jsx para shell de ~60 linhas"
```

---

## FASE 11 — REVISÃO DE SEGURANÇA E QUALIDADE

### Passo 11.1 — Auditoria de chaves e variáveis de ambiente
```bash
# Verificar que nenhuma chave Supabase está no código
grep -r "eyJhbGc\|supabase.co" src/ --include="*.js" --include="*.jsx"
# Deve devolver zero resultados

# Verificar .env no .gitignore
cat .gitignore | grep -E "^\.env"
```

### Passo 11.2 — Verificar limites de linhas
```bash
find src/ \( -name "*.jsx" -o -name "*.js" \) | xargs wc -l | sort -rn | head -30
```
Qualquer ficheiro com mais de 250 linhas deve ser documentado com justificação.

### Passo 11.3 — Remover console.log remanescentes
```bash
# Listar todos os console.log ainda no código
grep -rn "console\.log\|console\.warn" src/ --include="*.jsx" --include="*.js" | grep -v "logger.js" | grep -v "node_modules"
```
Substituir por `import { log } from '../utils/logger'; log(...)`.

### Passo 11.4 — Verificar imports não utilizados
```bash
npx eslint src/ --rule '{"no-unused-vars": "warn"}' 2>&1 | grep "no-unused-vars" | head -20
```

### Passo 11.5 — Verificação final completa
```bash
# Build de produção sem erros
npm run build 2>&1 | tail -30

# Verificar tamanho do App.jsx final
wc -l src/App.jsx

# Verificar estrutura final
find src/ -name "*.jsx" -o -name "*.js" | grep -v node_modules | sort
```

### Verificação da Fase 11
- [ ] Zero chaves hardcoded
- [ ] `.env` no `.gitignore`
- [ ] Zero `console.log` não controlados
- [ ] Build de produção passa sem erros
- [ ] `src/App.jsx` tem menos de 60 linhas
- [ ] Nenhum ficheiro de feature tem mais de 250 linhas

```bash
git add -A
git commit -m "refactor(fase-11): auditoria de segurança e limpeza de código"
git tag "v-modular-1.0"
```

---

## RELATÓRIO FINAL OBRIGATÓRIO

Após completar a Fase 11, gerar e mostrar este relatório:

```bash
echo "=== RELATÓRIO FINAL DO REFACTORING ==="
echo ""
echo "--- Tamanho dos ficheiros (top 20) ---"
find src/ \( -name "*.jsx" -o -name "*.js" \) | grep -v node_modules | xargs wc -l | sort -rn | head -20
echo ""
echo "--- Total de ficheiros criados ---"
find src/ \( -name "*.jsx" -o -name "*.js" \) | grep -v node_modules | wc -l
echo ""
echo "--- Verificação de segurança ---"
echo -n "Chaves hardcoded: "
grep -r "eyJhbGc\|supabase.co" src/ --include="*.js" --include="*.jsx" | wc -l
echo -n "console.log não controlados: "
grep -rn "console\.log\|console\.warn" src/ --include="*.jsx" --include="*.js" | grep -v "logger.js" | wc -l
echo ""
echo "--- Estado do Git ---"
git log --oneline -15
echo ""
echo "=== REFACTORING CONCLUÍDO ==="
```
