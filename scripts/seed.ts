import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { mockEvents, mockPosts } from "../lib/db/mock-data";
import { events, posts } from "../lib/db/schema";
import { hashOrigin } from "../lib/security/hash";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error(
    "DATABASE_URL não definida. Rode com `bun --env-file=.env.local scripts/seed.ts`.",
  );
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client);

try {
  for (const event of mockEvents) {
    await db
      .insert(events)
      .values({
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description,
        coverImage: event.coverImage,
        startsAt: new Date(event.startsAt),
        endsAt: event.endsAt ? new Date(event.endsAt) : null,
        venue: event.venue,
        location: event.location,
        status: event.status,
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      })
      .onConflictDoNothing({ target: events.slug });
  }

  const [existing] = await db.select({ value: count() }).from(posts);
  if (Number(existing?.value ?? 0) === 0) {
    for (const post of mockPosts) {
      await db.insert(posts).values({
        id: post.id,
        content: post.content,
        eventId: post.eventId,
        ipHash: hashOrigin(post.ipHash),
        ipEncrypted: null,
        userAgent: null,
        status: post.status,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      });
    }
    console.log("Posts de exemplo inseridos.");
  } else {
    console.log("Tabela de posts já tem dados; seed de posts ignorado.");
  }

  const [eventCount] = await db.select({ value: count() }).from(events);
  console.log(
    `Seed concluído: ${Number(eventCount?.value ?? 0)} eventos no banco.`,
  );
} finally {
  await client.end();
}
