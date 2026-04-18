import * as cheerio from "cheerio";
import type { Cheerio } from "cheerio";
import type { AnyNode } from "domhandler";

function normalizeText(text: string): string {
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function stripLeadingNumber(text: string): string {
  return text.replace(/^\s*\d+\s*[.)]\s*/, "").trim();
}

function extractIngredients($: cheerio.CheerioAPI, $section: Cheerio<AnyNode>): string[] {
  const out: string[] = [];

  const push = (raw: string) => {
    const text = normalizeText(raw);
    if (text.length > 0) out.push(text);
  };

  const walkList = ($list: Cheerio<AnyNode>) => {
    $list.children("li").each((_, li) => {
      push($(li).text());
    });
  };

  $section.children().each((_, el) => {
    const $el = $(el);
    if ($el.is("h2, h3, .Article-recipeTitle")) return;
    if ($el.is("ul")) {
      walkList($el);
      return;
    }
    if ($el.is("div.ingredient-set")) {
      const $subtitle = $el.children("strong").first();
      const subtitle = normalizeText($subtitle.text()).replace(/:$/, "").trim();
      if (subtitle.length > 0) out.push(`— ${subtitle}`);
      $el.find("ul").each((__, ul) => walkList($(ul)));
      return;
    }
    $el.find("ul").each((__, ul) => walkList($(ul)));
  });

  return out;
}

function extractInstructions($: cheerio.CheerioAPI, $section: Cheerio<AnyNode>): string[] {
  const out: string[] = [];

  const push = (raw: string) => {
    const text = stripLeadingNumber(normalizeText(raw));
    if (text.length > 0) out.push(text);
  };

  $section.children().each((_, el) => {
    const $el = $(el);
    if ($el.is("h2, h3, .Article-recipeTitle")) return;

    if ($el.is("ol, ul")) {
      $el.children("li").each((__, li) => push($(li).text()));
      return;
    }

    if ($el.is("p")) {
      const fullText = normalizeText($el.text());
      if (fullText.length === 0) return;

      const $strong = $el.children("strong");
      const strongText = normalizeText($strong.text());
      if (
        strongText.length > 0 &&
        strongText.length >= fullText.length - 2 &&
        fullText.length < 80
      ) {
        return;
      }

      const html = $el.html() ?? "";
      const chunks = html
        .split(/<br\s*\/?>\s*<br\s*\/?>/i)
        .map((chunk) => {
          const inner = cheerio.load(`<div>${chunk}</div>`);
          return normalizeText(inner("div").text());
        })
        .filter((s) => s.length > 0);

      if (chunks.length === 0) {
        push(fullText);
      } else {
        for (const chunk of chunks) push(chunk);
      }
    }
  });

  return out;
}

export function extractMarieClaireRecipe(html: string): {
  ingredients: string[];
  instructions: string[];
} {
  const $ = cheerio.load(html);
  let ingredients: string[] = [];
  let instructions: string[] = [];

  $(".Article-recipeText").each((_, section) => {
    const $section = $(section);
    const title = normalizeText(
      $section.find(".Article-recipeTitle").first().text(),
    ).toLowerCase();

    if (ingredients.length === 0 && title.includes("ingrédient")) {
      ingredients = extractIngredients($, $section);
      return;
    }
    if (instructions.length === 0 && title.includes("préparation")) {
      instructions = extractInstructions($, $section);
    }
  });

  return { ingredients, instructions };
}
