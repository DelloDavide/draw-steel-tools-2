/**
 * Smoke test: verifica che il DB Supabase sia popolato e raggiungibile.
 * Uso: npx tsx scripts/smokeTestSupabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  env[t.slice(0, i)] = t.slice(i + 1);
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("=== Supabase smoke test ===");
  console.log(`URL: ${env.VITE_SUPABASE_URL}`);

  // 1. Conta documenti
  const { count, error: countError } = await supabase
    .from("bestiary_documents")
    .select("*", { count: "exact", head: true });
  if (countError) throw countError;
  console.log(`bestiary_documents totali: ${count}`);

  // 2. Group by type
  const { data: types, error: typesError } = await supabase
    .from("bestiary_documents")
    .select("type")
    .limit(2000);
  if (typesError) throw typesError;
  const counts: Record<string, number> = {};
  for (const r of types ?? []) counts[r.type] = (counts[r.type] ?? 0) + 1;
  console.log("Distribuzione per type:", counts);

  // 3. Sample fetch di uno statblock hero
  const { data: heroSample, error: heroErr } = await supabase
    .from("bestiary_documents")
    .select("path, name, type")
    .like("path", "Heroes/%/%.json")
    .limit(3);
  if (heroErr) throw heroErr;
  console.log("Sample hero paths:", heroSample);

  // 4. Sample fetch di uno statblock monster
  const { data: monsterSample, error: monErr } = await supabase
    .from("bestiary_documents")
    .select("path, name, type")
    .like("path", "Monsters/%")
    .limit(3);
  if (monErr) throw monErr;
  console.log("Sample monster paths:", monsterSample);

  // 5. Fetch del content di uno (verifica JSONB integrity)
  if (heroSample && heroSample.length > 0) {
    const { data: full, error: fullErr } = await supabase
      .from("bestiary_documents")
      .select("path, content")
      .eq("path", heroSample[0].path)
      .single();
    if (fullErr) throw fullErr;
    const keys = Object.keys((full!.content as Record<string, unknown>) ?? {});
    console.log(
      `Content keys for "${full!.path}":`,
      keys.slice(0, 8).join(", "),
      keys.length > 8 ? `... (+${keys.length - 8} more)` : "",
    );
  }

  // 6. Test storage bucket hero-images
  const { data: files, error: storageErr } = await supabase.storage
    .from("hero-images")
    .list("Heroes", { limit: 5 });
  if (storageErr) {
    console.warn("Storage list warn:", storageErr.message);
  } else {
    console.log(
      `hero-images bucket sample:`,
      files?.map((f) => f.name).slice(0, 5),
    );
  }

  console.log("\n=== OK ===");
}

main().catch((e) => {
  console.error("Smoke test FALLITO:", e);
  process.exit(1);
});
