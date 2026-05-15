import { branchName } from "./branchName";

export default function getStatblockUrl(path: string) {
  return `https://api.github.com/repos/DelloDavide/data-bestiary-json/contents/${path}?ref=${branchName}`;
}