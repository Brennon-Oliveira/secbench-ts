# SecBench-TS — pontuação

Gerado em 2026-09-10T22:17:23.059Z a partir de results/normalized/all.json e results/normalized/assistant-sessions.json.

Casos vulneráveis: 30. Casos protegidos: 30. Janela de linhas: ±5. Identidade de achado: `file|line|cwe`.

## Legenda das colunas

| Coluna | Significado |
| --- | --- |
| Achados | achados considerados na variante |
| VP | verdadeiro positivo (§4.1): arquivo do caso vulnerável, linha em ±5 do sink, CWE no conjunto de equivalência (§7.3); no máximo um por caso e por instrumento |
| FP par | falso positivo de par (§4.2): achado no intervalo do membro protegido do par, com CWE equivalente |
| FN | falso negativo (§4.4): caso vulnerável sem verdadeiro positivo |
| Fora de escopo | §4.3: achado que não corresponde a caso declarado; fora do cálculo da precisão |
| Redundantes | §4.1: achados excedentes sobre caso já contado como verdadeiro positivo |
| Sem localização | §4.5: achado sem linha ou com linha zero |
| Não mapeados | §4.6: CWE não resolvido pela ordem do §7.1 |
| Precisão | VP ÷ (VP + FP par) |
| Revocação | VP ÷ 30 (casos vulneráveis) |
| F1 | média harmônica de precisão e revocação |
| VP−FP | (VP ÷ casos vulneráveis) − (FP par ÷ casos protegidos); índice de Youden |
| Variante | execucao = uma sessão; principal = união das três (§6.7); maioria = em ao menos duas (§6.7); unanimidade = nas três (fora do protocolo) |

## Resultado principal por instrumento

| Instrumento | Variante | Achados | VP | FP par | FN | Fora de escopo | Redundantes | Sem localização | Não mapeados | Precisão | Revocação | F1 | VP−FP |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| semgrep | principal | 38 | 4 | 1 | 26 | 32 | 0 | 0 | 1 | 0.800 | 0.133 | 0.229 | 0.100 |
| eslint | principal | 75 | 0 | 0 | 30 | 0 | 0 | 0 | 75 | 0.000 | 0.000 | 0.000 | 0.000 |
| njsscan | principal | 49 | 5 | 0 | 25 | 43 | 1 | 0 | 0 | 1.000 | 0.167 | 0.286 | 0.167 |
| codeql | principal | 27 | 11 | 3 | 19 | 11 | 2 | 0 | 0 | 0.786 | 0.367 | 0.500 | 0.267 |
| antigravity | principal | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 | 0.000 |
| claude-code | principal | 59 | 29 | 0 | 1 | 23 | 7 | 0 | 0 | 1.000 | 0.967 | 0.983 | 0.967 |
| cursor | principal | 73 | 28 | 0 | 2 | 36 | 9 | 0 | 0 | 1.000 | 0.933 | 0.966 | 0.933 |

## Assistentes: por execução, união, maioria e unanimidade

A variante `unanimidade` (achado presente nas três execuções) **não** faz parte do protocolo, que fixa em §6.7 união, execução individual e maioria. Ela consta como análise exploratória complementar (§12) e não substitui o resultado principal, que é a união.

