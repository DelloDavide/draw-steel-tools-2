import { supabase } from "../supabaseClient";
import { setTypedDataCache } from "../statblockSearch/helpers/getTypedData";
import type { DrawSteelSkillBlock } from "../types/DrawSteelZod";

const GITHUB_OWNER = "DelloDavide";
const GITHUB_REPO = "data-bestiary-json";

type GitHubContentResponse = {
  content?: string;
  message?: string;
  sha?: string;
};

function getHeroSkillsPath(heroName: string) {
  return `Heroes/${heroName}/Skills/${heroName} Skills.json`;
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

export async function saveSkillsToGitHub(
  heroName: string,
  skillBlock: DrawSteelSkillBlock,
  updatedAt: string,
): Promise<void> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    throw new Error("Missing GitHub token");
  }

  const filePath = getHeroSkillsPath(heroName);
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

  const remoteSkillBlock = JSON.parse(
    decodeBase64(fileData.content),
  ) as DrawSteelSkillBlock;

  // ── categories merge ─────────────────────────────────────────────────────
  // Local wins per category (by name). Remote-only categories are preserved.
  // New local categories are appended.
  const localCategoryMap = new Map(
    skillBlock.categories.map((cat) => [cat.category, cat] as const),
  );
  const remoteCategories = Array.isArray(remoteSkillBlock.categories)
    ? remoteSkillBlock.categories
    : [];
  const remoteCategoryNames = new Set(remoteCategories.map((cat) => cat.category));
  const updatedCategories = [
    ...remoteCategories.map(
      (cat) => localCategoryMap.get(cat.category) ?? cat,
    ),
    ...[...localCategoryMap.values()].filter(
      (cat) => !remoteCategoryNames.has(cat.category),
    ),
  ];

  // ── languages merge ──────────────────────────────────────────────────────
  const localLanguageMap = new Map(
    skillBlock.languages.map((lang) => [lang.name, lang] as const),
  );
  const remoteLanguages = Array.isArray(remoteSkillBlock.languages)
    ? remoteSkillBlock.languages
    : [];
  const remoteLanguageNames = new Set(remoteLanguages.map((lang) => lang.name));
  const updatedLanguages = [
    ...remoteLanguages.map(
      (lang) => localLanguageMap.get(lang.name) ?? lang,
    ),
    ...[...localLanguageMap.values()].filter(
      (lang) => !remoteLanguageNames.has(lang.name),
    ),
  ];

  const updatedSkillBlock: DrawSteelSkillBlock = {
    ...remoteSkillBlock,
    ...skillBlock,
    categories: updatedCategories,
    languages: updatedLanguages,
    updated_at: updatedAt,
  };

  const updateRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `The Hero ${heroName} Updated Their Skills (${skillBlock.name})`,
      content: encodeBase64(JSON.stringify(updatedSkillBlock, null, 2)),
      sha: fileData.sha,
    }),
  });

  await readGitHubJson(updateRes);
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
