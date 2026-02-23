import OBR from "@owlbear-rodeo/sdk";
import { XIcon, PlusIcon } from "lucide-react";
import Button from "../../components/ui/Button";
import { getPluginId } from "../../helpers/getPluginId";
import { Label } from "../trackerInputs/Label";
import { cn } from "../../helpers/utils";

export default function StatblockControls({
  label = "Statblock",
  statblockName,
  setStatblockName,
  groupId,
  playerRole,
  mode = "monster",
}: {
  label?: string;
  statblockName: string;
  setStatblockName: (statblockName: string) => void;
  groupId?: string;
  playerRole: "PLAYER" | "GM";
  mode?: "monster" | "hero";
}) {
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
              <Button
                variant={"secondary"}
                className="bg-mirage-400/30 dark:bg-mirage-500/30 hover:bg-mirage-400/30 hover:dark:bg-mirage-500/30 group w-full basis-40 overflow-clip p-0 focus-visible:ring-0"
                onClick={async () => {
                  OBR.broadcast.sendMessage(
                    getPluginId("set-viewer-statblock"),
                    { statblockName },
                    { destination: "LOCAL" },
                  );
                  OBR.popover.open({
                    id: getPluginId("statblockViewer"),
                    url: (() => {
                      const url = new URL(
                        "/statblockViewer",
                        window.location.origin,
                      );
                      url.searchParams.set("statblockName", statblockName);
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
                <div className="group-hover:bg-foreground/7 flex size-full grow items-center-safe justify-center text-sm duration-150">
                  {statblockName}
                </div>
              </Button>
            </div>
            {playerRole === "GM" && (
              <Button
                variant={"secondary"}
                className="bg-mirage-400/30 dark:bg-mirage-500/30 hover:bg-mirage-400/30 hover:dark:bg-mirage-500/30 group aspect-square shrink-0 overflow-clip p-0 focus-visible:ring-0"
                onClick={() => setStatblockName("")}
              >
                <div className="group-hover:bg-foreground/7 flex size-full items-center-safe justify-center text-sm duration-150">
                  <XIcon />
                </div>
              </Button>
            )}
          </>
        ) : (
          <Button
            disabled={playerRole === "PLAYER"}
            variant={"secondary"}
            className="bg-mirage-400/30 dark:bg-mirage-500/30 hover:bg-mirage-400/30 hover:dark:bg-mirage-500/30 group w-full overflow-clip p-0 focus-visible:ring-0"
            onClick={async () => {
              const themeMode = (await OBR.theme.getTheme()).mode;
              const searchParams = new URLSearchParams();
              searchParams.set("themeMode", themeMode);
              if (groupId) searchParams.set("groupId", groupId);
              if (mode === "hero") searchParams.set("type", "hero");

              OBR.popover.open({
                id: getPluginId("statblockSearch"),
                url: `/statblockSearch?${searchParams.toString()}`,
                height: 1000,
                width: 800,
                anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
                transformOrigin: {
                  horizontal: "CENTER",
                  vertical: "CENTER",
                },
              });
            }}
          >
            <div className="group-hover:bg-foreground/7 flex size-full items-center-safe justify-center text-sm duration-150">
              <PlusIcon />
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
