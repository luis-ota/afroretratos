"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/origens", label: "Origens" },
  { href: "/admin/denuncias", label: "Denúncias" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação da moderação" className="bg-wine-deep">
      <div className="mx-auto max-w-[96rem] px-5 sm:px-8">
        <ul className="flex gap-6 overflow-x-auto text-sm">
          {LINKS.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block border-b-2 py-3 transition-colors ${
                    active
                      ? "border-beige text-beige"
                      : "border-transparent text-beige/70 hover:text-beige"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
