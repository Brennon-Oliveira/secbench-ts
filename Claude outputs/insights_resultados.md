# Leitura dos resultados: achados, nuances e pendências

**Data:** 10/09/2026
**Fonte:** `relatorio-final.md`, `docs/metodologia.md` e saídas brutas do repositório
**Natureza:** notas analíticas para alimentar as seções 5 e 6 do artigo. Nada aqui entra no texto sem reescrita.

---

## 1. O mecanismo por trás do resultado principal

O número que salta é a diferença de revocação: o melhor instrumento determinístico chegou a 11 casos de 30, e os assistentes a 29 e 28. Mas o número sozinho não explica nada, e é a distribuição por categoria que carrega o argumento.

As quatro ferramentas somadas detectaram zero casos em nove das vinte categorias. São elas: exposição de detalhe em erro, controle de acesso ausente, função crítica sem autenticação, aleatoriedade não criptográfica, upload sem restrição, dado sensível em log, referência direta a objeto, derivação de senha com esforço insuficiente e componente de terceiros. Doze casos, zero detecções.

Nas outras onze categorias, as ferramentas foram razoavelmente competentes, chegando a acertar os dois casos em injeção de comando, injeção de SQL, criptografia inadequada, credencial embutida e requisição forjada.

O padrão é nítido e é o que o artigo deve dizer: as ferramentas cobrem bem a falha que tem assinatura sintática reconhecível, um dado que entra e chega a um destino perigoso, e não cobrem a falha que depende de saber o que o código deveria estar fazendo. Verificar se uma rota administrativa deveria exigir papel de administrador, se um token deveria vir de fonte criptográfica, ou se uma senha deveria ser registrada em log, exige entender a intenção, não reconhecer um padrão.

Os assistentes acertaram onze dos doze casos dessas nove categorias. É aí que a diferença de revocação nasce, e não em uma superioridade genérica.

---

## 2. O achado que contraria a literatura

Precisão de 1,000 nos dois assistentes, em todas as execuções, sem exceção. Zero falsos positivos de par.

Isso contradiz frontalmente Zhou et al. (2024), que encontraram modelos detectando de noventa a cem por cento das falhas ao custo de volume alto de alertas indevidos, e também Pimentel e Progetti (2025), que relataram entre vinte e dois e quarenta e cinco por cento de falsos positivos.

A explicação provável não é que os assistentes sejam mais precisos que os modelos daqueles estudos, e sim que o que se mede tem nome diferente. Aqui, falso positivo é definido de forma estrita: alerta emitido sobre o trecho protegido de um par, que é código funcionalmente equivalente e comprovadamente correto. Nos estudos citados, falso positivo foi estimado sobre código real sem gabarito, onde qualquer alerta não confirmado entra na conta.

Essa diferença precisa ser explicitada no artigo, porque é a passagem em que o desenho pareado prova seu valor. A afirmação defensável é que, diante de código correto que faz exatamente a mesma coisa que o código defeituoso ao lado, nenhum dos dois assistentes se confundiu uma vez sequer. Essa é uma afirmação forte e verificável, e é diferente de dizer que assistentes não produzem ruído.

---

## 3. A nuance obrigatória: o que ficou fora do escopo

Precisão de 1,000 convive com vinte e três achados fora de escopo no Claude Code e trinta e seis no Cursor. São alertas emitidos em trechos que o gabarito não cataloga, e que por regra não entram no cálculo da precisão.

O artigo não pode apresentar a precisão perfeita sem trazer esse número no mesmo parágrafo. Sem ele, a leitura fica enganosa.

O que não se sabe é se esses achados são legítimos ou ruído, porque o gabarito não cobre o código de infraestrutura em que caíram. As ferramentas também os produzem em volume: quarenta e três no njsscan e trinta e dois no Semgrep, contra onze no CodeQL.

Vale registrar que os assistentes não são os mais barulhentos nessa categoria. O njsscan, com cinco detecções corretas, produziu quarenta e três achados fora de escopo. O Claude Code, com vinte e nove detecções, produziu vinte e três.

Se sobrar fôlego, classificar manualmente uma amostra desses achados fora de escopo, dizendo se cada um é falha real ou não, transformaria uma limitação em resultado. É a única lacuna dos dados que ainda dá para fechar sem nova coleta.

---

## 4. A instabilidade é de localização, não de detecção

Estabilidade de trinta e sete por cento no Claude Code e trinta e um por cento no Cursor parece baixa, e à primeira vista sugere que os assistentes encontram coisas diferentes a cada execução.

O anexo do relatório desmonta essa leitura. Dos sete casos que o Claude Code perde ao exigir repetição idêntica nas três execuções, cinco foram detectados nas três, com diferença apenas de linha ou de código CWE. No Cursor, oito de doze.

Ou seja, o instrumento vê a mesma falha e a descreve de maneira diferente. O que oscila é o endereço e o rótulo, não a percepção.

Isso é um achado próprio, e nenhum dos trabalhos consultados o reporta, porque nenhum mede estabilidade. Ele também tem consequência prática direta: qualquer medição de assistente que dependa de correspondência exata de linha vai subestimar a capacidade do instrumento, e a diferença nesse caso é de treze pontos percentuais de revocação no Cursor, entre a união e o critério de achado idêntico.

---

## 5. Ferramentas se complementam, assistentes se repetem

O índice de Jaccard entre Claude Code e Cursor é 0,966. Dois fornecedores diferentes, dois modelos diferentes, praticamente o mesmo conjunto de casos detectados.

