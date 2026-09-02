# Modern RPG

Browser-based 2D RPG MVP built with React, TypeScript, Vite, Phaser 4, Node.js, Express, and WebSocket scaffolding.

## Run

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` starts the client and server together.
- `npm run build` builds both packages.
- `npm run typecheck` runs TypeScript checks for both packages.

## Architecture

- `client/` owns React UI, Phaser gameplay, HUD, and local save state.
- `server/` owns the Express health endpoint and future realtime foundation.
- `shared/types/` stores cross-package TypeScript contracts.# Game
