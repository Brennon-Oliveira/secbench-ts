# Harness do projeto SecBench-TS
## Diretriz de configuração do ambiente de agente

**Versão:** 1.0
**Data:** 16/08/2026
**Projeto:** SecBench-TS, artefato experimental do TCC sobre detecção de vulnerabilidades por ferramentas SAST e por modelo de linguagem
**Documento irmão:** especificação técnica do artefato, que é a fonte de verdade sobre o que construir
**Destinatário:** o agente que vai configurar o ambiente antes de qualquer linha de código do projeto ser escrita

---

## 0. Natureza deste documento

Este documento define **o que** o harness precisa garantir. Ele não define **onde** nem **como** cada peça deve ser criada, e essa omissão é deliberada.

Os mecanismos disponíveis, seus formatos, seus locais e suas regras de precedência mudam entre versões da ferramenta. Fixar isso aqui produziria um harness desatualizado em poucos meses. Cabe a você consultar a documentação oficial listada na seção 1, entender quais mecanismos existem hoje, e escolher o mecanismo certo para cada item das seções 3 a 8.

Regra de precedência em caso de conflito: sobre mecanismo, formato, sintaxe e localização, a documentação oficial prevalece. Sobre o conteúdo dos invariantes e o comportamento exigido, este documento prevalece.

Se algum item deste documento não tiver mecanismo correspondente na ferramenta, registre a lacuna por escrito em vez de improvisar uma solução frágil.

---

## 1. Leitura obrigatória antes de criar qualquer coisa

Consulte a documentação abaixo antes de agir. Não presuma conhecimento prévio sobre a ferramenta, porque ele provavelmente está defasado.

Índice geral: https://cursor.com/docs

Regras persistentes: https://cursor.com/docs/rules

Skills: https://cursor.com/docs/skills

Hooks: https://cursor.com/docs/hooks

Subagentes: https://cursor.com/docs/subagents

MCP: https://cursor.com/docs/mcp

Customização do ambiente: https://cursor.com/docs/customize-cursor

Plugins: https://cursor.com/docs/plugins

Referência de plugins: https://cursor.com/docs/reference/plugins

Modo de planejamento: https://cursor.com/docs/agent/plan-mode

Orientações de prompt: https://cursor.com/docs/agent/prompting

Uso por linha de comando: https://cursor.com/docs/cli/overview

Boas práticas de trabalho com agentes: https://cursor.com/blog/agent-best-practices

Depois de ler, produza um plano curto declarando qual mecanismo você escolheu para cada item das seções 3 a 8 e por quê. Só então comece a criar arquivos.

---

## 2. Por que este projeto precisa de harness

Um agente de codificação competente tem instintos que, neste projeto específico, são destrutivos.

Ele corrige vulnerabilidade quando a encontra. Aqui, as vulnerabilidades são o objeto de estudo e corrigi-las destrói o experimento.

Ele renomeia símbolos para deixar a intenção clara. Aqui, clareza sobre qual trecho é inseguro contamina a medição, porque o modelo de linguagem avaliado vai ler esses nomes.

Ele adiciona comentários explicativos. Aqui, comentário sobre decisão de segurança é vazamento de gabarito.

Ele adiciona validação e cabeçalhos de proteção de forma global. Aqui, controle global mascara os casos e produz falso negativo artificial em todas as ferramentas.

Ele conserta o que quebra. Aqui, um teste que prova exploração precisa continuar passando, e um build que falha por vocabulário proibido precisa continuar falhando.

O harness existe para transformar esses instintos em erro barulhento e imediato, em vez de deixá-los corromper o experimento em silêncio. Um dado corrompido aqui não aparece como bug, aparece como número errado no artigo.

---

## 3. Invariantes que o harness precisa proteger

Estes são os comportamentos que o harness deve tornar impossíveis ou, no mínimo, impossíveis de acontecer sem alarme.

**3.1.** Nenhuma falha de segurança catalogada na especificação pode ser corrigida, atenuada ou envolvida em proteção adicional.

