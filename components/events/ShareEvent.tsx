"use client";

import { useState } from "react";

/**
 * Compartilha usando a folha nativa do sistema quando existe; sem ela,
 * copia o link e avisa.
 */
export function ShareEvent({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // cancelado pelo usuario; cai para copia
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // sem permissao de clipboard; nao faz nada
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-live="polite"
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-brown-deep/40 px-5 py-3 text-sm font-medium tracking-[0.08em] uppercase transition-colors hover:bg-brown-deep hover:text-beige"
    >
      {copied ? "Link copiado" : "Compartilhar"}
    </button>
  );
}
