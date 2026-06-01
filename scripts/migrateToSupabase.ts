/**
 * Script di migrazione: carica tutti i JSON dal repo GitHub data-bestiary-json
 * nella tabella Supabase `bestiary_documents` e le immagini nel bucket `hero-images`.
 *
 * Uso: npx tsx scripts/migrateToSupabase.ts
 *
 * Richiede le variabili d'ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 * (leggere dal file .env nella root del progetto).
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leggi .env manualmente (no dipendenza dotenv)
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
  console.error("Mancano VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY nel .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const GITHUB_OWNER = "DelloDavide";
const GITHUB_REPO = "data-bestiary-json";
const GITHUB_BRANCH = "main";
const GITHUB_TOKEN = env.VITE_GITHUB_TOKEN;

async function githubFetch(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${url}`);
  }
  return res.json();
}

async function getGitHubTree(): Promise<
  Array<{ path: string; type: string; size?: number }>
> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
  const data = await githubFetch(url);
  return data.tree;
}

async function getFileContent(filePath: string): Promise<unknown> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(filePath)}?ref=${GITHUB_BRANCH}`;
  const data = await githubFetch(url);
  const decoded = JSON.parse(
    decodeURIComponent(escape(atob(data.content.replace(/\n/g, "")))),
  );
  return decoded;
}

async function getRawFile(filePath: string): Promise<ArrayBuffer> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Raw fetch error ${res.status}: ${url}`);
  return res.arrayBuffer();
}

function inferType(content: any): string {
  return content?.type ?? "unknown";
}

function inferName(content: any, filePath: string): string {
  if (content?.name) return content.name;
  const base = path.basename(filePath, ".json");
  return base;
}

async function migrateJsonFiles(
  tree: Array<{ path: string; type: string }>,
) {
  const jsonFiles = tree.filter(
    (item) =>
      item.type === "blob" &&
      item.path.endsWith(".json") &&
      !item.path.startsWith(".") &&
      (item.path.startsWith("Monsters/") ||
        item.path.startsWith("Heroes/") ||
        item.path.startsWith("Dynamic Terrain/")),
  );

  console.log(`Trovati ${jsonFiles.length} file JSON da migrare...`);

  let success = 0;
  let errors = 0;

  // Processa in batch di 5 per evitare rate limit GitHub
  for (let i = 0; i < jsonFiles.length; i += 5) {
    const batch = jsonFiles.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map(async (file) => {
        try {
          const content = await getFileContent(file.path);
          const type = inferType(content);
          const name = inferName(content, file.path);

          const { error } = await supabase
            .from("bestiary_documents")
            .upsert(
              {
                path: file.path,
                type,
                name,
                content,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "path" },
            );

          if (error) {
            console.error(`  ERRORE Supabase per ${file.path}:`, error.message);
            return false;
          }
          return true;
        } catch (err: any) {
          console.error(`  ERRORE per ${file.path}:`, err.message);
          return false;
        }
      }),
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) success++;
      else errors++;
    }

    console.log(`  Progresso: ${i + batch.length}/${jsonFiles.length}`);

    // Pausa tra batch per rate-limit GitHub
    if (i + 5 < jsonFiles.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(
    `\nMigrazione JSON completata: ${success} successi, ${errors} errori`,
  );
}

async function migrateImages(
  tree: Array<{ path: string; type: string }>,
) {
  const imageFiles = tree.filter(
    (item) =>
      item.type === "blob" &&
      item.path.startsWith("Heroes/") &&
      item.path.includes("/Images/") &&
      /\.(jpe?g|png|webp|gif)$/i.test(item.path),
  );

  console.log(`\nTrovate ${imageFiles.length} immagini da migrare...`);

  let success = 0;
  let errors = 0;

  for (const file of imageFiles) {
    try {
      const buffer = await getRawFile(file.path);
      const ext = path.extname(file.path).toLowerCase();
      const contentType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "image/jpeg";

      const { error } = await supabase.storage
        .from("hero-images")
        .upload(file.path, buffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error(`  ERRORE upload ${file.path}:`, error.message);
        errors++;
      } else {
        success++;
      }
    } catch (err: any) {
      console.error(`  ERRORE per ${file.path}:`, err.message);
      errors++;
    }

    // Piccola pausa
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(
    `Migrazione immagini completata: ${success} successi, ${errors} errori`,
  );
}

async function main() {
  console.log("=== Migrazione Data Bestiary → Supabase ===\n");

  console.log("Recupero struttura repo da GitHub...");
  const tree = await getGitHubTree();
  console.log(`Struttura repo: ${tree.length} entries totali\n`);

  await migrateJsonFiles(tree);
  await migrateImages(tree);

  console.log("\n=== Migrazione completata! ===");
}

main().catch((err) => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
