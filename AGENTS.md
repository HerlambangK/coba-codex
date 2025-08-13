Plan first, then scaffold step-by-step with my approval for each file or command.

Goal:
Build a fullstack Nuxt 3 app using TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Docker, and npm as the package manager.
Implement Role-Based Access Control (roles: ADMIN, CUSTOMER) and email verification with a 6-digit code.

Requirements:

- Auth: register, login, logout, me endpoint.
- On register: role=CUSTOMER, isVerified=false, generate 6-digit code (expires in 15 min) stored in EmailVerification table, send via email (SMTP from .env).
- Login blocked if !isVerified → client redirect to /verify (input code).
- Verify endpoint checks latest code, expiry, unused → set isVerified=true.
- Admin APIs: list users, update user role.
- UI Pages: /register, /login, /verify, /dashboard (redirect by role), /dashboard/admin, /dashboard/customer.
- Tailwind for styling, responsive design.
- Prisma schema: User, EmailVerification, enum Role (ADMIN, CUSTOMER).
- Seed verified ADMIN user (admin@example.com / Admin123!).
- Dockerfile + docker-compose.yml for Postgres and app.
- Provide .env.example and README with run steps (npm install, prisma migrate dev, seed, npm run dev).

Steps:

1. Initialize Nuxt 3 TS project with Tailwind (use npm).
2. Install Prisma, configure PostgreSQL connection, generate schema.
3. Create API routes for auth and admin features.
4. Add JWT auth, bcrypt password hashing.
5. Create Nodemailer utility for email verification code.
6. Add server & client middleware for role-based routing.
7. Build UI pages and forms with Tailwind CSS.
8. Add Docker support for Postgres and app.
9. Write README with clear setup instructions.
10. Test flow: register → receive code → verify → login → dashboard by role.
