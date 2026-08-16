# SecBench-TS
## Especificação técnica completa do artefato de pesquisa

**Versão do documento:** 1.0
**Data:** 16/08/2026
**Autor da especificação:** Brennon Gabriel de Oliveira
**Contexto:** artefato experimental de Trabalho de Conclusão de Curso, Análise e Desenvolvimento de Sistemas, Centro Universitário ETEP em convênio com a Faculdade UniBF
**Destinatário:** modelo de geração de código ou desenvolvedor que implementará o projeto do zero

---

## 0. Como usar este documento

Este documento descreve integralmente um projeto de software a ser construído. Ele é a única fonte de verdade. Quem implementar não deve inferir requisitos ausentes a partir de convenções pessoais, não deve substituir bibliotecas por equivalentes que julgue melhores e não deve corrigir as falhas de segurança descritas na seção 10, porque essas falhas são o objeto de estudo e sua presença é intencional, controlada e documentada.

Toda decisão marcada como **obrigatória** é condição de validade do experimento. Toda decisão marcada como **livre** pode ser resolvida pelo implementador desde que respeite os princípios da seção 3.

Se alguma instrução deste documento entrar em conflito com uma boa prática usual de desenvolvimento, este documento prevalece.

---

## 1. Propósito do estudo

O trabalho ao qual este artefato pertence tem o seguinte título: DETECÇÃO DE VULNERABILIDADES EM SISTEMAS DE SOFTWARE: COMPARAÇÃO ENTRE FERRAMENTAS SAST DE CÓDIGO ABERTO E UM MODELO DE LINGUAGEM.

A pergunta de pesquisa é: em uma aplicação web escrita em TypeScript com vulnerabilidades conhecidas e documentadas, qual é a capacidade de detecção de ferramentas de análise estática de código aberto e de um modelo de linguagem de propósito geral, e como esses resultados se comparam em cobertura, precisão e natureza dos erros cometidos?

Para responder a essa pergunta é necessário um corpo de código em que se saiba, com exatidão e antes de qualquer varredura, onde existe vulnerabilidade e onde não existe. Sem esse gabarito não há como calcular acerto, e sem trechos seguros equivalentes não há como calcular falso positivo. Ferramentas de análise estática costumam ser comparadas apenas pelo número de alertas emitidos, o que premia a ferramenta mais barulhenta. O desenho pareado adotado aqui, herdado da metodologia do OWASP Benchmark, elimina esse viés.

O artefato não é o resultado da pesquisa. Ele é o instrumento de medição. Sua qualidade determina a validade de todos os números que o trabalho vai apresentar.

---

## 2. Papel do artefato no experimento

O fluxo experimental completo é o seguinte.

**Fase 1.** O código-fonte é escrito com marcadores de caso embutidos em comentários.

**Fase 2.** Um script de build remove todos os marcadores e produz o corpus, que é a versão do código efetivamente submetida às ferramentas. No mesmo passo, o script resolve os números de linha e grava o arquivo de gabarito.

**Fase 3.** Cada ferramenta de análise estática varre o corpus e produz um relatório bruto.

**Fase 4.** Um modelo de linguagem varre o mesmo corpus, arquivo por arquivo, sob protocolo fixo, sem acesso ao gabarito.

**Fase 5.** Um normalizador converte todos os relatórios brutos para um esquema comum.

**Fase 6.** Um script de pontuação compara os achados normalizados com o gabarito e produz os indicadores do trabalho.

O ponto crítico da Fase 2 é que o corpus não pode conter nenhuma pista sobre onde estão as falhas. Se um marcador, um nome de variável, um comentário ou um nome de arquivo indicar que determinado trecho é inseguro, o modelo de linguagem estará respondendo a uma dica, e não analisando código. O experimento inteiro perde validade. A seção 7 trata disso em detalhe e suas regras são as mais importantes de todo o documento.

---

## 3. Princípios de projeto invioláveis

**3.1. Todo caso vulnerável precisa ser real e alcançável.** Não existe vulnerabilidade decorativa. Cada falha descrita na seção 10 deve ser atingível por uma requisição HTTP a partir de uma rota registrada, e deve ser comprovada por um teste automatizado descrito na seção 12. Código morto não conta.

**3.2. Todo caso vulnerável tem um par seguro funcionalmente equivalente.** O par entrega a mesma funcionalidade de negócio, aceita entrada do mesmo tipo, devolve resposta de mesmo formato e difere apenas no controle de segurança aplicado. Se os pares divergirem em complexidade, tamanho ou estilo, a comparação fica contaminada.

**3.3. A aplicação precisa subir e funcionar.** Não é um conjunto de trechos avulsos. É um serviço executável, com banco populado, autenticação operante e rotas respondendo.

**3.4. Nada no corpus revela a classificação.** Nomes, comentários, estrutura de pastas e mensagens de log são neutros.

**3.5. O gabarito é gerado, nunca escrito à mão.** Números de linha escritos manualmente ficam desatualizados no primeiro refactor e corrompem a medição em silêncio.

**3.6. Determinismo.** Mesma entrada, mesmo resultado. Dados de teste com seed fixa, sem dependência de rede em tempo de execução, sem valores derivados do relógio fora dos casos que exigem isso.

**3.7. Nenhuma supressão de alerta.** É proibido usar `eslint-disable`, `nosemgrep`, `// @ts-ignore` ou qualquer diretiva que instrua ferramenta a ignorar trecho. Se o código precisar de supressão para passar, o código está errado para os fins deste projeto.

**3.8. Sinks reconhecíveis.** Quando houver escolha entre duas bibliotecas equivalentes, adota-se a mais difundida, para que uma eventual não detecção seja atribuível à regra da ferramenta e não à obscuridade da biblioteca.

