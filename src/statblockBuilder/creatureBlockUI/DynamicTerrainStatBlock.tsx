import { cn } from "../../helpers/utils";
import type { DrawSteelDynamicTerrain } from "../../types/DrawSteelZod";
import { Feature } from "./Feature";

export function DynamicTerrainStatBlock({
  terrain,
}: {
  terrain: DrawSteelDynamicTerrain;
}) {
  const roleTags = terrain.featureblock_type;

  return (
    <div className="w-full max-w-lg space-y-2">
      <div
        className={cn(
          "rounded-md border-zinc-950 bg-gradient-to-b from-neutral-400/60 to-neutral-300/50 p-2",
          {
            "from-[#d8e0c2] to-[#d8e0c2]/50": roleTags.includes("Hexer"),
            "from-[#cac0a3] to-[#cac0a3]/50": roleTags.includes("Defender"),
            "from-[#f49392] to-[#f49392]/50": roleTags.includes("Controller"),
            "from-[#96b2df] to-[#96b2df]/50": roleTags.includes("Artillery"),
          },
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between text-nowrap">
          <div className="text-base font-black">{terrain.name}</div>
          <div className="text-right font-black">{`Level ${terrain.level} ${terrain.featureblock_type}`}</div>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 text-nowrap">
          <div className="italic">{terrain.flavor}</div>
          <div className="text-right">{`EV ${terrain.ev}`}</div>
        </div>
      </div>

      <div className="space-y-2 px-2">
        <div className="flex flex-wrap justify-between gap-1.5">
          {[
            { label: "Size", value: terrain.size },
            { label: "Stamina", value: terrain.stamina },
          ].map((item) => (
            <div className="min-w-16 flex-1 text-center" key={item.label}>
              <div className="text-lg">{item.value}</div>
              <div className="-mt-1 font-bold text-nowrap">{item.label}</div>
            </div>
          ))}
        </div>

        {terrain.stats && terrain.stats.length > 0 && (
          <div className="space-y-1">
            {terrain.stats.map((stat) => (
              <div key={stat.name}>
                <span className="font-bold">{`${stat.name}: `}</span>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-0.5 w-full border-b border-zinc-950" />

      <div className="mb-0">
        {terrain.features.map((feature) => (
          <div key={feature.name} className="border-b border-zinc-950 p-2 pl-0">
            <Feature blockName={terrain.name} feature={feature} />
          </div>
        ))}
      </div>
    </div>
  );
}
