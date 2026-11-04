import { XIcon } from "lucide-react";
import { MonsterPreviewCard } from "../components/MonsterPreviewCard";
import type { AppState } from "../helpers/AppState";
import { NoMonsterCard } from "../components/NoMonsterCard";
import Button from "../../components/ui/Button";
import { MinionOptions } from "./components/MinionOptions";
import { BasicOptions } from "./components/BasicOptions";
import { ScrollArea } from "../../components/ui/scrollArea";
import { sepertateTargetsForValidity } from "./helpers/sepertateTargetsForValidity";
import { ApplyToTokens } from "./helpers/applyToTokens";
import OBR, { type Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../../helpers/getPluginId";
import { InvalidTargetsWarning } from "./components/InvalidTargetsWarning";
import type { DefinedSettings } from "../../types/settingsZod";

export function OptionsView({
  appState,
  setAppState,
  playerRole,
  targetItems,
  settings,
}: {
  readonly appState: AppState;
  readonly setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  readonly playerRole: "PLAYER" | "GM";
  readonly targetItems: Item[];
  readonly settings: DefinedSettings;
}) {
  const setupOptions = appState.setupOptions;
  const selectedIndexBundle = appState.selectedIndexBundle;

  const { validTargets, invalidTargets } = sepertateTargetsForValidity(
    setupOptions?.type,
    targetItems,
  );

  if (selectedIndexBundle === undefined) {
    throw new Error("Selected index bundle cannot be undefined");
  }

  const disableConfirm = !setupOptions || validTargets.length === 0;
  let noMonsterVariant: "MINION" | "TERRAIN" | "BASIC" = "BASIC";
  if (setupOptions?.type === "MINION") {
    noMonsterVariant = "MINION";
  } else if (setupOptions?.type === "TERRAIN") {
    noMonsterVariant = "TERRAIN";
  }

  const returnToSearch = () =>
    setAppState({
      ...appState,
      selectedIndexBundle: undefined,
      setupOptions: undefined,
    });

  return (
    <div className="flex grow flex-col">
      <ScrollArea className="grow basis-0">
        <div className="space-y-6 p-4">
          <div>
            <h1 className="mb-1">Selected Statblock</h1>
            {selectedIndexBundle === "NONE" ? (
              <NoMonsterCard
                variant={noMonsterVariant}
                onActionClick={returnToSearch}
                icon={<XIcon />}
              />
            ) : (
              <MonsterPreviewCard
                indexBundle={selectedIndexBundle}
                onCardClick={() =>
                  setAppState({ ...appState, monsterViewerOpen: true })
                }
                onActionClick={returnToSearch}
                icon={<XIcon />}
              />
            )}
          </div>
          {setupOptions ? (
            <>
              {setupOptions.type === "MINION" && (
                <MinionOptions
                  playerRole={playerRole}
                  setupOptions={setupOptions}
                  setSetupOptions={(setupOptions) =>
                    setAppState({ ...appState, setupOptions })
                  }
                  settings={settings}
                />
              )}
              {(setupOptions.type === "HERO" ||
                setupOptions.type === "MONSTER" ||
                setupOptions.type === "TERRAIN") && (
                <BasicOptions
                  playerRole={playerRole}
                  setupOptions={setupOptions}
                  setSetupOptions={(setupOptions) =>
                    setAppState({ ...appState, setupOptions })
                  }
                  settings={settings}
                />
              )}
            </>
          ) : (
            <div className="text-foreground/20">Loading...</div>
          )}
          {invalidTargets.length > 0 && setupOptions && (
            <InvalidTargetsWarning
              validTargets={validTargets}
              invalidTargets={invalidTargets}
              setupOptions={setupOptions}
            />
          )}
        </div>
      </ScrollArea>

      <footer className="w-full">
        <div className="border-mirage-300 dark:border-mirage-700 flex gap-4 border-t px-4 py-3">
          <Button
            variant={"accentOutline"}
            className="grow"
            onClick={returnToSearch}
          >
            Back
          </Button>
          <Button
            disabled={disableConfirm}
            className="grow"
            onClick={() => {
              if (disableConfirm) return;
              void ApplyToTokens(
                setupOptions,
                selectedIndexBundle,
                validTargets,
              )
                .then(() => OBR.popover.close(getPluginId("statblockSearch")))
                .catch((error: unknown) =>
                  console.error("Failed to apply options:", error),
                );
            }}
          >
            Confirm
          </Button>
        </div>
      </footer>
    </div>
  );
}
