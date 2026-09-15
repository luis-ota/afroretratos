#!/usr/bin/env python3
"""Vigia de seguranca do servidor.

Le os logs do host (montados em /host/log) e avisa no Telegram sobre:
- forca bruta de SSH (varias falhas do mesmo IP em uma janela);
- pressao de disco, memoria e carga do host;
- resumo diario com o que aconteceu.

Nao bloqueia nada nem altera o host: e somente leitura + notificacao.
"""

import os
import re
import shutil
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

TZ = ZoneInfo(os.environ.get("TZ", "America/Sao_Paulo"))

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "").strip()

LOG_PATHS = [
    Path(item.strip())
    for item in os.environ.get(
        "WATCH_LOGS", "/host/log/messages,/host/log/auth.log"
    ).split(",")
    if item.strip()
]
SSH_THRESHOLD = int(os.environ.get("SSH_THRESHOLD", "5"))
SSH_WINDOW = int(os.environ.get("SSH_WINDOW_MINUTES", "10")) * 60
ALERT_COOLDOWN = int(os.environ.get("ALERT_COOLDOWN_MINUTES", "360")) * 60
HOST_CHECK_SECONDS = int(os.environ.get("HOST_CHECK_SECONDS", "300"))
SUMMARY_HOUR = int(os.environ.get("SUMMARY_HOUR", "9"))
SUMMARY_MINUTE = int(os.environ.get("SUMMARY_MINUTE", "0"))
POLL_SECONDS = int(os.environ.get("POLL_SECONDS", "20"))
DISK_ALERT_PERCENT = float(os.environ.get("DISK_ALERT_PERCENT", "85"))
MEM_ALERT_MB = int(os.environ.get("MEM_ALERT_MB", "80"))
LOAD_ALERT = float(os.environ.get("LOAD_ALERT", "8"))

IP_RE = re.compile(r"from (\d{1,3}(?:\.\d{1,3}){3}|[0-9a-fA-F:]{4,})")
FAIL_RE = re.compile(
    r"Failed password|Invalid user|Failed publickey|authentication failure"
    r"|Connection closed by authenticating user|maximum authentication attempts"
    r"|Bad protocol version identification|Unable to negotiate"
)
ACCEPT_RE = re.compile(r"Accepted (publickey|password)")
USER_RE = re.compile(
    r"(?:Failed password for (?:invalid user )?|Invalid user )([A-Za-z0-9._-]{1,32})"
)


def now() -> datetime:
    return datetime.now(TZ)


def log(message: str) -> None:
    print(f"[watch] {now().strftime('%Y-%m-%d %H:%M:%S')} {message}", flush=True)


def send_telegram(text: str) -> bool:
    if not TOKEN or not CHAT_ID:
        log("Telegram nao configurado; alerta ficaria assim:\n" + text)
        return False
    body = urllib.parse.urlencode(
        {
            "chat_id": CHAT_ID,
            "text": text,
            "disable_web_page_preview": "true",
        }
    ).encode()
    request = urllib.request.Request(
        f"https://api.telegram.org/bot{TOKEN}/sendMessage", data=body
    )
    for attempt in range(2):
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                return response.status == 200
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            log(f"falha ao enviar telegram ({attempt + 1}/2): {error}")
            time.sleep(2)
    return False


