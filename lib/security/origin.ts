import { isIP } from "node:net";

/**
 * Resolucao central da origem do visitante. Toda leitura de headers de proxy
 * acontece aqui; nenhum outro modulo deve ler X-Forwarded-For diretamente.
 *
 * Regras:
 * - X-Forwarded-For so e considerado quando TRUSTED_PROXY_HOPS > 0, e apenas
 *   a entrada a "N" hops confiaveis da direita e aceita. Um cliente que
 *   injeta o header sem passar por proxy confiavel nao consegue forjar IP.
 * - Cloudflare (cf-connecting-ip) so e aceito com TRUST_CLOUDFLARE_HEADER=true,
 *   ou seja, quando a origem e inacessivel fora do Cloudflare.
 * - Sem proxy configurado, a origem fica nula e o hash cai em um marcador
 *   unico de ambiente local (documentado no README).
 */

export type OriginSource = "cloudflare" | "forwarded" | "real-ip" | "none";

export type ClientOrigin = {
  ip: string | null;
  source: OriginSource;
};

function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim().replace(/^"|"$/g, "");
  if (!value) return null;

  // IPv6 entre colchetes, ex.: [::1]:443
  const bracket = /^\[(.+)\](?::\d+)?$/.exec(value);
  if (bracket) value = bracket[1];

  // IPv4 com porta, ex.: 203.0.113.7:41234
  const ipv4Port = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(value);
  if (ipv4Port) value = ipv4Port[1];

  // IPv4 mapeado em IPv6, ex.: ::ffff:203.0.113.7
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(value);
  if (mapped) value = mapped[1];

  const zone = value.indexOf("%");
  if (zone !== -1) value = value.slice(0, zone);

  if (isIP(value) === 0) return null;
  return value.toLowerCase();
}

function trustedHops(): number {
  const parsed = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "0", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function resolveClientOrigin(request: Request): ClientOrigin {
  if (process.env.TRUST_CLOUDFLARE_HEADER === "true") {
    const cf = normalizeIp(request.headers.get("cf-connecting-ip"));
    if (cf) return { ip: cf, source: "cloudflare" };
  }

  const hops = trustedHops();
  if (hops === 0) {
    return { ip: null, source: "none" };
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const entries = forwarded
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    const index = entries.length - hops;
    if (index >= 0) {
      const ip = normalizeIp(entries[index]);
      if (ip) return { ip, source: "forwarded" };
    }
    // Header menor que o numero de proxies confiaveis: nao da para dizer
    // quem e o cliente; trata como origem desconhecida em vez de chutar.
    return { ip: null, source: "none" };
  }

  const realIp = normalizeIp(request.headers.get("x-real-ip"));
  if (realIp) return { ip: realIp, source: "real-ip" };

  return { ip: null, source: "none" };
}

export function originLabel(origin: ClientOrigin): string {
  if (origin.ip) return origin.ip;
  return "local";
}
