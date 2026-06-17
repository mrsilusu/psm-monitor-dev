# PSM Monitor — Plano de Refactoring
## Monolítico Simples → Monolítico Modular com Gestão de Utilizadores e Backoffice

**Versão actual:** 5.10.19 | **Ficheiro monolítico:** `App.jsx` (11.571 linhas, ~580 KB)
**Âmbito:** Refactoring de arquitectura sem alteração de funcionalidades, layout, lógica de negócio ou estrutura de dados.

---

## PARTE I — DIAGNÓSTICO DO ESTADO ACTUAL

### 1.1 Problemas Identificados no App.jsx

O ficheiro único mistura 7 responsabilidades completamente distintas:

| # | Responsabilidade | Localização (linhas) | Problema concreto |
|---|---|---|---|
| 1 | Constantes e mapas de rotas/províncias | 89–400 | Dados estáticos imutáveis no interior de um componente React reactivo |
| 2 | Comunicação com Supabase | 527–570 + useEffects dispersos | Acesso directo à base de dados sem camada de abstracção |
| 3 | Estado global da aplicação | 47 `useState` dispersos | Impossível isolar, testar ou reutilizar qualquer estado |
| 4 | Lógica de negócio (cálculos) | 3.289–5.230 | `useMemo` complexos dentro do componente de renderização |
| 5 | Handlers de input/import/export | 1.613–2.850 | Funções de 200+ linhas dentro do corpo de um componente |
| 6 | Componentes UI | 5.440–11.571 | 6.000 linhas de JSX num único `return` |
| 7 | Segurança e validação | Dispersa sem padrão | Sem camada dedicada, inconsistente |

### 1.2 O que NÃO será alterado durante o refactoring

Esta lista é a fronteira inviolável. Qualquer mudança fora desta lista exige validação explícita antes de executar.

- Todas as funções de cálculo (lógica de redução de fibras dependentes, cálculo de efetividade, etc.)
- Todos os layouts CSS e classes Tailwind
- A estrutura dos objectos de dados: `data`, `distribuicaoReparacoes`, `justificativas`
- Todas as chaves de `localStorage` existentes (`psm_rotas_data_v3`, `psm_distribuicao_reparacoes_v3`, etc.)
- A estrutura de tabelas do Supabase
- A lógica de versionamento do `localStorage` (`CURRENT_DATA_VERSION = 2`)
- O comportamento e ordem dos `useEffect` de sincronização

### 1.3 Princípios de Boas Práticas Aplicados

Cada decisão de arquitectura neste plano segue os seguintes princípios:

**Single Responsibility Principle (SRP):** Cada ficheiro tem uma e apenas uma razão para mudar. Um componente que trata do layout não deve conter lógica de negócio.

**Limite de linhas por ficheiro:** Nenhum ficheiro deve ultrapassar 200–300 linhas. Ficheiros com mais de 150 linhas devem ser revistos. Componentes UI com mais de 100 linhas devem ser considerados para subdivisão.

**Separação de camadas:** A UI não conhece a base de dados. A base de dados não conhece a UI. A lógica de negócio é independente das duas.

**Componentes puros vs. com estado:** Componentes que só recebem props e renderizam JSX são preferidos. O estado fica nos hooks, não nos componentes.

**Funções puras:** Funções utilitárias não têm efeitos secundários — recebem input, devolvem output, sem aceder a estado externo.

**Encapsulamento:** Cada módulo exporta apenas o que é necessário. Implementação interna é privada.

---

## PARTE II — ARQUITECTURA COMPLETA DO SISTEMA