---

## 4. Stack e versões

**Obrigatório:**

Node.js 22 LTS ou superior. Registrar a versão exata usada na execução.

TypeScript 5.x, modo estrito habilitado.

Fastify 5.x como framework HTTP.

Módulos ECMAScript, com `"type": "module"` no package.json e `moduleResolution` compatível.

Sequelize 6.x com dialeto SQLite para a camada de dados. Esta escolha é deliberada e está justificada no princípio 3.8: `sequelize.query` é um sink amplamente coberto por regras públicas, enquanto drivers menos comuns poderiam produzir não detecção por desconhecimento do sink e não por limitação real da ferramenta.

`zod` para validação de esquema nos casos seguros.

`@fastify/multipart` para upload.

`js-yaml` e `node-serialize` para os casos de desserialização.

Vitest como executor de testes.

**Livre:** organização interna de tipos, escolha de utilitários pequenos, formatação, desde que uniforme.

**Proibido:** qualquer framework de ORM adicional, qualquer biblioteca de segurança que sanitize globalmente por padrão, qualquer middleware que altere o comportamento dos casos vulneráveis, como `helmet` aplicado globalmente. Controles de segurança existem apenas dentro dos casos seguros, nunca no escopo global, porque um controle global mascararia as falhas e invalidaria o experimento.

---

## 5. Estrutura de diretórios

```
secbench-ts/
  package.json
  tsconfig.json
  vitest.config.ts
  README.md
  SECURITY.md
  LICENSE
  CITATION.cff
  .github/workflows/scan.yml
  src/
    server.ts
    app.ts
    config/
      env.ts
      constants.ts
    db/
      sequelize.ts
      models/
        user.ts
        order.ts
        invoice.ts
        integration.ts
      seed.ts
    plugins/
      auth.ts
      logger.ts
      error-handler.ts
    modules/
      auth/
      users/
      orders/
      files/
      integrations/
      system/
      reports/
    routes.ts
  tools/
    build-corpus.ts
    normalize.ts
    score.ts
    cwe-aliases.json
    llm/
      prompt.md
      run-llm.ts
  corpus/            (gerado, versionado)
  ground-truth.json  (gerado, versionado)
  results/
    raw/
    normalized/
    reports/
  tests/
    proof/
    smoke/
  docs/
    metodologia.md
    reproducao.md
```

O diretório `corpus/` e o arquivo `ground-truth.json` são gerados pelo build mas ficam versionados, porque são exatamente os artefatos que a pesquisa precisa tornar públicos e imutáveis por versão.

---

## 6. Domínio simulado e modelo de dados

A aplicação simula o backend de uma loja virtual de pequeno porte, chamada internamente de Loja. O domínio existe para dar plausibilidade ao código, e não para ser completo. Não implemente funcionalidade que não esteja listada aqui.

**Entidade User:** id inteiro autoincremento, email texto único, passwordHash texto, role texto com valores `customer` ou `admin`, resetToken texto opcional, createdAt data.

**Entidade Order:** id inteiro autoincremento, userId inteiro referenciando User, status texto com valores `pending`, `paid`, `shipped`, `cancelled`, total decimal, trackingCode texto, note texto livre, createdAt data.

**Entidade Invoice:** id inteiro autoincremento, orderId inteiro referenciando Order, fileName texto, issuedAt data.

**Entidade Integration:** id inteiro autoincremento, name texto, endpointUrl texto, apiKeyRef texto.

**Seed obrigatória e determinística:** oito usuários, sendo dois com role `admin`; vinte e quatro pedidos distribuídos entre os usuários e entre os quatro status; doze faturas; três integrações. Todos os valores derivados de uma seed numérica fixa igual a 20260816. Nenhum dado aleatório em tempo de execução da seed.

O banco é SQLite em arquivo, recriado a cada inicialização em ambiente de desenvolvimento e de teste.

---

## 7. Convenções de nomenclatura e regras antivazamento

Esta seção é a mais crítica do documento.

**7.1. Vocabulário proibido no corpus.** Nenhum arquivo, diretório, símbolo, string literal, mensagem de erro, mensagem de log ou comentário do corpus pode conter, em português ou em inglês, qualquer das palavras: vulnerável, vulnerable, vuln, inseguro, insecure, unsafe, seguro no sentido de contraste, safe, secure, hardened, exploit, payload, injection, injeção, attack, ataque, malicious, malicioso, bypass, CWE, OWASP, benchmark, caso de teste, testcase, bad, good, wrong, correct.

A palavra `safe` é aceitável apenas quando faz parte do nome de uma API externa, como `yaml.safeLoad`, situação em que remover a palavra seria impossível. Fora disso, proibida.

**7.2. Nomes de rota.** Cada par usa dois caminhos de negócio plausíveis e semanticamente próximos, sem que um deles pareça a versão corrigida do outro. O padrão adotado é: a rota do caso vulnerável usa o verbo mais genérico e a do caso seguro usa um verbo alternativo igualmente natural. Exemplo aprovado: `/orders/search` e `/orders/filter`. Exemplo reprovado: `/orders/search` e `/orders/search-secure`.

**7.3. Nomes de arquivo.** Derivados da funcionalidade, nunca da condição. Aprovado: `search-orders.ts` e `filter-orders.ts`. Reprovado: `search-orders-vuln.ts`.

**7.4. Nomes de função e variável.** Descrevem a operação de negócio. Aprovado: `buildOrderQuery`, `resolveAttachmentPath`. Reprovado: `unsafeQuery`, `sanitizedPath`. A palavra `sanitize` está proibida como nome de símbolo no corpus, porque sinaliza intenção; use `normalize`, `format` ou `parse`.

