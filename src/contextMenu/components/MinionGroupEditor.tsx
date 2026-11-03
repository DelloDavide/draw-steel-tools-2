import { EyeIcon, EyeOffIcon, Minimize2Icon } from "lucide-react";
import { type MinionGroup } from "../../types/minionGroup";
import ValueButtonTrackerInput from "../trackerInputs/ValueButtonTrackerInput";
import parseNumber from "../../helpers/parseNumber";
import OBR, { type Image } from "@owlbear-rodeo/sdk";
import { Label } from "../trackerInputs/Label";
import NameInput from "./NameInput";
import StatblockControls from "./StatblockControls";
import type { DefinedSettings } from "../../types/settingsZod";
import { useRef } from "react";
import VisibilityToggle from "./VisibilityToggle";
import { MinionsImageRow } from "./MinionsImageRow";
import { ContextMenuButton } from "./ContextMenuButton";

export default function MinionGroupEditor({
  minionGroup,
  setMinionGroup,
  settings,
  groupItems,
  handleMinimize,
  showMinimize = false,
  playerRole,
}: {
  minionGroup: MinionGroup;
  setMinionGroup: (minionGroup: MinionGroup) => void;
  settings: DefinedSettings;
  groupItems: Image[];
  handleMinimize: () => void;
  showMinimize?: boolean;
  playerRole: "PLAYER" | "GM";
}) {
  const staminaInputRef = useRef<HTMLInputElement>(null);

  const gmOnly = minionGroup.gmOnly || minionGroup.gmOnly === undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-x-0.5">
        <NameInput
          label="Squad"
          value={minionGroup.name}
          updateName={(name) => setMinionGroup({ ...minionGroup, name })}
          placeHolder=""
          hideButton
        />
        {settings.nameTagsEnabled && (
          <ContextMenuButton
            className="aspect-square"
            onClick={() => {
              setMinionGroup({
                ...minionGroup,
                nameTagsEnabled: !minionGroup.nameTagsEnabled,
              });
            }}
          >
            {minionGroup.nameTagsEnabled ? <EyeIcon /> : <EyeOffIcon />}
          </ContextMenuButton>
        )}
        {showMinimize && (
          <ContextMenuButton
            className="ml-1.5 aspect-square"
            onClick={handleMinimize}
          >
            <Minimize2Icon />
          </ContextMenuButton>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ValueButtonTrackerInput
          backgroundProps={{
            className: "cursor-text",
            onClick: () => {
              if (staminaInputRef.current === document.activeElement) return;
              staminaInputRef.current?.focus();
            },
          }}
          ref={staminaInputRef}
          color="RED"
          label="Stamina"
          parentValue={minionGroup.currentStamina}
          updateHandler={(target) => {
            setMinionGroup({
              ...minionGroup,
              currentStamina: parseNumber(target.value, {
                min: -9999,
                max: 9999,
                inlineMath: { previousValue: minionGroup.currentStamina },
                truncate: true,
              }),
            });
          }}
          buttonProps={{
            inert: true,
            className: "w-fit",
            children: (
              <div className="text-foreground-secondary flex gap-1 pr-2 text-nowrap">
                <div>/</div>
                <div>
                  {`${groupItems.length * minionGroup.individualStamina}`}
                </div>
              </div>
            ),
          }}
        />
        <ValueButtonTrackerInput
          label="Individual Stamina"
          parentValue={minionGroup.individualStamina}
          updateHandler={(target) => {
            setMinionGroup({
              ...minionGroup,
              individualStamina: parseNumber(target.value, {
                min: 1,
                max: 9999,
                inlineMath: { previousValue: minionGroup.individualStamina },
                truncate: true,
              }),
            });
          }}
        />
      </div>
      <div className="mb-0">
        <Label name="Tokens" />
      </div>

      <ContextMenuButton
        className="w-full"
        onClick={() => OBR.player.select(groupItems.map((item) => item.id))}
      >
        <div className="w-full px-2 py-1">
          <MinionsImageRow minionGroup={minionGroup} groupItems={groupItems} />
        </div>
      </ContextMenuButton>

      <StatblockControls
        statblockName={minionGroup.statblock ? minionGroup.statblock : ""}
        resourceId={minionGroup.resourceId ? minionGroup.resourceId : ""}
        removeStatblock={() =>
          setMinionGroup({
            ...minionGroup,
            statblock: "",
            resourceId: "",
          })
        }
        groupId={minionGroup.id}
        playerRole={playerRole}
        organization="MINION"
      />

      {playerRole === "GM" && (
        <VisibilityToggle
          value={gmOnly}
          onClick={() => setMinionGroup({ ...minionGroup, gmOnly: !gmOnly })}
        />
      )}
    </div>
  );
}
