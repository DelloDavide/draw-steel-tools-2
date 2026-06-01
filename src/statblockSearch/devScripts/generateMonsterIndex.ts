import { DrawSteelStatblockZod } from "../../types/DrawSteelZod";
import {
  IndexBundleZod,
  type IndexBundle,
  type PathBundle,
} from "../../types/monsterDataBundlesZod";
import { supabase } from "../../supabaseClient";

export async function generateIndex() {
  // Get all monster documents from Supabase
  const { data: allDocs, error } = await supabase
    .from("bestiary_documents")
    .select("path, content")
    .like("path", "Monsters/%");

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  // Separate statblocks and features
  const statblockDocs = allDocs.filter(
    (d) => d.path.includes("/Statblocks/") && d.path.endsWith(".json"),
  );
  const featureDocs = allDocs.filter(
    (d) => d.path.includes("/Features/") && d.path.endsWith(".json"),
  );
  const skillDocs = allDocs.filter(
    (d) => d.path.includes("/Skills/") && d.path.endsWith(".json"),
  );

  // Group features and skills by monster family
  const getGroup = (p: string) => {
    const parts = p.split("/");
    return parts.length >= 2 ? `Monsters/${parts[1]}` : "";
  };

  // Build path bundles
  const pathBundles: PathBundle[] = statblockDocs.map((doc) => {
    const group = getGroup(doc.path);
    const malice = featureDocs
      .filter((f) => f.path.startsWith(group + "/"))
      .map((f) => f.path);
    const skills = skillDocs
      .filter((f) => f.path.startsWith(group + "/"))
      .map((f) => f.path);
    return {
      statblock: doc.path,
      features: malice,
      skills,
      images: [],
      projectBlocks: [],
    };
  });

  // Build index bundles with data from content
  const indexBundles: IndexBundle[] = pathBundles.map((pathBundle) => {
    const doc = statblockDocs.find((d) => d.path === pathBundle.statblock)!;
    const parseResult = DrawSteelStatblockZod.safeParse(doc.content);

    if (!parseResult.success) {
      console.error(parseResult.error, "Retrieved data", doc.content);
      throw new Error(`Parsing error for ${pathBundle.statblock}`);
    }

    const json = parseResult.data;
    const rolesString = json.roles.at(0);
    const indexBundle = {
      ...pathBundle,
      name: json.name,
      ev: json.ev,
      roles: rolesString ? rolesString.split(" ") : [],
      ancestry: json.ancestry,
      level: json.level,
    } satisfies IndexBundle;

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

    return IndexBundleZod.parse(indexBundle);
  });

  // Convert the JSON data to a string
  const json = JSON.stringify(indexBundles);

  // Create a new Blob object with the JSON data and set its type
  const blob = new Blob([json], { type: "application/json" });

  // Create a temporary URL for the file
  const url = URL.createObjectURL(blob);

  console.log("Index Generation Done");

  return { href: url, download: "monsterIndex" };
}
