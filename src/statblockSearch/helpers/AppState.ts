import { setDifference } from "../../helpers/setDifference";
import type { IndexBundle } from "../../types/monsterDataBundlesZod";

export type MonsterSetupOptions = {
  type: "MONSTER";
  stamina: { enabled: boolean; value: number };
  name: { enabled: boolean; value: string; nameTag: boolean };
  gmOnly: { value: boolean };
};
export type HeroSetupOptions = {
  type: "HERO";
  stamina: { enabled: boolean; value: number };
  name: { enabled: boolean; value: string; nameTag: boolean };
  gmOnly: { value: boolean };
};
export type MinionSetupOptions = {
  type: "MINION";
  stamina: { value: number };
  groupName: { value: string; nameTags: boolean };
  gmOnly: { value: boolean };
};
export type TerrainSetupOptions = {
  type: "TERRAIN";
  stamina: { enabled: boolean; value: number };
  name: { enabled: boolean; value: string; nameTag: boolean };
  gmOnly: { value: boolean };
};

export type SetupOptions =
  | HeroSetupOptions
  | MonsterSetupOptions
  | MinionSetupOptions
  | TerrainSetupOptions;

export type SearchData = {
  value: string;
  filtersOpen: boolean;
  organizations: string[];
  roles: string[];
  keywords: string[];
  levelRange: number[];
  evRange: number[];
};

const defaultSearchData = {
  value: "",
  filtersOpen: false,
  organizations: [],
  roles: [],
  keywords: [],
  levelRange: [1, 11],
  evRange: [0, 156],
};

export type AppState = {
  search: SearchData;
  monsterViewerOpen: boolean;
  previewIndexBundle: IndexBundle | undefined;
  selectedIndexBundle: IndexBundle | "NONE" | undefined;
  setupOptions: SetupOptions | undefined;
};

const defaultAppState: AppState = {
  search: defaultSearchData,
  monsterViewerOpen: false,
  previewIndexBundle: undefined,
  selectedIndexBundle: undefined,
  setupOptions: undefined,
};

function getOrganizations() {
  const params = new URLSearchParams(document.location.search);
  const organizationCatagory = params.get("organization");

  let organizations: string[] = [];
  if (organizationCatagory === "MINION") {
    organizations = ["Minion"];
  } else if (organizationCatagory === "TERRAIN") {
    organizations = ["Terrain"];
  } else if (organizationCatagory === "CREATURE") {
    organizations = ["Minion", "Horde", "Platoon", "Elite", "Leader", "Solo"];
  }
  return organizations;
}

export function getDefaultSearchData(): SearchData {
  return { ...defaultSearchData, organizations: getOrganizations() };
}

export function getDefaulAppState(): AppState {
  return { ...defaultAppState, search: getDefaultSearchData() };
}

export function checkFiltersApplied(searchData: SearchData) {
  const defaultOrganizations = getOrganizations();
  const symetricalDiffernece = [
    ...setDifference(defaultOrganizations, searchData.organizations),
    ...setDifference(searchData.organizations, defaultOrganizations),
  ];
  const organizationsApplied = symetricalDiffernece.length !== 0;

  return (
    organizationsApplied ||
    searchData.roles.length > 0 ||
    searchData.keywords.length > 0 ||
    !(
      searchData.levelRange.includes(1) && searchData.levelRange.includes(11)
    ) ||
    !(searchData.evRange.includes(0) && searchData.evRange.includes(156))
  );
}
