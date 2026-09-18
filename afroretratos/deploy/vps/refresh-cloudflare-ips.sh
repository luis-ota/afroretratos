#!/bin/sh
# Regenera as listas do Cloudflare para o nginx:
#   /etc/nginx/cloudflare-ips.conf -> set_real_ip_from (resolve o IP real)
#   /etc/nginx/cloudflare-geo.conf -> geo por $realip_remote_addr (allowlist)
#
# A allowlist precisa olhar $realip_remote_addr (o IP que conectou de verdade,
# o do Cloudflare) e nao $remote_addr, que ja foi reescrito para o visitante.
# Sem isso, allow/deny compara o IP do visitante com a faixa do Cloudflare e
# nega todo mundo.
#
# Roda como root. Sugestao de cron semanal:
#   0 4 * * 1 /usr/local/bin/refresh-cloudflare-ips.sh >> /var/log/cloudflare-ips.log 2>&1
set -eu

IPS=/etc/nginx/cloudflare-ips.conf
GEO=/etc/nginx/cloudflare-geo.conf
TMP_IPS="$(mktemp)"
TMP_GEO="$(mktemp)"

V4=$(curl -fsS https://www.cloudflare.com/ips-v4)
V6=$(curl -fsS https://www.cloudflare.com/ips-v6)

{
  echo "# gerado por refresh-cloudflare-ips.sh"
  for ip in $V4 $V6; do echo "set_real_ip_from $ip;"; done
} > "$TMP_IPS"

{
  echo "# gerado por refresh-cloudflare-ips.sh"
  echo "geo \$realip_remote_addr \$afro_from_cloudflare {"
  echo "    default 0;"
  for ip in $V4 $V6; do echo "    $ip 1;"; done
  echo "}"
} > "$TMP_GEO"

if ! grep -q "set_real_ip_from" "$TMP_IPS"; then
  echo "lista vazia, abortando" >&2
  rm -f "$TMP_IPS" "$TMP_GEO"
  exit 1
fi

install -m 644 -o root -g root "$TMP_IPS" "$IPS"
install -m 644 -o root -g root "$TMP_GEO" "$GEO"
rm -f "$TMP_IPS" "$TMP_GEO"

if nginx -t >/dev/null 2>&1; then
  systemctl reload nginx
  COUNT=$(grep -c set_real_ip_from "$IPS")
  echo "listas atualizadas: $COUNT redes"
else
  echo "nginx -t falhou, config nao recarregada" >&2
  exit 1
fi
