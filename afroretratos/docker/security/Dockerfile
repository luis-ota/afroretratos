# Vigia de seguranca: somente leitura dos logs do host + alertas no Telegram.
FROM python:3.12-alpine

WORKDIR /app
COPY watch.py /app/watch.py

ENV TZ=America/Sao_Paulo \
    PYTHONUNBUFFERED=1

# Precisa rodar como root apenas para ler /var/log/messages (640 root:wheel).
CMD ["python3", "-u", "/app/watch.py"]
