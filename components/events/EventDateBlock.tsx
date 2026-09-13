import { eventDateParts } from "@/lib/format";

export function EventDateBlock({
  startsAt,
  tone = "light",
  size = "md",
}: {
  startsAt: string;
  tone?: "light" | "dark";
  size?: "md" | "lg";
}) {
  const { day, month, year, weekday } = eventDateParts(startsAt);
  const secondary = tone === "dark" ? "text-beige-light" : "text-brown-raised";

  return (
    <div className="flex items-baseline gap-3 sm:block">
      <p
        className={`font-display tabular leading-none ${
          size === "lg"
            ? "text-[clamp(3.4rem,7vw,5.5rem)]"
            : "text-[clamp(2.6rem,5vw,3.6rem)]"
        }`}
      >
        {day}
      </p>
      <div className={`sm:mt-1 ${secondary}`}>
        <p className="text-xs font-medium tracking-[0.2em] uppercase">
          {month} {year}
        </p>
        <p className="text-xs capitalize">{weekday}</p>
      </div>
    </div>
  );
}
