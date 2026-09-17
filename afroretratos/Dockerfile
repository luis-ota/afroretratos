# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Ferramentas de migração/seed rodam fora do bundle do Next; precisam do
# cliente postgres resolvível por conta própria.
FROM alpine:3.22 AS tools
WORKDIR /tools
RUN apk add --no-cache nodejs npm && npm install --no-fund --no-audit postgres@3.4.9

# Node do Alpine (compilado para x86-64 baseline) + ICU completo: os binários
# oficiais do Node exigem x86-64-v2 (SSE4.2/POPCNT) e morrem com SIGILL em
# CPUs antigas como o Celeron deste servidor. icu-data-full mantém pt-BR.
FROM alpine:3.22 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN apk add --no-cache nodejs icu-data-full \
    && addgroup -S nodejs -g 1001 \
    && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=tools --chown=nextjs:nodejs /tools/node_modules ./tools/node_modules
COPY --chown=nextjs:nodejs docker/migrate.mjs docker/seed.mjs docker/seed-data.json ./tools/
COPY docker/entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nextjs
EXPOSE 3000
CMD ["./entrypoint.sh"]
