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

