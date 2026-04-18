import { Fleuron } from "./Fleuron";

const SUMMARY = [
  {
    folio: "I",
    name: "Marmiton",
    note: "Le classique populaire",
    accent: "var(--color-marmiton)",
  },
  {
    folio: "II",
    name: "750g",
    note: "Pratique et illustré",
    accent: "var(--color-750g)",
  },
  {
    folio: "III",
    name: "Cuisine Actuelle",
    note: "Le goût du jour",
    accent: "var(--color-cuisineactuelle)",
  },
  {
    folio: "IV",
    name: "Cuisine AZ",
    note: "De A à Z, sans détour",
    accent: "var(--color-cuisineaz)",
  },
  {
    folio: "V",
    name: "Marie Claire",
    note: "Élégance à table",
    accent: "var(--color-marieclaire)",
  },
];

const SUGGESTIONS = [
  { label: "Risotto aux champignons", tag: "30 min · réconfortant" },
  { label: "Tarte tatin", tag: "Dimanche · classique" },
  { label: "Pad thaï maison", tag: "Wok · rapide" },
  { label: "Velouté de potimarron", tag: "Automne · velouté" },
];

export function EmptyHero() {
  return (
    <section className="relative mt-14 pb-24">
      <div className="grid gap-14 md:grid-cols-[1.3fr_1fr] md:gap-16">
        <article className="relative">
          <div className="mb-5 flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-[1.5px] w-10 bg-brique"
            />
            <p className="smallcaps text-brique">Invitation · Avril 2026</p>
          </div>

          <h2 className="display text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.05] text-ink-deep">
            Tapez un plat,{" "}
            <span className="display-wonk text-brique">cinq cuisines</span>{" "}
            vous répondent.
          </h2>

          <p className="drop-cap mt-8 max-w-xl text-lg leading-[1.8] text-ink-soft">
            Risotto, tarte tatin, frites au air fryer — un mot suffit. TopChef
            interroge simultanément Marmiton, 750g, Cuisine Actuelle, Cuisine
            AZ et Marie Claire, puis recompose chaque recette dans un gabarit
            unique : ingrédients à gauche, étapes à droite, et l&apos;original
            à un clic. Plus besoin de jongler entre quinze onglets.
          </p>

          <div className="mt-10 border-l-[3px] border-brique bg-honey/30 px-6 py-5">
            <p className="smallcaps mb-2 text-saffron-deep">
              Suggestions de la saison
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {SUGGESTIONS.map((s) => (
                <li
                  key={s.label}
                  className="display-italic text-lg text-ink-deep"
                >
                  {s.label}
                  <span className="smallcaps ml-2 text-ink-mute">
                    {s.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex items-center gap-3 text-ink-mute">
            <Fleuron variant="heart" size={14} className="text-brique" />
            <span className="smallcaps">Bonne dégustation</span>
          </div>
        </article>

        <aside className="relative self-start">
          <div className="card-soft rounded-3xl border border-ink/10 bg-cream p-7">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="display-italic text-2xl text-ink-deep">
                Au sommaire
              </p>
              <span className="smallcaps text-ink-mute">
                {SUMMARY.length} cuisines
              </span>
            </div>

            <div className="hand-rule-double mb-5" />

            <ol className="space-y-5">
              {SUMMARY.map((entry) => (
                <li
                  key={entry.name}
                  className="group flex items-center gap-4 text-ink-soft"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs"
                    style={{
                      background: `color-mix(in srgb, ${entry.accent} 12%, var(--color-cream))`,
                      color: entry.accent,
                      border: `1px solid color-mix(in srgb, ${entry.accent} 30%, transparent)`,
                    }}
                  >
                    <span className="display-italic leading-none">
                      {entry.folio}
                    </span>
                  </span>
                  <span className="display text-lg text-ink-deep">
                    {entry.name}
                  </span>
                  <span
                    aria-hidden
                    className="mx-1 flex-1 border-b border-dotted border-ink-mute/40"
                  />
                  <span className="smallcaps text-[0.68rem] text-ink-mute">
                    {entry.note}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7 rounded-xl bg-honey/40 px-4 py-3">
              <p className="text-sm italic leading-relaxed text-ink-soft">
                <span className="display-wonk text-brique">❦</span> Composé pour
                Luc · Encre paprika sur papier brioche · Tirage unique.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
