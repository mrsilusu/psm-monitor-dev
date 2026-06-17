# PSM Monitor — Roadmap: Gestão Dinâmica de Rotas

**Estado base confirmado (2026-06-15):**
- Tabela `route_config` existe no Supabase com campos: `id`, `psm`, `route_name`, `province`, `is_active`, `display_order`
- Tabela está populada mas **não é lida pela app** — app usa ficheiros de constantes locais
- Tabela `psm_data` usa `route_name` como string (sem FK para `route_config`)
- Backoffice tem secções: Utilizadores, Auditoria, Configurações

---

## FASE A — Botão Voltar no Backoffice
**Complexidade:** Baixa | **Risco:** Nenhum | **Dependências:** Nenhuma

### Objetivo
Adicionar botão "← Visão Geral" no `BackofficeLayout.jsx` para navegar para `/`.

### Ficheiros
- `src/features/Backoffice/BackofficeLayout.jsx`

### Tarefas
- [x] Adicionar `import { useNavigate } from 'react-router-dom'`
- [x] Renderizar botão no topo do layout com `navigate('/')`

### Critério de conclusão
Clicar no botão redireciona para a página principal sem reload.

---

## FASE B — Adicionar `tipo_de_rede` à tabela `route_config`
**Complexidade:** Baixa | **Risco:** Baixo | **Dependências:** Nenhuma

### Objetivo
Estender a tabela existente com o campo de tipo de rede para cada rota.

### SQL a executar no Supabase
```sql
ALTER TABLE route_config
  ADD COLUMN tipo_de_rede TEXT CHECK (tipo_de_rede IN ('Metro', 'Backbone')) DEFAULT 'Backbone';
```

### Tarefas
- [ ] Executar o SQL acima no Supabase SQL Editor
- [ ] Atualizar os registos existentes com o tipo correto (seed manual ou via backoffice)

### Critério de conclusão
Coluna `tipo_de_rede` visível no Table Editor do Supabase.

---

## FASE C — Hook `useRouteConfig` (fonte de verdade → Supabase)
**Complexidade:** Média | **Risco:** Médio | **Dependências:** Fase B

### Objetivo
Criar hook que lê rotas do Supabase e disponibiliza os mesmos dados que os ficheiros de constantes atuais, garantindo compatibilidade retroativa.

### Ficheiros novos
- `src/hooks/data/useRouteConfig.js`

### Interface do hook
```js
const {
  routes,           // array: [{ id, route_name, psm, province, tipo_de_rede, is_active }]
  routesByPsm,      // objeto: { ISISTEL: [...], FIBRASOL: [...], ANGLOBAL: [...] }
  routeToProvince,  // objeto: { 'NomeRota': 'Provincia' }
  operatorToProvinces, // objeto: { ISISTEL: ['Cabinda', ...] }
  allPsms,          // array: ['ISISTEL', 'FIBRASOL', 'ANGLOBAL']
  loading,
  refetch,
} = useRouteConfig();
```

### Tarefas
- [x] Criar `src/hooks/state/useRouteConfig.js` com query ao Supabase
- [x] Construir `routesByPsm`, `routeToProvince`, `operatorToProvinces` dinamicamente
- [x] Implementar cache local com `useState` + `useEffect`
- [x] Exportar `refetch` para atualizar após criar/editar rota no backoffice
- [x] Adicionar `routes` (array raw), `allPsms` à interface do hook

### Critério de conclusão
Hook retorna os mesmos dados que os ficheiros de constantes, verificado com `console.log`.

---

## FASE D — Integrar `useRouteConfig` na app principal
**Complexidade:** Média | **Risco:** Médio | **Dependências:** Fase C

### Objetivo
Substituir as importações de constantes locais pelo hook dinâmico sem quebrar dados existentes.

### Ficheiros a modificar
- `src/hooks/state/useAppState.js` — inicializar estrutura de dados com rotas do Supabase
- `src/features/Analise/AcompanhamentoTable.jsx` — usar `routesByPsm` do hook
- `src/hooks/state/useFilters.js` — usar `operatorToProvinces` e `allPsms` do hook
- `src/features/Layout/HeaderFilters.jsx` — dropdowns de PSM e Província dinâmicos
- `src/pages/MainPage.jsx` — passar `routeConfig` como prop ou via context

### Tarefas
- [x] Chamar `useRouteConfig()` no `MainPage.jsx`
- [x] Passar `routesByPsm` para hooks (`useIntervencoes`, `useTendencias`, `useDashboard`)
- [x] Passar `operatorToProvinces` e `allPsms` para `useFilters` e `HeaderFilters`
- [x] Remover import morto de `routeConfig.js` em `AcompanhamentoTable.jsx`
- [x] PSM dropdown em `HeaderFilters` usa `allPsms` dinâmico
- [ ] Passar `routesByPsm` dinâmico para `useAppState.createInitialData` (risco: timing async)
- [ ] Testar: rotas aparecem na tabela de introdução de dados

### Critério de conclusão
Adicionar uma rota no Supabase → aparece imediatamente na tabela de dados após reload.

---

