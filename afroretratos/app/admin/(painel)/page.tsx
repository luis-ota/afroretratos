import Link from "next/link";
import { PostStatusBadge } from "@/components/admin/PostStatusBadge";
import { formatPostTimestamp } from "@/lib/format";
import { getAdminCounts, listModerationPosts } from "@/services/moderation";
import { listReports } from "@/services/reports";

export default async function AdminDashboardPage() {
  const [counts, recentPosts, recentReports] = await Promise.all([
    getAdminCounts(),
    listModerationPosts({ limit: 6 }),
    listReports(5),
  ]);

  const stats = [
    { label: "Posts ativos", value: counts.posts.active },
    { label: "Ocultos", value: counts.posts.hidden },
    { label: "Removidos", value: counts.posts.removed },
    { label: "Eventos", value: counts.events },
    { label: "Denúncias", value: counts.reports },
    { label: "Origens bloqueadas", value: counts.blocked },
  ];

  return (
    <div className="space-y-12">
      <section aria-labelledby="resumo">
        <h1
          id="resumo"
          className="font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-none"
        >
          Visão geral
        </h1>
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-brown-deep/15 bg-brown-deep/15 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-beige p-5">
              <dt className="text-xs font-medium tracking-[0.14em] text-brown-raised uppercase">
                {stat.label}
              </dt>
              <dd className="mt-3 font-display text-4xl tabular">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="ultimos-posts">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="ultimos-posts" className="font-subtitle text-2xl">
            Últimos posts
          </h2>
          <Link
            href="/admin/posts"
            className="text-sm text-wine underline decoration-wine/40 hover:decoration-wine"
          >
            Ver todos
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="mt-5 border-t border-brown-deep/20 pt-5 text-sm text-brown-raised">
            Nenhum post publicado ainda.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-brown-deep/15 border-t border-brown-deep/20">
            {recentPosts.map((post) => (
              <li key={post.id} className="py-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-brown-raised">
                  <PostStatusBadge status={post.status} />
                  <time dateTime={post.createdAt} className="tabular">
                    {formatPostTimestamp(post.createdAt)}
                  </time>
                  {post.event ? (
                    <span className="uppercase tracking-[0.1em]">
                      {post.event.title}
                    </span>
                  ) : (
                    <span className="uppercase tracking-[0.1em]">Sem evento</span>
                  )}
                </div>
                <p className="mt-2 max-w-[80ch] text-sm leading-relaxed">
                  {post.content.slice(0, 180)}
                  {post.content.length > 180 ? "…" : ""}
                </p>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="mt-2 inline-block text-xs font-medium tracking-[0.12em] text-wine uppercase underline decoration-wine/40 hover:decoration-wine"
                >
                  Abrir post
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ultimas-denuncias">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="ultimas-denuncias" className="font-subtitle text-2xl">
            Últimas denúncias
          </h2>
          <Link
            href="/admin/denuncias"
            className="text-sm text-wine underline decoration-wine/40 hover:decoration-wine"
          >
            Ver todas
          </Link>
        </div>
        {recentReports.length === 0 ? (
          <p className="mt-5 border-t border-brown-deep/20 pt-5 text-sm text-brown-raised">
            Nenhuma denúncia registrada.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-brown-deep/15 border-t border-brown-deep/20">
            {recentReports.map((report) => (
              <li key={report.id} className="py-4 text-sm">
                <div className="flex flex-wrap items-center gap-3 text-xs text-brown-raised">
                  <time dateTime={report.createdAt} className="tabular">
                    {formatPostTimestamp(report.createdAt)}
                  </time>
                  <Link
                    href={`/admin/posts/${report.postId}`}
                    className="uppercase tracking-[0.1em] underline decoration-wine/40 hover:decoration-wine"
                  >
                    Abrir post
                  </Link>
                </div>
                <p className="mt-2 max-w-[80ch] leading-relaxed">
                  {report.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
