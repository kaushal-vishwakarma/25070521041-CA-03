# CareerHub: Testing Guide

Three ways to test, from fastest to most thorough:

1. **Postman collection** (76 requests, automatic pass/fail): section 1
2. **Browser checklist** (everything a user can click): section 2
3. **Manual API requests** with Postman or Thunder Client, with sample bodies and expected status codes: section 3

Always finish with **MongoDB Compass** (section 4), and try the extra security checks in section 5.

## 0. Before you start

```powershell
npm run seed       # fresh demo data
npm run server     # terminal 1, must print "MongoDB connected" and "CareerHub API running..."
npm run client     # terminal 2 (only needed for the browser checklist)
```

Demo password for all seeded users: `Demo@12345` (development only).

---

## 1. Postman collection (recommended)

1. Postman: **Import** -> `docs/CareerHub.postman_collection.json`.
2. The variable `baseUrl` is `http://localhost:5000/api` (talks to Express directly, not through Vite).
3. Right-click the collection -> **Run collection** -> keep the order -> **1 iteration** -> **Run**.
4. Every request has built-in checks. A green run means each of these behaved as documented.

Postman keeps the auth cookie between requests, so the folders log in as different users one after the other. **Do not run requests individually out of order**, or you will be logged in as the wrong user.

| Folder | What it proves |
|---|---|
| 1 Public and error handling | public list/search/filter/sort/limit, 400 for bad filters and ids, 404s, malformed JSON, 401 when not logged in |
| 2 Authentication | register (student, recruiter), duplicate email 409, weak password 400, no `admin` role, cookie is HttpOnly + SameSite=Lax, login errors do not reveal whether an email exists, logout |
| 3 Recruiter owner | create (201), validation failures (past deadline, empty body, bad stipend, bad category), update own listing |
| 4 Authorization | a **different recruiter** gets 403 on edit, delete and applicants; recruiter gets 403 on student endpoints and cannot apply |
| 5 Student | student cannot create internships, apply works, duplicate 409, closed internship 400, bad id 400, `javascript:` link 400, student cannot change status (403), save / unsave, profile update, role and email cannot be changed |
| 6 Applicant handling | non-owner recruiter 403, owner lists / filters / updates status, invalid status 400, withdraw blocked after shortlisting (400), withdraw allowed while Under Review, re-apply, delete cascades, deleted listing returns 404 |

The run only adds a few `*.@test.com` users. They are harmless; delete them in Compass if you like (`users` collection, filter `{ email: /@test\.com$/ }`).

If something is red, open that request -> **Test Results** and read the message. Send me the request name, expected vs actual status, and the response body.

---

## 2. Browser checklist (http://localhost:5173)

Tick each line. "Expected" is what you should see.

| # | Action | Expected |
|---|---|---|
| 1 | Open `/` without logging in | landing page, featured cards, statistics (real counts), testimonials badge "Demo content" |
| 2 | Open `/internships` without logging in | 9 cards, pagination, no bookmark icons |
| 3 | Search `react`; then filter Category = AI/ML, Work mode = Remote; sort by Deadline | results update, URL changes, **Clear all** resets |
| 4 | Search `zzzz` | empty state with "Clear all filters" |
| 5 | Register a **student** (skills `React, Node.js`) | toast, redirected to `/student` |
| 6 | Register with an existing email | red message under the email field |
| 7 | Register with password `abc` / mismatched confirm | field errors, first bad field focused |
| 8 | Logout (navbar menu), then Login with wrong password | red alert "Invalid email or password" |
| 9 | Login correctly | redirected to your dashboard |
| 10 | Open an internship as a visitor | "Log in to apply" (no Apply button) |
| 11 | Open an internship as the student, click **Apply Now**, submit | toast, panel switches to "You have already applied" + status badge |
| 12 | Reload that internship page | still shows applied; **no way to apply twice** (duplicate prevention) |
| 13 | The closed demo is hidden from the public list on purpose. Log in as **recruiter1**, open *My internships*, copy the link of **Python Backend Intern (Closed Demo)**, log in as **student1** and open that link | "Applications closed" instead of an Apply button |
| 14 | `/student/applications` | the application with status; **Withdraw** works only while Applied / Under Review |
| 15 | Bookmark a card, open `/student/saved` | it is listed; click the bookmark again to remove |
| 16 | Edit your profile (skills, resume link `abc`) | `abc` rejected; valid link saved; dashboard completeness updates |
| 17 | Logout, register a **recruiter** | redirected to `/recruiter` |
| 18 | Post an internship (empty form, then valid form) | errors first; then it appears in My internships **and** on the public `/internships` |
| 19 | Post with a deadline in the past | date field error (and the server also rejects it) |
| 20 | Close the internship | badge Closed; as a student the details page shows "Applications closed"; Reopen restores it |
| 21 | Applicants page of `recruiter1`'s "React Frontend Intern" | Aarav listed; change status to Accepted; tab counts update |
| 22 | Log in as student1 -> `/student/applications` | the new status is visible (end-to-end proof) |
| 23 | As **recruiter2**, open `/recruiter/internships/<recruiter1's id>/edit` and `/applicants` | edit page says you can only edit your own; applicants page shows the server's 403 message |
| 24 | As a student, type `/recruiter` in the address bar | redirected back to `/student` |
| 25 | Logged out, open `/student` | redirected to `/login`; after login you land on `/student` |
| 26 | Open `/something-random` | 404 page |
| 27 | Shrink the window to phone width | hamburger menu, dashboard tabs scroll sideways, filters collapse into a button |
| 28 | Use only the keyboard (Tab, Enter, Esc) | visible focus ring, modals trap focus, Esc closes them |

