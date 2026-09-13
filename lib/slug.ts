/**
 * Gera um slug estavel a partir de um titulo: minusculo, sem acentos,
 * apenas [a-z0-9-]. Usado quando o formulario de evento nao informa slug.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
