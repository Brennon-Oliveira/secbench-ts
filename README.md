# SecBench-TS

> **AVISO DE SEGURANÇA / SECURITY WARNING**
>
> Este repositório contém código **deliberadamente inseguro**, criado como instrumento de pesquisa acadêmica. **Não execute** em rede acessível. Nenhum trecho serve como referência de implementação. **Não use em produção** sob nenhuma circunstância.
>
> This repository contains **deliberately insecure** code created as an academic research instrument. **Do not run** it on an accessible network. No snippet is a reference implementation. **Do not use in production** under any circumstances.

## Propósito

Artefato experimental do TCC *Detecção de vulnerabilidades em sistemas de software: comparação entre ferramentas SAST de código aberto e um modelo de linguagem*. O corpus TypeScript contém 30 pares de casos (vulnerável / protegido) com gabarito gerado automaticamente.

## Requisitos

- Node.js 22 LTS ou superior (registrado na execução)
- Docker Engine com Compose v2 (ferramentas SAST determinísticas rodam em contêiner; ver `docs/reproducao.md`)

## Instalação

```bash
npm install
cp .env.example .env
npm run docker:versions   # imagens SAST + docker/versions.json
```

## Comandos

| Script | Função |
|--------|--------|
| `npm run dev` | Sobe o servidor Fastify |
| `npm run build` | Compila TypeScript |
| `npm run build:corpus` | Gera `corpus/` e `ground-truth.json` |
| `npm test` | Testes (proof + smoke) |
| `npm run test:proof` | Só comprovação |
| `npm run docker:build` / `docker:versions` | Imagens SAST e arquivo de versões pinadas |
| `npm run scan:semgrep` / `codeql` / `njsscan` / `eslint` | Varreduras SAST via contêiner |
| `npm run scan:llm` | Protocolo LLM (**somente no ambiente de medição**, na máquina do operador — não conteinerizado) |
| `npm run measurement:prepare` | Monta ambiente de medição por lista de inclusão |
| `npm run measurement:verify` | Conferência do hash do corpus (sem alterar nada) |
| `npm run normalize` | Normaliza `results/raw` (fora do ambiente de medição) |
| `npm run score` | Calcula indicadores (fora do ambiente de medição) |
| `npm run verify` | `build:corpus` + testes |

## Estrutura

Ver `docs/specs/PROJETO.md`. Harness do agente: `docs/specs/HARNESS.md` e `docs/harness-plan.md`.

## Medição e reprodução

- Protocolo pré-registrado (regras de correspondência, ambiente isolado, LLM, indicadores): `docs/PROTOCOLO-MEDICAO.md`.
- Roteiro operacional (imagens Docker → `measurement:prepare` → varreduras em contêiner → retorno dos brutos → normalize/score): `docs/reproducao.md`.

Não execute varreduras no checkout de desenvolvimento com harness carregado.
