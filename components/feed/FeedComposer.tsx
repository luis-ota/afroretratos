"use client";

import { useId, useRef, useState } from "react";
import type { EventOption, PublicPost } from "@/lib/types";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function FeedComposer({
  events,
  initialEventId = "",
  onPosted,
}: {
  events: EventOption[];
  initialEventId?: string;
  onPosted: (post: PublicPost) => void;
}) {
  const [content, setContent] = useState("");
  const [eventId, setEventId] = useState(initialEventId);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (status.kind === "sending") return;
    setStatus({ kind: "sending" });

    const formData = new FormData(formEvent.currentTarget);
    const payload = {
      content,
      eventId: eventId || null,
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        const data = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setStatus({
          kind: "error",
          message:
            data?.error?.message ??
            "Muitas publicações em pouco tempo. Aguarde alguns instantes e tente de novo.",
        });
        return;
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setStatus({
          kind: "error",
          message:
            data?.error?.message ??
            "Não foi possível publicar agora. Tente novamente.",
        });
        return;
      }

      const data = (await response.json()) as { post: PublicPost };
      onPosted(data.post);
      setContent("");
      setEventId("");
      formRef.current?.reset();
      setStatus({ kind: "sent" });
    } catch {
      setStatus({
        kind: "error",
        message: "Falha de conexão. Tente novamente em instantes.",
      });
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="relative overflow-hidden rounded-lg bg-wine px-6 py-8 text-beige sm:px-10 sm:py-10"
    >
      <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-none">
        Compartilhe seu relato
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-beige/85">
        Sua publicação é pública e anônima. Não pedimos cadastro e não
        mostramos nome, apelido ou qualquer identificação.
      </p>

      <div className="mt-8">
        <label
          htmlFor={`${fieldId}-content`}
          className="block text-sm font-medium"
        >
          Seu relato
        </label>
        <textarea
          id={`${fieldId}-content`}
          name="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          minLength={3}
          maxLength={1200}
          rows={6}
          placeholder="Escreva com suas palavras o que você viveu, viu ou sentiu."
          className="mt-2 w-full rounded-md border border-beige/40 bg-beige px-4 py-3 font-body text-[1.0125rem] leading-relaxed text-brown-deep placeholder:text-brown-raised focus:border-beige focus-visible:outline-beige-light"
        />
        <p className="mt-1 text-right text-xs text-beige/85 tabular">
          {content.length}/1200
        </p>
      </div>

      <div className="mt-6">
        <label htmlFor={`${fieldId}-event`} className="block text-sm font-medium">
          Relacionado a algum evento? <span className="text-beige/85">(opcional)</span>
        </label>
        <select
          id={`${fieldId}-event`}
          name="eventId"
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          className="mt-2 w-full rounded-md border border-beige/40 bg-beige px-4 py-3 text-base text-brown-deep focus:border-beige focus-visible:outline-beige-light sm:max-w-md sm:text-sm"
        >
          <option value="">Nenhum evento</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={`${fieldId}-website`}>Não preencha este campo</label>
        <input
          id={`${fieldId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-beige px-7 py-3 text-sm font-medium tracking-[0.08em] text-wine uppercase transition-colors hover:bg-beige-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status.kind === "sending" ? "Publicando…" : "Publicar anonimamente"}
        </button>
        <p
          aria-live="polite"
          key={status.kind}
          className={`text-sm text-beige/90 ${
            status.kind === "sent" || status.kind === "error"
              ? "afro-print-in"
              : ""
          }`}
        >
          {status.kind === "sent"
            ? "Relato publicado. Obrigado por compartilhar."
            : status.kind === "error"
              ? status.message
              : ""}
        </p>
      </div>
    </form>
  );
}
