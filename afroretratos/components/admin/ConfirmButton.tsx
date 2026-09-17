"use client";

import type { ReactNode } from "react";

/**
 * Botao de submit com confirmacao nativa, para acoes destrutivas dentro de
 * formularios que chamam server actions.
 */
export function ConfirmButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
