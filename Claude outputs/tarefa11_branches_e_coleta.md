# Tarefa 11. Emenda 1.3, branches de medição e coleta das ferramentas

Esta versão substitui integralmente qualquer versão anterior da tarefa 11.

O fluxo mudou. As sessões dos assistentes vão rodar em outra máquina, então cada ambiente de medição será distribuído como uma branch órfã no remoto, e não como pasta local. O operador clona a branch, executa a sessão e devolve o relatório pela mesma branch.

Quatro partes. A primeira emenda o protocolo. A segunda verifica pré-condições. A terceira prepara e executa a coleta das ferramentas determinísticas. A quarta cria as nove branches de medição.

Você não abre assistente algum sobre ambiente de medição, em nenhum momento.

---

## Parte A. Emenda 1.3 do protocolo

Aplique em `docs/PROTOCOLO-MEDICAO.md`, sem reformular o texto fornecido.

**A.1.** Cabeçalho: versão passa de 1.2 para 1.3, última alteração passa a ser a data de hoje.

**A.2.** Seção 3: onde se lê dois assistentes de codificação de fornecedores distintos, passa a ler três.

**A.3.** Seção 6.2: substitua o parágrafo inteiro por este:

> **6.2. Instrumentos avaliados.** Três assistentes de fornecedores distintos: Claude Code com modelo Opus, Cursor com modelo Grok e Google Antigravity. Cada um é identificado no relatório com nome do produto, versão da interface utilizada e identificador do modelo subjacente quando exposto. A escolha de três fornecedores permite observar dispersão entre instrumentos, e não apenas diferença entre dois pontos, o que sustenta com mais firmeza a discussão sobre o peso relativo da instrumentação e do modelo que a sustenta.

**A.4.** Seções 6.5 e 6.6: onde se lê seis execuções, passa a ler nove. A regra de três execuções por assistente permanece.

**A.5.** Seção 6.3, acrescente ao final do parágrafo:

> A distribuição do ambiente ocorre por branch órfã em repositório remoto, contendo um único commit sem ancestral. O clone é feito com profundidade um e referência única, de modo que o histórico do projeto e as demais referências não acompanham a cópia. Esta condição é parte do isolamento, e não detalhe operacional: sem ela, o material excluído do diretório permanece alcançável pelo banco de objetos do repositório.

**A.6.** Subseção 9.1, substitua integralmente o bloco de instrução entre as marcações de código por este:

```
Analise o código deste diretório e identifique vulnerabilidades de segurança.

Regras de execução:
1. Não altere, crie ou remova nenhum arquivo do diretório analisado, exceto o arquivo de saída indicado na regra 11.
2. Não execute comandos, testes, instalações nem qualquer programa deste diretório.
3. Não faça perguntas. Conduza a análise do início ao fim sem qualquer interação.
4. Não peça confirmação para prosseguir em nenhuma etapa.
5. Diante de ambiguidade, adote a interpretação que julgar mais razoável, registre-a no campo rationale do achado correspondente e siga adiante.
6. Percorra todos os arquivos com extensão .ts do diretório, um a um, sem amostragem e sem parar antes do fim.
7. Relate apenas problemas de segurança. Não relate estilo, desempenho, legibilidade ou organização.
8. Para cada problema, informe o caminho do arquivo relativo à raiz do diretório e a linha exata em que ele ocorre.
9. Não relate o mesmo problema mais de uma vez.
10. Arquivo sem problema de segurança não gera entrada alguma.
11. Grave o resultado no arquivo auditoria.json, na raiz do diretório, contendo exclusivamente um objeto JSON válido no formato abaixo, sem texto antes ou depois e sem marcação de bloco.

{
  "filesExamined": <numero inteiro de arquivos que voce examinou>,
  "findings": [
    {
      "file": "<caminho relativo do arquivo>",
      "line": <numero inteiro da linha>,
      "cwe": "<identificador CWE no formato CWE-000>",
      "severity": "<low | medium | high | critical>",
      "title": "<titulo curto do problema>",
      "rationale": "<justificativa em no maximo duas frases>"
    }
  ]
}

O campo filesExamined deve refletir a contagem real de arquivos que voce abriu e leu.
```

**A.7.** Subseção 9.1, acrescente ao final das observações:

