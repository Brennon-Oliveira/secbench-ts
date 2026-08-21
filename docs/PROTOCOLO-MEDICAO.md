# Protocolo de medição

**Projeto:** SecBench-TS **Documento:** protocolo pré-registrado de medição **Versão:** 1.1 **Registro original:** 16/08/2026 **Última alteração:** 16/08/2026 (ver seção 11) **Estado na data do registro:** artefato em construção, nenhuma varredura executada, nenhum resultado observado

Este documento faz parte do repositório e deve ser versionado. Sua data de commit é o que sustenta a validade do pré-registro. Ele é deliberadamente excluído do ambiente de medição, conforme a seção 5.

---

## 1. Por que este documento existe e por que a data importa

Toda regra que decide o que conta como acerto tem parâmetros ajustáveis. A janela de tolerância de linha pode ser de três, de cinco ou de dez. A equivalência entre categorias pode ser estrita ou generosa. Um achado fora do gabarito pode ser punido ou ignorado.

Se essas escolhas forem feitas depois de ver os resultados, quem conduz o estudo sempre encontra a combinação que produz o número mais interessante, e quase nunca percebe que fez isso. O nome disso na literatura de metodologia é grau de liberdade do pesquisador, e é uma das principais fontes de resultado irreprodutível.

Registrar as regras antes da coleta elimina o problema pela raiz. Alteração posterior continua permitida, desde que registrada na seção 11 com data e justificativa, e desde que os resultados sejam reportados também sob a regra original. Alteração silenciosa de critério invalida o trabalho inteiro.

---

## 2. Objeto da medição

O corpus gerado a partir do código-fonte do artefato, contendo sessenta casos, sendo trinta com vulnerabilidade implantada e trinta protegidos, distribuídos em vinte categorias CWE, conforme o catálogo da especificação técnica.

O registro de classificação é o arquivo `ground-truth.json`, gerado pelo pipeline de build, contendo para cada caso o arquivo, o intervalo de linhas, a linha de referência do sink, o CWE e a categoria OWASP.

A identidade do corpus medido é dada pelo seu resumo criptográfico agregado, calculado sobre o conteúdo de todos os arquivos do diretório `corpus` em ordem determinística. Esse valor é registrado no atestado descrito na seção 5.4 e permite comprovar, depois da coleta, que o material analisado é exatamente o mesmo que consta no repositório.

---

## 3. Ferramentas avaliadas e condições de execução

Cada ferramenta é executada uma única vez sobre o corpus, em configuração padrão documentada, sem ajuste de regra específico para este projeto.

Semgrep, com o conjunto de regras públicas para JavaScript e TypeScript.

CodeQL, com o pacote de consultas de segurança da linguagem.

njsscan, em configuração padrão.

ESLint com plugin de segurança, em configuração dedicada que não herda regras de estilo.

Modelo de linguagem, conforme o protocolo da seção 6.

Para cada execução são registrados nome da ferramenta, versão exata, comando completo, data e hora, tempo total decorrido e código de saída. Ferramenta que não puder ser instalada é declarada ausente, com o motivo, e a lacuna é reportada no trabalho. Substituição silenciosa de ferramenta é proibida.

---

## 4. Regra de correspondência

Esta é a regra central e ela está fixada.

**4.1. Verdadeiro positivo.** Um achado conta como verdadeiro positivo quando as três condições abaixo forem simultaneamente satisfeitas.

O caminho do arquivo do achado coincide com o caminho do arquivo de um caso cuja condição seja vulnerável, após normalização de separadores e de raiz relativa.

A linha do achado está no intervalo fechado entre a linha de referência do caso menos cinco e a linha de referência do caso mais cinco.

O CWE associado ao achado, após o mapeamento da seção 7, pertence ao conjunto de equivalência do CWE declarado para aquele caso.

Cada caso vulnerável pode gerar no máximo um verdadeiro positivo por ferramenta. Achados múltiplos que satisfaçam as condições para o mesmo caso são contados uma única vez, e o excedente é registrado como achado redundante, reportado à parte.

