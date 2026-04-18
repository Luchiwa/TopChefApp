import { searchAcrossSites } from "../lib/search/sites";

const query = process.argv.slice(2).join(" ") || "frites au air fryer";

(async () => {
  console.log(`Searching: "${query}"\n`);
  const hits = await searchAcrossSites(query);
  for (const hit of hits) {
    console.log(`[${hit.source.name}] ${hit.title}`);
    console.log(`  ${hit.url}`);
    console.log();
  }
  console.log(`Total: ${hits.length} hits`);
})();
