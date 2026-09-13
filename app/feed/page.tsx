import type { Metadata } from "next";
import { FeedStream } from "@/components/feed/FeedStream";
import { listEventOptions } from "@/services/events";
import { listPublicPosts } from "@/services/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feed",
  description:
    "Relatos anônimos sobre representatividade, autoestima e pertencimento, publicados sem cadastro e sem identificação pública.",
  alternates: { canonical: "/feed" },
};

type Props = { searchParams: Promise<{ evento?: string }> };

export default async function FeedPage({ searchParams }: Props) {
  const params = await searchParams;
  const [page, events] = await Promise.all([
    listPublicPosts({ limit: 20 }),
    listEventOptions(),
  ]);

  const initialEvent = params.evento
    ? events.find((event) => event.slug === params.evento)
    : undefined;

  return (
    <>
      <header className="bg-wine text-beige">
        <div className="mx-auto grid max-w-[96rem] gap-8 px-5 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16 lg:grid-cols-12 lg:items-end">
          <h1 className="font-display text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.92] tracking-[-0.015em] lg:col-span-6">
            Feed
          </h1>
          <p className="max-w-[52ch] text-[1.0625rem] leading-[1.75] text-beige/85 lg:col-span-5 lg:col-start-8">
            Relatos anônimos sobre representatividade, autoestima e
            pertencimento. Publique sem cadastro; no Feed, sua identidade é
            apenas Anônimo, e nenhum dado técnico aparece por aqui.
          </p>
        </div>
      </header>

      <section aria-label="Publicar e ler relatos" className="bg-beige">
        <div className="mx-auto max-w-[96rem] px-5 py-12 sm:px-8 sm:py-16">
          <FeedStream
            initialPosts={page.posts}
            initialCursor={page.nextCursor}
            events={events}
            initialEventId={initialEvent?.id ?? ""}
          />
        </div>
      </section>
    </>
  );
}
