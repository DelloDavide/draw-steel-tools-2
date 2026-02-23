import { branchName } from "./branchName";

export default function getStatblockUrl(path: string) {
  return `https://raw.githubusercontent.com/DelloDavide/data-bestiary-json/${branchName}/${path}`;
}