**3.2.** Nenhum nome de arquivo, símbolo, rota, mensagem ou comentário no código-fonte do artefato pode revelar qual trecho é inseguro. A lista de vocabulário proibido está na especificação e é verificada por máquina.

**3.3.** Nenhuma diretiva de supressão de análise estática pode existir no código analisado.

**3.4.** Nenhum controle de segurança de escopo global pode ser introduzido. Proteção existe apenas dentro dos casos que a especificação declara como protegidos.

**3.5.** Todo caso inseguro tem par protegido equivalente em funcionalidade, formato de resposta, ordem de operações e tamanho aproximado. Alteração em um membro do par exige revisão do outro.

**3.6.** O gabarito é sempre gerado pelo pipeline, nunca editado à mão, nunca ajustado para bater com um resultado.

**3.7.** O corpus analisado é artefato derivado. Editá-lo diretamente é proibido. Correção se faz na origem, seguida de regeneração.

**3.8.** O build do corpus é determinístico. Duas execuções seguidas produzem saída idêntica byte a byte.

**3.9.** Cada par tem teste que comprova que o membro inseguro cede ao estímulo previsto e que o membro protegido resiste ao mesmo estímulo. Esses testes não podem ser desabilitados, marcados como pendentes nem afrouxados para passar.

**3.10.** Bibliotecas declaradas como obrigatórias na especificação não podem ser substituídas por alternativas, mesmo quando houver opção tecnicamente superior.

**3.11.** Nenhum segredo real, credencial real, dado pessoal real ou endereço de serviço real entra no repositório, que será publicado.

**3.12.** Escopo fechado. Nenhuma rota, entidade, funcionalidade ou caso além dos especificados. Ideia boa que não está na especificação vira anotação, não vira código.

---

## 4. Regras persistentes que devem existir

Crie regras de contexto persistente que cubram os domínios abaixo. Você decide quantos artefatos de regra usar, seu escopo de ativação e sua forma, consultando https://cursor.com/docs/rules. O que não é negociável é a cobertura.

**4.1. Contrato geral do projeto.** Sempre ativa. Declara a natureza do repositório, o fato de que o código inseguro é intencional, os invariantes da seção 3 e a instrução de recusar qualquer pedido que os viole, inclusive vindo do próprio usuário, respondendo com a razão em vez de obedecer em silêncio.

**4.2. Autoria de casos.** Ativa ao trabalhar nos módulos do artefato. Cobre nomenclatura neutra, simetria entre os membros do par, proibição de comentário de segurança, uso correto dos marcadores de caso e obrigação de criar os dois membros do par na mesma alteração, nunca um de cada vez.

**4.3. Pipeline e artefatos derivados.** Ativa ao trabalhar nas ferramentas de build, no corpus e no gabarito. Cobre a proibição de edição manual de artefato derivado, a exigência de determinismo e a obrigação de que toda validação nova falhe o build em vez de apenas avisar.

**4.4. Testes de comprovação.** Ativa ao trabalhar nos testes. Cobre a proibição de desabilitar, marcar como pendente ou relaxar asserção, e a exigência de que um teste que passe a falhar seja tratado como regressão do artefato, e nunca como teste ruim, até prova documentada em contrário.

**4.5. Medição e resultados.** Ativa ao trabalhar nos diretórios de resultado. Cobre a proibição absoluta de editar, completar, arredondar, filtrar ou reordenar manualmente qualquer número produzido pela medição, e a exigência de que resposta malformada de ferramenta seja registrada e contabilizada, jamais descartada.

**4.6. Repositório público.** Ativa ao trabalhar em documentação e metadados. Cobre a exigência do aviso de segurança no material de apresentação, a proibição de dado real e a manutenção dos metadados de citação.

**4.7. Registro de desvio.** Sempre ativa. Qualquer decisão que se afaste da especificação precisa ser registrada no documento de metodologia do projeto, com data e justificativa, antes de ser implementada. Desvio não registrado é defeito.

