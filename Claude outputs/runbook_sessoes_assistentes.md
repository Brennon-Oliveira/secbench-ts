# Runbook das sessões dos assistentes

Esta parte é sua, e não do agente. Nove sessões no total: três com Claude Code em Opus, três com Cursor em Grok e três com Google Antigravity.

O agente prepara dez ambientes de medição, um para as ferramentas e nove para você, e informa os caminhos. Cada sessão usa um ambiente diferente, nunca reaproveitado.

---

## Antes de começar

Confirme que o agente entregou o relatório da tarefa 11 e que os nove ambientes existem, cada um com atestado guardado fora dele.

Abra um dos ambientes e olhe o que tem dentro. Você deve ver apenas o corpus, os executores de varredura, o manifesto de dependências e o arquivo de trava. Se aparecer `src`, `ground-truth.json`, `tests`, `docs` ou `.git`, pare, porque o ambiente não está limpo e a medição não vale.

Tenha à mão onde anotar, para cada sessão: produto, versão, modelo, data e hora de início, duração e qualquer anormalidade.

---

## Regras que valem para as nove sessões

Abra o assistente tendo o ambiente de medição como pasta de trabalho. Nunca o repositório do projeto.

Sessão nova a cada execução. Nada de continuar conversa, nada de histórico da execução anterior. Se o produto tiver memória persistente entre sessões, desligue antes.

Cole a instrução abaixo exatamente como está, sem acrescentar contexto e sem explicar o que é o material.

Não intervenha depois de colar. Não corrija rumo, não peça para continuar, não peça mais detalhe, não responda pergunta. A instrução já proíbe o assistente de perguntar, mas se ele perguntar mesmo assim, encerre a sessão, anote a ocorrência e refaça em ambiente novo. Sua resposta a uma pergunta é contexto, e contexto vindo do operador é justamente o que a medição não pode ter.

Se a sessão parar por limite de uso ou erro de transporte, anote a interrupção e refaça em ambiente novo. Interrupção técnica é a única razão que autoriza repetir. Insatisfação com o resultado não é.

---

## Instrução a colar

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

---

## Ao final de cada sessão

Confirme que `auditoria.json` foi criado na raiz do ambiente. Se o assistente devolveu o resultado apenas na conversa e não gravou o arquivo, salve a resposta como está, inclusive malformada, e anote que a gravação não ocorreu. Resposta malformada é dado, e não erro a esconder.

Copie o arquivo para `results/raw/assistants/` no repositório, com nome que identifique produto e execução. Padrão sugerido: `claude-code-run1.json` até `run3`, `cursor-run1.json` até `run3`, `antigravity-run1.json` até `run3`.

Ao lado de cada um, salve um arquivo de metadados com produto, versão, modelo, data e hora de início, duração, caminho do ambiente usado e qualquer anormalidade observada.

Não edite o conteúdo do arquivo de saída. Nem para arrumar JSON quebrado, nem para remover achado que você julgue errado. A avaliação do achado é feita depois, pelo script de pontuação, e não por você.

---

## Sinais de que a sessão não vale

O assistente alterou algum arquivo do corpus.

O assistente executou comandos.

Você respondeu alguma pergunta ou deu qualquer orientação adicional.

Nesses casos, anote o ocorrido e refaça em ambiente novo, preservando o registro da tentativa descartada.

Cobertura parcial é caso à parte. Se o `filesExamined` declarado for bem menor que o número de arquivos do corpus e o assistente tiver parado por conta própria, a sessão continua válida, porque cobertura parcial declarada é dado previsto no protocolo. Mas precisa estar anotada com destaque, porque vira análise no artigo.

---

## Ordem sugerida

Faça as três execuções de um produto antes de passar ao seguinte, para reduzir troca de ferramenta e erro de anotação. A ordem entre produtos não importa e não precisa ser sorteada, já que os ambientes são idênticos e não há efeito de aprendizado entre sessões independentes.

---

## Quando terminar as nove

Me avise com os nove arquivos depositados e os metadados preenchidos. A partir daí o agente roda a normalização e a pontuação, e eu escrevo a análise dos resultados e as considerações finais.
