---
name: regenerate-ground-truth
description: Regenera corpus e ground-truth.json, valida determinismo e divergências do catálogo. Use após alterar src/.
---

# Regeneração de gabarito

## Passos
1. `npm run build:corpus`
2. Rodar de novo e comparar `diff` byte a byte de `corpus/` e `ground-truth.json`.
3. Conferir 60 casos e pareamento V/S.
4. Reportar divergências catálogo ↔ código.

## Sucesso
Saídas idênticas em duas execuções; zero divergências.
