import { cn } from "../../helpers/utils";
import type { DrawSteelStatblock } from "../../types/DrawSteelZod";
import { Characteristics } from "./Characteristics";
import { Feature } from "./Feature";
import { useState } from "react";
import { MinusIcon, PencilIcon, PlusIcon, SaveIcon, XIcon } from "lucide-react";
import Button from "../../components/ui/Button";

type ProgressionStats = {
  victories: number;
  experience_points: number;
};

export function StatBlock({
  statblock,
  onSaveProgression,
}: {
  readonly statblock: DrawSteelStatblock;
  readonly onSaveProgression?: (stats: ProgressionStats) => Promise<void>;
}) {
  const roleTags = statblock.roles.join(" ");
  const isHero = roleTags.includes("Hero");
  const [editingProgression, setEditingProgression] = useState(false);
  const [savingProgression, setSavingProgression] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [progressionDraft, setProgressionDraft] = useState<ProgressionStats>({
    victories: statblock.victories ?? 0,
    experience_points: statblock.experience_points ?? 0,
  });

  function startEditingProgression() {
    setProgressionDraft({
      victories: statblock.victories ?? 0,
      experience_points: statblock.experience_points ?? 0,
    });
    setSaveError(undefined);
    setEditingProgression(true);
  }

  async function saveProgression() {
    if (!onSaveProgression) return;
    setSavingProgression(true);
    setSaveError(undefined);
    try {
      await onSaveProgression(progressionDraft);
      setEditingProgression(false);
    } catch (error) {
      console.error("Could not save hero progression stats", error);
      setSaveError("Could not save changes. Please try again.");
    } finally {
      setSavingProgression(false);
    }
  }

  function updateProgression(
    key: keyof ProgressionStats,
    amount: number,
  ) {
    setProgressionDraft((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + amount),
    }));
  }

  return (
    <div className="w-full max-w-lg space-y-2">
      <div
        className={cn(
          "rounded-md border-zinc-950 bg-linear-to-b from-neutral-400/60 to-neutral-300/50 p-2",
          {
            "from-[#e9db7d] to-[#e9db7d]/50": roleTags.includes("Ambusher"),
            "from-[#ccc3d0] to-[#ccc3d0]/50": roleTags.includes("Artillery"),
            "from-[#96b2df] to-[#96b2df]/50": roleTags.includes("Brute"),
            "from-[#f49392] to-[#f49392]/50": roleTags.includes("Controller"),
            "from-[#cac0a3] to-[#cac0a3]/50": roleTags.includes("Defender"),
            "from-[#eac1c0] to-[#eac1c0]/50": roleTags.includes("Harrier"),
            "from-[#d8e0c2] to-[#d8e0c2]/50": roleTags.includes("Hexer"),
            "from-[#b5dae3] to-[#b5dae3]/50": roleTags.includes("Mount"),
            "from-[#f0dacc] to-[#f0dacc]/50": roleTags.includes("Support"),
            "from-[#c95cff] to-[#c95cff]/50": roleTags.includes("Hero"),
            "from-[#3aa76d] to-[#3aa76d]/50": roleTags.includes("Retainer"),
          },
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between text-nowrap">
          <div className="text-base font-black">{statblock.name}</div>
          <div className="text-right font-black">{`Level ${statblock.level} ${statblock.roles}`}</div>
        </div>
        <div className="flex flex-wrap justify-between text-nowrap">
          <div>{statblock.ancestry.join(", ")}</div>
          <div className="text-right">{`EV ${statblock.ev}`}</div>
        </div>
      </div>

      <div className="space-y-2 px-2">
        <div className="space-y-2 px-2">
          <div className="flex flex-wrap justify-between gap-1.5">
            {[
              { label: "Size", value: statblock.size },
              { label: "Speed", value: statblock.speed },
              { label: "Stamina", value: statblock.stamina },
              { label: "Stability", value: statblock.stability },
              { label: "Free Strike", value: statblock.free_strike },
            ].map((item) => (
              <div className="min-w-16 flex-1 text-center" key={item.label}>
                <div className="text-lg">{item.value}</div>
                <div className="-mt-1 font-bold text-nowrap">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {[
              { label: "Wealth", value: statblock.wealth ?? "—" },
              { label: "Renown", value: statblock.renown ?? "—" },
              ...(isHero
                ? [
                    {
                      label: "XP",
                      value: statblock.experience_points ?? "—",
                    },
                    { label: "Victories", value: statblock.victories ?? "—" },
                  ]
                : []),
            ].map((item) => (
              <div className="min-w-16 text-center" key={item.label}>
                <div className="text-lg">{item.value}</div>
                <div className="-mt-1 font-bold text-nowrap">{item.label}</div>
              </div>
            ))}
          </div>
          {isHero && onSaveProgression && (
            <div className="flex flex-col items-center gap-2">
              {editingProgression ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(
                    [
                      ["experience_points", "XP"],
                      ["victories", "Victories"],
                    ] as const
                  ).map(([key, label]) => (
                    <div className="flex items-center gap-1" key={key}>
                      <span className="text-sm font-bold">{label}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-7"
                        aria-label={`Decrease ${label}`}
                        disabled={progressionDraft[key] <= 0 || savingProgression}
                        onClick={() => updateProgression(key, -1)}
                      >
                        <MinusIcon className="size-3" />
                      </Button>
                      <span className="min-w-6 text-center font-semibold">
                        {progressionDraft[key]}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-7"
                        aria-label={`Increase ${label}`}
                        disabled={savingProgression}
                        onClick={() => updateProgression(key, 1)}
                      >
                        <PlusIcon className="size-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    disabled={savingProgression}
                    onClick={() => void saveProgression()}
                  >
                    <SaveIcon className="mr-1 size-4" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Cancel changes"
                    disabled={savingProgression}
                    onClick={() => setEditingProgression(false)}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={startEditingProgression}
                >
                  <PencilIcon className="mr-1 size-4" />
                  Edit XP and Victories
                </Button>
              )}
              {saveError && (
                <div className="text-sm text-red-700" role="alert">
                  {saveError}
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap justify-between">
            <div>
              <span className="font-bold">{"Immunity: "}</span>
              {statblock.immunities ? statblock.immunities.join(", ") : "—"}
            </div>
            <div>
              <span className="font-bold">{"Weakness: "}</span>
              {statblock.weaknesses ? statblock.weaknesses.join(", ") : "—"}
            </div>
          </div>
          <div className="flex flex-wrap justify-between">
            <div>
              <span className="font-bold">{"Movement: "}</span>
              <span>{statblock.movement ? statblock.movement : "—"}</span>
            </div>
            {statblock?.with_captain && (
              <div>
                <span className="font-bold">{"With Captain: "}</span>
                <span>
                  {statblock.with_captain ? statblock.with_captain : "—"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-0.5 w-full border-b border-zinc-950" />

      <Characteristics statblock={statblock} />

      <div className="mb-0 w-full border-b border-zinc-950" />

      <div className="mb-0">
        {statblock.features?.map((feature) => (
          <div key={feature.name} className="border-b border-zinc-950 p-2 pl-0">
            <Feature blockName={statblock.name} feature={feature} />
          </div>
        ))}
      </div>
    </div>
  );
}
