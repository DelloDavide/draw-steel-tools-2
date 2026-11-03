import FreeWheelInput from "../../../components/logic/FreeWheelInput";
import { Checkbox } from "../../../components/ui/checkbox";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import parseNumber from "../../../helpers/parseNumber";
import type { DefinedSettings } from "../../../types/settingsZod";
import type { MinionSetupOptions, SetupOptions } from "../../helpers/AppState";
import { GmOnlyToggle } from "./GmOnlyToggle";

export function MinionOptions({
  setupOptions,
  setSetupOptions,
  playerRole,
  settings,
}: {
  setupOptions: MinionSetupOptions;
  setSetupOptions: (setupOptions: SetupOptions) => void;
  playerRole: "PLAYER" | "GM";
  settings: DefinedSettings;
}) {
  return (
    <div className="space-y-4">
      <h1 className="mb-1">Minion Squad Options</h1>
      <div className="bg-mirage-99 dark:bg-mirage-901 space-y-4 rounded-2xl p-4">
        <div>
          <Label htmlFor="nameInput" className="mb-2">
            Individual Stamina
          </Label>
          <Input id="nameInput" className="w-60 max-w-full">
            <FreeWheelInput
              clearContentOnFocus
              value={setupOptions.stamina.value.toString()}
              onUpdate={(target) => {
                const stamina = parseNumber(target.value, {
                  truncate: true,
                  min: 1,
                  max: 9999,
                  inlineMath: {
                    previousValue: setupOptions.stamina.value,
                  },
                });
                setSetupOptions({
                  ...setupOptions,
                  stamina: {
                    ...setupOptions.stamina,
                    value: stamina,
                  },
                });
              }}
            />
          </Input>
        </div>
      </div>
      <div className="bg-mirage-99 dark:bg-mirage-901 space-y-4 rounded-2xl p-4">
        <div>
          <Label htmlFor="groupNameInput" className="mb-2">
            Squad Name
          </Label>
          <Input id="groupNameInput" className="w-60 max-w-full">
            <FreeWheelInput
              value={setupOptions.groupName.value}
              onUpdate={(target) => {
                setSetupOptions({
                  ...setupOptions,
                  groupName: {
                    ...setupOptions.groupName,
                    value: target.value,
                  },
                });
              }}
            />
          </Input>
        </div>
        {settings.nameTagsEnabled && (
          <div className="flex items-center">
            <Checkbox
              id="AddNameTagCheckbox"
              checked={setupOptions.groupName.nameTags}
              onCheckedChange={(checked) =>
                setSetupOptions({
                  ...setupOptions,
                  groupName: {
                    ...setupOptions.groupName,
                    nameTags: checked === true,
                  },
                })
              }
            />
            <Label className="h-fit" htmlFor="AddNameTagCheckbox">
              Add Name Tags
            </Label>
          </div>
        )}
      </div>
      <GmOnlyToggle
        playerRole={playerRole}
        gmOnly={setupOptions.gmOnly.value}
        onGmOnlyChange={(value) =>
          setSetupOptions({
            ...setupOptions,
            gmOnly: { value },
          })
        }
      />
    </div>
  );
}
