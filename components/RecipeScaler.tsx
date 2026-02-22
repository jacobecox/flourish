"use client";

import { useState } from "react";
import { scaleIngredient } from "@/lib/utils";

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="Scaling info"
        className="w-4 h-4 rounded-full border border-muted text-muted text-[10px] font-bold leading-none flex items-center justify-center hover:border-foreground hover:text-foreground transition-colors"
      >
        i
      </button>
      {open && (
        <span className="absolute left-6 top-1/2 -translate-y-1/2 w-56 bg-card border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-muted shadow-lg z-10 pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

const SCALE_OPTIONS = [
  { label: "½×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "1½×", value: 1.5 },
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
];

type Props = {
  ingredients: string[];
};

export default function RecipeScaler({ ingredients }: Props) {
  const [scale, setScale] = useState(1);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-1.5">
          Ingredients
          {scale !== 1 && (
            <InfoTooltip text="Scaling adjusts the leading quantity in each ingredient. Ranges and parenthetical conversions remain as written." />
          )}
        </h2>
        <div className="flex gap-1">
          {SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setScale(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                scale === opt.value
                  ? "bg-primary text-white"
                  : "bg-secondary hover:bg-secondary-hover text-foreground border border-[var(--border)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {ingredients.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="text-accent font-bold mt-0.5">·</span>
            <span className="text-foreground">{scaleIngredient(item, scale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
