import FreeWheelInput from "../../components/logic/FreeWheelInput";
import { cn } from "../../helpers/utils";
import type { DrawSteelStatblock } from "../../types/DrawSteelZod";
import type { HeroDataBundle } from "../../types/heroDataBundlesZod";
import type { MonsterDataBundle } from "../../types/monsterDataBundlesZod";
import { Characteristics } from "./Characteristics";
import { Feature } from "./Feature";
import { Input } from "./Input";

type StatBlockData = DrawSteelStatblock | HeroDataBundle | MonsterDataBundle;

function getStatblock(statblockData: StatBlockData): DrawSteelStatblock {
  if ("statblock" in statblockData) return statblockData.statblock;
  return statblockData;
}

export function StatBlock({
  statblock: statblockData,
}: {
  statblock: StatBlockData;
}) {
  const statblock = getStatblock(statblockData);
  const roleTags = statblock.roles.join(" ");
  const organization = statblock.roles.slice(0, -1).join(" ");
  const role = statblock.roles.at(-1) ?? "";

  return (
    <div className="w-full max-w-2xl space-y-2">
      <div
        className={cn(
          "space-y-2 rounded-md border-zinc-950 bg-gradient-to-b from-neutral-400/60 to-neutral-300/50 p-2",
          {
            "from-[#e9db7d] to-[#e9db7d]/50":
              roleTags.includes("Ambusher"),
            "from-[#ccc3d0] to-[#ccc3d0]/50":
              roleTags.includes("Artillery"),
            "from-[#96b2df] to-[#96b2df]/50":
              roleTags.includes("Brute"),
            "from-[#f49392] to-[#f49392]/50":
              roleTags.includes("Controller"),
            "from-[#cac0a3] to-[#cac0a3]/50":
              roleTags.includes("Defender"),
            "from-[#eac1c0] to-[#eac1c0]/50":
              roleTags.includes("Harrier"),
            "from-[#d8e0c2] to-[#d8e0c2]/50":
              roleTags.includes("Hexer"),
            "from-[#b5dae3] to-[#b5dae3]/50":
              roleTags.includes("Mount"),
            "from-[#f0dacc] to-[#f0dacc]/50":
              roleTags.includes("Support"),
            "from-[#c95cff] to-[#c95cff]/50":
              roleTags.includes("Hero"),
            "from-[#3aa76d] to-[#3aa76d]/50":
              roleTags.includes("Retainer"),
          },
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4 text-nowrap">
          <Input>
            <FreeWheelInput
              className="grow text-base font-black"
              placeholder="Name"
              value={statblock.name}
              onUpdate={() => {}}
            />
          </Input>
          <div className="flex items-center justify-end gap-1 text-right">
            <div>Level</div>
            <Input>
              <FreeWheelInput
                className="w-10 text-center"
                placeholder="#"
                value={statblock.level.toString()}
                onUpdate={() => {}}
              />
            </Input>
            <Input>
              <FreeWheelInput
                className="w-26"
                placeholder="Organization"
                value={organization}
                onUpdate={() => {}}
              />
            </Input>
            <Input>
              <FreeWheelInput
                className="w-24"
                placeholder="Role"
                value={role}
                onUpdate={() => {}}
              />
            </Input>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 text-nowrap">
          <Input>
            <FreeWheelInput
              className="grow"
              placeholder="Ancestry"
              value={statblock.ancestry.join(", ")}
              onUpdate={() => {}}
            />
          </Input>

          <div className="flex items-center gap-1">
            <div className="text-right">EV</div>
            <Input>
              <FreeWheelInput
                className="w-12 text-center"
                placeholder="#"
                value={statblock.ev}
                onUpdate={() => {}}
              />
            </Input>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-2">
        <div className="flex flex-wrap justify-between gap-1.5">
          {[
            { label: "Size", value: statblock.size },
            { label: "Speed", value: statblock.speed },
            { label: "Stamina", value: statblock.stamina },
            { label: "Stability", value: statblock.stability },
            { label: "Free Strike", value: statblock.free_strike },
          ].map((item) => (
            <div
              className="flex min-w-16 flex-1 flex-col items-center gap-0.5"
              key={item.label}
            >
              <Input>
                <FreeWheelInput
                  className="w-12 text-center"
                  value={item.value.toString()}
                  onUpdate={() => {}}
                />
              </Input>
              <div className="font-bold text-nowrap">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <div className="font-bold">{"Immunity "}</div>
            <Input>
              <FreeWheelInput
                className="grow"
                value={
                  statblock.immunities ? statblock.immunities.join(", ") : ""
                }
                onUpdate={() => {}}
              />
            </Input>
          </div>
          <div className="flex items-center gap-1">
            <div className="font-bold">{"Weakness "}</div>
            <Input>
              <FreeWheelInput
                className="grow"
                value={
                  statblock.weaknesses ? statblock.weaknesses.join(", ") : ""
                }
                onUpdate={() => {}}
              />
            </Input>
          </div>
          <div className="flex items-center gap-1">
            <div className="font-bold">{"Movement "}</div>
            <Input>
              <FreeWheelInput
                className="grow"
                value={statblock.movement ? statblock.movement : ""}
                onUpdate={() => {}}
              />
            </Input>
          </div>
          <div className="flex items-center gap-1">
            <div className="font-bold">{"With Captain "}</div>
            <Input>
              <FreeWheelInput
                className="grow"
                value={statblock.with_captain ? statblock.with_captain : ""}
                onUpdate={() => {}}
              />
            </Input>
          </div>
        </div>
      </div>

      <div className="w-full border-b border-zinc-950" />

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
