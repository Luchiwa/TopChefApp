// Chaque source porte une couleur de « brigade » (variables --color-<source>
// dans app/globals.css). Hôte inconnu : pastille grise.
const BRIGADES: Record<string, string> = {
  "marmiton.org": "var(--color-marmiton)",
  "750g.com": "var(--color-750g)",
  "cuisineactuelle.fr": "var(--color-cuisineactuelle)",
  "cuisineaz.com": "var(--color-cuisineaz)",
  "marieclaire.fr": "var(--color-marieclaire)",
  "moulinex.fr": "var(--color-moulinex)",
};

export function SourceBadge({ host, name }: { host: string; name: string }) {
  const color = BRIGADES[host.replace(/^www\./, "").toLowerCase()];
  return (
    <span
      className="tc-src"
      style={color ? ({ "--brigade": color } as React.CSSProperties) : undefined}
    >
      {name}
    </span>
  );
}
