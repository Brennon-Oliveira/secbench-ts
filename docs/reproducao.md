# Reprodução da medição

Procedimento oficial alinhado a `docs/PROTOCOLO-MEDICAO.md` §5. A coleta ocorre **somente** no ambiente de medição preparado; normalização e pontuação ocorrem **depois**, de volta no repositório completo.

## Versões de referência

Registre na execução:

- Node.js: `node -v` (exige ≥ 22)
- npm: `npm -v`
- commit do repositório de origem: `git rev-parse HEAD`
- caminho do atestado emitido por `measurement:prepare`
- hash agregado do corpus no atestado

## Ordem obrigatória

### 1. Clone limpo do repositório

Clone o commit versionado em um diretório novo (não use o checkout de desenvolvimento com harness carregado como origem da coleta).

### 2. Dependências no clone

No clone:

```bash
npm ci
```

Reconstrua o corpus se necessário para o commit medido:

```bash
npm run build:corpus
```

### 3. Preparar o ambiente de medição

Ainda no clone, copie apenas o material permitido para um destino **fora** do repositório:

```bash
npm run measurement:prepare -- --out ../secbench-measurement
```

O script emite um atestado JSON **fora** do ambiente preparado (por padrão ao lado do destino). Preserve o atestado junto aos relatórios brutos.

Confira com `--verify-only` se quiser apenas o hash do corpus de origem:

```bash
npm run measurement:verify
```

### 4. Entrar no ambiente preparado e reinstalar dependências

```bash
cd ../secbench-measurement
npm ci
```

O manifesto reduzido remove scripts que referenciam material excluído; as dependências de versão permanecem.

### 5. Varreduras determinísticas (somente aqui)

Dentro do ambiente preparado, com as ferramentas no PATH:

```bash
npm run scan:semgrep
npm run scan:njsscan
npm run scan:eslint
npm run scan:codeql
```

Registre versão, comando completo, data/hora, duração e código de saída de cada ferramenta (protocolo §3).

### 6. Varredura do modelo de linguagem (somente aqui)

Ainda no ambiente preparado, sem regras/skills do harness e sem acesso ao restante do repositório:

```bash
# LLM_ENDPOINT, LLM_API_KEY, LLM_MODEL, LLM_TEMPERATURE conforme o protocolo §6
npm run scan:llm
```

O prompt fixo é apenas `tools/llm/prompt.md` + um arquivo de `corpus/` por requisição.

### 7. Copiar relatórios brutos de volta

Copie `results/raw/` do ambiente preparado para o clone/repositório de análise. Confira que o hash agregado do `corpus/` do repositório coincide com o do atestado. Divergência invalida a coleta.

**Não versione o conteúdo do ambiente de medição** — apenas brutos, atestado e (depois) normalizados/relatórios no repositório de análise.

### 8. Normalizar e pontuar (somente no repositório completo)

Normalização e pontuação **não** podem rodar no ambiente de medição: dependem do registro de classificação (`ground-truth.json`) e de ferramentas de análise deliberadamente excluídas da lista de inclusão.

No repositório completo (com gabarito):

```bash
npm run normalize
npm run score
```

Relatórios em `results/reports/summary.json` e `summary.md`.

## O que o ambiente de medição não contém

Código-fonte marcado (`src/`), `ground-truth.json`, catálogo, especificação, harness, metodologia, testes de proof, configuração do agente (`.cursor/`), documentação de apresentação, histórico git, scripts de build/normalize/score, e o próprio `PROTOCOLO-MEDICAO.md`. Ver protocolo §5.3.

## Determinismo do corpus (fora da coleta)

```bash
npm run build:corpus
cp -a corpus /tmp/corpus-a
cp ground-truth.json /tmp/gt-a.json
npm run build:corpus
diff -qr /tmp/corpus-a corpus
diff /tmp/gt-a.json ground-truth.json
```

Saídas devem ser idênticas.
