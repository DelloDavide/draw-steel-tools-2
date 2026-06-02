import { cn } from "../../helpers/utils";
import type { DrawSteelStatblock } from "../../types/DrawSteelZod";
import { Characteristics } from "./Characteristics";
import { Feature } from "./Feature";

export function StatBlock({ statblock }: { statblock: DrawSteelStatblock }) {
  const roleTags = statblock.roles.join(" ");

  return (
    <div className="w-full max-w-lg space-y-2">
      <div
        className={cn(
          "rounded-md border-zinc-950 bg-gradient-to-b from-neutral-400/60 to-neutral-300/50 p-2",
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
          <div className="flex justify-center gap-8">
            {[
              { label: "Wealth", value: statblock.wealth ?? "—" },
              { label: "Renown", value: statblock.renown ?? "—" },
            ].map((item) => (
              <div className="min-w-16 text-center" key={item.label}>
                <div className="text-lg">{item.value}</div>
                <div className="-mt-1 font-bold text-nowrap">{item.label}</div>
              </div>
            ))}
          </div>
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
