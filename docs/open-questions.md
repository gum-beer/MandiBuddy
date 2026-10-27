# Open questions and decisions

Format: **Qn** · status · question → answer (date, who decided). Open items are built around with a
marked stub and an `it.todo('Qn: …')`.

## Decided

- **Q1 · DECIDED · Language.** `CLAUDE.md` said JS/JSX; `README.md` and the existing `client/`
  code are TypeScript. → **TypeScript** for client, server and shared. (2026-10-18, user)
- **Q2 · DECIDED · ORM.** `CLAUDE.md` said Drizzle; `README.md` said Prisma. → **Prisma**.
  (2026-10-18, user)
- **Q3 · DECIDED · Server test runner.** `CLAUDE.md` said Vitest everywhere; `README.md` said
  Jest + Supertest for the server. → **Vitest** for client, server and shared (Supertest for API
  tests). (2026-10-18, user)
- **Q4 · DECIDED · Test database.** `CLAUDE.md` planned in-memory PGlite (chosen alongside
  Drizzle); `README.md` planned Docker Compose Postgres. → **Docker Compose Postgres** for dev and
  test (separate test database). (2026-10-18, user)

- **Q5 · DECIDED · Rounding order (R22).** The spec (§12) says "round-half-up on two-decimal
  currency math" but not whether a raw amount with more than 2 decimals (e.g. 7% of 1234.57 =
  86.4199) is first rounded to paise and then to the rupee. → **Round once, straight from the exact
  value to the nearest rupee** (half-up); no intermediate rounding to paise. Example: raw net
  4112.495 → 4112 (not 4112.50 → 4113). 2-decimal rounding is for display only. (2026-10-18, user
  accepted recommendation)
- **Q8 · DECIDED · Sign-up validation.** Spec image 1 gives the fields (red = required), image 2
  gives hints. → Required: company name, mobile 1, username, password, confirm password. Mobiles:
  10 digits starting 6–9 (mobile 2 only if filled). Username: letters, numbers, `_`, min 6.
  Password: min 6; confirm must match. No email/website format checks (not in the spec).
  (2026-10-19, user)
- **Q9 · DECIDED · Navigation.** → **React Router** (v8, declarative mode) from the sign-in/sign-up
  slice on: `/`, `/signin`, `/signup`, `/app`. (2026-10-19, user)
- **Q10 · DECIDED · Fonts.** The Khata design's Khand / Karla / Courier Prime (Google Fonts) →
  **the device's system fonts** (Segoe UI / Roboto / San Francisco) for headings, text and figures.
  Familiar to users, no download, works offline. Set in `client/src/styles/tokens.css`.
  (2026-10-19, user)

## Open

- **Q6 · OPEN (follow-up) · Real auth.** Sign-in/sign-up are a **client-side mock** for now:
  `abc`/`abc` is checked in the browser and sign-up saves nothing. Real auth comes once Docker is
  running and the app takes shape. To decide then: where the sign-up fields are stored (`tenants`
  only has `tenant_id`, `name`, `created_at` in the spec), and what happens to the server mock-auth
  files (`server/src/modules/auth/`, `requireAuth.ts`). (2026-10-19, user)
- **Q7 · OPEN · "Copy accounts and items from my existing company"** (spec image 1 checkbox). Left
  out of sign-up: there is no existing company to copy from yet. (2026-10-19, user)
