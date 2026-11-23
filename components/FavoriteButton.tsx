"use client";

import { useState } from "react";
import { toggleFavorite, useFavorites } from "@/lib/carnet";
import { fetchRecipe } from "@/lib/recipe-client";
import { Recipe } from "@/lib/types";

/**
 * Étoile du carnet. Sans `recipe` (résultats de la recherche par plat), la
 * recette est lue au moment de l'ajout pour être gardée en entier.
 */
export function FavoriteButton({
  url,
  recipe,
  title,
  variant = "star",
}: {
  url: string;
  recipe?: Recipe;
  title: string;
  variant?: "star" | "button";
}) {
  const favorites = useFavorites();
  const saved = favorites.find((s) => s.recipe.source.url === url);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const onClick = async () => {
    if (state === "loading") return;
    const known = saved?.recipe ?? recipe;
    if (known) {
      toggleFavorite(known);
      return;
    }
    setState("loading");
    try {
      toggleFavorite(await fetchRecipe(url));
      setState("idle");
    } catch {
      setState("error");
    }
  };

  const label = saved
    ? `Retirer « ${title} » du carnet`
    : `Ajouter « ${title} » au carnet`;
  const glyph = state === "loading" ? "…" : state === "error" ? "!" : saved ? "★" : "☆";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={Boolean(saved)}
        className="tc-gb"
      >
        <span aria-hidden>{glyph}</span>
        {saved ? "Dans le carnet" : "Ajouter au carnet"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={Boolean(saved)}
      aria-label={label}
      title={state === "error" ? "Recette illisible, réessayer" : label}
      className="tc-star"
    >
      <span aria-hidden>{glyph}</span>
    </button>
  );
}