**7.5. Comentários.** O corpus final não deve conter comentário algum que explique decisão de segurança. Comentários neutros de negócio são permitidos com moderação. Se houver dúvida, remova o comentário.

**7.6. Simetria de estilo.** Os dois membros de um par devem ter contagem de linhas próxima, mesma ordem de operações, mesmo tratamento de erro e mesmo formato de resposta. Uma diferença marcante de tamanho por si só denuncia qual é qual.

**7.7. Distribuição.** Casos vulneráveis e seguros ficam misturados dentro dos mesmos módulos e, sempre que possível, dentro dos mesmos arquivos. É proibido concentrar todos os casos vulneráveis em um diretório e todos os seguros em outro.

**7.8. Ordem de registro.** A ordem de registro das rotas em `routes.ts` não deve seguir a ordem dos identificadores de caso. Registre por módulo e por ordem alfabética de caminho.

---

## 8. Sistema de marcação e pipeline de build do corpus

**8.1. Sintaxe dos marcadores.** No código-fonte em `src/`, cada caso é delimitado por três marcadores em comentários de linha:

```
// @case-begin C-089-01-V
...código do caso...
// @sink
const rows = await sequelize.query(sql)
// @case-end C-089-01-V
```

O marcador `@case-begin` abre o intervalo do caso. O marcador `@sink` indica que a próxima linha de código é a linha de referência do caso, ou seja, o ponto em que a falha se materializa. O marcador `@case-end` fecha o intervalo. Casos seguros usam a mesma sintaxe, inclusive o `@sink`, que neles aponta a linha da operação equivalente já protegida.

**8.2. Identificadores de caso.** Formato `C-<CWE em três ou quatro dígitos>-<sequência de dois dígitos>-<V ou S>`. Exemplos: `C-089-01-V`, `C-089-01-S`, `C-1333-01-V`. Cada identificador terminado em V tem obrigatoriamente um par terminado em S com o mesmo número de sequência.

**8.3. Comportamento do script `tools/build-corpus.ts`.**

Lê recursivamente todos os arquivos `.ts` de `src/`.

Copia cada arquivo para `corpus/`, preservando a estrutura de diretórios, removendo integralmente as linhas que contenham marcadores e removendo todo comentário que contenha qualquer palavra da lista da regra 7.1.

Calcula, para cada caso, o intervalo de linhas resultante no arquivo do corpus e a linha exata do sink, já compensando o deslocamento causado pela remoção das linhas de marcador.

Emite `ground-truth.json` conforme o esquema da seção 9.

Falha com erro e código de saída diferente de zero se: existir caso V sem par S ou vice-versa; existir `@case-begin` sem `@case-end`; existir caso sem `@sink`; existir no corpus resultante qualquer palavra da lista 7.1; existir identificador duplicado; existir caso declarado no catálogo da seção 10 e ausente no código, ou o inverso.

Essa validação automática é obrigatória. Ela é o que garante que a regra 7.1 não dependa de disciplina humana.

**8.4. Idempotência.** Rodar o build duas vezes sobre o mesmo `src/` produz `corpus/` e `ground-truth.json` byte a byte idênticos. Nada de timestamps dentro dos arquivos gerados.

---

## 9. Esquema do arquivo de gabarito

`ground-truth.json` tem a seguinte forma:

```json
{
  "schemaVersion": "1.0",
  "corpusRoot": "corpus",
  "totals": { "vulnerable": 30, "safe": 30 },
  "cases": [
    {
      "id": "C-089-01-V",
      "pairId": "C-089-01",
      "condition": "vulnerable",
      "cwe": "CWE-89",
      "owasp2025": "A05",
      "title": "Consulta de pedidos por status com montagem textual de SQL",
      "file": "corpus/modules/orders/routes/search-orders.ts",
      "startLine": 18,
      "endLine": 31,
      "sinkLine": 27,
      "entryPoint": "GET /orders/search",
      "source": "query.status",
      "sinkApi": "sequelize.query"
    }
  ]
}
```

O campo `condition` aceita `vulnerable` ou `safe`. O campo `owasp2025` usa os códigos oficiais da lista de 2025: A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures, A10 Mishandling of Exceptional Conditions.

---

## 10. Catálogo de casos

São trinta pares, portanto sessenta casos, cobrindo dezessete categorias CWE distintas. Cada bloco abaixo especifica o par completo. O implementador deve criar exatamente estes casos, com estes identificadores.

Notação usada em cada bloco: **Rota V** é o endpoint do caso vulnerável, **Rota S** é o do caso seguro, **Prova** é o comportamento que o teste da seção 12 deve demonstrar.

---

### 10.1. C-089-01 | CWE-89 | A05 | Injeção de SQL em busca por status

**Módulo:** orders.
**Rota V:** `GET /orders/search?status=`
**Rota S:** `GET /orders/filter?status=`
**Comportamento de negócio:** retorna a lista de pedidos do usuário autenticado cujo status corresponda ao informado, em JSON, com id, status, total e trackingCode.
**Implementação V:** montar a string SQL por concatenação com o valor recebido e executá-la via `sequelize.query`.
**Implementação S:** mesma consulta usando `replacements` nomeados do Sequelize, com validação prévia do status contra o conjunto de valores permitidos usando zod.
**Prova:** com `status=' OR '1'='1`, a rota V retorna pedidos de outros usuários; a rota S retorna erro de validação e nenhum pedido extra.

### 10.2. C-089-02 | CWE-89 | A05 | Injeção de SQL em busca de usuário por email

