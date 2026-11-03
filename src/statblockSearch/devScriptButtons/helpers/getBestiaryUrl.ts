import { branchName } from "./branchName";

export default function getBestiaryUrl(path: string) {
  return `https://raw.githubusercontent.com/SeamusFinlayson/data-bestiary-json/${branchName}/${path}`;
}
