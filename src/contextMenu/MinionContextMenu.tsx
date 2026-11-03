import { useRoomMetadata } from "../helpers/useRoomMetadata";
import {
  defaultSettings,
  SETTINGS_METADATA_KEY,
} from "../helpers/settingsHelpers";
import { SettingsZod } from "../types/settingsZod";
import { useSceneMetadata } from "../helpers/useSceneMetadata";
import { MONSTER_GROUPS_METADATA_KEY } from "../helpers/monsterGroupHelpers";
import z from "zod";
import { MinionGroupZod, type MinionGroup } from "../types/minionGroup";
import MinionGroupEditor from "./components/MinionGroupEditor";
import { MinionGroupFallback } from "./components/MinionGroupFallback";
import { useItems } from "../helpers/useItems";
import usePlayerSelection from "../helpers/usePlayerSelection";
import { parseTokenData } from "../helpers/tokenHelpers";
import { checkHasPluginData } from "../helpers/checkHasPluginData";
import { checkItemIsValidPluginType } from "../helpers/pluginTargetValidityChecking";
import type { MinionTokenData } from "../types/tokenDataZod";
import { isImage, type Image } from "@owlbear-rodeo/sdk";
import { MinionsImageRow } from "./components/MinionsImageRow";
import { Separator } from "../components/ui/Separator";
import { ScrollArea } from "../components/ui/scrollArea";
import { useState } from "react";
import { ContextMenuButton } from "./components/ContextMenuButton";
import usePlayerRole from "../helpers/usePlayerRole";

const parseMinionGroups = z.array(MinionGroupZod).parse;

type ItemData = { data: MinionTokenData; item: Image };
type GroupData =
  | { type: "FOUND"; data: MinionGroup; items: ItemData[] }
  | { type: "MISSING"; data: { id: string }; items: ItemData[] };

export default function MinionContextMenu() {
  const settingsMetadata = useRoomMetadata(
    SETTINGS_METADATA_KEY,
    SettingsZod.parse,
  );

  const minionGroupsMetadata = useSceneMetadata(
    MONSTER_GROUPS_METADATA_KEY,
    parseMinionGroups,
  );

  const items = useItems();
  const selection = usePlayerSelection();
  const playerRole = usePlayerRole();

  const [userSelectedGroupId, setUserSelectedGroupId] = useState<string>();

  if (!selection || selection.length < 1) return <></>;
  if (!settingsMetadata.ready) return <></>;
  if (!minionGroupsMetadata.ready) return <></>;

  const filteredItems = items
    .filter(checkHasPluginData)
    .filter(isImage)
    .filter((item) => checkItemIsValidPluginType(item, "MINION"));

  const minionData: { data: MinionTokenData; item: Image }[] = [];
  filteredItems.forEach((item) => {
    const data = parseTokenData(item.metadata);
    if (data.type !== "MINION") return;
    minionData.push({ data, item });
  });

  const selectionGroupIds = [
    ...new Set(
      minionData
        .filter((item) => selection.includes(item.item.id))
        .map((val) => val.data.groupId),
    ),
  ];
  const selectionGroupData: GroupData[] = selectionGroupIds
    .map((id) => {
      const data = minionGroupsMetadata.value?.find((group) => group.id === id);
      const items = minionData.filter((data) => data.data.groupId === id);

      if (!data)
        return { type: "MISSING", data: { id }, items } satisfies GroupData;
      return { type: "FOUND", data, items } satisfies GroupData;
    })
    .filter(
      (group) =>
        playerRole === "GM" ||
        group.type === "MISSING" ||
        (playerRole === "PLAYER" && group.data.gmOnly === false),
    );

  const definedSettings = { ...defaultSettings, ...settingsMetadata.value };

  let groupData: GroupData | undefined;
  if (selectionGroupData.length === 1) groupData = selectionGroupData[0];
  else {
    const userSelectedGroup = selectionGroupData.find(
      (val) => val.data.id === userSelectedGroupId,
    );
    if (userSelectedGroup) groupData = userSelectedGroup;
  }

  if (groupData) {
    return (
      <div className="text-foreground space-y-2 p-2">
        {groupData.type === "MISSING" ? (
          <MinionGroupFallback
            minionGroups={minionGroupsMetadata.value}
            groupId={groupData.data.id}
            handleMinimize={() => setUserSelectedGroupId(undefined)}
            showMinimize={selectionGroupData.length > 1}
          />
        ) : (
          <MinionGroupEditor
            playerRole={playerRole}
            minionGroup={groupData.data}
            setMinionGroup={(minionGroup) => {
              if (minionGroupsMetadata.value === undefined) return;
              minionGroupsMetadata.update(
                minionGroupsMetadata.value.map((val) =>
                  val.id === minionGroup.id ? minionGroup : val,
                ),
              );
            }}
            settings={definedSettings}
            groupItems={groupData.items.map((val) => val.item)}
            handleMinimize={() => setUserSelectedGroupId(undefined)}
            showMinimize={selectionGroupData.length > 1}
          />
        )}
      </div>
    );
  }

  return (
    <div className="text-foreground flex h-screen flex-col space-y-2 pt-2">
      {/*<div className="ml-2 text-sm font-semibold">Select Group</div>*/}
      <ScrollArea className="h-full px-2" type="scroll">
        <div className="space-y-2">
          {selectionGroupData.map((group) => (
            <ContextMenuButton
              key={group.data.id}
              className="h-fit w-full"
              onClick={() => setUserSelectedGroupId(group.data.id)}
            >
              <div className="w-full space-y-1.5 p-2 pt-2.5">
                <div className="flex justify-between gap-2 text-left text-sm font-semibold">
                  <div>
                    {group.type === "FOUND"
                      ? group.data.name.substring(0, 40).trimEnd() +
                        (group.data.name.length > 40 ? "..." : "")
                      : "Missing data"}
                  </div>
                  {group.type === "FOUND" && (
                    <div>{`${group.data.currentStamina}/${group.data.individualStamina * group.items.length}`}</div>
                  )}
                </div>
                <Separator />
                <div className="py-0.5">
                  <div className="flex h-6 text-sm">
                    <MinionsImageRow
                      minionGroup={
                        group.type === "FOUND" ? group.data : undefined
                      }
                      groupItems={group.items.map((val) => val.item)}
                    />
                  </div>
                </div>
              </div>
            </ContextMenuButton>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
