# Reprodução da medição

Procedimento oficial alinhado a `docs/PROTOCOLO-MEDICAO.md` (seção 5). A coleta das ferramentas determinísticas ocorre **somente** no ambiente de medição preparado, via contêineres; normalização e pontuação ocorrem **depois**, de volta no repositório completo.

Os assistentes de codificação avaliados (`scan:llm` e sessões manuais equivalentes) **não** passam por contêiner: o operador os executa na máquina local **contra o ambiente preparado**, em **sessão nova** a cada execução, sem harness de desenvolvimento carregado.

## Pré-requisitos

- Docker Engine com Compose v2
- Node.js ≥ 22 (só para orquestrar scripts `tsx`; as ferramentas SAST rodam nos contêineres)
- Rede apenas para construir imagens e para o passo `eslint-deps` (`npm ci`); as varreduras usam `network_mode: none`

## Versões de referência

Registre na execução:

- Node.js: `node -v` (exige ≥ 22)
- npm: `npm -v`
- Docker: `docker version`
- commit do repositório de origem: `git rev-parse HEAD`
- conteúdo de `docker/versions.json` (digests e versões reportadas)
- caminho do atestado emitido por `measurement:prepare`
- hash agregado do corpus no atestado

## Ordem obrigatória

### 1. Clone limpo do repositório

Clone o commit versionado em um diretório novo (não use o checkout de desenvolvimento com harness carregado como origem da coleta).

### 2. Dependências no clone

```bash
npm ci
```

Reconstrua o corpus se necessário para o commit medido:

```bash
npm run build:corpus
```

### 3. Construir imagens e gerar arquivo de versões

```bash
npm run docker:versions
```

Isso reconstrói as imagens locais (Semgrep com regras pinadas, CodeQL com bundle pinado), consulta as imagens oficiais e grava `docker/versions.json`. Não use a etiqueta `latest` em lugar algum.

### 4. Preparar o ambiente de medição

Ainda no clone, copie apenas o material permitido para um destino **fora** do repositório:

```bash
npm run measurement:prepare -- --out ../loja-measurement
```

O script emite um atestado JSON **fora** do ambiente preparado. Preserve o atestado junto aos relatórios brutos.

### 5. Entrar no ambiente preparado e reinstalar dependências de aplicação

```bash
cd ../loja-measurement
npm ci
```

As varreduras SAST usam contêineres; o `npm ci` no ambiente preparado cobre a aplicação e o passo de dependências do ESLint.

### 6. Varreduras determinísticas (somente aqui, via contêiner)

Dentro do ambiente preparado (ou apontando `--target` para o `corpus/` dele a partir do clone que tem `docker/`):

```bash
npm run scan:semgrep
npm run scan:njsscan
npm run scan:eslint
npm run scan:codeql
```

Cada executor aceita `--target <dir>` ou `SCAN_TARGET` (padrão: `corpus`). Saída bruta em `results/raw/<ferramenta>/` com metadados ao lado (versão, imagem, digest, comando, data ISO, duração, exit code).

As varreduras rodam com rede desabilitada (`network_mode: none` no Compose). Exceção: `eslint-deps` usa rede só para `npm ci`, antes da varredura.

### 7. Assistentes de codificação (somente aqui, fora de contêiner)

Ainda no ambiente preparado, **sem** regras/skills do harness e sem acesso ao restante do repositório. Cada execução em sessão nova:

```bash
# LLM_ENDPOINT, LLM_API_KEY, LLM_MODEL, LLM_TEMPERATURE conforme o protocolo
npm run scan:llm
```

Não tente empacotar assistentes em Docker nesta medição.

### 8. Copiar relatórios brutos de volta

Copie `results/raw/` do ambiente preparado para o clone/repositório de análise. Confira que o hash agregado do `corpus/` coincide com o do atestado. Divergência invalida a coleta.

**Não versione o conteúdo do ambiente de medição** — apenas brutos, atestado e (depois) normalizados/relatórios no repositório de análise.

### 9. Normalizar e pontuar (somente no repositório completo)

```bash
npm run normalize
npm run score
```

Relatórios em `results/reports/summary.json` e `summary.md`.

## O que o ambiente de medição não contém

Código-fonte marcado (`src/`), `ground-truth.json`, catálogo, especificação, harness, metodologia, testes de proof, configuração do agente (`.cursor/`), documentação de apresentação, histórico git, scripts de build/normalize/score, e o próprio protocolo de medição. Ver protocolo (seção 5.3).

## Ensaio de calibração (não é medição)

Antes da coleta definitiva, o ensaio sobre `tools/dry-run-fixture/` valida contêineres e reconstruí identificadores em `tools/cwe-aliases.json`. Saídas em `results/dry-run/`. **Nunca** use o corpus definitivo para ensaio.

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
