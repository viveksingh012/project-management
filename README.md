# Project Camp

A full-stack project/task management app: **React (Vite) frontend** + **Express + PostgreSQL backend**.

```
projectCampBackend/
├── projectManagement/            # Express + PostgreSQL API
└── project-camp-frontend/
    └── project-camp-frontend/    # React (Vite) app
```

## What was done

The frontend already existed and expected a REST API at `http://localhost:8000/api/v1`.
The backend's controllers were empty stubs with no real database logic. This pass:

- Wrote a full PostgreSQL schema (`users`, `projects`, `project_members`, `tasks`, `subtasks`, `notes`) — see `projectManagement/src/config/schema.sql`. It's applied automatically on server start.
- Implemented every controller (auth, projects, members, tasks, subtasks, notes) with real `pg` queries.
- Rewired all routes to match the frontend's exact API paths (`/api/v1/auth/...`, `/api/v1/projects/...`, `/api/v1/tasks/...`, `/api/v1/notes/...`).
- Added JWT access/refresh cookie auth, bcrypt password hashing, role-based permissions (`admin` / `project_admin` / `member`) per project.
- Added file-attachment uploads for tasks (multer, served from `/uploads`).
- Added CORS configured for the frontend's origin with credentials.
- Fixed a handful of bugs in the original auth code (crashes on unknown user, insert not returning the created row, etc.).
- Moved every secret/config value (DB credentials, JWT secrets, mail credentials, ports) into `.env`.

This was tested end-to-end locally (register → verify email → login → create project → add member → create task with attachment → subtasks → notes → permission checks → refresh token → logout → forgot/reset password) against a real Postgres instance, and the frontend was built successfully against this API.

## 1. Backend setup

```bash
cd projectManagement
npm install
```

Create a Postgres database (matching whatever you put in `.env`):

```bash
psql -U postgres -c "CREATE DATABASE projectcamp;"
```

Edit `.env` (already filled with sane local defaults) — at minimum check:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=projectcamp

ACCESS_TOKEN_SECRET=<replace with a long random string>
REFRESH_TOKEN_SECRET=<replace with a different long random string>

CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

Run it:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```

On boot the server automatically runs `schema.sql` (`CREATE TABLE IF NOT EXISTS ...`), so tables are created for you — no separate migration step needed. It listens on `http://localhost:8000`.

### Email (verification / password reset)

The project mails a verification link on signup and a reset link on "forgot password", using `nodemailer` + a Mailtrap sandbox SMTP account (`.env` `MAIL_*` vars) so nothing gets sent to real inboxes during development. Email sending never blocks the request — if SMTP is unreachable it just logs a warning and the API still responds normally. Swap in real SMTP credentials in `.env` for production, or a transactional provider (SendGrid, SES, etc.) by editing `src/config/mail.js`.

## 2. Frontend setup

```bash
cd project-camp-frontend/project-camp-frontend
npm install
npm run dev
```

`.env` already points at the backend:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Open `http://localhost:5173`.

## Typical flow

1. Register an account (`/register`).
2. Because outbound email is likely blocked/unset in dev, verify manually if needed by reading the token straight from the DB:
   ```sql
   SELECT verification_token FROM users WHERE email = '...';
   ```
   then visit `http://localhost:8000/api/v1/auth/verify-email/<token>` (or set up real SMTP credentials so the email link works end-to-end).
3. Log in, create a project — you're automatically its `admin`.
4. Invite teammates by email from the Members tab, assign roles (`admin`, `project_admin`, `member`).
5. Create tasks (with optional file attachments), subtasks, and notes.

## Roles & permissions

| Role            | Manage members | Manage tasks/subtasks | Manage notes |
|-----------------|:--:|:--:|:--:|
| `admin`         | ✅ | ✅ | ✅ |
| `project_admin` | ❌ | ✅ | ❌ |
| `member`        | ❌ | ❌ | ❌ |

Enforced both in the frontend (`src/lib/permissions.js`) and the backend (`src/middleware/projectAccessMiddleware.js`).
