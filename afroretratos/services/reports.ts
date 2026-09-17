import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { mockDb, newId } from "@/lib/db/mock-store";
import { posts, reports } from "@/lib/db/schema";
import type { ReportRecord } from "@/lib/types";

export async function createReport(input: {
  postId: string;
  reason: string;
  reporterIpHash: string;
}): Promise<boolean> {
  const db = getDb();
  if (db) {
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, input.postId))
      .limit(1);
    if (!post) return false;
    await db.insert(reports).values({
      postId: input.postId,
      reason: input.reason,
      reporterIpHash: input.reporterIpHash,
    });
    return true;
  }

  const store = mockDb();
  const post = store.posts.find((item) => item.id === input.postId);
  if (!post) return false;
  store.reports.unshift({
    id: newId(),
    postId: input.postId,
    reason: input.reason,
    reporterIpHash: input.reporterIpHash,
    createdAt: new Date().toISOString(),
  });
  return true;
}

export async function listReports(limit = 80): Promise<ReportRecord[]> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select({
        id: reports.id,
        postId: reports.postId,
        reason: reports.reason,
        createdAt: reports.createdAt,
        content: posts.content,
      })
      .from(reports)
      .leftJoin(posts, eq(reports.postId, posts.id))
      .orderBy(desc(reports.createdAt))
      .limit(limit);
    return rows.map((row) => ({
      id: row.id,
      postId: row.postId,
      postExcerpt: (row.content ?? "").slice(0, 160),
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  const store = mockDb();
  return store.reports.slice(0, limit).map((report) => {
    const post = store.posts.find((item) => item.id === report.postId);
    return {
      id: report.id,
      postId: report.postId,
      postExcerpt: (post?.content ?? "").slice(0, 160),
      reason: report.reason,
      createdAt: report.createdAt,
    };
  });
}
