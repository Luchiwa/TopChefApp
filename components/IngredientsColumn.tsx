"use client";

import { useState } from "react";

export function IngredientsColumn({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const total = items.length;
  const done = checked.size;

  return (
    <div>
      <ul className="space-y-1">
        {items.map((item, i) => {
          const isChecked = checked.has(i);
          return (
            <li key={`${i}-${item}`}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isChecked}
                className="group flex w-full items-start gap-2.5 text-left"
              >
                <span
                  className={[
                    "relative mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center border-[1.5px] transition-all",
                    isChecked
                      ? "border-brique text-brique"
                      : "border-ink/40 text-transparent group-hover:border-brique",
                  ].join(" ")}
                  aria-hidden
                >
                  <span className="display-italic text-sm leading-none">
                    ×
                  </span>
                </span>
                <span
                  className={[
                    "cook-mode-text text-[13px] leading-snug transition-all sm:text-sm",
                    isChecked
                      ? "text-ink-mute/70 line-through decoration-brique decoration-[1.5px] decoration-double"
                      : "text-ink",
                  ].join(" ")}
                >
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {total > 0 && (
        <p className="smallcaps tnum mt-3 text-[10px] text-ink-mute">
          {String(done).padStart(2, "0")} sur {String(total).padStart(2, "0")}{" "}
          {done > 1 ? "prêts" : "prêt"}
        </p>
      )}
    </div>
  );
}
