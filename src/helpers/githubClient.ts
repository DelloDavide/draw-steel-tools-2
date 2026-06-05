const GITHUB_OWNER = "DelloDavide";
const GITHUB_REPO = "data-bestiary-json";

export type GitHubContentResponse = {
  content?: string;
  message?: string;
  sha?: string;
};

export function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function readGitHubJson(response: Response) {
  const json = (await response.json()) as GitHubContentResponse;
  if (!response.ok) {
    throw new Error(json.message ?? `GitHub request failed: ${response.status}`);
  }
  return json;
}

export function getGitHubApiUrl(filePath: string) {
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURI(filePath)}`;
}

export function getGitHubHeaders() {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error("Missing GitHub token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };
}

export async function getGitHubFileSha(apiUrl: string, headers: Record<string, string>) {
  const getRes = await fetch(apiUrl, { headers });
  const fileData = await readGitHubJson(getRes);
  if (!fileData.sha) throw new Error(`GitHub file sha missing for "${apiUrl}"`);
  return fileData.sha;
}

export async function putGitHubFile(
  apiUrl: string,
  headers: Record<string, string>,
  sha: string,
  message: string,
  content: unknown,
) {
  const updateRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message,
      content: encodeBase64(JSON.stringify(content, null, 2)),
      sha,
    }),
  });
  await readGitHubJson(updateRes);
}

export function getHeroInventoryPath(heroName: string) {
  return `Heroes/${heroName}/Inventory/${heroName} Inventory.json`;
}

export function getHeroSkillsPath(heroName: string) {
  return `Heroes/${heroName}/Skills/${heroName} Skills.json`;
}

export function getHeroProjectsPath(heroName: string) {
  return `Heroes/${heroName}/Projects/${heroName} Projects.json`;
}