---

## 3. Manual API testing (Postman or Thunder Client)

Base URL: `http://localhost:5000/api`. Send `Content-Type: application/json`.
Both tools store cookies automatically (Thunder Client: **Cookies** tab). To switch users, log in again.

### Authentication

**Register student** `POST /auth/register`

```json
{ "name": "Test Student", "email": "test.student@example.com", "password": "Passw0rd123",
  "confirmPassword": "Passw0rd123", "role": "student", "college": "Demo College", "skills": ["React", "Node.js"] }
```

Response **201** (also `Set-Cookie: careerhub_token=...; HttpOnly; SameSite=Lax`):

```json
{ "success": true, "message": "Registration successful",
  "data": { "user": { "_id": "6a...", "name": "Test Student", "email": "test.student@example.com", "role": "student",
    "college": "Demo College", "skills": ["React", "Node.js"], "resumeUrl": "", "bio": "", "savedInternships": [] } } }
```

There is no `password` field in any response.

| Request | Expected |
|---|---|
| Register the same email again | **409** `An account with this email already exists` |
| Register with `"password": "abc"` | **400** `{ "success": false, "message": "Password must be 8-72 characters", "errors": [{ "field": "password", ... }] }` |
| Register recruiter without `companyName` | **400** |
| Register with `"role": "admin"` | **400** (there is no admin role) |
| `POST /auth/login` correct | **200** + cookie |
| `POST /auth/login` wrong password **or** unknown email | **401** `Invalid email or password` (identical message) |
| `GET /auth/me` logged in / logged out | **200** `{ data: { user } }` / **401** `Authentication required. Please log in.` |
| `POST /auth/logout` | **200**, cookie cleared |

### Internships

| Request | Expected |
|---|---|
| `GET /internships` (no login) | **200** `{ data: [...], meta: { total, page, limit, totalPages } }` |
| `GET /internships?search=react&category=AI%2FML&workMode=Remote&minStipend=10000&sort=deadline&page=1&limit=5` | **200**, only matching open internships |
| `GET /internships?category=Hacking` | **400** `Invalid category` |
| `GET /internships?limit=500` | **400** |
| `GET /internships/not-an-id` | **400** `Invalid ID format` |
| `GET /internships/000000000000000000000000` | **404** `Internship not found` |
| `GET /internships/<id>` | **200**, includes `isOpen` and `viewer` |
| `POST /internships` not logged in | **401** |
| `POST /internships` as a student | **403** `You do not have permission to perform this action.` |

**Create internship as recruiter** `POST /internships` (log in as `recruiter1@careerhub.demo` first)

```json
{ "title": "API Test Intern", "description": "Created while testing the CareerHub API end to end.",
  "responsibilities": ["Test endpoints", "Report bugs"], "requiredSkills": ["Postman", "REST APIs"],
  "category": "Backend Development", "location": "Pune", "workMode": "Hybrid", "internshipType": "Full-time",
  "duration": "3 months", "stipendMin": 8000, "stipendMax": 12000, "applicationDeadline": "2026-12-31", "vacancies": 2 }
```