**4.2. Falso positivo de par.** Um achado dentro do intervalo de linhas de um caso cuja condição seja protegida, cujo CWE mapeado pertença ao conjunto de equivalência do par, conta como falso positivo. Esta é a métrica que o desenho pareado existe para produzir.

**4.3. Achado fora de escopo.** Um achado que não corresponda a nenhum caso declarado é registrado em categoria própria e não entra no cálculo da precisão principal.

A justificativa é a seguinte. O corpus contém código de infraestrutura que não faz parte do desenho experimental, e uma ferramenta pode legitimamente apontar ali algo que o gabarito não previu. Contar isso como erro puniria a ferramenta por acertar. Ignorar por completo, porém, permitiria que uma ferramenta muito ruidosa parecesse limpa. A solução adotada é reportar essa categoria separadamente, com contagem absoluta e por ferramenta, e discuti-la na análise sem misturá-la à precisão principal.

**4.4. Falso negativo.** Caso vulnerável para o qual nenhum achado satisfez a condição de verdadeiro positivo.

**4.5. Achado sem linha.** Achado que não informe linha, ou que informe linha zero, é atribuído ao arquivo inteiro e não pode gerar verdadeiro positivo. É registrado em categoria própria e discutido qualitativamente.

**4.6. Achado sem CWE.** Quando a ferramenta não informar CWE, o mapeamento da seção 7 é aplicado sobre o identificador da regra. Se ainda assim não houver correspondência, o achado é classificado como não mapeado e não gera verdadeiro positivo. A contagem de não mapeados por ferramenta é reportada, porque uma taxa alta indica limitação do mapeamento, e não da ferramenta.

---

## 5. Ambiente de medição

Esta seção é a que separa uma medição de uma consulta guiada.

### 5.1. Princípio

O modelo de linguagem avaliado processa o texto integral do que recebe. Qualquer material do repositório que descreva o experimento, classifique os casos ou explique o método é informação que, se estiver ao alcance, contamina o resultado. As ferramentas determinísticas não sofrem desse problema, mas devem analisar exatamente o mesmo material, sob pena de a comparação deixar de ser pareada.

Disso decorre a regra: todas as varreduras, tanto as determinísticas quanto a do modelo, ocorrem em um ambiente de medição que contém apenas o corpus e os executores, e nada mais.

### 5.2. O que o ambiente de medição contém

Apenas o diretório do corpus, o prompt fixo, o executor do protocolo do modelo, os executores das varreduras determinísticas, a configuração dedicada do analisador de estilo, o manifesto de dependências reduzido e o arquivo de trava correspondente.

O manifesto de dependências preserva integralmente as dependências declaradas, porque a fixação de versão é objeto de um dos casos, e tem removidos o nome do projeto, a descrição e todos os comandos que referenciem material excluído.

### 5.3. O que fica de fora, sem exceção

O código-fonte marcado, que contém os marcadores de caso. O registro de classificação. O catálogo de casos. A especificação técnica e o documento de harness. O registro de desvios e o roteiro de reprodução. Os testes de comprovação, que descrevem exatamente como cada falha é explorada. A configuração do agente de desenvolvimento, incluindo regras, skills, subagentes e ganchos. Os arquivos de apresentação do repositório, que declaram a natureza do projeto. O histórico de versionamento, que permitiria reconstruir tudo o que foi removido. As ferramentas de build, normalização e pontuação. Os diretórios de armazenamento e de resultados anteriores. Este próprio documento.

### 5.4. Procedimento

O ambiente é preparado pelo script `tools/prepare-measurement.ts`, a partir de um clone recém-obtido do repositório, com dependências reconstruídas a partir do arquivo de trava.

O script opera por lista de inclusão, e não de exclusão. A escolha é deliberada: qualquer arquivo novo que venha a ser adicionado ao repositório no futuro fica de fora do ambiente de medição por omissão, em vez de vazar por esquecimento.

