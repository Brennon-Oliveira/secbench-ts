# Relatório final — Tarefa 13: recolhimento das sessões, normalização e pontuação

**Projeto:** SecBench-TS
**Data:** 2026-09-10
**Commit dos resultados:** `6abc551` (empurrado para `origin/main`)
**Fontes:** `results/reports/summary.json`, `results/reports/summary.md`, `results/reports/classifications.json`, `results/reports/manual-check.json`, `results/raw/assistants/collection-manifest.json`

Relatório sem interpretação: contém o resultado da preparação, das verificações, da pontuação e da conferência manual. A análise é escrita fora deste documento.

---

## Legenda das colunas (vale para todas as tabelas deste relatório)

| Coluna | Significado |
|---|---|
| **Achados** | Número de achados do instrumento considerados naquela variante (após a consolidação, quando houver). |
| **VP** | Verdadeiro positivo (§4.1): achado no arquivo de um caso **vulnerável**, com linha no intervalo fechado de ±5 em torno da linha de referência do sink e CWE pertencente ao conjunto de equivalência do caso (§7.3). No máximo um por caso e por instrumento. |
| **FP par** | Falso positivo de par (§4.2): achado no intervalo de linhas do membro **protegido** do par, com CWE equivalente ao do par. É a métrica que o desenho pareado existe para produzir. |
| **FN** | Falso negativo (§4.4): caso vulnerável para o qual nenhum achado satisfez as três condições de verdadeiro positivo. |
| **Fora de escopo** | §4.3: achado que não corresponde a caso declarado algum. Reportado à parte e **fora** do cálculo da precisão principal. |
| **Redundantes** | §4.1: achados excedentes que satisfazem um caso já contado como verdadeiro positivo pelo mesmo instrumento. |
| **Sem localização** | §4.5: achado sem linha, ou com linha zero, atribuído ao arquivo inteiro; não pode gerar verdadeiro positivo. |
| **Não mapeados** | §4.6: achado cujo CWE não pôde ser resolvido pela ordem do §7.1 (CWE explícito → identificador de regra → rótulo textual). Taxa alta indica limitação da tabela de mapeamento, não da ferramenta. |
| **Precisão** | VP ÷ (VP + FP par). Achados fora de escopo não entram neste cálculo. |
| **Revocação** | VP ÷ 30, sendo 30 o total de casos vulneráveis do gabarito. |
| **F1** | Média harmônica de precisão e revocação. |
| **VP−FP** | Taxa de verdadeiros positivos (VP ÷ 30) menos taxa de falsos positivos (FP par ÷ 30). Corresponde ao índice de Youden usado pelo OWASP Benchmark. |
| **Jaccard** | Interseção ÷ união dos conjuntos de casos vulneráveis detectados por dois instrumentos. |
| **Contribuição exclusiva** | Casos vulneráveis que apenas aquele instrumento detectou. |
| **Estabilidade** | §6.8: achados presentes nas três execuções ÷ total de achados distintos observados, com identidade de achado `arquivo\|linha\|CWE`. |
| **Cobertura declarada** | Campo `filesExamined` da sessão ÷ 76 arquivos do corpus. Reportada, nunca aplicada para excluir ou ponderar sessão (§5.5 da tarefa). |
| **Variantes** | `execução` = uma das três sessões; `união` = união das três (resultado principal, §6.7); `maioria` = achado presente em ao menos duas das três (§6.7); `unanimidade` = presente nas três (fora do protocolo, ver Anexo A). |

---

## 1. Preparação do ambiente

