import React, { useEffect } from "react";
import { parseTokenData } from "../helpers/tokenHelpers";
import Button from "../components/ui/Button";
import {
  dataFromBestiaryIndexId,
} from "../helpers/monsterDataFromStatblockName";
import { heroDataFromStatblockName } from "../helpers/heroDataFromStatblockName";
import {
  getCreatureName,
  type CreatureDataBundle,
} from "../types/creatureDataBundle";
import type { DrawSteelResourceBundle } from "../types/monsterDataBundlesZod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { CheckIcon, ChevronUpIcon } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";
import { useItems } from "../helpers/useItems";
import { useSceneMetadata } from "../helpers/useSceneMetadata";
import { MONSTER_GROUPS_METADATA_KEY } from "../helpers/monsterGroupHelpers";
import z from "zod";
import { MinionGroupZod } from "../types/minionGroup";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../helpers/getPluginId";
import usePlayerRole from "../helpers/usePlayerRole";
import { getMinionTokenCounts } from "../helpers/getMinionTokenCounts";
import { checkHasPluginData } from "../helpers/checkHasPluginData";
import { getValidPluginTypes } from "../helpers/pluginTargetValidityChecking";

type ViewerData = CreatureDataBundle | DrawSteelResourceBundle;
const parseMinionGroups = z.array(MinionGroupZod).parse;

function isHeroData(data: ViewerData | null): data is Extract<
  CreatureDataBundle,
  { kind: "hero" }
> {
  return data !== null && "kind" in data && data.kind === "hero";
}

function getDataName(data: ViewerData | null) {
  if (!data) return undefined;
  return "kind" in data ? getCreatureName(data) : data.resource.name;
}

