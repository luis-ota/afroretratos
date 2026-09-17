import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName, verifyAdminToken } from "@/lib/auth/admin-session";

/**
 * Perimetro da area administrativa. A verificacao completa acontece tambem
 * em cada pagina e server action (defesa em profundidade); aqui evitamos que
 * qualquer rota /admin seja renderizada sem sessao valida.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(adminCookieName())?.value;
  if (await verifyAdminToken(token)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  if (pathname !== "/admin") {
    url.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
