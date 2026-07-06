# 8-Ball Pool Multiplayer - Database Design

This document details the MongoDB schema definitions and connection states managed by Mongoose.

---

## 🔌 Connection Setup
The database connection is established at server startup inside [server/src/config/db.ts](file:///c:/Users/tejas/OneDrive/文件/Projects/8-Pool/server/src/config/db.ts) using the `mongoose.connect()` interface. 

The connection string is read from the backend environment configuration:
```env
MONGODB_URI=mongodb://localhost:27017/8-pool
```

---

## 🗄️ Schemas & Collections

### 1. User Collection
Stores persistent player metrics, historical profiles, and game statistics. Used for authentication and leaderboard queries.

* **Schema Definition File:** [server/src/models/User.ts](file:///c:/Users/tejas/OneDrive/文件/Projects/8-Pool/server/src/models/User.ts)
* **Fields:**

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated | Unique identifier for the user. |
| `username` | String | Required, Unique, Min-length: 3, Trimmed | Screen name chosen by the player. |
| `gamesPlayed` | Number | Default: `0`, Integer | Number of matches this user completed. |
| `gamesWon` | Number | Default: `0`, Integer | Number of matches won by this user. |
| `createdAt` | Date | Default: `Date.now` | Date when the user profile was initialized. |

---

### 2. MatchHistory Collection (Proposed)
Records historical match summaries once games transition to the `ended` state. This will power match history logs and performance analytics.

* **Target File:** `server/src/models/MatchHistory.ts`
* **Proposed Fields:**

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated | Unique match identifier. |
| `roomId` | String | Required | Socket/Service room identifier. |
| `winner` | ObjectId | Ref: `'User'`, Required | Reference to the winning user profile. |
| `loser` | ObjectId | Ref: `'User'`, Required | Reference to the losing user profile. |
| `score` | Object | `{ winnerScore: Number, loserScore: Number }` | Pocketing counts at match termination. |
| `endedAt` | Date | Default: `Date.now` | Timestamp when the match concluded. |

---

## 🔄 Stats Update Workflow
When a game reaches the `ended` status:
1. The server identifies the winning user ID and losing user ID.
2. Two database update operations run in parallel:
   - For the winner: increment `gamesPlayed` by 1 and `gamesWon` by 1.
   - For the loser: increment `gamesPlayed` by 1.
3. A new document is appended to the `MatchHistory` collection logging the game metrics.
