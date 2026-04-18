# TopChef

Une application web personnelle pour chercher une même recette sur plusieurs sites de cuisine français et l'afficher dans un template unifié.

Tapez `frites au air fryer`, TopChef interroge Marmiton, 750g, Cuisine Actuelle et Cuisine AZ en parallèle, puis présente chaque recette dans la même mise en page — ingrédients à gauche, étapes à droite — pour comparer d'un coup d'œil et se mettre à cuisiner.

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Aucune clé API n'est nécessaire pour démarrer : la recherche utilise par défaut les moteurs de recherche internes des quatre sites.

## Recherche Brave (optionnel, recommandé)

Pour une recherche plus rapide et de meilleure qualité :

1. Créer une clé gratuite sur [api.search.brave.com](https://api.search.brave.com/app/keys) (crédit mensuel de 5 $ ≈ 1000 requêtes).
2. Copier `.env.local.example` en `.env.local` et coller la clé :

   ```bash
   cp .env.local.example .env.local
   ```

3. Redémarrer `npm run dev`.

Si `BRAVE_API_KEY` n'est pas défini, TopChef bascule automatiquement sur la recherche directe par site.

## Sites supportés

| Site | Couleur du badge |
|---|---|
| Marmiton | bordeaux |
| 750g | olive |
| Cuisine Actuelle | ocre |
| Cuisine AZ | teal |

L'extraction repose sur le bloc JSON-LD `schema.org/Recipe` que ces quatre sites exposent pour le SEO. Un seul parseur couvre donc tous les sites et reste stable tant qu'ils suivent la norme.

## Mode cuisine

Sur la page d'une recette, le bouton **Mode cuisine** :
- agrandit le texte des étapes pour qu'il reste lisible depuis le plan de travail,
- active la Screen Wake Lock API pour empêcher l'écran de s'éteindre pendant la cuisson.

## Pile technique

Next.js 16 (App Router, server components), React 19, TypeScript, Tailwind CSS v4, cheerio pour le parsing HTML, zod pour la validation, lucide-react pour les icônes.

## Scripts utiles

```bash
npm run dev     # développement
npm run build   # build de production
npm run lint    # ESLint
```

Les scripts de test manuel se trouvent dans `scripts/` (scraping et recherche sur des URLs réelles).

## Pistes futures

- Favoris en `localStorage`.
- Liste de courses agrégée à partir de plusieurs recettes.
- Adaptation du nombre de portions avec recalcul des quantités.
- Plus de sites (Journal des Femmes, Papilles et Pupilles…).
