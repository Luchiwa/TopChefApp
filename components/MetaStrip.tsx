import { Recipe } from "@/lib/types";

type Item = { label: string; value: string };

function formatMinutes(minutes?: number) {
  if (!minutes) return undefined;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

export function MetaStrip({ recipe }: { recipe: Recipe }) {
  const items: Item[] = [];

  const total = formatMinutes(recipe.totalTimeMinutes);
  const prep = formatMinutes(recipe.prepTimeMinutes);
  const cook = formatMinutes(recipe.cookTimeMinutes);

  if (total) items.push({ label: "Temps total", value: total });
  if (prep && !total) items.push({ label: "Préparation", value: prep });
  if (cook && !total) items.push({ label: "Cuisson", value: cook });
  if (recipe.servings)
    items.push({ label: "Portions", value: `${recipe.servings}` });
  if (recipe.rating)
    items.push({
      label: `Note · ${recipe.rating.count} avis`,
      value: `${recipe.rating.value.toFixed(1)}/5`,
    });
  if (recipe.author) items.push({ label: "Par", value: recipe.author });

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-ink/25 py-3">
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <div className="smallcaps text-[9px] text-gold">{label}</div>
          <div className="display-wonk tnum mt-0.5 truncate text-base text-ink-deep">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
