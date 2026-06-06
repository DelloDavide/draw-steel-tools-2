# Draw Steel Tools 2 — Documentazione tecnica per agenti AI

> Documento generato automaticamente come briefing per agenti che dovranno lavorare su questo repository. Contiene una descrizione del prodotto, dell'architettura, delle macro-aree di codice, delle convenzioni interne e una lista ragionata di possibili miglioramenti, fix e nuove feature.

---

## 1. Cos'è il progetto

**Draw Steel Tools 2** è una **estensione (plugin) per [Owlbear Rodeo](https://www.owlbear.rodeo/)**, una virtual tabletop online. L'estensione fornisce strumenti dedicati al gioco di ruolo **Draw Steel** (MCDM Productions), tra cui:

- Gestione di **stamina, risorse eroiche, surges, recoveries** sui token (eroi e mostri).
- **Health bars**, **name tags** e **stat bubbles** sovrapposti ai token.
- Tracker condivisi a livello di stanza per **Malice** (GM) e **Hero Tokens** (giocatori).
- Utility di **Power Roll** (2d10 / 3d10kh2 / 3d10kl2 con edges/banes, skill, bonus, calcolo dei tier 1/2/3 e critical).
- **Statblock search / viewer / builder** che pesca dati da **Supabase** (tabella `bestiary_documents`), migrati dal repository GitHub `DelloDavide/data-bestiary-json`.
- Gestione di **gruppi di Minion** (creature deboli condivise, con stamina cumulativa).
- Calcolatori di **Malice per round** e **Hero Tokens per sessione**.
- Integrazione opzionale con la **Connected Dice extension** tramite un protocollo broadcast condiviso (`diceProtocol`).
- Interoperabilità con **Pretty Sordid** per il cambio round (`broadcastRoundProtocol`).

Il pacchetto è una **fork / estensione** del progetto upstream `SeamusFinlayson/draw-steel-tools-2` (vedi `README.md`). L'autore corrente del manifest è `Dello`. Versione manifest: `2.8.0`.

---

## 2. Stack tecnologico

| Ambito | Tecnologia |
| --- | --- |
| Build tool | **Vite 7** + plugin React |
| Linguaggio | **TypeScript 5.8** (strict, multi tsconfig: `tsconfig.app.json`, `tsconfig.node.json`) |
| UI framework | **React 19** |
| CSS | **Tailwind CSS 4** (via `@tailwindcss/vite`) + `tw-animate-css` |
| Component library | **Radix UI primitives** + wrapper custom in [src/components/ui](src/components/ui) |
| Icone | `lucide-react`, `@lucide/lab` |
| Validazione | **Zod 4** (schemi in [src/types](src/types)) |
| Backend dati | **Supabase** (`@supabase/supabase-js`) — DB PostgreSQL + Storage per immagini |
| Search | **fuzzysort** |
| Hooks utility | `usehooks-ts` |
| SDK runtime | **`@owlbear-rodeo/sdk` 3.1** |
| Package manager | **pnpm** (workspace single-package, vedi `pnpm-workspace.yaml`) |
| Lint / Format | ESLint 9 + Prettier 3 + `prettier-plugin-tailwindcss` |

Script (`package.json`): `pnpm dev`, `pnpm build` (`tsc -b && vite build`), `pnpm lint`, `pnpm preview`.

---

## 3. Modello di esecuzione: entry-point multipli

Vite è configurato in [vite.config.ts](vite.config.ts) con **8 entry HTML** distinti, ciascuno corrispondente a un contesto in cui Owlbear Rodeo carica una pagina dell'estensione:

| HTML | Entry React | Caricato da OBR come |
| --- | --- | --- |
| [action.html](action.html) | [src/action/main.tsx](src/action/main.tsx) → `ActionMenu` | popover dell'azione (icona `dragon-head` in alto a sinistra) |
| [background.html](background.html) | [src/background/main.ts](src/background/main.ts) | script di background headless (definito in `manifest.json` → `background_url`) |
| [contextMenu.html](contextMenu.html) | [src/contextMenu/main.tsx](src/contextMenu/main.tsx) → `TokenEditor` / `MinionContextMenu` | iframe embed nel context menu dei token |
| [settings.html](settings.html) | [src/settings/main.tsx](src/settings/main.tsx) → `SettingsMenu` | popover settings |
| [statblockSearch.html](statblockSearch.html) | [src/statblockSearch/main.tsx](src/statblockSearch/main.tsx) | popover ricerca statblock |
| [statblockViewer.html](statblockViewer.html) | [src/statblockViewer/main.tsx](src/statblockViewer/main.tsx) | popover/iframe visualizzatore statblock |
| [statblockBuilder.html](statblockBuilder.html) | [src/statblockBuilder/main.tsx](src/statblockBuilder/main.tsx) | tab dedicata per editing/preview |
| [resourceCalculator.html](resourceCalculator.html) | [src/resourceCalculator/main.tsx](src/resourceCalculator/main.tsx) | popover calcolatore Malice / Hero Tokens |

Tutti gli entry condividono [src/index.css](src/index.css) e i componenti in [src/components](src/components).

Il manifest pubblicato è [public/manifest.json](public/manifest.json). Il file [public/_headers](public/_headers) serve per la pubblicazione su Render (CORS verso `owlbear.rodeo`).

---

## 4. Macro-aree del codice (`src/`)

### 4.1 `background/` — Stato globale e overlay sui token
File chiave: [src/background/main.ts](src/background/main.ts), [src/background/statAttachments.ts](src/background/statAttachments.ts), [src/background/createContextMenuItems.ts](src/background/createContextMenuItems.ts), [src/background/sendItemsToScene.ts](src/background/sendItemsToScene.ts).

Lo script di background:

- All'`OBR.onReady` chiama `startBackground()` che mantiene un singleton `ObrState` (immagini in scena, ruolo del player, gruppi minion, conteggi token, settings, log degli attachments, DPI scena, theme mode).
- Reagisce ai cambiamenti di scena/room/player/tema iscrivendosi a `OBR.scene.items.onChange`, `OBR.scene.onMetadataChange`, `OBR.room.onMetadataChange`, `OBR.player.onChange`, `OBR.theme.onChange`.
- Per ogni `Image` aggiorna gli **overlay** (health bar, name tag, stat bubbles, hp text) tramite [src/background/overlays/](src/background/overlays/) (`createHeroOverlay`, `createMonsterOverlay`, `createMinionOverlay`, `createTokenOverlay`, `compoundItemHelpers`).
- Le creazioni/cancellazioni vengono **bufferizzate** in `addItemsArray` / `deleteItemsArray` e flushate da `sendItemsToScene` per ridurre i round-trip al runtime di OBR.
- `createContextMenuItems` registra le voci del context menu (Edit Hero, Edit Monster, Edit Minions, Add Hero/Monster, Remove Character) usando filtri `OBR.contextMenu` basati su layer, tipo e metadata. I filtri sono stratificati per **PLAYER** vs **GM** e per la presenza/assenza di metadata `gmOnly`.

### 4.2 `action/` — Popover principale
[src/action/ActionMenu.tsx](src/action/ActionMenu.tsx) compone:

- `Header` con menu laterale (settings, link esterni).
- Tracker risorse di stanza (`ResourceTracker`) per Malice / Hero Tokens.
- Bottone "Open Calculator" (solo GM) che apre il `resourceCalculator` come popover.
- Power Roll utility tramite `DiceRoller` ([src/action/diceRoller/](src/action/diceRoller/)) con `helpers.ts::powerRoll` (gestisce edges singoli/doppi, critical ≥19, tier 1<12, 2<17, 3≥17).
- `MinionGroupCleanup` (rimuove gruppi orfani).
- Si aggancia al dice roller esterno via `useDiceRoller` (vedi `diceProtocol`).

### 4.3 `contextMenu/` — Editor per singolo token
[src/contextMenu/TokenEditor.tsx](src/contextMenu/TokenEditor.tsx) gestisce token Hero/Monster; [src/contextMenu/MinionContextMenu.tsx](src/contextMenu/MinionContextMenu.tsx) i token di tipo Minion (delegando a `MinionGroupEditor`). Sotto-cartelle:

- `components/`: `NameInput`, `StatEditor`, `StatblockControls`, `VisibilityToggle`, `MinionGroupEditor`, `HeroicResourceRoller`, `ClassResourceTrackers`.
- `trackerInputs/`: input numerici specializzati con **inline math** (BarTrackerInput, CounterTrackerInput, ValueButtonTrackerInput, TokenTextarea, Label).

### 4.4 `statblockSearch/` — Ricerca statblock
- [src/statblockSearch/StatblockSearch.tsx](src/statblockSearch/StatblockSearch.tsx) + `components/SearchView`, `OptionsView`, `StatblockSearchList`, `MonsterPreviewCard`, `NoMonsterCard`, `FiltersDropdown`, `DevScriptButtons`.
- Indici locali: [src/statblockSearch/heroIndex.json](src/statblockSearch/heroIndex.json), [src/statblockSearch/monsterIndex.json](src/statblockSearch/monsterIndex.json), [src/statblockSearch/dynamicTerrainIndex.json](src/statblockSearch/dynamicTerrainIndex.json).
- `helpers/` recupera i bundle reali da **Supabase**: [src/statblockSearch/helpers/getTypedData.ts](src/statblockSearch/helpers/getTypedData.ts) (query su `bestiary_documents`, con **in-memory cache** tramite `typedDataCache`; espone `setTypedDataCache` / `invalidateTypedDataCache` per gli helper di write-back), `getHeroDataBundle`, `getMonsterDataBundle`, `getDynamicTerrainDataBundle`, `getImageUrl` (bucket Supabase Storage `hero-images`). Il client è inizializzato in [src/supabaseClient.ts](src/supabaseClient.ts).
- `devScripts/` contiene `generateMonsterIndex.ts`, `generateDynamicTerrainIndex.ts`, `validateStatblocks.ts`, `validatemalice.ts`.
- Modalità **dev** (`?dev=true`) abilita pulsanti per validare/generare/scaricare gli indici.

### 4.5 `statblockViewer/` — Visualizzatore statblock
[src/statblockViewer/StatblockViewer.tsx](src/statblockViewer/StatblockViewer.tsx) carica per nome (cerca prima fra gli eroi, poi fra i mostri, poi fra i **Dynamic Terrain**), renderizza il blocco con i componenti in `creatureBlockUI/` (`MonsterView`, `StatBlock`, `Feature`, `FeatureBlock`, `DynamicTerrainStatBlock`, `ProjectBlock`, `SkillBlock`, `InventoryBlock`, `Images`, `Effect`, `Characteristics`, `MaliceSpender`, `HeroResourceSpender`, `HeroResourceSpentIndicator`, `RollResultIndicator`, `ResultDropDown`, `InlineRollButton`, ecc.). Include `DiceDrawer`, `ClassResourceBar`, `StatblockSwitcher`, `OpenInNewTabButton`. Definizioni di regole inline da [src/rulesReference/definitions.json](src/rulesReference/definitions.json).

Architettura context (cartella `context/`):
- `HeroTokenContext` + `HeroTokenProvider`: collegamento a un token Hero in scena per nome statblock (aggiorna `classResourcePools` in tempo reale via `OBR.scene.items.onChange`).
- `DiceDrawerContext` / `DiceDrawerContextProvider`: gestione apertura drawer dadi.
- `MaliceSpentContext` / `MaliceSpentContextProvider`: stato della spesa Malice corrente.
- `RollAttributesContext` / `RollAttributesProvider`: attributi del power roll.
- `RoomMetadataProvider`: provider generico per metadata di stanza (usato per trackers e settings).
- `RoomSettingsContext`, `RoomTrackersContext`: contesti derivati da `RoomMetadataProvider`.
- `FeatureIdContext`, `HeroClassResourceNamesContext`: contesti di dettaglio per feature e risorse di classe.

Hook (`hooks/`): `useCommitPendingResourceSpend.ts` — gestisce il commit della spesa risorsa pendente.

`SkillBlock`, `ProjectBlock` e `InventoryBlock` sono componenti di visualizzazione **e editing** inline, con salvataggio verso GitHub e Supabase tramite i rispettivi helper (`saveHeroSkills`, `saveHeroProjects`, `saveHeroInventory`).

### 4.6 `statblockBuilder/` — Editor di statblock
[src/statblockBuilder/StatblockBuilder.tsx](src/statblockBuilder/StatblockBuilder.tsx) + `creatureBlockUI/MonsterEditorView`, `Input`, `StatBlock`, ecc. Si aspetta `?statblockName=...&type=hero|monster`.

### 4.7 `resourceCalculator/`
Calcolatore standalone di Malice e Hero Tokens (vedi [src/resourceCalculator/ResourceCalculator.tsx](src/resourceCalculator/ResourceCalculator.tsx)). Usa lo stesso storage di metadata di stanza del tracker.

### 4.8 `settings/`
[src/settings/SettingsMenu.tsx](src/settings/SettingsMenu.tsx) e [src/settings/SettingsList.tsx](src/settings/SettingsList.tsx). Setting persistiti in **room metadata** (chiave `getPluginId("metadata")`). Schema in [src/types/settingsZod.ts](src/types/settingsZod.ts):

- `nameTagsEnabled`, `verticalOffset`, `justifyHealthBarsTop`, `showHealthBars`, `segmentsCount`, `keepPowerRollBonus`, `keepActivitiesOpen`.

### 4.9 `components/`
- `ui/`: wrappers stilizzati per Radix (Accordion, Dialog, Popover, ScrollArea, Sheet, Slider, Switch, Toggle, ToggleGroup, Tooltip, Checkbox, RadioGroup, Collapsible, Separator, Label, Badge), più `Button`/`buttonVariants`, `Input`, `DropDownInput`, `UnderlineDropDown`, `toggleVariants`.
- `logic/`: `DebounceInput`, `FreeWheelInput`, `FreeWheelTextarea` (input non controllati con commit on blur/Enter, supportano inline math), `HeightMatch` (osserva l'altezza dei figli e propaga via callback per ridimensionare popover), `ImageCarousel` (visualizzatore immagini con navigazione frecce e zoom da tastiera), `PluginGate` / `PluginReadyGate` / `PluginReadyContext` / `PluginReadyProvider` (gating sull'`OBR.onReady`).
- `icons/`: SVG inline.

### 4.10 `helpers/`
Cuore della logica condivisa. Notabili:

- **Plugin / metadata**: `getPluginId`, `parseMetadata`, `localStorageHelpers`, `useRoomMetadata`, `useSceneMetadata` (hook generici tipizzati con parser zod), `settingsHelpers`, `tokenHelpers` (inclusi default per Hero/Monster/Minion), `monsterGroupHelpers`.
- **Token / item**: `getSelectedItem(s)`, `useItems`, `useMinionGroupItems`, `getMinionTokenCounts`, `removeCreatureData`, `usePlayerName/Role/Selection`.
- **Roll / dadi**: `useDiceRoller`, `createRollRequestMessage`, `lastDiceStyle`, `milestones`.
- **Statblock fetch**: `heroDataFromStatblockName`, `monsterDataFromStatblockName`, `dynamicTerrainDataFromStatblockName`, `isDynamicTerrainIndexEntry`.
- **Class resources**: `classResourceHelpers` (`extractClassResourceNamesFromHeroBundle`, `getMergedClassResourcePools`, `updateClassResourcePool`), `updateHeroTokenClassResource` (aggiorna `classResourcePools` direttamente sul token OBR).
- **Hero data write-back**: `saveHeroInventory` (`saveInventoryToGitHub` + `saveInventoryToSupabase`), `saveHeroProjects` (`saveHeroProjectsToGitHub` + `saveHeroProjectsToSupabase`), `saveHeroSkills` (`saveSkillsToGitHub` + `saveSkillsToSupabase`), `githubClient` (client per GitHub API: `getGitHubApiUrl`, `getGitHubHeaders`, `getGitHubFileSha`, `putGitHubFile`, path helpers per hero data).
- **Round**: `broadcastRoundImplementation`, `useRoundMessageHandler`.
- **Logging**: `logger` — logger configurabile con livelli (debug/info/warn/error/silent).
- **Misc**: `parseNumber` (inline math: prefissi `=`, `+`, `-`), `setDifference`, `syncThemeMode`, `getContextMenuUrl`, `generateGroupId`, `others`, `utils` (ha `cn` per Tailwind).

### 4.11 `types/`
Tutti gli schemi **Zod** + i type derivati: `tokenDataZod`, `settingsZod`, `roomTrackersZod`, `minionGroup`, `heroDataBundlesZod` (include `inventoryBlocks` e `projectBlocks`), `monsterDataBundlesZod`, `dynamicTerrainDataBundlesZod`, `creatureDataBundle` (union tipo `hero|monster|dynamicterrain`), `DrawSteelZod` (include `DrawSteelInventoryBlock`, `DrawSteelProjectBlock`, `DrawSteelSkillBlock`, `DrawSteelDynamicTerrain`), `githubZod`, `diceRollerTypes`, `localStorageKey`, `themeMode`, `contextMenuToken`, `statblockLookupAppState`, `statblockSearchData`.

### 4.12 `protocols/` — Protocolli broadcast
- [src/protocols/diceProtocol.ts](src/protocols/diceProtocol.ts) + [src/protocols/diceProtocolExport.ts](src/protocols/diceProtocolExport.ts): protocollo "Connected Dice" (canali `general.diceRoller.hello` / `general.diceClient.hello`, `RollRequest`, `RollResult`, `PowerRollRequest`, `PowerRollResult`).
- [src/protocols/broadcastRoundProtocol.ts](src/protocols/broadcastRoundProtocol.ts): integrazione con **Pretty Sordid** (`general.initiative.roundChange`, `general.initiative.setRound`).
- Documentazione pubblica in [docs/broadcast-protocols.md](docs/broadcast-protocols.md).

---

## 5. Modello dati

### 5.1 Storage
| Dove | Chiave | Schema |
| --- | --- | --- |
| **Item metadata** (per token) | `getPluginId("metadata")` (= `TOKEN_METADATA_KEY`) | `CharacterTokenDataZod` (union Hero / Monster / Minion) |
| **Scene metadata** | `getPluginId("monsterGroups")` (= `MONSTER_GROUPS_METADATA_KEY`) | `z.array(MinionGroupZod)` |
| **Room metadata** | `getPluginId("settings")` (= `SETTINGS_METADATA_KEY`) | `SettingsZod` |
| **Room metadata** | `getPluginId("trackers")` | `RoomTrackersZod` (Malice + Hero Tokens) |
| **Local storage** | varie (vedi `localStorageHelpers`, `lastDiceStyle`) | tipizzato in `localStorageKey` |

### 5.2 Token types
- `HERO`: `name, gmOnly, stamina, staminaMaximum, temporaryStamina, heroicResource, recoveries, surges, statblockName, heroicResourceButton ("D3"|"D3+1"|"+2"|"+3"), heroicResourceName, classResourcePools (Record<string,number>), notes`.
- `MONSTER`: subset di Hero senza heroic resource/surges/recoveries/notes.
- `MINION`: solo `groupId` — tutto il resto è nel `MinionGroup` di scena.

### 5.3 MinionGroup
`{ type, id, name, nameTagsEnabled, currentStamina, individualStamina, statblock?, gmOnly? }`. La stamina è cumulativa: il numero di token vivi = `ceil(currentStamina / individualStamina)`.

---

## 6. Convenzioni e pattern interni

1. **Zod come fonte unica di verità**: ogni metadata viene parsato con uno schema. Esistono due livelli per ogni entità: `XxxZod` (campi opzionali, per la persistenza tollerante) e `DefinedXxxZod` (tutti obbligatori, per la UI). I default sono in `tokenHelpers` / `settingsHelpers`.
2. **Inline math** (`parseNumber`): tutti i tracker accettano espressioni (`+7`, `-3`, `=+7`, `=-7`, `7`). Logica centralizzata in [src/helpers/parseNumber.ts](src/helpers/parseNumber.ts) e usata dagli input "free wheel".
3. **Hook su metadata**: `useRoomMetadata` / `useSceneMetadata` ritornano `{ value, update, ready }`; gestiscono parsing zod e sottoscrizione automatica.
4. **Buffered scene mutations**: il background accumula creazioni/cancellazioni in array e le invia in batch (`sendItemsToScene`).
5. **Resize popover**: il pattern è usare `<HeightMatch setHeight={...}>` come root, e collegare `setHeight` a `OBR.action.setHeight` / `OBR.popover.setHeight`.
6. **Theme mode**: passato via query string (`?themeMode=...`) tra parent e iframe per evitare flash; vedi `getContextMenuUrl`, `syncThemeMode`.
7. **Filtri context menu**: complessi e dichiarativi, con `every` / `some` / `coordinator`. Definiti tramite helper tipizzati in [src/background/contextMenuFilters.ts](src/background/contextMenuFilters.ts). Sono il modo in cui OBR decide quale icona/menu mostrare.
8. **Plugin ID**: tutto è prefissato con `getPluginId(...)` (probabilmente `com.dello.draw-steel-tools.<name>` o simile — vedi `helpers/getPluginId.ts`).
9. **GM only**: filtri sui filter del context menu + flag `gmOnly` sul token. Il background applica restrizioni anche alla visualizzazione delle bar.

---

## 7. Build, deploy, dev workflow

### 7.1 Sviluppo locale
- `pnpm install` → `pnpm dev` (Vite dev server con CORS aperto solo verso `https://www.owlbear.rodeo`).
- Per testare l'estensione in OBR: caricare il manifest dal dev URL (es. `http://localhost:5173/manifest.json`) come custom extension nella stanza.
- `pnpm build` produce `dist/` da pubblicare statico.
- Aggiornare gli **indici mostri / terrain**: in dev mode (`?dev=true`) gli script `generateMonsterIndex` e `generateDynamicTerrainIndex` interrogano Supabase per ricostruire `monsterIndex.json` / `dynamicTerrainIndex.json`. Lo script `scripts/writeDynamicTerrainIndex.ts` può essere eseguito anche stand-alone. I dati vanno prima caricati in Supabase tramite lo script `scripts/migrateToSupabase.ts`.

### 7.2 Stack di deploy (produzione)

| Componente | Servizio / Tool |
| --- | --- |
| **Hosting** | **[Render](https://dashboard.render.com/)** — Static Site |
| **Sorgente** | Repository GitHub [`DelloDavide/draw-steel-tools-2`](https://github.com/DelloDavide/draw-steel-tools-2) |
| **Build command** | `pnpm install && pnpm build` |
| **Publish directory** | `dist` |
| **CORS** | Header `Access-Control-Allow-Origin: https://www.owlbear.rodeo` (definito in [public/_headers](public/_headers), rispettato automaticamente da Render) |
| **Backend dati** | **[Supabase](https://supabase.com/)** — tabella `bestiary_documents` (JSONB) + bucket `hero-images` (Storage). Variabili env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (da configurare anche su Render) |

**Flusso di deploy:**

1. Push su `main` del repo GitHub.
2. Render rileva il push tramite webhook e avvia un nuovo deploy automatico.
3. Render esegue il build command (`pnpm install && pnpm build`) nel suo ambiente.
4. Il contenuto di `dist/` viene pubblicato come sito statico.
5. Il file [public/_headers](public/_headers) viene copiato in `dist/` da Vite e Render lo applica come header di risposta a tutte le risorse (`Access-Control-Allow-Origin: https://www.owlbear.rodeo`).
6. Owlbear Rodeo carica l'estensione dal manifest pubblicato all'URL Render.

> **Nota:** Render supporta nativamente i file `_headers` per Static Sites, con la stessa sintassi usata da Cloudflare Pages / Netlify. Non è necessaria configurazione aggiuntiva.

---

## 8. Dipendenze esterne / integrazioni

- **Supabase** (tabella `bestiary_documents` + bucket `hero-images`): sorgente dati per tutti gli statblock JSON e le immagini degli eroi. I dati originali provengono dal repo GitHub `DelloDavide/data-bestiary-json` e vengono migrati con `scripts/migrateToSupabase.ts`. Setup documentato in [docs/supabase-setup.md](docs/supabase-setup.md).
- **GitHub API** (write-back): gli helper `saveHeroInventory`, `saveHeroProjects`, `saveHeroSkills` scrivono direttamente sul repo `DelloDavide/data-bestiary-json` tramite `githubClient.ts`. Richiede la variabile env `VITE_GITHUB_TOKEN` (PAT con scope `contents:write`). Il client aggiorna anche la cache in-memory Supabase via `setTypedDataCache`.
- **Connected Dice** (estensione opzionale OBR): se installata, sostituisce i power roll testuali con simulazione fisica.
- **Pretty Sordid** (estensione OBR): sincronizza il numero di round.
- **Owlbear Rodeo SDK** (`@owlbear-rodeo/sdk`): tutte le API per scene, items, room, player, theme, contextMenu, popover, action, broadcast.

---

## 9. Aree di rischio note (osservate leggendo il codice)

1. **Sincronizzazione Supabase ↔ repo GitHub**: i dati in Supabase vanno aggiornati manualmente (via `scripts/migrateToSupabase.ts`) quando il repo `data-bestiary-json` cambia. Il write-back con `VITE_GITHUB_TOKEN` aggiorna direttamente singoli file hero ma non riesegue la migrazione globale.
2. **Strict mode + React 19**: `useEffect` con dipendenze `[]` per le sottoscrizioni OBR — corretto, ma in StrictMode dev il double-invoke registra due listener temporaneamente. Verificare che i `return unsubscribe` siano sempre restituiti nei nuovi `useEffect`.
3. **Validazioni Zod parse vs safeParse**: in molti hook si usa `parse` (lancia eccezioni). Un dato di stanza corrotto può crashare l'iframe.
4. **`fetch("/manifest.json")` in console version log**: dipende dal fatto che il server espone `/manifest.json` come root (vero in OBR, vero in Vite dev se file in `public/`).
5. **i18n**: tutte le stringhe sono hard-coded in inglese.
6. **`VITE_GITHUB_TOKEN` nel frontend**: il token GitHub è esposto nel bundle JS lato client (variabile `VITE_`). Va usato un PAT con scope minimale (`contents:write` solo sul repo `data-bestiary-json`) e revocato se compromesso.

---

## 10. Possibili miglioramenti, fix, nuove feature

### 10.1 Bug fix consigliati

Nessun bug fix noto in sospeso al momento.

### 10.2 Refactor / qualità

- **State management**: la maggior parte dello stato vive in `useState` e custom hook. Per `ActionMenu` la combinazione di `rollAttributes`, `result`, `diceRoller`, `settings`, `trackers` rende il file complesso — valutare un piccolo store (Zustand è già "leggero", oppure `useReducer` locale).
- **Performance overlay**: `refreshAllAttachments` rifà tutti gli overlay quando `playerRole`/`settings` cambiano. Si potrebbe diffare per `image.id`.
- **Zod `parse` vs `safeParse`**: in molti hook si usa `parse` che lancia eccezioni — valutare migrazione a `safeParse` con fallback graceful per evitare crash da dati corrotti.

### 10.3 Nuove feature

| # | Feature | Note |
| --- | --- | --- |
| N1 | **Conditions/status tracker** sui token (slowed, weakened, frightened, ...) con icone e auto-cleanup a fine round. | Sfrutta i metadati item esistenti + overlay. |
| N2 | **Initiative tracker integrato** con squadre (heroes vs villains) coerente con Draw Steel, in alternativa/complemento a Pretty Sordid. | Riusare `broadcastRoundProtocol`. |
| N3 | **Auto-apply damage** dal Power Roll al token selezionato (button "Applica al target") con calcolo tier→danno dichiarato dallo statblock. | Richiede legare il power roll al contesto del token. |
| N4 | **Undo/redo** delle modifiche stamina (history a livello di token, vivibile per N step). | Importante perché l'inline math è "destruttivo". |
| N5 | **Notes condivise** sui mostri (campo già presente sugli eroi: estendere). | Schema in `MonsterTokenDataZod`. |
| N6 | **Import statblock JSON locale** (drag-and-drop) per chi non vuole usare GitHub. | `StatblockBuilder` ha già la UI. |
| N7 | **Localizzazione i18n** (almeno IT/EN) tramite `react-i18next`. | Stringhe sono ora hard-coded. |
| N8 | **Autosave/migrations** dei metadata: vector di versione + funzioni di migrazione, così cambi futuri allo schema non rompono dati esistenti. | Zod facilita l'aggiunta di un campo `schemaVersion`. |
| N9 | **Macro / Quick actions** (set definizione di abilità ricorrenti) accessibili dal contextMenu. | Nuovo tipo di metadata. |
| N10 | **Modalità offline / cache statblock**: cache in-memory dei fetch Supabase già implementata in `getTypedData.ts` (`typedDataCache`). Manca ancora la persistenza su `localStorage`/IndexedDB tra refresh. | Cache in-memory attiva; persistenza cross-refresh ancora mancante. |
| N11 | **Token aura** (zone d'effetto circolari) renderizzate come overlay. | Estende `createTokenOverlay`. |
| N12 | **Player handouts** per i bundle hero (mostra al giocatore una scheda compatta). | Nuovo entry HTML opzionale. |
| N13 | **Rollog**: log persistente dei power roll della sessione, esportabile. | Extension to `useRoundMessageHandler`. |
| N14 | **Test E2E** con Playwright dentro un OBR mocked (almeno smoke su action/contextMenu). | Stabilità delle release. |
| N15 | **Aria/A11y review**: audit dei componenti UI custom (focus ring, label, role). | Diversi input usano placeholder come label. |
| N16 | **CI GitHub Actions**: lint + build + (futuri) test ad ogni push, deploy su tag. | Manca workflow. |
| N17 | **CHANGELOG.md** automatico (release-please o changesets). | Versione manifest cresce a mano. |

### 10.4 DX / repository hygiene

- **CI GitHub Actions**: lint + build + test ad ogni push, deploy su tag. Manca ancora un workflow `.github/workflows/`.
- **CHANGELOG.md** automatico (release-please o changesets): la versione manifest cresce a mano.

---

## 11. Glossario rapido (Draw Steel ↔ codice)

- **Stamina**: HP. Campo `stamina` / `staminaMaximum`. "Winded" = `stamina ≤ staminaMaximum / 2` (visualizzato dai segmenti delle health bars).
- **Temporary Stamina**: scudi temporanei. Cracked-heart icon: applica negativo al campo `stamina`.
- **Recovery**: pool di guarigioni; pulsing-heart icon spende un recovery e somma il valore di recovery alla stamina.
- **Surges**: mini-pool da spendere per escalation. Solo Hero.
- **Heroic Resource**: risorsa di classe (focus, drama, pyre, ecc.). Bottone configurabile (`D3`, `D3+1`, `+2`, `+3`).
- **Hero Tokens**: pool condiviso fra giocatori. Tracker di stanza visibile a tutti.
- **Malice**: pool del GM per round. Calcolato in base al numero di eroi e al round corrente nel `MaliceCalculator`.
- **Edges / Banes**: vantaggi/svantaggi (`netEdges` ∈ [-2..2]). Edge singolo +2, doppio = upgrade tier; lo stesso al contrario per bane.
- **Tier 1/2/3**: tre livelli di esito di un Power Roll.
- **Critical**: naturale ≥ 19 ⇒ tier 3 + extra (gestito caller-side).
- **Minion**: creatura debole; raggruppata in `MinionGroup` con stamina cumulativa.

---

## 12. Punti di partenza consigliati per un agente

- Vuoi modificare la UI di un editor token? → [src/contextMenu/TokenEditor.tsx](src/contextMenu/TokenEditor.tsx) e [src/contextMenu/components/](src/contextMenu/components/).
- Vuoi cambiare l'aspetto delle bar/etichette in scena? → [src/background/overlays/](src/background/overlays/) + costanti in `createContextMenuItems`.
- Vuoi aggiungere un nuovo tracker condiviso? → [src/types/roomTrackersZod.ts](src/types/roomTrackersZod.ts) + [src/action/resourceTracker/ResourceTracker.tsx](src/action/resourceTracker/ResourceTracker.tsx) + [src/resourceCalculator/](src/resourceCalculator/).
- Vuoi cambiare la logica del Power Roll? → [src/action/diceRoller/helpers.ts](src/action/diceRoller/helpers.ts) (`powerRoll`).
- Vuoi cambiare/integrare la sorgente statblock? → [src/supabaseClient.ts](src/supabaseClient.ts), [src/statblockSearch/helpers/getTypedData.ts](src/statblockSearch/helpers/getTypedData.ts) e [src/helpers/heroDataFromStatblockName.ts](src/helpers/heroDataFromStatblockName.ts) / [src/helpers/monsterDataFromStatblockName.ts](src/helpers/monsterDataFromStatblockName.ts) / [src/helpers/dynamicTerrainDataFromStatblockName.ts](src/helpers/dynamicTerrainDataFromStatblockName.ts).
- Vuoi modificare il write-back di hero data (skills/projects/inventory)? → [src/helpers/saveHeroSkills.ts](src/helpers/saveHeroSkills.ts), [src/helpers/saveHeroProjects.ts](src/helpers/saveHeroProjects.ts), [src/helpers/saveHeroInventory.ts](src/helpers/saveHeroInventory.ts), [src/helpers/githubClient.ts](src/helpers/githubClient.ts).
- Vuoi aggiungere un tipo di terreno dinamico? → [src/statblockSearch/dynamicTerrainIndex.json](src/statblockSearch/dynamicTerrainIndex.json) + [src/types/dynamicTerrainDataBundlesZod.ts](src/types/dynamicTerrainDataBundlesZod.ts) + `scripts/writeDynamicTerrainIndex.ts`.
- Vuoi aggiungere un setting? → estendi [src/types/settingsZod.ts](src/types/settingsZod.ts), aggiorna `defaultSettings` in [src/helpers/settingsHelpers.ts](src/helpers/settingsHelpers.ts), aggiungi una riga in [src/settings/SettingsList.tsx](src/settings/SettingsList.tsx), e (se influisce sugli overlay) consumalo in `background/statAttachments.ts`.
- Vuoi nuove voci di context menu? → [src/background/createContextMenuItems.ts](src/background/createContextMenuItems.ts).

---

_Fine documento. Generato come briefing per agenti AI; aggiornare quando lo schema dati o le macro-aree cambiano._
