"use client";

import { useState } from "react";

export function InstructionsColumn({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <ol className="space-y-2">
      {items.map((step, i) => {
        const isDone = done.has(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isDone}
              className={[
                "group relative block w-full rounded-r-xl border-l-[3px] bg-cream-deep/30 py-2.5 pl-4 pr-3 text-left transition-all",
                isDone
                  ? "border-brique/40 bg-ink/[0.04] opacity-65"
                  : "border-brique hover:border-l-[4px] hover:bg-cream-deep/60 hover:pl-[15px]",
              ].join(" ")}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className={[
                    "display-wonk tnum shrink-0 text-lg leading-none sm:text-xl",
                    isDone
                      ? "text-ink-mute line-through decoration-brique decoration-[1.5px] decoration-double"
                      : "text-brique",
                  ].join(" ")}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className={[
                    "cook-mode-text flex-1 text-[13px] leading-[1.5] sm:text-sm",
                    isDone ? "text-ink-mute" : "text-ink",
                  ].join(" ")}
                >
                  {step}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
