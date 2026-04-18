import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Recipe } from "@/lib/types";
import { CookModeToggle } from "./CookModeToggle";
import { Fleuron } from "./Fleuron";
import { IngredientsColumn } from "./IngredientsColumn";
import { InstructionsColumn } from "./InstructionsColumn";
import { MetaStrip } from "./MetaStrip";
import { SourceBadge } from "./SourceBadge";

export function RecipeTemplate({ recipe }: { recipe: Recipe }) {
  const titleWords = recipe.title.split(" ");
  const head = titleWords.slice(0, -1).join(" ");
  const tail = titleWords.slice(-1)[0];
  const descriptionText = recipe.description
    ? recipe.description.length > 160
      ? `${recipe.description.slice(0, 160).trimEnd()}…`
      : recipe.description
    : "";

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SourceBadge host={recipe.source.host} variant="masthead" />
        <CookModeToggle />
      </div>

      {recipe.image ? (
        <figure className="card-soft relative mb-4 rounded-2xl border border-ink/10 bg-cream p-1">
          <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-ink/15 bg-cream-deep">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-ink/15" />
          </div>
          <figcaption className="smallcaps mt-1 flex items-center justify-between px-1 text-[9px] text-ink-mute">
            <span>Photo · {recipe.source.name}</span>
            <span aria-hidden>❦</span>
          </figcaption>
        </figure>
      ) : null}

      <div>
        <p className="smallcaps text-[10px] text-ink-mute">La recette</p>
        <h2 className="display mt-1 text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.1] text-ink-deep">
          {head && <>{head} </>}
          <span className="display-wonk wavy-underline text-brique">
            {tail}
          </span>
        </h2>
        {descriptionText && (
          <p className="mt-2 text-[13px] leading-[1.55] text-ink-soft">
            {descriptionText}
          </p>
        )}
        <a
          href={recipe.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="smallcaps mt-3 inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-[10px] text-ink transition-colors hover:border-brique hover:text-brique"
        >
          Voir l&apos;original sur {recipe.source.name}
          <ArrowUpRight size={12} strokeWidth={2} />
        </a>
      </div>

      <div className="mt-4">
        <MetaStrip recipe={recipe} />
      </div>

      <div className="my-5 flex items-center justify-center gap-2 text-gold">
        <span className="hand-rule h-px w-10" />
        <Fleuron variant="diamond" size={10} className="text-gold" />
        <span className="hand-rule h-px w-10" />
      </div>

      <section>
        <header className="mb-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="folio text-[10px] text-gold">A.</span>
              <h3 className="display-wonk text-lg text-ink-deep sm:text-xl">
                Ingrédients
              </h3>
            </div>
            <span className="smallcaps tnum text-[10px] text-ink-mute">
              {String(recipe.ingredients.length).padStart(2, "0")}
              {recipe.servings && ` · ${recipe.servings} pers.`}
            </span>
          </div>
          <div className="hand-rule-double mt-1.5" />
        </header>
        {recipe.ingredients.length > 0 ? (
          <IngredientsColumn items={recipe.ingredients} />
        ) : (
          <p className="text-sm italic text-ink-mute">
            Aucun ingrédient n&apos;a pu être extrait.
          </p>
        )}
      </section>

      <div className="my-5 flex items-center justify-center gap-2 text-saffron/60">
        <span className="hand-rule h-px w-10" />
        <Fleuron variant="diamond" size={9} className="text-saffron/70" />
        <span className="hand-rule h-px w-10" />
      </div>

      <section>
        <header className="mb-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="folio text-[10px] text-gold">B.</span>
              <h3 className="display-wonk text-lg text-ink-deep sm:text-xl">
                Préparation
              </h3>
            </div>
            <span className="smallcaps tnum text-[10px] text-ink-mute">
              {String(recipe.instructions.length).padStart(2, "0")} étapes
            </span>
          </div>
          <div className="hand-rule-double mt-1.5" />
        </header>
        {recipe.instructions.length > 0 ? (
          <InstructionsColumn items={recipe.instructions} />
        ) : (
          <p className="text-sm italic text-ink-mute">
            Aucune étape n&apos;a pu être extraite. Consultez l&apos;original.
          </p>
        )}
      </section>
    </div>
  );
}