**Módulo:** users.
**Rota V:** `GET /users/lookup?email=`
**Rota S:** `GET /users/find?email=`
**Comportamento:** rota administrativa que devolve id, email e role do usuário informado.
**Implementação V:** template literal interpolando o email dentro do SQL.
**Implementação S:** consulta parametrizada por bind, com validação de formato de email.
**Prova:** payload `x' UNION SELECT id, email, passwordHash FROM Users --` expõe hashes na rota V e falha na rota S.

### 10.3. C-078-01 | CWE-78 | A05 | Injeção de comando na conversão de relatório

**Módulo:** reports.
**Rota V:** `POST /reports/convert`
**Rota S:** `POST /reports/transform`
**Comportamento:** recebe no corpo o nome de um arquivo já existente em `storage/reports` e dispara uma conversão simulada por linha de comando, retornando o caminho de saída.
**Implementação V:** `child_process.exec` com string montada por concatenação do nome recebido.
**Implementação S:** `child_process.execFile` com argumentos em vetor, nome validado contra lista de arquivos existentes no diretório e extensão restrita.
**Prova:** nome `a.txt; echo INJETADO` produz execução adicional na rota V e rejeição na rota S.

### 10.4. C-078-02 | CWE-78 | A05 | Injeção de comando em diagnóstico de rede

**Módulo:** system.
**Rota V:** `GET /system/diagnostics?host=`
**Rota S:** `GET /system/connectivity?host=`
**Comportamento:** executa verificação de alcance de um host e devolve a saída textual.
**Implementação V:** `exec` concatenando o host em um comando de shell.
**Implementação S:** `execFile` com host validado por expressão regular restrita a nomes de domínio e limitado por uma lista de hosts permitidos definida em constantes.
**Prova:** host `localhost && whoami` executa comando extra na rota V.

### 10.5. C-079-01 | CWE-79 | A05 | Cross-site scripting refletido em recibo

**Módulo:** orders.
**Rota V:** `GET /orders/receipt?note=`
**Rota S:** `GET /orders/voucher?note=`
**Comportamento:** devolve um recibo em HTML contendo a observação informada.
**Implementação V:** interpolação direta do valor dentro do HTML, resposta com `content-type: text/html`.
**Implementação S:** escape de `&`, `<`, `>`, `"` e `'` antes da interpolação, mais cabeçalho `content-type` explícito e limite de tamanho.
**Prova:** `note=<script>alert(1)</script>` sai íntegro na rota V e escapado na rota S.

### 10.6. C-079-02 | CWE-79 | A05 | Cross-site scripting em pré-visualização de busca

**Módulo:** orders.
**Rota V:** `GET /orders/preview?q=`
**Rota S:** `GET /orders/summary?q=`
**Comportamento:** devolve fragmento HTML com o termo buscado em destaque e a contagem de resultados.
**Implementação V:** concatenação do termo no fragmento.
**Implementação S:** escape antes da montagem.
**Prova:** termo `"><img src=x onerror=1>` quebra a marcação na rota V.

### 10.7. C-022-01 | CWE-22 | A01 | Travessia de diretório em download

**Módulo:** files.
**Rota V:** `GET /files/download?name=`
**Rota S:** `GET /files/fetch?name=`
**Comportamento:** entrega um arquivo do diretório `storage/uploads`.
**Implementação V:** `path.join` do diretório base com o nome recebido, seguido de leitura.
**Implementação S:** aplicar `path.basename`, resolver o caminho absoluto e verificar que o resultado começa pelo diretório base resolvido, além de conferir existência do nome em uma lista permitida.
**Prova:** nome `../../package.json` retorna conteúdo fora do diretório na rota V.

### 10.8. C-022-02 | CWE-22 | A01 | Travessia de diretório em anexo de fatura

**Módulo:** files.
**Rota V:** `GET /invoices/:id/attachment`
**Rota S:** `GET /invoices/:id/document`
**Comportamento:** entrega o arquivo associado à fatura, cujo nome vem do banco mas pode ser sobrescrito por um parâmetro opcional `override` de consulta.
**Implementação V:** usar o valor de `override` sem tratamento quando presente.
**Implementação S:** ignorar `override`, ou aceitá-lo somente após validação de pertencimento ao diretório.
**Prova:** `override=../../../etc/hosts` vaza arquivo do sistema na rota V.

### 10.9. C-502-01 | CWE-502 | A08 | Desserialização insegura de preferências

**Módulo:** users.
**Rota V:** `POST /preferences/import`
**Rota S:** `POST /preferences/load`
**Comportamento:** recebe um bloco de preferências codificado em base64 e o aplica ao perfil do usuário.
**Implementação V:** decodificar e passar o resultado a `unserialize` do pacote `node-serialize`.
**Implementação S:** decodificar, aplicar `JSON.parse` e validar com esquema zod que aceita apenas as chaves conhecidas, descartando o restante.
**Prova:** carga contendo função serializada executa código na rota V.

### 10.10. C-502-02 | CWE-502 | A08 | Carregamento inseguro de YAML de configuração

**Módulo:** integrations.
**Rota V:** `POST /integrations/config/apply`
**Rota S:** `POST /integrations/config/update`
**Comportamento:** recebe um documento YAML descrevendo parâmetros de integração e o converte em objeto.
**Implementação V:** `yaml.load` com `schema: yaml.DEFAULT_FULL_SCHEMA`, permitindo tipos arbitrários.
**Implementação S:** `yaml.load` com o esquema seguro padrão, seguido de validação zod.
**Prova:** documento com tag de tipo customizada é aceito na rota V e rejeitado na rota S.

### 10.11. C-094-01 | CWE-94 | A05 | Avaliação dinâmica de fórmula de relatório

