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

### 2026-08-16 — C-1104-01 saída escolhida (saída 1)

Antes da implementação: escolhida a **saída 1 (preferida)** da ordem de correção. O par será reconstruído para a mesma operação de negócio (converter carimbo de agenda em epoch ms); o membro V importa `moment` (projeto legado em modo de manutenção — CWE-1104 aplicável) e o membro S importa `dayjs` (equivalente mantido). Removem-se `ms` e `escape-html` do manifesto se deixarem de ser usados; o campo `dependency` some do corpo da resposta. A entrada anterior sobre `ms`/`escape-html` fica historicamente superada por esta decisão.

### 2026-08-16 — Auditoria adversarial cega (pós-correção)

Após as tarefas 1–6, auditoria cega restrita a `corpus/` (subagent `blind-auditor`), sem gabarito/especificação/testes/catálogo.

- **Data:** 2026-08-16
- **Acerto:** 30 regiões FAILING e 30 PROTECTED alinhadas aos 30 pares do artefato (análise por sink/API); `health.ts` tratado como benigno.
- **Pistas declaradas:** predominantemente técnicas (fluxo a sinks, crypto/KDF, authZ, encoding, PRNG). Tamanho de arquivo e ordem de registro em `routes.ts` **não** foram decisivos. Pares de nomes de negócio sinônimos foram usados para navegação/comparação diferencial (desenho intencional do catálogo, sem sufixos V/S); o auditor notou influência parcial no eixo login/signin (log de senha vs omissão), residual compartilhado já previsto no par.
- **Conclusão:** acerto compatível com análise técnica legítima; sem atalho por tamanho ou ordem de registro. Helper `withEntityMeta` unificado entre membros para evitar assimetria de boilerplate como pista.

### 2026-08-21 — Tarefa 8: ambiente de medição isolado

Implementação do protocolo pré-registrado (`docs/PROTOCOLO-MEDICAO.md`, commit isolado anterior) e de `tools/prepare-measurement.ts` (lista de inclusão, atestado, verificação de vazamento). Scripts `measurement:prepare` / `measurement:verify`. Documentação de reprodução reescrita; harness atualizado (proibição de varredura fora do ambiente preparado; proibição de ampliar inclusão sem desvio; bloqueio de `.sandbox-ok` no checkout de trabalho).

### 2026-08-21 — Lista de inclusão vs estado pós-tarefas 1–7

Conferidos `INCLUDE_TREES` (`corpus`) e `INCLUDE_FILES` (`tools/llm/prompt.md`, `tools/llm/run-llm.ts`, `scripts/scan-semgrep.ts`, `scripts/scan-codeql.ts`, `scripts/scan-njsscan.ts`, `scripts/scan-eslint.ts`, `scripts/eslint.corpus.config.mjs`, `package-lock.json`) contra o projeto após as correções 1–7. Todos os caminhos existem; executores de varredura permanecem em `scripts/` como no script recebido. **Nenhum ajuste** na lista de inclusão.

Ensaio preliminar de `measurement:prepare` falhou por vazamento `SecBench` em `tools/llm/prompt.md` (versão pré-tarefa 3 ainda no HEAD). O prompt alinhado ao protocolo §9 (tarefa 3, até então só no working tree) foi versionado para o ensaio oficial; não se alterou a lista de inclusão nem a seção 4 do protocolo.

### 2026-08-21 — Ensaio a seco da preparação do ambiente (tarefa 8.8)

- **Data:** 2026-08-21
- **Procedimento:** `git clone` do repositório em `/tmp/secbench-t8-*/repo` → `npm ci` → `npm run measurement:prepare -- --out …/secbench-measurement` → `npm ci` no destino. Nenhuma varredura executada.
- **Commit de origem do ensaio:** `ac495ca` (árvore limpa no clone)
- **Resultado:** exit 0; verificação de vazamento sem ocorrências; ambiente sem `src/`, `ground-truth.json`, catálogo, `tests/`, `docs/`, `.cursor/`, `.git/`, scripts de build/normalize/score; atestado gravado fora do ambiente com commit, `fileCount=76` e hash agregado `134724b78d6d46e54ae61265b0c021502c20336956b7d02162fa256c5922be43`; `npm ci` no ambiente preparado exit 0.
- **Limpeza:** diretórios temporários do ensaio removidos após o registro.

