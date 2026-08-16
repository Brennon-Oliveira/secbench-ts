#!/usr/bin/env bash
#
# setup-mutagen-wsl.sh
#
# Espelha uma pasta do WSL (ext4, rapido) para uma pasta do Windows que o
# Claude Cowork consegue conectar. O mutagen roda inteiro dentro do WSL:
# os dois lados sao caminhos locais para ele (/home/... e /mnt/c/...),
# entao nada passa por UNC nem por \\wsl.localhost.
#
# Uso:
#   ./setup-mutagen-wsl.sh                 # usa a pasta atual
#   ./setup-mutagen-wsl.sh ~/meu-projeto   # usa a pasta indicada
#
# Variaveis opcionais:
#   WIN_USER=brenn   ESPELHO=/mnt/c/Users/brenn/mutagen/projeto
#
set -euo pipefail

msg() { printf '\033[1;34m::\033[0m %s\n' "$*"; }
err() { printf '\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------- checagens

grep -qi microsoft /proc/version 2>/dev/null || err "Isto precisa rodar dentro do WSL."
command -v curl >/dev/null || err "curl nao encontrado. Instale com: sudo apt install curl"

PROJETO="${1:-$PWD}"
[ -d "$PROJETO" ] || err "Pasta nao encontrada: $PROJETO"
PROJETO="$(cd "$PROJETO" && pwd -P)"
NOME="$(basename "$PROJETO")"

case "$PROJETO" in
  /mnt/*)
    err "Essa pasta ja esta no disco do Windows ($PROJETO). Nao precisa de sync: conecte ela direto no Cowork."
    ;;
esac

# nome de sessao valido para o mutagen: minusculas, digitos e hifen
SESSAO="$(printf '%s' "$NOME" \
  | tr '[:upper:]' '[:lower:]' \
  | tr -c 'a-z0-9-' '-' \
  | sed 's/--*/-/g; s/^-//; s/-$//')"
[ -n "$SESSAO" ] || SESSAO="projeto"

if [ -z "${WIN_USER:-}" ]; then
  WIN_USER="$(cd /mnt/c 2>/dev/null && cmd.exe /c 'echo %USERNAME%' 2>/dev/null | tr -d '\r\n' || true)"
fi
[ -n "${WIN_USER:-}" ] || err "Nao consegui descobrir seu usuario do Windows. Rode de novo com: WIN_USER=seu-usuario $0 $PROJETO"

RAIZ="/mnt/c/Users/$WIN_USER/mutagen"
ESPELHO="${ESPELHO:-$RAIZ/$NOME}"
CONFDIR="$HOME/.cowork-sync/$SESSAO"

msg "Projeto (ext4):  $PROJETO"
msg "Espelho (NTFS):  $ESPELHO"

# ------------------------------------------------------------- instalacao

if ! command -v mutagen >/dev/null 2>&1; then
  msg "Instalando o mutagen..."
  case "$(uname -m)" in
    x86_64)        MARCH=amd64 ;;
    aarch64|arm64) MARCH=arm64 ;;
    *) err "Arquitetura nao suportada: $(uname -m)" ;;
  esac

  VER="$(curl -fsSL https://api.github.com/repos/mutagen-io/mutagen/releases/latest 2>/dev/null \
        | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1 || true)"
  [ -n "$VER" ] || VER="v0.18.1"
  msg "Versao: $VER ($MARCH)"

  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  curl -fsSL -o "$TMP/mutagen.tar.gz" \
    "https://github.com/mutagen-io/mutagen/releases/download/${VER}/mutagen_linux_${MARCH}_${VER}.tar.gz" \
    || err "Falha ao baixar o mutagen ${VER}."
  # o tarball traz o binario 'mutagen' e o 'mutagen-agents.tar.gz'; os dois
  # precisam ficar no mesmo diretorio
  sudo tar -xzf "$TMP/mutagen.tar.gz" -C /usr/local/bin
  sudo chmod +x /usr/local/bin/mutagen
else
  msg "mutagen ja instalado: $(mutagen version 2>/dev/null || echo '?')"
fi

# ------------------------------------------------------------ configuracao

mkdir -p "$ESPELHO" "$CONFDIR"

cat > "$CONFDIR/mutagen.yml" <<YAML
# Gerado por setup-mutagen-wsl.sh
# Espelha $PROJETO  <->  $ESPELHO

sync:
  defaults:
    # Bidirecional. Conflito nao sobrescreve nada: o mutagen para a
    # propagacao daquele arquivo e reporta em 'mutagen sync list'.
    mode: two-way-safe

    ignore:
      # nao sincroniza .git / .svn (evita briga de index e lock)
      vcs: true
      paths:
        - node_modules/
        - .venv/
        - venv/
        - __pycache__/
        - .pytest_cache/
        - .mypy_cache/
        - .ruff_cache/
        - .tox/
        - target/
        - dist/
        - build/
        - .next/
        - .nuxt/
        - .turbo/
        - .gradle/
        - .idea/
        - "*.pyc"
        - "*.log"
        - "*.swp"
        - .DS_Store
        - Thumbs.db

    permissions:
      # NTFS nao guarda modo POSIX. Sem isto o mutagen assume 0600/0700
      # e todo arquivo que volta do lado Windows perde permissao.
      defaultFileMode: 0644
      defaultDirectoryMode: 0755

  cowork:
    alpha: "$PROJETO"
    beta: "$ESPELHO"
    flushOnCreate: true
    configurationBeta:
      watch:
        # inotify nao enxerga escrita feita por processo do Windows em
        # /mnt/c. Sem force-poll, o que o Cowork editar nunca volta.
        mode: force-poll
        pollingInterval: 5
YAML

msg "Config em $CONFDIR/mutagen.yml"

# --------------------------------------------------------------- subir

cd "$CONFDIR"
mutagen daemon start >/dev/null 2>&1 || true
mutagen project terminate >/dev/null 2>&1 || true
mutagen project start

# daemon volta sozinho a cada shell novo (as sessoes sao persistentes e
# retomam junto)
LINHA='command -v mutagen >/dev/null 2>&1 && mutagen daemon start >/dev/null 2>&1'
if ! grep -qF "$LINHA" "$HOME/.bashrc" 2>/dev/null; then
  printf '\n# Cowork sync (mutagen)\n%s\n' "$LINHA" >> "$HOME/.bashrc"
  msg "Autostart do daemon adicionado ao ~/.bashrc"
fi

WINPATH="$(wslpath -w "$ESPELHO" 2>/dev/null || echo "$ESPELHO")"
WINRAIZ="$(wslpath -w "$RAIZ" 2>/dev/null || echo "$RAIZ")"

cat <<FIM

--------------------------------------------------------------------
Sync no ar.

No Claude, abra Cowork > Add folder. Conecte a raiz uma vez so:

    $WINRAIZ

Todo projeto que voce espelhar depois aparece dentro dela, sem
precisar conectar de novo. Se preferir isolar este projeto:

    $WINPATH

Comandos do dia a dia (de qualquer lugar):

    mutagen sync list        # status, nome da sessao e conflitos
    mutagen sync monitor     # acompanha ao vivo
    mutagen sync flush       # forca um ciclo agora

Para desligar:

    cd $CONFDIR && mutagen project terminate
--------------------------------------------------------------------
FIM