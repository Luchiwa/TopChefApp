"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IngredientMatch } from "@/lib/ingredients/match";
import { recipeHref, recipeMeta } from "@/lib/recipe-format";
import { Recipe } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { SourceBadge } from "./SourceBadge";

const TO_BUY_SHOWN = 4;

export function RecipeCard({
  recipe,
  note,
  ingredients,
  match,
}: {
  recipe: Recipe;
  /** Remplace la ligne durée / portions (ex. « hier » dans l'historique). */
  note?: string;
  ingredients?: string[];
  match?: IngredientMatch;
}) {
  const url = recipe.source.url;
  const toBuy = match?.toBuy ?? [];
  // Certaines sources renvoient une image par défaut qui refuse de se charger.
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="tc-card">
      <div className="tc-thumb">
        {recipe.image && !imageFailed && (
          <Image
            src={recipe.image}
            alt=""
            fill
            sizes="84px"
            className="object-cover"
            unoptimized
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className="min-w-0 py-2.5 pl-3 pr-1">
        <SourceBadge host={recipe.source.host} name={recipe.source.name} />
        <h3 className="tc-card-title mb-1 mt-1.5">
          <Link href={recipeHref(url, ingredients)} className="tc-card-link">
            {recipe.title}
          </Link>
        </h3>
        <p className="text-[13px] tabular-nums text-mute">
          {note ?? recipeMeta(recipe)}
        </p>
      </div>
      <FavoriteButton url={url} recipe={recipe} title={recipe.title} />
      {match && (
        <div className="tc-match">
          <p className="font-semibold text-gold">
            {match.have.map((term) => `✓ ${term}`).join(" · ")}
            {match.absent.length > 0 && (
              <span className="font-normal text-mute line-through">
                {" "}
                {match.absent.join(" · ")}
              </span>
            )}
          </p>
          <p className="mt-0.5 text-mute">
            {toBuy.length === 0 ? (
              "Rien d'autre à prévoir"
            ) : (
              <>
                À prévoir ({toBuy.length}) :{" "}
                <span className="font-semibold text-text">
                  {toBuy.slice(0, TO_BUY_SHOWN).join(", ")}
                  {toBuy.length > TO_BUY_SHOWN && "…"}
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
