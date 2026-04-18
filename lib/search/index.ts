import { SearchHit } from "@/lib/types";
import { searchWithBrave } from "./brave";
import { rankAndFilter } from "./relevance";
import { searchAcrossSites } from "./sites";

export type SearchBackend = "brave" | "site-search";

export type SearchResult = {
  hits: SearchHit[];
  backend: SearchBackend;
};

export async function runSearch(query: string): Promise<SearchResult> {
  const apiKey = process.env.BRAVE_API_KEY;
  if (apiKey) {
    try {
      const raw = await searchWithBrave(query, apiKey);
      if (raw.length > 0) {
        return { hits: rankAndFilter(raw, query), backend: "brave" };
      }
    } catch (err) {
      console.warn("[search] Brave failed:", err);
    }
  }
  const raw = await searchAcrossSites(query);
  return { hits: rankAndFilter(raw, query), backend: "site-search" };
}
