import { Recipe } from "@/lib/types";

export function recipeHref(url: string, ingredients?: string[]): string {
  const params = new URLSearchParams({ url });
  if (ingredients?.length) params.set("i", ingredients.join(","));
  return `/recette?${params}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function recipeMeta(recipe: Recipe): string {
  const parts: string[] = [];
  const total =
    recipe.totalTimeMinutes ??
    ((recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0) || undefined);
  if (total) parts.push(formatMinutes(total));
  if (recipe.servings) parts.push(`${recipe.servings} pers.`);
  if (recipe.rating)
    parts.push(`★ ${recipe.rating.value.toFixed(1).replace(".", ",")}`);
  return parts.join(" · ");
}

export function searchHref(search: {
  mode: "plat" | "ingredients";
  value: string;
}): string {
  return search.mode === "plat"
    ? `/?q=${encodeURIComponent(search.value)}`
    : `/?i=${encodeURIComponent(search.value.split(", ").join(","))}`;
}

const DAY_MS = 86_400_000;
const relative = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

/** « aujourd'hui », « hier », « il y a 3 jours »… */
export function relativeDay(timestamp: number): string {
  const startOfDay = (t: number) => new Date(t).setHours(0, 0, 0, 0);
  const days = Math.round(
    (startOfDay(timestamp) - startOfDay(Date.now())) / DAY_MS,
  );
  return relative.format(days, "day");
}
