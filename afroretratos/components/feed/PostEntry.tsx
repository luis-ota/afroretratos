import Link from "next/link";
import { ReportForm } from "./ReportForm";
import { formatPostTimestamp } from "@/lib/format";
import type { PublicPost } from "@/lib/types";

export function PostEntry({
  post,
  showReport = true,
}: {
  post: PublicPost;
  showReport?: boolean;
}) {
  return (
    <article className="grid gap-3 border-t border-brown-deep/20 py-7 sm:grid-cols-[9.5rem_1fr] sm:gap-10">
      <header className="text-xs tracking-[0.12em] uppercase">
        <p className="font-medium text-brown-deep">Anônimo</p>
        <time dateTime={post.createdAt} className="tabular text-brown-raised">
          {formatPostTimestamp(post.createdAt)}
        </time>
      </header>
      <div>
        {post.event ? (
          <p className="mb-2">
            <Link
              href={`/eventos/${post.event.slug}`}
              className="inline-flex items-center gap-1.5 border-b border-wine/40 py-1.5 text-sm font-medium text-wine hover:border-wine"
            >
              <span className="text-xs tracking-[0.12em] text-brown-raised uppercase">
                Evento
              </span>
              {post.event.title}
            </Link>
          </p>
        ) : null}
        <p className="max-w-[68ch] text-[1.0125rem] leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
        {showReport ? <ReportForm postId={post.id} /> : null}
      </div>
    </article>
  );
}
