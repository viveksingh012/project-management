# Project Camp — Frontend

A React + Tailwind CSS frontend for the Project Camp backend (PRD v1.0.0). Covers
auth (register/login/logout, email verification, forgot/reset password, change
password), projects, team members with role management, tasks with file
attachments, subtasks, and project notes — all gated by the Admin /
Project Admin / Member permission matrix from the PRD.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router v6
- Axios (cookie-based auth, with automatic refresh-token retry on 401)
- react-hot-toast for notifications
- lucide-react for icons

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

The app expects your backend at `VITE_API_BASE_URL` (default
`http://localhost:8000/api/v1`), matching the routes in the PRD exactly:
`/auth/*`, `/projects/*`, `/tasks/*`, `/notes/*`, `/healthcheck`.

## Connecting to your backend

**Auth model.** This frontend assumes your backend issues the JWT access/refresh
tokens as **httpOnly cookies** (the common setup for this PRD) and reads the
logged-in user from `GET /auth/current-user`. `src/api/axios.js` sends every
request with `withCredentials: true` and automatically calls
`POST /auth/refresh-token` and retries once on a `401`.

If your backend instead returns tokens in the JSON response body:
1. In `src/context/AuthContext.jsx`, store `accessToken` (e.g. in memory or
   `localStorage`) after `login`/`register`.
2. In `src/api/axios.js`, add a request interceptor that sets
   `Authorization: Bearer <token>` instead of relying on cookies.

**CORS.** Make sure your backend allows credentialed requests from the
frontend's origin (`Access-Control-Allow-Origin: <frontend-url>` +
`Access-Control-Allow-Credentials: true`), since the API client sends
cookies with every request.

**Response shape.** Every API call in `src/api/*.js` expects the common
`{ data: { data: ... } }` envelope (à la `ApiResponse`/`asyncHandler`
patterns). If your backend returns data at the top level instead, adjust the
`res.data?.data` reads in the page components accordingly.

**Roles.** The UI reads each project member's `role` field
(`admin` | `project_admin` | `member`) to show/hide create, edit, and delete
controls per the PRD's permission matrix. `src/lib/permissions.js` is the
single place that maps a role to capabilities — update it if your backend's
role names differ.

**File attachments.** Task creation/update sends `multipart/form-data` with
files appended under the field name `attachments`. Adjust the field name in
`src/components/project/TasksTab.jsx` if your backend expects something else
(e.g. `files`).

## Project structure

```
src/
  api/          axios instance + one file per resource (auth, projects, tasks, notes)
  context/      AuthContext — current user, login/register/logout
  components/   shared UI primitives, Navbar, Modal, badges, and project/ tab views
  pages/        route-level screens (auth/*, Projects, ProjectDetail, TaskDetail, Profile)
  lib/          utils (error messages, formatting) + role-permission helper
```

## Build

```bash
npm run build
```

Outputs a static bundle in `dist/` — deploy it anywhere that serves static
files (Vercel, Netlify, S3 + CloudFront, your backend's `public/` folder,
etc.).
