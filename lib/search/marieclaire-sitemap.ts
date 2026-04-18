import { SearchHit } from "@/lib/types";
import { normalize, tokenize } from "./relevance";

const SITEMAP_URL = "https://www.marieclaire.fr/sitemap-9-1.xml";
const TTL_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 4000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

type Entry = {
  url: string;
  title: string;
  normalized: string;
};

type Cache = {
  entries: Entry[];
  fetchedAt: number;
};

let cache: Cache | null = null;
let inflight: Promise<Entry[]> | null = null;

function humanizeSlug(rawSlug: string): string {
  const withoutId = rawSlug.replace(/,\d+$/, "");
  return withoutId
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseEntries(xml: string): Entry[] {
  const entries: Entry[] = [];
  const seen = new Set<string>();
  const regex =
    /<loc>\s*(https:\/\/www\.marieclaire\.fr\/cuisine\/[^<\s]+)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const url = match[1];
    if (seen.has(url)) continue;
    let path: string;
    try {
      path = new URL(url).pathname;
    } catch {
      continue;
    }
    const slugMatch = path.match(/\/cuisine\/([^/]+?)(?:\.asp)?$/);
    if (!slugMatch) continue;
    const rawSlug = slugMatch[1];
    if (!/,\d+$/.test(rawSlug)) continue;
    seen.add(url);
    const title = humanizeSlug(rawSlug);
    entries.push({
      url,
      title,
      normalized: normalize(title),
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

export async function searchMarieClaireSitemap(
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
    console.warn("[mc-sitemap] fetch failed:", err);
    return [];
  }
  const scored = entries
    .map((entry) => {
      let matched = 0;
      for (const tok of tokens) {
        if (entry.normalized.includes(tok)) matched += 1;
      }
      return { entry, matched };
    })
    .filter((s) => s.matched > 0);
  scored.sort((a, b) => b.matched - a.matched);
  return scored.slice(0, 6).map((s) => ({
    title: s.entry.title,
    url: s.entry.url,
    snippet: "",
    source: { host: "marieclaire.fr", name: "Marie Claire" },
  }));
}
