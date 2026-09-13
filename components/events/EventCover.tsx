import Image from "next/image";

function hash(input: string): number {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) >>> 0;
  }
  return value;
}

// Larguras limitadas a ~62%: a faixa de texto fica na metade esquerda e o
// icone respira no campo vinho a direita, sem se perder sobre o bege.
const LAYOUTS = [
  [56, 38, 62, 30, 48],
  [44, 60, 34, 52, 40],
  [62, 34, 50, 42, 58],
  [38, 54, 46, 62, 36],
] as const;

/**
 * Capa provisoria: faixas horizontais nas cores oficiais, em ritmo
 * irregular, com o icone da marca. Nenhuma fotografia e simulada. Quando o
 * evento tiver coverImage real, ela assume o lugar automaticamente.
 */
export function EventCover({
  slug,
  title,
  coverImage,
  className = "",
  priority = false,
}: {
  slug: string;
  title: string;
  coverImage?: string | null;
  className?: string;
  priority?: boolean;
}) {
  if (coverImage) {
    return (
      <div className={`relative overflow-hidden bg-wine ${className}`}>
        <Image
          src={coverImage}
          alt={`Capa do evento ${title}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
    );
  }

  const seed = hash(slug);
  const widths = LAYOUTS[seed % LAYOUTS.length];
  const palettes = [
    ["#510000", "#CCB49A", "#514D32", "#452A21", "#CCB49A"],
    ["#452A21", "#CCB49A", "#510000", "#514D32", "#CCB49A"],
    ["#514D32", "#CCB49A", "#452A21", "#510000", "#CCB49A"],
  ] as const;
  const palette = palettes[seed % palettes.length];
  const offset = 7 + (seed % 12);

  return (
    <div
      role="img"
      aria-label={`Capa provisória do evento ${title}`}
      className={`relative overflow-hidden bg-wine-deep ${className}`}
    >
      <div
        className="absolute inset-0 flex flex-col justify-center gap-[0.5rem]"
        style={{ paddingLeft: `${offset}%` }}
      >
        {widths.map((width, index) => (
          <span
            key={index}
            style={{
              width: `${width}%`,
              backgroundColor: palette[index % palette.length],
              height: index === 2 || index === 3 ? "15%" : "9%",
            }}
          />
        ))}
      </div>
      <Image
        src="/brand/afroretratos-icone-bege.png"
        alt=""
        width={809}
        height={727}
        className="absolute top-1/2 right-[7%] h-[40%] w-auto -translate-y-1/2"
      />
    </div>
  );
}
