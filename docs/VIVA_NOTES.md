# CareerHub: Viva Notes

## 1. The 30-second pitch

"CareerHub is a full-stack internship portal. Students search and apply to internships; recruiters post internships and manage applicants. The React frontend talks to an Express REST API, which stores data in MongoDB through Mongoose. Authentication uses bcrypt and JWT in an HttpOnly cookie, and every permission is enforced on the server, not just in the UI."

## 2. Request flow (draw this)

```
Apply button (React)
  -> applicationService.applyToInternship()        services/applicationService.js
  -> Axios POST /api/applications/:id              services/api.js (cookie sent automatically)
  -> Vite proxy -> Express
  -> app.js: helmet, cors, json, cookieParser, rate limit
  -> applicationRoutes: protect -> authorize('student') -> idParam -> applyRules -> validate
  -> applicationController.applyToInternship: internship exists? open? deadline? duplicate?
  -> Application.create()  (unique index {student, internship} is the final guard)
  -> sendSuccess(201)  or  throw ApiError -> errorHandler -> JSON
  -> React: toast + refetch
```

## 3. Where is what? (code map)

| Question | File |
|---|---|
| How is the password hashed? | `server/models/User.js` (pre-save hook, bcrypt cost 12) |
| Where is the JWT created / cookie set? | `server/utils/token.js`, `authController.js` |
| Where is the user identified on each request? | `server/middleware/auth.js` (`protect`) |
| Where are roles checked? | `middleware/auth.js` (`authorize`) |
| Where is ownership checked? | controllers (`getOwnedInternship`, applicant status, withdraw) |
| Where is input validated? | `server/validators/*` + `middleware/validate.js` |
| Where do errors become JSON? | `server/middleware/errorHandler.js` |
| Duplicate application prevention | `models/Application.js` index + `applicationController.js` |
| Deadline enforcement | `applicationController.applyToInternship` |
| Search / filter / pagination | `internshipController.listInternships`, `utils/pagination.js`, `utils/helpers.js` |
| Dashboard numbers | `dashboardController.js` (aggregation pipelines) |
| Who is logged in (frontend)? | `client/src/context/AuthContext.jsx` |
| Route protection (frontend) | `components/ProtectedRoute.jsx`, `GuestRoute.jsx`, `App.jsx` |
| Reusable data loading | `hooks/useFetch.js` |
| Demo data | `server/seed/data.js`, `seed.js` |

## 4. Likely questions and answers

**Why MongoDB, and why references instead of embedding?**
Internships, users and applications change independently and are queried from different directions (a student's applications, a recruiter's applicants). References keep each document small and avoid duplicated data; `populate()` joins them when needed.

**What are the relationships?**
User (recruiter) 1 -> many Internship. Student and Internship are many-to-many, resolved by the Application collection (a join collection). `User.savedInternships` is an array of Internship references.

**How do you prevent duplicate applications?**
Three layers: the UI hides Apply once applied; the controller checks and returns 409; and a unique compound index `{student, internship}` makes the database itself reject duplicates, which also covers two simultaneous requests (race condition).

**Why JWT in an HttpOnly cookie rather than localStorage?**
JavaScript cannot read an HttpOnly cookie, so an XSS bug cannot steal the token. `SameSite=Lax` blocks the cookie on cross-site POST/PUT/DELETE requests, which is basic CSRF protection. `Secure` makes it HTTPS-only in production.

**What is the weakness of JWT here?**
It is stateless: logout only clears the cookie, a stolen token stays valid until expiry (7 days). Fixes: short-lived access tokens with refresh tokens, or a token blacklist.

**Authentication vs authorization?**
Authentication = who are you (`protect` verifies the JWT). Authorization = what may you do (`authorize('recruiter')` for roles, plus ownership checks in controllers).

**Can a student change their status by editing the React code or calling the API?**
No. The status route requires the recruiter role and ownership (403 otherwise). When applying, the status is always set to `Applied` by the server, even if the body contains something else.

**Why is the frontend guard not enough?**
Anyone can bypass React with Postman. So `ProtectedRoute` is only for user experience; the real checks are in Express middleware and controllers.

**How do you protect against NoSQL injection?**
Inputs are validated to be strings/enums; query-string values must be plain strings (objects like `?category[$ne]=x` are ignored/rejected); regex input is escaped; ids are validated with a strict 24-hex check before use.

**What does `escapeRegex` prevent?**
Users typing `.*` or `(` could build expensive or invalid patterns (ReDoS / regex injection). Escaping turns them into literal text.

**Why validate on both client and server?**
The client gives instant feedback; the server is the only one that can be trusted.

**How does pagination work?**
`skip = (page-1) * limit`, `limit` capped at 50 (`utils/pagination.js`). The response `meta` has `total`, `page`, `limit`, `totalPages`.

**How is the dashboard data computed?**
With MongoDB aggregation (`$match` + `$group` by status) in `dashboardController.js`. Nothing is hard-coded; the landing-page statistics come from `GET /api/stats` (counts).

**How do recommendations work?**
Case-insensitive match between the student's skills and each open internship's `requiredSkills`; internships already applied to are excluded; more matches rank higher. Fallback: newest open internships.

**What does `asyncHandler` do?**
Wraps async controllers so a rejected promise reaches the central error handler automatically (Express 4 does not do this by itself).

**What is the dev proxy?**
Vite forwards `/api` to Express, so the browser sees one origin (no CORS issues, cookies just work). CORS is still configured for `CLIENT_URL`.

**What is `useFetch`?**
A custom hook returning `{data, loading, error, reload}`; it ignores outdated responses and keeps old data while reloading. It removes repeated try/catch code from pages.

**Why Context API and not Redux?**
The only global state is "who is logged in" and toasts; Context is enough. Server data is fetched per page.

**What happens when a recruiter deletes an internship?**
The controller also deletes its applications and removes it from students' saved lists (no orphaned data).

**What is not implemented / what would you improve?**
Email verification, password reset, refresh tokens, file upload for resumes, notifications, automated test suite, text search index, deployment hardening. (See README "Known limitations".)

**Is it production-ready?**
No, and the README says so. It has not been security-reviewed or load-tested.

## 5. Five-minute demo script

1. **Architecture** (30 s): show the diagram in README. Open Compass: `users`, `internships`, `applications`.
2. **Visitor** (45 s): landing page, search `react`, filters, open a details page ("Log in to apply").
3. **Student** (90 s): register, apply, try to apply again (blocked), open the Closed Demo internship (blocked), dashboard chart, withdraw.
4. **Recruiter** (90 s): login as `recruiter1`, post an internship, open applicants, set a status to Shortlisted.
5. **Proof** (45 s): back as the student, new status visible; in Compass show the same document updated and the hashed password; show the unique index.
6. **Security** (30 s): as `recruiter2` open `recruiter1`'s applicants URL -> 403; DevTools -> cookie is HttpOnly.

## 6. Be honest about

* You understand every file you present; if asked about something you did not write yourself, say you used AI assistance and explain how the code works (this document maps it).
* The app is a learning project: not security-audited, demo data is fictional, demo passwords are for development only.
