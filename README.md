# CareerHub: Internship Portal

A full-stack web application where **students** discover and apply to internships and **recruiters** post internships and manage applicants.
Built as a BTech CSE project with **React + Express + MongoDB**.

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Axios, Tailwind CSS 3, Recharts, Lucide icons |
| Backend | Node.js, Express 4, REST API, express-validator, helmet, cors, express-rate-limit |
| Database | MongoDB (local Community Server or Atlas) with Mongoose |
| Auth | bcryptjs password hashing, JWT stored in an **HttpOnly cookie** |

> **Honesty note.** The code was written and statically checked (syntax, imports, unit tests of the pure logic) without access to a running MongoDB.
> The flows you have run yourself on your machine are the real proof. See [Known limitations](#known-limitations-and-honest-disclosures).

---

## 1. How the three tiers work together

```
Browser: React app (http://localhost:5173)
   |  Axios calls /api/...  (withCredentials: true)
   |  Vite dev server proxies /api  ->  http://127.0.0.1:5000
   v
Express API (http://localhost:5000)
   app.js: helmet -> cors -> json parser -> cookie parser -> rate limit
   routes -> validators -> validate -> auth (protect, authorize) -> controllers
   v  Mongoose models
MongoDB (mongodb://127.0.0.1:27017, database "careerhub")
   <-- MongoDB Compass connects to the same URI to inspect the data
```

* **Login**: `POST /api/auth/login` checks the password with bcrypt and answers with `Set-Cookie: careerhub_token=<JWT>; HttpOnly; SameSite=Lax`.
  JavaScript can never read that cookie, which protects the token from XSS theft. The browser attaches it to every later request.
* **Same origin in development**: the browser only talks to port 5173. Vite forwards `/api` to Express, so cookies and CORS stay simple.
* **Authorization lives on the server.** React hides buttons and redirects for convenience, but every rule (roles, ownership, deadlines, duplicates) is enforced again in Express.

## 2. Folder structure

```
careerhub/
  package.json            root scripts: npm run server / client / seed
  README.md   .gitignore
  docs/                   TESTING.md, VIVA_NOTES.md, Postman collection
  server/
    server.js app.js      entry point + Express app
    config/               env.js (validates .env), db.js
    models/               User, Internship, Application
    middleware/           auth (protect, optionalAuth, authorize), validate, rateLimiter, errorHandler
    validators/           express-validator rules per resource
    controllers/          business logic
    routes/               URL -> middleware chain -> controller
    utils/                ApiError, asyncHandler, response, pagination, token, helpers, constants
    seed/                 data.js (demo data), seed.js
  client/
    index.html vite.config.js tailwind.config.js postcss.config.js
    src/
      main.jsx App.jsx index.css
      services/           Axios instance + one file per API area (no API calls inside components)
      context/            AuthContext, ToastContext
      hooks/              useAuth, useToast, useFetch, useDebounce, useSavedInternships
      components/         reusable UI (ui/*), Navbar, Footer, InternshipCard, route guards
      layouts/            PublicLayout, AuthLayout, DashboardLayout
      pages/              public pages, student/*, recruiter/*
      utils/              constants, routes, format, validators, profile, navigation
```

## 3. Setup on Windows (PowerShell)

**Prerequisites:** Node.js 18+ (20 LTS recommended), Git (optional), MongoDB Community Server or an Atlas account, MongoDB Compass.

```powershell
node -v
npm -v
```

**1. Install dependencies** (from the project root, for example `C:\Projects\careerhub`):

```powershell
npm install --prefix server
npm install --prefix client
```

**2. Create `server\.env`:**

```powershell
Copy-Item server\.env.example server\.env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Open `server\.env` and paste the long output after `JWT_SECRET=`. Never commit this file (it is in `.gitignore`) and never paste it into screenshots or chats.

| Variable | Meaning |
|---|---|
| `PORT` | API port (5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | Connection string, ends with the database name `careerhub` |
| `JWT_SECRET` | 32+ random characters; the server refuses to start otherwise |
| `CLIENT_URL` | Exact origin of the React app, used for CORS (`http://localhost:5173`) |

**3. Start MongoDB**

* *Local:* `Get-Service MongoDB` should show `Running`. If not, run `net start MongoDB` in an **Administrator** PowerShell.
* *Atlas:* create a free cluster, add a database user, allow your IP under Network Access, then use the connection string in `.env`:
  `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/careerhub?retryWrites=true&w=majority`

**4. Seed demo data** (safe to run repeatedly; it only replaces the `@careerhub.demo` accounts and their data):

```powershell
npm run seed
```

**5. Run backend and frontend in two terminals**

```powershell
# terminal 1
npm run server        # expect: "MongoDB connected" and "CareerHub API running on http://localhost:5000"

# terminal 2
npm run client        # open http://localhost:5173
```

**6. Look at the data in MongoDB Compass**
Connect to `mongodb://127.0.0.1:27017` (or your Atlas string). Open database **careerhub**: collections `users`, `internships`, `applications`.
The backend uses the same URI from `.env`, which is why Compass and the app always show identical data.
(MongoDB creates a database lazily, so it appears after the first write, for example after seeding.)

## 4. Demo accounts (DEVELOPMENT ONLY)

Created by `npm run seed`. Password for all: `Demo@12345`

| Role | Email |
|---|---|
| Student | `student1@careerhub.demo`, `student2@careerhub.demo` |
| Recruiter | `recruiter1@careerhub.demo` to `recruiter4@careerhub.demo` |

These credentials are public in this repository. **Delete these users before any real deployment.** The seed script refuses to run when `NODE_ENV=production`. There is no admin role and no default admin account.

## 5. Features

**Public:** landing page (search, featured internships, categories, live statistics, how it works, testimonials marked as demo), internship listing (search, 5 filters, sorting, pagination, URL-synced filters), internship details, register, login, 404.

**Student:** dashboard (counts, status chart, recent activity, skill-based recommendations, profile completeness), apply with cover letter and resume link, my applications with status filter and withdraw, saved internships, profile editing.

**Recruiter:** dashboard (counts, applicants-by-status chart, most popular listings, recent applicants), create / edit / delete internships, close / reopen, applicants page with search, status tabs and counts, applicant profile modal, status updates, profile editing.

## 6. REST API summary

All responses: `{ "success": true|false, "message": "...", "data": ..., "meta": ... }`. Errors may include `errors: [{ field, message }]`.

| Method and path | Access | Purpose |
|---|---|---|
| POST `/api/auth/register` | public | create account (rate limited) |
| POST `/api/auth/login` | public | log in, sets cookie (rate limited) |
| POST `/api/auth/logout` | any | clears cookie |
| GET `/api/auth/me` | logged in | current user |
| GET `/api/internships` | public | list open internships (search, filters, sort, pagination) |
| GET `/api/internships/:id` | public | details (+ `viewer` info when logged in) |
| POST `/api/internships` | recruiter | create |
| PUT / DELETE `/api/internships/:id` | owner recruiter | update (including close/reopen) / delete |
| GET `/api/internships/recruiter/mine` | recruiter | own listings with applicant counts |
| POST `/api/applications/:internshipId` | student | apply |
| GET `/api/applications/student/mine` | student | own applications |
| GET `/api/applications/internship/:internshipId` | owner recruiter | applicants |
| PATCH `/api/applications/:id/status` | owner recruiter | update status |
| PATCH `/api/applications/:id/withdraw` | student (owner) | withdraw while Applied / Under Review |
| GET / PUT `/api/users/profile` | logged in | read / update own profile |
| GET / POST / DELETE `/api/users/saved-internships[/:id]` | student | bookmarks |
| GET `/api/dashboard/student`, `/api/dashboard/recruiter` | by role | dashboard data |
| GET `/api/stats` | public | landing-page counts (extra endpoint, not in the original spec) |

Details and sample bodies: [docs/TESTING.md](docs/TESTING.md).

## 7. Data models and indexes

| Collection | Purpose | Important indexes |
|---|---|---|
| **User** | students and recruiters in one collection, separated by `role`; `password` is hashed and `select: false` | unique `email` (prevents duplicate accounts, even under concurrent requests) |
| **Internship** | a listing; `recruiter` references its owner `User` | `{status, applicationDeadline}` public listing; `{category, workMode}` filters; `{recruiter, createdAt}` recruiter dashboard |
| **Application** | join collection student <-> internship | **unique `{student, internship}`** (one application per student per internship); `{student, appliedAt}`; `{internship, status}` |

Withdrawing deletes the Application document (allowed only for `Applied` and `Under Review`). The spec lists five statuses and no "Withdrawn", so none was added.

## 8. Security measures implemented

* bcrypt (cost 12) password hashing; hashes never leave the server (`select: false` + `toJSON` transform).
* JWT signed with `JWT_SECRET` from `.env`, HS256 only, 7 days; HttpOnly + SameSite=Lax (+ Secure in production) cookie; expired / invalid tokens handled with 401.
* Role middleware (`authorize`) and **ownership checks inside controllers** (403).
* Server-side validation and normalisation of every input; whitelisted fields (no mass assignment; `status` and `role` are never taken from a request body where they must not be).
* Safe query building: regex input escaped, query values must be plain strings, ObjectIds validated before use.
* Unique indexes for duplicate accounts and duplicate applications; deadline and closed-status enforced on the server.
* helmet headers, CORS limited to `CLIENT_URL` with credentials, JSON body limit 10 KB, pagination limit 50.
* Rate limiting: strict on login/register, general limit on `/api`.
* Central error handler; no stack traces or internal messages in production.
* Environment validation at startup.
* React escapes output; no `dangerouslySetInnerHTML`; resume links restricted to http(s) and opened with `rel="noopener noreferrer"`.

## 9. Known limitations and honest disclosures

This project is **not claimed to be production-secure**. It has not had a professional security review or load test.

* **Verified so far:** syntax and import checks of all files, unit tests of the validation and formatting logic, and a structural check of the Postman collection against the real routes. In your environment you have run the backend, seed, landing page, login and listings.
* **Not verified by the author:** every flow beyond that (register, apply, recruiter forms, applicant updates) on a real running stack, plus browser rendering of every page, accessibility with a screen reader, and mobile devices. **Run the Postman collection and the browser checklist in `docs/TESTING.md`** and report anything that fails.
* Logout clears the cookie, but a JWT is stateless: a stolen token stays valid until it expires (7 days). A token blacklist or short-lived access + refresh tokens would fix this.
* No email verification, password reset, account lockout, or two-factor authentication.
* No CSRF token. Protection relies on `SameSite=Lax`, JSON-only bodies and a strict CORS origin, which suits same-site deployment. Hosting API and client on different sites would need `SameSite=None; Secure` **and** CSRF tokens.
* Rate-limit counters are kept in memory (per server process).
* Resume handling is a link only (no file upload or virus scanning).
* Search uses regex scans rather than a text index; fine for thousands of records, not millions.
* No automated test suite in the repository (tests were run ad hoc and manually). Adding Jest/Supertest and Vitest would be the next step.
* Demo companies, people and testimonials are fictional.
* `client/src/pages/ComponentPreview.jsx` (route `/preview`, development only) is a component showcase and can be deleted.

## 10. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Missing script: "server"` | run from the project root, or `cd server; npm run dev` |
| `Missing required environment variables` | `server\.env` missing; copy from `.env.example` |
| `JWT_SECRET must be at least 32 characters` | generate a real secret (see step 2) |
| `MongoDB connection failed ... ECONNREFUSED` | MongoDB not running: `Get-Service MongoDB`, `net start MongoDB` (admin) |
| Vite: `http proxy error ... ECONNREFUSED 127.0.0.1:5000` | backend is not running or crashed; in its terminal type `rs` |
| Page shows "Could not load" / "Cannot reach the server" | same as above |
| `Cannot find package ...` | `npm install --prefix server` and `--prefix client` |
| Port already in use | change `PORT` in `.env` **and** the proxy target in `client/vite.config.js` |
| Login says "Too many attempts" | rate limit; wait 15 minutes (limit is 100 per 15 min in development) |
| Compass shows no `careerhub` database | nothing written yet; run `npm run seed` |
| Atlas connection fails | IP not allowed in Network Access, wrong password, or special characters in the password not URL-encoded |

## 11. Deployment notes (not done in this project)

Set `NODE_ENV=production`, use a fresh strong `JWT_SECRET`, serve over HTTPS, set `CLIENT_URL` to the real frontend origin, build the client with `npm run build`, and do not seed demo users. If the frontend and API live on different domains, set `VITE_API_URL` and revisit the cookie and CSRF points above.
