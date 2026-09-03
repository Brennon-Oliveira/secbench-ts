#!/bin/sh
set -eu
semgrep scan \
  --config /rules/javascript \
  --config /rules/typescript \
  --json \
  --metrics=off \
  --output /out/result.json \
  /work