- **Interpretador:** Node **v24.15.0** (requisito `>=22` satisfeito); npm 11.12.1. `npm ci` a partir de `package-lock.json`: exit 0.
- **Referências:** `git fetch --all --tags --prune` trouxe todas; as nove branches `snapshot/01`–`snapshot/09` estão entre as referências remotas. Nenhuma faltou.
- **`npm run verify`: falhou** — 1 de 122 testes reprovado. Os **trinta arquivos de teste de comprovação passaram** (`npm run test:proof`: 30 arquivos, 61 testes). O teste reprovado é de fumaça: `GET /files/download?name=catalog-a.txt` recebeu 500. Causa verificada: o seed cria `lista-a.txt`/`lista-b.txt` em `storage/uploads/`, e o teste de fumaça pede `catalog-a.txt`, inexistente; a rota vulnerável lê o caminho direto e falha com ENOENT. Como `storage/uploads/*` é ignorado no versionamento, em máquina que já rodou versões anteriores o arquivo antigo persiste e o teste passa — o que explica o `verify` verde de 2026-09-03. **Nenhuma correção aplicada:** o artefato não foi alterado. Fica reportado para decisão do operador.
- **`npm run check:asymmetry`: PASS** (30 pares; 18/30 com membro vulnerável menor; medianas de linhas úteis V=31 e S=33; nenhum par com razão > 1,5).
- **Árvore de trabalho limpa após o `verify`.** `npm run build:corpus` regenerou `corpus/` e `ground-truth.json` sem diferença em relação ao versionado.
- **Resumo agregado do corpus:** `7d0c044a96b4d2d49ec9074edf01c2096f68008a2aa100eafb9e2635bc9917f6` (76 arquivos), idêntico ao registrado em `results/raw/attestation.json`, inclusive arquivo por arquivo (0 divergências).

---

## 2. Verificação de integridade das nove sessões

Todas as nove passaram: a diferença entre o commit original registrado na preparação e o commit atual consiste **exclusivamente em arquivos acrescentados** da lista permitida, e o resumo agregado do código no commit original coincide com o do atestado nas nove branches (`7d0c044a…c9917f6`). **Nenhuma sessão apresentou arquivo de código modificado, removido ou acrescentado.** Nenhuma sessão trouxe `transcricao.txt`.

| Produto | Execução | Branch | Commit de origem | Commit do relatório | Arquivos acrescentados | Hash do código |
|---|---|---|---|---|---|---|
| Claude Code (Opus) | 1 | `snapshot/01` | `166ddeac0ae8eb052689ce1b35bfe348c4b503ca` | `2c3917e2268ae89457b4b860597f6f3653f2f746` | `auditoria.json`, `execucao.json` | confere |
| Claude Code (Opus) | 2 | `snapshot/04` | `35268265a1d48c1d2ca1b536c55aab0bd2bc392c` | `9c158b1ddf35d4c5cce0a47710f5bf9e928101dc` | `auditoria.json`, `execucao.json` | confere |
| Claude Code (Opus) | 3 | `snapshot/07` | `e973ec8571766f375524e4488ba8d4cfcc03d4d0` | `339c47b27df7c6b78c9c85f06c07de104b0aa243` | `auditoria.json`, `execucao.json` | confere |
| Cursor (Grok) | 1 | `snapshot/02` | `18c9167343b4e23800b34af3c16ee5b551fd557c` | `16ba739fed62ad6f6e4ec1b9a1214e74c0c64a90` | `auditoria.json`, `execucao.json` | confere |
| Cursor (Grok) | 2 | `snapshot/05` | `a4d63c009c5a723360c3c9510ffd592b54909f53` | `79c5118cc7900f4940f57c1251d06b90e4d4f371` | `auditoria.json`, `execucao.json` | confere |
| Cursor (Grok) | 3 | `snapshot/08` | `3ceb0503103190ecb13e8496dd877f849c49579f` | `ddc33e4089525a2a05e8f98337645c915ba39327` | `auditoria.json`, `execucao.json` | confere |
| Google Antigravity | 1 | `snapshot/03` | `01b39ea202986ea3fff3eccd803c00a37585d4c3` | `088d662aae8b18e5a8a788525ab1e20ff6decca5` | `execucao.json`, `resposta-bruta.txt` | confere |
| Google Antigravity | 2 | `snapshot/06` | `035da70a79dd757da8289c845ddf9c4b4cecfad1` | `74db752e2ad455de5a54d9140ab6fe49c30c9209` | `execucao.json`, `resposta-bruta.txt` | confere |
| Google Antigravity | 3 | `snapshot/09` | `58e2738d19c559539b2a178f6cfe49bdf4313c34` | `92850510069abf57d564e84bd38b81ba264a6886` | `execucao.json`, `resposta-bruta.txt` | confere |

