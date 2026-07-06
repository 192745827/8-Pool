# 8-Ball Pool Multiplayer - Roadmap

This document maps out the phases of development for the Multiplayer 8-Ball Pool Monorepo project.

---

## 🗺️ Project Phases

### 🟩 Phase 1: Core Setup & Monorepo Structure (Completed)
- [x] Configure npm workspaces for `client`, `server`, and `shared`.
- [x] Build shared type definitions (`Player`, `GameRoom`) in `@pool/shared`.
- [x] Establish unified TypeScript configurations and project references.
- [x] Create client shell layouts with Vite, Tailwind CSS, and React Router.
- [x] Create server shell with Node.js, Express, Socket.IO, and Mongoose integration.

### 🟨 Phase 2: User Profiles & Persistent State (In Progress)
- [ ] Connect database persistence layer to mongoose models ([User.ts](file:///c:/Users/tejas/OneDrive/文件/Projects/8-Pool/server/src/models/User.ts)).
- [ ] Implement REST endpoints on the Express server:
  - `POST /api/users` - Create user profile or login.
  - `GET /api/users/:username` - Fetch player statistics.
- [ ] Integrate Axios inside client to fetch player states and update the Zustand game store ([useGameStore.ts](file:///c:/Users/tejas/OneDrive/文件/Projects/8-Pool/client/src/store/useGameStore.ts)).

### 🟨 Phase 3: Lobby & Matchmaking Services
- [ ] Expand socket connection logic ([connection.ts](file:///c:/Users/tejas/OneDrive/文件/Projects/8-Pool/server/src/socket/connection.ts)) to handle:
  - Creating a room (`room:create`).
  - Joining a room (`room:join`).
  - Toggling readiness (`player:ready`).
- [ ] Build the lobby list UI in the React client to display active room codes.
- [ ] Auto-transition users from lobby path (`/`) to the game room path (`/game/:roomId`) when matched.

### 🟥 Phase 4: Canvas-Based Pool Viewport & Input Controls
- [ ] Replace static [PoolTable.tsx](file:///c:/Users/tejas/OneDrive/文件/Projects/8-Pool/client/src/components/PoolTable.tsx) with an interactive HTML5 Canvas viewport.
- [ ] Render the billiard table elements: felt, cushions, and 6 pockets based on `TABLE_CONFIG` specifications.
- [ ] Place the 15 object balls in a triangular rack and the white cue ball at the breakline.
- [ ] Implement mouse/touch drag controls for the cue stick to adjust aiming angle and power.

### 🟥 Phase 5: Physics Engine & Collision Detection
- [ ] Integrate or build a 2D physics loop (running validation scripts on client and server):
  - **Ball-to-Ball Elastic Collisions:** Conserve momentum and kinetic energy using vector math.
  - **Cushion Rebounds:** Handle bouncing off outer table cushions with restitution loss.
  - **Friction and Deceleration:** Apply friction forces to bring sliding/rolling balls to a stop.
  - **Pocket Detection:** Validate when balls overlap pocket coordinates and remove them from play.

### 🟥 Phase 6: Game Loop & Rules Validation
- [ ] Define server-authoritative turn sequences (switching turns when no balls are pocketed or fouls occur).
- [ ] Track ball groups (Solids vs. Stripes) dynamically.
- [ ] Implement collision order verification (e.g. cue ball must hit a player's assigned ball group first).
- [ ] Verify victory conditions: pocketing the black 8-ball legally after clearing all group balls.

### 🟥 Phase 7: UI/UX Polish, Audio, & Visuals
- [ ] Refine responsive designs for mobile landscape orientations.
- [ ] Add smooth CSS animations and cue hit micro-animations.
- [ ] Integrate sound effects for ball-on-ball collisions, cushion hits, and pocketing.
- [ ] Display end-game summary modals with options to rematch or exit.
