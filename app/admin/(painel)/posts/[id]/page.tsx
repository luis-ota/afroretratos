import Link from "next/link";
import { notFound } from "next/navigation";
import { PostStatusBadge } from "@/components/admin/PostStatusBadge";
import { Arrow } from "@/components/ui/Arrow";
import { decryptOrigin, decryptSecret } from "@/lib/security/crypto";
import { formatPostTimestamp } from "@/lib/format";
import {
  getModerationPost,
  getOriginStats,
  isOriginBlocked,
  listBlockedOrigins,
  listModerationPosts,
} from "@/services/moderation";
import {
  blockOriginAction,
  removeOriginPostsAction,
  unblockOriginAction,
  updatePostStatusAction,
} from "../../actions";

export const dynamic = "force-dynamic";

const BUTTON =
  "inline-flex h-9 items-center rounded-md border border-brown-deep/40 px-3.5 text-xs font-medium tracking-[0.08em] uppercase transition-colors hover:bg-brown-deep hover:text-beige";
const DANGER =
  "inline-flex h-9 items-center rounded-md border border-wine bg-wine px-3.5 text-xs font-medium tracking-[0.08em] text-beige uppercase transition-colors hover:bg-wine-deep";

type Props = { params: Promise<{ id: string }> };

export default async function AdminPostDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getModerationPost(id);
  if (!post) notFound();

  const [originPosts, stats, blocked, blocks] = await Promise.all([
    listModerationPosts({ originHash: post.ipHash, limit: 100 }),
    getOriginStats(post.ipHash),
    isOriginBlocked(post.ipHash),
    listBlockedOrigins(),
  ]);

  const currentBlock = blocks.find((item) => item.ipHash === post.ipHash);
  const decryptedIp = decryptOrigin(post.ipEncrypted);
  const decryptedEmail = decryptSecret(post.contactEncrypted);
  const returnTo = `/admin/posts/${post.id}`;

  return (
    <div className="space-y-12">
      <div>
        <Link
          href="/admin/posts"
          className="group inline-flex min-h-11 items-center gap-3 text-xs font-medium tracking-[0.12em] text-brown-raised uppercase underline decoration-brown-deep/30 hover:decoration-brown-deep"
        >
          <Arrow
            direction="left"
            className="h-3 w-6 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1.5"
          />
          Voltar para posts
        </Link>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <PostStatusBadge status={post.status} />
          <time
            dateTime={post.createdAt}
            className="text-xs text-brown-raised tabular"
          >
            {formatPostTimestamp(post.createdAt)}
          </time>
          {post.event ? (
            <Link
              href={`/eventos/${post.event.slug}`}
              className="text-xs uppercase tracking-[0.12em] text-wine underline decoration-wine/40 hover:decoration-wine"
            >
              Evento: {post.event.title}
            </Link>
          ) : (
            <span className="text-xs uppercase tracking-[0.12em] text-brown-raised">
              Sem evento
            </span>
          )}
        </div>
      </div>

      <section aria-labelledby="conteudo" className="max-w-[80ch]">
        <h1
          id="conteudo"
          className="font-subtitle text-[clamp(1.6rem,3.4vw,2.2rem)] leading-tight"
        >
          Conteúdo do relato
        </h1>
        <p className="mt-5 border-l-2 border-wine/60 bg-beige p-6 text-[1.0125rem] leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {post.status !== "active" ? (
            <form action={updatePostStatusAction}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="status" value="active" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className={BUTTON}>
                Reativar
              </button>
            </form>
          ) : null}
          {post.status === "active" ? (
            <form action={updatePostStatusAction}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="status" value="hidden" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className={BUTTON}>
                Ocultar
              </button>
            </form>
          ) : null}
          {post.status !== "removed" ? (
            <form action={updatePostStatusAction}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="status" value="removed" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className={DANGER}>
                Remover
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="origem"
        className="rounded-lg border border-brown-deep/20 bg-beige p-6 sm:p-8"
      >
        <h2 id="origem" className="font-subtitle text-2xl">
          Origem do post
        </h2>
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-brown-raised">
          Identificador interno derivado de HMAC do IP. O IP original nunca é
          exibido publicamente; quando disponível e autorizado, aparece
          somente aqui, descriptografado no servidor.
        </p>

        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-brown-raised uppercase">
              ip_hash
            </dt>
            <dd className="mt-2 text-sm break-all">{post.ipHash}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-brown-raised uppercase">
              IP original
            </dt>
            <dd className="mt-2 text-sm">
              {decryptedIp ?? (
                <span className="text-brown-raised">
                  disponível apenas com ORIGIN_ENCRYPTION_KEY
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-brown-raised uppercase">
              E-mail de contato
            </dt>
            <dd className="mt-2 text-sm">
              {decryptedEmail ?? (
                <span className="text-brown-raised">
                  não informado (ou sem chave de criptografia)
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-brown-raised uppercase">
              Posts desta origem
            </dt>
            <dd className="mt-2 text-sm tabular">
              {stats.total} no total · {stats.active} ativos · {stats.hidden}{" "}
              ocultos · {stats.removed} removidos
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-[0.12em] text-brown-raised uppercase">
              Situação do bloqueio
            </dt>
            <dd className="mt-2 text-sm">
              {blocked ? (
                <span className="font-medium text-wine">Bloqueada</span>
              ) : (
                "Sem bloqueio ativo"
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Ações em massa</h3>
            <form
              action={removeOriginPostsAction}
              className="mt-3 flex flex-wrap items-center gap-3"
            >
              <input type="hidden" name="ipHash" value={post.ipHash} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button type="submit" className={DANGER}>
                Remover todos os posts desta origem
              </button>
            </form>
            {blocked && currentBlock ? (
              <form
                action={unblockOriginAction}
                className="mt-4 flex flex-wrap items-center gap-3"
              >
                <input type="hidden" name="ipHash" value={post.ipHash} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button type="submit" className={BUTTON}>
                  Desbloquear origem
                </button>
                <span className="text-xs text-brown-raised">
                  Motivo atual: {currentBlock.reason}
                  {currentBlock.expiresAt
                    ? ` · expira em ${formatPostTimestamp(currentBlock.expiresAt)}`
                    : " · permanente"}
                </span>
              </form>
            ) : (
              <form
                action={blockOriginAction}
                className="mt-4 space-y-3 border-t border-brown-deep/15 pt-4"
              >
                <input type="hidden" name="ipHash" value={post.ipHash} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium"
                  >
                    Motivo do bloqueio
                  </label>
                  <input
                    id="reason"
                    name="reason"
                    type="text"
                    required
                    minLength={3}
                    maxLength={300}
                    className="mt-2 w-full rounded-md border border-brown-deep/40 bg-beige-light/60 px-3 py-2 text-sm focus:border-wine focus-visible:outline-wine"
                  />
                </div>
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium"
                  >
                    Duração
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    className="mt-2 w-full rounded-md border border-brown-deep/40 bg-beige-light/60 px-3 py-2 text-sm focus:border-wine focus-visible:outline-wine"
                  >
                    <option value="permanent">Permanente</option>
                    <option value="1d">1 dia</option>
                    <option value="7d">7 dias</option>
                    <option value="30d">30 dias</option>
                  </select>
                </div>
                <button type="submit" className={DANGER}>
                  Bloquear origem
                </button>
              </form>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium">
              Posts da mesma origem ({originPosts.length})
            </h3>
            <ul className="mt-3 max-h-96 divide-y divide-brown-deep/15 overflow-y-auto border-t border-brown-deep/20 text-sm">
              {originPosts.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-center gap-3 text-xs text-brown-raised">
                    <PostStatusBadge status={item.status} />
                    <time dateTime={item.createdAt} className="tabular">
                      {formatPostTimestamp(item.createdAt)}
                    </time>
                    {item.id !== post.id ? (
                      <Link
                        href={`/admin/posts/${item.id}`}
                        className="uppercase tracking-[0.08em] underline decoration-brown-deep/30 hover:decoration-brown-deep"
                      >
                        abrir
                      </Link>
                    ) : (
                      <span className="uppercase tracking-[0.08em]">
                        este post
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 leading-relaxed">
                    {item.content.slice(0, 140)}
                    {item.content.length > 140 ? "…" : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