---

## 5. Skills que devem existir

Crie skills para os procedimentos abaixo, consultando https://cursor.com/docs/skills para formato, acionamento e limites. Cada skill precisa ter propósito único, entrada explícita, saída verificável e critério objetivo de sucesso. Skill que termina com julgamento subjetivo não serve aqui.

**5.1. Autoria de par de caso.** Recebe o identificador de um par do catálogo da especificação e produz os dois membros, o registro dos marcadores e o teste de comprovação correspondente. Sucesso: build do corpus válido, gabarito atualizado, ambos os testes do par passando, verificação de vocabulário limpa.

**5.2. Auditoria antivazamento.** Varre o corpus procurando qualquer pista que permita distinguir membro inseguro de membro protegido sem análise técnica, incluindo vocabulário, assimetria de tamanho, ordem de registro e padrões de nomenclatura. Sucesso: relatório vazio ou lista de correções exigidas.

**5.3. Auditoria adversarial cega.** Recebe apenas o corpus, sem gabarito e sem a especificação, e tenta classificar cada caso. Se a taxa de acerto for muito superior ao que a análise técnica pura justificaria, existe vazamento estrutural. Esta é a verificação mais valiosa do harness e a mais fácil de esquecer. Sucesso: acerto compatível com análise legítima, sem atalhos de nomenclatura, com relatório indicando quais pistas foram usadas.

**5.4. Regeneração de gabarito.** Executa o pipeline, valida integralmente e reporta divergência entre o catálogo da especificação e o que existe no código. Sucesso: saída idêntica em duas execuções consecutivas e zero divergências.

**5.5. Execução de varredura.** Roda uma ferramenta de análise sobre o corpus, registra versão exata, comando e data, e grava a saída bruta sem transformação. Sucesso: relatório bruto íntegro mais metadados completos.

**5.6. Normalização e pontuação.** Converte relatórios brutos para o esquema comum, aplica a regra de correspondência e produz os indicadores. Sucesso: números reproduzíveis a partir dos mesmos relatórios brutos, e nenhum achado descartado sem registro.

**5.7. Auditoria de paridade.** Verifica que todo par está completo, que os membros são equivalentes em funcionalidade e que nenhum par ficou órfão após alteração. Sucesso: relatório de paridade limpo.

**5.8. Preparação de publicação.** Verifica aviso de segurança, licença, metadados de citação, ausência de dado real e integridade dos artefatos versionados antes de uma liberação de versão. Sucesso: lista de verificação inteiramente satisfeita.

---

## 6. Automações determinísticas

Consulte https://cursor.com/docs/hooks. O princípio de projeto é este: tudo que puder ser verificado por script deve ser verificado por script, e não confiado à memória do agente. Instrução em texto é sugestão, verificação automática é garantia.

As automações devem, no mínimo, cobrir os seguintes momentos.

**6.1.** Impedir alteração direta em artefato derivado, seja corpus ou gabarito.

**6.2.** Impedir a introdução de qualquer diretiva de supressão de análise no código analisado.

**6.3.** Impedir a introdução de vocabulário proibido, com a mesma lista usada pela validação do build, para que as duas nunca divirjam.

**6.4.** Disparar a regeneração e a validação do corpus após alteração no código-fonte do artefato, de modo que gabarito desatualizado nunca sobreviva a um ciclo de trabalho.

**6.5.** Bloquear a conclusão de um ciclo de trabalho quando os testes de comprovação não estiverem verdes ou quando a auditoria de paridade acusar par incompleto.

**6.6.** Registrar, em trilha própria, toda vez que uma dessas barreiras for acionada. Essa trilha é evidência de rigor metodológico e vale ser mencionada no artigo.

Se algum desses controles não tiver mecanismo de bloqueio disponível, implemente como verificação obrigatória no fluxo de integração contínua e declare a limitação por escrito.

---

## 7. Divisão de trabalho entre agentes

