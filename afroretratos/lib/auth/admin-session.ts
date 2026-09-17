/**
 * Sessao administrativa minima: um token HMAC assinado no servidor e
 * guardado em cookie httpOnly. Nao ha usuarios nem banco de sessoes:
 * o ADMIN_SECRET e o unico segredo e pode ser trocado a qualquer momento
 * (o que invalida todas as sessoes).
 *
 * Usa Web Crypto para funcionar tanto no proxy quanto nas rotas Node.
 */

const COOKIE_NAME = "afroretratos_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export function adminCookieName(): string {
  return COOKIE_NAME;
}

export function isAdminConfigured(): boolean {
  const secret = process.env.ADMIN_SECRET;
  return Boolean(secret && secret.length >= 8);
}

function adminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 8) {
    throw new Error(
      "ADMIN_SECRET ausente ou curto demais (minimo 8 caracteres).",
    );
  }
  return secret;
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(adminSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAdminToken(): Promise<{
  token: string;
  maxAge: number;
}> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ exp: expiresAt })),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    encoder.encode(payload),
  );
  return {
    token: `${payload}.${toBase64Url(new Uint8Array(signature))}`,
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function verifyAdminToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token || !isAdminConfigured()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
    if (!valid) return false;
    const data = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payload)),
    ) as { exp?: number };
    return typeof data.exp === "number" && data.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function checkAdminPassword(candidate: string): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  try {
    const key = await hmacKey();
    const candidateMac = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(candidate)),
    );
    const expectedMac = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(adminSecret())),
    );
    let difference = 0;
    for (let index = 0; index < candidateMac.length; index += 1) {
      difference |= candidateMac[index] ^ expectedMac[index];
    }
    return difference === 0;
  } catch {
    return false;
  }
}
