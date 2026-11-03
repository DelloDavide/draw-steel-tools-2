import OBR from "@owlbear-rodeo/sdk";
import { XIcon, PlusIcon } from "lucide-react";
import { getPluginId } from "../../helpers/getPluginId";
import { Label } from "../trackerInputs/Label";
import { cn } from "../../helpers/utils";
import { ContextMenuButton } from "./ContextMenuButton";
import { openStatblockSearch } from "../../helpers/openStatblockSearch";

export default function StatblockControls({
  label = "Statblock",
  statblockName,
  resourceId,
  removeStatblock,
  groupId,
  playerRole,
  mode = "monster",
  itemId,
  organization,
}: {
  label?: string;
  statblockName: string;
  resourceId: string;
  removeStatblock: () => void;
  groupId?: string;
  playerRole: "PLAYER" | "GM";
  mode?: "monster" | "hero";
  itemId?: string;
  organization?: "CREATURE" | "MINION" | "TERRAIN";
}) {
  const useNameAsId = resourceId === "" && statblockName !== "";
  if (useNameAsId) resourceId = statblockName;

  return (
    <div className="text-foreground col-span-2 w-full">
      <div
        className={cn({
          "opacity-50": playerRole === "PLAYER" && statblockName === "",
        })}
      >
        <Label name={label} />
      </div>
      <div className="flex w-full items-center justify-between gap-0.5">
        {statblockName !== "" ? (
          <>
            <div className="grow">
              <ContextMenuButton
                className="w-full"
                onClick={async () => {
                  OBR.broadcast.sendMessage(
                    getPluginId("set-viewer-statblock"),
                    { resourceId },
                    { destination: "LOCAL" },
                  );
                  OBR.popover.open({
                    id: getPluginId("statblockViewer"),
                    url: (() => {
                      const url = new URL(
                        "/statblockViewer",
                        window.location.origin,
                      );
                      url.searchParams.set("resourceId", resourceId);
                      url.searchParams.set("statblockName", statblockName);
                      if (itemId) url.searchParams.set("itemId", itemId);
                      return url.toString();
                    })(),
                    height: 2000,
                    width: 500,
                    anchorOrigin: {
                      horizontal: "RIGHT",
                      vertical: "BOTTOM",
                    },
                    transformOrigin: {
                      horizontal: "CENTER",
                      vertical: "CENTER",
                    },
                    disableClickAway: true,
                  });
                  const selection = await OBR.player.getSelection();
                  if (selection) OBR.player.select(selection, true);
                }}
              >
                {statblockName}
              </ContextMenuButton>
            </div>
            {playerRole === "GM" && (
              <ContextMenuButton
                className="aspect-square shrink-0"
                onClick={removeStatblock}
              >
                <XIcon />
              </ContextMenuButton>
            )}
          </>
        ) : (
          <ContextMenuButton
            disabled={playerRole === "PLAYER"}
            className="w-full"
            onClick={() =>
              openStatblockSearch({
                groupId,
                organization,
                type: mode === "hero" ? "hero" : undefined,
              })
            }
          >
            <PlusIcon />
          </ContextMenuButton>
        )}
      </div>
    </div>
  );
}
