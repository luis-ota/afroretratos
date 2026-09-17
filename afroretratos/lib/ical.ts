import type { PublicEvent } from "@/lib/types";

const TIME_ZONE = "America/Sao_Paulo";
const TIME_ZONE_OFFSET = "-03:00";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

function isAllDay(value: string): boolean {
  return timeFormatter.format(new Date(value)) === "00:00";
}

/** Data no formato ICS (YYYYMMDD), no fuso do projeto. */
function icsDate(value: string): string {
  return dateFormatter.format(new Date(value)).replace(/-/g, "");
}

/** Data e hora no formato ICS (YYYYMMDDTHHMMSS), no fuso do projeto. */
function icsDateTime(value: string): string {
  const date = new Date(value);
  const day = icsDate(value);
  const [hour, minute] = timeFormatter.format(date).split(":");
  return `${day}T${hour}${minute}00`;
}

function addDays(value: string, days: number): string {
  const date = new Date(`${dateFormatter.format(new Date(value))}T12:00:00${TIME_ZONE_OFFSET}`);
  date.setDate(date.getDate() + days);
  return dateFormatter.format(date).replace(/-/g, "");
}

/** Escapa texto para o padrao ICS (virgula, ponto e virgula, barra e quebras). */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Dobra linhas longas em 73 caracteres, como pede a RFC 5545. */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    parts.push(rest.slice(0, 73));
    rest = rest.slice(73);
  }
  parts.push(rest);
  return parts.join("\r\n ");
}

export function buildEventIcs(event: PublicEvent, siteUrl: string): string {
  const allDay = isAllDay(event.startsAt) && (!event.endsAt || isAllDay(event.endsAt));
  const url = `${siteUrl.replace(/\/$/, "")}/eventos/${event.slug}`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AfroRetratos//Eventos//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}@afroretratos.wired.rs`,
    `DTSTAMP:${stamp}`,
  ];

  if (allDay) {
    lines.push(`DTSTART;VALUE=DATE:${icsDate(event.startsAt)}`);
    const endExclusive = event.endsAt
      ? addDays(event.endsAt, 1)
      : addDays(event.startsAt, 1);
    lines.push(`DTEND;VALUE=DATE:${endExclusive}`);
  } else {
    lines.push(
      `DTSTART;TZID=${TIME_ZONE}:${icsDateTime(event.startsAt)}`,
    );
    if (event.endsAt && !isAllDay(event.endsAt)) {
      lines.push(`DTEND;TZID=${TIME_ZONE}:${icsDateTime(event.endsAt)}`);
    }
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  const place = [event.venue, event.location].filter(Boolean).join(", ");
  if (place) lines.push(`LOCATION:${escapeIcsText(place)}`);
  lines.push(`URL:${url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(fold).join("\r\n") + "\r\n";
}
