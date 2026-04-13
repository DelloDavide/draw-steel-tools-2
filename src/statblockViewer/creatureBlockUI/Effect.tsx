import parseNumber from "../../helpers/parseNumber";
import { cn } from "../../helpers/utils";
import type { DrawSteelEffect } from "../../types/DrawSteelZod";
import { PluginReadyGate } from "../../components/logic/PluginReadyGate";
import { formatRulesText } from "./insertTextStyling";
import { MaliceSpender } from "./MaliceSpender";

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
                className="grid h-[19px] min-w-9 place-items-center rounded-sm border text-xs font-semibold"
              >
                {(() => {
                  if (key === "tier1") return "<11";
                  if (key === "tier2") return "12-16";
                  if (key === "tier3") return "17+";
                })()}
              </span>
              <span>
                {formatRulesText((effect as { [k: string]: string })[key])}
              </span>
            </div>
          )}
        </div>
      );
    });

  return (
    <>
      <div>
        {effect.name && (
          <span className="font-semibold">{`${effect.name}`}</span>
        )}
        {effect.cost && (
          <PluginReadyGate
            alternate={
              <span className="font-semibold">{`${effect.cost}`}</span>
            }
          >
            <MaliceSpender
              align="start"
              alignOffset={-16}
              trigger={
                <button className="inline font-semibold hover:underline">{`${effect.cost}`}</button>
              }
              cost={parseNumber(effect.cost)}
            />
          </PluginReadyGate>
        )}
        {(effect.name || effect.cost) && (
          <span className="font-semibold">{": "}</span>
        )}
        {effect.effect && <span>{formatRulesText(effect.effect)}</span>}
      </div>
      {PowerRollEntries.length > 0 && (
        <div className="space-y-[1px]">{PowerRollEntries}</div>
      )}
    </>
  );
}
