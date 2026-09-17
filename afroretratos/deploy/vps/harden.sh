#!/bin/sh
# Hardening da VPS do AfroRetratos (Oracle + Cloudflare proxied).
#
# Roda como root:  sudo sh harden.sh
#
# Cobre o que e do host: firewall, rpcbind sem uso, SSH, fail2ban e a
# persistencia das regras. O cache/ratelimit da aplicacao vive no nginx
# (nginx-limits.conf) e a protecao de borda no Cloudflare (plano gratuito).
#
# Existe um failsafe: se as regras de firewall derrubarem a conexao, elas
# voltam para ACCEPT em 180s. No fim do script o failsafe e cancelado.
set -u

if [ "$(id -u)" -ne 0 ]; then
  echo "rode com sudo" >&2
  exit 1
fi

BACKUP="/root/vps-hardening-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp /etc/iptables/rules.v4 "$BACKUP/" 2>/dev/null || true
cp /etc/iptables/rules.v6 "$BACKUP/" 2>/dev/null || true
cp -r /etc/ssh/sshd_config.d "$BACKUP/sshd_config.d" 2>/dev/null || true
echo "[backup] $BACKUP"

# --- failsafe ---------------------------------------------------------------
(
  sleep 180
  iptables -P INPUT ACCEPT
  iptables -F INPUT
  ip6tables -P INPUT ACCEPT
  ip6tables -F INPUT
  echo "[failsafe] firewall revertido para ACCEPT" >> /var/log/vps-hardening.log
) &
FAILSAFE_PID=$!
trap 'kill $FAILSAFE_PID 2>/dev/null || true' EXIT

# --- rpcbind (sem NFS montado, nao tem por que expor a 111) -----------------
if [ -z "$(mount | grep -i nfs)" ]; then
  systemctl disable --now rpcbind.socket rpcbind 2>/dev/null || true
  echo "[rpcbind] desabilitado"
else
  echo "[rpcbind] NFS em uso, mantido"
fi

# --- SSH --------------------------------------------------------------------
cat > /etc/ssh/sshd_config.d/99-hardening.conf <<'EOF'
MaxAuthTries 3
LoginGraceTime 20
ClientAliveInterval 300
ClientAliveCountMax 3
EOF
if sshd -t; then
  systemctl reload ssh
  echo "[ssh] drop-in aplicado"
else
  rm -f /etc/ssh/sshd_config.d/99-hardening.conf
  echo "[ssh] sshd -t falhou, drop-in removido" >&2
fi

# --- fail2ban ---------------------------------------------------------------
if ! command -v fail2ban-client >/dev/null 2>&1; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq fail2ban >/dev/null 2>&1 || true
fi

if command -v fail2ban-client >/dev/null 2>&1; then
  cat > /etc/fail2ban/jail.d/99-vps.conf <<'EOF'
[DEFAULT]
backend = systemd
bantime = 1h
findtime = 10m
maxretry = 4
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
EOF
  systemctl enable fail2ban >/dev/null 2>&1 || true
  systemctl restart fail2ban
  sleep 3
  echo "[fail2ban] $(fail2ban-client status sshd 2>/dev/null | grep -E 'Currently banned|Total banned' | tr -s ' ' | tr '\n' ' ')"
else
  echo "[fail2ban] nao instalado (apt indisponivel?)" >&2
fi

# --- firewall ---------------------------------------------------------------
iptables -F INPUT
iptables -P INPUT DROP
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 2/sec --limit-burst 4 -j ACCEPT
iptables -A INPUT -p icmp -j ACCEPT
iptables -A INPUT -j DROP

ip6tables -F INPUT
ip6tables -P INPUT DROP
ip6tables -A INPUT -i lo -j ACCEPT
ip6tables -A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
ip6tables -A INPUT -p tcp --dport 22 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 80 -j ACCEPT
ip6tables -A INPUT -p tcp --dport 443 -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp -j ACCEPT
ip6tables -A INPUT -j DROP

netfilter-persistent save >/dev/null
echo "[firewall] 22/80/443 liberados, resto DROP (persistido)"

# --- fim --------------------------------------------------------------------
kill $FAILSAFE_PID 2>/dev/null || true
trap - EXIT

echo
echo "Resumo:"
echo "  iptables INPUT: $(iptables -S INPUT | head -1)"
echo "  rpcbind: $(systemctl is-active rpcbind 2>&1)"
echo "  ssh MaxAuthTries: $(sshd -T 2>/dev/null | awk '/maxauthtries/{print $2}')"
echo "  fail2ban: $(systemctl is-active fail2ban 2>&1)"
echo
echo "Reverter o firewall: iptables -P INPUT ACCEPT && iptables -F INPUT"
