import { describe, expect, test } from "bun:test";
import { buildEventIcs, escapeIcsText } from "../lib/ical";
import type { PublicEvent } from "../lib/types";

const base: PublicEvent = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "manifesto",
  title: "Manifesto",
  description: "Apresentar o projeto; com vírgulas, e acentos.",
  coverImage: null,
  startsAt: "2026-09-21T00:00:00-03:00",
  endsAt: "2026-09-25T00:00:00-03:00",
  venue: "A definir",
  location: "Curitiba, PR",
  status: "upcoming",
};

describe("escapeIcsText", () => {
  test("escapa vírgulas, ponto e vírgula e quebras", () => {
    expect(escapeIcsText("a, b; c\nd")).toBe("a\\, b\\; c\\nd");
  });
});

describe("buildEventIcs", () => {
  test("evento de dia inteiro usa VALUE=DATE e intervalo inclusivo", () => {
    const ics = buildEventIcs(base, "https://afroretratos.wired.rs");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260921");
    expect(ics).toContain("DTEND;VALUE=DATE:20260926");
    expect(ics).toContain("SUMMARY:Manifesto");
    expect(ics).toContain("URL:https://afroretratos.wired.rs/eventos/manifesto");
    expect(ics).toContain("LOCATION:A definir\\, Curitiba\\, PR");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  test("evento com horário usa TZID America/Sao_Paulo", () => {
    const ics = buildEventIcs(
      {
        ...base,
        slug: "evento-de-beleza",
        startsAt: "2026-11-07T14:00:00-03:00",
        endsAt: "2026-11-07T20:00:00-03:00",
      },
      "https://afroretratos.wired.rs",
    );
    expect(ics).toContain("DTSTART;TZID=America/Sao_Paulo:20261107T140000");
    expect(ics).toContain("DTEND;TZID=America/Sao_Paulo:20261107T200000");
  });
});
