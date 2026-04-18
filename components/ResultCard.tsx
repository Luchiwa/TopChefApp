"use client";

import { SearchHit } from "@/lib/types";
import {
  type AccordionEntry,
  RecipeAccordion,
} from "./RecipeAccordion";
import { SourceBadge } from "./SourceBadge";

export function ResultCard({
  hit,
  index,
  open,
  entry,
  viewTransitionName,
  onToggle,
  onClose,
  registerRef,
}: {
  hit: SearchHit;
  index: number;
  open: boolean;
  entry: AccordionEntry | undefined;
  viewTransitionName: string;
  onToggle: () => void;
  onClose: () => void;
  registerRef: (el: HTMLElement | null) => void;
}) {
  const folio = String(index).padStart(2, "0");

  const style: React.CSSProperties = viewTransitionName
    ? { viewTransitionName }
    : {};

  return (
    <article
      ref={registerRef}
      style={style}
      data-open={open ? "true" : "false"}
      className="card-soft card-soft-hover group/card relative overflow-hidden rounded-3xl border border-ink/10 bg-cream data-[open=true]:border-brique/40"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-0 bg-gradient-to-b from-brique via-brique-bright to-saffron transition-all duration-500 group-data-[open=true]/card:w-[5px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-brique via-saffron to-transparent transition-transform duration-500 group-data-[open=true]/card:scale-x-100"
      />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`recipe-${encodeURIComponent(hit.url)}`}
        className="relative flex w-full items-start gap-4 px-4 py-4 text-left sm:gap-5 sm:px-5 sm:py-5"
      >
        <div
          aria-hidden
          className="flex shrink-0 flex-col items-center"
        >
          <span
            className="folio-mega letterpress select-none text-ink-mute/70 transition-all duration-300 group-hover/card:-translate-y-[2px] group-hover/card:text-brique group-data-[open=true]/card:text-brique"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
          >
            {folio}
          </span>
          <span
            aria-hidden
            className="mt-1 inline-block h-[1.5px] w-5 bg-brique/40 transition-all group-hover/card:w-8 group-hover/card:bg-brique group-data-[open=true]/card:w-8 group-data-[open=true]/card:bg-brique"
          />
        </div>

        <div className="min-w-0 flex-1 pt-1 pr-10">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SourceBadge host={hit.source.host} />
            <span className="smallcaps hidden text-[9px] text-ink-mute sm:inline">
              {open ? "· Déplié" : "· Déplier"}
            </span>
          </div>
          <h3 className="display text-[clamp(1.05rem,1.6vw,1.375rem)] leading-[1.2] text-ink-deep transition-colors group-hover/card:text-brique">
            {hit.title}
          </h3>
          {hit.snippet && !open && (
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
              {hit.snippet}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-start pt-1">
          <span
            aria-hidden
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 bg-cream text-ink-mute transition-all duration-300 group-hover/card:border-brique group-hover/card:text-brique group-data-[open=true]/card:rotate-45 group-data-[open=true]/card:border-brique group-data-[open=true]/card:bg-brique group-data-[open=true]/card:text-cream"
          >
            <span
              className="plus-minus"
              data-open={open ? "true" : "false"}
            />
          </span>
        </div>
      </button>

      <div id={`recipe-${encodeURIComponent(hit.url)}`} role="region">
        <RecipeAccordion
          open={open}
          hit={hit}
          entry={entry}
          onClose={onClose}
        />
      </div>
    </article>
  );
}