## FASE E — Backoffice: Gestão de Rotas (CRUD)
**Complexidade:** Alta | **Risco:** Baixo | **Dependências:** Fases B, C

### Objetivo
Nova secção "Rotas" no backoffice com listagem e formulário para criar/editar rotas com todos os campos incluindo `tipo_de_rede`.

### Ficheiros novos
```
src/features/Backoffice/Routes/
  ├── RouteList.jsx       — tabela paginada de rotas com filtro por PSM
  ├── RouteForm.jsx       — formulário criar/editar rota
  └── useRouteAdmin.js    — hook com createRoute, updateRoute, toggleActive
```

### Ficheiros a modificar
- `src/features/Backoffice/BackofficeLayout.jsx` — adicionar item "Rotas" ao NAV_ITEMS

### Campos do formulário RouteForm
| Campo | Tipo | Validação |
|---|---|---|
| `route_name` | text | obrigatório, único por PSM |
| `psm` | select | ISISTEL / FIBRASOL / ANGLOBAL + novos |
| `province` | select | lista dinâmica por PSM |
| `tipo_de_rede` | radio | Metro / Backbone |
| `display_order` | number | inteiro positivo |
| `is_active` | toggle | default true |

### Tarefas
- [x] Criar `useRouteManager.js` com operações CRUD no Supabase (audit log incluído)
- [x] Criar `RouteManager.jsx` com tabela paginada por PSM, botões Editar/Ativar/Apagar
- [x] Criar `RouteForm.jsx` com validação, PSM/Província, `tipo_de_rede` radio
- [x] Adicionar "Rotas" ao `NAV_ITEMS` em `BackofficeLayout.jsx`
- [ ] Chamar `refetch()` do `useRouteConfig` após criar/editar (invalidar cache app principal)

### Critério de conclusão
Admin cria rota no backoffice → rota aparece na tabela de introdução de dados.

---

## FASE F — Backoffice: Gestão de PSMs e Províncias
**Complexidade:** Média | **Risco:** Baixo | **Dependências:** Fase E

### Objetivo
Permitir criar novos PSMs e províncias diretamente no backoffice, sem tocar no código.

### Abordagem
Usar a tabela `app_settings` (já existe no Supabase) para guardar listas de PSMs e províncias, ou criar tabelas dedicadas `psm_config` e `province_config`.

### SQL sugerido
```sql
CREATE TABLE psm_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE province_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  psm_id UUID REFERENCES psm_config(id),
  is_active BOOLEAN DEFAULT TRUE
);
```

### Tarefas
- [ ] Criar tabelas `psm_config` e `province_config` no Supabase
- [ ] Seed com dados atuais (ISISTEL, FIBRASOL, ANGLOBAL + suas províncias)
- [ ] Criar secção "PSMs / Províncias" no backoffice
- [ ] Atualizar `useRouteConfig` e `RouteForm` para ler PSMs e províncias destas tabelas

### Critério de conclusão
Admin cria novo PSM → aparece nos dropdowns de filtro e no formulário de rotas.

---

## FASE G — Integridade Referencial (opcional / longo prazo)
**Complexidade:** Alta | **Risco:** Alto | **Dependências:** Todas anteriores

### Objetivo
`psm_data` e outras tabelas passam a referenciar `route_config.id` em vez de guardar o nome como string.

### Aviso
Esta fase requer **migração de dados existentes** e é irreversível. Só deve ser feita quando todas as rotas em `psm_data` tiverem correspondência confirmada em `route_config`.

### SQL
```sql
ALTER TABLE psm_data ADD COLUMN route_id UUID REFERENCES route_config(id);
-- Migrar: UPDATE psm_data SET route_id = (SELECT id FROM route_config WHERE route_name = psm_data.route LIMIT 1);
-- Verificar: SELECT COUNT(*) FROM psm_data WHERE route_id IS NULL;
-- Após validação: ALTER TABLE psm_data ALTER COLUMN route_id SET NOT NULL;
```

### Critério de conclusão
Zero registos órfãos em `psm_data`. Queries de dados usam JOIN em vez de string matching.

---

## Estado atual das fases

| Fase | Descrição | Estado |
|---|---|---|
| A | Botão Voltar no Backoffice | ✅ Concluído |
| B | Campo `tipo_de_rede` na tabela | 🟡 SQL pendente (executar no Supabase) |
| C | Hook `useRouteConfig` | ✅ Concluído |
| D | Integrar hook na app principal | 🟡 Parcial (falta `useAppState` dinâmico) |
| E | Backoffice CRUD de Rotas | ✅ Concluído (col. `tipo_de_rede` visível após B) |
| F | Backoffice CRUD de PSMs e Províncias | ⬜ Pendente |
| G | Integridade referencial (FK) | ⬜ Pendente |

---

## Notas de risco

- **Fases A e B** são seguras e independentes — podem ser feitas em paralelo
- **Fase D** é o ponto de maior risco: substituir constantes por dados dinâmicos pode causar estado vazio se o Supabase demorar a responder. Mitigação: manter constantes como fallback até a query confirmar dados
- **Fase G** nunca deve ser feita sem backup completo da tabela `psm_data`
