import { supabase } from "../supabaseClient";
import { setTypedDataCache } from "../statblockSearch/helpers/getTypedData";
import type { DrawSteelInventoryBlock } from "../types/DrawSteelZod";

const GITHUB_OWNER = "DelloDavide";
const GITHUB_REPO = "data-bestiary-json";

type GitHubContentResponse = {
  content?: string;
  message?: string;
  sha?: string;
};

function getHeroInventoryPath(heroName: string) {
  return `Heroes/${heroName}/Inventory/${heroName} Inventory.json`;
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function decodeBase64(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

async function readGitHubJson(response: Response) {
  const json = (await response.json()) as GitHubContentResponse;

  if (!response.ok) {
    throw new Error(json.message ?? `GitHub request failed: ${response.status}`);
  }

  return json;
}

export async function saveInventoryToGitHub(
  heroName: string,
  inventoryBlock: DrawSteelInventoryBlock,
  updatedAt: string,
): Promise<void> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    throw new Error("Missing GitHub token");
  }

  const filePath = getHeroInventoryPath(heroName);
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(filePath)}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  const getRes = await fetch(apiUrl, { headers });
  const fileData = await readGitHubJson(getRes);

  if (!fileData.content || !fileData.sha) {
    throw new Error(`GitHub file data is incomplete for "${filePath}"`);
  }

  const remoteInventoryBlock = JSON.parse(
    decodeBase64(fileData.content),
  ) as DrawSteelInventoryBlock;

  // ── inventory merge ──────────────────────────────────────────────────────
  // Local items win (all fields). Remote-only items are preserved.
  // New local items (not in remote) are appended.
  const localInventoryMap = new Map(
    inventoryBlock.inventory.map((item) => [item.name, item] as const),
  );
  const remoteInventory = Array.isArray(remoteInventoryBlock.inventory)
    ? remoteInventoryBlock.inventory
    : [];
  const remoteInventoryNames = new Set(remoteInventory.map((item) => item.name));
  const updatedInventory = [
    ...remoteInventory.map((item) => localInventoryMap.get(item.name) ?? item),
    ...[...localInventoryMap.values()].filter(
      (item) => !remoteInventoryNames.has(item.name),
    ),
  ];

  // ── equipment merge ──────────────────────────────────────────────────────
  const localEquipmentMap = new Map(
    inventoryBlock.equipment.map((item) => [item.name, item] as const),
  );
  const remoteEquipment = Array.isArray(remoteInventoryBlock.equipment)
    ? remoteInventoryBlock.equipment
    : [];
  const remoteEquipmentNames = new Set(remoteEquipment.map((item) => item.name));
  const updatedEquipment = [
    ...remoteEquipment.map((item) => localEquipmentMap.get(item.name) ?? item),
    ...[...localEquipmentMap.values()].filter(
      (item) => !remoteEquipmentNames.has(item.name),
    ),
  ];

  const updatedInventoryBlock: DrawSteelInventoryBlock = {
    ...remoteInventoryBlock,
    ...inventoryBlock,
    inventory: updatedInventory,
    equipment: updatedEquipment,
    updated_at: updatedAt,
  };

  const updateRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `The Hero ${heroName} Updated Their Inventory (${inventoryBlock.name})`,
      content: encodeBase64(JSON.stringify(updatedInventoryBlock, null, 2)),
      sha: fileData.sha,
    }),
  });

  await readGitHubJson(updateRes);
}

export async function saveInventoryToSupabase(
  heroName: string,
  inventoryBlock: DrawSteelInventoryBlock,
  updatedAt: string,
): Promise<void> {
  const path = getHeroInventoryPath(heroName);

  const updated: DrawSteelInventoryBlock = {
    ...inventoryBlock,
    updated_at: updatedAt,
  };

  const { error } = await supabase
    .from("bestiary_documents")
    .update({
      content: updated,
      updated_at: updatedAt,
    })
    .eq("path", path);

  if (error) {
    throw new Error(`Supabase write error for "${path}": ${error.message}`);
  }

  setTypedDataCache(path, updated);
}
