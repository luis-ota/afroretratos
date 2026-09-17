import { Logo } from "@/components/brand/Logo";
import { requireAdmin } from "@/lib/auth/guard";
import { logoutAction } from "../login/actions";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function PainelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-beige-light">
      <div className="bg-wine text-beige">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-5">
            <Logo variant="beige" className="h-6 w-auto" />
            <p className="text-xs tracking-[0.2em] uppercase text-beige/80">
              Moderação
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-beige/50 px-4 py-2 text-xs font-medium tracking-[0.12em] uppercase transition-colors hover:bg-beige hover:text-wine"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
      <AdminNav />
      <div className="mx-auto max-w-[96rem] px-5 py-10 sm:px-8">
        {children}
      </div>
    </div>
  );
}
