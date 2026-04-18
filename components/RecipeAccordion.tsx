"use client";

import { ArrowUpRight } from "lucide-react";
import type { Recipe, SearchHit } from "@/lib/types";
import { Fleuron } from "./Fleuron";
import { RecipeTemplate } from "./RecipeTemplate";

export type AccordionEntry =
  | { status: "loading" }
  | { status: "ok"; recipe: Recipe }
  | { status: "error"; message: string };

function InlineSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="skeleton h-7 w-28 rounded-full" />
        <div className="skeleton h-8 w-32 rounded-full" />
      </div>
      <div className="skeleton mb-6 aspect-[16/10] rounded-2xl" />
      <div className="space-y-3">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-10 w-4/5 rounded-xl" />
        <div className="mt-3 space-y-2">
          <div className="skeleton h-3 w-full rounded-full" />
          <div className="skeleton h-3 w-5/6 rounded-full" />
          <div className="skeleton h-3 w-2/3 rounded-full" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-xl" />
        ))}
      </div>
      <div className="mt-10 space-y-3">
        <div className="skeleton h-6 w-28 rounded-full" />
        <div className="skeleton h-0.5 w-full rounded-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full rounded-full" />
        ))}
      </div>
      <div className="mt-10 space-y-3">
        <div className="skeleton h-6 w-32 rounded-full" />
        <div className="skeleton h-0.5 w-full rounded-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function InlineError({
  hit,
  message,
  onClose,
}: {
  hit: SearchHit;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="relative py-12 text-center sm:py-16">
      <p className="smallcaps text-brique">Erreur de cuisson</p>
      <h3 className="display mt-3 text-3xl text-ink-deep sm:text-4xl">
        Cette recette refuse de sortir du four.
      </h3>
      <p className="mt-4 text-base text-ink-soft sm:text-lg">{message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={onClose}
          className="smallcaps rounded-full border border-ink/40 px-5 py-3 text-ink transition-colors hover:border-brique hover:text-brique"
        >
          Fermer
        </button>
        <a
          href={hit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="smallcaps inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-3 text-cream transition-colors hover:bg-brique"
        >
          Ouvrir sur {hit.source.name}
          <ArrowUpRight size={14} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

function formatTime(recipe: Recipe | undefined) {
  if (!recipe?.totalTimeMinutes) return null;
  const m = recipe.totalTimeMinutes;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} h ${String(rem).padStart(2, "0")}` : `${h} h`;
}

export function RecipeAccordion({
  open,
  hit,
  entry,
  onClose,
}: {
  open: boolean;
  hit: SearchHit;
  entry: AccordionEntry | undefined;
  onClose: () => void;
}) {
  const recipe = entry?.status === "ok" ? entry.recipe : undefined;
  const totalTime = formatTime(recipe);

  return (
    <div
      className="unfold-row"
      data-open={open ? "true" : "false"}
      aria-hidden={!open}
    >
      <div className="unfold-row-inner">
        <div className="unfold-content parchment-hatch relative bg-gradient-to-b from-honey/20 via-cream to-cream/60 px-3 pb-6 pt-1 sm:px-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brique/30 to-transparent"
          />

          {entry?.status === "ok" && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream-deep/40 px-3 py-2 backdrop-blur-sm">
              <p className="smallcaps flex flex-wrap items-center gap-2 text-[10px] text-saffron-deep">
                <span>Recette</span>
                <span className="tnum">
                  N°{String(hit.url.length % 100).padStart(2, "0")}
                </span>
                <span aria-hidden className="text-ink-mute/50">·</span>
                <span className="text-ink-soft">{hit.source.name}</span>
                {totalTime && (
                  <>
                    <span aria-hidden className="text-ink-mute/50">·</span>
                    <span className="tnum text-ink-soft">{totalTime}</span>
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="smallcaps inline-flex items-center gap-1.5 rounded-full border border-ink-deep bg-ink-deep px-3 py-1.5 text-[10px] text-cream transition-all hover:bg-brique hover:-translate-y-[1px]"
                aria-label="Refermer la recette"
              >
                <span aria-hidden className="text-sm leading-none">×</span>
                Replier
              </button>
            </div>
          )}

          {!entry || entry.status === "loading" ? (
            <InlineSkeleton />
          ) : entry.status === "error" ? (
            <InlineError hit={hit} message={entry.message} onClose={onClose} />
          ) : (
            <>
              <RecipeTemplate recipe={entry.recipe} />
              <div className="mt-6 flex items-center justify-center">
                <Fleuron variant="spray" size={16} className="text-saffron" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
