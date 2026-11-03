import z from "zod";
import { githubTreeZod } from "../../../types/githubZod";
import getGitTreeUrl from "./getGitTreeUrl";
import getBestiaryUrl from "./getBestiaryUrl";
import {
  DrawSteelDynamicTerrainZod,
  DrawSteelFeatureBlockZod,
  DrawSteelStatblockZod,
} from "../../../types/DrawSteelZod";
import {
  IndexBundleZod,
  type FeatureIndexBundle,
  type IndexBundle,
  type StatblockIndexBundle,
  type TerrainIndexBundle,
} from "../../../types/monsterDataBundlesZod";

function generateId(
  type: "feature" | "statblock" | "terrain",
  name: string,
  discriminator = "",
) {
  const cleanName = name.replaceAll(/[^a-zA-Z0-9]/g, "");
  switch (type) {
    case "feature":
      return `cf-${cleanName}` + discriminator;
    case "statblock":
      return `cs-${cleanName}` + discriminator;
    case "terrain":
      return `ct-${cleanName}` + discriminator;
  }
}

export async function generateIndex() {
  // Get File structure
  const getGithubTree = async (url: string, recursive = false) => {
    const request = await fetch(url + (recursive ? "?recursive=1" : ""));
    const json = await request.json();
    const tree = githubTreeZod.parse(json.tree);
    return tree;
  };
  const rootTree = await getGithubTree(getGitTreeUrl());

  const featurePaths = rootTree
    .filter(
      (val) => val.path.includes("Features/") && val.path.endsWith(".json"),
    )
    .map((val) => val.path);

  const indexBundles: IndexBundle[] = await Promise.all(
    featurePaths.map(async (path) => {
      const response = await fetch(getBestiaryUrl(path));
      const unvalidatedJson = await response.json();
      const parseResult = DrawSteelFeatureBlockZod.safeParse(unvalidatedJson);

      if (!parseResult.success) {
        console.error(parseResult.error, "Retrieved data", unvalidatedJson);
        throw new Error("Parsing error. See above for details.");
      }

      const data = parseResult.data;

      const bundle = {
        id: generateId(
          "feature",
          data.name,
          data.level
            ? data.level.toString()
            : data.featureblock_type === "Ajax Feature"
              ? "Ajax"
              : "",
        ),
        path,
        name: data.name,
        type: "feature",
      } satisfies FeatureIndexBundle;

      return bundle;
    }),
  );

  // Get immediate subdirectories of the monster folder
  const groups = rootTree.filter(
    (item) =>
      item.path.startsWith("Monsters/") && item.path.match(/\//g)?.length === 1,
  );

  // In the order of the subdirectories create bundles of monster statblocks and relevant features
  const pathBundles: {
    statblock: string;
    features: string[];
  }[] = [];
  for (let i = 0; i < groups.length; i++) {
    const malice = rootTree
      .filter(
        (val) =>
          val.path.startsWith(groups[i].path) &&
          val.path.includes("Features/") &&
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
        })),
    );
  }

  // Add data from each monster statblock to index
  indexBundles.push(
    ...(await Promise.all(
      pathBundles.map(async (pathBundle) => {
        // Get
        const response = await fetch(getBestiaryUrl(pathBundle.statblock));
        const unvalidatedJson = await response.json();
        const parseResult = DrawSteelStatblockZod.safeParse(unvalidatedJson); // (await response.json()) as DrawSteelStatblock;

        if (!parseResult.success) {
          console.error(parseResult.error, "Retrieved data", unvalidatedJson);
          throw new Error("Parsing error. See above for details.");
        }

        const data = parseResult.data;

        // Format
        const rolesString = data.roles.at(0);
        const indexBundle = {
          id: generateId("statblock", data.name),
          path: pathBundle.statblock,
          name: data.name,
          type: "statblock",
          level: data.level,
          ev: data.ev,
          roles: rolesString ? rolesString.split(" ") : [],
          ancestry: data.ancestry,
          features: pathBundle.features.map((path) => {
            const featureId = indexBundles.find((val) => val.path === path)?.id;
            if (!featureId)
              throw new Error("Could not find feature with path: " + path);
            return featureId;
          }),
        } satisfies StatblockIndexBundle;

        if (indexBundle.name.includes("Rival")) {
          indexBundle.id =
            `cs-${data.name.replaceAll(/[^a-zA-Z0-9]/g, "")}` + data.level;
        }

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
    )),
  );

  const terrainPaths = rootTree
    .filter(
      (val) =>
        val.path.includes("Dynamic Terrain/") && val.path.endsWith(".json"),
    )
    .map((val) => val.path);

  indexBundles.push(
    ...(await Promise.all(
      terrainPaths.map(async (path) => {
        const response = await fetch(getBestiaryUrl(path));
        const unvalidatedJson = await response.json();
        const parseResult =
          DrawSteelDynamicTerrainZod.safeParse(unvalidatedJson);

        if (!parseResult.success) {
          console.error(parseResult.error, "Retrieved data", unvalidatedJson);
          throw new Error("Parsing error. See above for details.");
        }

        const data = parseResult.data;

        const bundle = {
          id: generateId("terrain", data.name),
          path,
          name: data.name,
          type: "terrain",
          level: data.level,
          ev: data.ev,
          roles: data.featureblock_type
            ? data.featureblock_type.split(" ")
            : [],
        } satisfies TerrainIndexBundle;

        return bundle;
      }),
    )),
  );

  console.log(z.array(IndexBundleZod).parse(indexBundles));

  console.log(
    "No duplicate IDs:",
    indexBundles.length === new Set(indexBundles.map((val) => val.id)).size,
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
