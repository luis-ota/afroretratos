import { and, count, desc, eq, ne } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { mockDb, newId } from "@/lib/db/mock-store";
import { blockedOrigins, events, posts, reports } from "@/lib/db/schema";
import type {
  BlockedOrigin,
  ModerationPost,
  PostStatus,
} from "@/lib/types";

type ModerationRow = {
  id: string;
  content: string;
  createdAt: Date | string;
  status: PostStatus;
  ipHash: string;
  ipEncrypted: string | null;
  userAgent: string | null;
  eventSlug: string | null;
  eventTitle: string | null;
};

function asIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toModerationPost(row: ModerationRow): ModerationPost {
  return {
    id: row.id,
    content: row.content,
    createdAt: asIso(row.createdAt),
    event:
      row.eventSlug && row.eventTitle
        ? { slug: row.eventSlug, title: row.eventTitle }
        : null,
    status: row.status,
    ipHash: row.ipHash,
    ipEncrypted: row.ipEncrypted,
    userAgent: row.userAgent,
    hasIp: Boolean(row.ipEncrypted),
  };
}

export async function isOriginBlocked(ipHash: string): Promise<boolean> {
  const db = getDb();
  const now = new Date();

  if (db) {
    const [row] = await db
      .select()
      .from(blockedOrigins)
      .where(eq(blockedOrigins.ipHash, ipHash))
      .limit(1);
    if (!row) return false;
    if (row.expiresAt && row.expiresAt.getTime() <= now.getTime()) {
      await db
        .delete(blockedOrigins)
        .where(eq(blockedOrigins.id, row.id));
      return false;
    }
    return true;
  }

  const store = mockDb();
  const index = store.blocked.findIndex((item) => item.ipHash === ipHash);
  if (index === -1) return false;
  const block = store.blocked[index];
  if (block.expiresAt && new Date(block.expiresAt).getTime() <= now.getTime()) {
    store.blocked.splice(index, 1);
    return false;
  }
  return true;
}

export async function listModerationPosts(options?: {
  status?: PostStatus | null;
  originHash?: string | null;
  limit?: number;
}): Promise<ModerationPost[]> {
  const limit = Math.min(Math.max(options?.limit ?? 60, 1), 200);
  const db = getDb();

  if (db) {
    const conditions = [];
    if (options?.status) conditions.push(eq(posts.status, options.status));
    if (options?.originHash)
      conditions.push(eq(posts.ipHash, options.originHash));
    const rows = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        status: posts.status,
        ipHash: posts.ipHash,
        ipEncrypted: posts.ipEncrypted,
        userAgent: posts.userAgent,
        eventSlug: events.slug,
        eventTitle: events.title,
      })
      .from(posts)
      .leftJoin(events, eq(posts.eventId, events.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(posts.createdAt))
      .limit(limit);
    return rows.map(toModerationPost);
  }

  const store = mockDb();
  return store.posts
    .filter((post) => (options?.status ? post.status === options.status : true))
    .filter((post) =>
      options?.originHash ? post.ipHash === options.originHash : true,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((post) => {
      const related = post.eventId
        ? store.events.find((event) => event.id === post.eventId)
        : undefined;
      return toModerationPost({
        ...post,
        createdAt: post.createdAt,
        eventSlug: related?.slug ?? null,
        eventTitle: related?.title ?? null,
      });
    });
}

export async function getModerationPost(
  id: string,
): Promise<ModerationPost | null> {
  const db = getDb();
  if (db) {
    const [row] = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        status: posts.status,
        ipHash: posts.ipHash,
        ipEncrypted: posts.ipEncrypted,
        userAgent: posts.userAgent,
        eventSlug: events.slug,
        eventTitle: events.title,
      })
      .from(posts)
      .leftJoin(events, eq(posts.eventId, events.id))
      .where(eq(posts.id, id))
      .limit(1);
    return row ? toModerationPost(row) : null;
  }
  const store = mockDb();
  const post = store.posts.find((item) => item.id === id);
  if (!post) return null;
  const related = post.eventId
    ? store.events.find((event) => event.id === post.eventId)
    : undefined;
  return toModerationPost({
    ...post,
    eventSlug: related?.slug ?? null,
    eventTitle: related?.title ?? null,
  });
}