**Módulo:** reports.
**Rota V:** `POST /reports/formula`
**Rota S:** `POST /reports/calculate`
**Comportamento:** recebe uma expressão aritmética simples envolvendo os campos `total` e `quantidade` e devolve o resultado.
**Implementação V:** construir a função com o construtor `Function` a partir da string recebida e executá-la.
**Implementação S:** interpretar a expressão com um analisador restrito que aceita apenas números, os dois nomes de campo e os operadores de soma, subtração, multiplicação e divisão, rejeitando qualquer outro token.
**Prova:** expressão `process.env` retorna dados do ambiente na rota V.

### 10.12. C-798-01 | CWE-798 | A02 | Chave de integração embutida no código

**Módulo:** integrations.
**Local V:** cliente de integração com a chave da API declarada como constante literal no arquivo.
**Local S:** cliente equivalente que lê a chave de variável de ambiente e encerra a inicialização se ela estiver ausente.
**Rotas:** ambos os clientes são usados por `POST /integrations/dispatch` e `POST /integrations/publish`, respectivamente.
**Prova:** a constante aparece literalmente no corpus; o par seguro não contém segredo algum.

### 10.13. C-798-02 | CWE-798 | A07 | Segredo de assinatura de token com valor padrão embutido

**Módulo:** auth.
**Local V:** função de emissão de token que usa `process.env.JWT_SECRET ?? 'dev-secret-please-change'`.
**Local S:** função equivalente que lança erro na inicialização caso a variável não esteja definida.
**Rotas:** `POST /auth/token` e `POST /auth/session`.
**Prova:** com a variável ausente, a rota V continua emitindo tokens assinados com segredo conhecido.

### 10.14. C-327-01 | CWE-327 | A04 | Hash de senha com algoritmo obsoleto

**Módulo:** auth.
**Rota V:** `POST /auth/register`
**Rota S:** `POST /auth/signup`
**Comportamento:** cria usuário a partir de email e senha.
**Implementação V:** `crypto.createHash('md5')` sobre a senha, sem sal.
**Implementação S:** `crypto.scrypt` com sal aleatório de dezesseis bytes gerado por `randomBytes`, armazenando sal e derivação.
**Prova:** o hash produzido pela rota V corresponde ao MD5 conhecido da senha de teste.

### 10.15. C-327-02 | CWE-327 | A04 | Cifra de dado sensível em modo inadequado

**Módulo:** users.
**Rota V:** `POST /users/document/store`
**Rota S:** `POST /users/document/save`
**Comportamento:** armazena um número de documento cifrado.
**Implementação V:** `createCipheriv` com `aes-128-ecb` e chave derivada de string fixa.
**Implementação S:** `aes-256-gcm` com chave de ambiente, vetor de inicialização aleatório por operação e armazenamento da tag de autenticação.
**Prova:** dois documentos idênticos produzem o mesmo texto cifrado na rota V, o que não ocorre na rota S.

### 10.16. C-916-01 | CWE-916 | A04 | Derivação de senha com esforço computacional insuficiente

**Módulo:** auth.
**Rota V:** `POST /auth/password/rotate`
**Rota S:** `POST /auth/password/change`
**Comportamento:** troca a senha do usuário autenticado.
**Implementação V:** `pbkdf2Sync` com mil iterações e digest `sha1`.
**Implementação S:** `scrypt` com parâmetros de custo adequados e sal por usuário.
**Prova:** inspeção dos parâmetros registrados no registro de credencial.

### 10.17. C-338-01 | CWE-338 | A04 | Token de recuperação com gerador não criptográfico

**Módulo:** auth.
**Rota V:** `POST /auth/recovery/request`
**Rota S:** `POST /auth/reset/request`
**Comportamento:** gera token de redefinição de senha e o associa ao usuário.
**Implementação V:** `Math.random().toString(36)` repetido até compor o comprimento desejado.
**Implementação S:** `crypto.randomBytes(32)` em hexadecimal.
**Prova:** com `Math.random` substituído por sequência determinística no teste, o token da rota V se torna previsível.

### 10.18. C-338-02 | CWE-338 | A04 | Código de rastreio previsível

**Módulo:** orders.
**Rota V:** `POST /orders/:id/tracking/generate`
**Rota S:** `POST /orders/:id/tracking/issue`
**Comportamento:** gera e persiste o código de rastreio do pedido.
**Implementação V:** concatenação de `Date.now()` com `Math.random()`.
**Implementação S:** `crypto.randomUUID`.
**Prova:** dois códigos gerados na mesma janela de tempo compartilham prefixo na rota V.

### 10.19. C-284-01 | CWE-284 | A01 | Rota administrativa sem verificação de papel

**Módulo:** users.
**Rota V:** `GET /admin/users`
**Rota S:** `GET /admin/accounts`
**Comportamento:** lista todos os usuários com id, email e role.
**Implementação V:** exige autenticação, mas não verifica se o papel é `admin`.
**Implementação S:** verificação de papel em `preHandler`, respondendo 403 quando o papel não for `admin`.
**Prova:** usuário `customer` autenticado obtém a lista completa na rota V.

### 10.20. C-639-01 | CWE-639 | A01 | Referência direta a objeto sem checagem de propriedade

**Módulo:** orders.
**Rota V:** `GET /orders/:id`
**Rota S:** `GET /orders/:id/details`
**Comportamento:** devolve os dados de um pedido.
**Implementação V:** busca pelo id sem confrontar o `userId` do pedido com o do usuário autenticado.
**Implementação S:** busca condicionada ao `userId` do autenticado, respondendo 404 quando não houver correspondência.
**Prova:** usuário A acessa pedido de usuário B na rota V.

### 10.21. C-918-01 | CWE-918 | A06 | Requisição forjada do lado servidor em importação de catálogo

