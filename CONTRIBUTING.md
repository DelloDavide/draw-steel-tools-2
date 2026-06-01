# Contributing

## Prerequisites

- **Node.js** ≥ 22 (see `.nvmrc`)
- **pnpm** as package manager

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev          # Start Vite dev server
```

## Linting & Testing

```bash
pnpm lint         # ESLint with type-checked rules
pnpm test         # Run Vitest tests
pnpm test:watch   # Watch mode
```

## Build

```bash
pnpm build        # Production build (TypeScript check + Vite build)
```

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for an overview of the codebase layout and conventions.

## Code Style

- **EditorConfig** (`.editorconfig`) — 2-space indent, LF, UTF-8
- **ESLint** — `recommendedTypeChecked` + `react-hooks/exhaustive-deps: error`
- **TypeScript** — strict mode

## Pull Requests

1. Create a feature branch from `main`
2. Keep commits focused and descriptive
3. Ensure `pnpm lint` and `pnpm test` pass
4. Open a PR with a clear description
