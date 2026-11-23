"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { lineMatches } from "@/lib/ingredients/match";
import { formatMinutes } from "@/lib/recipe-format";
import { Recipe } from "@/lib/types";
import { CookModeToggle } from "./CookModeToggle";
import { FavoriteButton } from "./FavoriteButton";
import { SourceBadge } from "./SourceBadge";

function useToggleSet() {
  const [set, setSet] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  return [set, toggle] as const;
}

export function RecipeView({
  recipe,
  ingredients = [],
}: {
  recipe: Recipe;
  /** Ingrédients saisis dans la recherche, mis en avant dans la liste. */
  ingredients?: string[];
}) {
  const [checked, toggleChecked] = useToggleSet();
  const [done, toggleDone] = useToggleSet();

  const stats: [string, string][] = [];
  if (recipe.prepTimeMinutes)
    stats.push(["Prépa", formatMinutes(recipe.prepTimeMinutes)]);
  if (recipe.cookTimeMinutes)
    stats.push(["Cuisson", formatMinutes(recipe.cookTimeMinutes)]);
  if (recipe.totalTimeMinutes && stats.length === 0)
    stats.push(["Durée", formatMinutes(recipe.totalTimeMinutes)]);
  if (recipe.servings) stats.push(["Pers.", String(recipe.servings)]);
  if (recipe.rating)
    stats.push(["Note", recipe.rating.value.toFixed(1).replace(".", ",")]);

  return (
    <article>
      {recipe.image && (
        <div className="relative -mx-4 mb-4 aspect-[16/9] max-h-[340px] overflow-hidden bg-surface sm:mx-0 sm:w-full sm:rounded-xl">
          <Image
            src={recipe.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 1100px"
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      )}

      <SourceBadge host={recipe.source.host} name={recipe.source.name} />
      <h1 className="tc-hero mt-2">{recipe.title}</h1>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <FavoriteButton
          url={recipe.source.url}
          recipe={recipe}
          title={recipe.title}
          variant="button"
        />
        <CookModeToggle />
        <a
          href={recipe.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="tc-gb col-span-2"
        >
          Voir l&apos;original sur {recipe.source.name}
          <ArrowUpRight size={14} aria-hidden />
        </a>
      </div>

      {stats.length > 0 && (
        <dl className="tc-stats mt-4">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dd>{value}</dd>
              <dt>{label}</dt>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 grid gap-7 md:grid-cols-[320px_3px_1fr]">
        <section aria-labelledby="h-ingredients">
          <h2 id="h-ingredients" className="tc-colh mb-2">
            Ingrédients · {recipe.ingredients.length}
          </h2>
          {recipe.ingredients.length === 0 ? (
            <p className="text-mute">Aucun ingrédient n&apos;a pu être extrait.</p>
          ) : (
            <ul>
              {recipe.ingredients.map((item, i) => {
                const isChecked = checked.has(i);
                const got =
                  ingredients.length > 0 && lineMatches(item, ingredients);
                return (
                  <li key={`${i}-${item}`} className="border-b border-line">
                    <button
                      type="button"
                      onClick={() => toggleChecked(i)}
                      aria-pressed={isChecked}
                      className="flex min-h-[44px] w-full items-start gap-2.5 py-2.5 text-left"
                    >
                      <span
                        aria-hidden
                        className={`mt-[7px] h-2 w-2 shrink-0 rounded-[2px] ${got ? "bg-gold" : "bg-line"}`}
                      />
                      <span
                        className={[
                          "cook-mode-text",
                          isChecked
                            ? "text-mute line-through"
                            : got
                              ? "font-semibold text-title"
                              : "",
                        ].join(" ")}
                      >
                        {item}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="tc-blade hidden md:block" aria-hidden />

        <section aria-labelledby="h-steps">
          <h2 id="h-steps" className="tc-colh mb-3">
            Préparation · {recipe.instructions.length} étape
            {recipe.instructions.length > 1 ? "s" : ""}
          </h2>
          {recipe.instructions.length === 0 ? (
            <p className="text-mute">
              Aucune étape n&apos;a pu être extraite. Consulte l&apos;original.
            </p>
          ) : (
            <ol>
              {recipe.instructions.map((step, i) => {
                const isDone = done.has(i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => toggleDone(i)}
                      aria-pressed={isDone}
                      className={`grid w-full grid-cols-[44px_1fr] pb-4 text-left ${isDone ? "opacity-45" : ""}`}
                    >
                      <span className="tc-stepnum" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="cook-mode-text">{step}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </article>
  );
}