**Módulo:** integrations.
**Rota V:** `POST /integrations/feed/fetch`
**Rota S:** `POST /integrations/feed/import`
**Comportamento:** busca um documento em uma URL informada e devolve um resumo do conteúdo.
**Implementação V:** `fetch` direto sobre a URL recebida.
**Implementação S:** validação de protocolo restrito a https, verificação do host contra lista permitida definida em constantes, recusa de redirecionamento e recusa de endereços de laço local e de faixas privadas.
**Prova:** URL apontando para `http://127.0.0.1:PORT/system/health` é alcançada na rota V.

### 10.22. C-918-02 | CWE-918 | A06 | Encaminhamento de imagem por procuração

**Módulo:** files.
**Rota V:** `GET /images/proxy?src=`
**Rota S:** `GET /images/render?src=`
**Comportamento:** busca uma imagem remota e a devolve.
**Implementação V:** repasse direto do parâmetro para o cliente HTTP.
**Implementação S:** mesma lista permitida e mesmas verificações do caso anterior.
**Prova:** equivalente ao 10.21.

### 10.23. C-601-01 | CWE-601 | A01 | Redirecionamento aberto após autenticação

**Módulo:** auth.
**Rota V:** `GET /auth/callback?next=`
**Rota S:** `GET /auth/return?next=`
**Comportamento:** conclui o fluxo de entrada e redireciona o usuário.
**Implementação V:** `reply.redirect(next)` sem validação.
**Implementação S:** aceitar apenas caminhos relativos iniciados por barra simples, rejeitando barra dupla, esquema explícito e caracteres de controle, com destino padrão em caso de recusa.
**Prova:** `next=https://exemplo.invalido/` produz redirecionamento externo na rota V.

### 10.24. C-532-01 | CWE-532 | A09 | Registro de credencial em log de autenticação

**Módulo:** auth.
**Rota V:** `POST /auth/login`
**Rota S:** `POST /auth/signin`
**Comportamento:** autentica e devolve token.
**Implementação V:** registrar o corpo completo da requisição no log em nível de informação.
**Implementação S:** registrar apenas identificador do usuário e resultado, com redação explícita dos campos sensíveis.
**Prova:** a senha de teste aparece no log capturado durante a chamada à rota V.

### 10.25. C-532-02 | CWE-532 | A09 | Registro de dado de pagamento

**Módulo:** orders.
**Rota V:** `POST /orders/:id/payment`
**Rota S:** `POST /orders/:id/settle`
**Comportamento:** registra o pagamento de um pedido a partir de dados de cartão simulados.
**Implementação V:** log do objeto de pagamento completo.
**Implementação S:** log apenas dos quatro últimos dígitos e do resultado.
**Prova:** número completo aparece no log na rota V.

### 10.26. C-434-01 | CWE-434 | A06 | Upload sem restrição de tipo

**Módulo:** files.
**Rota V:** `POST /files/upload`
**Rota S:** `POST /files/attach`
**Comportamento:** recebe arquivo por multipart e o grava em `storage/uploads`.
**Implementação V:** gravar usando o nome de arquivo enviado pelo cliente, sem restrição de extensão nem de tamanho.
**Implementação S:** gerar nome próprio com `randomUUID`, restringir extensão a uma lista permitida, verificar os primeiros bytes do conteúdo contra a assinatura esperada e limitar o tamanho.
**Prova:** envio de arquivo com extensão executável é aceito na rota V e recusado na rota S.

### 10.27. C-209-01 | CWE-209 | A10 | Exposição de detalhes internos em erro

**Módulo:** system, via manipulador de erro dedicado.
**Rota V:** `GET /system/report?id=`
**Rota S:** `GET /system/status?id=`
**Comportamento:** consulta um registro e falha quando o identificador não existe.
**Implementação V:** capturar a exceção e devolver ao cliente a mensagem e a pilha completa.
**Implementação S:** devolver mensagem genérica com identificador de correlação, registrando o detalhe apenas no log do servidor.
**Prova:** a resposta da rota V contém caminhos de arquivo do servidor.

### 10.28. C-1333-01 | CWE-1333 | A10 | Expressão regular sujeita a retrocesso catastrófico

**Módulo:** users.
**Rota V:** `POST /users/profile/validate`
**Rota S:** `POST /users/profile/check`
**Comportamento:** valida o campo de nome comercial informado.
**Implementação V:** expressão regular com quantificador aninhado aplicada diretamente à entrada, sem limite de comprimento.
**Implementação S:** expressão regular linear equivalente, com limite de comprimento aplicado antes da avaliação.
**Prova:** entrada de composição adversa eleva o tempo de resposta da rota V acima de um limiar, enquanto a rota S responde dentro do limite. O teste deve usar limiar generoso para não ficar instável em máquinas lentas.

### 10.29. C-1104-01 | CWE-1104 | A03 | Uso de componente de terceiros sem controle de versão

**Módulo:** integrations.
**Local V:** dependência declarada no package.json com faixa aberta e importada por um módulo que processa entrada externa.
**Local S:** dependência equivalente declarada com versão exata e integridade fixada pelo arquivo de trava.
**Prova:** inspeção do manifesto de dependências.
**Observação:** este caso não é detectável por análise estática de código-fonte na maioria das ferramentas, e essa é justamente a razão de sua inclusão. Ele mede o limite do escopo do SAST e cria um ponto de comparação interessante com o modelo de linguagem, que tende a comentar o manifesto quando ele lhe é apresentado. Registrar essa expectativa antes da coleta, e não depois.

### 10.30. C-306-01 | CWE-306 | A07 | Função crítica sem exigência de autenticação

