import { Suspense } from "react";
import { DishResults } from "@/components/DishResults";
import { HomeRecent } from "@/components/HomeRecent";
import { IngredientResults } from "@/components/IngredientResults";
import { SearchPanel } from "@/components/SearchPanel";
import { parseIngredientsParam } from "@/lib/ingredients/match";
import { runSearch } from "@/lib/search";

type PageProps = {
  searchParams: Promise<{ q?: string; i?: string }>;
};

async function Results({ query }: { query: string }) {
  const { hits } = await runSearch(query);
  return <DishResults query={query} hits={hits} />;
}

function ResultsSkeleton() {
  return (
    <div className="space-y-2.5" role="status" aria-label="Recherche en cours">
      <div className="tc-skeleton mb-4 h-9 w-2/3 max-w-md" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="tc-skeleton h-24 w-full" />
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const ingredients = parseIngredientsParam(params.i ?? "");
  const byIngredients = ingredients.length > 0;
  const hasResults = byIngredients || Boolean(query);
  const key = byIngredients ? `i:${ingredients.join(",")}` : `q:${query}`;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-8 sm:pt-10">
      <SearchPanel
        key={key}
        initialMode={byIngredients ? "ingredients" : "plat"}
        initialQuery={byIngredients ? "" : query}
        initialIngredients={ingredients}
        compact={hasResults}
      />

      {byIngredients ? (
        <div key={`results-${key}`} className="pt-7">
          <IngredientResults ingredients={ingredients} />
        </div>
      ) : query ? (
        <div key={`results-${key}`} className="pt-7">
          <Suspense fallback={<ResultsSkeleton />}>
            <Results query={query} />
          </Suspense>
        </div>
      ) : (
        <HomeRecent />
      )}
    </main>
  );
}
