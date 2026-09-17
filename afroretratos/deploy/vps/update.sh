#!/bin/sh
# Atualiza os containers do AfroRetratos.
#
# O Docker desta VPS e rootless, entao container nenhum acessa
# /var/run/docker.sock e o watchtower nao funciona aqui. Este script roda no
# host, como o usuario dono do Docker, fazendo o mesmo papel.
#
# Cron sugerido (a cada 5 minutos):
#   */5 * * * * /home/ubuntu/afroretratos/update.sh >> /home/ubuntu/afroretratos/update.log 2>&1
set -eu

cd "$(dirname "$0")"

LOCK=/tmp/afroretratos-update.lock
exec 9>"$LOCK"
flock -n 9 || exit 0

docker compose pull -q app security-watch
docker compose up -d --remove-orphans app security-watch

# restart: always so cobre processo que morreu; aqui tratamos container que
# segue de pe mas ficou unhealthy.
docker compose ps --format "{{.Name}} {{.Status}}" \
  | grep -i "unhealthy" \
  | cut -d" " -f1 \
  | while read -r name; do
      echo "[autoheal] reiniciando $name"
      docker restart "$name" >/dev/null
    done
