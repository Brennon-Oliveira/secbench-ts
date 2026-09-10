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

### 2026-08-22 — Lista de inclusão ampliada para contêineres (tarefa 9)

O ambiente de medição passa a incluir a árvore `docker/` (compose, Dockerfiles, entrypoints, `versions.json`) e `scripts/scan-docker-common.ts`, necessários para executar varreduras sem binários locais. `tools/dry-run-fixture/` e `docker/generate-versions.ts` permanecem **fora** do ambiente de medição.

### 2026-08-22 — Semgrep: regras locais, sem `--config=auto`

Conjunto de regras clonado de `semgrep/semgrep-rules` no commit `40b8c63f75dc7c22c8a77482d73bfb864b146f7e`; diretórios `javascript/` e `typescript/` copiados para a imagem customizada. Telemetria desativada (`--metrics=off`); varredura aponta apenas para `/rules/javascript` e `/rules/typescript`.

### 2026-08-22 — ESLint: rede só na instalação de dependências

Exceção registrada à proibição de rede durante varredura: o serviço `eslint-deps` executa `npm ci` com rede; `eslint-scan` roda com `--network none`. Dependências reconstruídas a partir do lockfile a cada execução de varredura ESLint.

### 2026-08-22 — Variáveis de ambiente neutras nos executores

Renomeadas `SECBENCH_SCAN_*` → `SCAN_TARGET` / `SCAN_OUTPUT_ROOT` / `SCAN_PROJECT_ROOT` / `SCAN_ROOT` para a árvore incluída no ambiente de medição não disparar o padrão de vazamento do nome do experimento.

### 2026-08-22 — Ensaio de calibração (tarefa 9.8)

- **Data:** 2026-08-22
- **Material:** `tools/dry-run-fixture/` (10 arquivos TypeScript; não faz parte do corpus nem do gabarito)
- **Saídas:** `results/dry-run/`
- **Identificadores de regra mapeados em `tools/cwe-aliases.json`:** Semgrep 4; njsscan 3; ESLint (`eslint-plugin-security`) 5; CodeQL 6. Bloco `cweEquivalence` **não** alterado.
- **Repetição:** segundo ensaio no mesmo material reproduziu o mesmo conjunto de identificadores por ferramenta.
- Nenhuma varredura sobre o corpus definitivo; `scan:llm` não executado.

### 2026-08-22 — Nomes de imagem sem o vocábulo do experimento

Imagens locais renomeadas para `sast-semgrep` / `sast-codeql` (e projeto Compose `sast-scan`) para não introduzir o nome do experimento no ambiente de medição quando a árvore `docker/` é incluída.

### 2026-08-22 — CodeQL: Node.js na imagem para TypeScript

A criação da base JavaScript/TypeScript exige `node` no PATH. A imagem local instala Node.js 22 (mesma linha de `engines`) na etapa de construção, além do bundle CodeQL.

### 2026-08-22 — CodeQL: execução como root e chown da saída

O volume nomeado da base de dados (`/db`) precisa de escrita na criação. A imagem Ubuntu não inclui o UID do operador; o serviço `codeql` roda como root da imagem. O executor aplica correção de propriedade nos arquivos em `/out` após a execução (exceção registrada à regra de UID do operador).

### 2026-08-22 — njsscan: HOME=/tmp no contêiner

A imagem `opensecurity/njsscan` tenta gravar estado do Semgrep embutido em `$HOME/.semgrep`. Com `user` do operador, `$HOME` pode ser `/` e a escrita falha. O entrypoint define `HOME=/tmp` antes da varredura. Exceção de propriedade: se a imagem ainda gravar como root, o executor aplica `chown` no diretório de staging após a execução.

### 2026-08-22 — ESLint: cwd no material analisado

O ESLint flat config só cobre arquivos sob o diretório de trabalho. O entrypoint de varredura faz `cd /work` (material montado) e usa `SECBENCH_SCAN_ROOT=.` com o binário em `/project/node_modules/.bin`. O projeto permanece montado somente leitura em `/project` para a configuração e as dependências.

### 2026-08-22 — Rede desabilitada via network_mode no compose

