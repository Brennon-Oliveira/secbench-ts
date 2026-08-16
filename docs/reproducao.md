# Reprodução da medição

## Versões de referência

Registre na execução:

- Node.js: `node -v` (exige ≥ 22)
- npm: `npm -v`
- commit do repositório: `git rev-parse HEAD`

## Passos

1. `npm ci` (ou `npm install`)
2. `cp .env.example .env` e preencha apenas o necessário para o ambiente local
3. `npm run build:corpus` — deve gerar 60 casos e falhar se houver vazamento de vocabulário
4. `npm test` — proof + smoke
5. (Opcional) ferramentas SAST, se instaladas no PATH:
   - `npm run scan:semgrep`
   - `npm run scan:codeql`
   - `npm run scan:njsscan`
   - `npm run scan:eslint`
6. `npm run normalize && npm run score`
7. Relatórios em `results/reports/summary.json` e `summary.md`

## Protocolo LLM (ambiente limpo)

A medição do modelo de linguagem **não** deve ser executada dentro de uma sessão Cursor/Agent que carregue as regras/skills do harness deste repositório.

Procedimento sugerido:

1. Checkout limpo do commit versionado
2. Sessão sem regras de projeto (ou máquina CI dedicada)
3. Variáveis: `LLM_ENDPOINT`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_TEMPERATURE` (padrão 0)
4. `npm run scan:llm`
5. Evidência: gravar que o prompt usado foi apenas `tools/llm/prompt.md` + conteúdo de um arquivo de `corpus/` por requisição

## Determinismo do corpus

```bash
npm run build:corpus
cp -a corpus /tmp/corpus-a
cp ground-truth.json /tmp/gt-a.json
npm run build:corpus
diff -qr /tmp/corpus-a corpus
diff /tmp/gt-a.json ground-truth.json
```

Saídas devem ser idênticas.
