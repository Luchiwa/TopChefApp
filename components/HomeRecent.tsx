"use client";

import Link from "next/link";
import { useHistory, useSearches } from "@/lib/carnet";
import { relativeDay, searchHref } from "@/lib/recipe-format";
import { RecipeCard } from "./RecipeCard";

/** Sous la recherche, sur l'accueil : dernières recettes et recherches. */
export function HomeRecent() {
  const history = useHistory();
  const searches = useSearches();

  if (history.length === 0 && searches.length === 0) {
    return (
      <p className="mt-8 text-[13.5px] text-mute">
        Marmiton · 750g · Cuisine Actuelle · Cuisine AZ · Marie Claire ·
        Moulinex. Tes dernières recettes apparaîtront ici.
      </p>
    );
  }

  return (
    <>
      {history.length > 0 && (
        <section aria-labelledby="h-recent">
          <h2 id="h-recent" className="tc-sub mb-1 mt-8">
            Repris récemment
            <Link href="/carnet?onglet=historique">Tout voir</Link>
          </h2>
          <ul className="grid gap-2.5 md:grid-cols-2">
            {history.slice(0, 4).map(({ recipe, at }) => (
              <li key={recipe.source.url}>
                <RecipeCard recipe={recipe} note={relativeDay(at)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {searches.length > 0 && (
        <section aria-labelledby="h-searches">
          <h2 id="h-searches" className="tc-sub mb-2 mt-8">
            Recherches récentes
          </h2>
          <ul className="flex flex-wrap gap-2">
            {searches.slice(0, 6).map((s) => (
              <li key={`${s.mode}-${s.value}`}>
                <Link href={searchHref(s)} className="tc-gb normal-case tracking-normal">
                  {s.value}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