### 2.1 Visão Geral por Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 0 — Configuração e Constantes                           │
│  (dados estáticos, sem lógica, sem efeitos)                     │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 1 — Serviços de Dados                                   │
│  (Supabase, localStorage, HTTP — sem React)                     │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 2 — Autenticação e Controlo de Acesso                   │
│  (gestão de sessão, roles, guards de rota)                      │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 3 — Hooks de Estado                                     │
│  (useState, useEffect, sincronização)                           │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 4 — Hooks de Lógica de Negócio                          │
│  (useMemo, cálculos, derivações de dados)                       │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 5 — Features (módulos funcionais)                       │
│  (DataEntry, Dashboard, Análise, Testes, Backoffice)            │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 6 — Componentes UI Partilhados                          │
│  (Header, Modal, FilterBar, etc.)                               │
├─────────────────────────────────────────────────────────────────┤
│  CAMADA 7 — Shell da Aplicação (Router + App.jsx)               │
│  (~150 linhas — apenas composição e roteamento)                 │
└─────────────────────────────────────────────────────────────────┘
```

**Regra de dependência:** Uma camada só pode importar de camadas abaixo dela. Nunca para cima. Nunca em círculo.

### 2.2 Estrutura Completa de Pastas

```
src/
│
├── config/                         ← CAMADA 0: Dados estáticos imutáveis
│   ├── constants.js
│   ├── routeConfig.js
│   ├── provinceConfig.js
│   └── quarterConfig.js
│
├── services/                       ← CAMADA 1: Comunicação externa
│   ├── supabaseClient.js
│   ├── supabaseService.js
│   ├── supabaseDistribuicaoService.js
│   ├── userService.js              ← NOVO: CRUD de utilizadores
│   ├── auditService.js             ← NOVO: registo de auditoria
│   └── localStorageService.js
│
├── auth/                           ← CAMADA 2: Autenticação completa
│   ├── AuthContext.jsx
│   ├── AuthProvider.jsx
│   ├── ProtectedRoute.jsx
│   ├── RoleGuard.jsx
│   ├── useAuth.js
│   └── usePermissions.js
│
├── hooks/                          ← CAMADA 3 e 4: Hooks de estado e negócio
│   ├── state/
│   │   ├── useAppState.js
│   │   ├── usePersistence.js
│   │   ├── useFilters.js
│   │   └── useScrollHeader.js
│   └── business/
│       ├── useDashboard.js
│       ├── useClassificacao.js
│       ├── useAlertas.js
│       ├── useTestes.js
│       ├── useTendencias.js
│       ├── usePieChart.js
│       └── useIntervencoes.js
│
├── utils/                          ← Funções puras auxiliares
│   ├── dateUtils.js
│   ├── routeUtils.js
│   ├── valueUtils.js
│   ├── fibraLogic.js
│   ├── exportImport.js
│   ├── validators.js               ← NOVO: validação centralizada
│   ├── formatters.js               ← NOVO: formatação de valores/datas
│   └── logger.js                   ← NOVO: logging controlado por ambiente
│
├── features/                       ← CAMADA 5: Módulos funcionais
│   │
│   ├── DataEntry/                  ← Entrada de dados semanais
│   │   ├── index.js
│   │   ├── DataEntryTable.jsx          (máx. 150 linhas)
│   │   ├── DataEntryRow.jsx            (máx. 80 linhas)
│   │   ├── RepairTypeModal.jsx         (máx. 120 linhas)
│   │   ├── RepairDistributionForm.jsx  (máx. 100 linhas)
│   │   └── hooks/
│   │       ├── useDataEntry.js
│   │       └── useRepairDistribution.js
│   │
│   ├── Dashboard/                  ← Visualização executiva
│   │   ├── index.js
│   │   ├── ExecutiveDashboard.jsx      (máx. 100 linhas — só composição)
│   │   ├── KpiCard.jsx                 (máx. 60 linhas — 1 card)
│   │   ├── KpiCardGrid.jsx             (máx. 80 linhas — grelha de 8 cards)
│   │   ├── StatusDrilldown.jsx         (máx. 120 linhas)
│   │   ├── Top5Criticas.jsx            (máx. 100 linhas)
│   │   ├── ProvincialDashboard.jsx     (máx. 150 linhas)
│   │   └── charts/
│   │       ├── PieChartAnelDuplo.jsx   (máx. 200 linhas — SVG complexo)
│   │       └── CompactRoutesChart.jsx  (máx. 150 linhas)
│   │
│   ├── Analise/                    ← Análise e classificação de rotas
│   │   ├── index.js
│   │   ├── AnaliseContainer.jsx        (máx. 80 linhas — composição)
│   │   ├── ClassificacaoChart.jsx      (máx. 150 linhas)
│   │   ├── ClassificacaoCarrossel.jsx  (máx. 80 linhas)
│   │   ├── TendenciasChart.jsx         (máx. 200 linhas — SVG complexo)
│   │   ├── AcompanhamentoTable.jsx     (máx. 120 linhas)
│   │   ├── EfetividadeGauge.jsx        (máx. 150 linhas)
│   │   └── IntervencoesRecentes.jsx    (máx. 100 linhas)
│   │
│   ├── Testes/                     ← Testes e análises de efetividade
│   │   ├── index.js
│   │   ├── TestesAnalises.jsx          (máx. 100 linhas — composição)
│   │   ├── ResumoRotas.jsx             (máx. 100 linhas)
│   │   ├── StatusTecnico.jsx           (máx. 100 linhas)
│   │   ├── GraficosEfetividade.jsx     (máx. 120 linhas)
│   │   └── ValidacaoTable.jsx          (máx. 150 linhas)
│   │
│   ├── Apresentacao/               ← Modo apresentação / slides
│   │   ├── index.js
│   │   ├── PresentationMode.jsx        (máx. 100 linhas — wrapper)
│   │   ├── SlideControls.jsx           (máx. 60 linhas)
│   │   └── slides/
│   │       ├── SlideDashboard.jsx      (máx. 80 linhas)
│   │       ├── SlidePerformance.jsx    (máx. 80 linhas)
│   │       ├── SlideComparativo.jsx    (máx. 80 linhas)
│   │       ├── SlideClassificacao.jsx  (máx. 80 linhas)
│   │       ├── SlideAcompanhamento.jsx (máx. 80 linhas)
│   │       ├── SlideManual.jsx         (máx. 60 linhas)
│   │       └── SlideTestes.jsx         (máx. 80 linhas)
│   │
│   ├── ImportExport/               ← Importação e exportação de dados
│   │   ├── index.js
│   │   ├── ImportPanel.jsx             (máx. 100 linhas)
│   │   ├── ExportPanel.jsx             (máx. 100 linhas)
│   │   ├── JustificativasImport.jsx    (máx. 80 linhas)
│   │   ├── JustificativasExport.jsx    (máx. 80 linhas)
│   │   └── hooks/
│   │       ├── useImportData.js        ← lógica processExcelFile + processCSVFile
│   │       └── useExportData.js        ← lógica handleDownloadCSV + handleExportJSON
│   │
│   └── Backoffice/                 ← NOVO: Administração do sistema
│       ├── index.js
│       ├── BackofficeLayout.jsx        (máx. 80 linhas — layout com sidebar)
│       ├── Users/
│       │   ├── UserList.jsx            (máx. 150 linhas)
│       │   ├── UserForm.jsx            (máx. 150 linhas)
│       │   ├── UserCard.jsx            (máx. 80 linhas)
│       │   └── useUsers.js             (hook de gestão de utilizadores)
│       ├── Roles/
│       │   ├── RoleList.jsx            (máx. 100 linhas)
│       │   ├── RoleForm.jsx            (máx. 120 linhas)
│       │   └── useRoles.js
│       ├── Audit/
│       │   ├── AuditLog.jsx            (máx. 150 linhas)
│       │   ├── AuditFilters.jsx        (máx. 80 linhas)
│       │   └── useAuditLog.js
│       └── Settings/
│           ├── AppSettings.jsx         (máx. 150 linhas)
│           ├── OperatorSettings.jsx    (máx. 120 linhas)
│           └── useSettings.js
│
├── pages/                          ← Páginas de nível de rota
│   ├── LoginPage.jsx               (máx. 150 linhas)
│   ├── MainPage.jsx                (máx. 100 linhas — composição do app principal)
│   ├── BackofficePage.jsx          (máx. 80 linhas — wrapper do backoffice)
│   └── NotFoundPage.jsx            (máx. 40 linhas)
│
├── components/                     ← CAMADA 6: UI partilhada
│   ├── layout/
│   │   ├── Header.jsx              (máx. 100 linhas)
│   │   ├── Sidebar.jsx             (máx. 100 linhas)
│   │   └── PageWrapper.jsx         (máx. 50 linhas)
│   ├── ui/
│   │   ├── Modal.jsx               (máx. 80 linhas)
│   │   ├── Tooltip.jsx             (máx. 60 linhas)
│   │   ├── Badge.jsx               (máx. 40 linhas)
│   │   ├── Button.jsx              (máx. 50 linhas)
│   │   ├── Spinner.jsx             (máx. 30 linhas)
│   │   ├── EmptyState.jsx          (máx. 40 linhas)
│   │   └── ConfirmDialog.jsx       (máx. 60 linhas)
│   ├── feedback/
│   │   ├── AlertaBell.jsx          (máx. 80 linhas)
│   │   ├── SaveStatus.jsx          (máx. 40 linhas)
│   │   ├── MobileWarning.jsx       (máx. 50 linhas)
│   │   └── ErrorBoundary.jsx       (máx. 60 linhas)
│   └── form/
│       ├── FilterBar.jsx           (máx. 100 linhas)
│       ├── SelectField.jsx         (máx. 50 linhas)
│       ├── NumberInput.jsx         (máx. 60 linhas)
│       └── ProvinceFilter.jsx      (máx. 60 linhas)
│
├── router/                         ← CAMADA 7: Roteamento
│   ├── AppRouter.jsx               (máx. 80 linhas)
│   ├── routes.js                   (definição de todas as rotas)
│   └── routeGuards.js              (lógica de redirecionamento)
│
├── App.jsx                         ← Raiz: apenas providers + router (~60 linhas)
├── index.jsx                       ← Entry point (~15 linhas)
└── App.css                         ← Estilos globais
```

---

## PARTE III — GESTÃO DE UTILIZADORES E BACKOFFICE

### 3.1 Modelo de Dados — Utilizadores e Roles

As tabelas a criar no Supabase para suportar a gestão de utilizadores:

```sql
-- Tabela de perfis de utilizador (complementa auth.users do Supabase)
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  psm_access  TEXT[] DEFAULT '{}',   -- ex: ['FIBRASOL', 'ISISTEL']
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES auth.users(id)
);

