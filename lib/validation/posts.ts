import { z } from "zod";

export const POST_MIN_LENGTH = 3;
export const POST_MAX_LENGTH = 1200;

/**
 * Normalizacao basica: uniformiza quebras de linha, remove caracteres de
 * controle e espacos em excesso. O conteudo continua sendo texto puro;
 * HTML nunca e aceito nem interpretado.
 */
export function normalizeContent(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const contentSchema = z
  .string({ error: "Escreva seu relato antes de publicar." })
  .transform(normalizeContent)
  .pipe(
    z
      .string()
      .min(POST_MIN_LENGTH, "O relato está curto demais.")
      .max(POST_MAX_LENGTH, `Use no máximo ${POST_MAX_LENGTH} caracteres.`),
  );

const eventIdSchema = z
  .union([z.uuid("Evento inválido."), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value ? value : null));

export const createPostSchema = z.object({
  content: contentSchema,
  eventId: eventIdSchema,
});

export type CreatePostInput = z.output<typeof createPostSchema>;

const LINK_PATTERN = /(https?:\/\/|www\.)/gi;

export function countLinks(content: string): number {
  return content.match(LINK_PATTERN)?.length ?? 0;
}

export const MAX_LINKS_PER_POST = 4;

export const reportSchema = z.object({
  postId: z.uuid("Relato inválido."),
  reason: z
    .string({ error: "Conte o que há de errado com este relato." })
    .transform(normalizeContent)
    .pipe(
      z
        .string()
        .min(3, "Descreva o motivo da denúncia.")
        .max(500, "Use no máximo 500 caracteres."),
    ),
});

export type ReportInput = z.output<typeof reportSchema>;
