# Runbook das sessões dos assistentes

Nove sessões: três com Claude Code em Opus, três com Cursor em Grok e três com Google Antigravity.

Cada sessão usa uma branch de medição própria, `snapshot/01` até `snapshot/09`. O mapeamento entre número e produto está em `docs/metodologia.md`, na branch principal. Consulte lá antes de começar, e mantenha o mapa fora das pastas de trabalho.

---

## Para cada sessão

### 1. Clonar

Substitua o número, a URL e o nome da pasta.

```
git clone --single-branch --branch snapshot/01 --depth 1 git@github.com:<usuario>/secbench-ts.git run01
cd run01
```

As duas opções não são opcionais. Sem `--single-branch` e sem `--depth 1`, o clone traz o restante do repositório, e o assistente alcança o gabarito pelo banco de objetos mesmo com a pasta aparentando estar limpa. Clone feito de outro jeito invalida a sessão.

### 2. Conferir antes de abrir o assistente

Três comandos, dentro da pasta clonada.

```
git log --oneline --all
git branch -a
ls
```

O primeiro deve mostrar exatamente um commit. O segundo deve mostrar apenas a branch clonada. O terceiro deve mostrar um projeto comum, com o código na raiz, `package.json` e `tsconfig.json`.

Se aparecer mais de um commit, outra branch, ou qualquer sinal de `src`, `tests`, `docs`, `tools`, `scripts`, gabarito ou catálogo, pare. A branch está contaminada e precisa ser refeita antes de qualquer sessão.

### 3. Rodar

Abra o assistente tendo a pasta clonada como diretório de trabalho.

Sessão nova. Sem histórico, sem continuação de conversa. Se o produto tiver memória persistente entre sessões, desligue antes.

Cole a instrução da seção seguinte, exatamente como está, e não escreva mais nada.

Não intervenha. Não corrija rumo, não peça para continuar, não peça mais detalhe, não responda pergunta. A instrução proíbe o assistente de perguntar, mas se ele perguntar mesmo assim, encerre, anote e refaça em clone novo de uma branch ainda não usada.

Anote o horário de início e de fim.

### 4. Encerrar e registrar

Encerre a sessão do assistente antes de mexer em git. Não peça para ele commitar: isso é interação com a sessão, e a regra é não interagir.

Confirme que `auditoria.json` está na raiz. Se o assistente devolveu o resultado só na conversa, salve a resposta como está, mesmo malformada, com o mesmo nome de arquivo, e anote que a gravação não ocorreu.

Crie ao lado um `execucao.json` com produto, versão, modelo, data e hora de início, duração, número da branch e qualquer anormalidade. Como a sessão já terminou, esse arquivo não contamina nada.

Depois:

```
git add auditoria.json execucao.json
git commit -m "auditoria"
git push
```

Não edite o conteúdo de `auditoria.json`. Nem para arrumar JSON quebrado, nem para tirar achado que você julgue errado. A avaliação é do script de pontuação, não sua.

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

## O que invalida uma sessão

O clone foi feito sem `--single-branch` e `--depth 1`.

O assistente alterou algum arquivo do código.

O assistente executou comandos.

Você respondeu alguma pergunta ou deu qualquer orientação além da instrução.

Nesses casos, anote o ocorrido, descarte a pasta e refaça em branch ainda não usada. Se as nove acabarem, o agente cria branches adicionais com a numeração seguinte.

Cobertura parcial é caso à parte e não invalida. Se o `filesExamined` declarado for bem menor que o número de arquivos e o assistente tiver parado sozinho, a sessão vale, porque cobertura parcial declarada é dado previsto no protocolo. Só precisa estar anotada com destaque no `execucao.json`.

---

## Ordem

Faça as três execuções de um produto antes de passar ao próximo, para reduzir troca de ferramenta e erro de anotação. A ordem entre produtos não importa, já que as branches são idênticas e as sessões são independentes.

O Claude Code roda na outra máquina. Nada muda no procedimento: mesmo comando de clone, mesma conferência, mesma instrução.

---

## Ao terminar as nove

Confirme que as nove branches receberam commit com `auditoria.json` e `execucao.json`, e que todas foram empurradas.

Me avise. O agente então recolhe branch a branch para a principal, e depois roda normalização e pontuação.
