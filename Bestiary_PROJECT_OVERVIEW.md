# Draw Steel Plugin Bestiary — Documentazione tecnica per agenti AI

> Briefing per agenti che dovranno lavorare su questo repository di **dati**. Companion del documento [Plugin_PROJECT_OVERVIEW.md](Plugin_PROJECT_OVERVIEW.md), che descrive il plugin Owlbear Rodeo che consuma questi dati.

---

## 1. Cos'è questo repository

Questo repository è la **sorgente dati JSON** consumata dal plugin Owlbear Rodeo **Draw Steel Tools 2** (vedi [Plugin_PROJECT_OVERVIEW.md](Plugin_PROJECT_OVERVIEW.md)). Contiene:

- **Statblock** di mostri ufficiali del Monsters Book di Draw Steel (MCDM).
- **Statblock di eroi** della campagna del proprietario (`DelloDavide`), comprensivi di feature, skill, immagini e progetti di downtime.
- **Dynamic Terrain**: schede di terreno dinamico (hazard, fieldworks, mechanisms, power fixtures, siege engines, supernatural objects).
- **Malice features** raggruppate per famiglia di mostri.

Il repo è una **fork/estensione** dell'upstream `SeamusFinlayson/data-bestiary-json` (vedi `README.md`). Pubblica i dati come **JSON statici raw** raggiungibili via GitHub Contents/Tree API; il plugin li scarica a runtime tramite gli helper `getStatblockUrl` / `getHeroDataBundle` / `getMonsterDataBundle`.

> ⚠️ Questo repo **non contiene codice applicativo**: solo dati JSON + un workflow CI che impacchetta tutto in una release GitHub.

---

## 2. Stack e tooling

| Ambito | Tecnologia |
| --- | --- |
| Formato dati | **JSON** (UTF-8, una entità per file) |
| CI | **GitHub Actions** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) |
| Distribuzione | Release `.zip` automatica su ogni push a `main`/`backer`/`patron` + raw GitHub URLs |
| Licenza | DRAW STEEL Creator License (vedi `LICENSE`) |

Il workflow CI non valida il contenuto: si limita a creare uno zip dell'intero repo e pubblicarlo come release con tag temporale.

---

## 3. Struttura delle cartelle

```
/
├── README.md                  # Disclaimer Creator License + link al form bug
├── LICENSE
├── Plugin_PROJECT_OVERVIEW.md # Doc del plugin consumatore (companion)
├── .github/workflows/ci.yml   # Build & release automatico (zip)
│
├── Monsters/                  # Mostri ufficiali, raggruppati per famiglia
│   ├── statblocks.json        # Indice/aggregato di tutti i mostri (legacy/full export)
│   └── <Famiglia>/
│       ├── Statblocks/        # Un .json per creatura
│       └── Features/          # <Famiglia> Malice.json (malice features comuni)
│
├── Heroes/                    # Eroi della campagna (custom)
│   └── <Eroe>/
│       ├── Statblocks/        # <Eroe>.json (scheda completa)
│       ├── Features/          # <Eroe> Features.json (talenti/feature di classe)
│       ├── Skills/            # <Eroe> Skills.json (lista skill per categoria)
│       ├── Images/            # <Eroe>.{jpeg|png|...} (token/portrait)
│       └── Projects/          # opzionale: <Eroe> Projects.json (downtime)
│
└── Dynamic Terrain/           # Oggetti/terreno dinamico
    ├── Environmental Hazards/ # Lava, Quicksand, Brambles, ...
    ├── Fieldworks/            # Bear Trap, Snare Trap, Pavise Shield, ...
    ├── Mechanisms/            # Portcullis, Pressure Plate, Dart Trap, ...
    ├── Power Fixtures/        # Holy Idol, Psionic Shard, Tree of Might
    ├── Siege Engines/         # Catapult, Field Ballista, Iron Dragon, ...
    └── Supernatural Objects/  # The Black Obelisk, The Chronal Hypercube, ...
```

**Convenzione di naming**: il nome del file (senza estensione) coincide con il campo `name` interno e con la chiave usata dagli indici lato plugin (`monsterIndex.json`, `heroIndex.json`). Spazi e apostrofi sono ammessi (es. `C'eree`, `Un Cavaliere`).

