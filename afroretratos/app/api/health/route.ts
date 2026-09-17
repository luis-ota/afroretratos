import { apiJson } from "@/lib/api/respond";

/**
 * Healthcheck da aplicacao. Nao toca no banco nem no Redis de proposito: o
 * probe roda a cada 30s e, num Postgres gerenciado com scale-to-zero (Neon),
 * cada consulta acordaria o compute e consumiria a cota do plano.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return apiJson({ ok: true });
}
