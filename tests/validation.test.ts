import { describe, expect, test } from "bun:test";
import {
  createPostSchema,
  normalizeContent,
  reportSchema,
} from "../lib/validation/posts";

describe("normalizeContent", () => {
  test("uniformiza quebras de linha e remove caracteres de controle", () => {
    const input = "  olá\r\nmundo\u0007  \r\n\r\n\r\nfim  ";
    expect(normalizeContent(input)).toBe("olá\nmundo\n\nfim");
  });

  test("não interpreta HTML", () => {
    const input = "<script>alert(1)</script> relato";
    expect(normalizeContent(input)).toBe("<script>alert(1)</script> relato");
  });
});

describe("createPostSchema", () => {
  test("aceita relato válido sem evento", () => {
    const result = createPostSchema.safeParse({ content: "  um relato  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("um relato");
      expect(result.data.eventId).toBeNull();
    }
  });

  test("converte eventId vazio em null", () => {
    const result = createPostSchema.safeParse({
      content: "relato",
      eventId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.eventId).toBeNull();
  });

  test("rejeita relato curto demais", () => {
    expect(createPostSchema.safeParse({ content: "a" }).success).toBe(false);
  });

  test("rejeita relato acima do limite", () => {
    expect(
      createPostSchema.safeParse({ content: "x".repeat(1201) }).success,
    ).toBe(false);
  });

  test("rejeita eventId que não é uuid", () => {
    expect(
      createPostSchema.safeParse({ content: "relato", eventId: "123" })
        .success,
    ).toBe(false);
  });
});

describe("reportSchema", () => {
  test("exige motivo com tamanho mínimo", () => {
    expect(
      reportSchema.safeParse({
        postId: "10000000-0000-4000-8000-000000000001",
        reason: "ok",
      }).success,
    ).toBe(false);
  });
});
