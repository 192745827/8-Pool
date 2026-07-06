# 8-Ball Pool Multiplayer Architecture

This document describes the architectural layout and directory configuration of this production-quality TypeScript monorepo.

---

## 🏗️ Workspace Layout

The repository utilizes **npm Workspaces** to govern packages. It isolates client, server, and shared directories while retaining complete type-safety.

```
8-Pool/
├── package.json           # Root workspace configuration
├── tsconfig.json          # Root references configuration
├── tsconfig.base.json     # Base TS compiler properties shared by workspaces
│
├── client/                # React SPA client (Vite, TS, Tailwind CSS)
│   └── src/
│       ├── main.tsx       # DOM mounting script
│       ├── App.tsx        # Shell layout page
│       ├── routes/        # Router configuration with views
│       └── store/         # Zustand global states (Player, Room)
│
├── server/                # Node.js backend (Express, Socket.IO, Mongoose)
│   └── src/
│       ├── index.ts       # Main listener start script
│       └── config/
│           └── db.ts      # MongoDB connection initializer
│
└── shared/                # Code shared between backend and frontend
    └── src/
        └── index.ts       # Shared constants, types, interfaces
```

---

## ⛓️ Monorepo Interdependency

By declaring workspaces in `package.json`, we establish local package symbolic linking:
- Both `@pool/client` and `@pool/server` list `"@pool/shared": "*"` in their dependencies.
- During compilation, TypeScript resolves definitions from the `shared` directory automatically.
- This prevents model divergence, ensuring that when interfaces change in `shared/src/index.ts`, both client and server update their type maps in lockstep.

---

## ⚙️ Key Configuration Details

### 1. Unified TypeScript Reference Graph (`tsconfig.json` & references)
We configure TypeScript Project References:
- Root `tsconfig.json` lists `{ "references": [ { "path": "./shared" }, ... ] }`.
- When sub-packages reference their dependencies, compilation changes trigger a cascade rebuild, compiling shared objects before rebuilding client or server packages.

### 2. Path Aliases
Path alias mappings allow cleaner relative paths:
- In `client/tsconfig.json`, we configure `"@/*": ["src/*"]`.
- In `client/vite.config.ts`, we load `vite-tsconfig-paths`, allowing code like:
  ```typescript
  import { useGameStore } from '@/store/useGameStore';
  ```
  This resolves directly without relative traversal (e.g. `../../store/...`).

### 3. State & Styles
- **Zustand**: Handles atomic component state management without loading complex reducer setups.
- **Tailwind CSS**: Runs inside PostCSS, injecting utility definitions into `client/src/index.css`.
