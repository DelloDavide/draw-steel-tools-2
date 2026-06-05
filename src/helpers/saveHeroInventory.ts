import type { DrawSteelInventoryBlock } from "../types/DrawSteelZod";
import { supabase } from "../supabaseClient";
import { setTypedDataCache } from "../statblockSearch/helpers/getTypedData";
import { getGitHubApiUrl, getGitHubHeaders, getGitHubFileSha, putGitHubFile, getHeroInventoryPath } from "./githubClient";

export async function saveInventoryToGitHub(
  heroName: string,
  inventoryBlock: DrawSteelInventoryBlock,
  updatedAt: string,
): Promise<void> {
  const filePath = getHeroInventoryPath(heroName);
  const apiUrl = getGitHubApiUrl(filePath);
  const headers = getGitHubHeaders();
  const sha = await getGitHubFileSha(apiUrl, headers);

  await putGitHubFile(
    apiUrl, headers, sha,
    `The Hero ${heroName} Updated Their Inventory (${inventoryBlock.name})`,
    { ...inventoryBlock, updated_at: updatedAt },
  );
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