| Instrumento | Variante | Achados | VP | FP par | FN | Fora de escopo | Redundantes | Sem localização | Não mapeados | Precisão | Revocação | F1 | VP−FP |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| antigravity | principal | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 | 0.000 |
| antigravity run1 | execucao | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 | 0.000 |
| antigravity run2 | execucao | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 | 0.000 |
| antigravity run3 | execucao | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 | 0.000 |
| antigravity | maioria | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 | 0.000 |
| antigravity | unanimidade | 0 | 0 | 0 | 30 | 0 | 0 | 0 | 0 | 0.000 | 0.000 | 0.000 | 0.000 |
| claude-code | principal | 59 | 29 | 0 | 1 | 23 | 7 | 0 | 0 | 1.000 | 0.967 | 0.983 | 0.967 |
| claude-code run1 | execucao | 45 | 29 | 0 | 1 | 16 | 0 | 0 | 0 | 1.000 | 0.967 | 0.983 | 0.967 |
| claude-code run2 | execucao | 32 | 27 | 0 | 3 | 5 | 0 | 0 | 0 | 1.000 | 0.900 | 0.947 | 0.900 |
| claude-code run3 | execucao | 36 | 28 | 0 | 2 | 8 | 0 | 0 | 0 | 1.000 | 0.933 | 0.966 | 0.933 |
| claude-code | maioria | 32 | 26 | 0 | 4 | 6 | 0 | 0 | 0 | 1.000 | 0.867 | 0.929 | 0.867 |
| claude-code | unanimidade | 22 | 22 | 0 | 8 | 0 | 0 | 0 | 0 | 1.000 | 0.733 | 0.846 | 0.733 |
| cursor | principal | 73 | 28 | 0 | 2 | 36 | 9 | 0 | 0 | 1.000 | 0.933 | 0.966 | 0.933 |
| cursor run1 | execucao | 48 | 27 | 0 | 3 | 21 | 0 | 0 | 0 | 1.000 | 0.900 | 0.947 | 0.900 |
| cursor run2 | execucao | 42 | 25 | 0 | 5 | 17 | 0 | 0 | 0 | 1.000 | 0.833 | 0.909 | 0.833 |
| cursor run3 | execucao | 47 | 25 | 0 | 5 | 22 | 0 | 0 | 0 | 1.000 | 0.833 | 0.909 | 0.833 |
| cursor | maioria | 41 | 24 | 0 | 6 | 17 | 0 | 0 | 0 | 1.000 | 0.800 | 0.889 | 0.800 |
| cursor | unanimidade | 23 | 16 | 0 | 14 | 7 | 0 | 0 | 0 | 1.000 | 0.533 | 0.696 | 0.533 |

## Consolidação por caso sob unanimidade — análise exploratória complementar

Critério: o caso conta como detectado apenas se foi detectado em **todas** as execuções do
assistente, ainda que a linha ou o CWE do achado variem entre elas. Não faz parte do protocolo
(§6.7 fixa união, execução individual e maioria) e não substitui o resultado principal.
Ferramenta determinística tem execução única e não admite este critério.

| Assistente | Execuções | Casos em todas | Casos em 2 | Casos em 1 | VP | FP par | FN | Precisão | Revocação | F1 | VP−FP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| antigravity | 3 | 0 | 0 | 0 | 0 | 0 | 30 | 0.000 | 0.000 | 0.000 | 0.000 |
| claude-code | 3 | 27 | 1 | 1 | 27 | 0 | 3 | 1.000 | 0.900 | 0.947 | 0.900 |
| cursor | 3 | 24 | 1 | 3 | 24 | 0 | 6 | 1.000 | 0.800 | 0.889 | 0.800 |

Casos detectados em parte das execuções, por assistente:

- antigravity — em duas execuções: —; em uma execução: —
- claude-code — em duas execuções: C-434-01-V; em uma execução: C-089-01-V
- cursor — em duas execuções: C-327-02-V; em uma execução: C-089-01-V, C-327-01-V, C-338-02-V

## Estabilidade dos assistentes (§6.8)

| Assistente | Achados distintos | Presentes nas três execuções | Estabilidade |
| --- | ---: | ---: | ---: |
| antigravity | 0 | 0 | 0.0% |
| claude-code | 59 | 22 | 37.3% |
| cursor | 73 | 23 | 31.5% |

### Estabilidade por categoria CWE