-- Tabela de auditoria (registo de todas as acções)
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  user_email  TEXT,
  action      TEXT NOT NULL,          -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'
  entity      TEXT NOT NULL,          -- 'psm_data', 'justificativas', 'user_profiles'
  entity_id   TEXT,                   -- ID ou chave do registo afectado
  old_value   JSONB,                  -- valor antes da alteração
  new_value   JSONB,                  -- valor depois da alteração
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configurações da aplicação (editável pelo admin via backoffice)
CREATE TABLE app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id)
);
```

### 3.2 Roles e Permissões

| Role | Acesso | Pode editar dados | Pode importar | Pode exportar | Backoffice |
|---|---|---|---|---|---|
| `admin` | Todos os PSMs | Sim | Sim | Sim | Sim (completo) |
| `manager` | PSMs atribuídos | Sim | Sim | Sim | Não |
| `operator` | PSMs atribuídos | Sim (só semana actual) | Sim | Não | Não |
| `viewer` | PSMs atribuídos | Não | Não | Sim | Não |

### 3.3 Ficheiros de Autenticação em Detalhe

**`auth/AuthContext.jsx`** — Contexto React partilhado
```jsx
// Responsabilidade única: providenciar o contexto de autenticação
// Máx. 60 linhas
export const AuthContext = createContext(null);
```

**`auth/AuthProvider.jsx`** — Provider com lógica de sessão
```jsx
// Responsabilidade: inicializar sessão Supabase, gerir estado de auth
// Máx. 100 linhas
// Expõe: { user, profile, session, loading }
```

**`auth/useAuth.js`** — Hook de acesso ao contexto
```js
// Responsabilidade: interface limpa para consumir AuthContext
// Máx. 30 linhas
// Uso: const { user, profile, signIn, signOut } = useAuth();
```

**`auth/usePermissions.js`** — Hook de verificação de permissões
```js
// Responsabilidade: verificar permissões sem acesso directo ao contexto
// Máx. 60 linhas
// Uso: const { canEdit, canExport, canAccessBackoffice } = usePermissions();
```

**`auth/ProtectedRoute.jsx`** — Guard de rota por autenticação
```jsx
// Responsabilidade: redirecionar para login se não autenticado
// Máx. 30 linhas
```

**`auth/RoleGuard.jsx`** — Guard de rota por role
```jsx
// Responsabilidade: redirecionar para 403 se role insuficiente
// Máx. 40 linhas
// Uso: <RoleGuard allowedRoles={['admin']}><BackofficePage /></RoleGuard>
```

---

## PARTE IV — PLANO DE ACÇÃO DETALHADO POR FASES

> **Regra de ouro de cada fase:** Terminar a fase → testar o app → confirmar que tudo funciona → só então avançar para a fase seguinte. Nunca iniciar uma nova fase com falhas por resolver.

---

### FASE 0 — Preparação e Ambiente (2–3 horas)

**Propósito:** Criar as condições de segurança e rastreabilidade antes de qualquer alteração de código.

**O que é feito:**

**0.1 — Criar branch de trabalho no Git**
```bash
git checkout -b refactoring/monolitico-modular
git push -u origin refactoring/monolitico-modular
```
Nunca trabalhar directamente no `main`. Cada fase pode ter o seu próprio commit atómico.

**0.2 — Verificar e criar ficheiro `.env`**
```bash
# .env na raiz do projecto
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```
Verificar que `.env` está no `.gitignore`. Se as chaves estiverem actualmente hardcoded no código (em `supabaseService.js` ou similar), este é o momento de as mover.

**0.3 — Criar ficheiro `src/utils/logger.js`**
```js
// Substitui todos os console.log do app
// Em produção, logs de debug são silenciados
const isDev = process.env.NODE_ENV === 'development';

export const log = (...args) => { if (isDev) console.log(...args); };
export const warn = (...args) => { if (isDev) console.warn(...args); };
export const error = (...args) => console.error(...args); // sempre activo
export const group = (label, fn) => { if (isDev) { console.group(label); fn(); console.groupEnd(); } };
```

**0.4 — Criar pasta `src/` completa com ficheiros vazios**
Criar todos os ficheiros listados na estrutura de pastas do Ponto 2.2 com apenas um comentário `// TODO`. Isto permite que os imports não quebrem enquanto se migra o código gradualmente.

**O que NÃO é feito nesta fase:** Mover qualquer lógica. Apenas preparação.

**Critério de conclusão:** App corre normalmente sem erros. Branch criado. `.env` verificado. Pasta criada.

---

### FASE 1 — Configuração e Constantes (2–3 horas)

**Propósito:** Separar todos os dados estáticos do componente React. São os dados que nunca mudam em runtime — mapas de rotas, províncias, operadores, configuração de quarters.

**O que é feito:**

**1.1 — Criar `src/config/constants.js`**

Mover de `App.jsx`:
- Constante `CURRENT_DATA_VERSION` (linha 18)
- Array `allWeeks` (linha 262)
- Array `statusCategories` (linha 265)

```js
// src/config/constants.js
// Responsabilidade: constantes globais imutáveis da aplicação
// Máx. 30 linhas

export const CURRENT_DATA_VERSION = 2;
export const ALL_WEEKS = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);
export const STATUS_CATEGORIES = ['Transporte', 'Indisponíveis', 'Total Reparadas', ...];
```

**1.2 — Criar `src/config/quarterConfig.js`**

Mover de `App.jsx`:
- Objecto `quarterConfig` (linha 255) com as semanas de início e fim de cada quarter

```js
// src/config/quarterConfig.js
// Responsabilidade: configuração dos quarters anuais (Q1/Q2/Q3)
// Máx. 20 linhas

export const QUARTER_CONFIG = {
  Q1: { start: 1,  end: 17 },
  Q2: { start: 18, end: 35 },
  Q3: { start: 36, end: 52 },
};
```

**1.3 — Criar `src/config/routeConfig.js`**

Mover de `App.jsx`:
- Objecto `routesByPSM` completo (linhas 277–396) com todas as rotas de FIBRASOL, ISISTEL e ANGLOBAL

```js
// src/config/routeConfig.js
// Responsabilidade: mapeamento operador → lista de rotas
// Este ficheiro é o único lugar onde se adicionam/removem rotas
// Máx. 150 linhas

export const ROUTES_BY_PSM = {
  FIBRASOL: [...],
  ISISTEL: [...],
  ANGLOBAL: [...],
};
export const ALL_OPERATORS = Object.keys(ROUTES_BY_PSM);
```

**1.4 — Criar `src/config/provinceConfig.js`**

Mover de `App.jsx`:
- Objecto `routeToProvince` (linha 89–229)
- Objecto `provinceToOperator` (linha 231)
- Objecto `operatorToProvinces` (linha 244)

```js
// src/config/provinceConfig.js
// Responsabilidade: mapeamento rotas ↔ províncias ↔ operadores
// Máx. 180 linhas (inclui os 100+ mapeamentos de rotas)
```

**1.5 — Actualizar `App.jsx`**

Substituir as definições locais por imports:
```js
import { CURRENT_DATA_VERSION, ALL_WEEKS, STATUS_CATEGORIES } from './config/constants';
import { QUARTER_CONFIG } from './config/quarterConfig';
import { ROUTES_BY_PSM } from './config/routeConfig';
import { ROUTE_TO_PROVINCE, PROVINCE_TO_OPERATOR, OPERATOR_TO_PROVINCES } from './config/provinceConfig';
```

