import type { MetadataRoute } from "next";
import { listEvents } from "@/services/events";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await listEvents();
    eventEntries = events.map((event) => ({
      url: `${siteUrl}/eventos/${event.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    eventEntries = [];
  }

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/eventos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/feed`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...eventEntries,
  ];
}
