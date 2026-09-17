/**
 * Icone de informacao no mesmo traco do sistema (1.5px, ponta reta), usado
 * para acoes compactas de "abrir detalhes" no painel.
 */
export function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.6 V17" />
      <circle cx="12" cy="7.3" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
