# PSM Monitor — Plano de Acção de Bugs

> **Regra:** Consultar este ficheiro ANTES de tocar em qualquer bug.
> Actualizar o estado (`⬜ Pendente` → `🔄 Em progresso` → `✅ Concluído`) a cada avanço.

---

## Estado Geral

| Bug | Título | Prioridade | Estado |
|-----|--------|-----------|--------|
| B1  | Total Reparadas considera 10% menos | 🔴 Crítico | ✅ Concluído |
| B2  | Rotas estáticas ausentes nos cards | 🔴 Crítico | ✅ Concluído |
| B3  | Rotas dinâmicas fora de ordem alfabética | 🟡 Alto | ✅ Concluído |
| B4  | Gráfico de tipo não reduz ao reparar | 🟡 Alto | ✅ Concluído |
| B5  | Condição de fibras normalizadas errada | 🟢 Médio | ✅ Concluído |

---

## B1 — Total Reparadas considera 10% menos

### Descrição do problema
Quando o utilizador insere um valor em **Total Reparadas**, o sistema distribui menos do que o valor digitado:
- Inserir `10` → considera `9` (falta 1)
- Inserir `20` → considera `18` (falta 2)
- Inserir `30` → considera `27` (falta 3)

O padrão é: `considerado = inserido - primeiroDigito`.

### Causa raiz confirmada
**Ficheiro:** `src/utils/fibraLogic.js` — linha **119**

Quando o utilizador digita "30" caractere a caractere, `handleInputChange` é chamado a cada keystroke:

1. Digita `"3"` → `diferenca = 3`, distribui 3 → `distribuicao[semanaCurrent][Reconhecidas] = 3`
2. Digita `"0"` (formando `"30"`) → o loop `descontoAcumulado` inclui a semana actual (`w <= weekNum`), encontra o "3" já distribuído no passo 1 → **disponível = 30 − 3 = 27** → distribui apenas 27

```js
// CÓDIGO ACTUAL (bug):
for (let w = trimestreAtual.start; w <= weekNum; w++) {  // ← inclui semana actual
  descontoAcumulado += distribuicaoReparacoes[selectedYear]?.[psm]?.[semana]?.[route]?.[campo] || 0;
}
```

O `descontoAcumulado` da **semana actual** contamina o cálculo de disponibilidade durante a digitação, pois o SET da distribuição no passo anterior ainda está em memória.

### Correcção
**Ficheiro:** `src/utils/fibraLogic.js` — **apenas** o loop de `tiposComValor` (linha ~119)

```js
// DEPOIS (corrigido):
for (let w = trimestreAtual.start; w < weekNum; w++) {  // ← exclui semana actual
  descontoAcumulado += distribuicaoReparacoes[selectedYear]?.[psm]?.[semana]?.[route]?.[campo] || 0;
}
```

> ⚠️ **NÃO alterar** o loop equivalente em `src/utils/valueUtils.js` (`getValorReduzido`).
> Lá o `<= weekNum` é correcto — serve para MOSTRAR o valor já reduzido.

### Testes a realizar após a correcção
- [ ] Inserir `10` em Total Reparadas com Reconhecidas = 10 → distribuição deve ser 10, Reconhecidas deve mostrar 0
- [ ] Inserir `20` → distribuição 20
- [ ] Inserir `30` → distribuição 30
- [ ] Verificar que digitar "3" depois "0" (formando "30") produz resultado igual a digitar "30" directamente
- [ ] Verificar que semanas anteriores com distribuição não são afectadas

### Estado
✅ Concluído — 2026-06-19
Alterado `<= weekNum` para `< weekNum` na linha 118 de `fibraLogic.js`.

---

## B2 — Rotas estáticas ausentes nos cards

### Descrição do problema
Somente as rotas adicionadas dinamicamente (via Backoffice → Gestão de Rotas) aparecem nos cards e na tabela de entrada. As rotas definidas estaticamente em `routeConfig.js` não aparecem.

### Causa raiz confirmada
**Ficheiro:** `src/services/routeConfigService.js` — função `seedRoutesIfEmpty`

```js
// Se a tabela já tem qualquer registo (count > 0), o seed é saltado
if (countError || count > 0) return { seeded: false, error: countError };
```

Se uma única rota dinâmica foi inserida manualmente antes do seed (ou se o seed nunca correu porque a tabela já tinha dados), as **104 rotas estáticas** nunca são inseridas. Resultado: o Supabase só tem as rotas dinâmicas e `buildMapsFromRows` só retorna essas.

**Ficheiro:** `src/hooks/state/useRouteConfig.js` — função `buildMapsFromRows`

A função só usa as linhas do Supabase — não incorpora as rotas estáticas como fallback base.

### Correcção
**Ficheiro:** `src/hooks/state/useRouteConfig.js`

Modificar `buildMapsFromRows` para **sempre partir das rotas estáticas** e adicionar as dinâmicas por cima:

