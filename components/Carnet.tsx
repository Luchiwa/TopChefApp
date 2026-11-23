"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  clearHistory,
  exportFavorites,
  importFavorites,
  useFavorites,
  useHistory,
  useSearches,
} from "@/lib/carnet";
import { relativeDay, searchHref } from "@/lib/recipe-format";
import { RecipeCard } from "./RecipeCard";

type Tab = "favoris" | "historique";

export function Carnet() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    params.get("onglet") === "historique" ? "historique" : "favoris",
  );
  const favorites = useFavorites();
  const history = useHistory();
  const searches = useSearches();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const added = await importFavorites(file);
      setNotice(
        added === 0
          ? "Aucune nouvelle recette dans ce fichier."
          : `${added} recette${added > 1 ? "s" : ""} ajoutée${added > 1 ? "s" : ""} au carnet.`,
      );
    } catch {
      setNotice("Ce fichier n'est pas un carnet TopChef valide.");
    }
  };

  return (
    <>
      <h1 className="tc-hero">Mon carnet</h1>

      <div className="tc-tabs mb-4 mt-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "favoris"}
          onClick={() => setTab("favoris")}
        >
          Favoris · {favorites.length}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "historique"}
          onClick={() => setTab("historique")}
        >
          Historique
        </button>
      </div>

      {tab === "favoris" && (
        <section role="tabpanel" aria-label="Favoris">
          {favorites.length === 0 ? (
            <div className="tc-empty">
              <p>
                Aucun favori pour l&apos;instant. Touche l&apos;étoile ☆
                d&apos;une recette pour la garder ici.
              </p>
              <Link href="/" className="tc-btn mt-4">
                Chercher une recette →
              </Link>
            </div>
          ) : (
            <ul className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {favorites.map(({ recipe }) => (
                <li key={recipe.source.url}>
                  <RecipeCard recipe={recipe} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
            {favorites.length > 0 && (
              <button type="button" className="tc-gb" onClick={exportFavorites}>
                Exporter
              </button>
            )}
            <button
              type="button"
              className="tc-gb"
              onClick={() => fileRef.current?.click()}
            >
              Importer
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onImport}
            />
          </div>
          <p className="mt-3 text-[13.5px] text-mute" role="status">
            {notice ||
              "Le carnet est enregistré sur cet appareil. Exporte-le pour le transférer sur un autre."}
          </p>
        </section>
      )}

      {tab === "historique" && (
        <section role="tabpanel" aria-label="Historique">
          {history.length === 0 && searches.length === 0 ? (
            <div className="tc-empty">
              Les recettes que tu ouvres et tes recherches apparaîtront ici.
            </div>
          ) : (
            <>
              {history.length > 0 && (
                <>
                  <h2 className="tc-sub mb-3">Recettes ouvertes</h2>
                  <ul className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                    {history.map(({ recipe, at }) => (
                      <li key={recipe.source.url}>
                        <RecipeCard recipe={recipe} note={relativeDay(at)} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {searches.length > 0 && (
                <>
                  <h2 className="tc-sub mb-1 mt-7">Recherches récentes</h2>
                  <ul>
                    {searches.map((s) => (
                      <li key={`${s.mode}-${s.value}`}>
                        <Link
                          href={searchHref(s)}
                          className="flex min-h-[48px] items-center justify-between gap-3 border-b border-line hover:text-gold"
                        >
                          <span>{s.value}</span>
                          <span className="text-[13px] text-mute">
                            {s.mode === "plat" ? "plat" : "ingrédients"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <button
                type="button"
                className="tc-gb mt-5"
                onClick={() => {
                  if (window.confirm("Effacer tout l'historique ?"))
                    clearHistory();
                }}
              >
                Effacer l&apos;historique
              </button>
            </>
          )}
        </section>
      )}
    </>
  );
}
