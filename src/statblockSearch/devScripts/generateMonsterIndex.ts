import type { DrawSteelStatblock } from "../../types/DrawSteelZod";
import { githubTreeZod } from "../../types/githubZod";
import {
  IndexBundleZod,
  type IndexBundle,
  type PathBundle,
} from "../../types/monsterDataBundlesZod";
import getGitTreeUrl from "../helpers/getGitTreeUrl";
import getStatblockUrl from "../helpers/getStatblockUrl";

export async function generateIndex() {
  // Get File structure
  const getGithubTree = async (url: string, recursive = false) => {
    const request = await fetch(url + (recursive ? "?recursive=1" : ""));
    const json = await request.json();
    const tree = githubTreeZod.parse(json.tree);
    return tree;
  };
  const rootTree = await getGithubTree(getGitTreeUrl());

  // Get immediate subdirectories of the monster folder
  const groups = rootTree.filter(
    (item) =>
      item.path.startsWith("Monsters/") && item.path.match(/\//g)?.length === 1,
  );

  // In the order of the subdirectories create bundles of monster statblocks and relevant features
  const pathBundles: PathBundle[] = [];
  for (let i = 0; i < groups.length; i++) {
    const malice = rootTree
      .filter(
        (val) =>
          val.path.startsWith(groups[i].path) &&
          val.path.includes("Features/") &&
          val.path.endsWith(".json"),
      )
      .map((val) => val.path);

    const skills = rootTree
      .filter(
        (val) =>
          val.path.startsWith(groups[i].path) &&
          val.path.includes("Skills/") &&
          val.path.endsWith(".json"),
      )
      .map((val) => val.path);

    pathBundles.push(
      ...rootTree
        .filter(
          (val) =>
            val.path.startsWith(groups[i].path) &&
            val.path.includes("Statblocks/") &&
            val.path.endsWith(".json"),
        )
        .map((val) => ({
          statblock: val.path,
          features: malice,
          skills,
        })),
    );
  }

  // Add data from each monster statblock to index
  const indexBundles: IndexBundle[] = await Promise.all(
    pathBundles.map(async (pathBundle) => {
      // Get
      const response = await fetch(getStatblockUrl(pathBundle.statblock));
      const json = (await response.json()) as DrawSteelStatblock;

      // Format
      const indexBundle = {
        ...pathBundle,
        name: json.name,
        ev: json.ev,
        roles: json.roles[0].split(" "),
        ancestry: json.ancestry,
        level: json.level,
      };

      // Special handling for dragons
      if (pathBundle.statblock.startsWith("Monsters/Dragons/Statblocks/")) {
        indexBundle.features = indexBundle.features.filter((feature) =>
          feature.includes(indexBundle.name),
        );
      }

      // Special handling for hobgoblins and bugbears
      if (
        pathBundle.statblock.startsWith("Monsters/Hobgoblins/Statblocks/") ||
        pathBundle.statblock.startsWith("Monsters/Bugbears/Statblocks/")
      ) {
        indexBundle.features = [
          ...indexBundle.features,
          "Monsters/Goblins/Features/Goblin Malice.json",
        ];
      }

      // Special handling for tiered malice
      if (
        pathBundle.statblock.startsWith("Monsters/Demons/Statblocks/") ||
        pathBundle.statblock.startsWith("Monsters/Undead/Statblocks/") ||
        pathBundle.statblock.startsWith("Monsters/War Dogs/Statblocks/")
      ) {
        const firstNumber = (str: string) => {
          return parseFloat(str.substring(str.search(/\d/)));
        };
        indexBundle.features = [...indexBundle.features]
          .filter((path) => firstNumber(path) <= indexBundle.level)
          .sort((a, b) => firstNumber(a) - firstNumber(b));
      }

      // Special handling for rivals
      if (
        pathBundle.statblock.startsWith("Monsters/Rivals") &&
        pathBundle.statblock.includes("/Statblocks/")
      ) {
        indexBundle.name = `Level ${indexBundle.level} ${indexBundle.name}`;
      }

      // Validate
      return IndexBundleZod.parse(indexBundle);
    }),
  );

  // Convert the JSON data to a string
  const json = JSON.stringify(indexBundles);

  // Create a new Blob object with the JSON data and set its type
  const blob = new Blob([json], { type: "application/json" });

  // Create a temporary URL for the file
  const url = URL.createObjectURL(blob);

  console.log("Index Generation Done");

  return { href: url, download: "monsterIndex" };
}
