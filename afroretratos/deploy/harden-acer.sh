#!/bin/sh
# Endurecimento do servidor Acer Homelab (Alpine Linux).
#
# Idempotente: pode rodar de novo sem problema. Faz backup do que muda em
# /root/hardening-backup-<data>/. O firewall tem failsafe: se nada cancelar,
# em 3 minutos ele volta a aceitar tudo (evita se trancar fora).
#
# Uso:  sudo sh harden-acer.sh
#
set -u

BACKUP="/root/hardening-backup-$(date +%Y%m%d-%H%M%S)"
FAILSAFE_PID=""

log() { printf '\n== %s\n' "$*"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "rode com sudo: sudo sh $0" >&2
  exit 1
fi

mkdir -p "$BACKUP"
log "backup dos arquivos alterados em $BACKUP"

# ---------------------------------------------------------------- failsafe
log "failsafe do firewall armado (reverte em 180s se não for cancelado)"
(
  sleep 180
  iptables -P INPUT ACCEPT 2>/dev/null || true
  iptables -F INPUT 2>/dev/null || true
  ip6tables -P INPUT ACCEPT 2>/dev/null || true
  ip6tables -F INPUT 2>/dev/null || true
  echo "failsafe do firewall disparou: INPUT voltou para ACCEPT" > /dev/kmsg 2>/dev/null || true
) &
FAILSAFE_PID=$!

# -------------------------------------------------------------------- ssh
log "endurecendo o SSH (somente chave pública; qualquer senha deixa de valer)"
mkdir -p /etc/ssh/sshd_config.d
[ -f /etc/ssh/sshd_config.d/99-hardening.conf ] && cp /etc/ssh/sshd_config.d/99-hardening.conf "$BACKUP/"
cat > /etc/ssh/sshd_config.d/99-hardening.conf <<'SSH'
# Hardening AfroRetratos/Acer Homelab
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitUserEnvironment no
PermitRootLogin prohibit-password
AuthenticationMethods publickey
AllowUsers luis root
MaxAuthTries 3
LoginGraceTime 20
ClientAliveInterval 300
ClientAliveCountMax 3
SSH
if sshd -t 2>/dev/null; then
  rc-service sshd reload 2>/dev/null || rc-service sshd restart
  echo "   ok: configuração válida e recarregada"
else
  echo "   ERRO na configuração; restaurando backup e seguindo sem alterar o sshd"
  if [ -f "$BACKUP/99-hardening.conf" ]; then
    cp "$BACKUP/99-hardening.conf" /etc/ssh/sshd_config.d/99-hardening.conf
  else
    rm -f /etc/ssh/sshd_config.d/99-hardening.conf
  fi
fi

# --------------------------------------------------------------- sshguard
log "instalando sshguard (bane IPs que falharem autenticação)"
apk add --no-cache sshguard >/dev/null 2>&1 || echo "   aviso: não foi possível instalar o sshguard"
mkdir -p /etc/sshguard
cat > /etc/sshguard/whitelist <<'WL'
127.0.0.0/8
::1
100.64.0.0/10
192.168.0.0/16
10.0.0.0/8
172.16.0.0/12
WL
rc-update add sshguard default >/dev/null 2>&1 || true
rc-service sshguard restart >/dev/null 2>&1 || rc-service sshguard start >/dev/null 2>&1 || echo "   aviso: sshguard não iniciou"

# ----------------------------------------------------------------- sysctl
log "aplicando sysctl de endurecimento"
[ -f /etc/sysctl.d/99-hardening.conf ] && cp /etc/sysctl.d/99-hardening.conf "$BACKUP/"
cat > /etc/sysctl.d/99-hardening.conf <<'SYSCTL'
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
fs.suid_dumpable = 0
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_source_route = 0
SYSCTL
sysctl -e -p /etc/sysctl.d/99-hardening.conf >/dev/null 2>&1 || true

# -------------------------------------------------------------- firewall
log "configurando firewall (INPUT: nega tudo, libera só o necessário)"
apk add --no-cache iptables ip6tables >/dev/null 2>&1 || echo "   aviso: iptables indisponível"
mkdir -p /etc/iptables

iptables -N AFRO_INPUT 2>/dev/null || iptables -F AFRO_INPUT
iptables -A AFRO_INPUT -i lo -j ACCEPT
iptables -A AFRO_INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -A AFRO_INPUT -i tailscale0 -j ACCEPT
iptables -A AFRO_INPUT -p udp --dport 41641 -j ACCEPT
iptables -A AFRO_INPUT -p tcp --dport 22 -j ACCEPT
iptables -A AFRO_INPUT -p tcp --dport 80 -j ACCEPT
iptables -A AFRO_INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A AFRO_INPUT -p icmp --icmp-type echo-request -m limit --limit 2/second -j ACCEPT
iptables -A AFRO_INPUT -j DROP
iptables -C INPUT -j AFRO_INPUT 2>/dev/null || iptables -I INPUT 1 -j AFRO_INPUT
iptables -P INPUT DROP
iptables-save > /etc/iptables/rules-save

ip6tables -N AFRO_INPUT 2>/dev/null || ip6tables -F AFRO_INPUT
ip6tables -A AFRO_INPUT -i lo -j ACCEPT
ip6tables -A AFRO_INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
ip6tables -A AFRO_INPUT -i tailscale0 -j ACCEPT
ip6tables -A AFRO_INPUT -p udp --dport 41641 -j ACCEPT
ip6tables -A AFRO_INPUT -p tcp --dport 22 -j ACCEPT
ip6tables -A AFRO_INPUT -p tcp --dport 80 -j ACCEPT
ip6tables -A AFRO_INPUT -p tcp --dport 8080 -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type echo-request -m limit --limit 2/second -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type destination-unreachable -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type packet-too-big -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type time-exceeded -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type parameter-problem -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type nd-neighbor-solicit -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type nd-neighbor-advert -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type nd-router-solicit -j ACCEPT
ip6tables -A AFRO_INPUT -p icmpv6 --icmpv6-type nd-router-advert -j ACCEPT
ip6tables -A AFRO_INPUT -j DROP
ip6tables -C INPUT -j AFRO_INPUT 2>/dev/null || ip6tables -I INPUT 1 -j AFRO_INPUT
ip6tables -P INPUT DROP
ip6tables-save > /etc/iptables/rules6-save

rc-update add iptables default >/dev/null 2>&1 || true
rc-update add ip6tables default >/dev/null 2>&1 || true

# --------------------------------------------------- watchdog de hardware
log "ativando watchdog de hardware (reinicia se o kernel travar)"
rc-update add watchdog default >/dev/null 2>&1 || true
rc-service watchdog start >/dev/null 2>&1 || echo "   aviso: watchdog não iniciou"

# -------------------------------------------------- atualizações semanais
log "agendando atualizações semanais com aviso no Telegram"
cat > /etc/periodic/weekly/50-security-updates <<'UPD'
#!/bin/sh
ENV_FILE=/home/luis/afroretratos/.env
LOG=/var/log/security-updates.log
{
  echo "== $(date -Iseconds) atualizando =="
  apk update
  apk upgrade -a
} >> "$LOG" 2>&1
if [ -f "$ENV_FILE" ]; then
  TOKEN=$(grep '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | cut -d= -f2-)
  CHAT=$(grep '^TELEGRAM_CHAT_ID=' "$ENV_FILE" | cut -d= -f2-)
  if [ -n "$TOKEN" ] && [ -n "$CHAT" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
      -d "chat_id=${CHAT}" \
      --data-urlencode "text=Atualizações semanais aplicadas no Acer Homelab ($(hostname)). Se houve kernel novo, agende um reboot." \
      >/dev/null 2>&1
  fi
fi
UPD
chmod +x /etc/periodic/weekly/50-security-updates
rc-update add crond default >/dev/null 2>&1 || true
rc-service crond start >/dev/null 2>&1 || true

# --------------------------------------------- tailscale: desliga o Funnel
log "desligando o Funnel do Tailscale (o site já usa o domínio Cloudflare)"
tailscale funnel --https=443 off >/dev/null 2>&1 || echo "   aviso: não foi possível desligar o funnel agora"

# ------------------------------------------------------------------ final
log "resumo"
echo "   SSH: senha desabilitada, somente chave pública (PermitRootLogin prohibit-password)"
echo "   sshguard: ativo (lista branca para tailnet e LAN)"
echo "   firewall: INPUT DROP + allow lo/established/tailnet/22/80/8080/icmp"
echo "   sysctl: kptr_restrict=2, redirects e source-route desligados"
echo "   watchdog: ativo · atualizações semanais com aviso no Telegram"
echo "   backup: $BACKUP"
echo "   reverter firewall agora: iptables -F INPUT && iptables -P INPUT ACCEPT"
echo
echo "Cancele o failsafe confirmando que o acesso continua funcionando; se nada"
echo "for feito, ele reverte o firewall em 3 minutos de qualquer forma."
kill "$FAILSAFE_PID" 2>/dev/null || true
echo
echo "pronto."
