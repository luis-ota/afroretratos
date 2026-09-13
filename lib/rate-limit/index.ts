import { consumeMemory } from "./memory";
import type { RatePolicy } from "./policies";
import { consumeRedis } from "./redis";

export type RateDecision =
  | { allowed: true; backend: "redis" | "memory" }
  | { allowed: false; retryAfterSeconds: number; backend: "redis" | "memory" };

/**
 * Rate limit sempre no servidor. Redis quando disponivel; fallback em
 * memoria por processo. A chave deve ser um identificador ja anonimizado
 * (nunca o IP puro).
 */
export async function rateLimit(
  scope: string,
  identifier: string,
  policy: RatePolicy,
): Promise<RateDecision> {
  const key = `${scope}:${identifier}`;

  const redis = await consumeRedis(key, policy);
  if (redis) {
    return redis.allowed
      ? { allowed: true, backend: "redis" }
      : { ...redis, backend: "redis" };
  }

  const memory = consumeMemory(key, policy);
  return memory.allowed
    ? { allowed: true, backend: "memory" }
    : { ...memory, backend: "memory" };
}
