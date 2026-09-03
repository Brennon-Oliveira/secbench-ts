#!/bin/sh
set -eu
cd /project
npm ci --ignore-scripts
exit 0
