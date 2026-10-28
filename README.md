# Door OS · Full-Stack Operating System

A complete full-stack web desktop environment combining a **Next.js 15 frontend** with an **Express + TypeScript + MongoDB + Socket.IO backend**.

---

## 🌟 Full-Stack Architecture

```
┌────────────────────────────────────────────────────────┐
│                   DOOR OS FRONTEND                     │
│  Next.js 15 · React 19 · Zustand · Framer Motion       │
│  - Multi-window desktop manager & glassmorphism UI     │
│  - Cloud file explorer & persistent Notes editor       │
│  - AI Assistant connected to backend app dispatcher    │
│  - Real-time Socket.IO multi-device synchronizer       │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (Bearer JWT)
                            │ WebSockets (Socket.IO)
┌───────────────────────────▼────────────────────────────┐
│                   DOOR OS BACKEND                      │
│  Node.js · Express · TypeScript · Mongoose · Socket.IO │
│  - Auth & JWT security (/api/auth)                     │
│  - User Preferences & Theme Sync (/api/preferences)    │
│  - Virtual File System in MongoDB (/api/fs)            │
│  - Custom App Creation & Store (/api/apps)             │
│  - Intelligent Assistant Dispatcher (/api/assistant)   │
│  - Real-Time Room Broadcasting (socket.io)             │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│                      MONGODB                           │
│  Users · VirtualFiles · Apps · UserPreferences         │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **MongoDB** (running locally on port `27017` or a cloud [MongoDB Atlas](https://www.mongodb.com/atlas) connection string)

### 2. Environment Setup
The project comes pre-configured with ready-to-run `.env` files:
- Backend: `door-os-backend/.env`
- Frontend: `door-os-frontend/.env.local`

*(To customize, edit `door-os-backend/.env` with your MongoDB URI or production JWT secret).*

### 3. Install Dependencies
Run from the root directory:
```bash
npm install
npm run install:all
```

### 4. Run Both Frontend and Backend Concurrently
Run a single command to start the entire full-stack application:
```bash
npm run dev
```

- **Frontend Desktop**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **API Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 🛠 Project Structure

```
kokila play girl/
├── package.json                 # Unified monorepo scripts & workspaces
├── .env.example                 # Global environment configuration template
├── README.md                    # Full-stack documentation
│
├── door-os-backend/             # Express + TypeScript + MongoDB Server
│   ├── .env                     # Backend environment configuration
│   ├── package.json             # Backend dependencies
│   ├── tsconfig.json
│   └── src/
│       ├── config/              # Database connection & env validation
│       ├── controllers/         # Auth, Apps, Assistant, FS, Preferences
│       ├── middleware/          # JWT authentication & error handler
│       ├── models/              # User, VirtualFile, App Mongoose schemas
│       ├── routes/              # Express API routers
│       ├── socket.ts            # Socket.IO real-time event server
│       ├── app.ts               # Express application configuration
│       └── server.ts            # HTTP & WebSocket server entrypoint
│
└── door-os-frontend/            # Next.js 15 Client Desktop App
    ├── .env.local               # Frontend API & Socket configuration
    ├── next.config.mjs          # Next.js config with API proxy rewrites
    ├── package.json             # Frontend dependencies
    ├── app/
    │   ├── layout.tsx           # HTML root layout
    │   ├── page.tsx             # Main entry page
    │   └── globals.css          # Glassmorphism & desktop styling
    ├── components/
    │   ├── DoorOS.tsx           # Root OS orchestrator & lifecycle
    │   ├── Desktop.tsx          # Wallpaper, app icons, window manager
    │   ├── Taskbar.tsx          # Start button, live status, tray, clock
    │   ├── StartMenu.tsx        # Searchable app launcher with custom apps
    │   ├── DoorWindow.tsx       # Draggable, resizable glass window
    │   ├── AppContent.tsx       # Full app implementations (Files, Notes, Assistant...)
    │   └── AuthModal.tsx        # Sign In & Account Creation dialog
    ├── lib/
    │   ├── api.ts               # Complete typed REST API client
    │   ├── socket.ts            # Socket.IO client for live synchronization
    │   └── apps.ts              # System apps metadata
    └── store/
        └── os-store.ts          # Zustand store for OS state, auth, and windows
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user (`{ name, email, password }`)
- `POST /api/auth/login` — Login with credentials (`{ email, password }`)
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Bearer <token>`)

### User Preferences
- `GET /api/preferences` — Get user desktop preferences (theme, wallpaper, open apps)
- `PUT /api/preferences` — Update desktop preferences (`{ theme, wallpaper }`)

### Virtual Filesystem (Cloud Storage)
- `GET /api/fs` — List files and folders in MongoDB
- `POST /api/fs` — Create a new file or folder (`{ name, type, content, parentId }`)
- `PUT /api/fs/:id` — Update file content or rename
- `DELETE /api/fs/:id` — Soft-delete a file

### Custom Applications
- `GET /api/apps` — List user's custom created apps
- `POST /api/apps` — Create a new custom workspace app (`{ name, description, kind }`)
- `DELETE /api/apps/:id` — Remove custom app

### Assistant
- `POST /api/assistant` — Query Door Assistant (`{ prompt }`), matches built-in tools or builds custom apps

---

## ⚡ Real-Time Socket.IO Synchronization

Door OS includes authenticated WebSocket synchronization across tabs and devices:
- **`app:opened`**: Notifies other sessions when an app is launched.
- **`window:moved`**: Synchronizes window positions.
- **`desktop:sync`**: Synchronizes wallpaper, theme, and desktop state in real time.

---

## 💻 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs backend (port 4000) and frontend (port 3000) concurrently |
| `npm run dev:backend` | Runs only the Express backend with `tsx watch` |
| `npm run dev:frontend` | Runs only the Next.js frontend |
| `npm run build` | Compiles backend TypeScript and builds Next.js production bundle |
| `npm run start` | Starts both backend and frontend production servers |
| `npm run install:all` | Installs root, backend, and frontend dependencies |