class FileTail:
    """Le apenas o que for novo; na primeira leitura pula o historico."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.offset: int | None = None

    def read_new(self) -> list[str]:
        try:
            size = self.path.stat().st_size
        except FileNotFoundError:
            return []
        if self.offset is None or size < self.offset:
            self.offset = size
            return []
        try:
            with self.path.open("r", errors="replace") as handle:
                handle.seek(self.offset)
                data = handle.read()
                self.offset = handle.tell()
        except OSError:
            return []
        return data.splitlines()


def parse_line(line: str) -> tuple[str, str, str | None] | None:
    """Retorna (tipo, ip, usuario) quando a linha e relevante."""
    if not line:
        return None
    found = IP_RE.search(line)
    ip = found.group(1) if found else None
    user_match = USER_RE.search(line)
    user = user_match.group(1) if user_match else None
    if FAIL_RE.search(line):
        return ("auth_fail", ip or "desconhecido", user)
    if ACCEPT_RE.search(line):
        return ("auth_ok", ip or "desconhecido", user)
    return None


class Watch:
    def __init__(self) -> None:
        self.tails = [FileTail(path) for path in LOG_PATHS]
        self.failures: dict[str, list[float]] = {}
        self.usernames: dict[str, list[str]] = {}
        self.cooldowns: dict[str, tuple[float, int]] = {}
        self.alerts_sent = 0
        self.fails_24h = 0
        self.last_host_check = 0.0
        self.last_summary_date: str | None = None

    # ------------------------------------------------------------------ ssh
    def register(self, kind: str, ip: str, user: str | None = None) -> None:
        if kind == "auth_ok":
            return
        stamps = self.failures.setdefault(ip, [])
        stamps.append(time.time())
        self.fails_24h += 1
        if user:
            names = self.usernames.setdefault(ip, [])
            names.append(user)
            self.usernames[ip] = names[-8:]
        cutoff = time.time() - SSH_WINDOW
        recent = [stamp for stamp in stamps if stamp >= cutoff]
        self.failures[ip] = recent
        if len(recent) < SSH_THRESHOLD:
            return

        until, last_count = self.cooldowns.get(ip, (0.0, 0))
        if time.time() < until and len(recent) < max(last_count * 2, SSH_THRESHOLD):
            return

        self.cooldowns[ip] = (time.time() + ALERT_COOLDOWN, len(recent))
        names = list(dict.fromkeys(self.usernames.get(ip, [])))[:6]
        users_line = (
            f"Usuários tentados: {', '.join(names)}\n" if names else ""
        )
        self.alert(
            "Possível força bruta de SSH\n"
            f"IP: {ip}\n"
            f"Falhas: {len(recent)} em {SSH_WINDOW // 60} minutos\n"
            f"{users_line}"
            f"Total hoje: {self.fails_24h}\n\n"
            "Não bloqueamos automaticamente. Para banir: sshguard ou regra no "
            "roteador; e desabilite senha no SSH (apenas chave pública)."
        )

    def alert(self, text: str) -> None:
        header = "Alerta de segurança do servidor\n\n"
        if send_telegram(header + text):
            self.alerts_sent += 1
            log("alerta enviado ao Telegram")

    # ----------------------------------------------------------------- host
    def host_status(self) -> str:
        lines: list[str] = []
        try:
            usage = shutil.disk_usage("/host/root")
            percent = usage.used / usage.total * 100
            lines.append(
                f"Disco: {percent:.0f}% usado ({usage.used / 1e9:.1f} GiB de "
                f"{usage.total / 1e9:.1f} GiB)"
            )
            if percent >= DISK_ALERT_PERCENT:
                self.alert(
                    f"Disco do servidor em {percent:.0f}% de uso.\n\n{lines[-1]}"
                )
        except OSError:
            pass
        try:
            meminfo = Path("/host/proc/meminfo").read_text()
            available_kb = int(
                re.search(r"MemAvailable:\s+(\d+) kB", meminfo).group(1)
            )
            available_mb = available_kb // 1024
            lines.append(f"Memória livre: {available_mb} MB")
            if available_mb < MEM_ALERT_MB:
                self.alert(
                    f"Memória disponível baixa: {available_mb} MB no servidor."
                )
        except (OSError, AttributeError):
            pass
        try:
            load = float(Path("/host/proc/loadavg").read_text().split()[0])
            uptime_seconds = float(Path("/host/proc/uptime").read_text().split()[0])
            lines.append(
                f"Carga: {load:.2f} · ligado ha {uptime_seconds / 3600:.1f} h"
            )
            if load > LOAD_ALERT:
                self.alert(f"Carga alta no servidor: {load:.2f} (1 minuto).")
        except (OSError, ValueError):
            pass
        return "\n".join(lines)

    def maybe_summary(self) -> None:
        moment = now()
        today = moment.strftime("%Y-%m-%d")
        if (
            moment.hour == SUMMARY_HOUR
            and moment.minute >= SUMMARY_MINUTE
            and self.last_summary_date != today
        ):
            self.last_summary_date = today
            self.alert(
                "Resumo diário do AfroRetratos\n\n"
                f"Falhas de SSH nas últimas 24h: {self.fails_24h}\n"
                f"Alertas enviados: {self.alerts_sent}\n"
                f"{self.host_status()}"
            )
            self.fails_24h = 0

    # ----------------------------------------------------------------- loop
    def run(self) -> None:
        log(
            "vigia iniciado; arquivos: "
            + ", ".join(str(path) for path in LOG_PATHS)
            + ("; telegram configurado" if TOKEN and CHAT_ID else "; SEM telegram")
        )
        send_telegram(
            "Vigia de segurança iniciado no servidor AfroRetratos.\n"
            "Você receberá alertas de força bruta, disco, memória e carga, "
            "além de um resumo diário."
        )
        while True:
            for tail in self.tails:
                for line in tail.read_new():
                    parsed = parse_line(line)
                    if parsed:
                        self.register(*parsed)
            if time.time() - self.last_host_check >= HOST_CHECK_SECONDS:
                self.last_host_check = time.time()
                self.host_status()
            self.maybe_summary()
            time.sleep(POLL_SECONDS)


def self_test() -> None:
    samples = [
        "Sep 15 13:44:05 server auth.info sshd-session[1]: Accepted publickey for luis from 100.0.0.1 port 22 ssh2",
        "Sep 15 13:44:06 server auth.info sshd-session[2]: Failed password for invalid user admin from 203.0.113.9 port 40000 ssh2",
        "Sep 15 13:44:07 server auth.notice sshd-session[3]: Invalid user oracle from 203.0.113.9 port 40001",
        "Sep 15 13:44:08 server auth.info sshd-session[4]: Unable to negotiate with 203.0.113.9 port 40002: no matching key exchange method",
    ]
    for line in samples:
        print(parse_line(line))
    print("self-test ok")


if __name__ == "__main__":
    if "--self-test" in os.sys.argv:
        self_test()
    elif "--test-telegram" in os.sys.argv:
        ok = send_telegram("Teste do vigia de segurança do AfroRetratos.")
        print("telegram ok" if ok else "telegram indisponivel")
    else:
        Watch().run()
