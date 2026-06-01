# Architecture

High-level overview of the Draw Steel Tools 2 codebase.

## Tech Stack

- **Vite 7** — Build tool (multi-page app)
- **React 19** + **TypeScript 5.8** — UI framework
- **Tailwind CSS 4** — Styling
- **Zod 4** — Schema validation
- **@owlbear-rodeo/sdk 3.1** — Owlbear Rodeo plugin API
- **Supabase** — Bestiary database & hero image storage
- **Vitest** — Testing (jsdom environment)

## Directory Structure

```
src/
├── action/              # Action menu (dice roller, resource tracker, round header)
├── background/          # Background script (context menus, stat attachments, overlays)
├── components/          # Shared UI components, icons, logic helpers
├── contextMenu/         # Context menu panels (token editor, minion management)
├── helpers/             # Utility hooks, helpers, and shared logic
├── protocols/           # Broadcast protocol definitions (dice, rounds)
├── resourceCalculator/  # Hero tokens & malice calculator
├── rulesReference/      # Static rules data (definitions.json)
├── settings/            # Settings panel
├── statblockBuilder/    # Monster statblock builder UI
├── statblockSearch/     # Statblock search with Supabase backend
├── statblockViewer/     # Statblock viewer (renders attached stats)
└── types/               # Shared TypeScript types
```

## Entry Points

Each HTML file at the project root is a separate Vite entry point registered in `vite.config.ts`:

| File | Purpose |
|------|---------|
| `action.html` | Action menu (popover) |
| `background.html` | Background script (headless) |
| `contextMenu.html` | Right-click context menu panels |
| `settings.html` | Plugin settings |
| `statblockBuilder.html` | Monster statblock builder |
| `statblockSearch.html` | Search & manage statblocks |
| `statblockViewer.html` | Render statblocks on tokens |
| `resourceCalculator.html` | Hero tokens & malice calculator |

## Broadcast Protocols

Inter-client communication uses the OBR Broadcast API. Protocol definitions live in `src/protocols/`. See [docs/broadcast-protocols.md](docs/broadcast-protocols.md) for details.

## Key Conventions

- **ErrorBoundary** wraps every entry point's root component
- **Settings** use a dedicated metadata key (`getPluginId("settings")`) with legacy migration
- **Context menu filters** use typed helpers from `src/background/contextMenuFilters.ts`
- **Configurable logger** available via `src/helpers/logger.ts`
