import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "invalid"
  | "too_large"
  | "not_found"
  | "rate_limited"
  | "blocked"
  | "server_error";

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  headers?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store", ...headers } },
  );
}

export function apiJson<T>(
  body: T,
  status = 200,
  headers?: Record<string, string>,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
