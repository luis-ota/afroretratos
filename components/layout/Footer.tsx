import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const LINKS = [
  { href: "/", label: "AfroRetrato" },
  { href: "/eventos", label: "Eventos" },
  { href: "/feed", label: "Feed" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brown text-beige">
      <div className="mx-auto max-w-[96rem] px-5 py-14 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Logo variant="beige" className="h-8 w-auto" />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-beige/85">
              O Feed é anônimo. Os relatos não mostram nome, apelido ou
              qualquer identificação de quem publica, e nenhum dado técnico do
              visitante aparece na página.
            </p>
          </div>
          <nav
            aria-label="Navegação do rodapé"
            className="md:justify-self-end"
          >
            <ul className="space-y-3 text-sm">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-2 text-beige/85 underline decoration-beige/40 hover:text-beige hover:decoration-beige"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-beige/25 pt-6 text-xs text-beige/85 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <p>© {year} AfroRetratos</p>
            <p>
              Desenvolvido por{" "}
              <a
                href="https://portfolio.wired.rs/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-beige/40 hover:decoration-beige"
              >
                Wired Layer Co.
              </a>
            </p>
          </div>
          <p className="max-w-[60ch] leading-relaxed sm:text-right">
            Projeto IV: Production Design · PUCPR
            <br />
            Equipe: Hiago Araújo, Isabella Monteiro, Larissa Gonçalves, Maria
            Eduarda Netzel e Maryana Mendes.
          </p>
        </div>
      </div>
    </footer>
  );
}
