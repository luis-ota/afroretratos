import { afterEach, describe, expect, test } from "bun:test";
import { encryptOrigin, decryptOrigin } from "../lib/security/crypto";
import { hashOrigin } from "../lib/security/hash";
import { resolveClientOrigin } from "../lib/security/origin";

const ORIGINAL_HOPS = process.env.TRUSTED_PROXY_HOPS;
const ORIGINAL_CF = process.env.TRUST_CLOUDFLARE_HEADER;
const ORIGINAL_KEY = process.env.ORIGIN_ENCRYPTION_KEY;

afterEach(() => {
  process.env.TRUSTED_PROXY_HOPS = ORIGINAL_HOPS;
  process.env.TRUST_CLOUDFLARE_HEADER = ORIGINAL_CF;
  process.env.ORIGIN_ENCRYPTION_KEY = ORIGINAL_KEY;
});

function request(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/posts", { headers });
}

describe("resolveClientOrigin", () => {
  test("sem proxy confiável, nenhum header é aceito", () => {
    process.env.TRUSTED_PROXY_HOPS = "0";
    const origin = resolveClientOrigin(
      request({ "x-forwarded-for": "203.0.113.9" }),
    );
    expect(origin.ip).toBeNull();
    expect(origin.source).toBe("none");
  });

  test("com 1 hop confiável, usa a entrada mais à direita", () => {
    process.env.TRUSTED_PROXY_HOPS = "1";
    const origin = resolveClientOrigin(
      request({ "x-forwarded-for": "198.51.100.1, 203.0.113.9" }),
    );
    expect(origin.ip).toBe("203.0.113.9");
    expect(origin.source).toBe("forwarded");
  });

  test("com 2 hops confiáveis, ignora o hop forjado mais à direita", () => {
    process.env.TRUSTED_PROXY_HOPS = "2";
    const origin = resolveClientOrigin(
      request({ "x-forwarded-for": "198.51.100.1, 203.0.113.9" }),
    );
    expect(origin.ip).toBe("198.51.100.1");
  });

  test("normaliza IPv4 com porta e IPv6 mapeado", () => {
    process.env.TRUSTED_PROXY_HOPS = "1";
    expect(
      resolveClientOrigin(request({ "x-forwarded-for": "203.0.113.9:41234" }))
        .ip,
    ).toBe("203.0.113.9");
    expect(
      resolveClientOrigin(request({ "x-forwarded-for": "::ffff:203.0.113.9" }))
        .ip,
    ).toBe("203.0.113.9");
  });

  test("rejeita valores que não são IP", () => {
    process.env.TRUSTED_PROXY_HOPS = "1";
    expect(
      resolveClientOrigin(request({ "x-forwarded-for": "not-an-ip" })).ip,
    ).toBeNull();
  });

  test("aceita cf-connecting-ip apenas quando configurado", () => {
    process.env.TRUSTED_PROXY_HOPS = "0";
    process.env.TRUST_CLOUDFLARE_HEADER = "true";
    const origin = resolveClientOrigin(
      request({ "cf-connecting-ip": "203.0.113.50" }),
    );
    expect(origin.ip).toBe("203.0.113.50");
    expect(origin.source).toBe("cloudflare");
  });
});

describe("hashOrigin", () => {
  test("é determinístico e não reversível ao IP", () => {
    const first = hashOrigin("203.0.113.9");
    const second = hashOrigin("203.0.113.9");
    expect(first).toBe(second);
    expect(first).toHaveLength(64);
    expect(first).not.toContain("203.0.113.9");
  });

  test("IPs diferentes geram hashes diferentes", () => {
    expect(hashOrigin("203.0.113.9")).not.toBe(hashOrigin("203.0.113.10"));
  });
});

describe("encryptOrigin", () => {
  test("faz roundtrip quando a chave existe", () => {
    process.env.ORIGIN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    const payload = encryptOrigin("203.0.113.9");
    expect(payload).not.toBeNull();
    expect(decryptOrigin(payload)).toBe("203.0.113.9");
  });

  test("sem chave, não guarda nada", () => {
    delete process.env.ORIGIN_ENCRYPTION_KEY;
    expect(encryptOrigin("203.0.113.9")).toBeNull();
    expect(decryptOrigin("qualquer-coisa")).toBeNull();
  });

  test("não descriptografa payload corrompido", () => {
    process.env.ORIGIN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    const payload = encryptOrigin("203.0.113.9");
    const corrupted = payload ? `${payload.slice(0, -4)}AAAA` : "";
    expect(decryptOrigin(corrupted)).toBeNull();
  });
});
