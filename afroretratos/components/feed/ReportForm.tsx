"use client";

import { useId, useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function ReportForm({ postId }: { postId: string }) {
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fieldId = useId();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "sending") return;
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reason }),
      });
      if (response.status === 429) {
        setStatus({
          kind: "error",
          message:
            "Recebemos muitas denúncias deste acesso em pouco tempo. Tente novamente mais tarde.",
        });
        return;
      }
      if (!response.ok) {
        setStatus({
          kind: "error",
          message: "Não foi possível enviar a denúncia. Tente novamente.",
        });
        return;
      }
      setReason("");
      setStatus({ kind: "sent" });
    } catch {
      setStatus({
        kind: "error",
        message: "Falha de conexão. Tente novamente em instantes.",
      });
    }
  }

  return (
    <details className="group mt-4">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-xs font-medium tracking-[0.14em] text-brown-raised uppercase hover:text-wine">
        Denunciar relato
      </summary>
      <form onSubmit={submit} className="mt-3 max-w-lg">
        <label htmlFor={`${fieldId}-reason`} className="block text-sm font-medium">
          O que há de errado com este relato?
        </label>
        <textarea
          id={`${fieldId}-reason`}
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required
          minLength={3}
          maxLength={500}
          rows={3}
          className="mt-2 w-full rounded-md border border-brown-deep/30 bg-beige-light/40 px-3 py-2 text-base focus:border-wine focus-visible:outline-wine sm:text-sm"
        />
        <div className="mt-3 flex items-center gap-4">
          <button
            type="submit"
            disabled={status.kind === "sending"}
            className="inline-flex min-h-11 items-center rounded-md border border-brown-deep/50 px-4 py-2 text-xs font-medium tracking-[0.12em] uppercase transition-colors hover:bg-brown-deep hover:text-beige disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.kind === "sending" ? "Enviando…" : "Enviar denúncia"}
          </button>
          <p aria-live="polite" className="text-xs text-brown-raised">
            {status.kind === "sent"
              ? "Denúncia registrada. Obrigado."
              : status.kind === "error"
                ? status.message
                : "Sua denúncia é anônima."}
          </p>
        </div>
      </form>
    </details>
  );
}
