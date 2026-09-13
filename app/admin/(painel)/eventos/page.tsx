import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { formatDateTimeRange } from "@/lib/format";
import type { EventStatus } from "@/lib/types";
import { listEvents } from "@/services/events";
import { deleteEventAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Em breve",
  finished: "Encerrado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<EventStatus, string> = {
  upcoming: "border-olive-deep text-olive-deep",
  finished: "border-brown-deep/50 text-brown-raised",
  cancelled: "border-wine bg-wine text-beige",
};

const BUTTON =
  "rounded-md border border-brown-deep/40 px-3.5 py-2 text-xs font-medium tracking-[0.08em] uppercase transition-colors hover:bg-brown-deep hover:text-beige";
const DANGER =
  "rounded-md border border-wine bg-wine px-3.5 py-2 text-xs font-medium tracking-[0.08em] text-beige uppercase transition-colors hover:bg-wine-deep";

type Props = {
  searchParams: Promise<{ salvo?: string; excluido?: string }>;
};

export default async function AdminEventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const events = await listEvents();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-none">
            Eventos
          </h1>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-brown-raised">
            As ações do projeto: crie, edite e exclua. A situação controla o que
            aparece no site; eventos com data passada viram “Encerrado”
            automaticamente na exibição.
          </p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-wine px-6 py-3 text-sm font-medium tracking-[0.08em] text-beige uppercase transition-colors hover:bg-wine-deep"
        >
          Novo evento
        </Link>
      </div>

      {params.salvo ? (
        <p
          role="status"
          className="afro-print-in mt-6 rounded-md border border-olive-deep/40 bg-olive/5 p-4 text-sm text-olive-deep"
        >
          Evento salvo e site atualizado.
        </p>
      ) : null}
      {params.excluido ? (
        <p
          role="status"
          className="afro-print-in mt-6 rounded-md border border-wine/40 bg-wine/5 p-4 text-sm text-wine"
        >
          Evento excluído.
        </p>
      ) : null}

      {events.length === 0 ? (
        <p className="mt-8 border-t border-brown-deep/20 pt-6 text-sm text-brown-raised">
          Nenhum evento cadastrado. Use “Novo evento” para criar o primeiro.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
            <caption className="sr-only">Lista de eventos</caption>
            <thead>
              <tr className="border-b border-brown-deep/30 text-xs tracking-[0.12em] text-brown-raised uppercase">
                <th scope="col" className="py-3 pr-4 font-medium">
                  Evento
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Data
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Situação
                </th>
                <th scope="col" className="py-3 font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-deep/15">
              {events.map((event) => (
                <tr key={event.id} className="align-top">
                  <td className="py-4 pr-4">
                    <Link
                      href={`/admin/eventos/${event.id}`}
                      className="font-medium underline decoration-brown-deep/30 hover:decoration-brown-deep"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-xs text-brown-raised">
                      /eventos/{event.slug}
                    </p>
                  </td>
                  <td className="py-4 pr-4 text-xs text-brown-raised">
                    {formatDateTimeRange(event.startsAt, event.endsAt)}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.1em] uppercase ${STATUS_STYLES[event.status]}`}
                    >
                      {STATUS_LABELS[event.status]}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/eventos/${event.id}`} className={BUTTON}>
                        Editar
                      </Link>
                      <form action={deleteEventAction}>
                        <input type="hidden" name="id" value={event.id} />
                        <input type="hidden" name="slug" value={event.slug} />
                        <ConfirmButton
                          message={`Excluir "${event.title}"? Os relatos ligados a ele continuam no Feed, sem evento.`}
                          className={DANGER}
                        >
                          Excluir
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
