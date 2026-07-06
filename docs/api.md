# 8-Ball Pool Multiplayer - API & Socket Events Documentation

This document describes the REST API endpoints and Socket.IO real-time event interfaces.

---

## 📡 REST API (HTTP)

Used for user authentication, fetching profile statistics, and displaying global leaderboards.

### 1. Register or Login User
* **Endpoint:** `POST /api/users`
* **Content-Type:** `application/json`
* **Request Body:**
  ```json
  {
    "username": "CueMaster"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "_id": "603d2b2f8a1d2c001f3e1234",
    "username": "CueMaster",
    "gamesPlayed": 0,
    "gamesWon": 0,
    "createdAt": "2026-07-06T15:00:00.000Z"
  }
  ```

### 2. Fetch User Stats
* **Endpoint:** `GET /api/users/:username`
* **Success Response (200 OK):**
  ```json
  {
    "_id": "603d2b2f8a1d2c001f3e1234",
    "username": "CueMaster",
    "gamesPlayed": 25,
    "gamesWon": 14,
    "createdAt": "2026-07-06T15:00:00.000Z"
  }
  ```

---

## 🔌 Socket.IO API (WebSockets)

Real-time synchronization for matchmaking, room lobbies, and gameplay actions.

### 1. Connection Events

#### `connection`
Triggered automatically when a client opens a socket session.
* **Server Action:** Connects socket and maps it to `socket.id`. Registers other listeners.

#### `disconnect`
Triggered when a user exits the application or loses network.
* **Server Action:** Removes player from any active `GameRoom` lobby. If in-game, notifies the opponent of the disconnection.

---

### 2. Lobby & Room Management Events

#### `room:join` (Client ➡️ Server)
Requests to enter a specific game room lobby.
* **Payload:**
  ```json
  {
    "roomId": "room-demo",
    "playerName": "CueMaster"
  }
  ```

#### `room:updated` (Server ➡️ Client)
Fires whenever a room's state (players joining, leaving, or changing status) updates.
* **Payload:**
  ```json
  {
    "id": "room-demo",
    "players": [
      { "id": "socket_id_1", "name": "CueMaster", "isReady": true, "score": 0 },
      { "id": "socket_id_2", "name": "SpinMaster", "isReady": false, "score": 0 }
    ],
    "status": "lobby"
  }
  ```

#### `player:ready` (Client ➡️ Server)
Toggles the readiness state of a player.
* **Payload:** None (Server reads sender's `socket.id`).

#### `game:started` (Server ➡️ Client)
Fires when all players in the lobby room toggle to `ready`. Transition clients to the gameplay phase.
* **Payload:** None.

---

### 3. In-Game Synchronization Events

#### `game:shot` (Client ➡️ Server)
Emitted by the active player when shooting.
* **Payload:**
  ```json
  {
    "angle": 1.57, // Aim angle in radians
    "power": 85   // Shot strength (percentage)
  }
  ```

#### `game:sync_shot` (Server ➡️ Client)
Broadcasts the shot parameters to the opponent client so their physics loop visualizes the shot.
* **Payload:**
  ```json
  {
    "angle": 1.57,
    "power": 85
  }
  ```

#### `game:ended` (Server ➡️ Client)
Notifies both clients of the game result.
* **Payload:**
  ```json
  {
    "winnerId": "socket_id_1",
    "loserId": "socket_id_2",
    "reason": "8-ball pocketed legally"
  }
  ```
