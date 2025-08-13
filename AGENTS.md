Plan first, then scaffold step-by-step with my approval for each file or command.
Use **npm** as the package manager. Always show the plan before executing.
Ask for approval before writing files or running any shell command.
Keep diffs small and commit per milestone with clear messages.

## GOAL

Build a full-stack Nuxt 3 app (TypeScript, Tailwind CSS) with Prisma (PostgreSQL), Docker, JWT cookie auth, RBAC (roles: ADMIN, CUSTOMER), and email verification via a 6-digit code (TTL 15 mins).

Include:

- Auth APIs: register, login, logout, me, verify, resend-code.
- Admin APIs: list users, patch user role.
- UI Pages: /register, /login, /verify, /dashboard, /dashboard/admin, /dashboard/customer.
- Seed verified ADMIN (admin@example.com / Admin123!).
- .env.example, Dockerfile, docker-compose.yml, README.
- Extras:
  1. Rate limiting (verify + resend).
  2. Healthcheck endpoint + Docker healthcheck.
  3. VS Code REST Client test file (docs/testing.http).

## TECH SPECS

- Package manager: **npm**
- Node 20+, Nuxt 3 + **TypeScript**
- UI: Tailwind CSS
- Password hashing: **argon2**
- JWT in HTTP-only cookie named `auth_token`
- Email: Nodemailer SMTP (values from .env)
- Workspace: current folder

## GUARD RAILS

- No real secrets; only `.env.example`.
- Always ask approval before file writes or shell commands.
- Keep diffs small; show patch/diff before saving.
- Do not delete existing files unless necessary and approved.

## DELIVERABLES (create/update)

- prisma/schema.prisma, prisma/seed.ts
- server/utils/{prisma.ts,auth.ts,mailer.ts,zod.ts,rateLimit.ts}
- server/middleware/requireRole.ts
- server/api/auth/{register.post.ts,login.post.ts,verify.post.ts,resend-code.post.ts,me.get.ts,logout.post.ts}
- server/api/admin/users/{index.get.ts,role.patch.ts}
- server/api/health.get.ts
- middleware/{auth.global.ts,guest.global.ts}
- composables/useAuth.ts
- components/{AppHeader.vue,AppContainer.vue,AuthCard.vue}
- pages/{index.vue,login.vue,register.vue,verify.vue}
- pages/dashboard/{index.vue,admin.vue,customer.vue}
- assets/css/tailwind.css, tailwind.config.ts, nuxt.config.ts
- Dockerfile, docker-compose.yml
- .env.example, README.md
- docs/testing.http (VS Code REST Client)

## MILESTONES

### M0 — Init Project & Deps

1. Initialize Nuxt 3 TS project (npm).
2. Install deps:
   - runtime: @prisma/client, argon2, jsonwebtoken, nodemailer, zod, cookie
   - dev: prisma, typescript, @types/node, @types/jsonwebtoken, tailwindcss, postcss, autoprefixer
3. Tailwind setup: tailwind.config.ts + assets/css/tailwind.css.
4. nuxt.config.ts: strict TS, include Tailwind CSS, app title from env.
5. package.json scripts:
   - "dev": "nuxt dev"
   - "build": "nuxt build"
   - "start": "nuxt start"
   - "postinstall": "prisma generate"
   - "seed": "node --loader ts-node/esm prisma/seed.ts"
   - "prisma": "prisma"

### M1 — Prisma Schema & Seed

Schema:

- enum Role { ADMIN, CUSTOMER }
- model User { id(cuid), email unique, name?, password, role default CUSTOMER, isVerified default false, createdAt, updatedAt, verifications EmailVerification[] }
- model EmailVerification { id(cuid), userId, code, expiresAt, usedAt?, createdAt, relation to User(onDelete: Cascade), indexes on userId & code }
- model RateLimit { key String, window DateTime, count Int @default(0); @@id([key, window]); @@index([key]) } for throttling verify/resend.
  Seed verified ADMIN (admin@example.com / Admin123!) with argon2 hash.

### M2 — Utils

