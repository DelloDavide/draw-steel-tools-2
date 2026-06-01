[Project Website](https://github.com/DelloDavide/draw-steel-tools-2)

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for an overview of the project structure, entry points, and conventions.

## Building

This project uses [pnpm](https://pnpm.io/) as a package manager.

To install all the dependencies run:

`pnpm install`

To run in a development mode run:

`pnpm dev`

To make a production build run:

`pnpm build`

## Updating the Monster Index

- Create a branch of data-bestiary-json on github with statblock changes
- Modify getStatblockUrl.ts and branchName.ts to target that branch
- Run `pnpm dev`. Replace {window.origin} below with the local url
- Go to {window.origin}/statblockSearch?dev=true
- Click "Validate Statblocks" and "Validate Malice" to make sure all existing entries exist in the modified data-bestiary-json.
- Click "Generate Index". Fix any errors and retry if necessary.
- Click "Download Index" when the index is done generating
- Replace the current monsterIndex.json in draw-steel-tools-2 with the file you downloaded
- Click "Validate Statblocks" and "Validate Malice" to make sure all index entries fetch valid data. If there are errors Draw Steel Tools may crash when unexpected data is encountered.
- Revert changes to getStatblockUrl.ts and branchName.ts
- Push changes to github
- Publish changes to data-bestiary-json and draw-steel-tools-2 at the same time where they are hosted to prevent a mismatch between versions in production
