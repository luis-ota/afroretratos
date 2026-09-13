import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getEventById } from "@/services/events";
import { deleteEventAction } from "../actions";
import { EventForm } from "../event-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <div>
      <Link
        href="/admin/eventos"
        className="text-xs font-medium tracking-[0.12em] text-brown-raised uppercase underline decoration-brown-deep/30 hover:decoration-brown-deep"
      >
        Voltar para eventos
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] leading-none">
            Editar evento
          </h1>
          <p className="mt-3 text-sm text-brown-raised">
            Página pública:{" "}
            <Link
              href={`/eventos/${event.slug}`}
              className="underline decoration-brown-deep/30 hover:decoration-brown-deep"
            >
              /eventos/{event.slug}
            </Link>
          </p>
        </div>
        <form action={deleteEventAction}>
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="slug" value={event.slug} />
          <ConfirmButton
            message={`Excluir "${event.title}"? Os relatos ligados a ele continuam no Feed, sem evento.`}
            className="rounded-md border border-wine bg-wine px-4 py-2.5 text-xs font-medium tracking-[0.08em] text-beige uppercase transition-colors hover:bg-wine-deep"
          >
            Excluir evento
          </ConfirmButton>
        </form>
      </div>
      <div className="mt-10">
        <EventForm event={event} />
      </div>
    </div>
  );
}