- prisma.ts: PrismaClient singleton (log warn/error).
- auth.ts: signToken({sub,role}), getUserFromEvent(H3Event), setAuthCookie, clearAuthCookie.
- mailer.ts: Nodemailer transporter via SMTP; sendVerificationEmail(to, code) with link `${BASE_URL}/verify?email=...&code=...`.
- zod.ts: RegisterSchema (strong password), LoginSchema, VerifySchema.
- rateLimit.ts: `checkRateLimit(key, limit, windowSec)` using RateLimit model (tumbling window). Return `{allowed, remaining, retryAfterSec?}`.

### M3 — Auth APIs

- POST /api/auth/register:
  - Validate body; create user (CUSTOMER, isVerified=false).
  - Generate 6-digit code; create EmailVerification with expiresAt=now+15m; send email.
- POST /api/auth/login:
  - 401 if not found/bad password; if !isVerified → respond **403** `{ needsVerification: true }`; else set JWT cookie and return role.
- POST /api/auth/verify:
  - **Rate limit:** `checkRateLimit('verify:<userId>', 5, 600)`.
  - Accept latest unused, unexpired code; if valid → set isVerified=true and mark usedAt.
- POST /api/auth/resend-code:
  - **Cooldown:** `checkRateLimit('resend:<userId>', 1, 60)` and optional daily cap `checkRateLimit('resendday:<userId>', 10, 86400)`.
  - Generate a new code, store, and email it.
- GET /api/auth/me: return id, email, role, name if token valid; else 401.
- POST /api/auth/logout: clear cookie.

### M4 — Admin APIs & Server Middleware

- server/middleware/requireRole.ts: protect `/api/admin/*` for ADMIN only.
- GET /api/admin/users: list { id, email, role, isVerified, name }.
- PATCH /api/admin/users/role: body { userId, role } → update role.

### M5 — Healthcheck

- GET /api/health → `{ status: 'ok', time: new Date().toISOString() }`.
- docker-compose.yml: service `app` healthcheck hitting `/api/health` (interval 15s, timeout 5s, retries 3).

### M6 — Client Middleware, Composables, UI

- middleware/auth.global.ts: guard `/dashboard*` (redirect to /login if no cookie).
- middleware/guest.global.ts: if logged in, block `/login`, `/register`, `/verify`.
- composables/useAuth.ts: { me, fetchMe, login, logout } with 403 handling → redirect CTA to /verify.
- Components: AppContainer, AppHeader, AuthCard (Tailwind).
- Pages:
  - /index: intro
  - /register: form → POST register → redirect `/verify?email=...`
  - /login: handle 403 needsVerification → link to `/verify?email=...`
  - /verify: 6-digit input; prefill from `?code`; disable button while pending; resend button.
  - /dashboard/index: links to admin & customer
  - /dashboard/admin: table users with role dropdown + save
  - /dashboard/customer: simple welcome

### M7 — Docker (dev)

- Dockerfile (dev): node:20-alpine; copy; `EXPOSE 3000`; `CMD ["npm","run","dev"]`.
- docker-compose.yml:
  - db: postgres:16-alpine (env: POSTGRES_USER/PASS/DB), port 5432, volume.
  - app: build ., ports 3000, env_file .env, depends_on db, volumes ".", command `"npm install && npx prisma migrate deploy && npm run dev"`, **healthcheck** → `/api/health`.

### M8 — Env & README

- `.env.example`: NUXT_APP_NAME, NUXT_PUBLIC_BASE_URL, JWT_SECRET, JWT_EXPIRES_IN=7d, DATABASE_URL, SMTP_HOST/PORT/USER/PASS, SMTP_FROM, VERIFICATION_CODE_TTL_MINUTES=15.
- `README.md`: Quick start (npm), Docker steps, Prisma migrate/seed, Mailtrap guide, troubleshooting (port conflict, DB connection), and how to use docs/testing.http.

### M9 — REST Client (VS Code)

- `docs/testing.http` with runnable requests in order (use variables):
  - Register → Resend (test 200 then 429 within 60s) → Verify (paste code) → Login → Me → Admin list → Admin patch role.

## ACCEPTANCE

- Register sends code; Verify flips isVerified; rate limits enforced (verify: 5/10m; resend: 1/60s + optional 10/day).
- Login blocked until verified (403 `{needsVerification:true}`).
- Healthcheck OK and Docker healthcheck passes.
- REST Client file works end-to-end.
- README documents all steps with **npm** commands (`npm install`, `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`).

Start by proposing the project plan and the exact npm commands for dependencies. Ask for approval before each step.
