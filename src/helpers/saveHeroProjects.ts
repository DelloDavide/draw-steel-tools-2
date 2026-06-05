import type { DrawSteelProjectBlock } from "../types/DrawSteelZod";
import { supabase } from "../supabaseClient";
import { setTypedDataCache } from "../statblockSearch/helpers/getTypedData";
import { getGitHubApiUrl, getGitHubHeaders, getGitHubFileSha, putGitHubFile, getHeroProjectsPath,  } from "./githubClient";

export async function saveHeroProjectsToGitHub(
  heroName: string,
  projectBlocks: DrawSteelProjectBlock[],
  updatedAt: string,
) {
  const projectBlock = projectBlocks[0];
  if (!projectBlock) return;

  const filePath = getHeroProjectsPath(heroName);
  const apiUrl = getGitHubApiUrl(filePath);
  const headers = getGitHubHeaders();
  const sha = await getGitHubFileSha(apiUrl, headers);

  const allProjects = projectBlocks.flatMap((block) => block.projects);

  await putGitHubFile(
    apiUrl, headers, sha,
    `The Hero ${heroName} Updated Their Projects`,
    { ...projectBlock, projects: allProjects, updated_at: updatedAt },
  );
}

export async function saveHeroProjectsToSupabase(
  heroName: string,
  projectBlocks: DrawSteelProjectBlock[],
  updatedAt: string,
) {
  const path = getHeroProjectsPath(heroName);

  for (const block of projectBlocks) {
    const updated = {
      ...block,
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
}
