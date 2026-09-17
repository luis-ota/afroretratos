import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ActionLink } from "@/components/ui/Action";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo">
    <section className="bg-beige text-brown-deep">
      <div className="mx-auto max-w-[96rem] px-5 py-24 sm:px-8 sm:py-32">
        <p className="font-display text-[clamp(4rem,16vw,10rem)] leading-[0.85] tracking-[-0.02em] text-wine">
          404
        </p>
        <h1 className="mt-8 max-w-[24ch] font-subtitle text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
          Esta página não faz parte do panô.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-brown-raised">
          O endereço pode ter mudado ou nunca existiu. Você pode voltar ao
          início, ver os eventos ou ler o Feed.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ActionLink href="/" variant="wine">
            Voltar ao início
          </ActionLink>
          <ActionLink href="/eventos" variant="outline-dark">
            Ver eventos
          </ActionLink>
        </div>
      </div>
    </section>
      </main>
      <Footer />
    </>
  );
}
