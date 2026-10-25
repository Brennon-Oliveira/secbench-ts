# Tarefa 12. Higiene de versionamento e retomada da coleta

A parada da tarefa 11 foi correta. Esta tarefa resolve os dois bloqueios e retoma as partes C e D no mesmo ciclo.

O remoto foi criado pelo operador. Confirme que existe, que é alcançável e que aceita escrita antes de qualquer outra coisa. Se não estiver, pare e reporte.

---

## Parte A. Organizar a árvore

Todo o trabalho das tarefas 9 e 10 está em árvore de trabalho, sem commit. Isso precisa virar histórico antes de a coleta começar, porque o atestado da medição promete amarrar o resultado a um commit concreto, e árvore suja torna essa promessa vazia.

**A.1.** Antes de commitar qualquer coisa, execute `npm run build:corpus` e confirme que o corpus e o gabarito gerados coincidem com os que estão na árvore. Se houver diferença, é sinal de que o material versionado ficou defasado em relação ao código-fonte, e o que vale é o regenerado.

**A.2.** Execute `npm run verify` e `npm run check:asymmetry`. Nada é commitado com teste vermelho.

**A.3.** Revise o que está sem rastreamento e decida item a item entre versionar e descartar. Não use adição em massa sem olhar. Em particular, confirme que não entram no repositório: diretórios de dependências, bancos de dados locais, ambientes de medição preparados, arquivos temporários de ensaio e qualquer arquivo com segredo real. Se o `.gitignore` estiver incompleto para algum desses casos, complete antes de adicionar.

**A.4.** Organize o restante em commits coerentes por assunto, e não em um commit único. Sugestão de separação: conteinerização das ferramentas e executores reescritos; fixture descartável e resultados do ensaio de calibração; tabela de identificadores reconstruída; correções remanescentes no corpus, no código-fonte e no gabarito; documentação e registro de metodologia.

Cada mensagem de commit deve dizer o que mudou e por quê, em uma linha, com corpo quando a decisão não for óbvia.

**A.5.** Não reescreva histórico já existente. Não faça rebase, não faça squash de commits anteriores, não force push. O que já está registrado, inclusive o commit da emenda 1.3, permanece como está.

**A.6.** Ao final, `git status` precisa estar limpo. Empurre a branch principal para o remoto.

---

## Parte B. Registro

Em `docs/metodologia.md`, registre com data que a árvore foi consolidada antes da coleta, quantos commits foram criados, e o identificador do commit final sobre o qual a coleta será executada.

Registre também qualquer arquivo que você tenha decidido descartar em vez de versionar, com o motivo. Descarte silencioso não serve, porque depois ninguém consegue distinguir entre arquivo que nunca existiu e arquivo que foi removido.

---

## Parte C. Retomada

Com a árvore limpa e a branch principal empurrada, execute as partes C e D da tarefa 11, exatamente como especificadas naquele documento, sem alteração.

Resumidamente, para conferência: preparar o ambiente local de medição e guardar o atestado, reconstruir dependências apenas nesse ambiente, gerar o arquivo de versões, executar as quatro ferramentas em contêiner e sem rede, trazer os relatórios brutos de volta e conferir o resumo agregado do corpus, criar o diretório de destino das saídas dos assistentes, e então criar as nove branches órfãs com nomes neutros, verificá-las uma a uma e empurrá-las.

Se qualquer verificação das nove branches falhar, apague todas as nove do remoto e recomece, conforme a regra da tarefa 11.

---

## Restrições

Não altere o conteúdo do corpus, do gabarito, do catálogo ou da tabela de identificadores nesta tarefa. Organizar versionamento é registrar o que já existe, e não modificar.

Não altere as seções 4 e 7 do protocolo.

Não execute normalização nem pontuação.

Não abra assistente algum sobre ambiente de medição ou branch de medição.

---

## Relatório final

Informe a lista de commits criados com seus identificadores e assuntos, o commit final da coleta, os arquivos descartados com o motivo, e em seguida todo o relatório previsto na tarefa 11: resumo agregado do corpus, versões e digests das ferramentas, tempo e código de saída de cada varredura, contagem bruta de alertas por ferramenta, os nove nomes de branch com seus commits, o resultado das nove verificações de vazamento e o comando de clone a ser entregue ao operador.