No modo padrão, o script copia o material permitido para um diretório novo e não altera o clone de origem. No modo destrutivo, remove do próprio clone tudo o que não está na lista, incluindo o histórico de versionamento, exigindo confirmação explícita e a presença de um arquivo de marcação criado manualmente naquele clone. O modo padrão é o recomendado, porque não depende de o operador estar no diretório certo.

Antes de concluir, o script executa três verificações e falha se qualquer uma delas não passar. Confere que o corpus copiado tem resumo criptográfico idêntico ao de origem. Varre todos os arquivos do ambiente em busca de marcadores de caso, identificadores de caso, referências ao registro de classificação, ao catálogo, à especificação, ao harness e a este protocolo. Aplica ao corpus a mesma lista de vocabulário proibido usada pelo pipeline de build.

O script emite um atestado em formato JSON, gravado fora do ambiente de medição, contendo o momento da preparação, o commit de origem e se a árvore estava limpa, o resumo criptográfico de cada arquivo do corpus e o agregado, a lista completa do que foi incluído, a lista do que foi excluído na raiz, a versão do interpretador e o resultado da verificação de vazamento.

O atestado é o que permite, meses depois, provar que a medição rodou sobre um corpus específico, em um estado específico do repositório, sem material contaminante ao alcance. Ele deve ser preservado junto aos relatórios brutos e citado no trabalho.

### 5.5. Retorno dos resultados

Os relatórios brutos produzidos no ambiente de medição são copiados de volta para o repositório antes da normalização e da pontuação, que dependem do registro de classificação e por isso não podem ocorrer no ambiente de medição.

Ao copiar, confira que o resumo agregado do corpus do repositório coincide com o registrado no atestado. Divergência significa que o corpus mudou entre a preparação e o retorno, e a coleta precisa ser refeita.

---

## 6. Protocolo do modelo de linguagem

**6.1. Isolamento.** A execução ocorre no ambiente de medição descrito na seção 5, sem regras de agente carregadas, sem skills disponíveis e sem acesso ao restante do repositório. O modelo recebe apenas o caminho relativo e o conteúdo do arquivo analisado.

**6.2. Unidade de análise.** Um arquivo por requisição, sem contexto de outros arquivos.

**6.3. Repetição.** Três execuções independentes de cada arquivo, sem memória compartilhada, identificadas por 1, 2 e 3.

**6.4. Parâmetros registrados.** Modelo, versão, temperatura e demais parâmetros de amostragem, além de data e hora. Configuração idêntica nas três execuções.

**6.5. Consolidação.** O resultado principal do modelo é calculado sobre a união dos achados das três execuções, critério declarado aqui e não alterável depois. Adicionalmente, e apenas para fins de discussão, são reportados o resultado por execução individual e o resultado sob critério de maioria, em que o achado precisa aparecer em ao menos duas das três execuções.

**6.6. Estabilidade.** Definida como a proporção de achados presentes nas três execuções em relação ao total de achados distintos observados. Reportada globalmente e por categoria.

**6.7. Resposta malformada.** Registrada integralmente, contabilizada e reportada. Nunca descartada em silêncio. Não é permitido reexecutar uma requisição por insatisfação com o resultado. Reexecução só é admitida em caso de falha de transporte, e precisa ser registrada.

**6.8. Prompt.** Texto fixo, reproduzido na seção 9, idêntico em todas as requisições, variando apenas o caminho e o conteúdo do arquivo.

---

## 7. Mapeamento de identificadores para CWE

O arquivo `tools/cwe-aliases.json` traduz identificadores de regra e rótulos textuais de cada ferramenta para códigos CWE. Ele é parte do método e será publicado junto aos resultados.

**7.1. Ordem de resolução.** Primeiro, o CWE informado explicitamente pela ferramenta. Segundo, o mapeamento por identificador exato de regra. Terceiro, o mapeamento por rótulo textual normalizado. Não havendo correspondência, o achado é marcado como não mapeado.

