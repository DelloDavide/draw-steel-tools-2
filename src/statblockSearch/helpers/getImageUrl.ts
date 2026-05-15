import { branchName } from "./branchName";

export default function getImageUrl(path: string) {
  return `https://raw.githubusercontent.com/DelloDavide/data-bestiary-json/${branchName}/${path}`;
}