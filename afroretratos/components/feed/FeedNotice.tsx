const GUIDELINES = [
  {
    title: "Respeito sempre",
    body: "Leia cada relato com a atenção que você gostaria de receber. Discordar é permitido; escrever com educação é obrigatório.",
  },
  {
    title: "Sem preconceito",
    body: "Racismo, machismo, LGBTfobia, capacitismo, gordofobia e qualquer outra forma de discriminação não são permitidos nesta aba.",
  },
  {
    title: "Com moderação",
    body: "A equipe acompanha tudo o que é publicado e pode excluir o que quebrar essas regras. Qualquer pessoa também pode denunciar pelo próprio relato.",
  },
];

export function FeedNotice() {
  return (
    <section
      aria-labelledby="combinado-do-feed"
      className="bg-olive text-beige-light"
    >
      <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="text-xs font-medium tracking-[0.16em] text-beige-light/80 uppercase">
            Antes de escrever
          </p>
          <h2
            id="combinado-do-feed"
            className="mt-4 max-w-[20ch] font-subtitle text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] tracking-[-0.01em]"
          >
            Esta é uma área segura para contar suas experiências
          </h2>
          <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-[1.75] text-beige-light/90">
            Escreva do seu jeito, no seu tempo. Aqui ninguém precisa se
            identificar nem explicar por que sente o que sente, e nenhuma
            vivência é pequena demais.
          </p>
          <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-[1.75] text-beige-light/90">
            Para que este espaço continue acolhedor para todo mundo, ele tem um
            combinado simples, que vale para quem escreve e para quem lê.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <dl className="w-full">
            {GUIDELINES.map((item) => (
              <div
                key={item.title}
                className="border-t border-beige-light/30 py-5"
              >
                <dt className="font-medium">{item.title}</dt>
                <dd className="mt-1.5 max-w-[52ch] text-[0.9375rem] leading-relaxed text-beige-light/85">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