`docker compose run` nesta versão do Compose não aceita a flag `--network none`. A ausência de rede nas varreduras é garantida por `network_mode: none` nos serviços `semgrep`, `njsscan`, `codeql` e `eslint-scan`. O serviço `eslint-deps` permanece com rede para `npm ci`.

### 2026-08-22 — Imagens locais: tag no compose, digest em versions.json

BuildKit recusa `image: nome@sha256:…` em serviços com `build:`. Semgrep e CodeQL (imagens locais) permanecem como `secbench-semgrep:1.174.0` e `secbench-codeql:2.26.3` no `compose.yml`; o digest correspondente é gravado em `docker/versions.json` pelo script `docker:versions`. Imagens oficiais do Hub (njsscan, node) ficam fixadas por digest no compose.

### 2026-08-22 — CodeQL: base Ubuntu 24.04 e bundle v2.26.3

Imagem local `secbench-codeql:2.26.3` a partir de `ubuntu:24.04@sha256:33ceb71981b602c1a7443a53469e4dba065f7503eab3078a2d7a57a2ab987517`; pacote `codeql-bundle-v2.26.3` baixado na construção. Base de dados em volume separado (`/db`); corpus montado somente leitura em `/work`.

### 2026-08-21 — Lista de inclusão vs estado pós-tarefas 1–7

Conferidos `INCLUDE_TREES` (`corpus`) e `INCLUDE_FILES` (`tools/llm/prompt.md`, `tools/llm/run-llm.ts`, `scripts/scan-semgrep.ts`, `scripts/scan-codeql.ts`, `scripts/scan-njsscan.ts`, `scripts/scan-eslint.ts`, `scripts/eslint.corpus.config.mjs`, `package-lock.json`) contra o projeto após as correções 1–7. Todos os caminhos existem; executores de varredura permanecem em `scripts/` como no script recebido. **Nenhum ajuste** na lista de inclusão.

Ensaio preliminar de `measurement:prepare` falhou por vazamento `SecBench` em `tools/llm/prompt.md` (versão pré-tarefa 3 ainda no HEAD). O prompt alinhado ao protocolo §9 (tarefa 3, até então só no working tree) foi versionado para o ensaio oficial; não se alterou a lista de inclusão nem a seção 4 do protocolo.

### 2026-08-22 — Tarefa 9: conteinerização das ferramentas SAST (início)

Início da tarefa 9: colocar Semgrep, njsscan, CodeQL e ESLint (plugin de segurança) em contêineres com versões fixadas, varredura sem rede e executores reescritos. Fora do escopo: assistentes de codificação (`scan:llm`). Decisões desta tarefa serão registradas abaixo conforme implementadas.

### 2026-08-21 — Ensaio a seco da preparação do ambiente (tarefa 8.8)

- **Data:** 2026-08-21
- **Procedimento:** `git clone` do repositório em `/tmp/secbench-t8-*/repo` → `npm ci` → `npm run measurement:prepare -- --out …/secbench-measurement` → `npm ci` no destino. Nenhuma varredura executada.
- **Commit de origem do ensaio:** `ac495ca` (árvore limpa no clone)
- **Resultado:** exit 0; verificação de vazamento sem ocorrências; ambiente sem `src/`, `ground-truth.json`, catálogo, `tests/`, `docs/`, `.cursor/`, `.git/`, scripts de build/normalize/score; atestado gravado fora do ambiente com commit, `fileCount=76` e hash agregado `134724b78d6d46e54ae61265b0c021502c20336956b7d02162fa256c5922be43`; `npm ci` no ambiente preparado exit 0.
- **Limpeza:** diretórios temporários do ensaio removidos após o registro.

### 2026-08-31 — Tarefa 10: emenda de protocolo 1.2 ausente na árvore

