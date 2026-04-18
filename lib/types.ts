export type RecipeSource = {
  host: string;
  url: string;
  name: string;
};

export type Recipe = {
  title: string;
  image?: string;
  description?: string;
  source: RecipeSource;
  author?: string;
  totalTimeMinutes?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  rating?: { value: number; count: number };
  ingredients: string[];
  instructions: string[];
};

export type SearchHit = {
  title: string;
  url: string;
  snippet: string;
  source: { host: string; name: string };
};

export type SupportedSite = {
  host: string;
  name: string;
  searchPath?: string;
};

export const SUPPORTED_SITES: SupportedSite[] = [
  { host: "marmiton.org", name: "Marmiton" },
  { host: "750g.com", name: "750g" },
  { host: "cuisineactuelle.fr", name: "Cuisine Actuelle" },
  { host: "cuisineaz.com", name: "Cuisine AZ" },
  { host: "marieclaire.fr", name: "Marie Claire", searchPath: "cuisine" },
];

export function siteForHost(hostname: string): SupportedSite | undefined {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();
  return SUPPORTED_SITES.find(
    (s) => normalized === s.host || normalized.endsWith(`.${s.host}`),
  );
}
