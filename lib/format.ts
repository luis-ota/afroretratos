const TIME_ZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const shortMonthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  timeZone: TIME_ZONE,
});

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  timeZone: TIME_ZONE,
});

const yearFormatter = new Intl.DateTimeFormat("pt-BR", {
  year: "numeric",
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  timeZone: TIME_ZONE,
});

const stampFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

export function formatEventDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatEventTime(value: string): string {
  return timeFormatter.format(new Date(value));
}

export function eventDateParts(value: string): {
  day: string;
  month: string;
  year: string;
  weekday: string;
} {
  const date = new Date(value);
  return {
    day: dayFormatter.format(date),
    month: shortMonthFormatter.format(date).replace(".", ""),
    year: yearFormatter.format(date),
    weekday: weekdayFormatter.format(date),
  };
}

/** Data e hora do relato, sem qualquer identificacao de quem publicou. */
export function formatPostTimestamp(value: string): string {
  return stampFormatter.format(new Date(value));
}

const timeOnlyFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

function isAllDay(value: string): boolean {
  return timeOnlyFormatter.format(new Date(value)) === "00:00";
}

/**
 * Datas sem horario definido (00:00) sao tratadas como "dia inteiro" e
 * aparecem sem hora: evita mostrar "00:00" em acoes que ainda nao tem
 * horario marcado.
 */
export function formatDateTimeRange(
  startsAt: string,
  endsAt: string | null,
): string {
  const startAllDay = isAllDay(startsAt);
  const start = startAllDay
    ? formatEventDate(startsAt)
    : `${formatEventDate(startsAt)}, ${formatEventTime(startsAt)}`;
  if (!endsAt) return start;

  const sameDay =
    new Date(startsAt).toDateString() === new Date(endsAt).toDateString();
  if (sameDay) {
    return startAllDay
      ? start
      : `${start} às ${formatEventTime(endsAt)}`;
  }

  const end = isAllDay(endsAt)
    ? formatEventDate(endsAt)
    : `${formatEventDate(endsAt)}, ${formatEventTime(endsAt)}`;
  return `${start} até ${end}`;
}
