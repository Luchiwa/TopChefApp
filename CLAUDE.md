@AGENTS.md

# TopChef — Architecture technique

App perso (3-4 users) qui agrège la recherche de recettes sur plusieurs sites
français et ré-affiche chaque recette dans un gabarit unique (ingrédients à
gauche, étapes à droite, lien vers l'original).

## Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4.
- `cheerio` (parsing HTML), `zod`. Pas de base de données, pas de state serveur.
- Déploiement Vercel (région `cdg1`), voir `vercel.json` (fonctions API à
  `maxDuration: 30`).

## Flux
1. **Recherche** — `POST /api/search` → `runSearch()` (`lib/search/index.ts`)
   - Si `BRAVE_API_KEY` est défini : backend Brave (`lib/search/brave.ts`), une
     requête `… site:<host>` par source.
   - Sinon : fallback `searchAcrossSites()` (`lib/search/sites.ts`).
   - Résultats classés par `rankAndFilter()` (`lib/search/relevance.ts`).
2. **Scrape** — `POST /api/scrape` → `scrapeRecipe(url)` (`lib/scrapers/index.ts`)
   - Extrait le JSON-LD `schema.org/Recipe` (`lib/scrapers/jsonld.ts`) puis
     normalise (`lib/scrapers/normalize.ts`).
   - Renvoie un objet `Recipe` (`lib/types.ts`). Erreurs typées via `ScrapeError`.

## Sources (6) — `SUPPORTED_SITES` dans `lib/types.ts`
Marmiton, 750g, Cuisine Actuelle, Cuisine AZ, Marie Claire, Moulinex.
`siteForHost()` retire `www.` et matche aussi les sous-domaines.

**Deux stratégies de recherche par source :**
- **Recherche HTML** (Marmiton, 750g, Cuisine Actuelle, Cuisine AZ) : `CONFIGS`
  dans `lib/search/sites.ts` (`buildUrl` + `recipeUrlMatcher`).
- **Sitemap** (Marie Claire, Moulinex) : ces sites n'ont pas d'URL de recherche
  par mot-clé exploitable → on indexe un sitemap recettes (cache 6 h, dé-dup
  inflight) et on score les slugs contre les tokens de la requête.
  Voir `lib/search/marieclaire-sitemap.ts` et `lib/search/moulinex-sitemap.ts`,
  branchés dans `searchAcrossSites` avec un garde-fou `withTimeout`.

**Deux stratégies de scrape :**
- **JSON-LD seul** (toutes sauf Marie Claire) : suffit tel quel. Les pages
  Moulinex (Angular SSR) exposent un JSON-LD `Recipe` standard → aucun code
  custom, le pipeline générique les gère.
- **JSON-LD + parseur custom** (Marie Claire) : `lib/scrapers/marieclaire.ts`
  complète ingrédients/étapes quand le JSON-LD est incomplet (override
  conditionnel dans `lib/scrapers/index.ts`).

## Affichage
- `components/SourceBadge.tsx` : map host → couleurs (variables
  `--color-<source>` / `-tint` dans `app/globals.css`). Fallback `bg-ink` si
  host inconnu. Deux tables : `STYLES` et `INITIALS`.
- `components/EmptyHero.tsx` : « Au sommaire » (tableau `SUMMARY`, le compteur
  « N cuisines » est dérivé de `SUMMARY.length`).
- `components/Masthead.tsx` : en-tête + liste des sources.

## Ajouter une source
1. `lib/types.ts` : entrée dans `SUPPORTED_SITES`.
2. Recherche : soit un `CONFIG` dans `lib/search/sites.ts` (site avec recherche
   HTML), soit un module sitemap calqué sur `moulinex-sitemap.ts` branché dans
   `searchAcrossSites`. (Brave couvre automatiquement toute source de
   `SUPPORTED_SITES`.)
3. Scrape : rien si le site a un JSON-LD `Recipe` ; sinon un parseur custom
   branché dans `lib/scrapers/index.ts`.
4. UI : couleurs dans `app/globals.css`, entrées dans `SourceBadge.tsx`
   (`STYLES` + `INITIALS`) et `EmptyHero.tsx` (`SUMMARY`), copie dans
   `Masthead.tsx` / `app/layout.tsx` / `app/manifest.ts`.
5. Tester : `npx tsx scripts/test-search.ts "<requête>"` puis
   `npx tsx scripts/test-scrape.ts "<url>"`.

## Limitations connues
- Recherche sitemap bornée aux URLs présentes dans le sitemap (Marie Claire,
  Moulinex).
- Moulinex : pas de filtrage par appareil (Cookeo / Air Fryer / Companion non
  distingués dans le sitemap ni le JSON-LD) — toutes les recettes Moulinex sont
  indexées.
