import type { EventStatus } from "@/lib/types";

const LABELS: Record<EventStatus, string> = {
  upcoming: "Em breve",
  finished: "Aconteceu",
  cancelled: "Cancelado",
};

export function EventStatusTag({
  status,
  tone = "light",
}: {
  status: EventStatus;
  tone?: "light" | "dark";
}) {
  const styles: Record<EventStatus, string> = {
    upcoming:
      tone === "dark"
        ? "border-beige-light/80 text-beige-light"
        : "border-olive-deep text-olive-deep",
    finished:
      tone === "dark"
        ? "border-beige-light/45 text-beige-light/90"
        : "border-brown/50 text-brown-raised",
    cancelled:
      tone === "dark"
        ? "border-beige bg-beige text-wine"
        : "border-wine bg-wine text-beige",
  };

  return (
    <span
      className={`inline-flex items-center rounded border px-3 py-1 text-[0.6875rem] font-medium tracking-[0.16em] uppercase ${styles[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
