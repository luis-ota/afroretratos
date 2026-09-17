import { describe, expect, test } from "bun:test";
import { consumeMemory } from "../lib/rate-limit/memory";
import type { RatePolicy } from "../lib/rate-limit/policies";

const policy: RatePolicy = {
  name: "test",
  windows: [{ limit: 2, seconds: 60 }],
};

describe("consumeMemory", () => {
  test("bloqueia depois de atingir o limite da janela", () => {
    const key = `test:${Math.random()}`;
    expect(consumeMemory(key, policy).allowed).toBe(true);
    expect(consumeMemory(key, policy).allowed).toBe(true);
    const third = consumeMemory(key, policy);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  test("chaves diferentes têm cotas independentes", () => {
    const keyA = `test:${Math.random()}`;
    const keyB = `test:${Math.random()}`;
    consumeMemory(keyA, policy);
    consumeMemory(keyA, policy);
    expect(consumeMemory(keyA, policy).allowed).toBe(false);
    expect(consumeMemory(keyB, policy).allowed).toBe(true);
  });

  test("requisições negadas não consomem a cota", () => {
    const key = `test:${Math.random()}`;
    consumeMemory(key, policy);
    consumeMemory(key, policy);
    consumeMemory(key, policy);
    consumeMemory(key, policy);
    const retry = consumeMemory(key, policy);
    expect(retry.allowed).toBe(false);
  });
});
