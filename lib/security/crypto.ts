import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

/**
 * IP original guardado separadamente e criptografado (AES-256-GCM).
 * A chave vive apenas no servidor (ORIGIN_ENCRYPTION_KEY, 32 bytes em
 * base64). Sem chave configurada, nenhum IP original e armazenado.
 */

const ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer | null {
  const raw = process.env.ORIGIN_ENCRYPTION_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) return null;
  return key;
}

export function canEncryptOrigin(): boolean {
  return encryptionKey() !== null;
}

export function encryptOrigin(ip: string | null): string | null {
  if (!ip) return null;
  const key = encryptionKey();
  if (!key) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(ip, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptOrigin(payload: string | null): string | null {
  if (!payload) return null;
  const key = encryptionKey();
  if (!key) return null;
  try {
    const buffer = Buffer.from(payload, "base64");
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const data = buffer.subarray(28);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    return null;
  }
}
