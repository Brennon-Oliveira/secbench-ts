---
name: author-case-pair
description: Implementa um par V/S do catálogo SecBench-TS com marcadores e teste de proof. Use ao criar ou alterar um caso do catálogo.
---

# Autoria de par de caso

## Entrada
Identificador do par, ex.: `C-089-01`.

## Passos
1. Ler o bloco correspondente em `docs/specs/PROJETO.md` §10 e a entrada em `tools/case-catalog.json`.
2. Implementar rotas/módulos V e S com marcadores `@case-begin` / `@sink` / `@case-end`.
3. Criar `tests/proof/<pairId>.test.ts` (V cede, S resiste).
4. Registrar rotas em `src/routes.ts` em ordem alfabética por caminho dentro do módulo.
5. Rodar `npm run build:corpus` e `npx vitest run tests/proof/<pairId>.test.ts`.

## Sucesso
Build válido, gabarito atualizado, ambos os testes passando, vocabulário limpo no corpus.
