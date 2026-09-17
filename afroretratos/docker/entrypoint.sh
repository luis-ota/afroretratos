#!/bin/sh
set -e

# Aplica migrations pendentes antes de subir o servidor.
node tools/migrate.mjs

exec node server.js
