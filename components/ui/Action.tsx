import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "beige" | "wine" | "outline-light" | "outline-dark";

const VARIANTS: Record<Variant, string> = {
  beige: "bg-beige text-wine hover:bg-beige-light",
  wine: "bg-wine text-beige hover:bg-wine-deep",
  "outline-light":
    "border border-beige/70 text-beige hover:bg-beige hover:text-wine",
  "outline-dark":
    "border border-brown-deep/40 text-brown-deep hover:bg-brown-deep hover:text-beige",
};

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-medium tracking-[0.08em] uppercase transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60";

export function ActionLink({
  href,
  variant = "beige",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function ActionButton({
  variant = "beige",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
