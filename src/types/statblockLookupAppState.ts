import type { IndexBundle } from "./monsterDataBundlesZod";
import { defaultSearchData, type SearchData } from "./statblockSearchData";

export type SetupOptions =
  | {
      type: "BASIC";
      stamina: { enabled: boolean; value: number };
      name: { enabled: boolean; value: string; nameTag: boolean };
    }
  | {
      type: "MINION";
      stamina: { value: number };
      groupName: { value: string; nameTags: boolean };
    };

export type AppState = {
  search: SearchData;
  monsterViewerOpen: boolean;
  previewIndexBundle: IndexBundle | undefined;
  selectedIndexBundle: IndexBundle | "NONE" | undefined;
  setupOptions: SetupOptions | undefined;
};

export const defaultAppState: AppState = {
  search: defaultSearchData,
  monsterViewerOpen: false,
  previewIndexBundle: undefined,
  selectedIndexBundle: undefined,
  setupOptions: undefined,
};
