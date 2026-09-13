import type { Metadata } from "next";
import { EventStrip } from "@/components/events/EventStrip";
import { WeaveStrip } from "@/components/ui/WeaveStrip";
import { listEvents, splitEvents } from "@/services/events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Agenda dos eventos organizados pelo AfroRetratos: datas, locais, status e detalhes de cada encontro.",
  alternates: { canonical: "/eventos" },
};

export default async function EventosPage() {
  const { upcoming, past } = splitEvents(await listEvents());

  return (
    <>
      <header className="bg-brown text-beige">
        <div className="mx-auto max-w-[96rem] px-5 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16">
          <h1 className="font-display text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.92] tracking-[-0.015em]">
            Eventos
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-beige/85">
            As ações do AfroRetratos ao longo do semestre: rodas de conversa,
            Dia das Crianças, Evento de Beleza e o manifesto que abre o
            projeto. Cada ação traz data, local e status.
          </p>
        </div>
      </header>
      <WeaveStrip />

      <section
        aria-labelledby="em-cartaz"
        className="bg-beige text-brown-deep"
      >
        <div className="mx-auto max-w-[96rem] px-5 py-16 sm:px-8 sm:py-20">
          <h2
            id="em-cartaz"
            className="font-display text-[clamp(2.2rem,5.4vw,4rem)] leading-[0.95] tracking-[-0.015em]"
          >
            Em cartaz
          </h2>
          {upcoming.length > 0 ? (
            <ul className="mt-10">
              {upcoming.map((event) => (
                <EventStrip key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="mt-10 border-t border-brown-deep/20 pt-8 font-subtitle text-2xl">
              Nenhum evento anunciado no momento. Novas datas entram aqui.
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="anteriores"
        className="bg-olive text-beige-light"
      >
        <div className="mx-auto max-w-[96rem] px-5 py-16 sm:px-8 sm:py-20">
          <h2
            id="anteriores"
            className="font-display text-[clamp(2.2rem,5.4vw,4rem)] leading-[0.95] tracking-[-0.015em]"
          >
            Anteriores
          </h2>
          {past.length > 0 ? (
            <ul className="mt-10">
              {past.map((event) => (
                <EventStrip key={event.id} event={event} tone="dark" />
              ))}
            </ul>
          ) : (
            <p className="mt-10 border-t border-beige-light/30 pt-8 font-subtitle text-2xl">
              Os eventos já realizados aparecem aqui.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
