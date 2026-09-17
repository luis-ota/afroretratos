#!/bin/sh
# Mantem o compute do Neon acordado na janela de maior trafego, para o primeiro
# visitante nao pagar o cold start do scale-to-zero (algumas centenas de ms).
#
# Neon Free: 100 CU-hours por projeto por mes e o compute tem 0.25 CU.
#   sempre ligado  -> 0.25 * 24h * 30d = 180 CU-h (estoura a cota)
#   janela de 12h  -> 0.25 * 12h * 30d =  90 CU-h (sobra folga pro trafego real)
#
# Cron sugerido (a cada 4 minutos entre 11h e 22h):
#   */4 11-22 * * * /home/ubuntu/afroretratos/keepalive.sh >> /home/ubuntu/afroretratos/keepalive.log 2>&1
set -eu

# /api/posts faz uma consulta real no Postgres (acorda o compute) e nao passa
# pelo rate limit do Redis. /api/health nao serve aqui: ele nao toca o banco.
curl -fsS -m 10 -o /dev/null "http://127.0.0.1:3100/api/posts?limit=1"
