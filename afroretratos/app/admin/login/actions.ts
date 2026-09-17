"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  checkAdminPassword,
  createAdminToken,
  isAdminConfigured,
} from "@/lib/auth/admin-session";
import { rateLimit } from "@/lib/rate-limit";
import { adminLoginPolicy } from "@/lib/rate-limit/policies";
import { hashOrigin } from "@/lib/security/hash";
import { resolveClientOrigin } from "@/lib/security/origin";

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  if (next.startsWith("/admin") && !next.startsWith("/admin/login")) {
    return next;
  }
  return "/admin";
}

export async function loginAction(formData: FormData): Promise<void> {
  const next = safeNext(formData.get("next"));

  if (!isAdminConfigured()) {
    redirect("/admin/login?erro=config");
  }

  const requestHeaders = await headers();
  const origin = resolveClientOrigin(
    new Request("http://interno/admin/login", { headers: requestHeaders }),
  );
  const decision = await rateLimit(
    "admin-login",
    hashOrigin(origin.ip),
    adminLoginPolicy(),
  );
  if (!decision.allowed) {
    redirect(`/admin/login?erro=rate&next=${encodeURIComponent(next)}`);
  }

  const password = String(formData.get("password") ?? "");
  if (!(await checkAdminPassword(password))) {
    redirect(`/admin/login?erro=1&next=${encodeURIComponent(next)}`);
  }

  const { token, maxAge } = await createAdminToken();
  const store = await cookies();
  store.set(adminCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(adminCookieName());
  redirect("/");
}