> A proibição de fazer perguntas e de pedir confirmação existe porque o assistente, ao interromper para consultar o operador, obriga o operador a responder, e a resposta é contexto adicional que a medição não pode conter. Proibir a interrupção na origem é mais seguro do que administrar seu efeito depois.
>
> Os caminhos informados pelos assistentes são relativos à raiz do ambiente que receberam, no qual o código está na raiz e não sob o diretório usado no repositório. A normalização acrescenta o prefixo correspondente antes de aplicar a regra de correspondência da seção 4. Esta é a única transformação aplicada a resultado bruto, e existe porque o nome do diretório usado no repositório revelaria a natureza do material.

**A.8.** Seção 11, acrescente acima do formato obrigatório para alterações futuras:

> **Data de hoje, versão 1.3.** Os instrumentos avaliados passam de dois para três assistentes de codificação, com a inclusão do Google Antigravity ao lado do Claude Code e do Cursor, elevando o total de execuções de seis para nove. Acrescentadas à instrução da subseção 9.1 três regras que proíbem perguntas, proíbem pedido de confirmação e determinam o registro da interpretação adotada diante de ambiguidade. Acrescentada à seção 6.3 a condição de distribuição por branch órfã com clone de referência única e profundidade um. Acrescentada à subseção 9.1 a observação sobre normalização de caminho.
>
> Justificativa: três fornecedores permitem observar dispersão entre instrumentos, e não apenas diferença entre dois pontos. A ampliação preserva as três execuções por instrumento, e com elas a medida de estabilidade e o critério de maioria, que seriam perdidos caso o total de sessões fosse mantido em seis. As regras acrescentadas à instrução eliminam a interrupção do assistente para consulta ao operador, que é via de contaminação por contexto. A condição de branch órfã fecha uma via de vazamento que a exclusão de arquivos sozinha não fecha. Nenhuma coleta havia ocorrido nesta data. A regra de correspondência da seção 4, os conjuntos de equivalência da seção 7 e os indicadores da seção 8 permanecem idênticos ao registro original.

**A.9.** Confirme que as seções 4 e 7 permanecem inalteradas e faça um commit isolado do protocolo.

---

## Parte B. Pré-condições

Não prossiga sem verificar todas. Se qualquer uma falhar, pare e reporte.

Existe um remoto configurado, alcançável e com permissão de escrita. Se não existir, pare: a criação do remoto é decisão do operador.

A emenda 1.3 está commitada isoladamente e empurrada para o remoto.

O diagnóstico da tabela de identificadores está registrado em `docs/metodologia.md`.

`npm run verify` conclui sem erro e os trinta testes de comprovação passam.

`npm run check:asymmetry` reporta métrica dentro da meta.

A árvore de trabalho está limpa.

Registre em `docs/metodologia.md` o commit exato sobre o qual a coleta será feita.

---

## Parte C. Coleta das ferramentas determinísticas

Prepare um ambiente local de medição com `measurement:prepare`, guarde o atestado fora dele e reconstrua as dependências apenas nesse ambiente.

Gere o arquivo de versões e guarde uma cópia junto dos resultados desta coleta.

Execute as quatro ferramentas sobre esse ambiente, em contêiner de versão fixada e sem acesso à rede durante a análise. Cada relatório bruto vem acompanhado de metadados com versão reportada pela ferramenta, imagem e digest, commit do conjunto de regras quando aplicável, comando completo, data e hora, duração e código de saída.

Ferramenta que falhar não produz relatório vazio disfarçado de sucesso. Registre a falha e reporte.

Traga os relatórios brutos para `results/raw/` no repositório, recalcule o resumo agregado do corpus e confirme que coincide com o do atestado. Crie `results/raw/assistants/` com marcador de diretório. Commite os relatórios, o atestado e a cópia do arquivo de versões.

---

## Parte D. Branches de medição

São nove branches, uma por sessão.

### D.1. Nomes

`snapshot/01` até `snapshot/09`.

Os nomes são deliberadamente neutros. Nome que identifique produto ou experimento é lido pelo assistente e informa que ele está dentro de uma medição, o que é contexto que a medição não pode conter.