**7.2. Construção da tabela.** Os identificadores de regra devem ser extraídos da saída real de uma execução de ensaio, e não presumidos. A execução de ensaio ocorre sobre um corpus descartável, nunca sobre o corpus definitivo, para não antecipar observação de resultado.

**7.3. Conjuntos de equivalência.** Alguns CWE são vizinhos e ferramentas diferentes escolhem códigos diferentes para a mesma falha. Os conjuntos abaixo são declarados equivalentes para efeito de correspondência.

Injeção de SQL: CWE-89 e CWE-943.

Injeção de comando: CWE-78, CWE-77 e CWE-88.

Injeção de código: CWE-94 e CWE-95.

Cross-site scripting: CWE-79 e CWE-80.

Travessia de caminho: CWE-22 e CWE-23.

Desserialização: CWE-502 e CWE-915.

Credencial embutida: CWE-798, CWE-259 e CWE-321.

Criptografia inadequada: CWE-327, CWE-326 e CWE-916.

Derivação de senha: CWE-916, CWE-327 e CWE-326.

Aleatoriedade: CWE-338 e CWE-330.

Controle de acesso: CWE-284, CWE-285, CWE-639 e CWE-862.

Referência direta a objeto: CWE-639, CWE-284, CWE-285 e CWE-862.

Ausência de autenticação: CWE-306 e CWE-287.

Requisição forjada: CWE-918.

Redirecionamento aberto: CWE-601.

Exposição em log: CWE-532 e CWE-200.

Upload sem restrição: CWE-434.

Exposição em erro: CWE-209, CWE-200 e CWE-497.

Expressão regular ineficiente: CWE-1333 e CWE-400.

Componente de terceiros: CWE-1104 e CWE-1395.

**7.4. Regra de ampliação.** Nenhum conjunto pode ser ampliado depois do início da coleta sem registro na seção 11 e sem reapresentação dos resultados sob os conjuntos originais.

---

## 8. Indicadores calculados

Verdadeiros positivos, falsos positivos de par, falsos negativos, achados fora de escopo, achados redundantes, achados sem localização e achados não mapeados, todos por ferramenta.

Precisão, definida como verdadeiros positivos divididos pela soma de verdadeiros positivos e falsos positivos de par.

Revocação, definida como verdadeiros positivos divididos pelo total de casos vulneráveis.

Medida F1, média harmônica de precisão e revocação.

Taxa de verdadeiros positivos menos taxa de falsos positivos, correspondente ao índice de Youden usado pelo OWASP Benchmark, permitindo comparação com a literatura.

Cobertura por categoria CWE, em proporção de casos detectados sobre casos existentes na categoria.

Tempo de execução e observação qualitativa sobre esforço de instalação e configuração.

Sobreposição entre ferramentas, medida por índice de Jaccard sobre o conjunto de casos vulneráveis detectados, e contribuição exclusiva de cada ferramenta, definida como casos que apenas ela detectou.

Cobertura da união de todas as ferramentas determinísticas, e cobertura da união entre ferramentas determinísticas e modelo de linguagem, permitindo avaliar complementaridade.

Estabilidade do modelo de linguagem, conforme a definição 6.6.

Casos declarados fora do cálculo principal, se houver, são reportados separadamente com a justificativa de exclusão.

---

## 9. Prompt fixo da análise por modelo de linguagem

O texto abaixo é o prompt oficial e corresponde ao conteúdo de `tools/llm/prompt.md`. Ele não pode ser alterado durante a coleta. Qualquer alteração exige nova coleta completa.

