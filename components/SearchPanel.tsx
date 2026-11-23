"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { addSearch, setPantry, usePantry } from "@/lib/carnet";
import { DEFAULT_PANTRY, parseIngredientsParam } from "@/lib/ingredients/match";

type Mode = "plat" | "ingredients";

export function SearchPanel({
  initialMode,
  initialQuery = "",
  initialIngredients = [],
  compact = false,
}: {
  initialMode: Mode;
  initialQuery?: string;
  initialIngredients?: string[];
  /** Sur une page de résultats : sans titre ni placard. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [query, setQuery] = useState(initialQuery);
  const [chips, setChips] = useState<string[]>(initialIngredients);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const withDraft = (list: string[], text: string) =>
    parseIngredientsParam([...list, text].join(","));

  const commitDraft = () => {
    if (!draft.trim()) return;
    setChips(withDraft(chips, draft));
    setDraft("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "plat") {
      const q = query.trim();
      if (!q) return;
      addSearch({ mode, value: q });
      startTransition(() => router.push(`/?q=${encodeURIComponent(q)}`));
      return;
    }
    const list = withDraft(chips, draft);
    if (list.length === 0) return;
    setChips(list);
    setDraft("");
    addSearch({ mode, value: list.join(", ") });
    startTransition(() =>
      router.push(`/?i=${encodeURIComponent(list.join(","))}`),
    );
  };

  const onDraftKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || (e.key === "Enter" && draft.trim())) {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && !draft && chips.length > 0) {
      setChips(chips.slice(0, -1));
    }
  };

  const empty =
    mode === "plat" ? !query.trim() : chips.length === 0 && !draft.trim();

  return (
    <form onSubmit={submit} aria-label="Recherche de recettes">
      {!compact && (
        <>
          <p className="tc-kicker">
            {mode === "plat" ? "6 brigades en cuisine" : "Épreuve du frigo"}
          </p>
          <h1 className="tc-hero mb-5 mt-2.5 max-w-[16ch]">
            {mode === "plat"
              ? "Qu'est-ce qu'on envoie ce soir ?"
              : "Qu'est-ce que tu as sous la main ?"}
          </h1>
        </>
      )}

      <div
        className="tc-seg mb-3 sm:inline-grid"
        role="group"
        aria-label="Type de recherche"
      >
        <button
          type="button"
          aria-pressed={mode === "plat"}
          onClick={() => setMode("plat")}
        >
          Un plat
        </button>
        <button
          type="button"
          aria-pressed={mode === "ingredients"}
          onClick={() => setMode("ingredients")}
        >
          Ingrédients
        </button>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        {mode === "plat" ? (
          <div className="tc-input flex-1">
            <input
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="blanquette de veau"
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Nom du plat"
            />
          </div>
        ) : (
          <div
            className="tc-input flex-1"
            onClick={() => inputRef.current?.focus()}
          >
            {chips.map((chip) => (
              <span key={chip} className="tc-chip">
                {chip}
                <button
                  type="button"
                  aria-label={`Retirer ${chip}`}
                  onClick={() => setChips(chips.filter((c) => c !== chip))}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              name="ingredient"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onDraftKey}
              onBlur={commitDraft}
              placeholder={
                chips.length ? "ajouter…" : "tomates, viande hachée…"
              }
              autoComplete="off"
              autoCapitalize="none"
              enterKeyHint="done"
              aria-label="Ajouter un ingrédient"
            />
          </div>
        )}
        <button type="submit" disabled={empty || isPending} className="tc-btn">
          {isPending
            ? "En cuisine…"
            : mode === "plat"
              ? "Chercher →"
              : "Trouver des recettes →"}
        </button>
      </div>

      {mode === "ingredients" && !compact && (
        <>
          <p className="mt-3 text-[13.5px] text-mute">
            Entrée ou virgule pour valider un ingrédient. Les recettes
            proposées contiennent tous tes ingrédients ; ce qu&apos;il manque
            est indiqué sur chaque carte.
          </p>
          <PantryEditor />
        </>
      )}
    </form>
  );
}

function PantryEditor() {
  const pantry = usePantry();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");

  const save = () => {
    setPantry(parseIngredientsParamLoose(text));
    setEditing(false);
  };

  return (
    <div className="tc-pantry mt-4">
      <p className="tc-label mb-2 text-xs text-text">
        Placard de base · supposé présent
      </p>
      {editing ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="tc-input flex-1">
            <input
              type="text"
              name="placard"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
              aria-label="Contenu du placard, séparé par des virgules"
              autoCapitalize="none"
            />
          </div>
          <button type="button" className="tc-gb" onClick={save}>
            Enregistrer
          </button>
          <button
            type="button"
            className="tc-gb"
            onClick={() => setText(DEFAULT_PANTRY.join(", "))}
          >
            Par défaut
          </button>
        </div>
      ) : (
        <p>
          {pantry.length ? pantry.join(" · ") : "Placard vide"}{" "}
          <button
            type="button"
            className="ml-1 min-h-[32px] text-gold underline underline-offset-4"
            onClick={() => {
              setText(pantry.join(", "));
              setEditing(true);
            }}
          >
            modifier
          </button>
        </p>
      )}
    </div>
  );
}

// Le placard n'est pas plafonné à 8 entrées comme la saisie d'ingrédients.
function parseIngredientsParamLoose(text: string): string[] {
  return [
    ...new Set(
      text
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}
