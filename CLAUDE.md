# MandiBuddy — project instructions for Claude

MandiBuddy is a multi-tenant web app for fruit/vegetable mandi traders: suppliers bring stock
(arrivals), the trader sells it lot-wise to customers (sales) for commission, and the app tracks
stock pendency, crates, bills, payments and party ledgers. One trader = one tenant.

**Current phase:** Phase 0 — running skeleton. (Update this line when a phase closes; phases are in `docs/ARCHITECTURE.md` §6.)

## 1. Read before you work
- `docs/specs/**` is the **source of truth** (the user's Obsidian notes). `![[Pasted image X.png]]`
  means `docs/specs/Images_folder/Pasted image X.png`: open it. Images show **fields and flow**, not
  the visual design ("old logic, new design"). Every value inside an image is a placeholder.
- `docs/ARCHITECTURE.md` (not present for now) (folders, API map, routes, phases) · `docs/DATABASE.md` (tables, posting rules)
  · `docs/TESTING.md` · `docs/open-questions.md`.
- **Conflict rule (from the user's spec):** if two sources disagree, or something is marked
  `[OPEN]`, do **not** pick one silently. Stop, ask, then log the answer in `docs/open-questions.md`.
  Build around an open point with a clearly marked stub and an `it.todo('Qn: …')`.
- Never edit `docs/specs/**` unless the user asks you to in this conversation.

## 2. Stack and commands
**TypeScript everywhere (Q1).** React 19 + Vite (TSX) · React Router · Express 5 · Zod ·
Prisma ORM (Q2) · PostgreSQL 15+ via Docker Compose, separate dev and test databases (Q4) ·
decimal.js · Vitest everywhere (Q3) + React Testing Library + Supertest · Playwright. npm workspaces:
`client/`, `server/`, `shared/` (pure functions used by both sides, e.g. sale calculation).

| Task | Command |
|---|---|
| Start / stop Postgres (Docker, host port 5433) | `npm run db:up` / `npm run db:down` |
| Run app (API :4000, web :5173) | `npm run dev` |
| All unit/component/API tests | `npm test` |
| Tests for what you changed | `npm run test:changed` |
| One file | `npx vitest run path/to/file.test.ts` |
| E2E | `npm run e2e` |
| Lint | `npm run lint` |
| Schema change → migration | edit `server/prisma/schema.prisma` → `npm run db:migrate:create -- --name <change>` (`prisma migrate dev --create-only`) → read the SQL in `server/prisma/migrations/` → `npm run db:migrate` |
| Reset dev data | `npm run db:seed` (ask first: it wipes dev data) |

## 3. Scope right now
- **No real auth yet.** Sign-in is a **client-side** mock for now: `abc` / `abc` checked in the
  browser, sign-up saves nothing (Q6). Server middleware `requireAuth` (mock token →
  `req.ctx = { db, tenantId, userId }`) exists but the pages don't use it yet. Do not add JWT,
  sessions, OAuth, password reset or roles until the auth phase.
- Sign-up page = UI + validation only for now. Fiscal-year settings are out of scope.
- Build only the current phase. Don't scaffold future modules "while you're there".

## 4. Domain words (use exactly these in code and UI)
supplier (= seller/farmer/grower) · customer (= buyer) · trader = tenant · **nug** (count unit;
stock balance is nug-only) · lot no · rate basis = the "Per" choice (`NUG` | `WEIGHT`) · commission,
market fee, RDF (all %), laga (₹ per nug) · pendency (unsold nug) · supplier bill (patti) ·
voucher no (arrivals), Sr no (sales). Spec rules are numbered **R1–R26**
(`docs/specs/Stock Report/mandi-stock-sale-spec.md` §16); billing/ledger rules are **B/P/L**
(`docs/specs/BILLING/billing-payments-ledger-spec.md`). Cite rule IDs in code comments and tests.

## 5. Backend rules (`server/`)
1. **Layers:** `routes → controller → service → db`. Controllers only translate HTTP. Services hold
   every business rule and take `(ctx, input)`; they use `ctx.db` (a `PrismaClient` or a
   transaction client), never a global Prisma import (tests pass in a client for the Docker test db, Q4). Module
   files: `x.routes.ts`, `x.controller.ts`, `x.service.ts`, `x.schema.ts` (Zod) in
   `server/src/modules/x/`.
2. **Tenant isolation:** every query filters `tenant_id = ctx.tenantId` (Prisma:
   `where: { tenantId: ctx.tenantId, … }`). Never accept `tenantId` from
   the body, query or params. When an input references another row (supplierId, lotId…), load it
   with the tenant filter first; if not found → 404. Every new endpoint gets a "tenant B cannot see
   tenant A" API test.
3. **Validation:** a Zod schema per endpoint via `validate()` middleware. Coerce numeric strings,
   trim text, reject unknown keys.
4. **Money:** never do arithmetic on JS numbers. Use `shared/src/money.ts` (decimal.js,
   `ROUND_HALF_UP`). Money columns are Prisma `Decimal` (`@db.Decimal(p,s)`), returned as
   `Prisma.Decimal`; never `Number()` them, send them as strings in JSON. The **server recomputes
   every amount** with `shared/src/saleCalc.ts` and ignores totals sent by the client.
5. **Transactions:** any write that touches more than one row or table runs in
   `ctx.db.$transaction(async (tx) => …)`; pass `{ ...ctx, db: tx }` to services called inside it.
   Sale save: lock the lot row (``tx.$queryRaw`SELECT … FOR UPDATE` ``; Prisma has no query-builder
   lock), recompute balance, then insert (R23).
   Running numbers come from `doc_counters` inside the same transaction. Ledger rows are posted in
   the same transaction as the event that causes them (`docs/DATABASE.md` §4).
6. **Errors:** throw `new AppError(status, code, message, { field })`. The error handler returns
   `{ error: { code, message, field } }`. Business-rule violations are 422 and name the `field`
   so the UI can focus it.
7. **Deletes** of arrivals, sales and payments need the user's password, are refused while
   dependent rows exist (sales on a lot, a FINAL bill), and write `audit_log` with the before-image.
8. **Migrations:** never edit an applied migration in `server/prisma/migrations/`, never run
   `prisma db push` or `prisma migrate reset` against a db with data (ask first).

## 6. React rules (`client/`)
**State and props, precisely:**
- State belongs to the component that declares it (the *owner*). Only the owner changes it.
- Children receive it as **props, read-only**. A child never edits props; to change data it calls a
  **callback prop** (`onAdd`, `onChange`, `onDelete`) and the owner updates its own state.
- Data flows down, events flow up. Two siblings needing the same data → **lift the state** to their
  nearest common parent. A child cannot read its parent's state except through props.
- **Don't store what you can compute.** Basic/net amount, totals, filtered rows, "available nug",
  "is over balance" are calculated during render (use `shared/` functions). No `useState` +
  `useEffect` to mirror other state.
- Context only for app-wide data: `AuthContext` (mock user + tenant). Page data stays in pages.
  No Redux or other global store.
- `useEffect` only to sync with the outside world (fetching, focusing a cell). Pages fetch through
  `features/<module>/<module>.api.ts`; components under `src/components/` never call the API.
- List keys = stable ids (DB id, or a `tempId` for unsaved rows). Never the array index: rows get
  deleted.
- Inputs are controlled and hold strings; convert at submit.

Ownership example (Stock Sale page):
```
StockSalePage      owns: saleDate, supplierId, stagedLines[], chargeSettings (fetched), lots (fetched)
                   derives: availableNug per lot = lot.balanceNug − Σ staged nug for that lot
├─ SaleHeader      props: saleDate, supplierId, suppliers, onDateChange, onSupplierChange
├─ SaleLineForm    owns: its draft fields  · props: lots, availableNug, customers, chargeSettings, onAdd(line)
│  └─ ChargesPopover  props: value, onChange   (global values; saving calls the page's onSaveCharges)
├─ SaleGrid        props: lines, onRemove(tempId)
└─ TotalsBar       props: lines               (totals computed during render)
```
**UI conventions from the specs:** every dropdown is searchable (`SearchableSelect`); entry
screens stay tabular (no card-style "add line item" buttons); validation = standard red border,
inline message, focus moves to the offending cell (R23); dates shown `dd-mm-yyyy`, sent
`YYYY-MM-DD`; amounts `₹` with 2 decimals, net amounts whole rupees.

## 7. Testing rules (details: `docs/TESTING.md`)
- Test names start with the rule ID: `it('R23: blocks selling more nug than the lot balance')`.
- Golden numbers from the specs are asserted **exactly** (5450, 4113, 4500, 3750, 8275, 2716).
- **Never** delete, skip or loosen a failing test, or change an expected number, to get green. If
  you believe the test contradicts the spec, stop and ask.
- Writing and running tests for a module is the **test-engineer** agent's job: `/test-module <module>`.
  It works from `docs/test-briefs/<module>.md`. You fix the app code it reports as wrong.
- Hooks: lint runs after every edit; tests related to your changes run when you finish (a failing
  run sends you back to fix). Set `MANDIBUDDY_SKIP_STOP_TESTS=1` only if the user asks.

## 8. How to work
1. **Plan first** for anything touching more than two files, the schema, or money logic: list files,
   functions, endpoints, components and tests; wait for the user's OK.
2. Build in **vertical slices**: schema → service (+ tests) → route (+ API test) → page/components
   (+ component test). One slice per branch.
3. **Ask before:** adding a dependency, changing the schema, deleting files, touching `.env`,
   or anything a spec leaves open.
4. **Don't:** rename domain terms, refactor unrelated code, invent fields that aren't in a spec,
   or "improve" spec decisions on your own.
5. **Definition of done:** the slice works end to end in the browser, `npm test` and `npm run lint`
   are green, new rules have tests, and the docs are updated if a decision changed.
6. **Finish every task with a "What changed" report** (the user wants the details):
   - Files: `path` — what changed and why
   - How to check it: commands plus the clicks on screen
   - Tests: added/updated, pass/fail counts
   - Assumptions made and open questions (with Q-numbers)
7. Commit only when asked: small commits, `feat(sales): …` / `fix(arrivals): …` / `test(…)`.
8. When a decision is made, update `docs/open-questions.md` and the affected doc. Keep this file
   under 200 lines; propose edits to it instead of letting it grow.