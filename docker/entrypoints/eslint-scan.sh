#!/bin/sh
set -eu
export PATH="/project/node_modules/.bin:${PATH}"
export SCAN_ROOT=.
cd /work
set +e
eslint -c /project/scripts/eslint.corpus.config.mjs -f json . > /out/result.json
code=$?
set -e
exit $code
