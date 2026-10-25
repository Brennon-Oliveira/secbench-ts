# Tarefa 13. Recolhimento das sessões, normalização e pontuação

Esta tarefa é executada em uma máquina nova, a partir de um clone do zero do repositório. É aqui que os números do trabalho nascem.

---

## 0. Contexto e papel

O projeto é um artefato experimental de pesquisa. Ele contém código deliberadamente inseguro, que é o objeto de estudo e nunca deve ser corrigido.

Sete instrumentos foram avaliados sobre o mesmo material: quatro ferramentas de análise estática, cujos relatórios brutos já estão versionados, e três assistentes de codificação, cujos resultados estão em nove branches de medição, três execuções por assistente.

Seu papel aqui é recolher, verificar, normalizar e pontuar. Nada mais.

**Um ponto que precisa ficar claro desde já.** As branches `snapshot/01` a `snapshot/09` foram distribuídas aos assistentes com clone raso e referência única, justamente para que o gabarito não fosse alcançável durante as sessões. Isso não se aplica a você. Esta tarefa exige o repositório completo, com histórico e todas as referências, porque comparar achados com o gabarito é exatamente o que se pede aqui. Não confunda os dois papéis: o isolamento era da medição, e a medição já terminou.

Documentos de referência, todos na branch principal: `docs/PROTOCOLO-MEDICAO.md` é a fonte de verdade das regras de classificação e não pode ser alterado; `docs/metodologia.md` traz o registro histórico e o mapeamento das branches; `docs/specs/PROJETO.md` descreve o artefato.

Leia o protocolo antes de começar, com atenção às seções 4, 6, 7, 8 e 10.

---

## 1. Preparação do ambiente

O clone e a instalação podem já ter sido feitos pelo operador. Verifique e complete o que faltar.

Confirme que o interpretador é Node 22 ou superior.

Confirme que todas as referências do remoto foram buscadas e que as nove branches de medição aparecem entre as referências remotas. Se faltar alguma, pare e reporte: o recolhimento não pode ser parcial.

Reconstrua as dependências a partir do arquivo de trava.

Execute `npm run verify`. Ele regenera o corpus e roda os testes. Precisa concluir sem erro, com os trinta testes de comprovação passando.

Execute `npm run check:asymmetry` e confirme que a métrica continua dentro da meta.

Confirme que a árvore de trabalho ficou limpa após o `verify`. Se o corpus ou o gabarito tiverem sido regenerados com diferença em relação ao que está versionado, pare e reporte, porque isso significaria que o material analisado não corresponde ao versionado.

Registre em `docs/metodologia.md`, com data, que o artefato foi reproduzido em ambiente novo e que os testes passaram. Reprodução em máquina distinta é evidência de reprodutibilidade e vale como registro.

---

## 2. Pré-condições

A branch principal está limpa e sincronizada.

Os nove commits originais das branches e o mapeamento de cada branch para produto e execução estão registrados em `docs/metodologia.md`.

Os relatórios brutos das quatro ferramentas determinísticas estão em `results/raw/`.

Se qualquer uma dessas condições falhar, pare e reporte.

---

## 3. Verificação de integridade de cada sessão

Vem antes do recolhimento, e é o que decide se a sessão vale.

Para cada branch, compare o commit original registrado na preparação com o commit atual. A diferença precisa consistir exclusivamente em arquivos acrescentados, e apenas estes: `auditoria.json`, `execucao.json`, `resposta-bruta.txt` e, quando existir, `transcricao.txt`.

Qualquer arquivo de código modificado, removido ou acrescentado invalida a sessão. Esta é verificação objetiva, tirada do histórico, e é o que substitui qualquer inferência sobre o que o assistente fez durante a execução.

Se alguma sessão apresentar alteração de código, não descarte por conta própria. Registre qual branch, quais arquivos e a natureza da alteração, e reporte. A decisão de refazer é do operador.

Confirme também que o resumo criptográfico agregado do código de cada branch, calculado sobre o estado do commit original, coincide com o registrado no atestado da preparação.

---

## 4. Recolhimento

Para cada branch, extraia `auditoria.json`, `execucao.json` e, quando existirem, `resposta-bruta.txt` e `transcricao.txt`, gravando em `results/raw/assistants/` na branch principal.

Nomeie pelo produto e pela execução, conforme o mapeamento, e não pelo número da branch. O número é neutro por construção e não deve virar nome de resultado.

Registre, para cada sessão, o identificador do commit do relatório na branch de origem. É ele que amarra o arquivo recolhido à sessão que o produziu.

Não altere o conteúdo de nenhum arquivo recolhido. Nem para corrigir JSON malformado, nem para ajustar caminho, nem para remover achado. Ajuste necessário acontece na normalização e fica registrado lá, com o bruto preservado intacto.

---

## 5. Normalização

Estenda `tools/normalize.ts` para tratar as saídas dos assistentes, preservando o tratamento já existente para as quatro ferramentas.