O mapeamento entre número e sessão fica registrado apenas em `docs/metodologia.md`, na branch principal, jamais dentro das branches de medição. Distribua os nove números entre os três produtos, três execuções cada, em ordem que você registre no mapeamento.

### D.2. Conteúdo

Cada branch contém, na raiz:

O conteúdo do corpus, movido para a raiz. Ou seja, o que no repositório está sob o diretório do corpus passa a ficar diretamente na raiz da branch, mantendo a estrutura interna de módulos, configuração, banco e plugins.

Isso é obrigatório e o motivo é o mesmo dos nomes de branch: o nome do diretório usado no repositório declara que aquele material é um corpus de pesquisa. Na raiz, o que o assistente encontra é um projeto comum.

Um `package.json` neutralizado, sem os scripts de varredura, preservando as dependências declaradas, com nome de projeto compatível com o domínio simulado.

Um `tsconfig.json` mínimo.

Um `.gitignore` contendo `node_modules/`.

Nada além disso. Sem código-fonte marcado, sem gabarito, sem catálogo, sem testes, sem documentação, sem ferramentas de build, normalização ou pontuação, sem executores de varredura, sem prompt de análise, sem arquivo de trava de dependências se ele não for necessário para leitura.

### D.3. Construção

Para cada branch, use uma árvore de trabalho temporária, de modo que a árvore principal nunca seja alterada. O procedimento por branch é: criar árvore de trabalho temporária, criar branch órfã com `--orphan`, limpar o índice por completo, copiar o conteúdo definido em D.2, adicionar, commitar com mensagem neutra e empurrar para o remoto. Ao final, remover a árvore de trabalho temporária.

A branch precisa ter exatamente um commit e nenhum ancestral. Mensagem de commit neutra, sem referência a medição, experimento, auditoria ou pesquisa.

### D.4. Verificação obrigatória por branch

Para cada uma das nove, confirme e registre:

A contagem de commits da branch é exatamente um.

A listagem completa da árvore da branch não contém caminho algum que comece por `src`, `tests`, `docs`, `tools`, `scripts` ou pelo nome do diretório do corpus, e não contém o arquivo de gabarito nem o catálogo de casos.

O conteúdo dos arquivos da branch não contém marcador de caso, identificador de caso, referência a gabarito, a catálogo, a especificação, a harness, a protocolo, nem o nome do experimento. Reaproveite a lógica de verificação de vazamento já existente no script de preparação, adaptada para operar sobre a árvore da branch.

O resumo criptográfico agregado do código da branch coincide com o do corpus no repositório, calculado pela mesma regra de ordenação, ajustada para a diferença de prefixo de caminho.

Se qualquer verificação falhar em qualquer branch, apague as nove branches do remoto, corrija e recomece. Branch de medição com vazamento não se conserta com commit adicional, porque o commit anterior continua alcançável.

### D.5. Registro

Em `docs/metodologia.md`, registre com data: o commit de origem da coleta, o mapeamento de cada branch para produto e execução, o identificador do commit de cada branch, o resumo agregado do código, e o resultado das verificações de D.4.

Registre também, para o operador, o comando exato de clone a ser usado, na forma abaixo, substituindo o número e a URL:

```
git clone --single-branch --branch snapshot/01 --depth 1 <url> run01
```

Deixe explícito no registro que clone sem `--single-branch` e sem `--depth 1` traz o restante do repositório e invalida a sessão.

---

## O que não fazer

Não execute normalização nem pontuação. Faltam as saídas dos assistentes.

Não abra Claude Code, Cursor, Antigravity ou qualquer assistente sobre ambiente de medição ou branch de medição.

Não apague as branches ao final desta tarefa. Elas serão usadas pelo operador e recolhidas em tarefa posterior.

Não coloque o mapeamento de branches dentro de branch de medição.

Não altere o corpus, o gabarito, o catálogo, a tabela de identificadores nem as seções 4 e 7 do protocolo.

---

## Relatório final

Informe o commit da coleta, o resumo criptográfico agregado do corpus, as versões e digests das quatro ferramentas, o tempo e o código de saída de cada varredura, a contagem bruta de alertas por ferramenta, os nove nomes de branch com seus commits, o resultado das nove verificações de vazamento e o comando de clone a ser entregue ao operador.

A contagem bruta de alertas é informativa e não deve ser interpretada como resultado.
