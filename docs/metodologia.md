# Metodologia — registro de desvios

**Projeto:** SecBench-TS  
**Início do registro:** 2026-08-16

Qualquer desvio de `docs/specs/PROJETO.md` ou `docs/specs/HARNESS.md` deve ser anotado aqui **antes** da implementação.

## Entradas

### 2026-08-16 — Ordem de correção recebida

Ordem de correção completa recebida e será executada nesta data: (0) versionamento e `verify` no estado pré-correção; (1) ancoragem C-798-02; (2) reconstrução C-1104-01; (3) alinhamento do prompt LLM; (4) tabela de equivalência CWE; (5) remoção de comentários vazadores e expansão de `forbidden-vocab`; (6) assimetria estrutural V/S; (7) auditoria adversarial cega. Desvios pontuais de cada tarefa serão registrados abaixo antes da implementação correspondente. Não se executa `scan:llm` nesta sessão; `corpus/` e `ground-truth.json` só via `npm run build:corpus`.

### 2026-08-16 — Ambiente de medição LLM

A varredura `scan:llm` deve rodar fora da sessão de desenvolvimento com harness carregado (HARNESS §8). Documentado em `docs/reproducao.md`. Não é desvio de casos; é restrição operacional.

### 2026-08-16 — Diagnóstico de rede (C-078-02)

O catálogo descreve verificação de alcance via comando de shell. Em ambientes sem `CAP_NET_RAW` (CI/sandbox), `ping` falha por permissão e não demonstra a injeção. A implementação usa `echo reachability-check <host>` com `exec`/`execFile`, preservando a falha de concatenação no membro V e a rejeição no membro S.

### 2026-08-16 — Dependências C-1104

O par C-1104-01 usa `ms` (faixa `^`) no membro V e `escape-html` (versão exata) no membro S. Não são o mesmo pacote; a prova do caso é inspeção do manifesto, conforme o catálogo.

