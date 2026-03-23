import { cn } from "../../helpers/utils";
import type { DrawSteelEffect } from "../../types/DrawSteelZod";

export function Effect({
  effect,
  highlightTier,
}: {
  effect: DrawSteelEffect;
  highlightTier?: number;
}) {
  const PowerRollEntries = Object.keys(effect)
    .filter((key) => ["tier1", "tier2", "tier3"].includes(key))
    .map((key) => {
      const tier = parseFloat(key.replace("tier", ""));
      const highlight = tier === highlightTier;

      return (
        <div key={key}>
          {key in effect && (effect as { [k: string]: string })[key] && (
            <div
              className={cn("flex gap-1", {
                "bg-accent/15 rounded-sm": highlight,
              })}
            >
              <span
                data-highlight={highlight}
                className="bg-mirage-200 grid h-[19px] min-w-9 place-items-center rounded-sm text-xs font-semibold"
              >
                {(() => {
                  if (key === "tier1") return "<11";
                  if (key === "tier2") return "12-16";
                  if (key === "tier3") return "17+";
                })()}
              </span>
              <textarea
                className="block w-full rounded-md border border-black/30 px-2 py-1 shadow-xs"
                value={(effect as { [k: string]: string })[key]}
              />
            </div>
          )}
        </div>
      );
    });

  return (
    <div>
      {(effect.name || effect.cost || effect.effect) && (
        <textarea
          className="block w-full rounded-md border border-black/30 px-2 py-1 shadow-xs"
          value={
            (effect.name ? effect.name : "") +
            (effect.cost ? effect.cost : "") +
            (effect.name || effect.cost ? ": " : "") +
            effect.effect
          }
        />
      )}
      {PowerRollEntries.length > 0 && (
        <div className="space-y-1">{PowerRollEntries}</div>
      )}
    </div>
  );
}