---

## 4. Macro-aree

### 4.1 `Monsters/`
- Una sotto-cartella per **famiglia/archetipo** (Goblins, Dragons, Demons, ...) o per **boss unico** (Ajax the Invincible, Lord Syuul, Xorannox the Tyract, ...).
- `Statblocks/<Nome>.json` → singola creatura, schema `type: "statblock"`.
- `Features/<Famiglia> Malice.json` → blocco di feature di Malice condivise dalla famiglia, schema `type: "featureblock"`, `featureblock_type: "Malice Features"`.
- `Monsters/statblocks.json` → file aggregato (array `monsters: [...]`) che sembra una vecchia esportazione completa o un fallback. **Possibile duplicazione** rispetto ai singoli file (vedi §7).

### 4.2 `Heroes/`
- Una sotto-cartella per ciascun PG della campagna.
- Bundle a quattro componenti fissi (`Statblocks`, `Features`, `Skills`, `Images`) + `Projects` opzionale.
- Schemi: `type: "statblock"` (con `roles: ["Hero"]`), `"featureblock"`, `"skillblock"`, `"projectblock"`.

### 4.3 `Dynamic Terrain/`
- Sei categorie tematiche.
- Ogni file è un oggetto `type: "dynamicterrain"` con `featureblock_type` (es. `"Hazard Hexer"`), `level`, `ev`, `stamina`, `size`, `stats[]`, `features[]` (traits + abilities).

---

## 5. Schema dei file JSON (riassunto)

> Sintetico per design: per i dettagli campo-per-campo fare riferimento agli **schemi Zod del plugin** (`src/types/DrawSteelZod.ts`, `heroDataBundlesZod.ts`, `monsterDataBundlesZod.ts`).

### 5.1 Statblock (mostri ed eroi)
```jsonc
{
  "type": "statblock",
  "name": "...",
  "level": 1,
  "roles": ["Horde Harrier" | "Solo" | "Hero" | ...],
  "ancestry": ["..."],
  "ev": "stringa",          // encounter value (può contenere unità, es. "4 per 10x10")
  "stamina": "stringa",
  "speed": 6,
  "movement": "Walk, Disengage 1",
  "size": "1S" | "1M" | "1L" | "2" | ...,
  "stability": 0,
  "free_strike": 1,
  "might|agility|reason|intuition|presence": -2..5,
  "features": [ /* array di feature: trait | ability */ ]
}
```

Eroi: aggiungono di solito `roles: ["Hero"]` e ancestry/classe/specializzazione mescolati in un unico array.

### 5.2 Feature
Due `feature_type`: **`trait`** (passive/triggered) e **`ability`** (azione attiva).

```jsonc
{
  "type": "feature",
  "feature_type": "ability",
  "name": "...",
  "icon": "🗡",
  "ability_type": "Signature Ability" | "Heroic Ability" | ...,
  "keywords": ["Melee", "Strike", "Weapon", "Magic", ...],
  "usage": "Main action" | "Maneuver" | "Triggered Action" | ...,
  "cost": "3 Malice" | "2 Focus" | ...,        // opzionale
  "distance": "Melee 1" | "Ranged 10" | ...,
  "target": "One creature or object",
  "effects": [
    { "roll": "Power Roll + N", "tier1": "...", "tier2": "...", "tier3": "..." },
    { "name": "Effect Name", "effect": "testo" }
  ]
}
```

### 5.3 FeatureBlock / Malice
File aggregato di sole `features[]`, con `type: "featureblock"`, `featureblock_type: "Malice Features" | "Features"`, `name`, `flavor`.

### 5.4 SkillBlock (eroi)
```jsonc
{
  "type": "skillblock",
  "name": "...'s Skills",
  "flavor": "...",
  "categories": [
    { "category": "Crafting Skills", "skills": ["Alchemy", "Cooking"] },
    { "category": "Lore Skills",     "skills": ["Psionics", ...] }
  ]
}
```

