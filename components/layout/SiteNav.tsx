"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";

const LINKS = [
  { href: "/", label: "AfroRetrato" },
  { href: "/eventos", label: "Eventos" },
  { href: "/feed", label: "Feed" },
] as const;

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";
const MENU_EXIT_MS = 320;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Hamburger que morfa para X: as duas barras externas deslizam para o
 * centro e giram 45 graus enquanto a do meio encolhe e some. A terceira
 * barra e mais curta fechada e cresce ao abrir, virando parte da animacao.
 * E o MESMO botao durante todo o ciclo: ele fica fixo acima do overlay,
 * entao o morfo acontece a vista, nos dois sentidos.
 */
function MenuIcon({ open }: { open: boolean }) {
  const bar = `absolute left-0 h-[1.5px] bg-current transition-all duration-[320ms] ${EASE}`;
  return (
    <span aria-hidden="true" className="relative block h-3 w-7">
      <span
        className={`${bar} top-0 w-full origin-center ${
          open ? "translate-y-[5.25px] rotate-45" : "translate-y-0 rotate-0"
        }`}
      />
      <span
        className={`${bar} top-1/2 w-full origin-center -translate-y-1/2 ${
          open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
        }`}
      />
      <span
        className={`${bar} bottom-0 origin-center ${
          open
            ? "w-full -translate-y-[5.25px] -rotate-45"
            : "w-2/3 translate-y-0 rotate-0"
        }`}
      />
    </span>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    if (!open || closing) return;
    setOpen(false);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    setClosing(true);
    window.setTimeout(() => setClosing(false), MENU_EXIT_MS);
  }

  useEffect(() => {
    if (!open) return;
    // Trava o scroll sem deslocar o layout: compensa a largura da barra de
    // rolagem que some, senao o header (e o botao) pulam alguns pixels.
    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    // O botao faz parte do ciclo de foco do dialogo (fica acima do overlay).
    const focusables = () =>
      [
        ...(panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []),
      ].filter((element) => element.offsetParent !== null);

    const items = focusables();
    items[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const cycle = buttonRef.current
        ? [...focusables(), buttonRef.current]
        : focusables();
      if (cycle.length === 0) return;
      const first = cycle[0];
      const last = cycle[cycle.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === buttonRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const menuVisible = open || closing;

  return (
    <>
      <nav aria-label="Navegação principal" className="hidden md:block">
        <ul className="flex items-center gap-9">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative pb-1 text-[0.8125rem] font-medium tracking-[0.18em] uppercase transition-colors duration-200 ${
                    active ? "text-beige" : "text-beige/80 hover:text-beige"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-beige transition-transform duration-300 ${EASE} ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        ref={buttonRef}
        type="button"
        data-menu-toggle
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
        className="relative z-[60] flex h-11 w-11 items-center justify-center text-beige md:hidden"
      >
        <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        <MenuIcon open={open} />
      </button>

      {menuVisible ? (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`fixed inset-0 z-50 flex flex-col bg-wine pt-16 text-beige md:hidden ${
            closing ? "afro-menu-out" : "afro-menu-in"
          }`}
        >
          <nav
            aria-label="Navegação principal (celular)"
            className="flex flex-1 flex-col justify-center overflow-y-auto px-5"
          >
            <ul>
              {LINKS.map((link, index) => {
                const active = isActive(pathname, link.href);
                return (
                  <li
                    key={link.href}
                    style={{ animationDelay: `${90 + index * 70}ms` }}
                    className="afro-menu-item border-t border-beige/20 last:border-b"
                  >
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-baseline justify-between gap-6 py-6 font-display text-[2.35rem] leading-none tracking-[-0.01em] transition-colors duration-200 ${
                        active ? "text-beige" : "text-beige/75 hover:text-beige"
                      }`}
                    >
                      {link.label}
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 translate-y-[-0.35rem] bg-beige"
                        />
                      ) : (
                        <Arrow className="h-3 w-7 shrink-0 text-beige/50" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-beige/20 px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <p className="max-w-[36ch] text-sm leading-relaxed text-beige/80">
              Eventos organizados pelo AfroRetratos e um Feed de relatos
              anônimos, sem cadastro.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
