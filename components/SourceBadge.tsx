import { SUPPORTED_SITES } from "@/lib/types";

type Variant = "pill" | "tag" | "masthead" | "folio";

const STYLES: Record<
  string,
  { bg: string; fg: string; tint: string; dot: string; border: string }
> = {
  "marmiton.org": {
    bg: "bg-[color:var(--color-marmiton)]",
    fg: "text-[color:var(--color-marmiton-tint)]",
    tint: "bg-[color:var(--color-marmiton-tint)] text-[color:var(--color-marmiton)]",
    dot: "bg-[color:var(--color-marmiton)]",
    border: "border-[color:var(--color-marmiton)]",
  },
  "750g.com": {
    bg: "bg-[color:var(--color-750g)]",
    fg: "text-[color:var(--color-750g-tint)]",
    tint: "bg-[color:var(--color-750g-tint)] text-[color:var(--color-750g)]",
    dot: "bg-[color:var(--color-750g)]",
    border: "border-[color:var(--color-750g)]",
  },
  "cuisineactuelle.fr": {
    bg: "bg-[color:var(--color-cuisineactuelle)]",
    fg: "text-[color:var(--color-cuisineactuelle-tint)]",
    tint: "bg-[color:var(--color-cuisineactuelle-tint)] text-[color:var(--color-cuisineactuelle)]",
    dot: "bg-[color:var(--color-cuisineactuelle)]",
    border: "border-[color:var(--color-cuisineactuelle)]",
  },
  "cuisineaz.com": {
    bg: "bg-[color:var(--color-cuisineaz)]",
    fg: "text-[color:var(--color-cuisineaz-tint)]",
    tint: "bg-[color:var(--color-cuisineaz-tint)] text-[color:var(--color-cuisineaz)]",
    dot: "bg-[color:var(--color-cuisineaz)]",
    border: "border-[color:var(--color-cuisineaz)]",
  },
  "marieclaire.fr": {
    bg: "bg-[color:var(--color-marieclaire)]",
    fg: "text-[color:var(--color-marieclaire-tint)]",
    tint: "bg-[color:var(--color-marieclaire-tint)] text-[color:var(--color-marieclaire)]",
    dot: "bg-[color:var(--color-marieclaire)]",
    border: "border-[color:var(--color-marieclaire)]",
  },
  "moulinex.fr": {
    bg: "bg-[color:var(--color-moulinex)]",
    fg: "text-[color:var(--color-moulinex-tint)]",
    tint: "bg-[color:var(--color-moulinex-tint)] text-[color:var(--color-moulinex)]",
    dot: "bg-[color:var(--color-moulinex)]",
    border: "border-[color:var(--color-moulinex)]",
  },
};

const INITIALS: Record<string, string> = {
  "marmiton.org": "M",
  "750g.com": "VII",
  "cuisineactuelle.fr": "C·A",
  "cuisineaz.com": "A·Z",
  "marieclaire.fr": "M·C",
  "moulinex.fr": "Mx",
};

function normalize(host: string) {
  const entry = SUPPORTED_SITES.find((s) => s.host === host);
  return entry ?? { host, name: host };
}

export function SourceBadge({
  host,
  variant = "tag",
  className = "",
}: {
  host: string;
  variant?: Variant;
  className?: string;
}) {
  const site = normalize(host);
  const style = STYLES[site.host] ?? {
    bg: "bg-ink",
    fg: "text-cream",
    tint: "bg-ink text-cream",
    dot: "bg-ink",
    border: "border-ink",
  };
  const initial = INITIALS[site.host] ?? site.name.charAt(0);

  if (variant === "pill") {
    return (
      <span
        className={`smallcaps inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${style.bg} ${style.fg} ${className}`}
      >
        <span className="h-1 w-1 rounded-full bg-current opacity-80" />
        {site.name}
      </span>
    );
  }

  if (variant === "masthead") {
    return (
      <span
        className={`smallcaps inline-flex items-center gap-2 rounded-full border ${style.border} ${style.tint} px-3 py-1 ${className}`}
      >
        <span
          aria-hidden
          className={`display-italic tnum flex h-5 min-w-[1.25rem] items-center justify-center border-r ${style.border} pr-1.5 pl-0.5 text-[11px] leading-none`}
        >
          {initial}
        </span>
        <span>{site.name}</span>
      </span>
    );
  }

  if (variant === "folio") {
    return (
      <span
        className={`smallcaps inline-flex items-center gap-2 text-gold ${className}`}
      >
        <span
          aria-hidden
          className={`inline-block h-[6px] w-[6px] rounded-full ${style.dot}`}
        />
        <span>{site.name}</span>
      </span>
    );
  }

  return (
    <span
      className={`smallcaps inline-flex items-center gap-1.5 rounded-full ${style.tint} px-2.5 py-1 ${className}`}
    >
      <span
        aria-hidden
        className={`inline-block h-[5px] w-[5px] rounded-full ${style.dot}`}
      />
      <span>{site.name}</span>
    </span>
  );
}