### 5.5 ProjectBlock (eroi, opzionale)
```jsonc
{
  "type": "projectblock",
  "projectblock_type": "Projects",
  "name": "...'s Projects",
  "owner": "...",
  "party": "...",
  "campaign": "...",
  "chapter": "...",
  "notes": ["..."],
  "projects": [
    {
      "type": "Craft Treasure" | "Research" | ...,
      "name": "...",
      "description": "...",
      "progress": 0,
      "completion": 150,
      "status": "In Progress" | "Completed" | ...,
      "priority": "High" | "Medium" | "Low",
      "contributors": ["..."],
      "project_roll_characteristic": ["Might", "Reason", "Intuition"]
    }
  ]
}
```

### 5.6 Dynamic Terrain
```jsonc
{
  "type": "dynamicterrain",
  "featureblock_type": "Hazard Hexer" | "Fieldwork" | ...,
  "name": "Lava",
  "level": 3,
  "ev": "...",
  "flavor": "...",
  "stamina": "...",
  "size": "...",
  "stats": [ { "name": "Immunity", "value": "20 to all damage except cold" } ],
  "features": [ /* trait + ability come negli statblock */ ]
}
```

### 5.7 Immagini eroi
Solo asset binari (`.jpeg`/`.png`). Risolte dal plugin tramite `getImageUrl(name)`.

---

## 6. Come il plugin consuma i dati

1. **Index lookup** (a build/dev time): il plugin mantiene `src/statblockSearch/{heroIndex,monsterIndex}.json` con i nomi e i path. Aggiornato manualmente con i `DevScriptButtons` (`?dev=true`).
2. **Risoluzione URL** (a runtime): `getStatblockUrl(name, type)` costruisce un URL raw sul branch configurato in `branchName.ts` puntando a questo repo.
3. **Bundle fetch**:
   - `getHeroDataBundle(name)` → scarica in parallelo `Statblocks`, `Features`, `Skills`, `Images`, e (se presente) `Projects`.
   - `getMonsterDataBundle(name)` → scarica `Statblocks/<Nome>.json` + `Features/<Famiglia> Malice.json` se esistente, e usa la GitHub **Tree API** per scoprire le risorse della famiglia.
4. **Validazione**: tutti i payload vengono parsati con gli schemi **Zod** del plugin. Un campo non conforme → render fallback / errore visibile nel viewer/builder.
5. **Caching**: nessuno lato repo; lato plugin oggi è limitato (vedi feature N10 nel doc plugin).

> Il branch effettivo da cui pescare è hard-coded nel plugin: per usare questo fork il plugin deve avere `branchName.ts` configurato sull'owner `DelloDavide` (vedi sezione 7 del doc plugin).

---

## 7. Aree di rischio note

1. **`Monsters/statblocks.json` aggregato**: probabilmente una snapshot legacy. Rischio di **drift** rispetto ai singoli file `Monsters/<Famiglia>/Statblocks/*.json`. Andrebbe rigenerato automaticamente o rimosso.
2. **Nessuna validazione in CI**: il workflow `ci.yml` non fa `jq` né schema-check. Un JSON malformato finisce in produzione e crasha il viewer (Zod `parse` lato plugin).
3. **Naming sensibile**: nomi file con apostrofi (`C'eree`), spazi (`Un Cavaliere`) e caratteri non ASCII richiedono URL-encoding corretto lato plugin. Errori di encoding rompono solo specifiche entry.
4. **Indice del plugin disallineato**: i due `*Index.json` lato plugin vanno tenuti in sync con i contenuti di questo repo. Una nuova creatura aggiunta qui **non è scopribile** finché l'indice non è rigenerato.
5. **Schema implicito**: lo "schema" è lo schema Zod del plugin, non dichiarato in questo repo. Modifiche allo schema lato plugin possono invalidare dati esistenti senza nessun controllo automatico.
6. **Heroes/Projects opzionale ma non documentato**: solo `Degotho` ha la cartella `Projects/`. La presenza/assenza non è descritta da un manifesto.
7. **Mix di mostri ufficiali e custom**: `Monsters/` contiene sia famiglie del Monsters Book sia boss/PNG di campagna (es. `Lord Syuul`, `Count Rhodar Von Glauer`). Difficile distinguere "ufficiale" da "custom" senza convenzione.
8. **Release ZIP non versionata semanticamente**: il tag è `<branch>.<timestamp>`. Nessun changelog, nessun `latest` stabile.
9. **Caratteri speciali nei testi degli effetti**: presenza mista di apostrofi tipografici (`'`) vs ASCII (`'`) e di emoji come `icon` → potenziali problemi di render/diff.
10. **`ev` / `stamina` come stringa**: il plugin parsa come stringa per accomodare unità (`"12 per square"`, `"4 per 10 x 10 patch"`). Cambiare a numero romperebbe il dynamic terrain.

