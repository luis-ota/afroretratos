import Image from "next/image";

type LogoVariant = "beige" | "brown";

const SOURCES: Record<
  LogoVariant,
  { src: string; width: number; height: number }
> = {
  beige: {
    src: "/brand/afroretratos-logo-bege.png",
    width: 2992,
    height: 727,
  },
  brown: {
    src: "/brand/afroretratos-logo-marrom.png",
    width: 1209,
    height: 373,
  },
};

export function Logo({
  variant = "beige",
  className,
  priority = false,
  alt = "AfroRetratos",
}: {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const source = SOURCES[variant];
  return (
    <Image
      src={source.src}
      alt={alt}
      width={source.width}
      height={source.height}
      priority={priority}
      className={className}
    />
  );
}

export function IconMark({
  variant = "beige",
  className,
  alt = "",
}: {
  variant?: "beige";
  className?: string;
  alt?: string;
}) {
  void variant;
  return (
    <Image
      src="/brand/afroretratos-icone-bege.png"
      alt={alt}
      width={809}
      height={727}
      className={className}
    />
  );
}
