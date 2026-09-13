import { and, desc, eq, lt, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { mockDb, newId } from "@/lib/db/mock-store";
import { events, posts } from "@/lib/db/schema";
import type { PublicPost } from "@/lib/types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export type CreatePostRecord = {
  content: string;
  eventId: string | null;
  ipHash: string;
  ipEncrypted: string | null;
  userAgent: string | null;
};

export type PublicPostPage = {
  posts: PublicPost[];
  nextCursor: string | null;
};

function clampLimit(limit: number | undefined): number {
  if (!limit || !Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

function eventRef(
  slug: string | null,
  title: string | null,
): PublicPost["event"] {
  if (!slug || !title) return null;
  return { slug, title };
}

/**
 * Cursor opaco no formato `<createdAt ISO>_<id>`. O desempate por id evita
 * pular ou repetir posts com o mesmo timestamp de criacao.
 */
function parseCursor(
  cursor: string | null | undefined,
): { date: Date; id: string | null } | null {
  if (!cursor) return null;
  const separator = cursor.lastIndexOf("_");
  if (separator === -1) {
    const date = new Date(cursor);
    return Number.isNaN(date.getTime()) ? null : { date, id: null };
  }
  const id = cursor.slice(separator + 1);
  const date = new Date(cursor.slice(0, separator));
  if (Number.isNaN(date.getTime()) || !id) return null;
  return { date, id };
}

function encodeCursor(post: { createdAt: string; id: string }): string {
  return `${post.createdAt}_${post.id}`;
}

export async function createPost(
  input: CreatePostRecord,
): Promise<PublicPost> {
  const db = getDb();

  if (db) {
    const [row] = await db
      .insert(posts)
      .values({
        content: input.content,
        eventId: input.eventId,
        ipHash: input.ipHash,
        ipEncrypted: input.ipEncrypted,
        userAgent: input.userAgent,
        status: "active",
      })
      .returning();

    let event: PublicPost["event"] = null;
    if (row.eventId) {
      const [related] = await db
        .select({ slug: events.slug, title: events.title })
        .from(events)
        .where(eq(events.id, row.eventId))
        .limit(1);
      event = related ? { slug: related.slug, title: related.title } : null;
    }

    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      event,
    };
  }

  const store = mockDb();
  const now = new Date().toISOString();
  const row = {
    id: newId(),
    content: input.content,
    eventId: input.eventId,
    ipHash: input.ipHash,
    ipEncrypted: input.ipEncrypted,
    userAgent: input.userAgent,
    status: "active" as const,
    createdAt: now,
    updatedAt: now,
  };
  store.posts.unshift(row);
  const related = row.eventId
    ? store.events.find((event) => event.id === row.eventId)
    : undefined;
  return {
    id: row.id,
    content: row.content,
    createdAt: now,
    event: related ? { slug: related.slug, title: related.title } : null,
  };
}

export async function listPublicPosts(options?: {
  limit?: number;
  cursor?: string | null;
  eventId?: string | null;
}): Promise<PublicPostPage> {
  const limit = clampLimit(options?.limit);
  const cursor = parseCursor(options?.cursor);
  const eventId = options?.eventId ?? null;
  const db = getDb();

  if (db) {
    const conditions = [eq(posts.status, "active")];
    if (eventId) conditions.push(eq(posts.eventId, eventId));
    if (cursor) {
      conditions.push(
        cursor.id
          ? or(
              lt(posts.createdAt, cursor.date),
              and(eq(posts.createdAt, cursor.date), lt(posts.id, cursor.id)),
            )!
          : lt(posts.createdAt, cursor.date),
      );
    }
    const rows = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        eventSlug: events.slug,
        eventTitle: events.title,
      })
      .from(posts)
      .leftJoin(events, eq(posts.eventId, events.id))
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt), desc(posts.id))
      .limit(limit + 1);

    const page = rows.slice(0, limit);
    const publicPosts = page.map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      event: eventRef(row.eventSlug, row.eventTitle),
    }));
    const last = publicPosts[publicPosts.length - 1];
    return {
      posts: publicPosts,
      nextCursor: rows.length > limit && last ? encodeCursor(last) : null,
    };
  }

  const store = mockDb();
  const cursorIso = cursor?.date.toISOString() ?? null;
  const filtered = store.posts
    .filter((post) => post.status === "active")
    .filter((post) => (eventId ? post.eventId === eventId : true))
    .filter((post) => {
      if (!cursorIso) return true;
      if (cursor?.id) {
        return (
          post.createdAt < cursorIso ||
          (post.createdAt === cursorIso && post.id < cursor.id)
        );
      }
      return post.createdAt < cursorIso;
    })
    .sort((a, b) =>
      b.createdAt === a.createdAt
        ? b.id.localeCompare(a.id)
        : b.createdAt.localeCompare(a.createdAt),
    );

  const page = filtered.slice(0, limit);
  const publicPosts = page.map((post) => {
    const related = post.eventId
      ? store.events.find((event) => event.id === post.eventId)
      : undefined;
    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      event: related ? { slug: related.slug, title: related.title } : null,
    };
  });
  const last = publicPosts[publicPosts.length - 1];
  return {
    posts: publicPosts,
    nextCursor: filtered.length > limit && last ? encodeCursor(last) : null,
  };
}

export async function listPublicPostsByEvent(
  eventId: string,
  limit = 6,
): Promise<PublicPost[]> {
  const page = await listPublicPosts({ eventId, limit });
  return page.posts;
}

export async function getPublicPost(id: string): Promise<PublicPost | null> {
  const db = getDb();
  if (db) {
    const [row] = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        eventSlug: events.slug,
        eventTitle: events.title,
      })
      .from(posts)
      .leftJoin(events, eq(posts.eventId, events.id))
      .where(and(eq(posts.id, id), eq(posts.status, "active")))
      .limit(1);
    if (!row) return null;
    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      event: eventRef(row.eventSlug, row.eventTitle),
    };
  }
  const store = mockDb();
  const post = store.posts.find(
    (item) => item.id === id && item.status === "active",
  );
  if (!post) return null;
  const related = post.eventId
    ? store.events.find((event) => event.id === post.eventId)
    : undefined;
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    event: related ? { slug: related.slug, title: related.title } : null,
  };
}