| Assistente | CWE | Distintos | Nas três | Estabilidade |
| --- | --- | ---: | ---: | ---: |
| claude-code | CWE-1188 | 1 | 0 | 0.0% |
| claude-code | CWE-1333 | 1 | 1 | 100.0% |
| claude-code | CWE-200 | 1 | 0 | 0.0% |
| claude-code | CWE-209 | 1 | 1 | 100.0% |
| claude-code | CWE-22 | 3 | 2 | 66.7% |
| claude-code | CWE-287 | 6 | 0 | 0.0% |
| claude-code | CWE-306 | 1 | 1 | 100.0% |
| claude-code | CWE-321 | 1 | 0 | 0.0% |
| claude-code | CWE-327 | 1 | 1 | 100.0% |
| claude-code | CWE-338 | 2 | 2 | 100.0% |
| claude-code | CWE-434 | 2 | 0 | 0.0% |
| claude-code | CWE-502 | 2 | 2 | 100.0% |
| claude-code | CWE-522 | 1 | 0 | 0.0% |
| claude-code | CWE-532 | 2 | 2 | 100.0% |
| claude-code | CWE-601 | 1 | 1 | 100.0% |
| claude-code | CWE-639 | 7 | 1 | 14.3% |
| claude-code | CWE-640 | 1 | 0 | 0.0% |
| claude-code | CWE-78 | 4 | 0 | 0.0% |
| claude-code | CWE-79 | 3 | 1 | 33.3% |
| claude-code | CWE-798 | 6 | 1 | 16.7% |
| claude-code | CWE-862 | 1 | 1 | 100.0% |
| claude-code | CWE-89 | 3 | 1 | 33.3% |
| claude-code | CWE-916 | 5 | 1 | 20.0% |
| claude-code | CWE-918 | 2 | 2 | 100.0% |
| claude-code | CWE-94 | 1 | 1 | 100.0% |
| cursor | CWE-1333 | 2 | 1 | 50.0% |
| cursor | CWE-200 | 3 | 0 | 0.0% |
| cursor | CWE-201 | 3 | 1 | 33.3% |
| cursor | CWE-209 | 1 | 1 | 100.0% |
| cursor | CWE-22 | 4 | 2 | 50.0% |
| cursor | CWE-285 | 1 | 0 | 0.0% |
| cursor | CWE-287 | 4 | 0 | 0.0% |
| cursor | CWE-306 | 5 | 1 | 20.0% |
| cursor | CWE-321 | 3 | 0 | 0.0% |
| cursor | CWE-327 | 3 | 0 | 0.0% |
| cursor | CWE-328 | 2 | 0 | 0.0% |
| cursor | CWE-330 | 2 | 0 | 0.0% |
| cursor | CWE-338 | 1 | 0 | 0.0% |
| cursor | CWE-502 | 3 | 1 | 33.3% |
| cursor | CWE-532 | 4 | 0 | 0.0% |
| cursor | CWE-601 | 1 | 1 | 100.0% |
| cursor | CWE-613 | 1 | 0 | 0.0% |
| cursor | CWE-639 | 9 | 5 | 55.6% |
| cursor | CWE-640 | 1 | 0 | 0.0% |
| cursor | CWE-78 | 2 | 2 | 100.0% |
| cursor | CWE-79 | 2 | 2 | 100.0% |
| cursor | CWE-798 | 6 | 2 | 33.3% |
| cursor | CWE-862 | 1 | 0 | 0.0% |
| cursor | CWE-89 | 3 | 1 | 33.3% |
| cursor | CWE-916 | 3 | 0 | 0.0% |
| cursor | CWE-918 | 2 | 2 | 100.0% |
| cursor | CWE-94 | 1 | 1 | 100.0% |

## Cobertura declarada de arquivos (§5.5 da tarefa — reportada, não aplicada)

| Sessão | Produto | Desfecho | Arquivos examinados | Total do corpus | Proporção |
| --- | --- | --- | ---: | ---: | ---: |
| antigravity-run1 | Antigravity CLI | recusa | 0 | 76 | 0.0% |
| antigravity-run2 | Antigravity CLI | recusa | 0 | 76 | 0.0% |
| antigravity-run3 | Antigravity CLI | recusa | 0 | 76 | 0.0% |
| claude-code-run1 | Claude Code | concluido | 73 | 76 | 96.1% |
| claude-code-run2 | Claude Code | concluido | 76 | 76 | 100.0% |
| claude-code-run3 | Claude Code | concluido | 76 | 76 | 100.0% |
| cursor-run1 | Cursor Agents | concluido | 76 | 76 | 100.0% |
| cursor-run2 | Cursor Agents | concluido | 76 | 76 | 100.0% |
| cursor-run3 | Cursor Agents | concluido | 76 | 76 | 100.0% |

