"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { addHistory } from "@/lib/carnet";
import { parseIngredientsParam } from "@/lib/ingredients/match";
import { fetchRecipe, knownRecipe } from "@/lib/recipe-client";
import { Recipe } from "@/lib/types";
import { RecipeView } from "./RecipeView";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; recipe: Recipe };

export function RecipeScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const url = params.get("url") ?? "";
  const ingredients = parseIngredientsParam(params.get("i") ?? "");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const show = (recipe: Recipe) => {
      if (cancelled) return;
      addHistory(recipe);
      setState({ status: "ready", recipe });
    };

    // Favoris et historique d'abord : pas de nouvelle lecture du site source.
    const known = url ? knownRecipe(url) : undefined;
    if (known) {
      queueMicrotask(() => show(known));
    } else if (!url) {
      queueMicrotask(() =>
        setState({ status: "error", message: "Aucune recette demandée." }),
      );
    } else {
      fetchRecipe(url).then(show, (err: Error) => {
        if (!cancelled) setState({ status: "error", message: err.message });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [url]);

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <>
      <button
        type="button"
        onClick={back}
        className="tc-label mb-1 inline-flex min-h-[44px] items-center gap-2 text-[13px] text-text hover:text-gold"
      >
        <ArrowLeft size={16} aria-hidden />
        Retour
      </button>

      {state.status === "loading" && (
        <div role="status" aria-label="Chargement de la recette">
          <div className="tc-skeleton h-48" />
          <div className="tc-skeleton mt-4 h-12 w-2/3" />
          <div className="tc-skeleton mt-4 h-40" />
        </div>
      )}

      {state.status === "error" && (
        <div className="tc-empty" role="alert">
          <p>{state.message}</p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="tc-gb mt-3"
            >
              Ouvrir la page d&apos;origine
            </a>
          )}
        </div>
      )}

      {state.status === "ready" && (
        <RecipeView recipe={state.recipe} ingredients={ingredients} />
      )}
    </>
  );
}