Desfechos declarados: seis `concluido` (Claude Code e Cursor) e três `recusa` (Google Antigravity, que não gravou `auditoria.json` em nenhuma das três execuções). Zero interrupções; zero respostas malformadas (os seis `auditoria.json` fazem parse). Foram recolhidos 18 arquivos em `results/raw/assistants/`, com sha256 e tamanho registrados em `collection-manifest.json`.

---

## 3. Resultado por instrumento

Resultado principal: execução única para as quatro ferramentas determinísticas; união das três execuções para cada assistente (§6.7).

| Instrumento | VP | FP par | FN | Precisão | Revocação | F1 | VP−FP |
|---|---:|---:|---:|---:|---:|---:|---:|
| semgrep | 4 | 1 | 26 | 0,800 | 0,133 | 0,229 | 0,100 |
| eslint | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |
| njsscan | 5 | 0 | 25 | 1,000 | 0,167 | 0,286 | 0,167 |
| codeql | 11 | 3 | 19 | 0,786 | 0,367 | 0,500 | 0,267 |
| antigravity | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |
| claude-code | 29 | 0 | 1 | 1,000 | 0,967 | 0,983 | 0,967 |
| cursor | 28 | 0 | 2 | 1,000 | 0,933 | 0,966 | 0,933 |

---

## 4. Assistentes: por execução, união, maioria, estabilidade e cobertura declarada

**Nota sobre denominadores.** Os **76** são os arquivos `.ts` do corpus, e valem **por execução**, não somados: a unidade de análise do protocolo (§6.4) é o conjunto do corpus, de modo que cada execução varreu a árvore inteira. O gabarito tem **60 casos — 30 vulneráveis e 30 protegidos** — em 20 categorias CWE, e o denominador da revocação é sempre **30** (casos vulneráveis). Os achados, sim, são por execução e depois consolidados: Claude Code somou 45 + 32 + 36 = 113 achados brutos, que colapsam em 59 distintos na união; Cursor somou 48 + 42 + 47 = 137, que colapsam em 73.

| Instrumento | Variante | Achados | VP | FP par | FN | Precisão | Revocação | F1 | VP−FP |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| claude-code | execução 1 | 45 | 29 | 0 | 1 | 1,000 | 0,967 | 0,983 | 0,967 |
| claude-code | execução 2 | 32 | 27 | 0 | 3 | 1,000 | 0,900 | 0,947 | 0,900 |
| claude-code | execução 3 | 36 | 28 | 0 | 2 | 1,000 | 0,933 | 0,966 | 0,933 |
| claude-code | união | 59 | 29 | 0 | 1 | 1,000 | 0,967 | 0,983 | 0,967 |
| claude-code | maioria | 32 | 26 | 0 | 4 | 1,000 | 0,867 | 0,929 | 0,867 |
| cursor | execução 1 | 48 | 27 | 0 | 3 | 1,000 | 0,900 | 0,947 | 0,900 |
| cursor | execução 2 | 42 | 25 | 0 | 5 | 1,000 | 0,833 | 0,909 | 0,833 |
| cursor | execução 3 | 47 | 25 | 0 | 5 | 1,000 | 0,833 | 0,909 | 0,833 |
| cursor | união | 73 | 28 | 0 | 2 | 1,000 | 0,933 | 0,966 | 0,933 |
| cursor | maioria | 41 | 24 | 0 | 6 | 1,000 | 0,800 | 0,889 | 0,800 |
| antigravity | execuções 1, 2 e 3 | 0 | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |
| antigravity | união | 0 | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |
| antigravity | maioria | 0 | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |

**Estabilidade** (§6.8 — achados presentes nas três execuções sobre o total de achados distintos; identidade de achado `arquivo|linha|CWE`):

| Assistente | Achados distintos | Presentes nas três | Estabilidade |
|---|---:|---:|---:|
| claude-code | 59 | 22 | 37,3% |
| cursor | 73 | 23 | 31,5% |
| antigravity | 0 | 0 | 0,0% |

Estabilidade por categoria CWE está em `results/reports/summary.md`.

**Cobertura declarada de arquivos** (campo `filesExamined` sobre os 76 arquivos do corpus; reportada, não aplicada a exclusão nem a ponderação):

