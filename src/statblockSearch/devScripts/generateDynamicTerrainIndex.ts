import { DrawSteelDynamicTerrainZod } from "../../types/DrawSteelZod";
import {
  DynamicTerrainIndexBundleZod,
  type DynamicTerrainIndexBundle,
} from "../../types/dynamicTerrainDataBundlesZod";
import { supabase } from "../../supabaseClient";

export async function generateDynamicTerrainIndex() {
  const { data: allDocs, error } = await supabase
    .from("bestiary_documents")
    .select("path, content")
    .like("path", "Dynamic Terrain/%");

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  const terrainDocs = allDocs.filter(
    (doc) => doc.path.endsWith(".json") && !doc.path.includes("/Features/"),
  );

  const indexBundles: DynamicTerrainIndexBundle[] = terrainDocs.map((doc) => {
    const parseResult = DrawSteelDynamicTerrainZod.safeParse(doc.content);

    if (!parseResult.success) {
      console.error(parseResult.error, "Retrieved data", doc.content);
      throw new Error(`Parsing error for ${doc.path}`);
    }

    const json = parseResult.data;
    const category = doc.path.split("/")[1] ?? "";

    const indexBundle = {
      statblock: doc.path,
      features: [],
      skills: [],
      images: [],
      projectBlocks: [],
      name: json.name,
      ev: json.ev,
      roles: json.featureblock_type.split(" "),
      ancestry: [category],
      level: json.level,
    } satisfies DynamicTerrainIndexBundle;

    return DynamicTerrainIndexBundleZod.parse(indexBundle);
  });

  indexBundles.sort((a, b) => a.name.localeCompare(b.name));

  const json = JSON.stringify(indexBundles, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  console.log(`Dynamic Terrain Index Generation Done (${indexBundles.length} entries)`);

  return { href: url, download: "dynamicTerrainIndex" };
}