Actualizar todas as referências internas (ex: `routesByPSM` → `ROUTES_BY_PSM`).

**O que NÃO é feito nesta fase:** Mover qualquer função, hook ou componente.

**Critério de conclusão:** App corre. Os mapas de rotas continuam a funcionar. Filtros de PSM/Província continuam correctos. `App.jsx` reduziu ~350 linhas.

---

### FASE 2 — Serviços de Dados (3–4 horas)

**Propósito:** Centralizar toda a comunicação com sistemas externos (Supabase, localStorage) numa camada dedicada sem React. Esta camada não conhece componentes, hooks, ou UI.

**O que é feito:**

**2.1 — Criar `src/services/supabaseClient.js`**

```js
// src/services/supabaseClient.js
// Responsabilidade: única instância do cliente Supabase
// Máx. 15 linhas
// REGRA: Este é o ÚNICO ficheiro que importa @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Variáveis de ambiente Supabase não configuradas. Verificar .env');
}

export const supabase = createClient(url, key);
```

**2.2 — Actualizar `supabaseService.js` e `supabaseDistribuicaoService.js`**

Estes ficheiros já existem. Apenas substituir a criação interna do cliente pelo import de `supabaseClient.js`. Nenhuma lógica é alterada.

**2.3 — Criar `src/services/userService.js`**

```js
// src/services/userService.js
// Responsabilidade: operações CRUD de utilizadores e perfis
// Máx. 150 linhas
// Todas as funções são async e devolvem { data, error }

import { supabase } from './supabaseClient';

export const getUsers = async () => { ... };
export const getUserById = async (id) => { ... };
export const createUser = async (userData) => { ... };
export const updateUser = async (id, updates) => { ... };
export const deactivateUser = async (id) => { ... };
export const getUserPsmAccess = async (userId) => { ... };
export const updateUserPsmAccess = async (userId, psmList) => { ... };
```

**2.4 — Criar `src/services/auditService.js`**

```js
// src/services/auditService.js
// Responsabilidade: registar acções de utilizadores na tabela audit_log
// Máx. 80 linhas

import { supabase } from './supabaseClient';

export const logAction = async ({ action, entity, entityId, oldValue, newValue }) => { ... };
export const getAuditLog = async ({ userId, entity, dateFrom, dateTo, page }) => { ... };
```

**2.5 — Criar `src/services/localStorageService.js`**

Mover de `App.jsx`:
- Função `cleanupLocalStorage` (linhas 24–68)
- Todas as operações de leitura/escrita no `localStorage` (actualmente dispersas)

```js
// src/services/localStorageService.js
// Responsabilidade: abstracção do localStorage com prefixo e versionamento
// Máx. 100 linhas

const PREFIX = 'psm_';
export const CURRENT_VERSION = 2;

export const lsGet = (key) => { ... };
export const lsSet = (key, value) => { ... };
export const lsRemove = (key) => { ... };
export const cleanupOldData = () => { /* lógica de cleanupLocalStorage actual */ };

// Chaves tipadas (evita strings mágicas espalhadas pelo código)
export const LS_KEYS = {
  DATA: 'rotas_data_v3',
  DISTRIBUICAO: 'distribuicao_reparacoes_v3',
  JUSTIFICATIVAS: 'justificativas_v1',
  TESTADAS: 'rotas_testadas_v2',
  VALIDADAS: 'rotas_validadas_v2',
  OPERATOR: 'selectedOperator',
  WEEK: 'selectedWeek',
  QUARTER: 'selectedQuarter',
  YEAR: 'selectedYear',
  VERSION: 'data_version',
};
```

**O que NÃO é feito nesta fase:** Mover qualquer hook, estado React, ou componente UI.

**Critério de conclusão:** App corre. Supabase sincroniza normalmente. localStorage carrega e guarda dados. Chaves não estão hardcoded no código.

---

### FASE 3 — Utilitários Puros (3–4 horas)

**Propósito:** Extrair todas as funções que não têm efeitos secundários e não dependem de estado React. São funções que recebem argumentos e devolvem resultados — testáveis de forma completamente isolada.

**O que é feito:**

**3.1 — Criar `src/utils/dateUtils.js`**

Mover de `App.jsx`:
- `getQuarterFromWeek(week)` (linha 655) — recebe `'W50'`, devolve `'Q3'`
- `getWeeksForQuarter(quarter)` (linha 1077) — devolve array de semanas do quarter
- `getQuarterAnterior(currentQuarter, currentYear)` (linha 5236) — devolve quarter e ano anteriores

```js
// src/utils/dateUtils.js
// Responsabilidade: cálculos relacionados com semanas, quarters e anos
// Máx. 60 linhas — todas as funções são puras (sem efeitos secundários)
```

**3.2 — Criar `src/utils/routeUtils.js`**

Mover de `App.jsx`:
- `findPSMForRoute(routeName)` (linha 1166)
- `isRotaTestada(psm, semana, rota)` (linha 666)
- `isRotaValidada(psm, semana, rota)` (linha 671)
- `getSemanasTestadasNoQuarter(psm, rota, quarter)` (linha 677)
- `getSemanasValidadasNoQuarter(psm, rota, quarter)` (linha 694)
- `getSemanasTestadas(psm, rota)` (linha 711)
- `getSemanasValidadas(psm, rota)` (linha 722)
- `isRotaTestadaGlobalNoQuarter(psm, rota, quarter)` (linha 734)
- `isRotaValidadaGlobalNoQuarter(psm, rota, quarter)` (linha 738)
- `isRotaTestadaGlobal(psm, rota)` (linha 742)
- `isRotaValidadaGlobal(psm, rota)` (linha 746)

**Atenção:** Estas funções recebem `rotasTestadas` e `rotasValidadas` como parâmetro — não acedem directamente ao estado. Verificar que a assinatura é mantida.

```js
// src/utils/routeUtils.js
// Responsabilidade: queries sobre o estado de rotas (testadas/validadas)
// Máx. 120 linhas — todas as funções recebem os dados como parâmetro
```

**3.3 — Criar `src/utils/valueUtils.js`**

Mover de `App.jsx`:
- `getValorReduzido(psm, week, route, tipo)` (linha 3256)
- `getValorOriginal(psm, week, route, tipo)` (linha 3284)
- `buscarValorAnterior(psm, week, route, tipo)` (linha 3209)

```js
// src/utils/valueUtils.js
// Responsabilidade: obter valores de fibras com lógica de redução/prioridade
// Máx. 100 linhas
// Estas funções recebem o objecto 'data' como parâmetro — não acedem a estado
```

**3.4 — Criar `src/utils/validators.js`**

```js
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
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPSM = (psm) =>
  ['FIBRASOL', 'ISISTEL', 'ANGLOBAL'].includes(psm);

export const isValidWeek = (week) =>
  /^W([1-9]|[1-4]\d|5[0-2])$/.test(week);

export const isValidQuarter = (q) =>
  ['Q1', 'Q2', 'Q3'].includes(q);
```

**3.5 — Criar `src/utils/formatters.js`**

