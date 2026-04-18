"use client";

import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { SearchHit } from "@/lib/types";
import type { SearchBackend } from "@/lib/search";
import type { AccordionEntry } from "./RecipeAccordion";
import { ResultCard } from "./ResultCard";

type EntryMap = Record<string, AccordionEntry | undefined>;

function withViewTransition(updater: () => void) {
  if (
    typeof document === "undefined" ||
    typeof document.startViewTransition !== "function"
  ) {
    updater();
    return;
  }
  document.startViewTransition(() => {
    flushSync(updater);
  });
}

export function ResultsList({
  query,
  hits,
  backend,
}: {
  query: string;
  hits: SearchHit[];
  backend: SearchBackend;
}) {
  const [lastHits, setLastHits] = useState<SearchHit[]>(hits);
  const [openOrder, setOpenOrder] = useState<string[]>([]);
  const [entries, setEntries] = useState<EntryMap>({});
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  if (lastHits !== hits) {
    setLastHits(hits);
    setOpenOrder([]);
    setEntries({});
  }

  const registerRef = useCallback(
    (url: string) => (el: HTMLElement | null) => {
      if (el) cardRefs.current.set(url, el);
      else cardRefs.current.delete(url);
    },
    [],
  );

  const fetchRecipe = useCallback(async (url: string) => {
    setEntries((prev) => ({ ...prev, [url]: { status: "loading" } }));
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const body = await res.json();
      if (!res.ok) {
        const message =
          typeof body?.error === "string"
            ? body.error
            : "Impossible de charger cette recette.";
        setEntries((prev) => ({
          ...prev,
          [url]: { status: "error", message },
        }));
        return;
      }
      setEntries((prev) => ({
        ...prev,
        [url]: { status: "ok", recipe: body.recipe },
      }));
    } catch {
      setEntries((prev) => ({
        ...prev,
        [url]: {
          status: "error",
          message: "Erreur réseau — vérifiez votre connexion.",
        },
      }));
    }
  }, []);

  const toggle = useCallback(
    (url: string) => {
      withViewTransition(() => {
        setOpenOrder((prev) => {
          if (prev.includes(url)) return prev.filter((u) => u !== url);
          if (!entries[url]) void fetchRecipe(url);
          window.setTimeout(() => {
            const el = cardRefs.current.get(url);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
          return [...prev, url];
        });
      });
    },
    [entries, fetchRecipe],
  );

  const close = useCallback((url: string) => {
    withViewTransition(() => {
      setOpenOrder((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : prev,
      );
    });
  }, []);

  if (hits.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <p className="display text-5xl italic text-brique">Rien ce soir.</p>
        <p className="mt-4 text-ink-soft">
          Aucune recette trouvée pour{" "}
          <span className="display italic">« {query} »</span>. Essayez un terme
          plus général : <em>risotto</em>, <em>tarte</em>, <em>poulet</em>…
        </p>
      </div>
    );
  }

  const openSet = new Set(openOrder);
  const hitsByUrl = new Map(hits.map((h) => [h.url, h]));
  const openHits = openOrder
    .map((url) => hitsByUrl.get(url))
    .filter((h): h is SearchHit => Boolean(h));
  const closedHits = hits.filter((h) => !openSet.has(h.url));
  const orderedHits = [...openHits, ...closedHits];
  const indexByUrl = new Map(orderedHits.map((hit, i) => [hit.url, i + 1]));
  const transitionNameByUrl = new Map(
    hits.map((hit, i) => [hit.url, `card-${i + 1}`]),
  );
  const openCount = openOrder.length;
  const sitesPresent = new Set(orderedHits.map((h) => h.source.host)).size;

  return (
    <div className="space-y-10">
      <header className="border-b border-ink/25 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-baseline gap-5">
            <span
              aria-hidden
              className="folio-mega letterpress text-ink-deep"
              style={{ fontSize: "clamp(3.5rem, 9vw, 6rem)" }}
            >
              {String(hits.length).padStart(2, "0")}
            </span>
            <div>
              <p className="smallcaps text-ink-mute">Résultats pour</p>
              <h2 className="display mt-1 text-3xl italic text-ink-deep sm:text-4xl">
                « {query} »
              </h2>
            </div>
          </div>
          <div className="smallcaps text-right text-ink-mute">
            <div className="tnum">
              {hits.length} {hits.length > 1 ? "recettes" : "recette"} ·{" "}
              {sitesPresent} {sitesPresent > 1 ? "cuisines" : "cuisine"}
            </div>
            {openCount > 0 && (
              <div className="mt-1 flex items-center justify-end gap-2 text-brique">
                <span
                  aria-hidden
                  className="inline-block h-[6px] w-[6px] animate-pulse rounded-full bg-brique"
                />
                <span className="tnum">
                  {openCount} {openCount > 1 ? "ouvertes" : "ouverte"}
                </span>
              </div>
            )}
            <div className="mt-1 text-[10px] opacity-60">
              Source :{" "}
              {backend === "brave" ? "Brave Search" : "recherche directe"}
            </div>
          </div>
        </div>
        <p className="smallcaps mt-4 flex items-center gap-2 text-[10px] text-ink-mute/90">
          <span aria-hidden className="text-brique">↕</span>
          Dépliez plusieurs recettes — elles se placeront côte à côte automatiquement
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {orderedHits.map((hit) => (
          <ResultCard
            key={hit.url}
            hit={hit}
            index={indexByUrl.get(hit.url) ?? 0}
            open={openSet.has(hit.url)}
            entry={entries[hit.url]}
            viewTransitionName={transitionNameByUrl.get(hit.url) ?? ""}
            onToggle={() => toggle(hit.url)}
            onClose={() => close(hit.url)}
            registerRef={registerRef(hit.url)}
          />
        ))}
      </div>
    </div>
  );
}
