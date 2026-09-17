import { EventStrip } from "@/components/events/EventStrip";
import { ActionLink } from "@/components/ui/Action";
import type { PublicEvent } from "@/lib/types";

export function NextEvents({ events }: { events: PublicEvent[] }) {
  return (
    <section
      aria-labelledby="proximos-eventos"
      className="bg-beige text-brown-deep"
    >
      <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            id="proximos-eventos"
            className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] tracking-[-0.015em]"
          >
            Próximos eventos
          </h2>
          <ActionLink
            href="/eventos"
            variant="outline-dark"
            className="w-full sm:w-auto"
          >
            Todos os eventos
          </ActionLink>
        </div>

        {events.length > 0 ? (
          <ul className="mt-12">
            {events.map((event) => (
              <EventStrip key={event.id} event={event} />
            ))}
          </ul>
        ) : (
          <p className="mt-12 border-t border-brown-deep/20 pt-8 font-subtitle text-2xl">
            Nenhum evento anunciado no momento. Novas datas entram aqui.
          </p>
        )}
      </div>
    </section>
  );
}