Conferência da Parte A: o arquivo `docs/PROTOCOLO-MEDICAO.md` na árvore de trabalho **não** contém a emenda 1.2 descrita (versão permanece 1.1; seção 3 ainda lista «Modelo de linguagem»; seção 6 ainda é o protocolo de API; não há subseção 9.1; seção 11 sem entrada 1.2). O `git diff` em relação a `HEAD` acrescenta apenas linhas em branco entre seções. Com `git diff -w`, o conteúdo textual das seções 4 e 7 coincide com o commit `781e5b9` (regra de correspondência e conjuntos de equivalência intactos). Não se reconstruiu o texto da emenda; registro e commit isolado ficam pendentes até a emenda reaparecer na árvore.

### 2026-08-31 — Tarefa 10: cobertura da tabela de identificadores (diagnóstico + reensaio)

**Material do ensaio original (tarefa 9.8), preservado em** `results/dry-run/archive-20260822/`.

Diagnóstico por ferramenta e família (arquivos `sqli.ts`, `command-injection.ts`, `path-traversal.ts`, `ssrf.ts` do fixture):

| Família | Semgrep | njsscan | ESLint | CodeQL |
|---|---|---|---|---|
| Injeção de SQL | ausência de alerta | ausência de alerta | ausência de alerta | alerta (`js/sql-injection`) |
| Injeção de comando | ausência de alerta | ausência de alerta | alerta (`security/detect-child-process`) | alerta (`js/command-line-injection`) |
| Travessia de caminho | ausência de alerta | ausência de alerta | alerta (`security/detect-non-literal-fs-filename`) | ausência de alerta |
| Requisição forjada | ausência de alerta | ausência de alerta | ausência de alerta | alerta (`js/request-forgery`) |

Nenhum caso de «alerta emitido e não mapeado» nessas quatro famílias no ensaio original: ou houve alerta já refletido em `cwe-aliases.json`, ou não houve alerta.

Metadado CWE próprio: Semgrep e njsscan trazem CWE nos achados que emitiram; CodeQL traz tags `external/cwe/…` no SARIF. Com a ordem §7.1 (CWE explícito primeiro), a ausência de entrada na tabela para esses identificadores seria inofensiva para pontuação — mas nas quatro famílias o problema de Semgrep/njsscan (e ESLint em SQL/SSRF; CodeQL em path) é **ausência de alerta**, não falha de mapeamento.

**Ampliação do fixture** (`tools/dry-run-fixture/`): duas formas sintáticas por família (SQL: `+` e template no `Sequelize.query`; comando: `exec` montado e `execSync`; path: `readFileSync` e `createReadStream` na resposta; SSRF: `fetch` direto e via variável intermediária). Reensaio em 2026-08-31; saídas novas em `results/dry-run/{semgrep,njsscan,eslint,codeql}/` (ensaio anterior arquivado, não sobrescrito).

**Após reensaio:** Semgrep e njsscan permaneceram sem alerta nas quatro famílias (mesmos quatro e três identificadores, respectivamente). ESLint e CodeQL mantiveram o padrão da tabela acima; CodeQL passou a emitir também `js/stack-trace-exposure` em `command-injection.ts` (CWE-209/497 no SARIF), acrescentado à tabela a partir da saída real. **Não** se inventaram identificadores para SQL/comando/path/SSRF em Semgrep ou njsscan.

Contagem final de identificadores de regra mapeados: Semgrep 4; ESLint (`eslint-plugin-security`) 5; njsscan 3; CodeQL 7.

Constatação (resultado do estudo, não defeito a corrigir): na configuração adotada e sobre o fixture ampliado, Semgrep e njsscan não emitem regras para injeção de SQL, injeção de comando, travessia de caminho nem requisição forjada; ESLint não emite para SQL nem SSRF; CodeQL não emite para travessia de caminho nestas formas. Referências: `results/dry-run/semgrep/20260831T181100Z.json`, `results/dry-run/njsscan/20260831T181859Z.json`, `results/dry-run/eslint/20260831T181903Z.json`, `results/dry-run/codeql/20260831T181911Z.sarif` (e o arquivo correspondente em `archive-20260822/` para o ensaio anterior).

### 2026-08-31 — Tarefa 10: normalizador e regra 4.6 / §7.1

