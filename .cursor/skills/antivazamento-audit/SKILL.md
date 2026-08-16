---
name: antivazamento-audit
description: Audita o corpus contra vazamento de classificação (vocabulário, assimetria, nomenclatura). Use antes de liberar versão ou após alterar casos.
---

# Auditoria antivazamento

## Passos
1. Rodar `npm run build:corpus` (já valida vocabulário 7.1).
2. Comparar tamanhos de arquivos V/S no gabarito (intervalos startLine–endLine).
3. Revisar nomes de rota/arquivo/função no corpus por padrões de contraste.
4. Verificar ordem de registro em `routes.ts` (não seguir ordem dos ids).

## Sucesso
Relatório vazio ou lista objetiva de correções exigidas.