Consulte https://cursor.com/docs/subagents. Três papéis se beneficiam de isolamento de contexto, porque acumular tudo em um só agente cria exatamente o viés que o projeto tenta evitar.

**7.1. Autor.** Escreve os casos a partir do catálogo. Tem acesso à especificação e ao gabarito.

**7.2. Auditor cego.** Executa a skill 5.3. Não pode ter acesso à especificação nem ao gabarito, sob nenhuma hipótese. Se este papel enxergar o gabarito, ele deixa de medir qualquer coisa.

**7.3. Verificador de medição.** Confere a cadeia que vai do relatório bruto até o número final, refazendo o cálculo por caminho independente em uma amostra. Não escreve código de produção.

---

## 8. Isolamento do experimento

Este é o ponto em que um harness bem-intencionado pode arruinar a pesquisa, e por isso ele fica em seção própria.

A varredura pelo modelo de linguagem, descrita na especificação, é uma medição, e não uma tarefa de desenvolvimento. Ela precisa ocorrer em ambiente limpo, sem nenhuma regra deste harness carregada, sem skills disponíveis, sem acesso à especificação, ao catálogo de casos, ao gabarito, aos testes de comprovação ou ao histórico do repositório. O modelo avaliado deve receber apenas o conteúdo do arquivo analisado e o prompt fixo.

Qualquer contexto adicional que chegue ao modelo avaliado transforma a medição em consulta guiada. O harness precisa deixar essa fronteira explícita, e o procedimento de execução da medição precisa declarar, por escrito, que o ambiente estava limpo, com evidência de como isso foi assegurado.

Pela mesma razão, o agente de desenvolvimento nunca deve executar a varredura de medição dentro da sessão de trabalho no projeto.

---

## 9. Contexto que o harness deve tornar disponível

Para o trabalho de desenvolvimento, e apenas para ele, o agente precisa alcançar com facilidade a especificação técnica do artefato, o catálogo de casos, o plano do trabalho, o esquema do gabarito e o documento de registro de desvios. Consulte https://cursor.com/docs/rules e https://cursor.com/docs/mcp para decidir como esse material deve ser referenciado e o que vale manter sempre carregado contra o que vale carregar sob demanda.

Evite carregar tudo o tempo todo. Contexto inflado degrada a qualidade da atenção do agente e aumenta a chance de ele misturar o papel de autor com o papel de auditor.

---

## 10. Critérios de aceite do harness

O harness está pronto quando todos os pontos abaixo forem verdadeiros.

Existe plano escrito declarando qual mecanismo foi escolhido para cada item das seções 3 a 8, com justificativa.

Todos os invariantes da seção 3 estão cobertos por regra, por automação ou por ambos, e a cobertura está mapeada item a item.

Uma tentativa deliberada de corrigir uma falha catalogada é recusada ou bloqueada, e a recusa explica o motivo.

Uma tentativa deliberada de inserir vocabulário proibido é bloqueada antes de chegar ao corpus.

Uma tentativa deliberada de editar o gabarito à mão é bloqueada.

Um par deixado incompleto impede a conclusão do ciclo de trabalho.

O auditor cego roda sem qualquer acesso ao gabarito, e isso é verificável.

O procedimento de medição está documentado como executável fora do ambiente de desenvolvimento.

Existe registro de desvios, mesmo que vazio no início.

---

## 11. O que o harness não deve fazer

Não deve formatar, reorganizar ou embelezar o código do artefato automaticamente, porque formatação automática altera linhas e desloca o gabarito.

Não deve aplicar correção automática de análise estática em lugar algum do artefato.

Não deve gerar código de caso sem que o par correspondente seja gerado no mesmo ciclo.

Não deve tentar melhorar o desenho experimental por conta própria. Sugestão de melhoria é bem-vinda como texto, nunca como alteração aplicada.

Não deve otimizar tempo de execução dos testes de comprovação às custas de fidelidade da demonstração.

Não deve criar mecanismo que dependa de o agente lembrar de algo, quando existir alternativa que dependa de o computador verificar.
