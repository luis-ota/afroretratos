import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { EventDateBlock } from "./EventDateBlock";
import { EventStatusTag } from "./EventStatusTag";
import type { PublicEvent } from "@/lib/types";

export function EventStrip({
  event,
  tone = "light",
}: {
  event: PublicEvent;
  tone?: "light" | "dark";
}) {
  const seam = tone === "dark" ? "border-beige-light/30" : "border-brown-deep/20";
  const secondary =
    tone === "dark" ? "text-beige-light/90" : "text-brown-raised";
  const press =
    tone === "dark"
      ? "active:bg-beige/10 sm:hover:bg-beige/[0.07]"
      : "active:bg-brown-deep/[0.06] sm:hover:bg-brown-deep/[0.05]";

  return (
    <li className={`border-t ${seam}`}>
      <Link
        href={`/eventos/${event.slug}`}
        className={`group grid gap-5 py-7 transition-colors duration-150 sm:grid-cols-[8.5rem_1fr_auto] sm:items-center sm:gap-10 sm:py-8 ${press}`}
      >
        <EventDateBlock startsAt={event.startsAt} tone={tone} />
        <div>
          <h3 className="font-subtitle text-2xl leading-tight tracking-tight sm:text-[1.75rem]">
            {event.title}
          </h3>
          <p className={`mt-2 text-sm ${secondary}`}>
            {event.venue}
            {event.venue && event.location ? " · " : ""}
            {event.location}
          </p>
        </div>
        <div className="flex items-center justify-between gap-5 sm:justify-end">
          <EventStatusTag status={event.status} tone={tone} />
          <Arrow className="h-3 w-6 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5" />
        </div>
      </Link>
    </li>
  );
}
