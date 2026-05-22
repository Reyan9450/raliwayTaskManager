# Taskify

A full-stack collaborative task management application with role-based access control, Kanban board with drag-and-drop, smart priority scoring, member task tracking, and a statistics dashboard.

Stack: Node.js + Express + MongoDB · React + Vite + Tailwind CSS · JWT + bcrypt · dnd-kit · Recharts

---

LIVE DEMO
---------

Frontend : https://raliwaytaskmanager-production-5a27.up.railway.app/
Backend  : https://raliwaytaskmanager-production.up.railway.app

Demo Credentials:

  Role    | Email                | Password
  --------|----------------------|-----------
  Admin   | admin@example.com    | Admin1234!
  Member  | member@example.com   | Member1234!

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React SPA  (Vite + Tailwind CSS)            │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │  AuthContext │  │  TaskContext  │  │ ToastContext  │  │  │
│  │  │  (JWT store) │  │ (useReducer) │  │ (global notif)│  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │  │
│  │         │                 │                               │  │
│  │  ┌──────▼─────────────────▼──────────────────────────┐  │  │
│  │  │              Axios API Client                      │  │  │
│  │  │  • Bearer token injection (request interceptor)   │  │  │
│  │  │  • 401 auto-logout (response interceptor)         │  │  │
│  │  │  • Base URL from VITE_API_URL env var             │  │  │
│  │  └──────────────────────┬─────────────────────────────┘  │  │
│  └─────────────────────────┼────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (Node.js)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Middleware Stack                        │  │
│  │  cors → express.json → authMiddleware → requireRole      │  │
│  │  → validate(Joi) → controller → errorHandler             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ /api/auth  │  │ /api/projects│  │    /api/tasks        │   │
│  │            │  │              │  │                      │   │
│  │ POST       │  │ GET  (any)   │  │ GET  project/:id     │   │
│  │ /register  │  │ POST (Admin) │  │ POST         (Admin) │   │
│  │ /login     │  │ DELETE(Admin)│  │ PUT  :id     (Admin) │   │
│  │            │  │ POST members │  │ PATCH:id/status(any) │   │
│  │            │  │ DELETE member│  │ DELETE:id    (Admin) │   │
│  └────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Priority Engine (pure functions)            │  │
│  │  priorityScore = (daysLeft × -2) + (taskAge × 1.5)      │  │
│  │  High: score < -10 │ Medium: -10–10 │ Low: score ≥ 10   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │ Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MONGODB ATLAS                            │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│   │    users     │   │   projects   │   │      tasks       │  │
│   │              │   │              │   │                  │  │
│   │ name         │   │ title        │   │ title            │  │
│   │ email        │   │ description  │   │ description      │  │
│   │ passwordHash │   │ admin →users │   │ projectId→proj   │  │
│   │ role         │   │ members[]    │   │ assignedTo→users │  │
│   │              │   │   →users     │   │ status           │  │
│   │              │   │              │   │ dueDate          │  │
│   │              │   │              │   │ createdAt        │  │
│   └──────────────┘   └──────────────┘   └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend Component Tree

```
App
├── AuthProvider          ← JWT + user identity
│   └── ToastProvider     ← Global notifications
│       └── TaskProvider  ← useReducer task cache
│           ├── /login    → LoginPage
│           ├── /register → RegisterPage
│           └── ProtectedRoute
│               └── Layout
│                   ├── Sidebar
│                   │   ├── Taskify brand + nav links
│                   │   ├── Project list (auto-loaded)
│                   │   └── Sign out
│                   ├── /dashboard → DashboardPage
│                   │   ├── StatCards (5 metrics)
│                   │   ├── TaskPieChart (Recharts)
│                   │   ├── ProjectProgressBar × N
│                   │   ├── MemberTracker (Admin only)
│                   │   └── OverdueTasks alert
│                   └── /projects/:id → ProjectPage
│                       ├── TaskSummaryBar
│                       ├── KanbanBoard (DndContext)
│                       │   ├── KanbanColumn (Todo)
│                       │   │   └── TaskCard × N
│                       │   ├── KanbanColumn (In Progress)
│                       │   │   └── TaskCard × N
│                       │   └── KanbanColumn (Done)
│                       │       └── TaskCard × N
│                       └── TaskModal (Admin only)
```

