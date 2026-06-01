import { supabase } from "../supabaseClient";
import { setTypedDataCache } from "../statblockSearch/helpers/getTypedData";
import type { DrawSteelProjectBlock } from "../types/DrawSteelZod";

const GITHUB_OWNER = "DelloDavide";
const GITHUB_REPO = "data-bestiary-json";

type GitHubContentResponse = {
  content?: string;
  message?: string;
  sha?: string;
};

function getHeroProjectsPath(heroName: string) {
  return `Heroes/${heroName}/Projects/${heroName} Projects.json`;
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

export async function saveHeroProjectsToGitHub(
  heroName: string,
  projectBlocks: DrawSteelProjectBlock[],
  updatedAt: string,
) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const projectBlock = projectBlocks[0];

  if (!token) {
    throw new Error("Missing GitHub token");
  }

  if (!projectBlock) {
    return;
  }

  const filePath = getHeroProjectsPath(heroName);
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

  const remoteProjectBlock = JSON.parse(
    decodeBase64(fileData.content),
  ) as DrawSteelProjectBlock;
  const localProjects = new Map(
    projectBlocks.flatMap((block) =>
      block.projects.map((project) => [project.name, project] as const),
    ),
  );
  const remoteProjects = Array.isArray(remoteProjectBlock.projects)
    ? remoteProjectBlock.projects
    : [];
  const remoteProjectNames = new Set(remoteProjects.map((project) => project.name));
  const updatedProjects = [
    ...remoteProjects.map((project) => {
      const localProject = localProjects.get(project.name);

      return localProject
        ? {
          ...project,
          progress: localProject.progress,
          last_progress_at: updatedAt,
        }
        : project;
    }),
    ...[...localProjects.values()].filter(
      (project) => !remoteProjectNames.has(project.name),
    ),
  ];
  const updatedProjectBlock: DrawSteelProjectBlock = {
    ...remoteProjectBlock,
    ...projectBlock,
    projects: updatedProjects,
    updated_at: updatedAt,
  };
  const updateRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `The Hero ${heroName} Updated Their Projects`,
      content: encodeBase64(JSON.stringify(updatedProjectBlock, null, 2)),
      sha: fileData.sha,
    }),
  });

  await readGitHubJson(updateRes);
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
