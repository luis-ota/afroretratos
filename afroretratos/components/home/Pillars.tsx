import { WeaveStrip } from "@/components/ui/WeaveStrip";

type Tone = "olive" | "wine" | "brown";

type TextBand = {
  kind: "text";
  title: string;
  tone: Tone;
  align: "start" | "end";
  body: string;
};

type ActionsBand = {
  kind: "actions";
  title: string;
  tone: Tone;
  align: "start" | "end";
  items: { name: string; period: string }[];
};

type PartnersBand = {
  kind: "partners";
  title: string;
  tone: Tone;
  align: "start" | "end";
  items: { name: string; role: string }[];
};

type Band = TextBand | ActionsBand | PartnersBand;

const BANDS: Band[] = [
  {
    kind: "actions",
    title: "Ações",
    tone: "olive",
    align: "start",
    items: [
      { name: "Manifesto", period: "21 a 25 de setembro" },
      { name: "Roda de Conversa PUCPR", period: "28 de setembro a 2 de outubro" },
      { name: "Dia das Crianças", period: "5 a 9 de outubro" },
      {
        name: "Roda de Conversa Coletivo Preto",
        period: "12 a 16 de outubro",
      },
      { name: "Evento de Beleza", period: "7 de novembro" },
      { name: "Documentário", period: "em produção" },
    ],
  },
  {
    kind: "text",
    title: "Relatos",
    tone: "wine",
    align: "end",
    body: "O Feed é um espaço de identificação, diálogo e expressão: relatos anônimos sobre vivências, identidade e representatividade, ligados ou não a uma ação do projeto. Publicar não exige cadastro.",
  },
  {
    kind: "partners",
    title: "Parceiros",
    tone: "brown",
    align: "start",
    items: [
      {
        name: "Coletivo Preto",
        role: "Movimento estudantil negro criado em Curitiba em 2022, com foco na educação antirracista e na representatividade negra.",
      },
      {
        name: "Coletivo NEGRES",
        role: "Movimento estudantil da PUCPR dedicado à união e ao fortalecimento de estudantes pretos e pardos.",
      },
      {
        name: "Lígia Santos",
        role: "Psicóloga negra com foco no atendimento de mulheres pretas em situação de vulnerabilidade social.",
      },
    ],
  },
];

const TONES: Record<Tone, string> = {
  olive: "bg-olive text-beige-light",
  wine: "bg-wine text-beige",
  brown: "bg-brown text-beige",
};

function BandContent({ band }: { band: Band }) {
  const isOlive = band.tone === "olive";
  const seam = isOlive
    ? "border-beige-light/30"
    : "border-beige/25";

  if (band.kind === "text") {
    return (
      <p
        className={`max-w-[54ch] self-end text-[1.0625rem] leading-[1.75] ${
          isOlive ? "text-beige-light/90" : "text-beige/90"
        }`}
      >
        {band.body}
      </p>
    );
  }

  if (band.kind === "actions") {
    return (
      <dl className="w-full">
        {band.items.map((item) => (
          <div
            key={item.name}
            className={`flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t ${seam} py-4`}
          >
            <dt className="font-medium">{item.name}</dt>
            <dd
              className={`text-sm tabular ${
                isOlive ? "text-beige-light/85" : "text-beige/80"
              }`}
            >
              {item.period}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="w-full">
      {band.items.map((item) => (
        <div
          key={item.name}
          className={`border-t ${seam} py-5`}
        >
          <dt className="font-medium">{item.name}</dt>
          <dd
            className={`mt-1.5 max-w-[52ch] text-[0.9375rem] leading-relaxed ${
              isOlive ? "text-beige-light/85" : "text-beige/80"
            }`}
          >
            {item.role}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Pillars() {
  return (
    <section aria-label="O que compõe o AfroRetratos" className="bg-beige">
      <WeaveStrip />
      {BANDS.map((band) => (
        <article
          key={band.title}
          className={`${TONES[band.tone]} py-16 sm:py-20 lg:py-24`}
        >
          <div
            className={`mx-auto grid max-w-[96rem] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8 ${
              band.align === "end" ? "pl-10 sm:pl-12 lg:pl-8" : ""
            }`}
          >
            <h3
              className={`font-subtitle text-[clamp(2.2rem,5.4vw,4rem)] leading-none tracking-[-0.01em] lg:col-span-5 ${
                band.align === "end"
                  ? "lg:col-start-8 lg:text-right"
                  : "lg:col-start-1"
              }`}
            >
              {band.title}
            </h3>
            <div
              className={`lg:col-span-6 ${
                band.align === "end"
                  ? "lg:col-start-1 lg:row-start-1"
                  : "lg:col-start-7 lg:row-start-1"
              }`}
            >
              <BandContent band={band} />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
