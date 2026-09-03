#!/bin/sh
set -eu
export HOME=/tmp
mkdir -p /tmp/.semgrep /tmp/.cache
njsscan --json -o /out/result.json /work
