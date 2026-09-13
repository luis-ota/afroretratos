---
version: 1
slug: "app-feed-page-tsx"
primary_target: "app/feed/page.tsx"
related_targets: []
---

# Surface: /feed

Scope: Feed público de relatos anônimos + publicação. Visitor mode: Read (lista) e Operate (formulário).
Audience and job: qualquer pessoa publica um relato sem conta; visitantes leem relatos da comunidade, podendo relacionar um relato a um evento.
Action: escrever, escolher evento (opcional) e publicar anonimamente; ler e carregar mais relatos.

## Direction contract

THESIS: o Feed é o avesso do panô — cada relato é um retalho costurado à lista, sem avatar, sem apelido rastreável, com o evento como etiqueta costurada quando existe; a lista não é um mural de cards.
OWN-WORLD: campo bege para leitura, vinho para o formulário em destaque, marrom e oliva nas etiquetas de evento e nos estados; Ubuntu no corpo dos relatos, Ethna nos títulos, Hero Kawig nos números; filetes entre relatos.
STORY: o visitante entende em segundos que pode publicar sem cadastro e que sua identidade pública é apenas "Anônimo"; entende também que o servidor protege o anonimato e limita abuso.
FIRST VIEWPORT: título "Feed" em campo vinho com o aviso de anonimato em texto claro; logo abaixo, o formulário em bloco vinho com fundo bege no textarea, e a lista de relatos começando no primeiro scroll, com o relato mais recente visível.
FORM: 5ª de 7 estruturas; seed key ad84af60.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Raised lines: Tear fixo; Estados impressos; Um gesto por dobra; Pulso.

Unresolved: política de retenção de IP, interface de denúncia no frontend (API pronta), copy definitiva.