---

## 8. Possibili miglioramenti, fix e nuove feature

### 8.1 Bug fix / hygiene

| # | Area | Descrizione | Priorità |
| --- | --- | --- | --- |
| F1 | `Monsters/statblocks.json` | Decidere: o **rigenerare automaticamente** in CI a partire dai singoli file, o **rimuoverlo** e aggiornare i consumer. | Alta |
| F2 | CI | Aggiungere step di **validazione JSON** (parsing) e **schema-check** (vedi §8.2). Fail-fast su file rotti. | Alta |
| F3 | Naming | Normalizzare i nomi file: ASCII safe + script che verifica `file.name == json.name`. | Media |
| F4 | Apostrofi | Script `lint:quotes` che converte `'`/`"` tipografici in ASCII nei JSON (per evitare diff invisibili). | Bassa |
| F5 | `icon` | Whitelist di emoji ammesse + mapping a token grafici, per evitare che icone esotiche rompano il render. | Bassa |
| F6 | Heroes vs Monsters custom | Spostare i PNG/boss di campagna in `Monsters/_Custom/` (o `NPCs/`) per separarli dal Monsters Book ufficiale. | Media |

### 8.2 Refactor / qualità

- **JSON Schema pubblico**: pubblicare uno **schema JSON** (o gli schemi Zod esportati dal plugin) sotto `schemas/` in questo repo, così editor (VS Code) possono fare autocompletion e validazione live tramite `$schema`.
- **Pre-commit hook**: `husky` + `lint-staged` con `ajv-cli` o `zod`-runner per validare i file modificati prima del commit.
- **Manifest indice**: generare in CI un `index.json` (o `manifest.json`) di repo che elenca tutti gli statblock con `path`, `type`, `level`, `roles`, `ancestry`, `family`. Sostituirebbe `Monsters/statblocks.json` e renderebbe la scoperta lato plugin O(1) senza GitHub Tree API.
- **Split bundle eroi**: oggi `Statblocks/`, `Features/`, `Skills/`, `Images/`, `Projects/` sono cartelle separate per un singolo file ciascuna. Si potrebbe collassare in un unico `<Hero>.json` con sub-oggetti, o tenere com'è e documentare meglio. Pro/contro da pesare.
- **Copertura test minima**: file `__tests__/structure.test.ts` (o equivalente in Python) che verifichi la presenza dei file attesi per ogni eroe.
- **Branch policy**: documentare cosa va su `main` vs `backer` vs `patron` (oggi solo CI li menziona).

### 8.3 Nuove feature

| # | Feature | Note |
| --- | --- | --- |
| N1 | **Schema JSON in repo** + `$schema` nei file | Editor experience + validazione gratuita. Driver per gran parte degli altri miglioramenti. |
| N2 | **Auto-generated `index.json`** | CI emette un manifest globale (mostri, eroi, terreni) consumabile dal plugin in una sola fetch. |
| N3 | **Localizzazione (IT/EN)** | Aggiungere file paralleli `*.it.json` o un campo `i18n` per nomi/effects. |
| N4 | **Tag/keyword normalizzati** | Vocabolario controllato per `keywords`, `roles`, `ancestry`, `ability_type`, `usage`. Pubblicare in `vocabularies/`. |
| N5 | **Versioning semantico** | `package.json` con `version` + tag `vX.Y.Z` invece del timestamp; permette al plugin di pinnare una release stabile. |
| N6 | **CHANGELOG automatico** | Conventional Commits + `release-please` o `changesets`. |
| N7 | **Encounter templates** | Cartella `Encounters/` con bundle predefiniti (mostri + EV + note); il plugin potrebbe importarli. |
| N8 | **Token frame metadata** | Per ogni statblock, opzionale `token: { color, shape, frame }` da consumare per stilizzare l'overlay automaticamente. |
| N9 | **Asset ottimizzati** | Pipeline che converte le immagini eroe in WebP + thumbnail; più veloce su OBR. |
| N10 | **Search index pre-built** | CI genera direttamente i `monsterIndex.json` / `heroIndex.json` consumati dal plugin (oggi mantenuti a mano via dev mode). Diventerebbero artefatti di release. |
| N11 | **Validazione cross-reference** | Linter che verifica: nomi feature unici per famiglia, family Malice esiste se referenziato, immagini eroi coerenti col nome. |
| N12 | **Site statico di anteprima** | Pagina (Astro/MkDocs) che renderizza tutti gli statblock come reference web pubblica. |
| N13 | **Contributor guide** | `CONTRIBUTING.md` con esempi di nuovo mostro/eroe e checklist (file, indice, validazione). |
| N14 | **Issue templates** | Sostituire il Google Form con template GitHub Issue (richiede repo pubblico/aperto agli utenti). |
| N15 | **Diff-aware preview in PR** | Action che, su PR, posta un commento con anteprima rendered degli statblock cambiati (stile "Vercel preview"). |

