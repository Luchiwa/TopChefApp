@AGENTS.md

# TopChef — Architecture technique

App perso (3-4 users) qui agrège la recherche de recettes sur plusieurs sites
français et ré-affiche chaque recette dans un gabarit unique (ingrédients à
gauche, étapes à droite, lien vers l'original). Deux modes de recherche : par
plat, ou par ingrédients disponibles. Carnet local (favoris + historique).

## Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4.
- `cheerio` (parsing HTML), `zod`. Pas de base de données, pas de state serveur.
  Les données perso (favoris, historique, placard) vivent dans le
  `localStorage` du navigateur, par appareil (`lib/carnet.ts`).
- Déploiement Vercel (région `cdg1`), voir `vercel.json` (fonctions API à
  `maxDuration: 30`).

## Flux
1. **Recherche par plat** — `/?q=…` → `runSearch()` (`lib/search/index.ts`),
   rendu serveur (`components/DishResults.tsx`). Aussi exposé en
   `GET /api/search?q=…`.
   - Si `BRAVE_API_KEY` est défini : backend Brave (`lib/search/brave.ts`), une
     requête `… site:<host>` par source.
   - Sinon : fallback `searchAcrossSites()` (`lib/search/sites.ts`).
   - Résultats classés par `rankAndFilter()` (`lib/search/relevance.ts`).
2. **Recherche par ingrédients** — `/?i=tomates,viande hachée` →
   `components/IngredientResults.tsx` (client), sans index ni base :
   1. candidates : `GET /api/search?q=<ingrédients>&wide=1` (`wide` = plus de
      résultats par source), réparties entre sources, plafonnées à 24 ;
   2. lecture : `GET /api/scrape` sur chaque candidate, 6 en parallèle, avec
      progression affichée ;
   3. correspondance : `matchRecipe()` (`lib/ingredients/match.ts`) compare les
      ingrédients saisis aux lignes de la recette (sans accents, singulier
      approximatif, table `SYNONYMS`). Le placard de base (modifiable) ne compte
      pas dans « à prévoir ».
   Seules les recettes contenant tous les ingrédients sont listées, triées par
   nombre d'ingrédients à prévoir ; s'il y en a moins de 3, une seconde section
   montre celles qui n'en contiennent qu'une partie.
3. **Scrape** — `GET /api/scrape?url=…` → `scrapeRecipe(url)`
   (`lib/scrapers/index.ts`)
   - Extrait le JSON-LD `schema.org/Recipe` (`lib/scrapers/jsonld.ts`) puis
     normalise (`lib/scrapers/normalize.ts`).
   - Renvoie un objet `Recipe` (`lib/types.ts`). Erreurs typées via `ScrapeError`.
   - Réponse mise en cache côté CDN (`Cache-Control`, 24 h).
4. **Recette** — `/recette?url=…[&i=…]` (`components/RecipeScreen.tsx`) : prend
   la recette dans le cache de session, les favoris ou l'historique, sinon
   appelle `/api/scrape`. Chaque ouverture alimente l'historique.
5. **Carnet** — `/carnet` (`components/Carnet.tsx`) : favoris (recette complète,
   export / import JSON) et historique (20 recettes, 10 recherches).

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
Thème sombre « plateau » (anthracite, or, chrome), pensé d'abord pour le
téléphone. Tokens dans `@theme` et classes de composants `tc-*` dans
`app/globals.css`.
- `components/AppNav.tsx` : en-tête + navigation (barre d'onglets fixe en bas
  sur téléphone, liens dans l'en-tête à partir de `sm`).
- `components/SearchPanel.tsx` : sélecteur de mode, champ plat ou étiquettes
  d'ingrédients, éditeur du placard.
- `components/SourceBadge.tsx` : pastille à la couleur de « brigade » de la
  source (table `BRIGADES` → variables `--color-<source>`). Pastille grise si
  host inconnu.
- `components/RecipeCard.tsx` : carte recette (résultats par ingrédients,
  carnet, accueil). `components/RecipeView.tsx` : gabarit de la recette.
- Icônes : `app/icon.png`, `app/apple-icon.png`, `public/icon-192.png`,
  `public/icon-512.png` (référencées dans `app/manifest.ts`).

## Ajouter une source
1. `lib/types.ts` : entrée dans `SUPPORTED_SITES`.
2. Recherche : soit un `CONFIG` dans `lib/search/sites.ts` (site avec recherche
   HTML), soit un module sitemap calqué sur `moulinex-sitemap.ts` branché dans
   `searchAcrossSites`. (Brave couvre automatiquement toute source de
   `SUPPORTED_SITES`.)
3. Scrape : rien si le site a un JSON-LD `Recipe` ; sinon un parseur custom
   branché dans `lib/scrapers/index.ts`.
4. UI : couleur `--color-<source>` dans `app/globals.css`, entrée dans
   `BRIGADES` (`SourceBadge.tsx`), copie dans `HomeRecent.tsx` /
   `app/layout.tsx`.
5. Tester : `npx tsx scripts/test-search.ts "<requête>"` puis
   `npx tsx scripts/test-scrape.ts "<url>"`.

## Limitations connues
- Recherche sitemap bornée aux URLs présentes dans le sitemap (Marie Claire,
  Moulinex).
- Moulinex : pas de filtrage par appareil (Cookeo / Air Fryer / Companion non
  distingués dans le sitemap ni le JSON-LD) — toutes les recettes Moulinex sont
  indexées.
- Recherche par ingrédients : Marie Claire et Moulinex ne sont interrogées que
  sur le nom de la recette (slug du sitemap), elles ressortent donc moins.
  La correspondance est textuelle : un ingrédient désigné autrement que dans
  `SYNONYMS` n'est pas reconnu.
- Pas de service worker : l'app ne fonctionne pas hors ligne, même pour les
  favoris.
