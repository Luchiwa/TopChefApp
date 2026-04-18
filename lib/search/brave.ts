import { SearchHit, SUPPORTED_SITES, SupportedSite } from "@/lib/types";

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

type BraveResult = {
  title: string;
  url: string;
  description?: string;
};

type BraveResponse = {
  web?: { results?: BraveResult[] };
};

function matchesSearchPath(rawUrl: string, searchPath: string): boolean {
  try {
    const { pathname } = new URL(rawUrl);
    return pathname.startsWith(`/${searchPath}/`);
  } catch {
    return false;
  }
}

async function searchOneSite(
  query: string,
  site: SupportedSite,
  apiKey: string,
  count: number,
): Promise<SearchHit[]> {
  const params = new URLSearchParams({
    q: `${query} site:${site.host}`,
    count: String(count),
    country: "fr",
    search_lang: "fr",
    safesearch: "moderate",
  });
  const res = await fetch(`${BRAVE_ENDPOINT}?${params}`, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });
  if (!res.ok) {
    throw new Error(`Brave HTTP ${res.status}`);
  }
  const data = (await res.json()) as BraveResponse;
  const results = data.web?.results ?? [];
  const filtered = site.searchPath
    ? results.filter((r) => matchesSearchPath(r.url, site.searchPath!))
    : results;
  return filtered.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.description ?? "",
    source: { host: site.host, name: site.name },
  }));
}

export async function searchWithBrave(
  query: string,
  apiKey: string,
): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const results = await Promise.all(
    SUPPORTED_SITES.map((s) => {
      const count = s.searchPath ? 6 : 3;
      return searchOneSite(trimmed, s, apiKey, count).catch((err) => {
        console.warn(`[brave] ${s.host} failed:`, err);
        return [] as SearchHit[];
      });
    }),
  );
  return results.flat();
}
