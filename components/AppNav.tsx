"use client";

import { Search, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "@/lib/carnet";

export function AppNav() {
  const pathname = usePathname();
  const favorites = useFavorites();
  const onCarnet = pathname.startsWith("/carnet");
  const count = favorites.length;

  const links = (iconSize?: number) => (
    <>
      <Link href="/" aria-current={onCarnet ? undefined : "page"}>
        {iconSize && <Search size={iconSize} aria-hidden />}
        <span>Recherche</span>
      </Link>
      <Link href="/carnet" aria-current={onCarnet ? "page" : undefined}>
        {iconSize && <Star size={iconSize} aria-hidden />}
        <span>
          Carnet
          {count > 0 && <span className="tc-count">{count}</span>}
        </span>
      </Link>
    </>
  );

  return (
    <>
      <header className="tc-bar">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 sm:px-8">
          <Link href="/" className="tc-mark" aria-label="TopChef, accueil">
            <span className="text-gold">TOP</span>
            <i aria-hidden />
            <span className="text-chrome">CHEF</span>
          </Link>
          <nav
            aria-label="Navigation principale"
            className="tc-nav tc-label hidden gap-7 text-[13px] text-mute sm:flex"
          >
            {links()}
          </nav>
        </div>
      </header>
      <nav aria-label="Navigation principale" className="tc-tabbar tc-label sm:hidden">
        {links(20)}
      </nav>
    </>
  );
}
