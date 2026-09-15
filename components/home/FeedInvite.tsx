import { ActionLink } from "@/components/ui/Action";

export function FeedInvite() {
  return (
    <section
      aria-labelledby="chamada-feed"
      className="bg-olive text-beige-light"
    >
      <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-6">
          <h2
            id="chamada-feed"
            className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.92] tracking-[-0.015em]"
          >
            Feed
          </h2>
          <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.75] text-beige-light/90">
            Compartilhe sua vivência, um momento de afirmação ou uma ação do
            projeto. Publicar não exige cadastro e a identidade é apenas
            Anônimo; o e-mail para a moderação é opcional e privado.
          </p>
        </div>
        <div className="flex flex-col justify-end gap-5 lg:col-span-5 lg:col-start-8">
          <ActionLink
            href="/feed"
            variant="beige"
            className="w-full self-start sm:w-auto"
          >
            Deixar um relato
          </ActionLink>
          <p className="max-w-[42ch] text-sm leading-relaxed text-beige-light/90">
            Nenhum dado técnico de quem publica aparece no Feed; a moderação
            usa apenas um identificador interno para conter abuso.
          </p>
        </div>
      </div>
    </section>
  );
}
