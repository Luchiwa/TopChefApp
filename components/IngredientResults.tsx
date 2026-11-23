"use client";

import { useEffect, useState } from "react";
import { usePantry } from "@/lib/carnet";
import { IngredientMatch, matchRecipe } from "@/lib/ingredients/match";
import { fetchRecipe } from "@/lib/recipe-client";
import { Recipe, SearchHit } from "@/lib/types";
import { RecipeCard } from "./RecipeCard";

const MAX_CANDIDATES = 24;
const CONCURRENCY = 6;
/** En dessous de ce nombre de recettes complètes, on montre aussi les partielles. */
const MIN_FULL = 3;

type Loaded = { recipes: Recipe[]; read: number };
type State =
  | { status: "loading"; done: number; total: number }
  | { status: "error"; message: string }
  | ({ status: "done" } & Loaded);

// Résultats gardés pour la session : revenir d'une recette ne relance rien.
const sessionCache = new Map<string, Loaded>();

async function loadCandidates(ingredients: string[]): Promise<SearchHit[]> {
  const q = encodeURIComponent(ingredients.join(" "));
  const res = await fetch(`/api/search?q=${q}&wide=1`);
  if (!res.ok) throw new Error("La recherche a échoué.");
  const body = (await res.json()) as { hits: SearchHit[] };
  return interleaveBySource(body.hits).slice(0, MAX_CANDIDATES);
}

// Une candidate de chaque source à tour de rôle, pour qu'aucune source ne soit
// évincée par le plafond.
function interleaveBySource(hits: SearchHit[]): SearchHit[] {
  const bySource = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const list = bySource.get(hit.source.host) ?? [];
    list.push(hit);
    bySource.set(hit.source.host, list);
  }
  const queues = [...bySource.values()];
  const out: SearchHit[] = [];
  for (let i = 0; out.length < hits.length; i++) {
    for (const queue of queues) if (queue[i]) out.push(queue[i]);
  }
  return out;
}

export function IngredientResults({ ingredients }: { ingredients: string[] }) {
  const key = ingredients.join(",");
  const pantry = usePantry();
  const [state, setState] = useState<State>(() => {
    const cached = sessionCache.get(key);
    return cached
      ? { status: "done", ...cached }
      : { status: "loading", done: 0, total: 0 };
  });

  useEffect(() => {
    if (sessionCache.has(key)) return;
    let cancelled = false;

    (async () => {
      try {
        const hits = await loadCandidates(key.split(","));
        if (cancelled) return;
        setState({ status: "loading", done: 0, total: hits.length });

        const recipes: Recipe[] = [];
        let done = 0;
        let next = 0;
        const worker = async () => {
          while (next < hits.length && !cancelled) {
            const hit = hits[next++];
            try {
              recipes.push(await fetchRecipe(hit.url));
            } catch {
              /* page illisible : on passe à la suivante */
            }
            done += 1;
            if (!cancelled)
              setState({ status: "loading", done, total: hits.length });
          }
        };
        await Promise.all(Array.from({ length: CONCURRENCY }, worker));
        if (cancelled) return;

        const loaded = { recipes, read: recipes.length };
        sessionCache.set(key, loaded);
        setState({ status: "done", ...loaded });
      } catch (err) {
        if (!cancelled)
          setState({
            status: "error",
            message:
              err instanceof Error ? err.message : "La recherche a échoué.",
          });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (state.status === "error") {
    return (
      <div className="tc-empty" role="alert">
        {state.message} Vérifie ta connexion puis relance la recherche.
      </div>
    );
  }

  if (state.status === "loading") {
    const pct = state.total ? (state.done / state.total) * 100 : 4;
    return (
      <div
        className="flex flex-col items-center px-2 py-14 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="tc-kicker">La brigade épluche les recettes</p>
        <p className="mt-4 font-display text-6xl leading-none text-gold tabular-nums">
          {state.total ? `${state.done} / ${state.total}` : "…"}
        </p>
        <div className="tc-progress my-5 max-w-sm">
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[13.5px] text-mute">
          {state.total
            ? "Lecture des ingrédients de chaque recette…"
            : "Interrogation des six sources…"}
        </p>
      </div>
    );
  }

  const scored = state.recipes.map((recipe) => ({
    recipe,
    match: matchRecipe(recipe, ingredients, pantry),
  }));
  const byToBuy = (
    a: { match: IngredientMatch },
    b: { match: IngredientMatch },
  ) => a.match.toBuy.length - b.match.toBuy.length;

  const full = scored.filter((s) => s.match.absent.length === 0).sort(byToBuy);
  const partial =
    full.length < MIN_FULL
      ? scored
          .filter((s) => s.match.absent.length > 0 && s.match.have.length > 0)
          .sort(
            (a, b) =>
              b.match.have.length - a.match.have.length || byToBuy(a, b),
          )
      : [];

  const list = (items: typeof scored) => (
    <ul className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
      {items.map(({ recipe, match }) => (
        <li key={recipe.source.url}>
          <RecipeCard recipe={recipe} ingredients={ingredients} match={match} />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Résultats">
      <p className="tc-kicker">
        {state.read} recette{state.read > 1 ? "s" : ""} lue
        {state.read > 1 ? "s" : ""}
      </p>
      <h2 className="tc-rtitle mb-4 mt-2">
        {full.length === 0
          ? "Aucune recette avec "
          : `${full.length} recette${full.length > 1 ? "s" : ""} avec `}
        {ingredients.length > 3 ? (
          <>
            tes <em>{ingredients.length} ingrédients</em>
          </>
        ) : (
          ingredients.map((term, i) => (
            <span key={term}>
              {i > 0 && " + "}
              <em>{term}</em>
            </span>
          ))
        )}
      </h2>

      {full.length > 0 && list(full)}

      {partial.length > 0 && (
        <>
          <h3 className="tc-sub mb-3 mt-7">
            Avec une partie de tes ingrédients
          </h3>
          {list(partial)}
        </>
      )}

      {full.length === 0 && partial.length === 0 && (
        <div className="tc-empty">
          Aucune des recettes lues ne contient ces ingrédients. Essaie avec
          moins d&apos;ingrédients, ou une appellation plus courante.
        </div>
      )}
    </section>
  );
}