### 8.4 DX / repository hygiene

- Aggiungere `.editorconfig` (LF, UTF-8, indent 2 spaces, JSON formatter consistente).
- Aggiungere `.gitattributes` con `*.json text eol=lf`.
- Aggiungere `package.json` minimal con script `validate`, `format`, `index` (no runtime, solo tooling).
- Aggiungere `prettier` per formattare i JSON in modo deterministico (oggi indentation mista).
- Documentare in `README.md` l'**ABI dati** verso il plugin (i due repo sono coupled; un cambio di schema va coordinato).

---

## 9. Glossario rapido (campi → significato)

- **`ev`**: Encounter Value (peso del mostro nell'incontro). Stringa per accomodare unità (`"4 per square"`).
- **`stamina`**: HP. Stringa per stessa ragione.
- **`free_strike`**: danno del Free Strike di base.
- **`might/agility/reason/intuition/presence`**: caratteristiche (`-3..+5`).
- **`size`**: `1T`, `1S`, `1M`, `1L`, `2`, `3`... (Tiny/Small/Medium/Large + larghezza in caselle).
- **`stability`**: resistenza a forced movement.
- **`roles`**: ruolo tattico (`Solo`, `Horde Harrier`, `Ambusher`, `Hero`, ...).
- **`ancestry`**: tag genealogici/tipologici. Per gli **eroi** include classe/sub-class/specializzazione mischiate.
- **`ability_type`**: `Signature` / `Heroic` / `Maneuver` / `Triggered` / etc.
- **`feature_type`**: `trait` (passiva) vs `ability` (attiva).
- **`featureblock_type`**: classifica il blocco contenitore (`Features`, `Malice Features`, `Hazard Hexer`, ...).
- **`tier1/tier2/tier3`**: esiti del Power Roll (≤11 / 12-16 / ≥17).

---

## 10. Punti di partenza consigliati per un agente

- Vuoi **aggiungere un nuovo mostro**? → crea `Monsters/<Famiglia>/Statblocks/<Nome>.json`, aggiorna o crea `Monsters/<Famiglia>/Features/<Famiglia> Malice.json`, poi rigenera `monsterIndex.json` lato plugin (dev mode).
- Vuoi **aggiungere un eroe**? → crea `Heroes/<Nome>/{Statblocks,Features,Skills,Images}/...`, opzionale `Projects/`. Aggiorna `heroIndex.json` lato plugin.
- Vuoi **uniformare gli statblock**? → parti da uno schema Zod del plugin e produci uno **JSON Schema** in `schemas/`, poi aggiungi step di validazione in [.github/workflows/ci.yml](.github/workflows/ci.yml).
- Vuoi **automatizzare l'indice**? → script Node/Python che cammina `Monsters/**/Statblocks/*.json` e `Heroes/*/Statblocks/*.json` ed emette `index.json` globale; pubblicalo come release artifact.
- Vuoi **modificare lo schema**? → coordina con il plugin (`src/types/*Zod.ts`); è una **breaking change** per i consumer.

---

_Fine documento. Generato come briefing per agenti AI; aggiornare quando lo schema dati o la struttura cartelle cambiano._
