import { Recipe, siteForHost } from "@/lib/types";
import { extractRecipeJsonLd } from "./jsonld";
import { extractMarieClaireRecipe } from "./marieclaire";
import {
  normalizeIngredients,
  normalizeInstructions,
  parseAuthor,
  parseDescription,
  parseIsoDurationMinutes,
  parseRating,
  parseServings,
  pickImageUrl,
} from "./normalize";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export class ScrapeError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "fetch_failed"
      | "no_recipe_found"
      | "invalid_url"
      | "unsupported_site",
  ) {
    super(message);
  }
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new ScrapeError(
      `Impossible de charger la page (HTTP ${res.status})`,
      "fetch_failed",
    );
  }
  return await res.text();
}

export async function scrapeRecipe(rawUrl: string): Promise<Recipe> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ScrapeError("URL invalide", "invalid_url");
  }

  const site = siteForHost(parsed.hostname);
  if (!site) {
    throw new ScrapeError(
      `Site non supporté : ${parsed.hostname}`,
      "unsupported_site",
    );
  }

  const html = await fetchHtml(parsed.toString());
  const jsonld = extractRecipeJsonLd(html);
  if (!jsonld) {
    throw new ScrapeError(
      "Aucune recette structurée n'a été trouvée sur cette page.",
      "no_recipe_found",
    );
  }

  const title =
    typeof jsonld.name === "string" ? jsonld.name.trim() : undefined;
  if (!title) {
    throw new ScrapeError(
      "Recette sans titre détectable.",
      "no_recipe_found",
    );
  }

  let ingredients = normalizeIngredients(jsonld.recipeIngredient);
  let instructions = normalizeInstructions(jsonld.recipeInstructions);

  if (site.host === "marieclaire.fr") {
    const mc = extractMarieClaireRecipe(html);
    if (mc.ingredients.length > 0) ingredients = mc.ingredients;
    if (mc.instructions.length > 0) instructions = mc.instructions;
  }

  if (ingredients.length === 0 && instructions.length === 0) {
    throw new ScrapeError(
      "Recette incomplète (ni ingrédients ni étapes).",
      "no_recipe_found",
    );
  }

  return {
    title,
    image: pickImageUrl(jsonld.image),
    description: parseDescription(jsonld.description),
    source: { host: site.host, name: site.name, url: parsed.toString() },
    author: parseAuthor(jsonld.author),
    totalTimeMinutes: parseIsoDurationMinutes(jsonld.totalTime),
    prepTimeMinutes: parseIsoDurationMinutes(jsonld.prepTime),
    cookTimeMinutes: parseIsoDurationMinutes(jsonld.cookTime),
    servings: parseServings(jsonld.recipeYield),
    rating: parseRating(jsonld.aggregateRating),
    ingredients,
    instructions,
  };
}
