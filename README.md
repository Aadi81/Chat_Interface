# Realtime Chat App

A full-stack real-time chat application built with React (Vite) on the frontend
and Node.js + Express + Socket.io on the backend, with chat history persisted
to SQLite.

## Project structure

```
realtime-chat-app/
├── server/                # Express + Socket.io + SQLite backend
│   └── src/
│       ├── db/            # SQLite connection + schema
│       ├── controllers/   # Message validation + persistence logic
│       ├── routes/        # REST endpoints (auth, messages)
│       ├── sockets/        # Socket.io connection/typing/presence handlers
│       └── index.js       # App entry point
└── client/                 # React (Vite) frontend
    └── src/
        ├── api/            # REST client + socket.io-client singleton
        ├── context/        # Auth (username) context
        ├── hooks/          # useChatSocket — socket lifecycle & events
        ├── components/     # LoginScreen, ChatWindow, MessageList, etc.
        └── App.jsx
```

## Prerequisites

- Node.js 18+ and npm

## Backend setup

```powershell
cd server
npm install
copy .env.example .env
npm run dev
```

The server starts on `http://localhost:4000` (configurable via `.env`).
A SQLite file is created automatically at `server/data/chat.db` on first run.

### Backend environment variables (`server/.env`)

| Variable         | Default                   | Description                                   |
|------------------|---------------------------|------------------------------------------------|
| `PORT`           | `4000`                    | Port the Express/Socket.io server listens on   |
| `CLIENT_ORIGIN`  | `http://localhost:5173`   | Allowed CORS origin for REST + Socket.io       |
| `DB_PATH`        | `./data/chat.db`          | Path to the SQLite database file               |

## Frontend setup

In a separate terminal:

```powershell
cd client
npm install
copy .env.example .env
npm run dev
```

The app runs on `http://localhost:5173` by default (Vite's default port).

### Frontend environment variables (`client/.env`)

| Variable            | Default                 | Description                              |
|---------------------|--------------------------|-------------------------------------------|
| `VITE_SERVER_URL`    | `http://localhost:4000`  | Base URL the client uses for REST calls and the Socket.io connection |

## Using the app

1. Start the backend, then the frontend (see above).
2. Open `http://localhost:5173` in a browser (open it in two different
   browser windows/profiles, or a normal window + an incognito window, to
   simulate two users — a single browser profile can only hold one active
   username in `sessionStorage` at a time).
3. Enter a username on the login screen and click **Join chat**. This is a
   dummy login — any non-empty username is accepted, no password.
4. Send messages, and watch them arrive in real time in the other window.
5. Type in the input to see the typing indicator appear for the other user.
6. Check the online-users bar at the top to see who is currently connected.
7. Refresh the page — chat history is reloaded from the backend via `GET /api/messages`,
   and your username is preserved for the session (via `sessionStorage`), so you
   don't have to log in again until you close the tab.

## REST API

| Method | Path               | Body                          | Description                          |
|--------|--------------------|--------------------------------|---------------------------------------|
| POST   | `/api/auth/login`  | `{ "username": string }`       | Dummy login — validates and returns the username |
| GET    | `/api/messages`    | —                               | Fetch chat history (most recent 50 by default; supports `?limit=` and `?before=<messageId>` for pagination) |
| POST   | `/api/messages`    | `{ "username": string, "text": string }` | Persists a message and broadcasts it to all connected clients via Socket.io |

## Socket.io events

| Event             | Direction        | Payload                              | Purpose                                  |
|-------------------|------------------|----------------------------------------|--------------------------------------------|
| `user:join`       | client → server  | `username`                             | Registers the socket under a username for presence tracking |
| `users:online`    | server → clients | `string[]` of usernames                | Broadcast whenever the online user list changes |
| `message:new`     | server → clients | message object (`id`, `username`, `text`, `created_at`) | Broadcast right after a message is persisted via the REST endpoint |
| `typing:start`    | client → server  | —                                       | Sent while the user is typing              |
| `typing:stop`     | client → server  | —                                       | Sent after a pause in typing (debounced) or when input is cleared |
| `typing:update`   | server → clients | `{ username, isTyping }`               | Broadcast to everyone except the typing user |

## Design decisions

- **REST for writes, Socket.io for fan-out.** Sending a message goes through
  `POST /api/messages` (satisfying the mandatory REST requirement); the route
  handler persists it to SQLite and then emits `message:new` over the shared
  `io` instance so every connected client (including the sender) receives the
  authoritative, persisted message exactly once. This avoids maintaining two
  separate code paths (REST insert vs. socket insert) for the same operation.
- **SQLite via `better-sqlite3`** was chosen over MongoDB for a self-contained,
  zero-external-services setup — no separate database server to install or
  connect to. `better-sqlite3` is synchronous, which keeps the controller code
  simple, and ships prebuilt binaries so it installs cleanly on Windows.
- **Dummy, stateless auth.** `POST /api/auth/login` just validates and echoes
  back a trimmed, non-empty username — there is no password, session token, or
  user table. The frontend remembers the username in `sessionStorage` (cleared
  on tab close) purely so a page refresh doesn't force a re-login within the
  same tab.
- **Presence and typing state are in-memory only** (a `Map` in
  `server/src/sockets/index.js`), not persisted to SQLite — they're inherently
  ephemeral/live state tied to active socket connections, so persisting them
  would add complexity without value.
- **Clean separation on the backend**: routes only handle HTTP
  request/response concerns, controllers own validation + persistence, and
  sockets own connection lifecycle — so REST and Socket.io code never
  duplicate business logic.
- **Frontend structure** mirrors this: `api/` for network concerns (fetch
  wrapper + socket singleton), `hooks/useChatSocket` for all socket event
  wiring, `context/AuthContext` for the logged-in username, and presentational
  `components/` for the UI.

## Assumptions

- A single shared/global chat room — no private messaging or multiple rooms.
- Usernames are not unique/reserved; two people can join with the same name
  (there's no real authentication, per the dummy-login requirement).
- Messages are plain text only (no attachments/images), capped at 2000
  characters.
- Chat history pagination (`GET /api/messages?before=<id>`) is implemented on
  the backend, but the frontend currently only loads the most recent 50
  messages on load rather than infinite-scroll-loading older pages.
- Typing indicator is debounced client-side (1.5s of inactivity) rather than
  firing on every keystroke, to keep socket traffic reasonable.

## Bonus features implemented

- ✅ Username-based login (dummy authentication)
- ✅ Typing indicator
- ✅ Online/offline user status
- ✅ Messages stored in SQLite
- ⬜ Message read/delivered status — not implemented
- ⬜ Backend deployment — not deployed; run locally per the instructions above
