const site = process.argv[2] ?? "cuisineactuelle.fr";
const query = process.argv.slice(3).join(" ") || "frites";
const method = (process.env.METHOD ?? "POST").toUpperCase();

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

(async () => {
  const params = new URLSearchParams({
    q: `${query} site:${site}`,
    kl: "fr-fr",
    b: "",
  });
  let res: Response;
  if (method === "POST") {
    res = await fetch("https://html.duckduckgo.com/html/", {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "fr-FR",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "https://html.duckduckgo.com/",
      },
      body: params.toString(),
    });
  } else {
    const url = `https://html.duckduckgo.com/html/?${params}`;
    res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "fr-FR" },
    });
  }
  console.log("method:", method);
  console.log("status:", res.status);
  const html = await res.text();
  console.log("length:", html.length);
  const resultCount = (html.match(/class="result__a"/g) ?? []).length;
  console.log("result__a count:", resultCount);
  const anomalyDetected = html.includes("anomaly");
  console.log("contains 'anomaly':", anomalyDetected);
  if (resultCount === 0) {
    console.log("--- first 1500 chars ---");
    console.log(html.slice(0, 1500));
  }
})();