```js
// src/utils/formatters.js
// Responsabilidade: formatação de valores para exibição na UI
// Máx. 60 linhas

export const formatPercentage = (value, decimals = 1) =>
  `${Number(value).toFixed(decimals)}%`;

export const formatNumber = (value) =>
  Number(value).toLocaleString('pt-AO');

export const formatWeekLabel = (week) =>
  week.replace('W', 'Semana ');

export const formatQuarterLabel = (quarter, year) =>
  `${quarter} / ${year}`;
```

**3.6 — Criar `src/utils/fibraLogic.js`**

Mover de `App.jsx`:
- O núcleo da lógica de negócio dentro de `handleInputChange` (linhas 2900–3188): o algoritmo de redução automática de fibras dependentes quando `Total Reparadas` muda.

Esta é a lógica mais crítica do app. Deve ser extraída como uma função pura que recebe o estado actual e devolve o novo estado, sem aceder a `setData` ou qualquer hook.

```js
// src/utils/fibraLogic.js
// Responsabilidade: algoritmo de redução automática de fibras dependentes
// Máx. 200 linhas — algoritmo complexo mas isolado e testável
// INPUT:  { psm, week, route, category, value, currentData, distribuicaoReparacoes, ... }
// OUTPUT: { newData, newDistribuicao, shouldOpenModal, pendingRepairData }

export const calcularNovoEstadoFibras = (params) => { ... };
```

**3.7 — Criar `src/utils/exportImport.js`**

Mover de `App.jsx`:
- `processExcelFile(file)` (linha 1214) — processa ficheiro `.xlsx`
- `processCSVFile(file)` (linha 1441) — processa ficheiro `.csv`
- Funções de geração de CSV para exportação (linhas 2610–2775)
- `handleExportJSON` (linha 2577)
- `handleExportJustificativasCSV` (linha 2783)

```js
// src/utils/exportImport.js
// Responsabilidade: parse e geração de ficheiros CSV/Excel
// Máx. 250 linhas — dividir em importUtils.js e exportUtils.js se ultrapassar
```

**O que NÃO é feito nesta fase:** Mover qualquer estado, hook ou componente.

**Critério de conclusão:** App corre. Importação de ficheiros funciona. Exportação funciona. Cálculo de fibras dependentes funciona correctamente.

---

### FASE 4 — Autenticação e Gestão de Utilizadores (4–5 horas)

**Propósito:** Introduzir a camada de autenticação usando Supabase Auth. Esta fase adiciona funcionalidade nova sem alterar nenhuma existente.

**O que é feito:**

**4.1 — Configurar Supabase Auth**

No painel do Supabase:
- Activar Email/Password authentication
- Criar as tabelas `user_profiles`, `audit_log`, `app_settings` (SQL do Ponto 3.1)
- Configurar RLS em todas as tabelas existentes (`psm_data`, `justificativas`, `distribuicao`)
- Criar políticas de acesso por role

**4.2 — Criar `auth/AuthProvider.jsx`**

```jsx
// auth/AuthProvider.jsx
// Responsabilidade: gerir sessão Supabase e perfil do utilizador
// Máx. 100 linhas

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obter sessão actual do Supabase
    // 2. Subscrever a mudanças de auth (login/logout)
    // 3. Ao login, carregar perfil de user_profiles
  }, []);

  const signIn = async (email, password) => { ... };
  const signOut = async () => { ... };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**4.3 — Criar `auth/usePermissions.js`**

```js
// auth/usePermissions.js
// Responsabilidade: verificar permissões de forma declarativa
// Máx. 60 linhas

export const usePermissions = () => {
  const { profile } = useAuth();
  const role = profile?.role ?? 'viewer';

  return {
    canEdit:              ['admin', 'manager', 'operator'].includes(role),
    canImport:            ['admin', 'manager', 'operator'].includes(role),
    canExport:            ['admin', 'manager', 'viewer'].includes(role),
    canAccessBackoffice:  role === 'admin',
    canManageUsers:       role === 'admin',
    canViewAllPSMs:       ['admin', 'manager'].includes(role),
    isAdmin:              role === 'admin',
    psmAccess:            profile?.psm_access ?? [],
  };
};
```

**4.4 — Criar `pages/LoginPage.jsx`**

```jsx
// pages/LoginPage.jsx
// Responsabilidade: formulário de login (email + password)
// Máx. 150 linhas
```

**4.5 — Criar `auth/ProtectedRoute.jsx` e `auth/RoleGuard.jsx`**

```jsx
// auth/ProtectedRoute.jsx — redireciona para /login se não autenticado
// Máx. 30 linhas

// auth/RoleGuard.jsx — redireciona para /403 se role insuficiente
// Máx. 40 linhas
```

**4.6 — Integrar `AuthProvider` no `App.jsx`**

```jsx
// App.jsx — adicionar AuthProvider como wrapper externo
const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);
```

**4.7 — Filtrar PSMs acessíveis com base no role**

Em `useAppState.js` (Fase 5), o `selectedOperator` inicial deve ser filtrado pelo `profile.psm_access` do utilizador. Um `viewer` com acesso apenas a `['FIBRASOL']` não deve ver dados de `ISISTEL`.

**O que NÃO é feito nesta fase:** Alterar qualquer lógica de dados existente.

**Critério de conclusão:** Login funciona. Utilizador autenticado vê o app normal. Utilizador não autenticado é redirecionado para `/login`.

---

### FASE 5 — Hooks de Estado (4–5 horas)

**Propósito:** Extrair os 47 `useState` e os `useEffect` de sincronização do `App.jsx` para hooks dedicados. O estado continua a funcionar exactamente da mesma forma — apenas muda de localização.

**O que é feito:**

**5.1 — Criar `hooks/state/useFilters.js`**

Mover de `App.jsx`:
- `selectedOperator` e `setSelectedOperator` (linha 475)
- `selectedWeek` e `setSelectedWeek` (linha 479)
- `selectedQuarter` e `setSelectedQuarter` (linha 482)
- `selectedYear` e `setSelectedYear` (linha 485)
- `selectedProvince` e `setSelectedProvince` (linha 1050)
- Os `useEffect` que guardam filtros no `localStorage` (linhas 496–510)

```js
// hooks/state/useFilters.js
// Responsabilidade: estado e persistência dos filtros de navegação
// Máx. 80 linhas