## Cobertura por categoria CWE (casos vulneráveis detectados)

| CWE | Casos | semgrep | eslint | njsscan | codeql | antigravity | claude-code | cursor |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| CWE-22 | 2 | 0/2 | 0/2 | 0/2 | 1/2 | 0/2 | 2/2 | 2/2 |
| CWE-78 | 2 | 0/2 | 0/2 | 0/2 | 2/2 | 0/2 | 2/2 | 2/2 |
| CWE-79 | 2 | 1/2 | 0/2 | 0/2 | 0/2 | 0/2 | 2/2 | 2/2 |
| CWE-89 | 2 | 0/2 | 0/2 | 0/2 | 2/2 | 0/2 | 2/2 | 2/2 |
| CWE-94 | 1 | 0/1 | 0/1 | 1/1 | 1/1 | 0/1 | 1/1 | 1/1 |
| CWE-209 | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 1/1 | 1/1 |
| CWE-284 | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 1/1 | 1/1 |
| CWE-306 | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 1/1 | 1/1 |
| CWE-327 | 2 | 1/2 | 0/2 | 2/2 | 0/2 | 0/2 | 2/2 | 2/2 |
| CWE-338 | 2 | 0/2 | 0/2 | 0/2 | 0/2 | 0/2 | 2/2 | 2/2 |
| CWE-434 | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 1/1 | 0/1 |
| CWE-502 | 2 | 1/2 | 0/2 | 0/2 | 1/2 | 0/2 | 2/2 | 2/2 |
| CWE-532 | 2 | 0/2 | 0/2 | 0/2 | 0/2 | 0/2 | 2/2 | 2/2 |
| CWE-601 | 1 | 0/1 | 0/1 | 0/1 | 1/1 | 0/1 | 1/1 | 1/1 |
| CWE-639 | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 1/1 | 1/1 |
| CWE-798 | 2 | 0/2 | 0/2 | 2/2 | 0/2 | 0/2 | 2/2 | 2/2 |
| CWE-916 | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 1/1 | 1/1 |
| CWE-918 | 2 | 0/2 | 0/2 | 0/2 | 2/2 | 0/2 | 2/2 | 2/2 |
| CWE-1104 | 1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 | 0/1 |
| CWE-1333 | 1 | 1/1 | 0/1 | 0/1 | 1/1 | 0/1 | 1/1 | 1/1 |

## Sobreposição (índice de Jaccard sobre casos vulneráveis detectados)

| Par | Jaccard |
| --- | ---: |
| semgrep × eslint | 0.000 |
| semgrep × njsscan | 0.125 |
| semgrep × codeql | 0.071 |
| semgrep × antigravity | 0.000 |
| semgrep × claude-code | 0.138 |
| semgrep × cursor | 0.143 |
| eslint × njsscan | 0.000 |
| eslint × codeql | 0.000 |
| eslint × antigravity | 0.000 |
| eslint × claude-code | 0.000 |
| eslint × cursor | 0.000 |
| njsscan × codeql | 0.067 |
| njsscan × antigravity | 0.000 |
| njsscan × claude-code | 0.172 |
| njsscan × cursor | 0.179 |
| codeql × antigravity | 0.000 |
| codeql × claude-code | 0.379 |
| codeql × cursor | 0.393 |
| antigravity × claude-code | 0.000 |
| antigravity × cursor | 0.000 |
| claude-code × cursor | 0.966 |

## Contribuição exclusiva

| Instrumento | Casos exclusivos | Identificadores |
| --- | ---: | --- |
| semgrep | 0 | — |
| eslint | 0 | — |
| njsscan | 0 | — |
| codeql | 0 | — |
| antigravity | 0 | — |
| claude-code | 1 | C-434-01-V |
| cursor | 0 | — |

