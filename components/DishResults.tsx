import Link from "next/link";
import { recipeHref } from "@/lib/recipe-format";
import { SearchHit } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { SourceBadge } from "./SourceBadge";

export function DishResults({
  query,
  hits,
}: {
  query: string;
  hits: SearchHit[];
}) {
  if (hits.length === 0) {
    return (
      <div className="tc-empty">
        Aucune recette trouvée pour « {query} ». Essaie un nom de plat plus
        simple, ou passe par la recherche par ingrédients.
      </div>
    );
  }

  const sources = new Set(hits.map((h) => h.source.host)).size;

  return (
    <section aria-label="Résultats">
      <p className="tc-kicker">
        {hits.length} recette{hits.length > 1 ? "s" : ""} · {sources} source
        {sources > 1 ? "s" : ""}
      </p>
      <h2 className="tc-rtitle mb-4 mt-2">{query}</h2>
      <ul className="grid gap-2.5 lg:grid-cols-2">
        {hits.map((hit) => (
          <li key={hit.url}>
            <article className="tc-card tc-card-noimg h-full">
              <div
                aria-hidden
                style={{ background: `var(--color-${brigadeKey(hit.source.host)}, var(--color-line))` }}
              />
              <div className="min-w-0 py-3 pl-3 pr-1">
                <SourceBadge host={hit.source.host} name={hit.source.name} />
                <h3 className="tc-card-title mb-1 mt-1.5">
                  <Link href={recipeHref(hit.url)} className="tc-card-link">
                    {hit.title}
                  </Link>
                </h3>
                {hit.snippet && (
                  <p className="line-clamp-2 text-[13px] text-mute">
                    {hit.snippet}
                  </p>
                )}
              </div>
              <FavoriteButton url={hit.url} title={hit.title} />
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

// « cuisineactuelle.fr » → « cuisineactuelle » (suffixe des variables --color-*).
function brigadeKey(host: string): string {
  return host.replace(/^www\./, "").split(".")[0];
}
