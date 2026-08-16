---
name: run-scan
description: Executa uma ferramenta SAST sobre o corpus gravando bruto e metadados. Use para semgrep, codeql, njsscan ou eslint de segurança.
---

# Execução de varredura

## Entrada
Nome da ferramenta: `semgrep` | `codeql` | `njsscan` | `eslint`.

## Passos
1. Confirmar que `corpus/` está atualizado.
2. Rodar o script `npm run scan:<ferramenta>`.
3. Verificar `results/raw/<ferramenta>/` com JSON/SARIF e metadados (versão, comando, data).

## Sucesso
Relatório bruto íntegro + metadados completos. Não transformar a saída aqui.
