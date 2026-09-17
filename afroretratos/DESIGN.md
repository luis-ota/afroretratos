---
name: AfroRetratos
description: Plataforma cultural — identidade editorial tecida como um panô
colors:
  wine: "#510000"
  wine-deep: "#3a0000"
  olive: "#514d32"
  olive-deep: "#3f3c26"
  brown: "#452a21"
  brown-raised: "#533429"
  brown-deep: "#331d15"
  beige: "#ccb49a"
  beige-light: "#ddcbb5"
typography:
  display:
    fontFamily: "Hero Kawig, Archivo Black, Arial Black, sans-serif"
    fontSize: "clamp(2.2rem, 6vw, 5rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.015em"
  subtitle:
    fontFamily: "Ethna, Bodoni Moda, Georgia, serif"
    fontSize: "clamp(1.6rem, 4vw, 2.8rem)"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Ubuntu, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Ubuntu, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  none: "0px"
  sm: "6px"
  md: "10px"
  lg: "16px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  section-sm: "4rem"
  section-md: "6rem"
  section-lg: "9rem"
components:
  button-beige:
    backgroundColor: "{colors.beige}"
    textColor: "{colors.wine}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-beige-hover:
    backgroundColor: "{colors.beige-light}"
    textColor: "{colors.wine}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-wine:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.beige}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-wine-hover:
    backgroundColor: "{colors.wine-deep}"
    textColor: "{colors.beige}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-outline-dark:
    backgroundColor: "transparent"
    textColor: "{colors.brown-deep}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  field-on-wine:
    backgroundColor: "{colors.beige}"
    textColor: "{colors.brown-deep}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  status-upcoming:
    backgroundColor: "transparent"
    textColor: "{colors.olive-deep}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.beige}"
    rounded: "{rounded.none}"
    padding: "4px 0"
---

# Design System: AfroRetratos

## Overview

**Creative North Star: "O Panô"**

O AfroRetratos não monta páginas em caixas: ele costura um panô. Cada
superfície é feita de faixas de cor inteiras, emendas francas de 1px e
módulos que avançam em ritmo irregular, como retalhos de tecido. O sistema
carrega a identidade oficial — vinho, oliva, marrom e bege, com Hero Kawig,
Ethna e Ubuntu — sem véu de SaaS: nenhum card com sombra, nenhum gradiente,
nenhum canto arredondado, nenhuma cor que não venha do manual.

A densidade alterna: campos drenados de vinho com tipografia colossal e
silêncio ao redor, seguidos por blocos de leitura em bege com medida de
65–75ch. Assimetria é regra: títulos deslocados, blocos que vazam para a
borda, faixas de larguras diferentes. A fotografia (quando existir) entra
com protagonismo; no lugar dela, capas provisórias são composições de faixas
e do ícone oficial, nunca fotografia simulada.

Movimento é escasso e autoral: uma entrada no hero, o morfo do menu móvel,
o relato que se costura à lista ao ser publicado. Nada de revelar texto no
scroll, nada de efeitos espalhados.

**Key Characteristics:**
- Quatro cores oficiais como campos inteiros, nunca como acentos decorativos.
- Emenda de 1px (`border`/`rule`) separa conteúdo; não existe borda de card.
- Cantos vivos, zero sombra, zero vidro, zero gradiente.
- Tipografia em contraste extremo: display colossal contra corpo contido.
- Composição assimétrica com vazamentos para a borda no desktop.
- Mobile preserva o panô: faixas, datas gigantes e assimetria continuam.

## Colors

A paleta é a identidade oficial em quatro campos: dois escuros nobres (vinho,
marrom), um verde terroso e um bege de leitura. Variações existem só para
estado, contraste e emenda.

