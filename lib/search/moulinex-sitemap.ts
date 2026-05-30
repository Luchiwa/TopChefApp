import { SearchHit } from "@/lib/types";
import { normalize, tokenize } from "./relevance";

const SITEMAP_URL = "https://www.moulinex.fr/Recipe-fr_fr-EUR.xml";
const TTL_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 4000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

type Entry = {
  url: string;
  title: string;
  slugWords: string[];
};

function splitWords(text: string): string[] {
  return text.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 3);
}

function tokenMatchesSlug(tok: string, slugWords: string[]): boolean {
  return slugWords.some((word) => word === tok || word.startsWith(tok));
}

type Cache = {
  entries: Entry[];
  fetchedAt: number;
};

let cache: Cache | null = null;
let inflight: Promise<Entry[]> | null = null;

function humanizeSlug(rawSlug: string): string {
  return rawSlug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseEntries(xml: string): Entry[] {
  const entries: Entry[] = [];
  const seen = new Set<string>();
  const regex =
    /<loc>\s*(https:\/\/www\.moulinex\.fr\/recette\/detail\/PRO\/[^<\s]+)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const url = match[1];
    if (seen.has(url)) continue;
    let path: string;
    try {
      path = decodeURIComponent(new URL(url).pathname);
    } catch {
      continue;
    }
    // Two URL forms: .../PRO/<slug>/<id> and .../PRO/<slug>/v1/recipes/<id>
    const slugMatch = path.match(
      /\/recette\/detail\/PRO\/(.+?)(?:\/v1\/recipes)?\/\d+$/,
    );
    if (!slugMatch) continue;
    const rawSlug = slugMatch[1];
    seen.add(url);
    const title = humanizeSlug(rawSlug);
    entries.push({
      url,
      title,
      slugWords: splitWords(normalize(title)),
    });
  }
  return entries;
}

async function fetchSitemap(): Promise<Entry[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(SITEMAP_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/xml,text/xml,*/*",
      },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseEntries(xml);
  } finally {
    clearTimeout(timeout);
  }
}

async function loadEntries(): Promise<Entry[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < TTL_MS) return cache.entries;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const entries = await fetchSitemap();
      cache = { entries, fetchedAt: Date.now() };
      return entries;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export async function searchMoulinexSitemap(
  query: string,
): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return [];
  let entries: Entry[];
  try {
    entries = await loadEntries();
  } catch (err) {
    console.warn("[moulinex-sitemap] fetch failed:", err);
    return [];
  }
  const scored = entries
    .map((entry) => {
      const matched = tokens.reduce(
        (n, tok) => n + (tokenMatchesSlug(tok, entry.slugWords) ? 1 : 0),
        0,
      );
      return { entry, matched };
    })
    .filter((s) => s.matched > 0);
  scored.sort((a, b) => b.matched - a.matched);
  return scored.slice(0, 6).map((s) => ({
    title: s.entry.title,
    url: s.entry.url,
    snippet: "",
    source: { host: "moulinex.fr", name: "Moulinex" },
  }));
}
