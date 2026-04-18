"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const SUGGESTIONS = [
  "frites au air fryer",
  "risotto aux champignons",
  "quiche lorraine",
  "tarte tatin",
  "velouté de potimarron",
  "pad thaï maison",
  "poulet rôti",
  "salade niçoise",
  "crêpes bretonnes",
  "blanquette de veau",
];

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionVisible, setSuggestionVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialQuery) inputRef.current?.focus();
  }, [initialQuery]);

  useEffect(() => {
    if (value) return;
    const interval = setInterval(() => {
      setSuggestionVisible(false);
      window.setTimeout(() => {
        setSuggestionIndex((i) => (i + 1) % SUGGESTIONS.length);
        setSuggestionVisible(true);
      }, 260);
    }, 2800);
    return () => clearInterval(interval);
  }, [value]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    startTransition(() => {
      router.push(`/?q=${encodeURIComponent(q)}`);
    });
  };

  const disabled = isPending || !value.trim();

  return (
    <form
      onSubmit={submit}
      className="group relative"
      aria-label="Recherche de recette"
    >
      <div
        className={[
          "card-soft relative flex items-center gap-3 rounded-full border bg-cream px-3 py-2 transition-all sm:gap-5 sm:px-5",
          value
            ? "border-brique/60 shadow-[0_10px_30px_-10px_rgba(200,64,28,0.25)]"
            : "border-ink/15 focus-within:border-brique/60",
        ].join(" ")}
      >
        <span
          aria-hidden
          className="display-wonk hidden select-none leading-none text-brique/70 sm:inline"
          style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: "0.7" }}
        >
          «
        </span>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
            className="display w-full bg-transparent py-2.5 text-xl tracking-tight text-ink-deep outline-none sm:py-3 sm:text-3xl"
            aria-label="Rechercher une recette"
          />
          {!value && (
            <span
              aria-hidden
              className={`display pointer-events-none absolute inset-y-0 left-0 flex items-center text-xl text-ink-mute/55 transition-opacity duration-300 sm:text-3xl ${
                suggestionVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {SUGGESTIONS[suggestionIndex]}
            </span>
          )}
        </div>

        <span
          aria-hidden
          className="display-wonk hidden select-none leading-none text-brique/70 sm:inline"
          style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: "0.7" }}
        >
          »
        </span>

        <button
          type="submit"
          disabled={disabled}
          className="smallcaps group/btn relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-brique via-brique to-brique-deep px-4 py-3 text-cream shadow-[0_4px_0_var(--color-brique-deep)] transition-all hover:-translate-y-[1px] hover:shadow-[0_5px_0_var(--color-brique-deep)] active:translate-y-[1px] active:shadow-[0_2px_0_var(--color-brique-deep)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_var(--color-brique-deep)] sm:px-6"
        >
          <span className="relative flex items-center gap-2">
            <span>{isPending ? "Cuisson…" : "Chercher"}</span>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover/btn:translate-x-1"
            >
              →
            </span>
          </span>
        </button>
      </div>

      {isPending && (
        <span
          aria-hidden
          className="absolute inset-x-6 -bottom-1 h-[2px] overflow-hidden rounded-full"
        >
          <span className="block h-full w-full origin-left animate-[shimmer_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-brique to-transparent bg-[length:200%_100%]" />
        </span>
      )}
    </form>
  );
}