| Sessão | Produto | Desfecho | Arquivos examinados | Proporção |
|---|---|---|---:|---:|
| claude-code-run1 | Claude Code | concluido | 73/76 | 96,1% |
| claude-code-run2 | Claude Code | concluido | 76/76 | 100,0% |
| claude-code-run3 | Claude Code | concluido | 76/76 | 100,0% |
| cursor-run1 | Cursor Agents | concluido | 76/76 | 100,0% |
| cursor-run2 | Cursor Agents | concluido | 76/76 | 100,0% |
| cursor-run3 | Cursor Agents | concluido | 76/76 | 100,0% |
| antigravity-run1 | Antigravity CLI | recusa | 0/76 | 0,0% |
| antigravity-run2 | Antigravity CLI | recusa | 0/76 | 0,0% |
| antigravity-run3 | Antigravity CLI | recusa | 0/76 | 0,0% |

---

## 5. Cobertura por categoria CWE

Casos vulneráveis detectados sobre casos vulneráveis existentes na categoria.

| CWE | Casos | semgrep | eslint | njsscan | codeql | antigravity | claude-code | cursor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| CWE-22 | 2 | 0 | 0 | 0 | 1 | 0 | 2 | 2 |
| CWE-78 | 2 | 0 | 0 | 0 | 2 | 0 | 2 | 2 |
| CWE-79 | 2 | 1 | 0 | 0 | 0 | 0 | 2 | 2 |
| CWE-89 | 2 | 0 | 0 | 0 | 2 | 0 | 2 | 2 |
| CWE-94 | 1 | 0 | 0 | 1 | 1 | 0 | 1 | 1 |
| CWE-209 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| CWE-284 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| CWE-306 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| CWE-327 | 2 | 1 | 0 | 2 | 0 | 0 | 2 | 2 |
| CWE-338 | 2 | 0 | 0 | 0 | 0 | 0 | 2 | 2 |
| CWE-434 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| CWE-502 | 2 | 1 | 0 | 0 | 1 | 0 | 2 | 2 |
| CWE-532 | 2 | 0 | 0 | 0 | 0 | 0 | 2 | 2 |
| CWE-601 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 |
| CWE-639 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| CWE-798 | 2 | 0 | 0 | 2 | 0 | 0 | 2 | 2 |
| CWE-916 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| CWE-918 | 2 | 0 | 0 | 0 | 2 | 0 | 2 | 2 |
| CWE-1104 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CWE-1333 | 1 | 1 | 0 | 0 | 1 | 0 | 1 | 1 |

---

## 6. Sobreposição, contribuição exclusiva e coberturas de união

Índice de Jaccard sobre o conjunto de casos vulneráveis detectados:

| Par | Jaccard |
|---|---:|
| claude-code × cursor | 0,966 |
| codeql × cursor | 0,393 |
| codeql × claude-code | 0,379 |
| njsscan × cursor | 0,179 |
| njsscan × claude-code | 0,172 |
| semgrep × cursor | 0,143 |
| semgrep × claude-code | 0,138 |
| semgrep × njsscan | 0,125 |
| semgrep × codeql | 0,071 |
| njsscan × codeql | 0,067 |
| todos os pares com eslint | 0,000 |
| todos os pares com antigravity | 0,000 |

Contribuição exclusiva (casos que apenas aquele instrumento detectou):

| Instrumento | Casos exclusivos | Identificadores |
|---|---:|---|
| claude-code | 1 | C-434-01-V |
| semgrep, eslint, njsscan, codeql, antigravity, cursor | 0 | — |

Coberturas de união:

| União | Casos detectados | Cobertura |
|---|---:|---:|
| Quatro ferramentas determinísticas | 17/30 | 56,7% |
| Três assistentes | 29/30 | 96,7% |
| União geral (sete instrumentos) | 29/30 | 96,7% |

O caso C-1104-01-V não foi detectado por instrumento algum.

---

## 7. Contagens acessórias

| Instrumento | Fora de escopo | Redundantes | Sem localização | Não mapeados |
|---|---:|---:|---:|---:|
| semgrep | 32 | 0 | 0 | 1 |
| eslint | 0 | 0 | 0 | 75 |
| njsscan | 43 | 1 | 0 | 0 |
| codeql | 11 | 2 | 0 | 0 |
| antigravity | 0 | 0 | 0 | 0 |
| claude-code | 23 | 7 | 0 | 0 |
| cursor | 36 | 9 | 0 | 0 |

