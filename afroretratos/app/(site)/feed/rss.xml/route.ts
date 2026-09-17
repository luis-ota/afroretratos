import { listPublicPosts } from "@/services/posts";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://afroretratos.wired.rs";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { posts } = await listPublicPosts({ limit: 30 });

  const items = posts
    .map((post) => {
      const event = post.event
        ? `<p>Evento: <a href="${siteUrl}/eventos/${post.event.slug}">${escapeXml(post.event.title)}</a></p>`
        : "";
      const html = `${event}<p>${escapeXml(post.content).replace(/\n/g, "<br />")}</p>`;
      return `    <item>
      <title>Anônimo</title>
      <link>${siteUrl}/feed#post-${post.id}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(html.replace(/<[^>]+>/g, " "))}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Feed · AfroRetratos</title>
    <link>${siteUrl}/feed</link>
    <description>Relatos anônimos da comunidade AfroRetratos.</description>
    <language>pt-BR</language>
    <atom:link href="${siteUrl}/feed/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
