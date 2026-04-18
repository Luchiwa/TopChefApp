const url = process.argv[2];
if (!url) {
  console.error("Usage: tsx scripts/inspect-html.ts <url>");
  process.exit(1);
}

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

(async () => {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  console.log("status:", res.status);
  console.log("final url:", res.url);
  const html = await res.text();
  console.log("length:", html.length);
  const scripts = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi) ?? [];
  console.log("ld+json scripts:", scripts.length);
  for (let i = 0; i < scripts.length; i++) {
    console.log(`--- script #${i} ---`);
    console.log(scripts[i].slice(0, 600));
  }
  if (scripts.length === 0) {
    console.log("--- first 2000 chars of html ---");
    console.log(html.slice(0, 2000));
  }
})();
