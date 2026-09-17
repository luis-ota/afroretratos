import { createHmac } from "node:crypto";

const DEV_SECRET = "afroretratos-dev-secret-nao-use-em-producao";

function originSecret(): string {
  const secret = process.env.ORIGIN_HASH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ORIGIN_HASH_SECRET ausente: defina um segredo com pelo menos 16 caracteres antes de publicar.",
    );
  }
  return DEV_SECRET;
}

/**
 * HMAC-SHA256 deterministico do IP. Permite correlacionar posts da mesma
 * origem sem guardar o IP puro e sem que o hash seja reversivel a partir
 * de um dicionario de IPs (o segredo nunca sai do servidor).
 */
export function hashOrigin(ip: string | null): string {
  return createHmac("sha256", originSecret())
    .update(`afroretratos:origin:${ip ?? "unknown"}`)
    .digest("hex");
}