`tools/normalize.ts` passou a aplicar a ordem de resolução do protocolo (CWE explícito → identificador de regra → rótulo textual normalizado → não mapeado), a gravar `mappingSource` em cada achado e a reportar `unmapped by tool` (também em `results/normalized/unmapped-by-tool.json` quando há brutos em `results/raw/`). Teste automatizado: `tests/normalize-resolution.test.ts`, sobre as saídas do ensaio em `results/dry-run/`.

### 2026-09-03 — Tarefa 12: consolidação da árvore antes da coleta

A árvore de trabalho das tarefas 9 e 10 foi versionada antes do início da coleta definitiva, para que o atestado de medição amarre o resultado a um commit concreto.

- **Commits de consolidação criados nesta passagem (5):** `79c2701` (conteinerização SAST), `b208aa9` (fixture e dry-run), `afb6465` (tabela CWE e normalizador), `8ab4191` (src/corpus/gabarito), `411ede8` (docs e asymmetry-check).
- **Commit final sobre o qual a coleta será executada:** `ce5d3093bf21846fa8a887e107021c57d8802eb4` (`ce5d309`), tip de `main` após atualizar digests das imagens SAST.
- **Pré-checagens:** `npm run build:corpus` coincidiu byte a byte com o corpus e o gabarito já presentes na árvore; `npm run verify` e `npm run check:asymmetry` passaram.
- **Descartes (não versionados), com motivo:**
  - Alteração proposta em `.gitignore` que acrescentava `results/dry-run/**/*` (com exceção só de `.gitkeep`): **descartada**. O ensaio de calibração e o arquivo `archive-20260822/` são evidência citada no diagnóstico da tabela de identificadores; ignorá-los no versionamento tornaria essas referências irrecuperáveis. A árvore ficou com o `.gitignore` anterior a essa proposta.
  - Nenhum outro arquivo da árvore suja foi descartado. Não havia `node_modules/` pendente de adição, `.env`, `.sandbox-ok`, ambiente de medição preparado nem segredo real a excluir. Credenciais no fixture de dry-run são fictícias de ensaio (`sk-live-dryrun-…`) e foram versionadas de propósito.

### 2026-09-03 — Tarefa 12: coleta determinística e branches de medição

- **Commit de origem da coleta (atestado):** `cc42cd7ec1e574f382eee0b6b03e8284e9cfb2e2` (`cc42cd7`). Árvore limpa. Ambiente preparado em `/home/brennon/studies/loja-measurement`; atestado fora do ambiente (`results/raw/attestation.json`).
- **Resumo agregado do código do corpus:** `7d0c044a96b4d2d49ec9074edf01c2096f68008a2aa100eafb9e2635bc9917f6` (76 arquivos). Coincidiu entre repositório, atestado, ambiente preparado e as nove branches (hash sobre os mesmos arquivos, sem o prefixo `corpus/`).
- **Mapeamento branch → produto e execução** (somente nesta branch principal; jamais nas branches de medição):

| Branch | Produto | Execução |
|---|---|---|
| `snapshot/01` | Claude Code (Opus) | 1 |
| `snapshot/02` | Cursor (Grok) | 1 |
| `snapshot/03` | Google Antigravity | 1 |
| `snapshot/04` | Claude Code (Opus) | 2 |
| `snapshot/05` | Cursor (Grok) | 2 |
| `snapshot/06` | Google Antigravity | 2 |
| `snapshot/07` | Claude Code (Opus) | 3 |
| `snapshot/08` | Cursor (Grok) | 3 |
| `snapshot/09` | Google Antigravity | 3 |

- **Identificadores de commit das branches** (um commit órfão cada): `snapshot/01` `166ddeac0ae8eb052689ce1b35bfe348c4b503ca`; `snapshot/02` `18c9167343b4e23800b34af3c16ee5b551fd557c`; `snapshot/03` `01b39ea202986ea3fff3eccd803c00a37585d4c3`; `snapshot/04` `35268265a1d48c1d2ca1b536c55aab0bd2bc392c`; `snapshot/05` `a4d63c009c5a723360c3c9510ffd592b54909f53`; `snapshot/06` `035da70a79dd757da8289c845ddf9c4b4cecfad1`; `snapshot/07` `e973ec8571766f375524e4488ba8d4cfcc03d4d0`; `snapshot/08` `3ceb0503103190ecb13e8496dd877f849c49579f`; `snapshot/09` `58e2738d19c559539b2a178f6cfe49bdf4313c34`.
- **Verificações D.4 (as nove):** uma commit e nenhum ancestral; árvore sem caminhos `src/`, `tests/`, `docs/`, `tools/`, `scripts/` ou `corpus/`, sem gabarito e sem catálogo; varredura de vazamento (mesmos padrões do `prepare-measurement`) sem ocorrências; resumo agregado idêntico ao do corpus. Todas passaram.
- **Clone para o operador** (substituir o número da sessão). URL: `git@github.com:Brennon-Oliveira/secbench-ts.git`

