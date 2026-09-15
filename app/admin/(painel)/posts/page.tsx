import Link from "next/link";
import { PostStatusBadge } from "@/components/admin/PostStatusBadge";
import { InfoIcon } from "@/components/ui/InfoIcon";
import { formatPostTimestamp } from "@/lib/format";
import type { PostStatus } from "@/lib/types";
import { listEvents } from "@/services/events";
import { listModerationPosts } from "@/services/moderation";
import { updatePostStatusAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "hidden", label: "Ocultos" },
  { value: "removed", label: "Removidos" },
];

const BUTTON =
  "rounded-md border border-brown-deep/40 px-3 py-1.5 text-xs font-medium tracking-[0.08em] uppercase transition-colors hover:bg-brown-deep hover:text-beige";

type Props = {
  searchParams: Promise<{
    status?: string;
    origem?: string;
    q?: string;
    evento?: string;
  }>;
};

export default async function AdminPostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const requested = params.status;
  const status =
    requested &&
    requested !== "all" &&
    STATUS_FILTERS.some((item) => item.value === requested)
      ? (requested as PostStatus)
      : null;
  const originHash = params.origem?.trim() || null;
  const search = params.q?.trim() || null;
  const eventFilter = params.evento?.trim() || null;
  const events = await listEvents();

  const posts = await listModerationPosts({
    status,
    originHash,
    query: search,
    eventId: eventFilter,
    limit: 100,
  });

  const query = (next: {
    status?: string;
    origem?: string;
    q?: string;
    evento?: string;
  }) => {
    const value = new URLSearchParams();
    if (next.status && next.status !== "all") value.set("status", next.status);
    if (next.origem) value.set("origem", next.origem);
    if (next.q) value.set("q", next.q);
    if (next.evento) value.set("evento", next.evento);
    const params = value.toString();
    return params ? `/admin/posts?${params}` : "/admin/posts";
  };

  return (
    <div>
      <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-none">
        Posts
      </h1>
      <p className="mt-3 max-w-[70ch] text-sm text-brown-raised">
        Ocultar tira o post do Feed mantendo o histórico. Remover marca como
        removido. Nenhuma ação apaga dados: a moderação trabalha com estados.
      </p>

      <form
        method="get"
        className="mt-8 flex flex-wrap items-end gap-3 border-t border-brown-deep/20 pt-6"
      >
        {status ? <input type="hidden" name="status" value={status} /> : null}
        {originHash ? (
          <input type="hidden" name="origem" value={originHash} />
        ) : null}
        <div>
          <label htmlFor="q" className="block text-xs font-medium text-brown-raised">
            Buscar no conteúdo
          </label>
          <input
            id="q"
            name="q"
            defaultValue={search ?? ""}
            placeholder="palavra-chave"
            className="mt-1 w-56 rounded-md border border-brown-deep/40 bg-beige-light/60 px-3 py-2 text-base focus:border-wine focus-visible:outline-wine sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="evento"
            className="block text-xs font-medium text-brown-raised"
          >
            Evento
          </label>
          <select
            id="evento"
            name="evento"
            defaultValue={eventFilter ?? ""}
            className="mt-1 rounded-md border border-brown-deep/40 bg-beige-light/60 px-3 py-2 text-base focus:border-wine focus-visible:outline-wine sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="none">Sem evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={BUTTON}>
          Filtrar
        </button>
        {search || eventFilter ? (
          <Link
            href={query({ status: params.status, origem: params.origem })}
            className="text-xs font-medium tracking-[0.08em] text-brown-raised uppercase underline decoration-brown-deep/30 hover:decoration-brown-deep"
          >
            Limpar busca
          </Link>
        ) : null}
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => {
          const active =
            filter.value === (status ?? "all") && !originHash;
          return (
            <Link
              key={filter.value}
              href={query({ status: filter.value, origem: params.origem, q: params.q, evento: params.evento })}
              aria-current={active ? "true" : undefined}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium tracking-[0.08em] uppercase transition-colors ${
                active
                  ? "border-wine bg-wine text-beige"
                  : "border-brown-deep/40 hover:bg-brown-deep hover:text-beige"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
        {originHash ? (
          <span className="ml-2 inline-flex items-center gap-3 rounded-md border border-wine/50 px-3 py-1.5 text-xs">
            Origem: <code className="break-all">{originHash.slice(0, 16)}…</code>
            <Link
              href="/admin/posts"
              className="font-medium tracking-[0.08em] uppercase underline"
            >
              limpar
            </Link>
          </span>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 border-t border-brown-deep/20 pt-6 text-sm text-brown-raised">
          Nenhum post encontrado com este filtro.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Lista de posts para moderação
            </caption>
            <thead>
              <tr className="border-b border-brown-deep/30 text-xs tracking-[0.12em] text-brown-raised uppercase">
                <th scope="col" className="py-3 pr-4 font-medium">
                  Data
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Situação
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Conteúdo
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Evento
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Origem
                </th>
                <th scope="col" className="py-3 font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-deep/15">
              {posts.map((post) => (
                <tr key={post.id} className="align-top">
                  <td className="py-4 pr-4 text-xs whitespace-nowrap text-brown-raised tabular">
                    {formatPostTimestamp(post.createdAt)}
                  </td>
                  <td className="py-4 pr-4">
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td className="max-w-[28rem] py-4 pr-4">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="underline decoration-brown-deep/30 hover:decoration-brown-deep"
                    >
                      {post.content.slice(0, 120)}
                      {post.content.length > 120 ? "…" : ""}
                    </Link>
                  </td>
                  <td className="py-4 pr-4 text-xs">
                    {post.event ? (
                      <Link
                        href={`/eventos/${post.event.slug}`}
                        className="underline decoration-brown-deep/30 hover:decoration-brown-deep"
                      >
                        {post.event.title}
                      </Link>
                    ) : (
                      <span className="text-brown-raised">sem evento</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-xs">
                    <Link
                      href={query({ origem: post.ipHash })}
                      className="underline decoration-brown-deep/30 hover:decoration-brown-deep"
                      title={post.ipHash}
                    >
                      {post.ipHash.slice(0, 12)}…
                    </Link>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        aria-label={`Abrir detalhes do post de ${formatPostTimestamp(post.createdAt)}`}
                        title="Detalhes"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-brown-deep/40 transition-colors hover:bg-brown-deep hover:text-beige"
                      >
                        <InfoIcon className="h-4 w-4" />
                      </Link>
                      {post.status !== "active" ? (
                        <form action={updatePostStatusAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <input type="hidden" name="status" value="active" />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={query({ status: params.status, origem: params.origem, q: params.q, evento: params.evento })}
                          />
                          <button type="submit" className={BUTTON}>
                            Reativar
                          </button>
                        </form>
                      ) : null}
                      {post.status === "active" ? (
                        <form action={updatePostStatusAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <input type="hidden" name="status" value="hidden" />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={query({ status: params.status, origem: params.origem, q: params.q, evento: params.evento })}
                          />
                          <button type="submit" className={BUTTON}>
                            Ocultar
                          </button>
                        </form>
                      ) : null}
                      {post.status !== "removed" ? (
                        <form action={updatePostStatusAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <input type="hidden" name="status" value="removed" />
                          <input
                            type="hidden"
                            name="returnTo"
                            value={query({ status: params.status, origem: params.origem, q: params.q, evento: params.evento })}
                          />
                          <button type="submit" className={BUTTON}>
                            Remover
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