Respostas malformadas: **0**. Recusas: **3**. Interrupções (fora do cálculo principal): **0**.

Metadados de execução das ferramentas determinísticas (dos `*.meta.json` da coleta de 2026-09-03):

| Ferramenta | Versão | Imagem | Duração (s) | Código de saída |
|---|---|---|---:|---:|
| semgrep | 1.174.0 | sast-semgrep:1.174.0 | 248 | 0 |
| eslint | 22.23.2 | node:22-bookworm | 9 | 1 |
| njsscan | 0.3.2 | opensecurity/njsscan:0.3.2 | 8 | 1 |
| codeql | 2.26.3 | sast-codeql:2.26.3 | 36 | 0 |

---

## 8. Conferência manual

- População: **454** classificações do resultado principal (verdadeiros positivos, falsos positivos de par, fora de escopo, redundantes, não mapeados e falsos negativos).
- Seleção reproduzível: semente fixa `secbench-ts/conferencia-manual/2026-09-10`, estratificada por instrumento × categoria, teto de 20% por estrato e ao menos um item por estrato.
- Amostra conferida: **102 itens = 22,5%**, cobrindo os sete instrumentos e as seis categorias presentes.
- **Taxa de divergência: 0,00%** (0 divergências em 102 itens; limite do protocolo: 5%).
- Folha de conferência: `results/reports/manual-sample.md`; veredictos: `results/reports/manual-check-verdicts.json`; cálculo: `results/reports/manual-check.json` e `manual-check.md`.

---

## 9. Pontos que exigem atenção do operador

1. **`npm run verify` não conclui sem erro nesta máquina.** Teste de fumaça com nome de arquivo defasado (`catalog-a.txt` pedido pelo teste; o seed cria `lista-a.txt` e `lista-b.txt`). Os trinta testes de comprovação passam. O artefato não foi alterado.
2. **Defeito de normalização de caminho corrigido.** Semgrep, njsscan e ESLint reportam caminhos a partir do ponto de montagem do contêiner (`/work/…`), e o normalizador não os reduzia à raiz do corpus, o que jogava todos os achados dessas três ferramentas para «fora de escopo». A correção implementa a normalização de raiz relativa que o §4.1 já exige. Efeito medido: Semgrep 0→4 verdadeiros positivos e 0→1 falso positivo de par; njsscan 0→5 verdadeiros positivos; ESLint e CodeQL sem alteração. Registrado como desvio em `docs/metodologia.md`.
3. **ESLint.** Os 75 achados são 75 mensagens de erro de análise sintática (`Parsing error: …`), sem identificador de regra e sem CWE; nenhuma regra do `eslint-plugin-security` foi acionada sobre o corpus. Código de saída da execução: 1.
4. **Único não mapeado do Semgrep.** `rules.typescript.lang.best-practice.moment-deprecated` em `modules/integrations/routes/timing-parse.ts:2`, dentro da janela do caso C-1104-01-V; o identificador não tem entrada em `tools/cwe-aliases.json` e o achado não traz CWE próprio, de modo que o §4.6 o classifica como não mapeado. A tabela não foi ampliada (§7.4).
5. **Leitura do §4.2.** O texto fala em «dentro do intervalo de linhas» do caso protegido, sem repetir a janela de ±5 do §4.1. Preservou-se a implementação versionada antes da coleta (janela de ±5 em torno do intervalo) e reportou-se a contagem sob leitura estrita à parte: nesta coleta as duas coincidem (Semgrep 1 e 1; CodeQL 3 e 3; zero nos demais).
6. **Discrepância de versão do Antigravity.** `execucao.json` das três sessões declara `versao: 1.1.5`; o cabeçalho de `resposta-bruta.txt` das execuções 2 e 3 exibe `Antigravity CLI 1.2.0`. Os brutos ficaram como estão.

---

## 10. Conformidade com as restrições

