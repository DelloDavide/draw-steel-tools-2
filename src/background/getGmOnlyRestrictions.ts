import type { MinionGroup } from "../types/minionGroup";
import { minionGroupIsNot } from "./contextMenuFilters";

export function getGmOnlyRestrictions(minionGroups: MinionGroup[]) {
  return minionGroups
    .filter((group) => group.gmOnly || group.gmOnly === undefined)
    .map((group) => minionGroupIsNot(group.id));
}
