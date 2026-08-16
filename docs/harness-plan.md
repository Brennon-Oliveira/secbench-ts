# Plano do harness SecBench-TS

**Data:** 2026-08-16  
**Referência:** `docs/specs/HARNESS.md` + documentação oficial Cursor

## Mapeamento de mecanismos (seções 3–8)

| Item | Mecanismo escolhido | Justificativa |
|------|---------------------|---------------|
| 3.x Invariantes | Regras `.cursor/rules/*.mdc` + hooks + CI (`verify`) | Texto guia o agente; script e CI garantem |
| 4.1 Contrato geral | Rule `alwaysApply` | Precisa estar em toda sessão de desenvolvimento |
| 4.2 Autoria de casos | Rule com `globs: src/modules/**` | Ativa só ao editar módulos do artefato |
| 4.3 Pipeline | Rule com `globs: tools/**,corpus/**,ground-truth.json` | Escopo nos artefatos derivados e build |
| 4.4 Testes | Rule com `globs: tests/**` | Escopo nos testes de comprovação |
| 4.5 Medição | Rule com `globs: results/**` | Protege números gerados |
| 4.6 Repositório público | Rule com `globs: README.md,SECURITY.md,...` | Escopo em metadados públicos |
| 4.7 Registro de desvio | Rule `alwaysApply` | Desvio não registrado é defeito |
| 5.1–5.8 Skills | `.cursor/skills/*/SKILL.md` | Procedimentos com critérios objetivos |
| 6.1 Editar derivados | Hook `preToolUse` (Write/StrReplace) | Bloqueia edição de `corpus/` e `ground-truth.json` |
| 6.2 Supressões | Hook `afterFileEdit` + script compartilhado | Mesma lista do build; falha fechada |
| 6.3 Vocabulário | Hook `afterFileEdit` + `tools/forbidden-vocab.json` | Fonte única com o build |
| 6.4 Regenerar corpus | Hook `stop` + skill regenerate | Valida ao fim do ciclo; CI reforça |
| 6.5 Bloquear ciclo | Hook `stop` rodando `npm run verify` parcial | Falha se proof/parity quebrarem |
| 6.6 Trilha de auditoria | `.cursor/logs/harness-audit.jsonl` | Evidência metodológica |
| 7.1 Autor | Subagent `.cursor/agents/case-author.md` | Acesso a spec e gabarito |
| 7.2 Auditor cego | Subagent `blind-auditor.md` + `readonly` | Sem acesso a gabarito/spec (hooks) |
| 7.3 Verificador | Subagent `measurement-verifier.md` | Só recalcula amostra |
| 8 Isolamento LLM | Rule + docs/reproducao.md + proibição em sessão | Medição fora do harness de desenvolvimento |
| 9 Contexto | Rule sempre ativa aponta specs; catálogo sob demanda | Evita inflar contexto |

## Cobertura dos invariantes (seção 3)

| Invariante | Regra | Automação | CI |
|------------|-------|-----------|-----|
| 3.1 Não corrigir falhas | 4.1, 4.2 | — | proof tests |
| 3.2 Antivazamento | 4.2 | hook vocab | `build:corpus` |
| 3.3 Sem supressão | 4.2, 4.3 | hook | `build:corpus` |
| 3.4 Sem controle global | 4.1 | — | revisão + smoke |
| 3.5 Pares simétricos | 4.2 | skill parity | proof |
| 3.6 Gabarito gerado | 4.3 | hook bloqueia edição | `build:corpus` |
| 3.7 Corpus derivado | 4.3 | hook bloqueia edição | — |
| 3.8 Determinismo | 4.3 | skill regenerate | `verify` |
| 3.9 Proof tests | 4.4 | hook stop | `test:proof` |
| 3.10 Libs obrigatórias | 4.1 | — | package.json review |
| 3.11 Sem dado real | 4.6 | — | publication skill |
| 3.12 Escopo fechado | 4.1, 4.7 | — | catálogo no build |

## Lacunas declaradas

- Hooks Cursor não conseguem impedir *todos* os caminhos de edição (edição manual fora do Agent). Mitigação: CI + `verify` + aviso em regras.
- `beforeReadFile` no auditor cego bloqueia leitura de `ground-truth.json` e `docs/specs/PROJETO.md` quando o subagent `blind-auditor` está ativo; se o matcher de subagent não estiver disponível no evento, a skill 5.3 exige que o agente declare ambiente limpo e a limitação fica registrada aqui.
- Formatação automática global é proibida (HARNESS §11); nenhum hook de format foi criado.
