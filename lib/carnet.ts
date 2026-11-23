"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { DEFAULT_PANTRY } from "@/lib/ingredients/match";
import { Recipe } from "@/lib/types";

// Carnet personnel : tout est stocké dans le navigateur (localStorage), par
// appareil. Pas de compte, pas de synchronisation.

export type SavedRecipe = { recipe: Recipe; at: number };
export type SavedSearch = { mode: "plat" | "ingredients"; value: string };

const KEYS = {
  favorites: "topchef:favoris",
  history: "topchef:historique",
  searches: "topchef:recherches",
  pantry: "topchef:placard",
} as const;

const HISTORY_MAX = 20;
const SEARCHES_MAX = 10;

const NO_RECIPES: SavedRecipe[] = [];
const NO_SEARCHES: SavedSearch[] = [];

const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();

function read<T>(key: string, fallback: T): T {
  if (!cache.has(key)) {
    let value = fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) value = JSON.parse(raw) as T;
    } catch {
      /* stockage indisponible ou corrompu : on repart du défaut */
    }
    cache.set(key, value);
  }
  return cache.get(key) as T;
}

function write<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota dépassé ou navigation privée : la valeur reste en mémoire */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  const onStorage = () => {
    cache.clear();
    listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
}

export const useFavorites = () => useStored(KEYS.favorites, NO_RECIPES);
export const useHistory = () => useStored(KEYS.history, NO_RECIPES);
export const useSearches = () => useStored(KEYS.searches, NO_SEARCHES);
export const usePantry = () => useStored(KEYS.pantry, DEFAULT_PANTRY);

export function findSaved(url: string): Recipe | undefined {
  return [
    ...read(KEYS.favorites, NO_RECIPES),
    ...read(KEYS.history, NO_RECIPES),
  ].find((s) => s.recipe.source.url === url)?.recipe;
}

export function toggleFavorite(recipe: Recipe) {
  const list = read(KEYS.favorites, NO_RECIPES);
  const url = recipe.source.url;
  const exists = list.some((s) => s.recipe.source.url === url);
  write(
    KEYS.favorites,
    exists
      ? list.filter((s) => s.recipe.source.url !== url)
      : [{ recipe, at: Date.now() }, ...list],
  );
}

export function addHistory(recipe: Recipe) {
  const list = read(KEYS.history, NO_RECIPES);
  const url = recipe.source.url;
  write(
    KEYS.history,
    [
      { recipe, at: Date.now() },
      ...list.filter((s) => s.recipe.source.url !== url),
    ].slice(0, HISTORY_MAX),
  );
}

export function addSearch(search: SavedSearch) {
  const list = read(KEYS.searches, NO_SEARCHES);
  write(
    KEYS.searches,
    [
      search,
      ...list.filter(
        (s) => s.mode !== search.mode || s.value !== search.value,
      ),
    ].slice(0, SEARCHES_MAX),
  );
}

export function clearHistory() {
  write(KEYS.history, NO_RECIPES);
  write(KEYS.searches, NO_SEARCHES);
}

export function setPantry(items: string[]) {
  write(KEYS.pantry, items);
}

const recipeSchema = z.object({
  title: z.string().min(1),
  image: z.string().optional(),
  description: z.string().optional(),
  source: z.object({ host: z.string(), url: z.url(), name: z.string() }),
  author: z.string().optional(),
  totalTimeMinutes: z.number().optional(),
  prepTimeMinutes: z.number().optional(),
  cookTimeMinutes: z.number().optional(),
  servings: z.number().optional(),
  rating: z.object({ value: z.number(), count: z.number() }).optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
});

const exportSchema = z.object({
  favoris: z.array(z.object({ recipe: recipeSchema, at: z.number() })),
});

export function exportFavorites() {
  const data = { favoris: read(KEYS.favorites, NO_RECIPES) };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "carnet-topchef.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Fusionne un fichier exporté avec les favoris existants. Renvoie le nombre ajouté. */
export async function importFavorites(file: File): Promise<number> {
  const parsed = exportSchema.parse(JSON.parse(await file.text()));
  const list = read(KEYS.favorites, NO_RECIPES);
  const known = new Set(list.map((s) => s.recipe.source.url));
  const added = parsed.favoris.filter((s) => !known.has(s.recipe.source.url));
  write(KEYS.favorites, [...list, ...added]);
  return added.length;
}
