import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { mockDb } from "@/lib/db/mock-store";
import { events } from "@/lib/db/schema";
import type { EventOption, EventStatus, PublicEvent } from "@/lib/types";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  startsAt: Date | string;
  endsAt: Date | string | null;
  venue: string;
  location: string;
  status: EventStatus;
};

function asIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/**
 * O status exibido e derivado da data (evitando "upcoming" vencido), exceto
 * quando o evento foi cancelado: cancelamento sempre vence.
 */
export function displayStatus(event: {
  status: EventStatus;
  startsAt: string;
}): EventStatus {
  if (event.status === "cancelled") return "cancelled";
  return new Date(event.startsAt).getTime() < Date.now()
    ? "finished"
    : "upcoming";
}

export function toPublicEvent(row: EventRow): PublicEvent {
  const event: PublicEvent = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImage: row.coverImage,
    startsAt: asIso(row.startsAt),
    endsAt: row.endsAt ? asIso(row.endsAt) : null,
    venue: row.venue,
    location: row.location,
    status: displayStatus({ status: row.status, startsAt: asIso(row.startsAt) }),
  };
  return event;
}

export async function listEvents(): Promise<PublicEvent[]> {
  const db = getDb();
  if (db) {
    const rows = await db.select().from(events).orderBy(asc(events.startsAt));
    return rows.map(toPublicEvent);
  }
  return mockDb()
    .events.map((event) => toPublicEvent(event))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getEventBySlug(slug: string): Promise<PublicEvent | null> {
  const db = getDb();
  if (db) {
    const [row] = await db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);
    return row ? toPublicEvent(row) : null;
  }
  const found = mockDb().events.find((event) => event.slug === slug);
  return found ? toPublicEvent(found) : null;
}

export async function getEventById(id: string): Promise<PublicEvent | null> {
  const db = getDb();
  if (db) {
    const [row] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    return row ? toPublicEvent(row) : null;
  }
  const found = mockDb().events.find((event) => event.id === id);
  return found ? toPublicEvent(found) : null;
}

export async function listEventOptions(): Promise<EventOption[]> {
  const all = await listEvents();
  return all.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    startsAt: event.startsAt,
    status: event.status,
  }));
}

export function splitEvents(events: PublicEvent[]): {
  upcoming: PublicEvent[];
  past: PublicEvent[];
} {
  const now = Date.now();
  const upcoming: PublicEvent[] = [];
  const past: PublicEvent[] = [];
  for (const event of events) {
    const isFuture = new Date(event.startsAt).getTime() >= now;
    if (event.status === "upcoming" || (event.status === "cancelled" && isFuture)) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }
  upcoming.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  past.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return { upcoming, past };
}