export const useFilters = () => {
  const [selectedOperator, setSelectedOperator] = useState(
    () => lsGet(LS_KEYS.OPERATOR) || 'FIBRASOL'
  );
  // ... restantes filtros
  
  // Persistir automaticamente no localStorage quando mudam
  useEffect(() => { lsSet(LS_KEYS.OPERATOR, selectedOperator); }, [selectedOperator]);
  // ...

  return { selectedOperator, setSelectedOperator, selectedWeek, ... };
};
```

**5.2 — Criar `hooks/state/useAppState.js`**

Mover de `App.jsx`:
- `data` e `setData` com inicialização do `localStorage` (linha 397)
- `distribuicaoReparacoes` e `setDistribuicaoReparacoes` (linha 436)
- `justificativas` e `setJustificativas` (linha 453)
- `rotasTestadas` e `setRotasTestadas` (linha 604)
- `rotasValidadas` e `setRotasValidadas` (linha 616)
- Todos os estados de UI: `showModal`, `selectedRota`, `showRepairTypeModal`, `pendingRepairData`, etc.
- Estados de paginação: `currentPageDrilldown`, `currentPageAcomp`, etc.
- Estados de visualização: `viewMode`, `viewModeClassificacao`, `currentGraph`, etc.

```js
// hooks/state/useAppState.js
// Responsabilidade: estado central dos dados do app
// Máx. 150 linhas — se ultrapassar, dividir por domínio
```

**5.3 — Criar `hooks/state/usePersistence.js`**

Mover de `App.jsx` os `useEffect` de sincronização (linhas 1698–1975):
- useEffect #1: guardar `data` no `localStorage` + Supabase (com debounce)
- useEffect #2: guardar `justificativas` no Supabase
- useEffect #3: carregar distribuição do Supabase ao mudar de ano
- useEffect #4: guardar distribuição no Supabase (com debounce)
- useEffect #5: guardar `rotasTestadas` e `rotasValidadas` no `localStorage`

**Atenção crítica:** A ordem dos `useEffect` dentro deste hook deve ser exactamente a mesma que está em `App.jsx`. Alterar a ordem pode mudar o comportamento de sincronização.

```js
// hooks/state/usePersistence.js
// Responsabilidade: sincronização automática entre estado, localStorage e Supabase
// Máx. 150 linhas
// Recebe os dados como parâmetro — não acede directamente ao estado global

export const usePersistence = ({
  data, justificativas, distribuicaoReparacoes,
  selectedYear, selectedQuarter, selectedOperator
}) => {
  // Todos os useEffects de sincronização aqui
  return { saveStatus, lastSaveTime, isLoadingDistribuicao };
};
```

**5.4 — Criar `hooks/state/useScrollHeader.js`**

Mover de `App.jsx`:
- `scrollContainerRef`, `lastScrollY`, `headerVisible` (linhas 762–799)
- O `useEffect` de detecção de scroll

```js
// hooks/state/useScrollHeader.js
// Responsabilidade: esconder/mostrar header ao scroll
// Máx. 40 linhas
```

**O que NÃO é feito nesta fase:** Mover qualquer cálculo de negócio ou componente UI.

**Critério de conclusão:** App corre. Filtros persistem ao recarregar. Dados sincronizam com Supabase. Scroll do header funciona.

---

### FASE 6 — Hooks de Lógica de Negócio (5–6 horas)

**Propósito:** Extrair todos os `useMemo` complexos que calculam os dados derivados (dashboard, classificação, alertas, etc.) para hooks dedicados. Cada hook tem uma responsabilidade única e recebe exactamente os dados que precisa.

**Regra desta fase:** Cada hook recebe parâmetros explícitos. Nunca receber um objecto enorme como `state` inteiro — apenas as chaves necessárias.

**O que é feito:**

**6.1 — Criar `hooks/business/useDashboard.js`**

Mover de `App.jsx`:
- `useMemo` da FASE 11 (linhas 3289–3706): calcula `executiveDashboard` com os 8 KPI cards
- `useMemo` `statsGlobais` (linhas 3707+)

```js
// hooks/business/useDashboard.js
// Responsabilidade: calcular métricas do dashboard executivo
// Máx. 200 linhas — algoritmo complexo mas com responsabilidade única
// Input: { data, routesByPSM, selectedOperator, selectedWeek, selectedQuarter,
//          selectedYear, rotasValidadas, getValorReduzido }
// Output: { executiveDashboard, statsGlobais }
```

**6.2 — Criar `hooks/business/useClassificacao.js`**

Mover de `App.jsx`:
- `useMemo` da FASE 15 (linhas 4670–4770): classifica rotas em Degradadas, Com Ganho, Estáveis

```js
// hooks/business/useClassificacao.js
// Responsabilidade: classificação de rotas por tendência de performance
// Máx. 100 linhas
// Output: { degradadas, comGanho, estaveis }
```

**6.3 — Criar `hooks/business/useAlertas.js`**

Mover de `App.jsx`:
- `useMemo` dos alertas (linha 4403): detecta rotas críticas e gera notificações

```js
// hooks/business/useAlertas.js
// Responsabilidade: detecção automática de alertas e anomalias
// Máx. 120 linhas
// Output: { alertas, alertasNaoLidos }
```

**6.4 — Criar `hooks/business/useTestes.js`**

Mover de `App.jsx`:
- `useEffect` de cálculo de `testesData` e `todosTestesData` (linhas 800–1032)

```js
// hooks/business/useTestes.js
// Responsabilidade: calcular efetividade de testes por PSM e globalmente
// Máx. 150 linhas
// Output: { testesData, todosTestesData }
```

**6.5 — Criar `hooks/business/useTendencias.js`**

Mover de `App.jsx`:
- `useMemo` da FASE 16 (linhas 4900–5053): calcula série temporal para gráfico de tendências

```js
// hooks/business/useTendencias.js
// Responsabilidade: calcular dados históricos para gráfico de linhas
// Máx. 100 linhas
// Output: { trendData }
```

**6.6 — Criar `hooks/business/usePieChart.js`**

Mover de `App.jsx`:
- `useMemo` da FASE 14 (linhas 5054–5210): calcula dados para o anel duplo SVG

```js
// hooks/business/usePieChart.js
// Responsabilidade: calcular percentagens para o gráfico circular duplo
// Máx. 100 linhas
// Output: { pieData: { outer, inner } }
```

**6.7 — Criar `hooks/business/useIntervencoes.js`**

Mover de `App.jsx`:
- `useMemo` das intervenções recentes (linha 4084)
- `useMemo` das rotas normalizadas (linha 4187)
- `useMemo` das rotas sem intervenção (linha ~4400)

```js
// hooks/business/useIntervencoes.js
// Responsabilidade: calcular listas paginadas de intervenções e normalizações
// Máx. 120 linhas
// Output: { intervencoesRecentes, rotasNormalizadas, rotasSemIntervencao }
```

**O que NÃO é feito nesta fase:** Mover qualquer componente UI.

**Critério de conclusão:** App corre. Dashboard mostra valores correctos. Classificação de rotas correcta. Alertas a funcionar. Gráficos com dados correctos.

---

### FASE 7 — Backoffice (4–5 horas)

**Propósito:** Criar o módulo de administração com gestão de utilizadores, roles, auditoria e configurações. Esta é funcionalidade nova — não interfere com nada existente.

**O que é feito:**

**7.1 — Criar `features/Backoffice/Users/useUsers.js`**

```js
// features/Backoffice/Users/useUsers.js
// Responsabilidade: estado e operações CRUD de utilizadores
// Máx. 100 linhas

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => { ... };
  const createUser = async (data) => { ... };     // chama userService + logAction
  const updateUser = async (id, data) => { ... }; // chama userService + logAction
  const deactivateUser = async (id) => { ... };   // soft delete + logAction

  return { users, loading, error, createUser, updateUser, deactivateUser };
};
```

**7.2 — Criar `features/Backoffice/Users/UserList.jsx`**

```jsx
// Responsabilidade: tabela de utilizadores com filtro e paginação
// Máx. 150 linhas
// Props: { users, onEdit, onDeactivate, loading }
```

**7.3 — Criar `features/Backoffice/Users/UserForm.jsx`**

```jsx
// Responsabilidade: formulário de criação/edição de utilizador
// Máx. 150 linhas
// Campos: nome, email, role, psm_access (checkboxes), is_active
// Props: { user (para edição), onSave, onCancel }
```

**7.4 — Criar `features/Backoffice/Audit/AuditLog.jsx`**

```jsx
// Responsabilidade: tabela de auditoria com filtros de utilizador/data/acção
// Máx. 150 linhas
```

**7.5 — Criar `features/Backoffice/Settings/AppSettings.jsx`**

```jsx
// Responsabilidade: configurações editáveis pelo admin
// Máx. 150 linhas
// Inclui: nome da aplicação, operadores activos, anos disponíveis
```

**7.6 — Criar `features/Backoffice/BackofficeLayout.jsx`**

```jsx
// Responsabilidade: layout do backoffice com sidebar e área de conteúdo
// Máx. 80 linhas
// Navegação interna: Utilizadores | Roles | Auditoria | Configurações
```

**7.7 — Criar `pages/BackofficePage.jsx`**

```jsx
// pages/BackofficePage.jsx
// Responsabilidade: wrapper de página do backoffice com RoleGuard
// Máx. 30 linhas

