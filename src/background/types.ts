import type { Item } from "@owlbear-rodeo/sdk";
import type { DefinedCharacterTokenData } from "../types/tokenDataZod";
import type { TokenCounts } from "../helpers/getMinionTokenCounts";
import type { MinionGroup } from "../types/minionGroup";
import type { DefinedSettings } from "../types/settingsZod";

export type PreviousItemData = { item: Item; data: DefinedCharacterTokenData };

export type AttachmentLog =
  | { item: Item; data: DefinedCharacterTokenData; attachmentIds: string[] }
  | undefined;
export type AttachmentLogs = Record<string, AttachmentLog>;

export type ObrState = {
  items: Item[];
  playerRole: "PLAYER" | "GM";
  minionGroups: MinionGroup[];
  minionTokenCounts: TokenCounts;
  settings: DefinedSettings;
  attachmentLogs: AttachmentLogs;
  sceneDpi: number;
  themeMode: "DARK" | "LIGHT";
};

export type Catagory =
  | "UNTRACKED"
  | "UNCHANGED"
  | "ADD"
  | "REMOVE"
  | "REFRESH"
  | "UPDATE";

export type UpdateBundle =
  | {
      type: "ADD";
      item: Item;
      data: DefinedCharacterTokenData;
    }
  | {
      type: "REFRESH";
      item: Item;
      data: DefinedCharacterTokenData;
      prev: PreviousItemData;
    }
  | {
      type: "UPDATE";
      item: Item;
      data: DefinedCharacterTokenData;
      prev: PreviousItemData;
    }
  | {
      type: "UNCHANGED";
      item: Item;
      data: DefinedCharacterTokenData;
      prev: PreviousItemData;
    }
  | {
      type: "UNTRACKED";
      item: Item;
    }
  | {
      type: "REMOVE";
      item: Item;
    };

export type ChangedData = {
  items?: Item[];
  minions?: boolean;
  role?: boolean;
  settings?: boolean;
};