```
git clone --single-branch --branch snapshot/01 --depth 1 git@github.com:Brennon-Oliveira/secbench-ts.git run01
```

Clone sem `--single-branch` e sem `--depth 1` traz o restante do repositório (histórico, gabarito, protocolo) e **invalida a sessão**.

### 2026-09-10 — Tarefa 13: reprodução do artefato em ambiente novo

Clone do zero em máquina distinta da que executou as tarefas 9 a 12, com histórico completo e todas as referências buscadas (`git fetch --all --tags --prune`; as nove branches `snapshot/01`–`snapshot/09` presentes entre as referências remotas). O isolamento por clone raso e referência única vale para as sessões de medição, não para esta tarefa, que precisa do gabarito para pontuar.

- **Interpretador:** Node v24.15.0 (`engines: >=22` satisfeito); npm 11.12.1. Dependências reconstruídas com `npm ci` a partir de `package-lock.json` (exit 0).
- **`npm run verify`:** **falhou**, com 1 de 122 testes reprovado. Os **trinta arquivos de teste de comprovação passaram** (`npm run test:proof`: 30 arquivos, 61 testes, todos verdes). O teste reprovado é de fumaça: `tests/smoke/routes.smoke.test.ts > GET /files/download?name=catalog-a.txt is reachable` recebeu 500. Causa verificada nesta sessão: o seed (`src/db/seed.ts`) cria `lista-a.txt` e `lista-b.txt` em `storage/uploads/`, e o teste de fumaça pede `catalog-a.txt`, que não existe; a rota vulnerável de download lê o caminho direto e falha com ENOENT. Como `storage/uploads/*` é ignorado no versionamento, em máquina que já tenha rodado versões anteriores do artefato o arquivo antigo permanece no disco e o teste passa — o que explica o `verify` verde registrado em 2026-09-03. **Nenhuma correção aplicada:** o artefato não foi alterado nesta tarefa, e a lacuna fica reportada ao operador.
- **`npm run check:asymmetry`:** PASS (30 pares; 18/30 com membro vulnerável menor; medianas V=31 e S=33; nenhum par com razão > 1,5).
- **Árvore de trabalho após o `verify`:** limpa. `npm run build:corpus` regenerou `corpus/` e `ground-truth.json` sem diferença em relação ao versionado.
- **Resumo agregado do corpus no repositório:** `7d0c044a96b4d2d49ec9074edf01c2096f68008a2aa100eafb9e2635bc9917f6` (76 arquivos), idêntico ao registrado em `results/raw/attestation.json`, inclusive arquivo por arquivo (0 divergências).

### 2026-09-10 — Tarefa 13: verificação de integridade e recolhimento das nove sessões

Script versionado: `tools/collect-sessions.ts` (`npm run collect:sessions`). Para cada branch, compara o commit original registrado em 2026-09-03 com o commit atual, recalcula o resumo agregado do código no commit original sobre a mesma lista de arquivos do atestado (sem o prefixo `corpus/`) e extrai os relatórios byte a byte para `results/raw/assistants/`.