```js
const buildMapsFromRows = (rows, staticRoutesByPsm, staticRouteToProvince) => {
  const routesByPsm = {};
  const routeToProvince = { ...staticRouteToProvince };
  const operatorToProvinces = {};

  // 1. Seed com todas as rotas estáticas
  Object.entries(staticRoutesByPsm).forEach(([psm, routes]) => {
    routesByPsm[psm] = [...routes];
    routes.forEach(r => {
      const prov = staticRouteToProvince[r];
      if (prov) {
        if (!operatorToProvinces[psm]) operatorToProvinces[psm] = [];
        if (!operatorToProvinces[psm].includes(prov)) operatorToProvinces[psm].push(prov);
      }
    });
  });

  // 2. Adicionar rotas dinâmicas que não estão nas estáticas
  rows.forEach(({ psm, route_name, province }) => {
    if (!routesByPsm[psm]) routesByPsm[psm] = [];
    if (!routesByPsm[psm].includes(route_name)) {
      routesByPsm[psm].push(route_name);
    }
    if (province) {
      routeToProvince[route_name] = province;
      if (!operatorToProvinces[psm]) operatorToProvinces[psm] = [];
      if (!operatorToProvinces[psm].includes(province)) operatorToProvinces[psm].push(province);
    }
  });

  // 3. Ordenar cada PSM alfabeticamente (resolve também o B3)
  Object.keys(routesByPsm).forEach(psm => {
    routesByPsm[psm].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
  });

  return {
    routesByPsm: safeArrayMap(routesByPsm),
    routeToProvince,
    operatorToProvinces: safeArrayMap(operatorToProvinces),
  };
};
```

Actualizar a chamada em `load()`:
```js
const maps = buildMapsFromRows(data, STATIC_ROUTES_BY_PSM, STATIC_ROUTE_TO_PROVINCE);
```

### Testes a realizar após a correcção
- [ ] Verificar que ISISTEL mostra 17 rotas nos cards (mesmo sem rotas dinâmicas)
- [ ] Verificar que FIBRASOL mostra 53 rotas
- [ ] Verificar que ANGLOBAL mostra 34 rotas
- [ ] Adicionar rota dinâmica via Backoffice → deve aparecer nos cards junto com as estáticas
- [ ] Verificar que a rota dinâmica não duplica uma estática com o mesmo nome

### Estado
✅ Concluído — 2026-06-19
`buildMapsFromRows` seed com rotas estáticas como base + adiciona dinâmicas por cima + ordena; a tabela de introdução manual usa `routesByPsm[selectedOperator]` que agora contém as 104 rotas estáticas.

---

## B3 — Rotas dinâmicas fora de ordem alfabética

### Descrição do problema
As rotas adicionadas dinamicamente aparecem nos cards fora da ordem alfabética definida em `routeConfig.js`. A lista de rotas nos cards e tabelas deve seguir sempre a mesma ordenação alfabética, sejam estáticas ou dinâmicas.

### Causa raiz confirmada
**Ficheiro:** `src/hooks/state/useRouteConfig.js` — função `buildMapsFromRows`

A função adiciona as rotas na ordem em que vêm do Supabase (por `display_order`, depois `route_name`). Rotas dinâmicas recém-adicionadas têm `display_order = 0` e acabam no topo ou em posição aleatória, quebrando a ordem.

### Correcção
Esta correcção está **incluída na correcção do B2** — o passo 3 do novo `buildMapsFromRows` ordena sempre alfabeticamente:

```js
Object.keys(routesByPsm).forEach(psm => {
  routesByPsm[psm].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
});
```

> ✅ Implementar em conjunto com B2 — são no mesmo ficheiro e função.

### Testes a realizar após a correcção
- [ ] Verificar que lista ISISTEL começa por `BSC_Cabinda - Quatro` (primeiro alfabeticamente)
- [ ] Adicionar rota dinâmica `"AAA - Teste"` → deve aparecer primeiro na lista
- [ ] Verificar que a ordenação é consistente entre cards, tabela de entrada e gráficos

### Estado
✅ Concluído — 2026-06-19
Incluído em B2: passo 3 de `buildMapsFromRows` ordena `routesByPsm[psm]` com `localeCompare('pt', {sensitivity:'base'})` após combinar estáticas + dinâmicas.

---

## B4 — Gráfico de tipo de indisponibilidade não reduz ao reparar

### Descrição do problema
Quando uma indisponibilidade do tipo "Reconhecidas" (ou outro tipo) é corrigida via Total Reparadas, o gráfico de classificação (Rotas Degradadas / Com Ganho / Estáveis) continua a mostrar o valor original de `Indisponíveis` por rota, em vez do valor reduzido pelas reparações já distribuídas.

### Causa raiz confirmada
**Ficheiro:** `src/features/Analise/ClassificacaoCarrossel.jsx` — linhas **141–144**

O valor de `indisponiveis` por rota usa o **campo bruto** `weekData['Indisponíveis']`:

```js
// CÓDIGO ACTUAL (bug):
const indisponiveisVal = parseInt(weekData['Indisponíveis']) || 0;
if (indisponiveisVal > 0) indisponiveis = indisponiveisVal;
```

