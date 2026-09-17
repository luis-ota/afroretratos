#!/bin/sh
# Mantem o compute do Neon acordado na janela de maior trafego, para o primeiro
# visitante nao pagar o cold start do scale-to-zero (algumas centenas de ms).
#
# Neon Free: 100 CU-hours por projeto por mes e o compute tem 0.25 CU.
#   sempre ligado  -> 0.25 * 24h * 30d = 180 CU-h (estoura a cota)
#   janela de 12h  -> 0.25 * 12h * 30d =  90 CU-h (sobra folga pro trafego real)
#
# A janela fica aqui (e nao no agendador) para o timer poder rodar a cada
# 4 minutos o dia inteiro sem gastar cota fora de hora.
set -eu

# A VPS roda em UTC; a janela aqui e no horario de Sao Paulo.
HOUR=$(TZ=America/Sao_Paulo date +%H)
if [ "$HOUR" -lt 11 ] || [ "$HOUR" -gt 22 ]; then
  exit 0
fi

# /api/posts faz uma consulta real no Postgres (acorda o compute) e nao passa
# pelo rate limit do Redis. /api/health nao serve aqui: ele nao toca o banco.
curl -fsS -m 10 -o /dev/null "http://127.0.0.1:3100/api/posts?limit=1"
