# AfroRetratos na VPS (Oracle + Cloudflare proxied)

Diferente do `docker-compose.server.yml` (homelab, com tunel e banco local),
aqui o Postgres fica no Neon e o Redis no Upstash. A VPS roda so aplicacao,
vigia, proxy e automacao.

## Servicos na VPS

- `app` em `127.0.0.1:3100`
- `security-watch` (alerta de SSH, disco, memoria e carga no Telegram)
- `nginx` (do host) proxying `afroretratos.wired.rs` para `127.0.0.1:3100`
- Certificado: `/etc/ssl/cert.pem` (Cloudflare Origin CA, cobre `*.wired.rs`)

## Docker rootless

O Docker desta VPS e rootless, entao **containers nao acessam
`/var/run/docker.sock`** e watchtower/autoheal nao funcionam. A atualizacao e a
recuperacao de container unhealthy rodam no host:

```sh
*/5 * * * * /home/ubuntu/afroretratos/update.sh >> /home/ubuntu/afroretratos/update.log 2>&1
```

## Neon e Upstash

- Neon na regiao `aws-sa-east-1`. A aplicacao usa a URL com `-pooler`; as
  migrations usam a direta (`DIRECT_DATABASE_URL`).
- Upstash na regiao `sa-east-1` (URL `rediss://`).
- O healthcheck da aplicacao bate em `/api/health`, que **nao toca no banco**.
  Foi de proposito: o probe roda a cada 30s e, batendo em `/api/posts`,
  acordaria o Neon 24/7 (180 CU-h/mes, acima dos 100 CU-h do plano free).
- Para nao ter cold start sem estourar a cota, o `keepalive.sh` acorda o
  compute a cada 4 minutos na janela de 11h a 22h (~90 CU-h/mes):

```sh
*/4 11-22 * * * /home/ubuntu/afroretratos/keepalive.sh >> /home/ubuntu/afroretratos/keepalive.log 2>&1
```

## Passo a passo

1. Criar o projeto no Neon (`aws-sa-east-1`) e o Redis no Upstash
   (`sa-east-1`).
2. Preencher `~/afroretratos/.env` (ver `.env.example`). Manter
   `ORIGIN_HASH_SECRET` e `ORIGIN_ENCRYPTION_KEY` iguais aos do servidor
   anterior, senao os e-mails criptografados e os hashes de IP mudam.
3. Restaurar o dump no Neon usando a URL direta:
   `psql "$DIRECT_DATABASE_URL" -f afroretratos-dump.sql`
4. `docker compose up -d` (o entrypoint aplica migrations pendentes).
5. Instalar os crons de `update.sh` e `keepalive.sh`.
6. nginx:
   - `sudo install -m 644 nginx-afroretratos.conf /etc/nginx/sites-available/afroretratos.wired.rs`
   - `sudo ln -sf /etc/nginx/sites-available/afroretratos.wired.rs /etc/nginx/sites-enabled/`
   - `sudo install -m 755 refresh-cloudflare-ips.sh /usr/local/bin/refresh-cloudflare-ips.sh`
   - `sudo /usr/local/bin/refresh-cloudflare-ips.sh`
   - `sudo nginx -t && sudo systemctl reload nginx`

   Sugestao de cron semanal para manter a allowlist do Cloudflare em dia:
   `0 4 * * 1 /usr/local/bin/refresh-cloudflare-ips.sh >> /var/log/cloudflare-ips.log 2>&1`
7. Cloudflare: apontar `afroretratos.wired.rs` para o IP da VPS (registro A,
   nuvem laranja). O tunel do homelab fica como rollback por alguns dias.
8. Verificar: `curl -sI https://afroretratos.wired.rs/feed`.
