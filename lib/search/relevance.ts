import { SearchHit } from "@/lib/types";

const STOPWORDS = new Set([
  "de", "du", "des", "la", "le", "les", "un", "une",
  "au", "aux", "et", "ou", "en", "à", "a", "aux",
  "pour", "avec", "sans", "sur", "dans", "par",
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function tokenize(query: string): string[] {
  const normalized = normalize(query);
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const raw of normalized.split(/[^\p{L}\p{N}]+/u)) {
    if (raw.length < 3) continue;
    if (STOPWORDS.has(raw)) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);
    tokens.push(raw);
  }
  return tokens;
}

function hitPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

export function scoreHit(
  hit: SearchHit,
  tokens: string[],
): { matched: number; score: number } {
  if (tokens.length === 0) return { matched: 0, score: 0 };
  const title = normalize(hit.title);
  const snippet = normalize(hit.snippet);
  const path = normalize(hitPathname(hit.url));
  let matched = 0;
  let score = 0;
  for (const tok of tokens) {
    let hit = false;
    if (title.includes(tok)) {
      score += 3;
      hit = true;
    }
    if (snippet.includes(tok)) {
      score += 1;
      hit = true;
    }
    if (path.includes(tok)) {
      score += 1;
      hit = true;
    }
    if (hit) matched += 1;
  }
  return { matched, score };
}

export function rankAndFilter(
  hits: SearchHit[],
  query: string,
): SearchHit[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return hits;

  const scored = hits.map((hit, index) => ({
    hit,
    index,
    ...scoreHit(hit, tokens),
  }));

  const relevant = scored.filter((s) => s.matched > 0);
  if (relevant.length === 0) return hits;

  relevant.sort((a, b) => {
    if (b.matched !== a.matched) return b.matched - a.matched;
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  return relevant.map((s) => s.hit);
}
