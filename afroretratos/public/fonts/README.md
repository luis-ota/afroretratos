# Fontes oficiais

A identidade AfroRetratos usa três famílias:

| Uso | Fonte oficial | Situação no projeto |
| --- | --- | --- |
| Títulos / display | Hero Kawig | **Arquivo pendente** |
| Subtítulos | Ethna | **Arquivo pendente** |
| Texto / interface | Ubuntu | Carregada via `next/font/google` |

## Como ativar Hero Kawig e Ethna

1. Coloque os arquivos das fontes (licenciados) nesta pasta com exatamente
   estes nomes:

   ```
   public/fonts/hero-kawig.woff2
   public/fonts/ethna.woff2
   ```

2. Descomente os blocos `@font-face` no topo de `app/globals.css` (procure por
   "font-face oficiais").

3. Recarregue o site. As stacks `font-display` e `font-subtitle` já listam
   `"Hero Kawig"` e `"Ethna"` na frente, então a troca é automática.

Enquanto os arquivos não existem, o site usa fallbacks **documentados e
visíveis no código** (não silenciosos):

- Hero Kawig → Archivo Black (`next/font/google`)
- Ethna → Bodoni Moda (`next/font/google`)

Quando os arquivos oficiais entrarem, os fallbacks continuam como segunda
opção da stack e podem ser removidos de `app/layout.tsx` e `app/globals.css`.