```
Você é um analisador de segurança de código-fonte.

Analise o arquivo fornecido e identifique vulnerabilidades de segurança presentes nele.

Regras:
1. Considere apenas o conteúdo do arquivo fornecido. Não presuma comportamento de arquivos não fornecidos.
2. Relate apenas problemas de segurança. Não relate estilo, desempenho, legibilidade ou organização.
3. Para cada problema, informe a linha exata em que ele ocorre no arquivo fornecido.
4. Não relate o mesmo problema mais de uma vez.
5. Se não houver problema de segurança no arquivo, retorne uma lista vazia.

Responda exclusivamente com um objeto JSON válido, sem texto antes ou depois, no formato:

{
  "findings": [
    {
      "line": <número inteiro da linha>,
      "cwe": "<identificador CWE no formato CWE-000>",
      "severity": "<low | medium | high | critical>",
      "title": "<título curto do problema>",
      "rationale": "<justificativa em no máximo duas frases>"
    }
  ]
}

Caminho do arquivo: {{CAMINHO}}

Conteúdo do arquivo:

{{CONTEUDO}}

```

Observações sobre o desenho do prompt, registradas para justificar as escolhas.

O prompt não informa quantas falhas existem, porque informar transformaria detecção em busca dirigida.

O prompt não lista categorias esperadas, porque listar induziria o modelo a procurar exatamente aquilo que o gabarito contém, inflando a cobertura artificialmente.

O prompt exige linha exata, porque sem localização não há como aplicar a regra de correspondência, e uma ferramenta que aponta o arquivo inteiro não é comparável a uma que aponta a linha.

O prompt instrui a retornar lista vazia quando não houver problema, porque sem essa instrução o modelo tende a produzir algum achado para parecer útil, o que enviesaria os casos protegidos.

A instrução de não relatar estilo existe porque, sem ela, boa parte da saída viria em forma de sugestão de qualidade, poluindo a normalização.

---

## 10. Regras de integridade dos dados

Nenhum número é digitado à mão em lugar algum. Todo indicador é produzido pelo script de pontuação a partir dos relatórios brutos.

Relatórios brutos são imutáveis após a coleta e ficam versionados, junto ao atestado do ambiente de medição.

Reexecução de varredura só é admitida em caso de falha técnica, e o registro da execução falha permanece no repositório.

Casos removidos ou alterados no artefato após o início da coleta invalidam a coleta e exigem nova rodada completa, com registro do motivo.

Se uma ferramenta apresentar comportamento não determinístico entre execuções sobre o mesmo corpus, isso é um achado e deve ser reportado, e não contornado.

Amostra de verificação manual: ao menos vinte por cento das classificações produzidas pelo script serão conferidas manualmente, com registro de divergências. Divergência acima de cinco por cento exige revisão da implementação da regra antes de qualquer análise.

---

## 11. Registro de alterações

**16/08/2026, versão 1.1.** Acrescentada a seção 5, que define o ambiente de medição, o procedimento de preparação por lista de inclusão, o atestado criptográfico e o retorno dos resultados. Acrescentado à seção 2 o conceito de resumo agregado do corpus como identidade da medição. Acrescentados à seção 7 os conjuntos de derivação de senha e de referência direta a objeto, que estavam implícitos, e a regra 7.2 sobre construção da tabela a partir de execução de ensaio. Acrescentado à seção 8 o tratamento de casos excluídos do cálculo principal. Corrigida na seção 2 a contagem de categorias CWE, de dezessete para vinte, que era erro de contagem do registro original.

Justificativa: nenhuma coleta havia ocorrido nesta data. As alterações não afetam critério de classificação já aplicado a dado observado, uma vez que não existe dado observado. A regra de correspondência da seção 4, que é o critério sensível, permanece idêntica ao registro original.

**Formato obrigatório para alterações futuras:** data, item alterado, redação anterior, redação nova, justificativa, e indicação de se a coleta anterior permanece válida ou precisa ser refeita.

---

## 12. Declaração

As regras deste documento foram fixadas antes da execução de qualquer varredura sobre o corpus e antes da observação de qualquer resultado. Os resultados do trabalho serão reportados sob estas regras. Qualquer critério adicional que venha a ser considerado durante a análise será apresentado como análise exploratória complementar, claramente separada do resultado principal.