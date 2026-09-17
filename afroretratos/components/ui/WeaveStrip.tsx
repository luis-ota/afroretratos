/**
 * Emenda do pano: faixa decorativa que repete as cores oficiais em larguras
 * irregulares. E o gesto grafico do sistema (panô) e nunca carrega
 * informacao: por isso e aria-hidden.
 */
export function WeaveStrip({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-3 w-full ${className}`}>
      <span className="h-full w-[31%] bg-wine" />
      <span className="h-full w-[17%] bg-olive" />
      <span className="h-full w-[11%] bg-brown" />
      <span className="h-full w-[23%] bg-wine-deep" />
      <span className="h-full w-[18%] bg-olive-deep" />
    </div>
  );
}
