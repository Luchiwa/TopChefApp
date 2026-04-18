import { Fleuron } from "./Fleuron";

const ISSUE_NUMBER = "N°001";

const formatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatIssueDate() {
  return formatter.format(new Date()).toUpperCase();
}

export function Masthead() {
  return (
    <header className="relative z-10">
      <div className="bg-ink-deep text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3 sm:px-10">
          <div className="smallcaps flex items-center gap-3 text-cream/75">
            <span className="cooking-dot" aria-hidden />
            <span>{ISSUE_NUMBER} · {formatIssueDate()}</span>
          </div>
          <span className="smallcaps hidden text-saffron sm:inline">
            La gazette culinaire, version tirage unique
          </span>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-10 sm:px-10 sm:pt-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <h1
              className="display letterpress flex items-baseline gap-[0.04em] leading-none text-ink-deep"
              style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
            >
              <span style={{ letterSpacing: "-0.04em" }}>Top</span>
              <span
                className="display-wonk text-brique"
                style={{ letterSpacing: "-0.02em" }}
              >
                Chef
              </span>
              <span
                aria-hidden
                className="ml-1 inline-block h-3 w-3 rounded-full bg-saffron sm:h-4 sm:w-4"
                style={{ boxShadow: "0 0 24px rgba(232, 169, 60, 0.55)" }}
              />
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
              Une recherche, cinq cuisines françaises, une seule table de
              travail. <span className="display-italic text-brique">Chaleureusement</span>{" "}
              composée.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <span
              aria-hidden
              className="postmark hidden sm:inline-flex"
            >
              <span className="flex flex-col items-center leading-tight">
                <span>Ed. MMXXVI</span>
                <span className="mt-[2px] text-[0.55rem] opacity-70">
                  Paris · N°001
                </span>
              </span>
            </span>
            <div className="hidden items-center gap-3 md:flex">
              <Fleuron variant="heart" size={18} className="text-saffron" />
              <div className="smallcaps text-ink-mute">
                <div>Marmiton · 750g · Marie Claire</div>
                <div className="mt-0.5">Cuisine Actuelle · Cuisine AZ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