| Produto | Execução | Branch | Commit de origem | Commit do relatório | Arquivos acrescentados | Hash do código | Íntegra |
|---|---|---|---|---|---|---|---|
| Claude Code (Opus) | 1 | `snapshot/01` | `166ddea` | `2c3917e` | `auditoria.json`, `execucao.json` | confere | sim |
| Claude Code (Opus) | 2 | `snapshot/04` | `3526826` | `9c158b1` | `auditoria.json`, `execucao.json` | confere | sim |
| Claude Code (Opus) | 3 | `snapshot/07` | `e973ec8` | `339c47b` | `auditoria.json`, `execucao.json` | confere | sim |
| Cursor (Grok) | 1 | `snapshot/02` | `18c9167` | `16ba739` | `auditoria.json`, `execucao.json` | confere | sim |
| Cursor (Grok) | 2 | `snapshot/05` | `a4d63c0` | `79c5118` | `auditoria.json`, `execucao.json` | confere | sim |
| Cursor (Grok) | 3 | `snapshot/08` | `3ceb050` | `ddc33e4` | `auditoria.json`, `execucao.json` | confere | sim |
| Google Antigravity | 1 | `snapshot/03` | `01b39ea` | `088d662` | `execucao.json`, `resposta-bruta.txt` | confere | sim |
| Google Antigravity | 2 | `snapshot/06` | `035da70` | `74db752` | `execucao.json`, `resposta-bruta.txt` | confere | sim |
| Google Antigravity | 3 | `snapshot/09` | `58e2738` | `9285051` | `execucao.json`, `resposta-bruta.txt` | confere | sim |

- **Nenhuma sessão apresentou arquivo de código modificado, removido ou acrescentado.** A diferença de cada branch consiste exclusivamente em arquivos acrescentados da lista permitida; não houve `transcricao.txt` em nenhuma sessão.
- **Resumo agregado do código nas nove branches:** `7d0c044a…c9917f6` nas nove, igual ao atestado e ao repositório. Os três arquivos de ambiente da branch (`.gitignore`, `package.json`, `tsconfig.json`) ficam fora do resumo, como em 2026-09-03.
- **Desfechos declarados:** seis `concluido` (Claude Code e Cursor) e três `recusa` (Google Antigravity, que não gravou `auditoria.json` em nenhuma das três execuções). Nenhuma interrupção. Nenhum `auditoria.json` malformado: os seis fazem parse.
- **Discrepância registrada, sem alteração de bruto:** `execucao.json` das três sessões do Antigravity declara `versao: 1.1.5`, enquanto `resposta-bruta.txt` das execuções 2 e 3 exibe `Antigravity CLI 1.2.0` no cabeçalho da interface. Os dois brutos ficam como estão.
- **Manifesto de recolhimento:** `results/raw/assistants/collection-manifest.json`, com commits de origem e de relatório, sha256 e tamanho de cada um dos 18 arquivos recolhidos.

### 2026-09-10 — Tarefa 13: desvios de implementação da normalização e da pontuação

Registrados antes do commit dos resultados. Nenhum deles altera a regra de correspondência, a janela de linhas, os conjuntos de equivalência, a tabela de identificadores, o corpus, o gabarito ou o protocolo.

