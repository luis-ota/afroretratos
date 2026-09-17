#!/bin/sh
# Regenera a allowlist do Cloudflare para o nginx.
# Roda como root. Sugestao de cron semanal:
#   0 4 * * 1 /usr/local/bin/refresh-cloudflare-ips.sh >> /var/log/cloudflare-ips.log 2>&1
set -eu

TARGET=/etc/nginx/cloudflare-ips.conf
TMP="$(mktemp)"

for ip in $(curl -fsS https://www.cloudflare.com/ips-v4) $(curl -fsS https://www.cloudflare.com/ips-v6); do
  echo "set_real_ip_from $ip;" >> "$TMP"
  echo "allow $ip;" >> "$TMP"
done

if ! grep -q "set_real_ip_from" "$TMP"; then
  echo "lista vazia, abortando" >&2
  rm -f "$TMP"
  exit 1
fi

install -m 644 -o root -g root "$TMP" "$TARGET"
rm -f "$TMP"

if nginx -t >/dev/null 2>&1; then
  systemctl reload nginx
  COUNT=$(grep -c allow "$TARGET")
  echo "allowlist atualizada: $COUNT redes"
else
  echo "nginx -t falhou, config nao recarregada" >&2
  exit 1
fi
