#!/bin/sh
set -eu
# Named volume root may already exist; create database under a subdirectory.
rm -rf /db/workspace
mkdir -p /db/workspace
codeql database create /db/workspace --language=javascript --source-root=/work --overwrite
codeql database analyze /db/workspace \
  --format=sarif-latest \
  --output=/out/result.sarif \
  --sarif-add-snippets=false \
  codeql/javascript-queries:codeql-suites/javascript-security-extended.qls
