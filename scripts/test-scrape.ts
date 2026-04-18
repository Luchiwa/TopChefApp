import { scrapeRecipe, ScrapeError } from "../lib/scrapers";

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error("Usage: tsx scripts/test-scrape.ts <url> [<url>...]");
  process.exit(1);
}

(async () => {
  for (const url of urls) {
    console.log("\n===", url, "===");
    try {
      const recipe = await scrapeRecipe(url);
      console.log(JSON.stringify(recipe, null, 2));
    } catch (err) {
      if (err instanceof ScrapeError) {
        console.error(`[${err.code}] ${err.message}`);
      } else {
        console.error(err);
      }
    }
  }
})();