**Módulo:** system.
**Rota V:** `POST /system/maintenance/purge`
**Rota S:** `POST /system/maintenance/cleanup`
**Comportamento:** remove pedidos cancelados com mais de noventa dias.
**Implementação V:** rota registrada sem o gancho de autenticação.
**Implementação S:** rota com autenticação e verificação de papel administrativo.
**Prova:** chamada sem token é aceita na rota V.

**Contagem final:** trinta pares numerados nesta seção, portanto trinta casos vulneráveis e trinta casos seguros, totalizando sessenta casos. O campo `totals` do gabarito deve refletir esses números. Caso algum par se mostre inviável durante a implementação, ele deve ser removido em par, nunca apenas o membro vulnerável, e a remoção precisa ser registrada em `docs/metodologia.md`.

---

## 11. Infraestrutura da aplicação

**11.1. Servidor.** `src/server.ts` sobe o Fastify na porta definida por variável de ambiente com padrão 3000, registra os plugins e as rotas, e executa a seed antes de aceitar conexões.

**11.2. Autenticação.** Plugin `plugins/auth.ts` expõe um gancho `authenticate` que lê o cabeçalho `authorization` no formato `Bearer <token>`, valida a assinatura e injeta `request.user` com id, email e role. Rotas que exigem autenticação declaram o gancho explicitamente em `preHandler`. Não aplicar autenticação global, porque o caso 10.30 depende de uma rota sem o gancho.

**11.3. Log.** Plugin `plugins/logger.ts` configura o logger do Fastify em nível de informação, escrevendo em `stdout` e, em ambiente de teste, também em um buffer acessível, para que os testes dos casos 10.24 e 10.25 possam inspecionar o conteúdo registrado. A configuração global não deve conter redação automática de campos, porque isso mascararia os casos de log.

**11.4. Tratamento de erro.** `plugins/error-handler.ts` define o comportamento padrão como resposta genérica com código de correlação. O caso 10.27 implementa seu próprio tratamento local, que sobrepõe o padrão apenas naquela rota.

**11.5. Configuração.** `config/env.ts` centraliza a leitura de variáveis de ambiente. Um arquivo `.env.example` deve listar todas as variáveis usadas, sem valores reais.

**11.6. Armazenamento.** Diretórios `storage/uploads` e `storage/reports` criados na inicialização, com dois arquivos de exemplo cada, gerados pela seed.

---

## 12. Testes de comprovação

Diretório `tests/proof`. Um arquivo por par, nomeado pelo identificador do par, contendo dois testes.

O primeiro teste demonstra que a rota vulnerável cede ao estímulo descrito no campo Prova do catálogo. O segundo demonstra que a rota segura resiste ao mesmo estímulo. Ambos usam a aplicação real, subida em porta efêmera, com banco recriado.

Esses testes têm três funções. Primeira, provar que as falhas são reais e não apenas padrões sintáticos suspeitos, o que é a diferença entre um benchmark honesto e uma coleção de armadilhas. Segunda, impedir que uma refatoração futura corrija sem querer um caso vulnerável. Terceira, servir de evidência citável no artigo.

Diretório `tests/smoke` contém um teste que chama todas as rotas registradas e verifica que nenhuma responde 404 ou 500 inesperado, garantindo o princípio 3.1.

Os testes não fazem parte do corpus e não podem ser copiados para `corpus/`, porque contêm exatamente o vocabulário proibido pela regra 7.1.

---

## 13. Execução das ferramentas

Scripts em `tools/` ou em `scripts/`, à escolha do implementador, com saída padronizada em `results/raw/<ferramenta>/<data-hora>.json`. Cada script registra em um arquivo de metadados a versão exata da ferramenta, a data e o comando executado.

**13.1. Semgrep.** Executar sobre `corpus/` com o conjunto de regras públicas para JavaScript e TypeScript, saída em JSON.

**13.2. CodeQL.** Criar banco de dados sobre o projeto e executar o pacote de consultas de segurança da linguagem, saída em SARIF.

**13.3. njsscan.** Executar sobre `corpus/`, saída em JSON.

**13.4. ESLint com plugin de segurança.** Configuração dedicada apontando apenas para `corpus/`, sem herdar regras de estilo do projeto, saída em JSON.

Nenhuma ferramenta recebe ajuste de regra específico para este projeto. Configuração padrão documentada, conforme a delimitação do estudo.

---

## 14. Normalização e pontuação

**14.1. Esquema normalizado.** Cada achado vira um objeto com: `tool`, `runId`, `file` relativo à raiz do corpus, `line`, `ruleId`, `cwe` quando disponível, `severity` e `message`.

**14.2. Mapeamento de identificadores.** `tools/cwe-aliases.json` traduz identificadores de regra e categorias textuais de cada ferramenta para códigos CWE. Esse arquivo é parte do método e precisa ser publicado junto com os resultados, porque decisões de mapeamento afetam a contagem.

**14.3. Regra de correspondência.** Um achado conta como verdadeiro positivo quando o arquivo coincide, a linha está dentro de cinco linhas para mais ou para menos em relação ao `sinkLine` de um caso com `condition` igual a `vulnerable`, e o CWE mapeado pertence ao conjunto de equivalência daquele caso.

Um achado dentro do intervalo de um caso com `condition` igual a `safe`, cujo CWE mapeado pertença ao conjunto de equivalência do par, conta como falso positivo de par.

Um achado fora de qualquer intervalo declarado conta como achado fora de escopo, reportado à parte e não somado à precisão principal. Essa separação evita punir a ferramenta por encontrar algo legítimo que o gabarito não previu, e ao mesmo tempo evita premiar ruído.

Um caso vulnerável sem nenhum achado correspondente conta como falso negativo.