export async function setPostStatus(
  id: string,
  status: PostStatus,
): Promise<boolean> {
  const db = getDb();
  if (db) {
    const result = await db
      .update(posts)
      .set({ status, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning({ id: posts.id });
    return result.length > 0;
  }
  const post = mockDb().posts.find((item) => item.id === id);
  if (!post) return false;
  post.status = status;
  post.updatedAt = new Date().toISOString();
  return true;
}

export async function removePostsByOrigin(ipHash: string): Promise<number> {
  const db = getDb();
  if (db) {
    const result = await db
      .update(posts)
      .set({ status: "removed", updatedAt: new Date() })
      .where(and(eq(posts.ipHash, ipHash), ne(posts.status, "removed")))
      .returning({ id: posts.id });
    return result.length;
  }
  const store = mockDb();
  let changed = 0;
  for (const post of store.posts) {
    if (post.ipHash === ipHash && post.status !== "removed") {
      post.status = "removed";
      post.updatedAt = new Date().toISOString();
      changed += 1;
    }
  }
  return changed;
}

export async function blockOrigin(input: {
  ipHash: string;
  reason: string;
  expiresAt: Date | null;
  createdBy: string | null;
}): Promise<void> {
  const db = getDb();
  if (db) {
    await db
      .insert(blockedOrigins)
      .values({
        ipHash: input.ipHash,
        reason: input.reason,
        expiresAt: input.expiresAt,
        createdBy: input.createdBy,
      })
      .onConflictDoUpdate({
        target: blockedOrigins.ipHash,
        set: {
          reason: input.reason,
          blockedAt: new Date(),
          expiresAt: input.expiresAt,
          createdBy: input.createdBy,
        },
      });
    return;
  }
  const store = mockDb();
  const existing = store.blocked.find((item) => item.ipHash === input.ipHash);
  const record = {
    id: existing?.id ?? newId(),
    ipHash: input.ipHash,
    reason: input.reason,
    blockedAt: new Date().toISOString(),
    expiresAt: input.expiresAt ? input.expiresAt.toISOString() : null,
    createdBy: input.createdBy,
  };
  if (existing) {
    Object.assign(existing, record);
  } else {
    store.blocked.unshift(record);
  }
}

export async function unblockOrigin(ipHash: string): Promise<void> {
  const db = getDb();
  if (db) {
    await db.delete(blockedOrigins).where(eq(blockedOrigins.ipHash, ipHash));
    return;
  }
  const store = mockDb();
  const index = store.blocked.findIndex((item) => item.ipHash === ipHash);
  if (index !== -1) store.blocked.splice(index, 1);
}

export async function listBlockedOrigins(): Promise<BlockedOrigin[]> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(blockedOrigins)
      .orderBy(desc(blockedOrigins.blockedAt));
    return rows.map((row) => ({
      id: row.id,
      ipHash: row.ipHash,
      reason: row.reason,
      blockedAt: row.blockedAt.toISOString(),
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      createdBy: row.createdBy,
    }));
  }
  return mockDb()
    .blocked.slice()
    .sort((a, b) => b.blockedAt.localeCompare(a.blockedAt));
}

export type OriginStats = {
  total: number;
  active: number;
  hidden: number;
  removed: number;
  lastSeenAt: string | null;
};

export async function getOriginStats(ipHash: string): Promise<OriginStats> {
  const all = await listModerationPosts({ originHash: ipHash, limit: 200 });
  return {
    total: all.length,
    active: all.filter((post) => post.status === "active").length,
    hidden: all.filter((post) => post.status === "hidden").length,
    removed: all.filter((post) => post.status === "removed").length,
    lastSeenAt: all[0]?.createdAt ?? null,
  };
}

export type AdminCounts = {
  posts: { total: number; active: number; hidden: number; removed: number };
  events: number;
  reports: number;
  blocked: number;
};

export async function getAdminCounts(): Promise<AdminCounts> {
  const db = getDb();
  if (db) {
    const [totals] = await db.select({ value: count() }).from(posts);
    const [active] = await db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.status, "active"));
    const [hidden] = await db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.status, "hidden"));
    const [removed] = await db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.status, "removed"));
    const [eventCount] = await db.select({ value: count() }).from(events);
    const [reportCount] = await db.select({ value: count() }).from(reports);
    const [blockedCount] = await db
      .select({ value: count() })
      .from(blockedOrigins);
    return {
      posts: {
        total: Number(totals?.value ?? 0),
        active: Number(active?.value ?? 0),
        hidden: Number(hidden?.value ?? 0),
        removed: Number(removed?.value ?? 0),
      },
      events: Number(eventCount?.value ?? 0),
      reports: Number(reportCount?.value ?? 0),
      blocked: Number(blockedCount?.value ?? 0),
    };
  }
  const store = mockDb();
  return {
    posts: {
      total: store.posts.length,
      active: store.posts.filter((post) => post.status === "active").length,
      hidden: store.posts.filter((post) => post.status === "hidden").length,
      removed: store.posts.filter((post) => post.status === "removed").length,
    },
    events: store.events.length,
    reports: store.reports.length,
    blocked: store.blocked.length,
  };
}
