import type { DrawSteelSkillBlock } from "../types/DrawSteelZod";
import { supabase } from "../supabaseClient";
import { setTypedDataCache } from "../statblockSearch/helpers/getTypedData";
import { getGitHubApiUrl, getGitHubHeaders, getGitHubFileSha, putGitHubFile, getHeroSkillsPath } from "./githubClient";

export async function saveSkillsToGitHub(
  heroName: string,
  skillBlock: DrawSteelSkillBlock,
  updatedAt: string,
): Promise<void> {
  const filePath = getHeroSkillsPath(heroName);
  const apiUrl = getGitHubApiUrl(filePath);
  const headers = getGitHubHeaders();
  const sha = await getGitHubFileSha(apiUrl, headers);

  await putGitHubFile(
    apiUrl, headers, sha,
    `The Hero ${heroName} Updated Their Skills (${skillBlock.name})`,
    { ...skillBlock, updated_at: updatedAt },
  );
}

export async function saveSkillsToSupabase(
  heroName: string,
  skillBlock: DrawSteelSkillBlock,
  updatedAt: string,
): Promise<void> {
  const path = getHeroSkillsPath(heroName);

  const updated: DrawSteelSkillBlock = {
    ...skillBlock,
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
