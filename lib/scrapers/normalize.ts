import * as cheerio from "cheerio";

export function parseIsoDurationMinutes(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(value.trim());
  if (!match) return undefined;
  const [, d, h, m] = match;
  const days = d ? parseInt(d, 10) : 0;
  const hours = h ? parseInt(h, 10) : 0;
  const minutes = m ? parseInt(m, 10) : 0;
  const total = days * 24 * 60 + hours * 60 + minutes;
  return total > 0 ? total : undefined;
}

export function pickImageUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const picked = pickImageUrl(item);
      if (picked) return picked;
    }
    return undefined;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
    if (Array.isArray(obj.url)) return pickImageUrl(obj.url);
    if (typeof obj["@id"] === "string") return obj["@id"] as string;
  }
  return undefined;
}

const ENTITY_PATTERN = /&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/;

function decodeEntitiesOnce(text: string): string {
  const $ = cheerio.load(`<div></div>`);
  $("div").html(text);
  return $("div").text();
}

function decodeHtml(text: string): string {
  let current = text;
  for (let i = 0; i < 3 && ENTITY_PATTERN.test(current); i++) {
    current = decodeEntitiesOnce(current);
  }
  return current;
}

function stripHtml(html: string): string {
  const hasTags = html.includes("<");
  let result = html;
  if (hasTags) {
    const $ = cheerio.load(`<div>${html}</div>`);
    result = $("div").text();
  }
  result = decodeHtml(result);
  return result.replace(/\s+/g, " ").trim();
}

function splitIntoSteps(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?])\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function normalizeInstructions(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") {
    const clean = stripHtml(value);
    return splitIntoSteps(clean);
  }
  if (Array.isArray(value)) {
    const out: string[] = [];
    for (const item of value) {
      if (!item) continue;
      if (typeof item === "string") {
        out.push(stripHtml(item));
        continue;
      }
      if (typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const type = obj["@type"];
        if (type === "HowToSection" && Array.isArray(obj.itemListElement)) {
          out.push(...normalizeInstructions(obj.itemListElement));
          continue;
        }
        if (typeof obj.text === "string") {
          out.push(stripHtml(obj.text));
          continue;
        }
        if (typeof obj.name === "string") {
          out.push(stripHtml(obj.name));
          continue;
        }
      }
    }
    return out.filter((s) => s.length > 0);
  }
  return [];
}

export function normalizeIngredients(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return [stripHtml(value)];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return stripHtml(item);
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          if (typeof obj.name === "string") return stripHtml(obj.name);
          if (typeof obj.text === "string") return stripHtml(obj.text);
        }
        return "";
      })
      .filter((s) => s.length > 0);
  }
  return [];
}

export function parseServings(value: unknown): number | undefined {
  if (typeof value === "number" && value > 0) return value;
  if (typeof value === "string") {
    const match = /\d+/.exec(value);
    if (match) {
      const n = parseInt(match[0], 10);
      if (n > 0) return n;
    }
  }
  if (Array.isArray(value) && value.length > 0) return parseServings(value[0]);
  return undefined;
}

export function parseAuthor(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value) && value.length > 0) return parseAuthor(value[0]);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name.trim() || undefined;
  }
  return undefined;
}

export function parseRating(
  value: unknown,
): { value: number; count: number } | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const raw = obj.ratingValue;
  const countRaw = obj.ratingCount ?? obj.reviewCount;
  const val = typeof raw === "string" ? parseFloat(raw) : (raw as number);
  const count = typeof countRaw === "string" ? parseInt(countRaw, 10) : (countRaw as number);
  if (typeof val !== "number" || Number.isNaN(val)) return undefined;
  return {
    value: val,
    count: typeof count === "number" && !Number.isNaN(count) ? count : 0,
  };
}

export function parseDescription(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = stripHtml(value);
  return clean.length > 0 ? clean : undefined;
}
