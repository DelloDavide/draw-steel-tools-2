import { MinionTokenDataZod } from "../../types/tokenDataZod";
import Button from "../../components/ui/Button";
import { removeCreatureData } from "../../helpers/removeCreatureData";
import { TOKEN_METADATA_KEY } from "../../helpers/tokenHelpers";
import OBR from "@owlbear-rodeo/sdk";
import type { MinionGroup } from "../../types/minionGroup";
import { Minimize2Icon } from "lucide-react";
import { ContextMenuButton } from "./ContextMenuButton";
import { openStatblockSearch } from "../../helpers/openStatblockSearch";

export function MinionGroupFallback({
  minionGroups,
  groupId,
  handleMinimize,
  showMinimize = false,
}: {
  minionGroups: MinionGroup[] | undefined;
  groupId: string;

  handleMinimize: () => void;
  showMinimize?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Group Not Found</div>
        {showMinimize && (
          <ContextMenuButton
            className="ml-1.5 aspect-square"
            onClick={handleMinimize}
          >
            <Minimize2Icon />
          </ContextMenuButton>
        )}
      </div>
      <div>
        <div className="text-foreground-secondary text-sm">
          Minion group data is not transferred between scenes.
        </div>
      </div>
      <Button
        variant={"secondary"}
        className="bg-mirage-400/30 dark:bg-mirage-500/30 hover:bg-mirage-400/30 hover:dark:bg-mirage-500/30 group w-full overflow-clip p-0 focus-visible:ring-0"
        onClick={async () => {
          let items = await OBR.scene.items.getItems();
          items = items.filter((item) => {
            return MinionTokenDataZod.safeParse(
              item.metadata[TOKEN_METADATA_KEY],
            ).success;
          });

          const groupIdsInUse = minionGroups
            ? minionGroups?.map((group) => group.id)
            : [];
          items = items.filter((item) => {
            return !groupIdsInUse.includes(
              (item.metadata[TOKEN_METADATA_KEY] as { groupId: string })
                .groupId,
            );
          });

          removeCreatureData(items);
        }}
      >
        <div className="group-hover:bg-foreground/7 flex size-full items-center-safe justify-center text-sm duration-150">
          Remove Stray Minions
        </div>
      </Button>
      <Button
        className="w-full text-sm"
        onClick={() => openStatblockSearch({ groupId, organization: "MINION" })}
      >
        Replace Group
      </Button>
    </div>
  );
}