Entre as ferramentas, o quadro é oposto. Semgrep e CodeQL têm 0,071. njsscan e CodeQL, 0,067. Elas quase não se sobrepõem.

A consequência é contraintuitiva e vale um parágrafo próprio. Combinar ferramentas determinísticas compensa, porque cada uma enxerga um pedaço diferente do problema, e é isso que leva a união das quatro a 56,7 por cento contra 36,7 da melhor isolada. Combinar assistentes praticamente não compensa, porque o segundo acrescenta quase nada ao primeiro.

Isso também reforça o argumento central do trabalho por um caminho inesperado. Se o modelo fosse o fator determinante, dois modelos de fornecedores distintos deveriam divergir mais. A convergência quase total sugere que o que define o comportamento é a classe de instrumento, e não o modelo específico que a sustenta.

---

## 6. A recusa do Antigravity, com três redações diferentes

As três execuções recusaram, e o tempo de deliberação variou: dois, onze e sete segundos. As redações diferem entre si, e a terceira é a mais explícita, afirmando não ter permissão para realizar análises de segurança ou varreduras de vulnerabilidade em bases de código.

Três observações a extrair.

A recusa foi perfeitamente estável, três de três, o que é uma consistência maior do que a de qualquer detecção observada no estudo.

Nenhuma das três abriu arquivo algum. A decisão foi tomada sobre o texto da instrução, e não sobre o conteúdo do código.

A redação da terceira execução descreve uma restrição de política do produto, e não uma limitação de capacidade. O modelo por baixo é o mesmo Gemini 3.1 Pro que, por outras vias de acesso, executa análise de segurança sem dificuldade. Isso isola a camada de produto como causa, que é exatamente a tese do trabalho aparecendo no dado mais limpo possível.

Cuidado de redação: o artigo deve descrever o comportamento observado e sua data, sem afirmar por que a política existe nem generalizar para versões futuras.

---

## 7. O caso que ninguém detectou, e o quase-acerto

O caso de componente de terceiros sem manutenção não foi detectado por instrumento algum. Mas há uma sutileza que o relatório registra e que o artigo precisa carregar.

O Semgrep emitiu, na linha exata do caso, uma regra sobre uso de biblioteca depreciada. Essa regra não tem CWE próprio nem entrada na tabela de tradução, e por isso a regra de correspondência a classificou como não mapeada, não como acerto.

A leitura honesta é que o instrumento produziu um sinal relevante no lugar certo, e o método de pontuação, ancorado em CWE, não teve como reconhecê-lo. Isso é uma limitação do desenho de medição, não uma falha do Semgrep, e admiti-la fortalece o trabalho em vez de enfraquecê-lo.

---

## 8. Consistência externa

A união das quatro ferramentas alcançou 56,7 por cento dos casos. Charoenwet et al. (2024), analisando vulnerabilidades reais em projetos de produção, encontraram cinquenta e dois por cento para uma ferramenta isolada e setenta e oito por cento para a combinação de cinco.

A ordem de grandeza bate, com quatro ferramentas em vez de cinco e sobre corpo sintético. Vale citar essa aproximação na análise, porque ela funciona como aferição externa do artefato: se o resultado das ferramentas destoasse muito da literatura, a suspeita recairia sobre o corpus, e não sobre elas.

---

## 9. Três pendências antes de escrever a análise

**O ESLint não analisou o corpus.** Os setenta e cinco achados são erros de análise sintática, sem regra e sem CWE, e nenhuma regra do plugin de segurança chegou a ser acionada. Reportar zero de trinta como resultado de detecção seria falso: o instrumento não leu o código. A causa quase certa é ausência do analisador de TypeScript na configuração dedicada.

Há duas saídas honestas. Corrigir a configuração, reexecutar apenas o ESLint e reportar as duas execuções lado a lado, a que falhou e a corrigida, com registro datado do desvio. Ou manter como está e reportar o instrumento como não executável em configuração padrão sobre TypeScript, excluindo-o do quadro comparativo de detecção.

Prefiro a primeira, com divulgação completa. A segunda também é defensável, mas perde um ponto de comparação.

**O `verify` não passa.** Um teste de fumaça pede um arquivo que a semente não cria mais. É defeito do teste, não do artefato, e não afeta os resultados. Mas o artigo afirma que o artefato tem verificação automatizada, e essa afirmação precisa ser verdadeira no commit que for publicado. Também vale registrar por que ele passava antes: sobra de arquivo não versionado em máquina antiga, o que é uma lição de reprodutibilidade que cabe em uma frase.

**A versão do Antigravity está errada no registro.** As três sessões declaram 1.1.5, mas a saída bruta das execuções 2 e 3 mostra 1.2.0. O produto atualizou no meio da coleta. A saída bruta é a fonte autoritativa e o registro precisa ser corrigido. É exatamente a deriva que motivou pedir a versão a cada execução, e ela aconteceu.

---

## 10. O que os dados ainda permitem sem nova coleta

Classificar manualmente uma amostra dos achados fora de escopo, para dizer que proporção deles é falha legítima. É o item de maior retorno.

Comparar o tempo de execução: as ferramentas terminaram entre oito e duzentos e quarenta e oito segundos, e os assistentes trabalharam em faixa de minutos. Sustenta uma afirmação de ordem de grandeza sobre custo operacional.

Analisar o conteúdo do campo de justificativa dos achados dos assistentes, que é material qualitativo que ferramenta determinística não produz e que nenhum trabalho consultado explora.

Verificar se as três detecções que o Claude Code perdeu entre execuções se concentram em alguma categoria, o que diria se a instabilidade é uniforme ou localizada.
