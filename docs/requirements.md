# 8-Ball Pool Multiplayer - Requirements

This document outlines the functional and non-functional requirements for the Multiplayer 8-Ball Pool game.

---

## 1. Functional Requirements

### 1.1 User Management & Auth
- **User Creation:** Users should be able to choose a username when entering the game.
- **User Statistics:** The database must track the player's lifetime statistics, including:
  - Total games played
  - Total games won
  - Win ratio

### 1.2 Lobby & Matchmaking
- **Create Game Room:** Players can create a private or public game room.
- **Join Game Room:** Players can join a room via a room code / ID or a matchmaking system.
- **Player Readiness:** In the room lobby, players must toggle their "Ready" status. The game starts when both players in the room are ready.
- **Lobby Status:** Real-time updates showing current rooms, player counts, and active connections.

### 1.3 Gameplay Engine (In-Game)
- **Pool Table Rendering:** A visually appealing 2D canvas/SVG pool table that scales dynamically on different screen sizes.
- **Cue Control:** Interactive controls for aiming the cue stick, setting shot power, and executing the shot.
- **Physics Engine:** Real-time simulations for:
  - Ball-to-ball elastic collisions.
  - Ball-to-cushion rebounds.
  - Friction and deceleration (rolling resistance).
  - Pocketeing mechanics (detecting when balls drop into any of the six pockets).
* **Game Rules (Standard 8-Ball):**
  - **Cue Ball:** Must be used to strike target balls.
  - **Ball Groups:** Division of balls into Solids (1–7) and Stripes (9–15) based on the first legal pocketed ball.
  - **The 8-Ball:** Must be pocketed last to win. Pocketing it early or committing a scratch while pocketing the 8-ball results in an automatic loss.
  - **Turns & Fouls:** Alternating turns between players. Fouls (e.g. scratch, no ball hit, wrong ball hit) give the opponent "ball-in-hand".

### 1.4 Multiplayer Sync
- **Turn Management:** Server-authoritative turn control. Timer ticks down for active player's turn.
- **Action Broadcast:** Live synchronization of aiming, shot strength, and ball trajectories across all connected clients via WebSockets.
- **Disconnect Handling:** If a player disconnects, a grace period should trigger, failing which the remaining player wins.

---

## 2. Non-Functional Requirements

### 2.1 Performance & Latency
- **Real-time Sync:** WebSocket event latency should remain below 100ms to preserve smooth gameplay sync.
- **Smooth Animations:** Canvas rendering must run at 60 FPS under normal device loads.

### 2.2 Security
- **Server Validation:** The server must validate shots and ball positions to prevent client-side hacks (e.g. illegal shot power or position modifications).

### 2.3 Usability & Design
- **Responsive Layout:** The pool table viewport must maintain its aspect ratio (2:1) across mobile, tablet, and desktop screens.
- **Premium Aesthetics:** Dark mode styling, smooth micro-interactions, glassmorphism UI widgets, and sound effects for collisions.
