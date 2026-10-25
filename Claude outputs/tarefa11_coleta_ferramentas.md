# Tarefa 11. Emenda 1.3, preparação dos ambientes e coleta das ferramentas determinísticas

Esta versão substitui integralmente qualquer versão anterior da tarefa 11.

Três partes. A primeira emenda o protocolo. A segunda prepara os ambientes de medição. A terceira executa as varreduras determinísticas. As sessões dos assistentes de codificação são executadas pelo operador e não fazem parte desta tarefa: você não abre assistente algum sobre ambiente de medição.

---

## Parte A. Emenda 1.3 do protocolo

Aplique as alterações abaixo em `docs/PROTOCOLO-MEDICAO.md`, exatamente como descritas, sem reformular o texto fornecido.

**A.1. Cabeçalho.** Versão passa de 1.2 para 1.3. Última alteração passa a ser a data de hoje.

**A.2. Seção 3.** Onde se lê que são dois assistentes de codificação de fornecedores distintos, passa a ler três assistentes de codificação de fornecedores distintos.

**A.3. Seção 6.2.** Substitua o parágrafo inteiro por este:

> **6.2. Instrumentos avaliados.** Três assistentes de fornecedores distintos: Claude Code com modelo Opus, Cursor com modelo Grok e Google Antigravity. Cada um é identificado no relatório com nome do produto, versão da interface utilizada e identificador do modelo subjacente quando exposto. A escolha de três fornecedores permite observar dispersão entre instrumentos, e não apenas diferença entre dois pontos, o que sustenta com mais firmeza a discussão sobre o peso relativo da instrumentação e do modelo que a sustenta.

**A.4. Seções 6.5 e 6.6.** Onde se lê seis execuções, passa a ler nove execuções. A regra de três execuções independentes por assistente permanece inalterada.

**A.5. Subseção 9.1.** Substitua integralmente o bloco de instrução, entre as marcações de código, por este:

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

**A.6. Subseção 9.1, observações.** Acrescente ao final das observações este parágrafo:

> A proibição de fazer perguntas e de pedir confirmação existe porque o assistente, ao interromper para consultar o operador, obriga o operador a responder, e a resposta é contexto adicional que a medição não pode conter. Proibir a interrupção na origem é mais seguro do que administrar seu efeito depois.

**A.7. Seção 11.** Acrescente esta entrada acima do formato obrigatório para alterações futuras:

> **Data de hoje, versão 1.3.** Os instrumentos avaliados passam de dois para três assistentes de codificação, com a inclusão do Google Antigravity ao lado do Claude Code e do Cursor, elevando o total de execuções de seis para nove. Acrescentadas à instrução da subseção 9.1 três regras que proíbem perguntas, proíbem pedido de confirmação e determinam o registro da interpretação adotada diante de ambiguidade.
>
> Justificativa: três fornecedores permitem observar dispersão entre instrumentos, e não apenas diferença entre dois pontos, o que sustenta a discussão central do trabalho sobre o peso relativo da instrumentação. A ampliação preserva as três execuções por instrumento, e com elas a medida de estabilidade e o critério de maioria, que seriam perdidos caso o total de sessões fosse mantido em seis. As regras acrescentadas à instrução eliminam a interrupção do assistente para consulta ao operador, que é uma via de contaminação por contexto. Nenhuma coleta havia ocorrido nesta data. A regra de correspondência da seção 4, os conjuntos de equivalência da seção 7 e os indicadores da seção 8 permanecem idênticos ao registro original.

**A.8.** Confirme que as seções 4 e 7 permanecem inalteradas e faça um commit isolado do protocolo, com mensagem que identifique a emenda 1.3.

---

## Parte B. Pré-condições da coleta

Não inicie a preparação sem verificar todas. Se qualquer uma falhar, pare e reporte.

A emenda 1.3 está commitada isoladamente.

O diagnóstico da tabela de identificadores está registrado em `docs/metodologia.md`, com conclusão explícita sobre cada família investigada.

`npm run verify` conclui sem erro e os trinta testes de comprovação passam.