## Cobertura das uniões

| União | Casos detectados | Cobertura |
| --- | ---: | ---: |
| Quatro ferramentas determinísticas | 17/30 | 56.7% |
| Três assistentes | 29/30 | 96.7% |
| União geral | 29/30 | 96.7% |

## Contagens de sessão

- Recusas: 3
- Interrupções (fora do cálculo principal): 0
- Respostas malformadas: 0

## Distribuição de achados por identificador de regra

| Instrumento | Identificador | Achados | CWE resolvido |
| --- | --- | ---: | --- |
| semgrep | rules.javascript.express.security.audit.xss.direct-response-write | 32 | CWE-79 |
| semgrep | rules.javascript.express.security.injection.raw-html-format | 2 | CWE-79 |
| semgrep | rules.javascript.lang.security.audit.md5-used-as-password | 1 | CWE-327 |
| semgrep | rules.typescript.lang.best-practice.moment-deprecated | 1 | não mapeado |
| semgrep | rules.javascript.express.security.audit.express-third-party-object-deserialization | 1 | CWE-502 |
| semgrep | rules.javascript.lang.security.audit.detect-redos | 1 | CWE-1333 |
| eslint | unknown | 75 | não mapeado |
| njsscan | express_xss | 22 | CWE-79 |
| njsscan | node_nosqli_injection | 12 | CWE-943 |
| njsscan | regex_dos | 7 | CWE-185 |
| njsscan | node_insecure_random_generator | 2 | CWE-327 |
| njsscan | node_md5 | 2 | CWE-327 |
| njsscan | eval_nodejs | 1 | CWE-95 |
| njsscan | node_aes_ecb | 1 | CWE-327 |
| njsscan | node_api_key | 1 | CWE-798 |
| njsscan | node_secret | 1 | CWE-798 |
| codeql | js/missing-rate-limiting | 10 | CWE-770 |
| codeql | js/request-forgery | 4 | CWE-918 |
| codeql | js/sql-injection | 2 | CWE-89 |
| codeql | js/command-line-injection | 2 | CWE-78 |
| codeql | js/code-injection | 2 | CWE-94 |
| codeql | js/server-side-unvalidated-url-redirection | 2 | CWE-601 |
| codeql | js/redos | 1 | CWE-1333 |
| codeql | js/polynomial-redos | 1 | CWE-1333 |
| codeql | js/unsafe-deserialization | 1 | CWE-502 |
| codeql | js/shell-command-injection-from-environment | 1 | CWE-78 |
| codeql | js/path-injection | 1 | CWE-22 |

## Metadados de execução das ferramentas determinísticas

| Ferramenta | Versão | Imagem | Duração (s) | Código de saída | Data |
| --- | --- | --- | ---: | ---: | --- |
| semgrep | 1.174.0 | sast-semgrep:1.174.0 | 248 | 0 | 2026-09-03T18:43:00.468Z |
| eslint | 22.23.2 | node:22-bookworm | 9 | 1 | 2026-09-03T18:43:34.686Z |
| njsscan | 0.3.2 | opensecurity/njsscan:0.3.2 | 8 | 1 | 2026-09-03T18:43:25.017Z |
| codeql | 2.26.3 | sast-codeql:2.26.3 | 36 | 0 | 2026-09-03T18:44:26.959Z |

## Observação de implementação

§4.2 é aplicado com a mesma janela de ±5 linhas em torno do intervalo do caso protegido, como na implementação versionada antes da coleta; a contagem sob leitura estrita do intervalo é reportada em falsePositivesStrictInterval, sem ser aplicada.

| Instrumento | FP par (janela ±5) | FP par (intervalo estrito) |
| --- | ---: | ---: |
| semgrep | 1 | 1 |
| eslint | 0 | 0 |
| njsscan | 0 | 0 |
| codeql | 3 | 3 |
| antigravity | 0 | 0 |
| claude-code | 0 | 0 |
| cursor | 0 | 0 |
