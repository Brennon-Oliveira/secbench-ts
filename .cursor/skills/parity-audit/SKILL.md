---
name: parity-audit
description: Verifica pareamento V/S completo e equivalência funcional aproximada. Use após alterar qualquer caso.
---

# Auditoria de paridade

## Passos
1. `npm run build:corpus` e inspecionar `totals` e pares em `ground-truth.json`.
2. Para cada `pairId`, confirmar um V e um S.
3. Comparar entryPoint/source/sinkApi e tamanhos de intervalo.
4. Confirmar teste de proof existente.

## Sucesso
Relatório de paridade limpo (sem órfãos).
