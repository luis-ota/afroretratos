import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[seed] DATABASE_URL ausente.");
  process.exit(1);
}

const secret = process.env.ORIGIN_HASH_SECRET ?? "";
const hashOrigin = (value) =>
  createHmac("sha256", secret)
    .update(`afroretratos:origin:${value}`)
    .digest("hex");

const data = JSON.parse(
  readFileSync(join(import.meta.dirname, "seed-data.json"), "utf8"),
);
const sql = postgres(url, { max: 1, prepare: false });

try {
  for (const event of data.events) {
    await sql`
      insert into events (
        id, slug, title, description, cover_image, starts_at, ends_at,
        venue, location, status, created_at, updated_at
      ) values (
        ${event.id}, ${event.slug}, ${event.title}, ${event.description},
        ${event.coverImage}, ${event.startsAt}, ${event.endsAt},
        ${event.venue}, ${event.location}, ${event.status}::event_status,
        ${event.createdAt}, ${event.updatedAt}
      ) on conflict (slug) do nothing
    `;
  }

  const [{ count }] = await sql`select count(*)::int as count from posts`;
  if (count === 0) {
    for (const post of data.posts) {
      await sql`
        insert into posts (
          id, content, event_id, ip_hash, ip_encrypted, user_agent,
          status, created_at, updated_at
        ) values (
          ${post.id}, ${post.content}, ${post.eventId},
          ${hashOrigin(post.ipHash)}, null, null, ${post.status}::post_status,
          ${post.createdAt}, ${post.updatedAt}
        )
      `;
    }
    console.log("[seed] posts de exemplo inseridos.");
  } else {
    console.log("[seed] posts já existem; seed de posts ignorado.");
  }
  console.log("[seed] ok");
} finally {
  await sql.end();
}
