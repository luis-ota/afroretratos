const LEAD =
  "O Afroretratos nasce da iniciativa de estudantes de Publicidade e Propaganda e Cinema e Audiovisual da PUCPR, com o propósito de construir um coletivo onde pessoas negras possam se reconhecer, trocar experiências, compartilhar suas vivências e fortalecer a potência presente em suas próprias histórias. Crescer sem se reconhecer também deixa marcas, quando os espaços que ocupamos não refletem quem somos, pode ser mais difícil reconhecer nossa história e o nosso lugar no mundo.";

const BODY = [
  "Nosso objetivo é fortalecer a autoestima e o sentimento de pertencimento de pessoas negras por meio da representatividade e da valorização da identidade. Buscamos criar ambientes de escuta e troca, nos quais diferentes histórias possam ser compartilhadas e diversas formas de existir sejam reconhecidas. Ao longo deste semestre, o projeto estará presente em diferentes espaços para promover encontros, diálogos e experiências que coloquem pessoas negras no centro de suas próprias narrativas. Nas rodas de conversa, buscamos incentivar compartilhamentos de vivências, conhecer trajetórias profissionais, discutir desafios e conquistas e refletir sobre a influência da representatividade na construção da autoestima e do sentimento de pertencimento.",
  "No Dia das Crianças, vamos olhar para a importância da representatividade desde os primeiros anos de vida. É fundamental que uma criança encontre histórias e personagens com os quais possa se identificar. Por meio de narrativas protagonizadas por personagens negros, vamos abordar temas como cabelo, beleza, identidade e representatividade, oferecendo referências positivas que contribuam para que crianças negras reconheçam e valorizem suas características.",
  "No Evento de Beleza, Estética e Identidade Negra, o cuidado também será uma forma de troca e valorização. A iniciativa será aberta para homens, mulheres e crianças, criando uma experiência na qual diferentes características possam ser celebradas.",
  "Por meio do documentário, vamos investigar como a representatividade impacta a construção da identidade e da autoestima negra ao longo da vida. A partir de relatos íntimos e experiências coletivas, acompanhamos crianças, jovens e adultos em diferentes momentos de descoberta, questionamento e afirmação de si. As ações planejadas anteriormente serão registradas e adicionadas ao documentário.",
  "O Afroretratos é um coletivo de troca, no qual diferentes experiências podem coexistir e cada pessoa encontre liberdade para expressar sua identidade. Reconhecemos que o racismo também influencia a maneira como pessoas negras constroem a percepção sobre si mesmas, seja pela ausência de referências, pelos estereótipos ou pelos padrões de beleza historicamente impostos. Por isso, falar sobre representatividade também significa questionar essas construções e abrir caminho para novas formas de olhar para a identidade negra.",
  "Pretendemos deixar uma marca formada por memórias, referências, consciência, autoestima e pertencimento. Uma marca que incentive pessoas negras a ocuparem diferentes espaços sem sentir que precisam deixar parte de quem são para trás.",
];

const QUOTES = [
  "Queremos mostrar que cuidar de si pode ir além da estética, pode ser reconhecimento, expressão e valorização da própria identidade.",
  "Nossa missão ao longo deste semestre é criar oportunidades para que pessoas negras sejam vistas, ouvidas e reconhecidas em sua diversidade.",
  "É essa transformação que queremos levar para além da universidade.",
];

export function Manifesto() {
  return (
    <section
      aria-labelledby="manifesto-titulo"
      className="bg-beige text-brown-deep"
    >
      <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <h2
          id="manifesto-titulo"
          className="max-w-[14ch] font-display text-[clamp(2.6rem,6.4vw,5rem)] leading-[0.98] tracking-[-0.015em]"
        >
          Manifesto AfroRetratos
        </h2>

        <div className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="max-w-[56ch] text-[1.25rem] leading-[1.7] first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-subtitle first-letter:text-[4.4rem] first-letter:leading-[0.72] first-letter:text-wine">
              {LEAD}
            </p>
            <div className="mt-10 max-w-[66ch] space-y-6">
              {BODY.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[1.0625rem] leading-[1.8] text-brown-raised"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="mt-12 max-w-[66ch] border-t border-brown-deep/20 pt-4 text-xs text-brown-raised">
              Projeto IV: Production Design · PUCPR · 2026
            </p>
          </div>

          <aside
            aria-label="Trechos do manifesto"
            className="lg:col-span-4 lg:col-start-9"
          >
            <div className="space-y-10 lg:sticky lg:top-28">
              {QUOTES.map((quote) => (
                <blockquote
                  key={quote}
                  className="border-t border-wine/40 pt-5 font-subtitle text-[clamp(1.45rem,2.1vw,1.9rem)] leading-[1.35] text-wine"
                >
                  {quote}
                </blockquote>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
