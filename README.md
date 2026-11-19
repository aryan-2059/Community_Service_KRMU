# EduTrack — Community Service KRMU

EduTrack is a role-based classroom learning platform for students, teachers, and school principals. It brings classroom management, quizzes, learning progress, revision materials, and meeting coordination into one web application.

## Features

### Students
- View a dashboard with learning activity and progress.
- Browse enrolled classrooms and subject hubs.
- Complete assigned quizzes and review submitted results.
- Track questions and areas to revisit.
- Access revision notes and resources shared by teachers.

### Teachers
- Manage classrooms and view classroom details.
- Build quizzes and review quiz analytics.
- Share revision notes and media with students.

### Principals
- View a school overview.
- Manage teacher and student accounts.
- Track classrooms and student progress.

### Shared
- Role-aware sign-in and protected pages for students, teachers, and principals.
- Schedule and manage classroom or individual meetings.
- Terms of use and privacy policy pages.

## Technology

- **Frontend:** React 18, Vite, React Router, Tailwind CSS
- **Backend:** Node.js and Express
- **Data:** PostgreSQL via `pg`/`postgres` when `DATABASE_URL` is configured; local JSON-file storage is available for development without it
- **Authentication:** JWT and bcryptjs
- **Media uploads:** Cloudinary (optional; required for revision media uploads)
- **Deployment:** Vercel

## Repository layout

```text
.
├── api/                    Vercel catch-all entry point for the Express API
├── client/                 React + Vite frontend
│   └── src/
│       ├── api/             Frontend API helpers
│       ├── components/     Shared UI and layout components
│       ├── context/        Shared React context
│       ├── hooks/           Reusable hooks, including authentication
│       └── pages/           Auth, student, teacher, principal, and shared pages
├── server/                 Express API and backend scripts
│   ├── prisma/              Seed and principal-account scripts
│   └── src/
│       ├── lib/             Data store, database, and principal helpers
│       ├── middleware/      Authentication and error handling
│       └── routes/          Auth, classroom, quiz, revision, meeting, and other APIs
├── supabase/                SQL seed data
├── package.json             Root scripts for install, build, and development
└── vercel.json              Vercel frontend/API routing configuration
```

## Requirements

- Node.js and npm
- A PostgreSQL database for persistent shared or deployed data
- Optional Cloudinary account for revision media uploads

## Local development

1. Clone the repository and install the client and server dependencies:

   ```bash
   git clone https://github.com/aryan-2059/Community_Service_KRMU.git
   cd Community_Service_KRMU
   npm run install:all
   ```

2. Configure the backend environment. Copy the example file and edit the values:

   ```bash
   cp server/.env.example server/.env
   ```

   At minimum, set a strong `JWT_SECRET`. For database-backed storage, set `DATABASE_URL` to your PostgreSQL connection string. For local-only JSON storage, `DATABASE_URL` can be omitted; the default data file is `server/data/reelearn.json`. You can override its location with `JSON_STORE_PATH`.

   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are only needed for media uploads. `CLIENT_URL` is only needed if the frontend is served from a separate origin; Vite proxies `/api` to `http://localhost:5000` during local development.

3. Start the API and frontend in separate terminals:

   ```bash
   npm run dev:server
   npm run dev:client
   ```

   The API listens on port `5000` by default, and Vite serves the frontend on its development port. Open the URL printed by Vite. The API health check is available at `http://localhost:5000/api/health`.

### Optional local data and principal setup

The seed command resets local JSON storage and loads sample data; do not run it if you need to preserve that local dataset:

```bash
npm run seed --prefix server
```

To create a local principal account, configure the principal values in `server/.env` and run:

```bash
npm run principal:create --prefix server
```

See [`server/PRINCIPAL_SETUP.md`](server/PRINCIPAL_SETUP.md) for principal setup notes. Never commit `.env` files or share principal credentials.

## Build and tests

Build the client and run the server's syntax-check build script:

```bash
npm run build
```

Run the backend tests with Node's built-in test runner:

```bash
npm test --prefix server
```

## API overview

The Express application is mounted under `/api`. Authentication endpoints are under `/api/auth`; the protected API route groups cover classrooms, subjects, questions, quizzes, assignments, attempts, analytics, revision resources, principal administration, and meetings. Most route groups require a valid JWT. Use `GET /api/health` to check API and storage health.

## Deployment to Vercel

The root `vercel.json` configures the client and server services and routes `/api/*` requests to the Express API. Import the repository into Vercel with the repository root as the project root, then configure the backend environment variables:

- `DATABASE_URL` — PostgreSQL connection string; use a pooled/serverless connection where available.
- `JWT_SECRET` — long, random signing secret.
- `PRINCIPAL_EMAIL` and `PRINCIPAL_PASSWORD` — credentials for the principal account; use a unique password of at least 12 characters.
- `PRINCIPAL_NAME` — optional principal display name.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` — optional, for revision media uploads.
- `CLIENT_URL` — only if the frontend uses a separate origin. The normal single-domain Vercel deployment uses the same-origin `/api` path and does not require `VITE_API_URL` or `CLIENT_URL`.

Add secrets in Vercel's environment settings, not in source control, and redeploy after changing them. For additional deployment guidance, see [`server/PRINCIPAL_SETUP.md`](server/PRINCIPAL_SETUP.md).

## Data and deployment notes

- With `DATABASE_URL`, the current PostgreSQL adapter stores the application dataset as a single JSONB document. It shares data across deployed instances and serializes writes, but reads and writes the full dataset for each operation. Consider migrating to normalized PostgreSQL tables before the dataset or traffic grows substantially.
- Without `DATABASE_URL`, local development uses a JSON file. Vercel's `/tmp` storage is not persistent and must not be used for deployed application records.
- Existing data from an earlier Vercel `/tmp` JSON store is not migrated automatically. Accounts and records may need to be recreated or restored from a backup.
- Vercel function request-size limits apply to media uploads sent through the API. For larger files, use direct-to-Cloudinary uploads.

## Security

- Keep `JWT_SECRET`, database credentials, Cloudinary secrets, and principal credentials private.
- Use a unique, strong principal password and do not commit `server/.env` or other secret files.
- Use HTTPS and a trusted PostgreSQL provider for deployed environments.
