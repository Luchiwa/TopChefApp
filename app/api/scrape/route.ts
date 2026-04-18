import { NextRequest, NextResponse } from "next/server";
import { ScrapeError, scrapeRecipe } from "@/lib/scrapers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")?.trim() ?? "";
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  try {
    const recipe = await scrapeRecipe(url);
    return NextResponse.json({ recipe });
  } catch (err) {
    if (err instanceof ScrapeError) {
      const status =
        err.code === "invalid_url" || err.code === "unsupported_site"
          ? 400
          : err.code === "no_recipe_found"
            ? 404
            : 502;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    console.error("[api/scrape]", err);
    return NextResponse.json(
      { error: "Erreur inattendue lors du scraping." },
      { status: 500 },
    );
  }
}
