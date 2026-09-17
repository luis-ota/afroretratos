import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SiteNav } from "./SiteNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-wine md:static">
      <div className="relative z-[55] mx-auto flex h-16 max-w-[96rem] items-center justify-between px-5 sm:h-20 sm:px-8 md:z-auto">
        <Link
          href="/"
          aria-label="AfroRetratos, página inicial"
          className="relative z-[60] flex h-11 shrink-0 items-center"
        >
          <Logo
            variant="beige"
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
