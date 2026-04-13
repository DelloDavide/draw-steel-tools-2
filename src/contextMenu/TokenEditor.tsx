import { useEffect, useState } from "react";
import {
  CharacterTokenDataZod,
  DefinedCharacterTokenDataZod,
  type DefinedCharacterTokenData,
} from "../types/tokenDataZod";
import OBR, { type Item } from "@owlbear-rodeo/sdk";
import { getSelectedItems } from "../helpers/getSelectedItem";
import { parseTokenData, TOKEN_METADATA_KEY } from "../helpers/tokenHelpers";
import { useRoomMetadata } from "../helpers/useRoomMetadata";
import {
  defaultSettings,
  SETTINGS_METADATA_KEY,
} from "../helpers/settingsHelpers";
import { SettingsZod } from "../types/settingsZod";
import usePlayerRole from "../helpers/usePlayerRole";
import type { Token } from "../types/contextMenuToken";
import NameInput from "./components/NameInput";
import StatEditor from "./components/StatEditor";
import StatblockControls from "./components/StatblockControls";
import VisibilityToggle from "./components/VisibilityToggle";
import { cn } from "../helpers/utils";
import Button from "../components/ui/Button";
import { getPluginId } from "../helpers/getPluginId";
import Textarea from "./trackerInputs/TokenTextarea";

const params = new URLSearchParams(document.location.search);
const detailedVale = params.get("detailed");
const detailed = detailedVale === "true" ? true : false;

export default function TokenEditor() {
  const playerRole = usePlayerRole();

  const settingsMetadata = useRoomMetadata(
    SETTINGS_METADATA_KEY,
    SettingsZod.parse,
  );

  const [token, setToken] = useState<Token>();
  useEffect(() => {
    const handleItems = (items: Item[]) => {
      if (items.length !== 1) throw new Error("Too many items selected.");
      const item = items[0];
      const characterData = parseTokenData(item.metadata);
      setToken({ ...characterData, item });
    };
    getSelectedItems().then(handleItems);
    return OBR.scene.items.onChange((items) => {
      getSelectedItems({ items }).then(handleItems);
    });
  }, []);

  if (token === undefined || !settingsMetadata.ready) return <></>;
  if (token.type === "MINION") {
    return (
      <div className="text-foreground p-2">
        Error: expected non minion type.
      </div>
    );
  }

  const definedSettings = { ...defaultSettings, ...settingsMetadata.value };

  const updateToken = (
    characterTokenData: Partial<DefinedCharacterTokenData>,
  ) => {
    setToken({
      ...DefinedCharacterTokenDataZod.parse({
        ...token,
        ...characterTokenData,
      }),
      item: token.item,
    });
    OBR.scene.items.updateItems(
      (item) => item.id === token.item.id,
      (items) => {
        if (items.length !== 1) throw new Error("Too many items selected.");
        if (
          "name" in characterTokenData &&
          characterTokenData?.name &&
          characterTokenData.name.length > 0
        ) {
          items[0].name = characterTokenData.name;
        }
        const existingDataValidation = CharacterTokenDataZod.safeParse(
          items[0].metadata[TOKEN_METADATA_KEY],
        );
        items[0].metadata[TOKEN_METADATA_KEY] = CharacterTokenDataZod.parse({
          ...(existingDataValidation.success
            ? existingDataValidation.data
            : undefined),
          ...characterTokenData,
        });
      },
    );
  };

  return (
    <div
      className={cn("text-foreground space-y-2 p-2", {
        "text-foreground bg-mirage-50 dark:bg-mirage-950 border-mirage-300 dark:border-mirage-700 flex h-screen min-h-screen flex-col gap-2 space-y-0 overflow-y-auto rounded-2xl border p-4 dark:scheme-dark":
          detailed,
      })}
    >
      {(definedSettings.nameTagsEnabled || detailed) && (
        <NameInput
          value={token.name}
          placeHolder={token.item.name}
          updateName={(name) => updateToken({ name })}
        />
      )}
      <StatEditor token={token} updateToken={updateToken} />
      {(token.type === "MONSTER" || token.type === "HERO") && (
        <StatblockControls
          statblockName={token.statblockName ?? ""}
          setStatblockName={(statblockName) => updateToken({ statblockName })}
          playerRole={playerRole}
          mode={token.type === "HERO" ? "hero" : "monster"}
        />
      )}
      {detailed && token.type === "HERO" && (
        <div className="grow">
          <Textarea
            label="Notes"
            characterLimit={300}
            parentValue={token.notes}
            updateHandler={(value) => updateToken({ notes: value })}
          />
        </div>
      )}
      {playerRole === "GM" && (
        <VisibilityToggle
          value={token.gmOnly}
          onClick={() => updateToken({ gmOnly: !token.gmOnly })}
        />
      )}
      {detailed && (
        <div className="flex h-fit shrink-0 items-end">
          <Button
            className="w-full"
            variant={"accentOutline"}
            onClick={() => OBR.popover.close(getPluginId("hero-popover"))}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