const BackofficePage = () => (
  <RoleGuard allowedRoles={['admin']}>
    <BackofficeLayout />
  </RoleGuard>
);
```

**O que NÃO é feito nesta fase:** Alterar qualquer lógica do app principal.

**Critério de conclusão:** Admin consegue fazer login → aceder ao backoffice → criar/editar utilizadores → ver log de auditoria. Utilizador com role `viewer` não consegue aceder ao backoffice.

---

### FASE 8 — Componentes UI Partilhados (3–4 horas)

**Propósito:** Extrair os componentes de UI que são usados em múltiplos lugares para uma biblioteca interna de componentes reutilizáveis.

**O que é feito:**

**8.1 — Criar `components/ui/Modal.jsx`**

```jsx
// Responsabilidade: wrapper modal genérico reutilizável
// Máx. 80 linhas
// Props: { isOpen, onClose, title, children, size ('sm'|'md'|'lg'|'xl') }
// Já usado em: RepairTypeModal, StatusDrilldown, ValidacaoTable, UserForm
```

**8.2 — Criar `components/ui/Button.jsx`**

```jsx
// Responsabilidade: botão com variantes (primary, secondary, danger, ghost)
// Máx. 50 linhas
// Props: { variant, size, loading, disabled, onClick, children }
```

**8.3 — Criar `components/ui/ConfirmDialog.jsx`**

```jsx
// Responsabilidade: diálogo de confirmação para acções destrutivas
// Máx. 60 linhas
// Substitui os `confirm()` nativos do browser actualmente no código
// Props: { isOpen, title, message, onConfirm, onCancel, danger }
```

**8.4 — Criar `components/layout/Header.jsx`**

Mover de `App.jsx` a barra de topo:
- Logo e nome da aplicação
- Menu hamburger (mobile)
- Botão de modo apresentação
- Informação do utilizador + logout

```jsx
// Responsabilidade: barra de topo da aplicação
// Máx. 100 linhas
// Props: { selectedOperator, presentationMode, onToggleMenu, user, onLogout }
```

**8.5 — Criar `components/form/FilterBar.jsx`**

Mover de `App.jsx` os selectores:
- Selector de PSM (FIBRASOL/ISISTEL/ANGLOBAL)
- Selector de semana (W1–W52)
- Selector de quarter (Q1/Q2/Q3)
- Selector de ano

```jsx
// Responsabilidade: barra de filtros de navegação
// Máx. 100 linhas
// Props: { filters, onFilterChange, availablePSMs }
```

**8.6 — Criar `components/feedback/AlertaBell.jsx`**

Mover de `App.jsx` o sino de alertas com badge de contagem e dropdown.

```jsx
// Responsabilidade: notificações de alertas do sistema
// Máx. 80 linhas
// Props: { alertas, alertasLidos, onMarcarLido }
```

**8.7 — Criar `components/feedback/SaveStatus.jsx`**

Mover de `App.jsx` o indicador de estado de gravação (`saveStatus`, `lastSaveTime`).

```jsx
// Responsabilidade: mostrar estado de sincronização (a gravar / gravado / erro)
// Máx. 40 linhas
```

**8.8 — Criar `components/feedback/MobileWarning.jsx`**

```jsx
// Responsabilidade: aviso de optimização para desktop
// Máx. 50 linhas
```

**O que NÃO é feito nesta fase:** Mover features completas.

**Critério de conclusão:** Todos os componentes partilhados funcionam. Modais abrem e fecham. Filtros actualizam os dados.

---

### FASE 9 — Features UI (8–12 horas)

**Propósito:** Extrair as grandes secções do JSX do `App.jsx` para componentes de feature dedicados. Esta é a fase com maior volume de trabalho.

**Ordem de extracção** (da mais independente para a mais integrada):

**9.1 — `features/Apresentacao/PresentationMode.jsx`**

Este é o mais fácil porque já existe como um `if (presentationMode) return (...)` completo — uma árvore de render separada.

Extrair as ~400 linhas do modo apresentação para o componente, passando como props todos os dados calculados pelos hooks de negócio.

**9.2 — `features/Testes/TestesAnalises.jsx`**

Já condicionado por `showTestesAnalises`. Extrair as ~350 linhas do painel de testes, dividindo em:
- `TestesAnalises.jsx` — composição (~60 linhas)
- `ResumoRotas.jsx` — painel esquerdo de resumo (~100 linhas)
- `StatusTecnico.jsx` — indicadores de status técnico (~100 linhas)
- `GraficosEfetividade.jsx` — gráficos de barras de efetividade (~120 linhas)

**9.3 — `features/DataEntry/DataEntryTable.jsx`**

Extrair a tabela editável de inputs semanais, dividindo em:
- `DataEntryTable.jsx` — estrutura da tabela (~100 linhas)
- `DataEntryRow.jsx` — linha individual com inputs (~80 linhas)
- `RepairTypeModal.jsx` — modal de distribuição de reparações (~120 linhas)

Mover os handlers `handleInputChange` e `handleBlurTotalReparadas` para `features/DataEntry/hooks/useDataEntry.js`.

**9.4 — `features/Dashboard/ExecutiveDashboard.jsx`**

Dividir em:
- `ExecutiveDashboard.jsx` — composição de todos os blocos (~80 linhas)
- `KpiCard.jsx` — um card individual (~60 linhas)
- `KpiCardGrid.jsx` — grelha dos 8 cards (~60 linhas)
- `StatusDrilldown.jsx` — modal de detalhe por status (~120 linhas)
- `Top5Criticas.jsx` — lista das 5 rotas mais críticas (~100 linhas)

**9.5 — `features/Dashboard/charts/PieChartAnelDuplo.jsx`**

Extrair o gráfico SVG de anel duplo — é o componente SVG mais complexo (~300 linhas). Pode ultrapassar o limite de 200 linhas por ser SVG geométrico — documentar bem.

**9.6 — `features/Analise/`**

Dividir em:
- `ClassificacaoChart.jsx` — gráficos de barras por classificação
- `TendenciasChart.jsx` — gráfico de linhas temporal
- `AcompanhamentoTable.jsx` — tabela de acompanhamento
- `EfetividadeGauge.jsx` — gauge de efetividade por província
- `IntervencoesRecentes.jsx` — lista paginada de intervenções

**9.7 — `features/ImportExport/`**

Mover os handlers de importação/exportação para `hooks/useImportData.js` e `hooks/useExportData.js` dentro desta feature.

**Padrão de extracção para cada componente:**
```jsx
// ANTES (em App.jsx): bloco inline de 400 linhas
{showTestesAnalises && (
  <div className="fixed inset-0 ...">
    {/* 400 linhas de JSX */}
  </div>
)}

