"use client";

import { useState } from "react";
import { FeedComposer } from "./FeedComposer";
import { PostEntry } from "./PostEntry";
import type { EventOption, PublicPost } from "@/lib/types";

export function FeedStream({
  initialPosts,
  initialCursor,
  events,
  initialEventId = "",
}: {
  initialPosts: PublicPost[];
  initialCursor: string | null;
  events: EventOption[];
  initialEventId?: string;
}) {
  const [posts, setPosts] = useState<PublicPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freshIds, setFreshIds] = useState<string[]>([]);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/posts?limit=20&cursor=${encodeURIComponent(cursor)}`,
      );
      if (!response.ok) {
        setError("Não foi possível carregar mais relatos agora.");
        return;
      }
      const data = (await response.json()) as {
        posts: PublicPost[];
        nextCursor: string | null;
      };
      setPosts((current) => [...current, ...data.posts]);
      setFreshIds(data.posts.map((post) => post.id));
      setCursor(data.nextCursor);
    } catch {
      setError("Falha de conexão ao carregar mais relatos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <FeedComposer
        events={events}
        initialEventId={initialEventId}
        onPosted={(post) => {
          setPosts((current) => [post, ...current]);
          setFreshIds([post.id]);
        }}
      />

      <section aria-label="Relatos da comunidade" className="mt-12">
        {posts.length === 0 ? (
          <p className="border-t border-brown-deep/20 py-10 font-subtitle text-2xl">
            Ainda não há relatos publicados. O primeiro pode ser o seu.
          </p>
        ) : (
          <div>
            {posts.map((post) => {
              const freshIndex = freshIds.indexOf(post.id);
              return (
                <div
                  key={post.id}
                  className={freshIndex >= 0 ? "afro-post-in" : undefined}
                  style={
                    freshIndex >= 0
                      ? { animationDelay: `${freshIndex * 60}ms` }
                      : undefined
                  }
                >
                  <PostEntry post={post} />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col items-start gap-3">
          {cursor ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="inline-flex min-h-11 items-center rounded-md border border-brown-deep/50 px-6 py-3 text-sm font-medium tracking-[0.08em] uppercase transition-colors hover:bg-brown-deep hover:text-beige disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Carregando…" : "Carregar mais relatos"}
            </button>
          ) : posts.length > 0 ? (
            <p className="text-sm text-brown-raised">
              Você chegou ao fim dos relatos publicados até agora.
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-wine">
              {error}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
