import { branchName } from "./branchName";

export default function getGitTreeUrl() {
  return `https://api.github.com/repos/SeamusFinlayson/data-bestiary-json/git/trees/${branchName}?recursive=1`;
}