### Request Lifecycle

```
Browser Request
      │
      ▼
  CORS check ──── rejected ──→ 403
      │
      ▼
 express.json()   (parse body)
      │
      ▼
 authMiddleware ── no/bad JWT ──→ 401
      │  attaches req.user = { id, role }
      ▼
 requireRole() ─── wrong role ──→ 403
      │
      ▼
 validate(Joi) ─── invalid body ─→ 400
      │
      ▼
  Controller
      │
      ▼
  Mongoose query ── DB error ──→ errorHandler
      │
      ▼
 Priority Engine  (compute score/level/isOverdue)
      │
      ▼
  JSON response 200/201
```

### Role-Based Access Control

```
                    Admin           Member
─────────────────────────────────────────────
Register/Login        ✅               ✅
View own projects     ✅               ✅
Create project        ✅               ❌
Delete project        ✅               ❌
Add/remove members    ✅               ❌
View all tasks        ✅               ❌ (own only)
Create task           ✅               ❌
Edit task             ✅               ❌
Delete task           ✅               ❌
Update task status    ✅ (any)         ✅ (own only)
View member tracker   ✅               ❌
```

---

## Project Structure

```
taskify/
├── backend/
│   ├── src/
│   │   ├── controllers/     authController, projectController, taskController
│   │   ├── middleware/       auth, requireRole, validate, errorHandler
│   │   ├── models/           User, Project, Task
│   │   ├── routes/           auth, projects, tasks, users
│   │   ├── schemas/          Joi validation schemas
│   │   ├── scripts/          adminSeed, demoSeed, resetSeed
│   │   ├── utils/            priorityEngine
│   │   ├── app.ts            Express app setup
│   │   └── server.ts         MongoDB connect + HTTP listen
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              axiosClient, auth, projects, tasks, users
│   │   ├── components/       KanbanBoard, KanbanColumn, TaskCard,
│   │   │                     TaskModal, TaskPieChart, ProjectProgressBar,
│   │   │                     Sidebar, Layout, Spinner, ProtectedRoute
│   │   ├── context/          AuthContext, TaskContext, ToastContext
│   │   ├── pages/            LoginPage, RegisterPage, DashboardPage, ProjectPage
│   │   ├── types/            index.ts (shared interfaces)
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET
npm install
npm run dev            # starts on http://localhost:5000
```

Seed demo data:
```bash
npm run seed:demo
# Admin:  admin@example.com  / Admin1234!
# Member: bob@example.com    / Member1234!
# Member: carol@example.com  / Member1234!
# Member: david@example.com  / Member1234!
```

### Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm install
npm run dev            # starts on http://localhost:5173
```

---

## Features

| Feature | Description |
|---------|-------------|
| Role-based auth | Admin and Member roles with JWT, enforced on API and UI |
| Kanban board | Drag-and-drop with dnd-kit, optimistic updates + rollback |
| Smart priority | Auto-computed score: `(daysLeft × -2) + (taskAge × 1.5)` |
| Overdue detection | Tasks past due date highlighted with red border + badge |
| Admin dashboard | 5 stat cards, pie chart, progress bars, member tracker |
| Member tracker | Per-member task breakdown with live progress bars |
| Responsive | Works from 320px to 1920px, collapsible sidebar on mobile |
| Toast notifications | Success/error feedback on all async operations |

---

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/users` | JWT | List all users |
| GET | `/api/projects` | JWT | List my projects |
| POST | `/api/projects` | Admin | Create project |
| DELETE | `/api/projects/:id` | Admin | Delete + cascade tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/tasks/project/:projectId` | JWT | List tasks (role-filtered) |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Admin | Full task update |
| PATCH | `/api/tasks/:id/status` | JWT | Status-only update |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/health` | — | Health check |

---

## Deployment

### Backend → Railway / Render

Set environment variables:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-long-secret
CORS_ORIGIN=https://your-frontend-url.com
NODE_ENV=production
```

Build: `npm install && npm run build`  
Start: `node dist/server.js`

### Frontend → Vercel / Render Static

Set environment variable:
```
VITE_API_URL=https://your-backend-url.com
```

Build: `npm run build`  
Output: `dist/`
