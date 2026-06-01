/**
 * Generates src/statblockSearch/dynamicTerrainIndex.json from Supabase.
 * Uso: npx tsx scripts/writeDynamicTerrainIndex.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  env[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const DrawSteelFeatureZod = z.object({
  name: z.string(),
  type: z.literal("feature"),
  feature_type: z.string(),
  icon: z.string(),
  effects: z.array(z.record(z.string(), z.unknown())),
});

const DrawSteelDynamicTerrainZod = z.object({
  type: z.literal("dynamicterrain"),
  featureblock_type: z.string(),
  name: z.string(),
  level: z.number(),
  ev: z.string(),
  flavor: z.string(),
  stamina: z.string(),
  size: z.string(),
  stats: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .optional(),
  features: z.array(DrawSteelFeatureZod),
});

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: allDocs, error } = await supabase
  .from("bestiary_documents")
  .select("path, content")
  .like("path", "Dynamic Terrain/%");

if (error) {
  console.error("Supabase error:", error.message);
  process.exit(1);
}

const terrainDocs = allDocs.filter(
  (doc) => doc.path.endsWith(".json") && !doc.path.includes("/Features/"),
);

const indexBundles = terrainDocs
  .map((doc) => {
    const parseResult = DrawSteelDynamicTerrainZod.safeParse(doc.content);
    if (!parseResult.success) {
      console.error(`Parsing error for ${doc.path}`, parseResult.error.message);
      return null;
    }
    const json = parseResult.data;
    const category = doc.path.split("/")[1] ?? "";
    return {
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
    };
  })
  .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
  .sort((a, b) => a.name.localeCompare(b.name));

const outputPath = path.resolve(
  __dirname,
  "../src/statblockSearch/dynamicTerrainIndex.json",
);
fs.writeFileSync(outputPath, JSON.stringify(indexBundles, null, 2) + "\n");
console.log(`Wrote ${indexBundles.length} entries to ${outputPath}`);
