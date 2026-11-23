import * as cheerio from "cheerio";
import { SearchHit, SUPPORTED_SITES, SupportedSite } from "@/lib/types";
import { searchMarieClaireSitemap } from "./marieclaire-sitemap";
import { searchMoulinexSitemap } from "./moulinex-sitemap";
import { rankAndFilter } from "./relevance";

const MC_TIMEOUT_MS = 2000;
const SITE_SCAN_LIMIT = 40;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

type SiteSearchConfig = {
  site: SupportedSite;
  buildUrl: (query: string) => string;
  recipeUrlMatcher: (href: string) => boolean;
};

function encodeQuery(query: string): string {
  return new URLSearchParams({ q: query }).toString().slice(2);
}

function absoluteUrl(href: string, base: string): string | undefined {
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}

const CONFIGS: SiteSearchConfig[] = [
  {
    site: SUPPORTED_SITES[0], // marmiton.org
    buildUrl: (q) =>
      `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeQuery(q)}`,
    recipeUrlMatcher: (href) =>
      /marmiton\.org\/recettes\/recette_[^/]+_\d+\.aspx/i.test(href),
  },
  {
    site: SUPPORTED_SITES[1], // 750g.com
    buildUrl: (q) => `https://www.750g.com/recherche/?q=${encodeQuery(q)}`,
    recipeUrlMatcher: (href) =>
      /^https?:\/\/(www\.)?750g\.com\/[^/?#]+-r\d+\.htm/i.test(href),
  },
  {
    site: SUPPORTED_SITES[2], // cuisineactuelle.fr
    buildUrl: (q) =>
      `https://www.cuisineactuelle.fr/recettes/recherche_terme.aspx?recherche=${encodeQuery(q)}`,
    recipeUrlMatcher: (href) =>
      /cuisineactuelle\.fr\/recettes\/[a-z0-9-]+-\d+(\.aspx)?(?:[/?#]|$)/i.test(
        href,
      ),
  },
  {
    site: SUPPORTED_SITES[3], // cuisineaz.com
    buildUrl: (q) =>
      `https://www.cuisineaz.com/recettes/recherche_terme.aspx?recherche=${encodeQuery(q)}`,
    recipeUrlMatcher: (href) =>
      /cuisineaz\.com\/recettes\/[a-z0-9-]+-\d+\.aspx/i.test(href),
  },
];

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function extractHits(
  html: string,
  baseUrl: string,
  config: SiteSearchConfig,
  limit = 4,
): SearchHit[] {
  const $ = cheerio.load(html);
  const hits: SearchHit[] = [];
  const seen = new Set<string>();
  $("a[href]").each((_, el) => {
    if (hits.length >= limit) return;
    const $a = $(el);
    const href = $a.attr("href");
    if (!href) return;
    const abs = absoluteUrl(href, baseUrl);
    if (!abs || seen.has(abs)) return;
    if (!config.recipeUrlMatcher(abs)) return;
    const rawTitle =
      $a.text().replace(/\s+/g, " ").trim() ||
      $a.attr("title")?.trim() ||
      $a.find("img").attr("alt")?.trim() ||
      "";
    // Cuisine Actuelle / Cuisine AZ préfixent leurs liens de « Recette : ».
    const title = rawTitle.replace(/^recette\s*:\s*/i, "");
    if (!title || title.length < 3) return;
    seen.add(abs);
    hits.push({
      title,
      url: abs,
      snippet: "",
      source: { host: config.site.host, name: config.site.name },
    });
  });
  return hits;
}

async function searchOne(
  config: SiteSearchConfig,
  query: string,
  perSite?: number,
): Promise<SearchHit[]> {
  const url = config.buildUrl(query);
  try {
    const html = await fetchHtml(url);
    // Les pages de résultats mêlent des recettes « populaires » sans rapport
    // aux vrais résultats : on relève large, puis on garde les plus pertinentes.
    const all = extractHits(html, url, config, SITE_SCAN_LIMIT);
    return rankAndFilter(all, query).slice(0, perSite ?? 4);
  } catch (err) {
    console.warn(`[site-search] ${config.site.host} failed:`, err);
    return [];
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

export async function searchAcrossSites(
  query: string,
  perSite?: number,
): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const sitePromises = CONFIGS.map((c) => searchOne(c, trimmed, perSite));
  const mcPromise = withTimeout(
    searchMarieClaireSitemap(trimmed),
    MC_TIMEOUT_MS,
    [] as SearchHit[],
  );
  const moulinexPromise = withTimeout(
    searchMoulinexSitemap(trimmed),
    MC_TIMEOUT_MS,
    [] as SearchHit[],
  );
  const results = await Promise.all([
    ...sitePromises,
    mcPromise,
    moulinexPromise,
  ]);
  return results.flat();
}