// DEPOIS (em App.jsx): 6 linhas
import { TestesAnalises } from './features/Testes/TestesAnalises';

{showTestesAnalises && (
  <TestesAnalises
    data={testesData}
    todosTestesData={todosTestesData}
    selectedOperator={selectedOperator}
    selectedQuarter={selectedQuarter}
    onClose={() => setShowTestesAnalises(false)}
  />
)}
```

**Critério de conclusão:** Todos os componentes renderizam correctamente. Interacções (edição de cells, modais, gráficos) funcionam. `App.jsx` tem menos de 300 linhas.

---

### FASE 10 — Roteamento e App Shell Final (2–3 horas)

**Propósito:** Criar o sistema de roteamento e reduzir o `App.jsx` a um orquestrador puro com ~60 linhas.

**O que é feito:**

**10.1 — Criar `router/routes.js`**

```js
// router/routes.js
// Responsabilidade: definição centralizada de todas as rotas
// Máx. 40 linhas

export const ROUTES = {
  LOGIN:      '/login',
  MAIN:       '/',
  BACKOFFICE: '/backoffice',
  USERS:      '/backoffice/users',
  AUDIT:      '/backoffice/audit',
  SETTINGS:   '/backoffice/settings',
  NOT_FOUND:  '*',
};
```

**10.2 — Criar `router/AppRouter.jsx`**

```jsx
// router/AppRouter.jsx
// Responsabilidade: definição de rotas com guards de autenticação
// Máx. 60 linhas

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.MAIN} element={
        <ProtectedRoute>
          <MainPage />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.BACKOFFICE + '/*'} element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={['admin']}>
            <BackofficePage />
          </RoleGuard>
        </ProtectedRoute>
      } />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
```

**10.3 — Criar `pages/MainPage.jsx`**

```jsx
// pages/MainPage.jsx
// Responsabilidade: composição do app principal (antigo App.jsx gigante)
// Máx. 100 linhas — apenas composição de hooks e features

const MainPage = () => {
  const filters = useFilters();
  const appState = useAppState();
  const persistence = usePersistence({ ...appState, ...filters });
  const dashboard = useDashboard({ ...appState, ...filters });
  const classificacao = useClassificacao({ ...appState, ...filters });
  const alertas = useAlertas({ ...appState, ...filters });
  const { canEdit, canExport } = usePermissions();

  if (appState.presentationMode) return <PresentationMode {...} />;

  return (
    <div>
      <Header {...filters} onLogout={...} />
      {appState.showTestesAnalises && <TestesAnalises {...} />}
      <FilterBar {...filters} />
      <KpiCardGrid dashboard={dashboard} />
      <DataEntryTable {...appState} canEdit={canEdit} />
      <ClassificacaoChart classificacao={classificacao} />
      {/* etc. */}
    </div>
  );
};
```

**10.4 — Simplificar `App.jsx` final**

```jsx
// App.jsx — apenas providers (~60 linhas)
const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
```

**Critério de conclusão:** App completo a funcionar com routing. Login redireciona para `/`. Backoffice acessível apenas para admin. Não há nenhuma funcionalidade perdida.

---

### FASE 11 — Revisão de Segurança e Qualidade (3–4 horas)

**Propósito:** Auditoria final de segurança, limpeza de código e verificação de todos os requisitos de segurança.

**O que é feito:**

**11.1 — Auditoria de segurança**

- Verificar que nenhuma chave Supabase está hardcoded
- Verificar que o `.gitignore` inclui `.env`
- Verificar que todos os `console.log` foram substituídos por `logger.log`
- Verificar que RLS está activo em todas as tabelas Supabase
- Verificar que inputs do utilizador passam por `validators.js` antes de serem guardados

**11.2 — Verificar limites de linhas**

Usar o comando abaixo para identificar ficheiros que ultrapassam o limite:
```bash
find src/ -name "*.jsx" -o -name "*.js" | xargs wc -l | sort -rn | head -20
```
Qualquer ficheiro com mais de 250 linhas deve ser revisto para possível subdivisão.

**11.3 — Remover código morto**

- Remover `console.log` não substituídos
- Remover variáveis e funções não utilizadas
- Remover imports não utilizados

**11.4 — Verificar `ErrorBoundary`**

Garantir que `components/feedback/ErrorBoundary.jsx` está a envolver os componentes críticos para que um erro num gráfico não derrube o app inteiro.

**Critério de conclusão:** Zero chaves hardcoded. Zero `console.log` em produção. Todos os inputs validados. RLS activo. ErrorBoundary em produção.

---

## PARTE V — REFERÊNCIA RÁPIDA

### 5.1 Cronograma Estimado

| Fase | Descrição | Estimativa | Risco |
|---|---|---|---|
| 0 | Preparação e ambiente | 2–3h | Baixo |
| 1 | Configuração e constantes | 2–3h | Baixo |
| 2 | Serviços de dados | 3–4h | Baixo |
| 3 | Utilitários puros | 3–4h | Baixo |
| 4 | Autenticação e utilizadores | 4–5h | Médio |
| 5 | Hooks de estado | 4–5h | Médio |
| 6 | Hooks de lógica de negócio | 5–6h | Médio-alto |
| 7 | Backoffice | 4–5h | Médio |
| 8 | Componentes UI partilhados | 3–4h | Baixo |
| 9 | Features UI | 8–12h | Alto |
| 10 | Roteamento e App Shell final | 2–3h | Baixo |
| 11 | Revisão de segurança | 3–4h | Baixo |
| **Total** | | **43–58h** | |

### 5.2 Tamanho Esperado dos Ficheiros

| Tipo de ficheiro | Máx. linhas | Justificação |
|---|---|---|
| Página (`pages/`) | 100 | Apenas composição |
| Feature container | 100 | Apenas composição |
| Componente UI | 80–150 | Pode ter JSX e lógica local simples |
| Gráfico SVG complexo | 200 | SVG geométrico justifica mais linhas |
| Hook de estado | 150 | Pode ter vários `useState` relacionados |
| Hook de negócio | 200 | Algoritmos complexos mas unitários |
| Serviço | 150 | Múltiplas funções CRUD relacionadas |
| Utilitário | 80 | Funções puras simples |
| Config | 30–180 | Dados estáticos (rotas pode ser grande) |
| `App.jsx` final | 60 | Apenas providers |

### 5.3 Transformação Final

| Métrica | Antes | Depois |
|---|---|---|
| `App.jsx` | 11.571 linhas | ~60 linhas |
| Ficheiros totais | 3 | ~75 |
| Maior ficheiro | 11.571 linhas | ~250 linhas |
| Funcionalidades alteradas | — | Nenhuma |
| Gestão de utilizadores | Não existe | Sim (admin) |
| Backoffice | Não existe | Sim |
| Auditoria de acções | Não existe | Sim |
| Testabilidade | Impossível | Alta (hooks e utils puros) |
