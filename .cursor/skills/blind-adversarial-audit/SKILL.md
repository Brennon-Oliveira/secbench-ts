---
name: blind-adversarial-audit
description: Executa auditoria adversarial cega no corpus via subagent blind-auditor, sem gabarito. Use para validar antivazamento estrutural.
---

# Auditoria adversarial cega

## Passos
1. Delegar ao subagent `blind-auditor` com acesso apenas a `corpus/`.
2. Não fornecer gabarito, PROJETO.md, catálogo ou testes.
3. Pedir classificação técnica e lista de pistas usadas.
4. Comparar depois (em sessão separada) com `ground-truth.json`.

## Sucesso
Acerto compatível com análise legítima; relatório de pistas sem atalhos de nomenclatura.
