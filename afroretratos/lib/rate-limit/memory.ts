import type { RatePolicy } from "./policies";

type Counter = {
  count: number;
  resetAt: number;
};

type MemoryState = {
  counters: Map<string, Counter>;
};

const globalForLimiter = globalThis as typeof globalThis & {
  __afroretratosRateLimit?: MemoryState;
};

function state(): MemoryState {
  if (!globalForLimiter.__afroretratosRateLimit) {
    globalForLimiter.__afroretratosRateLimit = { counters: new Map() };
  }
  return globalForLimiter.__afroretratosRateLimit;
}

function sweep(now: number): void {
  const { counters } = state();
  if (counters.size < 5000) return;
  for (const [key, counter] of counters) {
    if (counter.resetAt <= now) counters.delete(key);
  }
}

/**
 * Fallback em memoria, por processo. Suficiente para desenvolvimento e para
 * uma unica instancia; em producao com mais de uma instancia use Redis.
 */
export function consumeMemory(
  key: string,
  policy: RatePolicy,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);
  const { counters } = state();

  for (const window of policy.windows) {
    const windowKey = `${key}:${window.seconds}`;
    const counter = counters.get(windowKey);
    if (counter && counter.count >= window.limit && counter.resetAt > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((counter.resetAt - now) / 1000),
        ),
      };
    }
  }

  for (const window of policy.windows) {
    const windowKey = `${key}:${window.seconds}`;
    const counter = counters.get(windowKey);
    if (!counter || counter.resetAt <= now) {
      counters.set(windowKey, {
        count: 1,
        resetAt: now + window.seconds * 1000,
      });
    } else {
      counter.count += 1;
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
