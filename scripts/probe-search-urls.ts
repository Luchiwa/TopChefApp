const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const candidates: Array<{ label: string; url: string }> = [
  { label: "750g q param", url: "https://www.750g.com/recettes/recherche.htm?q=frites+air+fryer" },
  { label: "750g recherche", url: "https://www.750g.com/recherche?q=frites+air+fryer" },
  { label: "750g s param", url: "https://www.750g.com/recettes/recherche?s=frites+air+fryer" },
  { label: "CuisineActuelle q param", url: "https://www.cuisineactuelle.fr/search?q=frites+air+fryer" },
  { label: "CuisineActuelle recherche", url: "https://www.cuisineactuelle.fr/recherche?q=frites+air+fryer" },
  { label: "CuisineActuelle /recherche/", url: "https://www.cuisineactuelle.fr/recherche/frites-air-fryer" },
  { label: "CuisineAZ recherche", url: "https://www.cuisineaz.com/recettes/recherche_terme.aspx?recherche=frites+air+fryer" },
  { label: "CuisineAZ q param", url: "https://www.cuisineaz.com/recherche?q=frites+air+fryer" },
  { label: "CuisineAZ /recherche/", url: "https://www.cuisineaz.com/recherche/frites+air+fryer" },
];

(async () => {
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "fr-FR",
          Accept: "text/html",
        },
        redirect: "follow",
      });
      const body = await res.text();
      const hasRecipeLinks =
        /-r\d+\.htm/.test(body) ||
        /recette[_-][^\s"]+\d+\.aspx/i.test(body) ||
        /\/recettes?\/[^/?#"]+-\d+/.test(body);
      console.log(`[${res.status}] ${c.label}`);
      console.log(`  → ${res.url}`);
      console.log(`  bytes: ${body.length}, hasRecipeLinks: ${hasRecipeLinks}`);
    } catch (err) {
      console.log(`[ERR] ${c.label}: ${err}`);
    }
  }
})();
