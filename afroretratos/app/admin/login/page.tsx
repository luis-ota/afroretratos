import type { Metadata } from "next";
import { isAdminConfigured } from "@/lib/auth/admin-session";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar na moderação",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ erro?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const configured = isAdminConfigured();

  return (
    <section className="bg-beige text-brown-deep">
      <div className="mx-auto max-w-md px-5 py-24 sm:px-8">
        <h1 className="font-display text-[clamp(2.2rem,6vw,3.4rem)] leading-none">
          Moderação
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-brown-raised">
          Área restrita da equipe AfroRetratos. O acesso usa um segredo
          configurado no servidor (ADMIN_SECRET) e não é indexado por
          buscadores.
        </p>

        {!configured ? (
          <p className="mt-8 rounded-md border border-wine/40 bg-wine/5 p-4 text-sm text-wine">
            ADMIN_SECRET ainda não está configurado neste ambiente. Defina a
            variável para habilitar a moderação.
          </p>
        ) : (
          <form action={loginAction} className="mt-8">
            <input type="hidden" name="next" value={params.next ?? "/admin"} />
            <label htmlFor="password" className="block text-sm font-medium">
              Senha de moderação
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-brown-deep/40 bg-beige-light/50 px-4 py-3 text-base focus:border-wine focus-visible:outline-wine sm:text-sm"
            />
            {params.erro === "1" ? (
              <p role="alert" className="mt-3 text-sm text-wine">
                Senha incorreta. Tente de novo.
              </p>
            ) : null}
            {params.erro === "rate" ? (
              <p role="alert" className="mt-3 text-sm text-wine">
                Muitas tentativas em pouco tempo. Aguarde alguns minutos.
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-wine px-6 py-3 text-sm font-medium tracking-[0.08em] text-beige uppercase transition-colors hover:bg-wine-deep"
            >
              Entrar
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