Response **201**: the internship with `"isOpen": true`, `"companyName": "Nimbus Labs"` (taken from the recruiter's profile), `"recruiter": "<recruiter1 id>"`. The recruiter id always comes from the token, never from the body.

| Request | Expected |
|---|---|
| Same body with `"applicationDeadline": "2020-01-01"` | **400** `Application deadline must be in the future` |
| Same body with `stipendMin: 20000, stipendMax: 10000` | **400** |
| `{}` | **400** |
| As **recruiter2**: `PUT /internships/<recruiter1's id>` `{"title":"Hijacked"}` | **403** `You can only manage your own internships` |
| As **recruiter2**: `DELETE /internships/<recruiter1's id>` | **403** |
| As recruiter1: `PUT` same id `{"status":"closed"}` | **200**, `isOpen: false` |
| As recruiter1: `PUT` `{"status":"active"}` on a **closed** listing whose deadline has passed (the seeded *Python Backend Intern (Closed Demo)*) | **400** `Extend the application deadline before reopening this internship` |
| As recruiter1: `DELETE` | **200**; listing, its applications and saved references are removed |

### Applications

**Apply** `POST /applications/<internshipId>` as a student

```json
{ "coverLetter": "I would like to learn from your team.", "resumeUrl": "https://example.com/my-resume.pdf" }
```

Response **201** with `"status": "Applied"` (the server ignores any `status` in the body).

| Request | Expected |
|---|---|
| Apply again to the same internship | **409** `You have already applied to this internship` (backed by the unique index) |
| Apply to a closed internship | **400** `This internship is closed and no longer accepting applications` |
| Apply after the deadline | **400** `The application deadline for this internship has passed` (see "expired deadline" below) |
| Apply as a recruiter | **403** |
| `"resumeUrl": "javascript:alert(1)"` | **400** |
| Student `PATCH /applications/<id>/status` `{"status":"Accepted"}` | **403** |
| recruiter2 `PATCH` the same | **403** (not the owner) |
| Owner `PATCH` `{"status":"Shortlisted"}` | **200** `Application marked as Shortlisted` |
| Owner `PATCH` `{"status":"Hired"}` | **400** |
| `GET /applications/internship/<id>` as a non-owner | **403**; as the owner **200** with `meta.statusCounts` |
| Student `PATCH /applications/<id>/withdraw` while Applied / Under Review | **200** |
| Same after Shortlisted / Rejected / Accepted | **400** `... can no longer be withdrawn` |

### Profile, saved, dashboards

| Request | Expected |
|---|---|
| `GET /users/profile` | **200** |
| `PUT /users/profile` `{"skills":["React","MongoDB"],"bio":"Hello"}` | **200** |
| `PUT /users/profile` `{"role":"recruiter","email":"x@y.com"}` | **200**, but role and email are **unchanged** |
| `POST /users/saved-internships/<id>` / `GET` / `DELETE` | **200** each |
| `GET /dashboard/student` as student | **200** `data.stats`, `statusBreakdown` (5 items), `recentActivity`, `recommended` |
| `GET /dashboard/student` as recruiter | **403** |
| `GET /dashboard/recruiter` as recruiter | **200** |
| `GET /stats` (public) | **200** `{ openInternships, companies, students, applications }` |

---

## 4. Confirming the data in MongoDB Compass

1. Connect to `mongodb://127.0.0.1:27017`, open database **careerhub**.
2. **users**: after registering, find your document. `password` starts with `$2a$12$` (bcrypt), never plain text. `role` is `student` or `recruiter`.
3. **internships**: after posting, your document has `recruiter` = the ObjectId of your user, `status: "active"`, and `applicationDeadline` at 23:59:59.999Z of the chosen day.
4. **applications**: after applying, a document with `student`, `internship`, `status: "Applied"`. After the recruiter changes the status, refresh and see the new value and `updatedAt`.
5. **Duplicate prevention at database level:** open `applications` -> **Indexes**. `student_1_internship_1` is marked **UNIQUE**.
6. **Cascade delete:** note an internship id that has applications, delete it from the recruiter page, refresh Compass: the internship and its applications are gone.

## 5. Extra checks (good to show in a viva)

* **Expired deadline on an active listing** (tests the deadline rule on its own): in Compass edit any internship's `applicationDeadline` to a past `ISODate` while `status` stays `active`. As a student open it: "The application deadline has passed". Call `POST /applications/<id>`: **400** with the deadline message. Put the date back afterwards.
* **NoSQL operator injection:** `GET /internships?category[$ne]=x`. The value is not a string, so it is never passed to MongoDB as an operator (expect **400**; if the filter is simply ignored you get a normal list). Also try `GET /internships?search=.*` (treated as literal text, no error) and `POST /auth/login` with `{"email":{"$gt":""},"password":"x"}` (expect **400**).
* **Rate limiting:** send `POST /auth/login` with a wrong password more than 100 times within 15 minutes (development limit; 20 in production). Expect **429** `Too many attempts. Please try again in 15 minutes.`
* **Token handling:** in browser DevTools -> Application -> Cookies, `careerhub_token` shows **HttpOnly**. In the console, `document.cookie` does not contain it. Delete the cookie and reload a dashboard page: you are sent to login.
* **No stack traces in production:** start the server with `NODE_ENV=production` (in a throwaway `.env` copy) and trigger a 500; the message is generic.

## 6. Reporting a failure

Please send: which step/request, what you expected, what happened (status code + response body or a screenshot of the browser console/terminal). Hide `JWT_SECRET` in screenshots.