1. **Normalização de raiz de caminho (protocolo §4.1).** `tools/normalize.ts` reduzia o caminho apenas quando havia o segmento `corpus/`. Semgrep, njsscan e ESLint reportam o caminho a partir do ponto de montagem do contêiner (`/work/...`, conforme `scanTarget` nos `*.meta.json`), de modo que nenhum achado dessas três ferramentas casava com arquivo do gabarito e todos caíam em «fora de escopo». A função passou a reduzir o caminho à forma relativa à raiz do corpus, descartando segmentos iniciais até que o resultado corresponda a arquivo existente em `corpus/`. Efeito medido sobre o resultado principal: Semgrep passou de 0 para 4 verdadeiros positivos (e de 0 para 1 falso positivo de par) e njsscan de 0 para 5 verdadeiros positivos (0 falsos positivos); ESLint permanece em 0, porque todos os seus achados são não mapeados; CodeQL, cujo SARIF já traz caminho relativo, não muda. A correção é a normalização que o §4.1 exige («após normalização de separadores e de raiz relativa»), e não ajuste de critério.
2. **Prefixo do corpus nas saídas dos assistentes (protocolo §9.1).** Os caminhos reportados pelos assistentes recebem o prefixo `corpus/` antes da comparação, e o achado normalizado registra `pathPrefixApplied` e o caminho bruto em `rawFile`. Única transformação aplicada a resultado bruto de assistente.
3. **Unicidade de verdadeiro positivo por caso (protocolo §4.1).** A implementação anterior contava um verdadeiro positivo por achado casado, sem limitar a um por caso. Passou a contar no máximo um por caso e por instrumento, com o excedente em «redundante», categoria que o §8 já exigia.
4. **Categorias próprias para achado sem linha e sem CWE (§4.5 e §4.6).** Classificação mutuamente exclusiva, na ordem: sem localização, não mapeado, verdadeiro positivo, redundante, falso positivo de par, fora de escopo. Nenhum achado desta coleta ficou sem linha.
5. **Falso negativo como registro de classificação (§4.4).** Cada caso vulnerável sem verdadeiro positivo gera um registro em `results/reports/classifications.json`, para que a amostra de conferência manual do §10 possa cobrir também essa categoria.
6. **Identidade de achado para união, maioria e estabilidade (§6.7 e §6.8).** Declarada como `arquivo|linha|CWE`. O protocolo não a define; a escolha é declarada aqui e não foi alterada depois de observar resultado.
7. **Leitura do §4.2.** O texto do §4.2 fala em «dentro do intervalo de linhas» do caso protegido, sem repetir a janela de ±5 do §4.1. A implementação versionada antes da coleta aplica a janela de ±5 em torno do intervalo, e foi preservada. A contagem sob leitura estrita do intervalo é reportada em `falsePositivesStrictInterval` sem ser aplicada; nesta coleta as duas contagens coincidem (Semgrep 1 e 1; CodeQL 3 e 3; zero nos demais).
8. **Recusa e interrupção (§6.9).** Sessão com desfecho de recusa entra na contagem com zero achados e zero arquivos examinados; sessão com desfecho de interrupção ficaria registrada e fora do cálculo principal (`inPrincipal: false`). Não houve interrupção nesta coleta.
9. **Ferramentas novas versionadas:** `tools/collect-sessions.ts`, `tools/manual-sample.ts` e os scripts `collect:sessions` e `manual:sample` em `package.json`. `tools/cwe-aliases.json` **não** foi alterado.

Observações de coleta, registradas como fato e sem interpretação:

- Os 75 achados do ESLint são 75 mensagens de erro de análise sintática (`Parsing error: …`), sem identificador de regra e sem CWE; nenhuma regra do `eslint-plugin-security` foi acionada sobre o corpus. O código de saída da execução foi 1 e o relatório bruto está em `results/raw/eslint/20260903T184325Z.json`.
- O único achado não mapeado do Semgrep é `rules.typescript.lang.best-practice.moment-deprecated` em `modules/integrations/routes/timing-parse.ts:2`, dentro da janela do caso C-1104-01-V; o identificador não tem entrada em `tools/cwe-aliases.json` e o achado não traz CWE próprio, de modo que o §4.6 o classifica como não mapeado. A tabela não foi ampliada (§7.4).

### 2026-09-10 — Tarefa 13: pontuação e conferência manual

- **Data da pontuação:** 2026-09-10, sobre `results/normalized/all.json` (439 achados: 189 das quatro ferramentas e 250 dos assistentes) e `results/normalized/assistant-sessions.json`. Saídas em `results/reports/summary.json`, `summary.md` e `classifications.json`.
- **Conferência manual (§10):** amostra reproduzível por semente fixa `secbench-ts/conferencia-manual/2026-09-10`, estratificada por instrumento × categoria, teto de 20% por estrato e ao menos um item por estrato. População de 454 classificações do resultado principal; **102 itens conferidos (22,5%)**, cobrindo os sete instrumentos e as seis categorias presentes (verdadeiro positivo, falso positivo de par, fora de escopo, redundante, não mapeado e falso negativo).
- **Taxa de divergência: 0,00%** (0 divergências em 102 itens; limite do protocolo: 5%). Veredictos em `results/reports/manual-check-verdicts.json`; cálculo em `results/reports/manual-check.json` e `manual-check.md`; folha de conferência em `results/reports/manual-sample.md`.
