/**
 * Seta autoral no mesmo traco do resto da interface (1.5px). Substitui
 * glifos Unicode, que nao fazem parte de um sistema de icones.
 */
export function Arrow({
  direction = "right",
  className = "",
}: {
  direction?: "right" | "left";
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      className={`${direction === "left" ? "-scale-x-100 " : ""}${className}`}
    >
      <path d="M0 6 H21.5" />
      <path d="M16 1.5 L21.5 6 L16 10.5" />
    </svg>
  );
}