As subcategorias (Reconhecidas, Dep. Passagem, etc.) já usam `getValorReduzido` correctamente (linhas 151–161), mas o campo `Indisponíveis` lido separadamente não reflecte as reduções.

> **Nota:** O gráfico de pizza (`usePieChart.js`) já está correcto — usa `getValorReduzido` para cada tipo. O problema é específico ao `ClassificacaoCarrossel`.

### Correcção
**Ficheiro:** `src/features/Analise/ClassificacaoCarrossel.jsx`

Remover a leitura do campo bruto `'Indisponíveis'` e calcular `indisponiveis` como soma das subcategorias já reduzidas (que são calculadas nas linhas seguintes do mesmo bloco):

```js
// REMOVER estas linhas (bug):
// const indisponiveisVal = parseInt(weekData['Indisponíveis']) || 0;
// if (indisponiveisVal > 0) indisponiveis = indisponiveisVal;

// SUBSTITUIR — calcular DEPOIS de obter os valores reduzidos das subcategorias:
// (mover para depois das linhas 151–161 onde reconhecidas, depPassagem, etc. são calculados)
const indisponiveisCalc = reconhecidas + depPassagem + depLicenca + depCutover + fibrasDep;
indisponiveis = indisponiveisCalc;
```

Isto garante que:
1. A classificação da rota (degradada / com ganho / estável) usa valores reduzidos
2. As barras por rota em `renderCompactRoutesChart` reflectem as reparações distribuídas

### Testes a realizar após a correcção
- [ ] Distribuir 5 reparações de Reconhecidas numa rota com Reconhecidas=10 → barra de Indisponíveis da rota deve mostrar 5
- [ ] Distribuir todas as reparações → rota deve sair de "Degradadas" e ir para outra categoria se aplicável
- [ ] Verificar que o "Dados Gerais" (já correcto) continua a mostrar valores correctos

### Estado
✅ Concluído — 2026-06-19
Subcategorias calculadas com `getValorReduzido(selectedWeek)` fora do loop de acumulação.
Raiz do bug anterior: padrão `if (val > 0) x = val` dentro do loop com variável `week` mantinha valores obsoletos quando a reparação reduzia a categoria a zero.

---

## B5 — Condição de fibras normalizadas incorrecta

### Descrição do problema
A lógica actual para determinar se uma rota está "normalizada" usa 4 condições complexas (condições 1 a 4). O requisito actualizado é mais simples: **uma rota está normalizada quando `Indisponíveis === Total Reparadas`**.

### Causa raiz
**Ficheiro:** `src/hooks/business/useIntervencoes.js` — linhas **143–176**

As condições actuais verificam combinações de `fibrasDependentes`, `transporte`, `indisponiveis` e `totalReparadas`. A nova regra é apenas:

```
indisponiveis === totalReparadas  AND  totalReparadas > 0
```

### Correcção
**Ficheiro:** `src/hooks/business/useIntervencoes.js`

Substituir o bloco de condições 1–4 pela condição única:

```js
// REMOVER condições 1 a 4 e substituir por:
const isNormalized = (
  totalReparadas > 0 &&
  indispFinal > 0 &&
  indispFinal === totalReparadas
);

if (isNormalized) {
  wasNormalized = true;
  normalizationWeek = week;
  normalizationCondition = 'Normalizada';
  break;
}
```

> O campo `indispFinal` é o valor de `'Indisponíveis'` lido retroactivamente (código existente nas linhas 128–133). Manter essa parte do código — apenas substituir o bloco de condições.

### Testes a realizar após a correcção
- [ ] Rota com Indisponíveis=10 e Total Reparadas=10 → deve aparecer em "Rotas Normalizadas"
- [ ] Rota com Indisponíveis=10 e Total Reparadas=5 → NÃO deve aparecer como normalizada
- [ ] Rota com Indisponíveis=0 e Total Reparadas=0 → NÃO deve aparecer como normalizada
- [ ] Verificar que a semana de normalização reportada é a semana correcta

### Estado
⬜ Pendente

---

## Notas Gerais

### Dependências entre bugs
```
B1 (fibraLogic) ──► afecta B4 (gráficos)
                    Os gráficos só mostram valores correctos se a distribuição (B1) estiver certa

B2 + B3 (useRouteConfig) ──► são a mesma correcção no mesmo ficheiro/função
```

### Ficheiros a tocar
| Ficheiro | Bugs | Linhas relevantes |
|----------|------|-------------------|
| `src/utils/fibraLogic.js` | B1 | 119 |
| `src/hooks/state/useRouteConfig.js` | B2, B3 | `buildMapsFromRows` |
| `src/features/Analise/ClassificacaoCarrossel.jsx` | B4 | 141–144 |
| `src/hooks/business/useIntervencoes.js` | B5 | 143–176 |

### Regra de trabalho
1. Consultar este ficheiro antes de iniciar qualquer bug
2. Marcar como `🔄 Em progresso` ao começar
3. Implementar apenas o que está descrito na secção "Correcção"
4. Executar os testes listados
5. Marcar como `✅ Concluído` e registar a data

---

*Criado em: 2026-06-19*
*Última actualização: 2026-06-19*
