import * as cheerio from "cheerio";
import { SUPPORTED_SITES, SearchHit, SupportedSite } from "@/lib/types";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const DDG_HTML_ENDPOINT = "https://html.duckduckgo.com/html/";

function decodeRedirect(rawHref: string): string | undefined {
  try {
    const url = rawHref.startsWith("//") ? `https:${rawHref}` : rawHref;
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("duckduckgo.com") && parsed.pathname === "/l/") {
      const target = parsed.searchParams.get("uddg");
      if (target) return decodeURIComponent(target);
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

async function searchOneSite(
  query: string,
  site: SupportedSite,
  count: number,
): Promise<SearchHit[]> {
  const body = new URLSearchParams({
    q: `${query} site:${site.host}`,
    kl: "fr-fr",
    b: "",
  });
  const res = await fetch(DDG_HTML_ENDPOINT, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://html.duckduckgo.com/",
    },
    body: body.toString(),
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`DDG responded ${res.status} for ${site.host}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  const hits: SearchHit[] = [];
  $(".result").each((_, el) => {
    if (hits.length >= count) return;
    const $el = $(el);
    const $a = $el.find("a.result__a").first();
    const href = $a.attr("href");
    const title = $a.text().trim();
    const snippet = $el.find(".result__snippet").text().trim();
    if (!href || !title) return;
    const resolved = decodeRedirect(href);
    if (!resolved) return;
    try {
      const parsed = new URL(resolved);
      const host = parsed.hostname.replace(/^www\./, "");
      if (host !== site.host && !host.endsWith(`.${site.host}`)) return;
      if (
        site.searchPath &&
        !parsed.pathname.startsWith(`/${site.searchPath}/`)
      ) {
        return;
      }
    } catch {
      return;
    }
    hits.push({
      title,
      url: resolved,
      snippet,
      source: { host: site.host, name: site.name },
    });
  });
  return hits;
}

export async function searchWithDuckDuckGo(
  query: string,
  opts: { perSite?: number } = {},
): Promise<SearchHit[]> {
  const basePerSite = opts.perSite ?? 3;
  const results: SearchHit[] = [];
  for (const site of SUPPORTED_SITES) {
    const perSite = site.searchPath ? basePerSite * 2 : basePerSite;
    try {
      const hits = await searchOneSite(query, site, perSite);
      results.push(...hits);
    } catch (err) {
      console.warn(`[ddg] ${site.host} failed:`, err);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return results;
}
