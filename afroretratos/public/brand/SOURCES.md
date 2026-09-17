# Origem dos rasters da marca

Todos os arquivos desta pasta derivam do manual oficial
`Id. Visual Afroretratos.pdf` (fornecido na raiz do projeto). Nada foi
recriado com texto, CSS ou fonte.

| Arquivo | Origem | Método |
| --- | --- | --- |
| `afroretratos-logo-bege.png` | Lockup no bloco vinho (página 1 do PDF) | Renderização do PDF a 600 dpi (`pdftoppm`), alfa derivado da mistura entre a arte bege `#CCB49A` e o fundo vinho `#510000`, recorte no conteúdo. 2992×727. |
| `afroretratos-logo-marrom.png` | Lockup no bloco bege (página 1) | Mesmo método, alfa derivado da arte marrom `#452A21` sobre bege `#CCB49A`. 1209×373. |
| `afroretratos-icone-bege.png` | Ícone no bloco oliva (página 1) | Mesmo método, arte bege sobre oliva `#514D32`. 809×727. |
| `og-default.png` | Composição | Lockup bege centralizado sobre campo vinho `#510000`, 1200×630. |
| `app/icon.png` / `app/apple-icon.png` | Composição | Ícone bege centralizado sobre campo vinho, 512 e 180 px. |

## Fontes

Ubuntu é carregada do Google Fonts (`next/font/google`). Hero Kawig e Ethna
são proprietárias e ainda não têm arquivo no projeto; o site usa fallbacks
documentados (Archivo Black e Bodoni Moda) e o procedimento de troca está em
`public/fonts/README.md` e `app/globals.css`.

## Substituição de imagens de eventos

As capas de evento são composições geradas em código com as cores oficiais
(nenhuma fotografia simulada). Quando houver fotografia real, ela entra pelo
campo `coverImage` do evento e substitui a composição automaticamente.
Domínios externos precisam ser liberados em `next.config.ts` (`remotePatterns`).