**14.4. Indicadores calculados.** Verdadeiros positivos, falsos positivos, falsos negativos, precisão, revocação, medida F1, taxa por CWE, taxa de verdadeiros positivos menos taxa de falsos positivos, tempo de execução, sobreposição entre ferramentas por índice de Jaccard e, para o modelo de linguagem, taxa de concordância entre as três execuções.

**14.5. Saída.** `results/reports/summary.json` e `results/reports/summary.md`, este último com as tabelas prontas para o artigo.

---

## 15. Protocolo do modelo de linguagem

**15.1. Unidade de análise.** Um arquivo por requisição. O modelo nunca recebe o projeto inteiro, nunca recebe o gabarito, nunca recebe a contagem de falhas e nunca recebe este documento.

**15.2. Prompt fixo.** Armazenado em `tools/llm/prompt.md` e idêntico para todas as requisições, variando apenas o conteúdo do arquivo e seu caminho. O prompt instrui o modelo a atuar como analisador de segurança, a listar apenas falhas presentes no trecho fornecido, a informar arquivo, linha, CWE, severidade e justificativa curta, e a responder exclusivamente em JSON conforme esquema declarado. O prompt não menciona quantas falhas existem nem quais categorias procurar.

**15.3. Repetição.** Três execuções independentes por arquivo, em sessões sem memória compartilhada, identificadas por `runId` igual a 1, 2 e 3.

**15.4. Registro.** Resposta bruta salva integralmente, inclusive quando malformada. Respostas malformadas são contabilizadas e relatadas, e não descartadas em silêncio.

**15.5. Parâmetros.** Registrar modelo, versão, temperatura e data. Usar a mesma configuração nas três execuções.

---

## 16. Arquivos de repositório

**16.1. README.md.** Abre com um aviso destacado, em português e em inglês, informando que o repositório contém código deliberadamente inseguro, criado como instrumento de pesquisa acadêmica, que não deve ser executado em rede acessível, que nenhum trecho serve como referência de implementação e que o projeto não deve ser usado em produção sob nenhuma circunstância. Em seguida, propósito do estudo, instruções de instalação, comandos, estrutura do repositório e como reproduzir a medição.

**16.2. SECURITY.md.** Declara que vulnerabilidades encontradas no projeto são intencionais e não devem ser reportadas como falhas, e indica canal para relatar erro no gabarito, que é o único tipo de problema relevante aqui.

**16.3. LICENSE.** MIT.

**16.4. CITATION.cff.** Metadados de citação, preparados para receber o DOI emitido após o depósito da versão no Zenodo.

**16.5. docs/metodologia.md.** Registro de decisões metodológicas, incluindo remoções de casos, ajustes na regra de correspondência e qualquer desvio deste documento, sempre com data.

**16.6. docs/reproducao.md.** Passo a passo exato para reproduzir a medição a partir do zero, incluindo versões.

---

## 17. Integração contínua

`.github/workflows/scan.yml` executa, a cada envio para o ramo principal: instalação de dependências, build do corpus com validação, testes de comprovação, testes de fumaça e, quando as ferramentas estiverem disponíveis no ambiente, a varredura completa com publicação dos resultados como artefato do fluxo.

A falha de validação do build deve quebrar o fluxo. A presença de vulnerabilidades detectadas pelas ferramentas não deve quebrar o fluxo, pelo motivo óbvio.

---

## 18. Scripts do package.json

`dev` sobe o servidor em modo de desenvolvimento.
`build` compila o TypeScript.
`build:corpus` gera `corpus/` e `ground-truth.json` com validação.
`test` executa todos os testes.
`test:proof` executa apenas os testes de comprovação.
`scan:semgrep`, `scan:codeql`, `scan:njsscan`, `scan:eslint` executam cada ferramenta.
`scan:llm` executa o protocolo do modelo de linguagem.
`normalize` converte os relatórios brutos.
`score` calcula os indicadores e gera os relatórios finais.
`verify` encadeia `build:corpus`, `test` e a validação do gabarito, servindo de porta única de qualidade.

---

## 19. Critérios de aceite

O projeto está pronto quando todos os itens abaixo forem verdadeiros.

O comando `verify` conclui sem erro.

`ground-truth.json` contém sessenta casos, trinta vulneráveis e trinta seguros, todos pareados.

Cada par possui teste de comprovação com os dois cenários passando.

Nenhuma palavra da lista da regra 7.1 aparece em qualquer arquivo dentro de `corpus/`.

Nenhuma diretiva de supressão de análise aparece em qualquer arquivo dentro de `corpus/`.

Todas as rotas listadas na seção 10 respondem no teste de fumaça.

Rodar `build:corpus` duas vezes seguidas não altera nenhum byte dos arquivos gerados.

Um leitor externo consegue, lendo apenas o corpus, sem o gabarito, classificar os casos apenas por análise técnica, sem qualquer pista de nomenclatura.

---

## 20. Restrições explícitas ao gerador de código

Não corrigir vulnerabilidades descritas na seção 10.

Não adicionar controles globais de segurança, como cabeçalhos de proteção aplicados a todas as respostas, validação global de entrada ou sanitização automática, porque anulariam os casos.

Não renomear identificadores de caso.

Não substituir bibliotecas indicadas como obrigatórias.

Não gerar comentários explicativos sobre segurança dentro de `src/`, exceto os marcadores especificados na seção 8.

Não criar rotas, entidades ou funcionalidades além das descritas.

Não escrever `ground-truth.json` manualmente.

Não incluir dados pessoais reais, credenciais reais ou endereços de serviços reais em lugar algum. Domínios de exemplo devem usar `exemplo.invalido` ou reservados equivalentes.
