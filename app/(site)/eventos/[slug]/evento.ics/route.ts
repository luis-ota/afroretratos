import { buildEventIcs } from "@/lib/ical";
import { getEventBySlug } from "@/services/events";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return new Response("Evento não encontrado.", { status: 404 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://afroretratos.wired.rs";
  const body = buildEventIcs(event, siteUrl);

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="afroretratos-${event.slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