`npm run check:asymmetry` reporta métrica dentro da meta.

A árvore de trabalho está limpa, sem alteração não versionada.

Registre em `docs/metodologia.md` o commit exato sobre o qual a coleta será feita. Esse identificador amarra tudo o que vem depois.

---

## Parte C. Preparação dos ambientes

São necessários dez ambientes de medição, todos preparados a partir do mesmo commit e do mesmo clone limpo.

Um ambiente para as varreduras determinísticas.

Nove ambientes para as sessões dos assistentes, um por sessão, porque o protocolo exige ambiente recém-preparado a cada execução e porque o assistente grava um arquivo de saída dentro do ambiente, que não pode contaminar a execução seguinte.

Procedimento: clone o repositório em diretório temporário fora da árvore de trabalho, reconstrua as dependências a partir do arquivo de trava, e execute `measurement:prepare` dez vezes, com destinos distintos e nomes previsíveis. Nomeação sugerida: um diretório para as ferramentas, e nove nomeados por produto e número da execução, cobrindo três execuções para cada um dos três assistentes.

Cada preparação emite um atestado próprio. Guarde os dez atestados fora dos ambientes, em local que o operador alcance.

Confirme que os dez atestados registram o mesmo resumo criptográfico agregado do corpus e o mesmo commit de origem. Divergência entre eles significa que algo mudou no meio do processo, e nesse caso pare e reporte.

Registre em `docs/metodologia.md` os caminhos dos dez ambientes, o commit, o resumo agregado e a data da preparação.

---

## Parte D. Varreduras determinísticas

Execute as quatro ferramentas sobre o ambiente destinado a elas, e não sobre a árvore de trabalho.

Cada varredura roda em contêiner de versão fixada, sem acesso à rede durante a análise.

Antes de começar, gere o arquivo de versões e guarde uma cópia junto dos resultados desta coleta. As versões e os digests registrados precisam ser os usados agora, e não os de uma execução anterior.

Para cada ferramenta, o relatório bruto e o arquivo de metadados devem registrar versão reportada pela própria ferramenta, imagem e digest, commit do conjunto de regras quando aplicável, comando completo, data e hora, duração e código de saída.

Ferramenta que falhar não deve produzir relatório vazio disfarçado de execução bem-sucedida. Registre a falha, preserve a saída disponível e reporte.

---

## Parte E. Retorno dos resultados

Traga os relatórios brutos do ambiente de volta para `results/raw/` no repositório, preservando a separação por ferramenta.

Antes de considerar o retorno concluído, recalcule o resumo agregado do corpus do repositório e confirme que coincide com o registrado no atestado. Divergência significa que o corpus mudou entre a preparação e o retorno, e a coleta precisa ser refeita.

Crie `results/raw/assistants/` vazio, com marcador de diretório, que é onde o operador vai depositar as saídas das nove sessões.

Versione os relatórios brutos, os dez atestados e a cópia do arquivo de versões, em um commit próprio, com mensagem que identifique a coleta.

---

## O que não fazer

Não execute normalização nem pontuação. Elas dependem das saídas dos assistentes, que ainda não existem, e rodar agora produziria resultado parcial que pode ser confundido com o definitivo depois.

Não abra Claude Code, Cursor, Antigravity ou qualquer assistente sobre os ambientes preparados. Os nove ambientes ficam intocados até o operador usá-los.

Não altere o corpus, o gabarito, o catálogo, a tabela de identificadores nem as seções 4 e 7 do protocolo. A partir da preparação dos ambientes, alteração nesses arquivos invalida a coleta.

Não apague os ambientes preparados ao final.

---

## Relatório final

Informe o commit da coleta, o resumo criptográfico agregado do corpus, os caminhos dos dez ambientes, as versões e digests das quatro ferramentas, o tempo de execução e o código de saída de cada varredura, e a contagem bruta de alertas emitidos por ferramenta.

A contagem bruta é informativa e não deve ser interpretada como resultado. Nenhuma leitura de desempenho antes da normalização e da pontuação.