Nenhuma varredura foi executada; nenhum assistente foi aberto sobre branch de medição; nenhuma branch de medição foi apagada ou alterada (as nove seguem no remoto); corpus, gabarito, catálogo, tabela de identificadores e protocolo permanecem intactos; nenhuma vulnerabilidade do artefato foi corrigida; a regra de correspondência, a janela de linhas e os conjuntos de equivalência não foram ajustados.


---

## Anexo A — Critério das três execuções (análise exploratória complementar)

Este anexo responde a um critério **não previsto no protocolo**, que fixa em §6.7 apenas união (resultado principal), execução individual e maioria (≥ 2 de 3). Consta como análise exploratória complementar, nos termos do §12, e não substitui o resultado principal. As quatro ferramentas determinísticas têm execução única e não admitem o critério; seus números são os da seção 3, repetidos aqui apenas para a leitura conjunta.

### A.1. Por caso — o caso foi detectado nas três execuções

Critério: o caso vulnerável conta como detectado apenas se apareceu em **todas** as execuções do assistente, mesmo que a linha ou o CWE do achado variem entre elas. É a leitura que corresponde a «se não foi achado em uma execução, considera que não foi achado».

| Instrumento | VP | FP par | FN | Precisão | Revocação | F1 | VP−FP |
|---|---:|---:|---:|---:|---:|---:|---:|
| semgrep (execução única) | 4 | 1 | 26 | 0,800 | 0,133 | 0,229 | 0,100 |
| eslint (execução única) | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |
| njsscan (execução única) | 5 | 0 | 25 | 1,000 | 0,167 | 0,286 | 0,167 |
| codeql (execução única) | 11 | 3 | 19 | 0,786 | 0,367 | 0,500 | 0,267 |
| antigravity | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |
| claude-code | 27 | 0 | 3 | 1,000 | 0,900 | 0,947 | 0,900 |
| cursor | 24 | 0 | 6 | 1,000 | 0,800 | 0,889 | 0,800 |

Casos que caíram por não estarem nas três execuções:

- claude-code — detectado em duas execuções: C-434-01-V; em uma execução: C-089-01-V.
- cursor — detectado em duas execuções: C-327-02-V; em uma execução: C-089-01-V, C-327-01-V, C-338-02-V.

Comparação com as variantes do protocolo, em casos vulneráveis detectados de 30:

| Assistente | União (principal) | Maioria (≥2) | Três execuções (por caso) |
|---|---:|---:|---:|
| claude-code | 29 | 26 | 27 |
| cursor | 28 | 24 | 24 |
| antigravity | 0 | 0 | 0 |

União dos três assistentes sob este critério: 25/30 (83,3%), contra 29/30 na união do protocolo. União geral com as quatro ferramentas: 28/30 (93,3%), contra 29/30.

### A.2. Por achado — o mesmo achado apareceu nas três execuções

Critério mais estrito: exige que a identidade do achado (`arquivo|linha|CWE`) se repita nas três execuções. É a variante `unanimidade` do `summary.md`.

| Assistente | Achados | VP | FP par | FN | Precisão | Revocação | F1 | VP−FP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| claude-code | 22 | 22 | 0 | 8 | 1,000 | 0,733 | 0,846 | 0,733 |
| cursor | 23 | 16 | 0 | 14 | 1,000 | 0,533 | 0,696 | 0,533 |
| antigravity | 0 | 0 | 0 | 30 | 0,000 | 0,000 | 0,000 | 0,000 |

A diferença entre A.1 e A.2 é a variação de linha e de CWE entre execuções, não a ausência de detecção: dos 7 casos que claude-code perde da união para A.2, **5 foram detectados nas três execuções**, em linha ou CWE diferentes (C-078-01-V, C-078-02-V, C-079-02-V, C-327-01-V, C-798-02-V); em cursor, **8 dos 12** (C-022-02-V, C-284-01-V, C-338-01-V, C-502-02-V, C-532-01-V, C-532-02-V, C-798-02-V, C-916-01-V).

### A.3. Efeito sobre a conferência manual

Nenhum. A população da conferência manual continua sendo a das classificações do resultado principal (454 itens, 102 conferidos, 22,5%, divergência 0,00%); as variantes deste anexo são calculadas à parte e não entram naquela população.
