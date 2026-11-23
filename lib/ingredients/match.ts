import { Recipe } from "@/lib/types";

export const DEFAULT_PANTRY = [
  "sel",
  "poivre",
  "huile",
  "beurre",
  "farine",
  "sucre",
  "œufs",
  "ail",
  "oignon",
];

// Jamais compté comme « à prévoir », quel que soit le placard.
const ALWAYS_AVAILABLE = ["eau"];

const STOPWORDS = new Set([
  "de", "du", "des", "la", "le", "les", "a", "au", "aux", "en", "et", "ou",
  "d", "l", "un", "une",
]);

// Appellations différentes d'un même ingrédient. Table volontairement courte,
// à enrichir à l'usage.
const SYNONYMS: string[][] = [
  [
    "viande hachée",
    "bœuf haché",
    "steak haché",
    "haché de bœuf",
    "hachis de bœuf",
    "hachis de viande",
  ],
  ["lardons", "poitrine fumée", "lard fumé"],
  ["fromage râpé", "gruyère", "emmental", "comté râpé"],
  ["pomme de terre", "patate"],
  ["pâtes", "spaghetti", "tagliatelles", "penne", "coquillettes", "macaroni"],
];

function stem(token: string): string {
  let t = token;
  if (t.length > 3 && /[sx]$/.test(t)) t = t.slice(0, -1);
  const noE = t.replace(/e+$/, "");
  return noE.length >= 3 ? noE : t;
}

/** Tokens comparables : sans accents, sans mots vides, singulier approximatif. */
export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z]+/)
    .filter((t) => t && !STOPWORDS.has(t))
    .map(stem);
}

const SYNONYM_TOKENS = SYNONYMS.map((group) => group.map(tokens));

/** Toutes les formes (liste de tokens) sous lesquelles un terme peut apparaître. */
function variants(term: string): string[][] {
  const own = tokens(term);
  if (own.length === 0) return [];
  const key = own.join(" ");
  const group = SYNONYM_TOKENS.find((g) => g.some((v) => v.join(" ") === key));
  return group ?? [own];
}

function lineHas(lineTokens: Set<string>, term: string): boolean {
  return variants(term).some((v) => v.every((t) => lineTokens.has(t)));
}

/** Vrai si la ligne d'ingrédient d'une recette contient l'un des termes. */
export function lineMatches(line: string, terms: string[]): boolean {
  const set = new Set(tokens(line));
  return terms.some((term) => lineHas(set, term));
}

const UNITS =
  "kg|g|gr|grammes?|mg|l|litres?|cl|ml|dl|cuill[eè]res?|cuil|c|cs|cc|càs|càc|pinc[ée]es?|gousses?|bouquets?|brins?|branches?|feuilles?|tranches?|bo[iî]tes?|sachets?|verres?|tasses?|bottes?|pots?|briques?|briquettes?|filets?|noisettes?|morceaux?|poign[ée]es?|paquets?|rouleaux?|tiges?|zestes?|blancs?|jaunes?";
const UNIT_RE = new RegExp(
  `^(?:${UNITS})(?=[\\s.]|$)\\.?\\s*(?:[àa]\\s+(?:soupe|caf[ée]|s|c)(?=[\\s.]|$)\\.?\\s*)?`,
);
const ADJECTIVE_RE =
  /^(?:petite?s?|gros(?:se)?s?|belles?|beaux?|grande?s?|bonne?s?|demi)[\s-]+/;
const ARTICLE_RE = /^(?:de la |de l['’]|des |du |de |d['’])\s*/;

/** « 400 g de viande hachée (bœuf) » → « viande hachée ». */
export function ingredientName(line: string): string {
  let s = line
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  s = s.replace(/^[\d\s.,/½¼¾-]+/, "");
  s = s.replace(ADJECTIVE_RE, "");
  s = s.replace(UNIT_RE, "");
  s = s.replace(ARTICLE_RE, "");
  s = s.replace(ADJECTIVE_RE, "");
  s = s.split(/[,;:]/)[0].trim();
  return s || line.trim();
}

export type IngredientMatch = {
  /** Ingrédients saisis présents dans la recette. */
  have: string[];
  /** Ingrédients saisis absents de la recette. */
  absent: string[];
  /** Ingrédients de la recette à se procurer (hors saisie et placard). */
  toBuy: string[];
};

export function matchRecipe(
  recipe: Recipe,
  terms: string[],
  pantry: string[],
): IngredientMatch {
  const lines = recipe.ingredients.map((line) => ({
    line,
    set: new Set(tokens(line)),
  }));
  const have: string[] = [];
  const absent: string[] = [];
  for (const term of terms) {
    if (lines.some((l) => lineHas(l.set, term))) have.push(term);
    else absent.push(term);
  }
  const covered = [...terms, ...pantry, ...ALWAYS_AVAILABLE];
  const toBuy: string[] = [];
  for (const l of lines) {
    if (covered.some((term) => lineHas(l.set, term))) continue;
    const name = ingredientName(l.line);
    if (!toBuy.includes(name)) toBuy.push(name);
  }
  return { have, absent, toBuy };
}

export function parseIngredientsParam(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const value = part.trim().replace(/\s+/g, " ").toLowerCase();
    const key = tokens(value).join(" ");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out.slice(0, 8);
}
