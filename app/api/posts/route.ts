import type { NextRequest } from "next/server";
import { readTextWithLimit } from "@/lib/api/body";
import { apiError, apiJson } from "@/lib/api/respond";
import { postPolicy } from "@/lib/rate-limit/policies";
import { rateLimit } from "@/lib/rate-limit";
import { encryptOrigin } from "@/lib/security/crypto";
import { hashOrigin } from "@/lib/security/hash";
import { resolveClientOrigin } from "@/lib/security/origin";
import {
  createPostSchema,
  countLinks,
  MAX_LINKS_PER_POST,
} from "@/lib/validation/posts";
import { getEventById, getEventBySlug } from "@/services/events";
import { isOriginBlocked } from "@/services/moderation";
import { createPost, listPublicPosts } from "@/services/posts";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT_MESSAGE =
  "Muitas publicações em pouco tempo. Aguarde alguns instantes e tente de novo.";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const cursor = searchParams.get("cursor");
  const eventSlug = searchParams.get("event");

  let eventId: string | null = null;
  if (eventSlug) {
    const event = await getEventBySlug(eventSlug);
    if (!event) {
      return apiError(404, "not_found", "Evento não encontrado.");
    }
    eventId = event.id;
  }

  try {
    const page = await listPublicPosts({
      limit: Number.isFinite(limitParam) ? limitParam : 20,
      cursor,
      eventId,
    });
    return apiJson(page);
  } catch (error) {
    console.error(
      "[api/posts] GET falhou:",
      error instanceof Error ? error.message : "erro desconhecido",
    );
    return apiError(500, "server_error", "Não foi possível carregar o Feed.");
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Origem e identificador seguro.
    const origin = resolveClientOrigin(request);
    const ipHash = hashOrigin(origin.ip);

    // 2. Bloqueio de origem.
    if (await isOriginBlocked(ipHash)) {
      return apiError(
        403,
        "blocked",
        "Não é possível publicar deste acesso no momento.",
      );
    }

    // 3. Rate limit no servidor, antes de qualquer processamento de payload.
    const decision = await rateLimit("post", ipHash, postPolicy());
    if (!decision.allowed) {
      return apiError(429, "rate_limited", RATE_LIMIT_MESSAGE, {
        "Retry-After": String(decision.retryAfterSeconds),
      });
    }

    // 4. Tamanho máximo do corpo, cortado durante a leitura.
    const read = await readTextWithLimit(request, MAX_BODY_BYTES);
    if (!read.ok) {
      if (read.reason === "too_large") {
        return apiError(413, "too_large", "Relato grande demais.");
      }
      return apiError(400, "invalid", "Não foi possível ler o relato.");
    }

    let body: unknown;
    try {
      body = JSON.parse(read.text);
    } catch {
      return apiError(400, "invalid", "Não foi possível ler o relato.");
    }

    if (body && typeof body === "object" && "website" in body) {
      const honeypot = (body as { website?: unknown }).website;
      if (typeof honeypot === "string" && honeypot.length > 0) {
        return apiError(400, "invalid", "Não foi possível publicar.");
      }
    }

    // 5. Validacao e normalizacao no servidor.
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Relato inválido.";
      return apiError(422, "invalid", message);
    }

    const { content, eventId } = parsed.data;

    if (countLinks(content) > MAX_LINKS_PER_POST) {
      return apiError(
        422,
        "invalid",
        "O relato tem links demais. Remova alguns e tente de novo.",
      );
    }

    if (eventId) {
      const event = await getEventById(eventId);
      if (!event) {
        return apiError(422, "invalid", "Evento não encontrado.");
      }
    }

    // 6. Persistencia e resposta publica (sem nenhum dado tecnico).
    const post = await createPost({
      content,
      eventId,
      ipHash,
      ipEncrypted: encryptOrigin(origin.ip),
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    });

    return apiJson({ post }, 201);
  } catch (error) {
    console.error(
      "[api/posts] POST falhou:",
      error instanceof Error ? error.message : "erro desconhecido",
    );
    return apiError(
      500,
      "server_error",
      "Não foi possível publicar agora. Tente novamente.",
    );
  }
}
