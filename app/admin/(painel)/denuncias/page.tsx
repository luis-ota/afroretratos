import Link from "next/link";
import { formatPostTimestamp } from "@/lib/format";
import { listReports } from "@/services/reports";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await listReports(120);

  return (
    <div>
      <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-none">
        Denúncias
      </h1>
      <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-brown-raised">
        Denúncias são anônimas e têm rate limit próprio. Abra o post para
        ocultar, remover ou bloquear a origem.
      </p>

      {reports.length === 0 ? (
        <p className="mt-8 border-t border-brown-deep/20 pt-6 text-sm text-brown-raised">
          Nenhuma denúncia registrada até agora.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-brown-deep/15 border-t border-brown-deep/20">
          {reports.map((report) => (
            <li key={report.id} className="py-5">
              <div className="flex flex-wrap items-center gap-3 text-xs text-brown-raised">
                <time dateTime={report.createdAt} className="tabular">
                  {formatPostTimestamp(report.createdAt)}
                </time>
                <Link
                  href={`/admin/posts/${report.postId}`}
                  className="uppercase tracking-[0.1em] text-wine underline decoration-wine/40 hover:decoration-wine"
                >
                  Abrir post denunciado
                </Link>
              </div>
              <p className="mt-2 max-w-[80ch] text-sm leading-relaxed">
                {report.reason}
              </p>
              <p className="mt-2 max-w-[80ch] text-xs text-brown-raised italic">
                “{report.postExcerpt}
                {report.postExcerpt.length >= 160 ? "…" : ""}”
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