export function StatBlockSwitcher({
  monsterData,
  setMonsterData,
  setCollapsed,
}: {
  monsterData: ViewerData | null;
  setMonsterData: React.Dispatch<
    React.SetStateAction<ViewerData | null | undefined>
  >;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const playerRole = usePlayerRole();
  const items = useItems();
  const minionGroupsMetadata = useSceneMetadata(
    MONSTER_GROUPS_METADATA_KEY,
    parseMinionGroups,
  );

  useEffect(
    () =>
      OBR.broadcast.onMessage(getPluginId("set-viewer-statblock"), (event) => {
        setCollapsed(false);
        const data = event.data;
        if (!data || typeof data !== "object" || !("resourceId" in data)) return;
        const id = data.resourceId;
        if (typeof id !== "string") return;
        void dataFromBestiaryIndexId(id)
          .then((loadedData) => {
            document.title = getDataName(loadedData) ?? "Statblock";
            setMonsterData(loadedData);
          })
          .catch((error: unknown) => console.error(error));
      }),
    [setCollapsed, setMonsterData],
  );

  const monsterStatblocks: { name: string; id: string }[] = [];
  const terrainStatblocks: { name: string; id: string }[] = [];
  const heroStatblocks: string[] = [];

  items
    .filter(checkHasPluginData)
    .filter((item) => getValidPluginTypes(item).length > 0)
    .forEach((item) => {
      const token = parseTokenData(item.metadata);
      if (
        token.type === "MONSTER" &&
        token.statblockName !== "" &&
        (playerRole === "GM" || !token.gmOnly)
      ) {
        monsterStatblocks.push({
          name: token.statblockName,
          id: token.resourceId || token.statblockName,
        });
      } else if (
        token.type === "TERRAIN" &&
        token.statblockName !== "" &&
        (playerRole === "GM" || !token.gmOnly)
      ) {
        terrainStatblocks.push({
          name: token.statblockName,
          id: token.resourceId || token.statblockName,
        });
      } else if (
        token.type === "HERO" &&
        token.statblockName !== "" &&
        (playerRole === "GM" || !token.gmOnly)
      ) {
        heroStatblocks.push(token.statblockName);
      }
    });

  const uniqueResources = (resources: { name: string; id: string }[]) =>
    [...new Map(resources.map((resource) => [resource.id, resource])).values()]
      .sort((a, b) => a.name.localeCompare(b.name));
  const uniqueMonsters = uniqueResources(monsterStatblocks);
  const uniqueTerrains = uniqueResources(terrainStatblocks);
  const uniqueHeroes = [...new Set(heroStatblocks)].sort((a, b) =>
    a.localeCompare(b),
  );

  const minionStatblocks =
    minionGroupsMetadata.ready && minionGroupsMetadata.value !== undefined
      ? (() => {
          const minionGroups = minionGroupsMetadata.value;
          const { counts } = getMinionTokenCounts(items, minionGroups);
          return uniqueResources(
            minionGroups
              .filter((group) => !group.gmOnly || playerRole === "GM")
              .filter((group) => group.id in counts && counts[group.id] >= 1)
              .filter(
                (group): group is typeof group & { statblock: string } =>
                  typeof group.statblock === "string" &&
                  group.statblock !== "",
              )
              .map((group) => ({
                name: group.statblock,
                id: group.resourceId || group.statblock,
              })),
          );
        })()
      : [];

  const loadHero = async (name: string) => {
    const data = await heroDataFromStatblockName(name);
    setMonsterData({ ...data, kind: "hero" });
  };

  const allEmpty =
    uniqueMonsters.length === 0 &&
    minionStatblocks.length === 0 &&
    uniqueTerrains.length === 0 &&
    uniqueHeroes.length === 0;

  return (
    <Popover>
      <PopoverTrigger className="group" asChild>
        <Button
          variant={"outline"}
          className="h-10 w-full justify-between px-2 sm:px-4"
        >
          <div className="truncate text-start font-bold">
            {getDataName(monsterData) ?? "Select Stat Block"}
          </div>
          <ChevronUpIcon className="transition-transform duration-200 ease-out group-data-[state=open]:-rotate-180" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="overflow-y-auto">
        <div className="space-y-2">
          {allEmpty && (
            <>
              <div className="text-sm font-bold">No Stat Blocks Found</div>
              <div className="text-sm">
                Stat blocks attached to hero, monster, and terrain tokens or
                minion groups in this scene will be listed here.
              </div>
            </>
          )}
          {uniqueHeroes.length > 0 && (
            <div className="text-sm font-bold">Heroes</div>
          )}
          {uniqueHeroes.map((name) => (
            <PopoverClose key={name} asChild>
              <Button
                variant={"ghost"}
                className="hover:bg-mirage-100/70 w-full justify-between rounded-[8px] px-2"
                onClick={() => void loadHero(name)}
              >
                <div className="truncate">{name}</div>
                {isHeroData(monsterData) &&
                  getCreatureName(monsterData) === name && <CheckIcon />}
              </Button>
            </PopoverClose>
          ))}
          {uniqueMonsters.length > 0 && (
            <div className="text-sm font-bold">Monsters</div>
          )}
          {uniqueMonsters.map((resource) => (
            <PopoverClose key={resource.id} asChild>
              <Button
                variant={"ghost"}
                className="hover:bg-mirage-100/70 w-full justify-between rounded-[8px] px-2"
                onClick={() =>
                  void dataFromBestiaryIndexId(resource.id).then(setMonsterData)
                }
              >
                <div className="truncate">{resource.name}</div>
                {monsterData &&
                  "key" in monsterData &&
                  monsterData.key === resource.id && <CheckIcon />}
              </Button>
            </PopoverClose>
          ))}
          {minionStatblocks.length > 0 && (
            <div className="text-sm font-bold">Minions</div>
          )}
          {minionStatblocks.map((resource) => (
            <PopoverClose key={resource.id} asChild>
              <Button
                variant={"ghost"}
                className="hover:bg-mirage-100/70 w-full justify-between rounded-[8px] px-2"
                onClick={() =>
                  void dataFromBestiaryIndexId(resource.id).then(setMonsterData)
                }
              >
                <div className="truncate">{resource.name}</div>
                {monsterData &&
                  "key" in monsterData &&
                  monsterData.key === resource.id && <CheckIcon />}
              </Button>
            </PopoverClose>
          ))}
          {uniqueTerrains.length > 0 && (
            <div className="text-sm font-bold">Terrain</div>
          )}
          {uniqueTerrains.map((resource) => (
            <PopoverClose key={resource.id} asChild>
              <Button
                variant={"ghost"}
                className="hover:bg-mirage-100/70 w-full justify-between rounded-[8px] px-2"
                onClick={() =>
                  void dataFromBestiaryIndexId(resource.id).then(setMonsterData)
                }
              >
                <div className="truncate">{resource.name}</div>
                {monsterData &&
                  "key" in monsterData &&
                  monsterData.key === resource.id && <CheckIcon />}
              </Button>
            </PopoverClose>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
