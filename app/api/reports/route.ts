import type { NextRequest } from "next/server";
import { readTextWithLimit } from "@/lib/api/body";
import { apiError, apiJson } from "@/lib/api/respond";
import { rateLimit } from "@/lib/rate-limit";
import { reportPolicy } from "@/lib/rate-limit/policies";
import { hashOrigin } from "@/lib/security/hash";
import { resolveClientOrigin } from "@/lib/security/origin";
import { reportSchema } from "@/lib/validation/posts";
import { isOriginBlocked } from "@/services/moderation";
import { createReport } from "@/services/reports";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const origin = resolveClientOrigin(request);
    const ipHash = hashOrigin(origin.ip);

    if (await isOriginBlocked(ipHash)) {
      return apiError(
        403,
        "blocked",
        "Não é possível enviar denúncias deste acesso no momento.",
      );
    }

    const decision = await rateLimit("report", ipHash, reportPolicy());
    if (!decision.allowed) {
      return apiError(
        429,
        "rate_limited",
        "Recebemos muitas denúncias deste acesso em pouco tempo. Tente de novo mais tarde.",
        { "Retry-After": String(decision.retryAfterSeconds) },
      );
    }

    const read = await readTextWithLimit(request, 4 * 1024);
    if (!read.ok) {
      if (read.reason === "too_large") {
        return apiError(413, "too_large", "Denúncia grande demais.");
      }
      return apiError(400, "invalid", "Não foi possível ler a denúncia.");
    }

    let body: unknown;
    try {
      body = JSON.parse(read.text);
    } catch {
      return apiError(400, "invalid", "Não foi possível ler a denúncia.");
    }

    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        422,
        "invalid",
        parsed.error.issues[0]?.message ?? "Denúncia inválida.",
      );
    }

    const created = await createReport({
      postId: parsed.data.postId,
      reason: parsed.data.reason,
      reporterIpHash: ipHash,
    });

    if (!created) {
      return apiError(404, "not_found", "Relato não encontrado.");
    }

    return apiJson({ ok: true }, 201);
  } catch (error) {
    console.error(
      "[api/reports] falhou:",
      error instanceof Error ? error.message : "erro desconhecido",
    );
    return apiError(
      500,
      "server_error",
      "Não foi possível enviar a denúncia agora.",
    );
  }
}
