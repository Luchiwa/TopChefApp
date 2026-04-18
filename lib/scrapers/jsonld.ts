import * as cheerio from "cheerio";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonLdRecipe = Record<string, unknown>;

function typeMatches(type: unknown, target: string): boolean {
  if (typeof type === "string") return type === target;
  if (Array.isArray(type)) return type.some((t) => t === target);
  return false;
}

function findRecipeDeep(node: JsonValue): JsonLdRecipe | undefined {
  if (!node || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findRecipeDeep(child);
      if (found) return found;
    }
    return undefined;
  }
  const obj = node as Record<string, JsonValue>;
  if (typeMatches(obj["@type"], "Recipe")) {
    return obj as JsonLdRecipe;
  }
  if (Array.isArray(obj["@graph"])) {
    const found = findRecipeDeep(obj["@graph"] as JsonValue);
    if (found) return found;
  }
  for (const key of Object.keys(obj)) {
    if (key === "@graph") continue;
    const found = findRecipeDeep(obj[key]);
    if (found) return found;
  }
  return undefined;
}

export function extractRecipeJsonLd(html: string): JsonLdRecipe | undefined {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  for (const el of scripts.toArray()) {
    const raw = $(el).contents().text();
    if (!raw.trim()) continue;
    let parsed: JsonValue;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/[\u0000-\u001F]+/g, " ");
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        continue;
      }
    }
    const recipe = findRecipeDeep(parsed);
    if (recipe) return recipe;
  }
  return undefined;
}
