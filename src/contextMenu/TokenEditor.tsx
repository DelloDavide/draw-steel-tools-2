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
    <div className="text-foreground space-y-2 p-2">
      {definedSettings.nameTagsEnabled && (
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
      {playerRole === "GM" && (
        <VisibilityToggle
          value={token.gmOnly}
          onClick={() => updateToken({ gmOnly: !token.gmOnly })}
        />
      )}
    </div>
  );
}
