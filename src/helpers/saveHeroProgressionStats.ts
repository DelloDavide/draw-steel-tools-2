import type { DrawSteelStatblock } from "../types/DrawSteelZod";
import { supabase } from "../supabaseClient";
import { setTypedDataCache } from "../statblockSearch/devScriptButtons/helpers/fetchTypedData";
import heroIndex from "../statblockSearch/heroIndex.json";
import {
  getGitHubApiUrl,
  getGitHubFileSha,
  getGitHubHeaders,
  putGitHubFile,
} from "./githubClient";

function getHeroStatblockPath(heroName: string) {
  const hero = heroIndex.find((entry) => entry.name === heroName);
  if (!hero) throw new Error(`Could not find hero statblock for "${heroName}"`);
  return hero.statblock;
}

export async function saveHeroProgressionStats(
  heroName: string,
  statblock: DrawSteelStatblock,
): Promise<void> {
  const path = getHeroStatblockPath(heroName);
  const apiUrl = getGitHubApiUrl(path);
  const headers = getGitHubHeaders();
  const sha = await getGitHubFileSha(apiUrl, headers);

  await putGitHubFile(
    apiUrl,
    headers,
    sha,
    `The Hero ${heroName} Updated Their Victories and Experience Points`,
    statblock,
  );

  const updatedAt = new Date().toISOString();
  const { error } = await supabase
    .from("bestiary_documents")
    .update({ content: statblock, updated_at: updatedAt })
    .eq("path", path);

  if (error) {
    throw new Error(`Supabase write error for "${path}": ${error.message}`);
  }

  setTypedDataCache(path, statblock);
}
