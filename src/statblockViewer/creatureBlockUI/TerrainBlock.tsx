import { cn } from "../../helpers/utils";
import type { DrawSteelDynamicTerrain } from "../../types/DrawSteelZod";
import { Feature } from "./Feature";

export function TerrainBlock({
  terrainBlock,
}: {
  terrainBlock: DrawSteelDynamicTerrain;
}) {
  return (
    <div className="w-full max-w-lg">
      <div
        className={cn(
          "rounded-md border-zinc-950 bg-gradient-to-b from-neutral-400/60 to-neutral-300/50 p-2",
          {
            "from-[#e9db7d] to-[#e9db7d]/50":
              terrainBlock.featureblock_type.includes("Ambusher"),
            "from-[#ccc3d0] to-[#ccc3d0]/50":
              terrainBlock.featureblock_type.includes("Artillery"),
            "from-[#96b2df] to-[#96b2df]/50":
              terrainBlock.featureblock_type.includes("Brute"),
            "from-[#f49392] to-[#f49392]/50":
              terrainBlock.featureblock_type.includes("Controller"),
            "from-[#cac0a3] to-[#cac0a3]/50":
              terrainBlock.featureblock_type.includes("Defender"),
            "from-[#eac1c0] to-[#eac1c0]/50":
              terrainBlock.featureblock_type.includes("Harrier"),
            "from-[#d8e0c2] to-[#d8e0c2]/50":
              terrainBlock.featureblock_type.includes("Hexer"),
            "from-[#b5dae3] to-[#b5dae3]/50":
              terrainBlock.featureblock_type.includes("Mount"),
            "from-[#f0dacc] to-[#f0dacc]/50":
              terrainBlock.featureblock_type.includes("Support"),
          },
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between">
          <div className="text-base font-black">{terrainBlock.name}</div>
          <div className="font-black">{`Level ${terrainBlock.level} ${terrainBlock.featureblock_type}`}</div>
        </div>
        <div className="flex flex-wrap justify-end text-nowrap">
          <div className="text-right">{`EV ${terrainBlock.ev}`}</div>
        </div>
      </div>

      <div className="border-mirage-950 space-y-2 border-b p-2 pl-0">
        <div className="text-center">{terrainBlock.flavor}</div>
        <div>
          <div className="flex flex-wrap justify-between">
            <div>
              <span className="font-bold">{"Stamina: "}</span>
              {terrainBlock.stamina}
            </div>
            <div>
              <span className="font-bold">{"Size: "}</span>
              {terrainBlock.size}
            </div>
          </div>
          {terrainBlock.stats?.map((val) => (
            <div key={val.name}>
              <span className="font-bold">{`${val.name}: `}</span>
              <span>{val.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        {terrainBlock.features?.map((feature) => (
          <div
            key={feature.name}
            className="border-mirage-950 border-b p-2 pl-0"
          >
            <Feature blockName={terrainBlock.name} feature={feature} />
          </div>
        ))}
      </div>
    </div>
  );
}
