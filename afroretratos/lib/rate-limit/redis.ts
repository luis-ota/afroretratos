import Redis from "ioredis";
import type { RatePolicy } from "./policies";

/**
 * Janela fixa atomica no Redis: verifica todas as janelas antes de contar,
 * para que requisicoes negadas nao consumam cota. Compatível com Upstash
 * (URL rediss://) e com Redis local.
 */
const SCRIPT = `
local n = #KEYS
for i = 1, n do
  local count = tonumber(redis.call('GET', KEYS[i]) or '0')
  local limit = tonumber(ARGV[(i - 1) * 2 + 1])
  if count >= limit then
    return { 0, redis.call('PTTL', KEYS[i]) }
  end
end
for i = 1, n do
  local count = redis.call('INCR', KEYS[i])
  if count == 1 then
    redis.call('PEXPIRE', KEYS[i], tonumber(ARGV[(i - 1) * 2 + 2]))
  end
end
return { 1, 0 }
`;

type RedisState = {
  client: Redis | null;
  healthy: boolean;
  connecting: Promise<void> | null;
  warned: boolean;
};

const globalForRedis = globalThis as typeof globalThis & {
  __afroretratosRedis?: RedisState;
};

function state(): RedisState {
  if (!globalForRedis.__afroretratosRedis) {
    globalForRedis.__afroretratosRedis = {
      client: null,
      healthy: false,
      connecting: null,
      warned: false,
    };
  }
  return globalForRedis.__afroretratosRedis;
}

async function client(): Promise<Redis | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const current = state();
  if (!current.client) {
    const redis = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 1500,
      commandTimeout: 1500,
    });
    redis.on("error", () => {
      current.healthy = false;
    });
    current.client = redis;
  }

  if (current.client.status === "ready") {
    current.healthy = true;
    return current.client;
  }

  if (!current.connecting) {
    current.connecting = current.client
      .connect()
      .then(() => {
        current.healthy = true;
      })
      .catch(() => {
        current.healthy = false;
      })
      .finally(() => {
        current.connecting = null;
      });
  }
  await current.connecting;

  // O status muda durante o await; leia de novo sem o narrowing anterior.
  const status = current.client.status as string;
  if (status !== "ready") return null;
  current.healthy = true;
  return current.client;
}

export async function consumeRedis(
  key: string,
  policy: RatePolicy,
): Promise<{ allowed: boolean; retryAfterSeconds: number } | null> {
  const redis = await client();
  if (!redis) return null;

  const keys = policy.windows.map(
    (window) => `afroretratos:rl:${key}:${window.seconds}`,
  );
  const args = policy.windows.flatMap((window) => [
    window.limit,
    window.seconds * 1000,
  ]);

  try {
    const result = (await redis.eval(SCRIPT, keys.length, ...keys, ...args)) as [
      number,
      number,
    ];
    const allowed = Number(result?.[0]) === 1;
    if (allowed) return { allowed: true, retryAfterSeconds: 0 };
    const ttlMs = Number(result?.[1]);
    return {
      allowed: false,
      retryAfterSeconds:
        Number.isFinite(ttlMs) && ttlMs > 0 ? Math.ceil(ttlMs / 1000) : 60,
    };
  } catch {
    state().healthy = false;
    const current = state();
    if (!current.warned) {
      current.warned = true;
      console.warn(
        "[rate-limit] Redis indisponivel; usando fallback em memoria neste processo.",
      );
    }
    return null;
  }
}

export function redisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}