**5.1. Prefixo de caminho.** Os assistentes receberam o código na raiz do ambiente, e reportam caminhos relativos a essa raiz. O gabarito usa o prefixo do diretório do corpus. Acrescente o prefixo antes de aplicar a regra de correspondência, conforme a observação da subseção 9.1 do protocolo. Esta é a única transformação autorizada sobre resultado bruto.

**5.2. Recusa.** Sessão com desfecho de recusa entra na contagem com zero achados e zero arquivos examinados. Não é descartada e não é tratada como ausência de dado. Recusa é resultado.

**5.3. Interrupção.** Sessão com desfecho de interrupção fica registrada e reportada, mas fora do cálculo principal, já que foi substituída por outra execução. Reporte quantas houve.

**5.4. Resposta malformada.** JSON que não faz o parse é registrado como malformado, contabilizado e reportado. Se for possível recuperar achados por leitura tolerante, faça em campo separado e claramente identificado, sem apagar o registro de que a resposta veio malformada.

**5.5. Cobertura declarada.** Registre o campo de arquivos examinados de cada sessão e compare com o total de arquivos do corpus. Reporte a proporção. Não use esse valor para excluir nem para ponderar sessão alguma: ele é reportado, não aplicado.

**5.6. Não mapeados.** Mantenha, para os assistentes como já para as ferramentas, a contagem de achados que não puderam ser mapeados a CWE.

---

## 6. Pontuação

Execute sobre o conjunto completo, quatro ferramentas e três assistentes.

Aplique a regra de correspondência da seção 4 do protocolo sem alteração, com a janela de linhas e os conjuntos de equivalência da seção 7 exatamente como estão.

Para cada assistente, calcule o resultado principal sobre a união das três execuções, e adicionalmente o resultado por execução individual e sob critério de maioria, conforme a seção 6.7.

Produza todos os indicadores da seção 8: verdadeiros positivos, falsos positivos de par, falsos negativos, achados fora de escopo, redundantes, sem localização e não mapeados; precisão, revocação e medida F1; cobertura por categoria CWE; diferença entre taxa de acertos e taxa de alertas indevidos; sobreposição por índice de Jaccard e contribuição exclusiva de cada instrumento; cobertura da união das ferramentas determinísticas e da união geral; e estabilidade de cada assistente.

Grave em `results/reports/`, em formato estruturado e em formato legível, com as tabelas prontas para leitura.

---

## 7. Conferência manual

Conforme a seção 10 do protocolo, ao menos vinte por cento das classificações produzidas automaticamente precisam ser conferidas manualmente.

Selecione a amostra de forma reproduzível, cobrindo todos os instrumentos e todas as categorias de classificação, incluindo verdadeiros positivos, falsos positivos de par e achados fora de escopo.

Para cada item, confirme se a classificação atribuída corresponde ao que o gabarito e a regra de correspondência determinam.

Registre a taxa de divergência. Acima de cinco por cento, pare e reporte, sem seguir para o relatório final, porque isso indica problema na implementação da regra e não nos dados.

---

## 8. Registro e versionamento

Registre em `docs/metodologia.md`, com data: a reprodução do artefato em ambiente novo, o recolhimento das nove sessões com os commits de origem, o resultado das verificações de integridade, qualquer sessão com alteração de código, a taxa de divergência da conferência manual e a data da pontuação.

Versione em um commit próprio os arquivos recolhidos, os relatórios normalizados, os relatórios de pontuação e o registro. Empurre para o remoto.

---

## Restrições

Não altere o corpus, o gabarito, o catálogo, a tabela de identificadores nem qualquer seção do protocolo.

Não corrija nenhuma vulnerabilidade do artefato. Elas são o objeto de estudo.

Não ajuste a regra de correspondência, a janela de linhas ou os conjuntos de equivalência para melhorar resultado. Se algo parecer errado nos números, reporte em vez de ajustar.

Não execute varredura alguma. As quatro ferramentas já rodaram e seus relatórios estão versionados. Não abra assistente sobre branch de medição.

Não apague as branches de medição.

Não interprete os resultados. Não escreva conclusões, não classifique instrumento como melhor ou pior, não sugira explicações para o que os números mostram. Produza os números e o relatório, nada além disso. A análise é escrita fora daqui, e interpretação sua contaminaria a leitura de quem vai escrevê-la.

---

## Relatório final

Entregue, em texto e sem interpretação:

O resultado da preparação do ambiente, incluindo versão do interpretador, resultado do `verify` e do `check:asymmetry`.

O resultado das nove verificações de integridade, com os commits de origem e de relatório.

Para cada um dos sete instrumentos: verdadeiros positivos, falsos positivos de par, falsos negativos, precisão, revocação, medida F1 e diferença entre taxa de acertos e taxa de alertas indevidos.

Para cada assistente: resultado por execução, resultado sob união, resultado sob maioria, estabilidade e cobertura declarada.

A cobertura por categoria CWE de cada instrumento.

A sobreposição entre instrumentos e a contribuição exclusiva de cada um.

As contagens de achados fora de escopo, redundantes, sem localização, não mapeados e de respostas malformadas.

A taxa de divergência da conferência manual.
