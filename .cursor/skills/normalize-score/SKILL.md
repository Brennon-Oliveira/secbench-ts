---
name: normalize-score
description: Normaliza relatórios brutos e calcula indicadores contra o gabarito. Use após varreduras em results/raw.
---

# Normalização e pontuação

## Passos
1. `npm run normalize`
2. `npm run score`
3. Conferir `results/reports/summary.json` e `summary.md`.
4. Garantir que achados malformados foram contabilizados.

## Sucesso
Números reproduzíveis a partir dos mesmos brutos; nenhum achado descartado sem registro.
