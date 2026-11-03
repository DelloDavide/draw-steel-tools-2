import FreeWheelInput from "../../../components/logic/FreeWheelInput";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
} from "../../../components/ui/collapsible";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import parseNumber from "../../../helpers/parseNumber";
import type { DefinedSettings } from "../../../types/settingsZod";
import type {
  HeroSetupOptions,
  MonsterSetupOptions,
  SetupOptions,
  TerrainSetupOptions,
} from "../../helpers/AppState";
import { GmOnlyToggle } from "./GmOnlyToggle";

export function BasicOptions({
  setupOptions,
  setSetupOptions,
  playerRole,
  settings,
}: {
  setupOptions: HeroSetupOptions | MonsterSetupOptions | TerrainSetupOptions;
  setSetupOptions: (setupOptions: SetupOptions) => void;
  playerRole: "PLAYER" | "GM";
  settings: DefinedSettings;
}) {
  return (
    <div>
      <h1 className="mb-1">Token Options</h1>
      <div className="flex items-center">
        <Checkbox
          id="setStaminaCheckbox"
          checked={setupOptions.stamina.enabled}
          onCheckedChange={(checked) => {
            setSetupOptions({
              ...setupOptions,
              stamina: {
                ...setupOptions.stamina,
                enabled: checked === true,
              },
            });
          }}
        />
        <Label className="h-fit" htmlFor="setStaminaCheckbox">
          {"Set Stamina"}
        </Label>
      </div>
      <Collapsible open={setupOptions.stamina.enabled}>
        <CollapsibleContent>
          <div className="bg-mirage-99 dark:bg-mirage-901 my-1 ml-10 space-y-4 rounded-2xl p-4">
            <div>
              <Label htmlFor="nameInput" className="mb-2">
                Stamina
              </Label>
              <Input id="nameInput" className="w-60 max-w-full">
                <FreeWheelInput
                  clearContentOnFocus
                  value={setupOptions.stamina.value.toString()}
                  onUpdate={(target) => {
                    const stamina = parseNumber(target.value, {
                      truncate: true,
                      min: 0,
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
        </CollapsibleContent>
      </Collapsible>
      <div className="flex items-center">
        <Checkbox
          id="setNameCheckbox"
          checked={setupOptions.name.enabled}
          onCheckedChange={(checked) =>
            setSetupOptions({
              ...setupOptions,
              name: {
                ...setupOptions.name,
                enabled: checked === true,
              },
            })
          }
        />
        <Label className="h-fit" htmlFor="setNameCheckbox">
          {"Set Name"}
        </Label>
      </div>
      <Collapsible open={setupOptions.name.enabled}>
        <CollapsibleContent>
          <div className="bg-mirage-99 dark:bg-mirage-901 my-1 ml-10 space-y-4 rounded-2xl p-4">
            <div>
              <Label htmlFor="nameInput" className="mb-2">
                Name
              </Label>
              <Input id="nameInput" className="w-60 max-w-full">
                <FreeWheelInput
                  value={setupOptions.name.value}
                  onUpdate={(target) => {
                    setSetupOptions({
                      ...setupOptions,
                      name: {
                        ...setupOptions.name,
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
                  checked={setupOptions.name.nameTag}
                  onCheckedChange={(checked) =>
                    setSetupOptions({
                      ...setupOptions,
                      name: {
                        ...setupOptions.name,
                        nameTag: checked === true,
                      },
                    })
                  }
                />
                <Label className="h-fit" htmlFor="AddNameTagCheckbox">
                  Add Name Tag
                </Label>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="mt-4">
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
    </div>
  );
}