### Primary
- **Vinho Afroretratos** (#510000): campo principal da marca — header, hero,
  formulário do Feed, faixas de manifesto. Texto em bege alcança 7,8:1.
- **Vinho Profundo** (#3a0000): hover do vinho e emendas no campo escuro.

### Secondary
- **Verde Oliva** (#514d32): campo de seções de comunidade e eventos passados.
  Nunca recebe texto bege puro; sobre oliva o texto é **Bege Claro** (5,4:1).
- **Oliva Profundo** (#3f3c26): rótulos de status sobre bege (5,6:1) e emendas.

### Tertiary
- **Marrom** (#452a21): campo do rodapé e do cabeçalho de Eventos.
- **Marrom Elevado** (#533429): texto secundário sobre bege (5,6:1).
- **Marrom Profundo** (#331d15): texto principal sobre bege (8:1) e hover de
  botões escuros.

### Neutral
- **Bege** (#ccb49a): campo de leitura padrão do site; fundo do corpo.
- **Bege Claro** (#ddcbb5): hover de botões claros, seleção de texto, faixa de
  contraste sobre marrom e texto sobre oliva.

### Named Rules
**A Regra do Campo Inteiro.** Cor ocupa regiões, não detalhes. Uma seção é
vinho, oliva, marrom ou bege de ponta a ponta; nenhuma cor oficial é usada
como "accent" espalhado sobre um fundo neutro.

**A Regra do Contraste no Oliva.** Texto bege puro sobre oliva falha AA
(4,3:1). Sobre oliva, o texto é Bege Claro; sobre vinho e marrom, bege puro.

## Typography

**Display Font:** Hero Kawig (fallback documentado: Archivo Black)
**Body Font:** Ubuntu (Google Fonts)
**Subtitle Font:** Ethna (fallback documentado: Bodoni Moda)

**Character:** Contraste editorial entre uma display pesada e geométrica
(Hero Kawig) e uma serifada de alto contraste (Ethna), com Ubuntu discreta
para leitura. A hierarquia é feita por salto de escala, não por peso.

### Hierarchy
- **Display** (400, `clamp(2.2rem, 6vw, 5rem)`, 0.92–0.98): títulos de seção
  e de página, sempre em caixa baixa, tracking levemente negativo.
- **Display Hero** (`clamp(1.9rem, 3.2vw, 2.75rem)`, 1.32): a linha-manifesto
  provisória no bloco bege do hero.
- **Subtitle** (600, `clamp(1.6rem, 4vw, 2.8rem)`, 1.1–1.2): nomes de evento,
  títulos de bloco, estados vazios impressos.
- **Body** (400, 1rem–1.0625rem, 1.75, medida 65–75ch): relatos, descrições e
  textos de apoio.
- **Label** (500, 0.6875–0.8125rem, tracking 0.12–0.2em, caixa alta): status de
  evento, navegação, metadados.

### Named Rules
**A Regra da Fonte Oficial.** Hero Kawig e Ethna nunca são substituídas em
silêncio: quando os arquivos não existem, o fallback é declarado no código
(`app/globals.css` e `public/fonts/README.md`) e a troca é automática quando
os `.woff2` oficiais chegam.

**A Regra do Caixa-Alta Curto.** Caixa alta só em rótulos com menos de ~30
caracteres; texto corrido nunca é capitalizado.

## Layout

Modelo de faixas empilhadas em tela cheia, com um container central de até
96rem (`max-w-[96rem]`) e respiro lateral de 1.25rem no celular e 2rem do
tablet para cima. Cada seção é uma faixa de cor com padding vertical de
4–9rem (`py-16` a `py-36`), e o conteúdo interno usa grid de 12 colunas no
desktop com ocupações assimétricas (5/7, 7/4, 4/8), incluindo vazamentos
negativos para a borda no hero.

O ritmo de espaçamento tem mais espaço acima de um título do que abaixo, e as
listas correm em linhas de altura inteira separadas por emendas, nunca em
grid de cards. No celular tudo vira uma coluna, mas a assimetria sobrevive
como recuos alternados e datas em escala grande.

Breakpoints usados: 640px (`sm`), 768px (`md`), 1024px (`lg`).

## Elevation & Depth

O sistema é **plano por doutrina**. Não existe `box-shadow` em lugar nenhum
do site público. Profundidade é criada por três meios: (1) campos de cor
empilhados em faixas que se encontram em emendas de 1px; (2) sobreposição
real no hero (o bloco bege cobre parte do logotipo no desktop); (3) mudança
de valor no hover/press (fundo um passo mais claro ou mais escuro).

### Named Rules
**A Regra do Plano por Padrão.** Nenhuma superfície recebe sombra. Se algo
precisa de destaque, muda de campo de cor ou ganha uma emenda — nunca uma
sombra.

**A Regra do Raio Pequeno.** Escala única: 6px em tags, 10px em botões e
campos, 16px em caixas de conteúdo. Campos de cor, faixas e capas continuam
retos; nada vira pill nem card flutuante.

## Shapes

**Cantos:** elemento interativo (botão, campo, tag, caixa de aviso) recebe
raio pequeno — 6px em tags, 10px em botões e campos, 16px em caixas de
conteúdo (bloco do manifesto, formulário do Feed, painéis).
Campos de cor, faixas, capas e emendas continuam retos: o raio é um detalhe de
toque, nunca a forma da página. A forma recorrente é o retângulo em proporção
de faixa e o filete de 1px, que aparece como emenda entre seções, entre itens
de lista e nos estados de foco (sublinhado do menu desktop que cresce da
esquerda para a direita).

O ícone oficial da marca pode aparecer grande, recortado pela borda, como
elemento gráfico. Nenhuma máscara geométrica simula recorte fotográfico.

## Components

### Buttons
- **Shape:** retangular, sem raio (0px), altura mínima de 44px.
- **Primary (bege):** fundo Bege, texto Vinho, caixa alta, tracking 0.08em;
  hover para Bege Claro; largura total no celular.
- **Wine:** fundo Vinho, texto Bege; hover Vinho Profundo; usado sobre bege.
- **Outline:** 1px marrom ou bege conforme o campo; hover inverte (fundo
  escuro, texto claro). Sem sombra.
- **Focus:** anel de 2px na cor do campo, com offset de 3px.

### Status tag (assinatura)
- **Style:** retângulo 1px com rótulo em caixa alta; "Em breve" em Oliva
  Profundo sobre bege, "Aconteceu" em Marrom Elevado, "Cancelado" em bloco
  Vinho com texto bege.
- **Regra:** status nunca é comunicado só por cor — o rótulo escrito é
  obrigatório.

### Event strip (assinatura)
- **Structure:** linha de altura inteira com grid `8.5rem | 1fr | auto` no
  desktop: data colossal à esquerda, título Ethna, local em corpo, status e
  seta à direita.
- **States:** hover/press lava o fundo um passo (subtração de 5% de marrom
  sobre bege, 7% de bege sobre oliva) e desloca a seta em 6px; nada de
  sombra ou elevação.

### Feed composer
- **Style:** bloco Vinho com campos Bege de cantos vivos; textarea com no
  mínimo 16px para não sofrer zoom no iOS.
- **States:** botão bege full-width no celular; sucesso e erro "impressos"
  (clip-path da esquerda para a direita), anúncio via `aria-live`.

### Feed post (retalho)
- **Style:** artigo em grid `9.5rem | 1fr`, cabeçalho "Anônimo" + data/hora,
  corpo em 65–70ch, etiqueta de evento costurada (sublinhado de 1px) e
  denúncia discreta.
- **Insertion:** o relato recém-publicado entra com deslize de -0.6rem e um
  flash bege que se dissolve (0,5s).

### Navigation
- **Desktop:** barra vinho fixa de 4/5rem com logotipo à esquerda e links em
  caixa alta; sublinhado de 1px cresce da esquerda no hover e marca a página
  ativa.
- **Mobile:** header vinho sticky; hambúrguer que **morfa para X** (duas
  barras giram 45° e deslizam 5,25px, a do meio encolhe), sempre no mesmo
  pixel da tela. O menu é uma cortina vinho de tela cheia que abre por
  `clip-path` de baixo para cima e fecha de volta (320ms), com os links
  entrando em cascata (70ms de atraso entre eles).

### Weave strip (assinatura)
- **Style:** faixa decorativa de 12px com as cores oficiais em larguras
  irregulares (31/17/11/23/18), usada como franja entre campos de cor.
  Sempre `aria-hidden`, nunca carrega informação.

## Do's and Don'ts

### Do:
- **Do** usar as quatro cores oficiais em campos inteiros e alternar fundos
  entre seções.
- **Do** manter cantos vivos e emendas de 1px como único sistema de borda.
- **Do** usar Bege Claro para texto sobre Oliva (5,4:1) e bege puro sobre
  vinho/marrom.
- **Do** deixar a display em escala colossal com tracking negativo leve
  (`-0.015em`) e a leitura em 65–75ch.
- **Do** animar transform/opacity/clip-path com `cubic-bezier(0.16,1,0.3,1)`
  e respeitar `prefers-reduced-motion`.

### Don't:
- **Don't** usar cantos totalmente arredondados (pill), raios grandes ou
  cards flutuantes. O teto é 16px, e só em caixas de conteúdo.
- **Don't** transformar conteúdo em cards empilhados; a faixa é a unidade.
- **Don't** introduzir cor fora da paleta oficial (nem azul/roxo de startup).
- **Don't** comunicar status apenas por cor.
- **Don't** esconder texto atrás de animação de scroll; o conteúdo existe
  visível por padrão.
- **Don't** substituir Hero Kawig ou Ethna silenciosamente; fallback é
  explícito e documentado.
