import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

export async function openStatblockSearch(args?: {
  organization?: "CREATURE" | "MINION" | "TERRAIN";
  groupId?: string;
  type?: "hero";
}) {
  const organization = args?.organization;
  const groupId = args?.groupId;

  const origin = window.origin;
  const url = new URL("/statblockSearch", origin);

  url.searchParams.set("themeMode", (await OBR.theme.getTheme()).mode);
  if (organization) url.searchParams.set("organization", organization);
  if (groupId) url.searchParams.set("groupId", groupId);
  if (args?.type) url.searchParams.set("type", args.type);

  await OBR.popover.open({
    id: getPluginId("statblockSearch"),
    url: url.toString(),
    height: 1000,
    width: 800,
    anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
    transformOrigin: { horizontal: "CENTER", vertical: "CENTER" },
  });
}
