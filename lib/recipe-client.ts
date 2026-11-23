"use client";

import { findSaved } from "@/lib/carnet";
import { Recipe } from "@/lib/types";

// Cache mémoire des recettes déjà lues pendant la session : évite de rescraper
// en passant des résultats à la recette, puis en revenant en arrière.
const cache = new Map<string, Recipe>();

export function rememberRecipe(recipe: Recipe) {
  cache.set(recipe.source.url, recipe);
}

/** Recette déjà connue (session, favoris ou historique), sans appel au serveur. */
export function knownRecipe(url: string): Recipe | undefined {
  return cache.get(url) ?? findSaved(url);
}

export async function fetchRecipe(url: string): Promise<Recipe> {
  const known = cache.get(url);
  if (known) return known;
  const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.recipe) {
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : "Impossible de charger cette recette.",
    );
  }
  const recipe = body.recipe as Recipe;
  cache.set(url, recipe);
  return recipe;
}
