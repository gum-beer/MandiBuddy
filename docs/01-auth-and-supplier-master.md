# Feature 01 — Vanilla auth + Farmer/Supplier Master

Spec source: `Master databases/supplier-master-spec.md` (Obsidian).

This is the first feature built behind the homepage. It stands up the whole
backend from nothing — the repo went from "homepage only" to a real
client/server app with a database in this pass — so this doc is longer than
future feature docs will be. It has two parts: what got built, and a
frameworks/concepts primer for interview prep.

---

## 1. What was built

### Repo shape (new)

```
mandibuddy-homepage/
├── client/              ← the existing homepage, moved here as-is
│   └── src/
│       ├── pages/        (new) SignInPage, SignUpPage, SupplierFormPage, SupplierListPage
│       ├── components/   (new) AppLayout, AuthLayout, ProtectedRoute
│       └── lib/           (new) api.js, auth.js
├── server/              ← new NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── auth/          (signup, signin)
│       ├── suppliers/     (create, list)
│       ├── prisma/        (PrismaService — DB connection)
│       └── common/
│           └── transliterate.ts
└── docs/
    └── 01-auth-and-supplier-master.md   ← this file
```

This is the `client/` + `server/` monorepo split that was agreed on before
any backend work started. One git repo, two independent Node projects, no
shared build tooling — they only ever talk over HTTP.

### Backend — `server/`

- **NestJS 11**, TypeScript, scaffolded via `@nestjs/cli`.
- **PostgreSQL**, running locally (installed during this session), accessed
  through **Prisma** as the ORM.
- `Auth` module: `POST /auth/signup`, `POST /auth/signin`. Passwords are
  stored **in plain text on purpose** — this is the "vanilla" auth the spec
  asked for; hashing/sessions/JWT are explicitly future work. A seed script
  (`npm run db:seed` inside `server/`) creates the `abc` / `abc` test login.
- `Suppliers` module: `POST /suppliers` (multipart form, handles the photo
  upload), `GET /suppliers` (list). Maps directly onto the spec's field
  list.
- `code` is generated server-side as `SUP-00001`, `SUP-00002`, … — never
  sent by the client.
- `nameHindi` is generated server-side from `name` — also never sent by the
  client. See §3 for the algorithm.
- Photo uploads land in `server/uploads/` (gitignored, created on boot if
  missing) and are served back at `/uploads/<filename>`.
- Global `ValidationPipe` rejects any request missing a mandatory field or
  sending `mobile1` with non-digit characters, before it ever reaches a
  service.

### Frontend — `client/`

- `react-router-dom` added — this is the first time the app needed more
  than one screen. Routes: `/` (homepage, untouched), `/signin`, `/signup`,
  `/app/suppliers`, `/app/suppliers/new`.
- `AuthLayout` — shared card chrome for Sign In / Sign Up.
- `AppLayout` — shared top bar (brand, nav, sign-out) for pages behind
  sign in.
- `ProtectedRoute` — redirects to `/signin` if `localStorage` has no signed
  in user. This is a UI convenience, not a security boundary — see §2.
- `SupplierFormPage` — one field per spec row, `mobile1` strips
  non-digits as you type, photo is a plain file input.
- `SupplierListPage` — table of everything `GET /suppliers` returns,
  including the auto photo, code, and Hindi name.
- `src/config.js`'s `APP_LINKS.signIn` / `signUp` — previously empty
  (showed a "not wired up" toast) — now point at `/signin` and `/signup`.
  This is the only change to existing homepage code.

All new components/pages follow the existing conventions: one CSS file per
component, classes prefixed by component name, colours/spacing/fonts pulled
from `tokens.css`, nothing hard-coded.

### Verified end-to-end (not just "it compiles")

- `npx tsc --noEmit` on the server: clean.
- `npm run build` on the client: clean.
- Backend, running for real against Postgres:
  - `POST /auth/signin` with `abc`/`abc` → 200. With a wrong password → 401.
  - `POST /suppliers` with `name=Ramesh` → `nameHindi: "रमेश"`, `code: "SUP-00001"`.
  - Missing a mandatory field → 400 with a field-level message.
  - `mobile1=98abc` → 400, rejected before touching the database.
  - A name already in Devanagari (`सुरेश`) → passed through unchanged.
- Frontend: `/`, `/signin`, `/app/suppliers` all serve 200 and the JS entry
  module transforms cleanly under Vite.
- **Not done**: I did not click through the UI in an actual browser myself
  (no browser available to me here) — the API calls, validation, and
  transliteration are verified for real, but the visual form/table haven't
  been eyeballed by anyone yet. Both dev servers are up — worth a manual
  pass before you call this done. `cd server && npm run start:dev`,
  `cd client && npm run dev`, then http://localhost:5173/signin.

---

## 2. Key decisions, and why

| Decision | Why |
|---|---|
| **Prisma** over TypeORM | Faster to get a correct schema running, type-safe queries out of the box, migrations are a single readable SQL file per change. TypeORM's decorator-entity style is arguably closer to a Spring/Hibernate background, but Prisma is the more current industry default and was faster to stand up correctly under time pressure. |
| **`nameHindi` is always server-derived, never client-input** | The spec describes it as something that happens *to* the Name field ("auto-translates"), not a field a user fills in. Keeping it out of the DTO entirely means there's no code path where a stale/wrong Hindi name can be submitted by mistake. |
| **`code` generated via insert-then-update inside one DB transaction** | Postgres unique constraints allow multiple `NULL`s, so the row is created with `code = null`, gets a real DB-assigned `id`, and is immediately updated to `SUP-00001` from that `id` — all in one `$transaction`. This avoids a race condition that a "count existing rows + 1" approach would have under concurrent requests. |
| **Guarantor made optional, not mandatory** | The spec marks it ★ but literally says "if any" — I went with the plain-English instruction over the checkbox, since the two contradict each other. **Flagging this explicitly in case ★ was intentional** — one-line change to make it required if so. |
| **Hand-rolled transliteration instead of a package** | See §3 — the only close npm match is unmaintained. Also a better interview story. |
| **Client-side-only "session" (`localStorage` flag)** | Matches "auth part will be done later" literally — there is no server session to check, so `ProtectedRoute` is a UX nicety (don't show a farmer's data with a bare URL bar), not a security control. Nobody should mistake this for real access control. |
| **`react-router-dom` added now** | The homepage was a single anchor-nav page by design; the moment there's a second real screen (sign in) that isn't a `#section` on the same page, you need actual routing. This is a necessary consequence of the feature, not scope creep. |
| **Photos stored on local disk (`server/uploads/`)** | Simplest thing that works for local dev. Flagged as a deferred problem in §4 — this breaks the moment you deploy to a host with an ephemeral filesystem. |

## 3. Alternatives considered and rejected

- **TypeORM instead of Prisma** — rejected for speed of correct setup; see
  table above. Nothing about the domain (transactions, migrations) favors
  one over the other here, so this came down to velocity.
- **`sanscript` npm package for Hindi transliteration** — the only
  registry match close to "Roman → Devanagari" is at `v0.0.2`, with no
  real download/adoption signal. Depending on it would mean shipping code
  nobody can vouch for, for a resume project whose whole point is
  demonstrating engineering judgment. Instead, `server/src/common/transliterate.ts`
  is a small hand-written greedy tokenizer: it walks the romanized name,
  greedily matches the longest known consonant/vowel cluster at each
  position, and decides whether a consonant keeps its inherent "a" sound
  (word-final) or gets silenced with a halant (mid-word, before another
  consonant). It gets common Indian names right (`Ramesh → रमेश`,
  `Suresh → सुरेश`, `Chandra → चन्द्र`) and is explicitly documented in the
  code as approximate, not a real dictionary translator — good enough for
  a farmer-name field, and a genuinely interesting three-minute
  interview answer about a real (if small) parsing algorithm.
- **Real translation API (Google Cloud Translate) for Hindi names** —
  you were open to this if a truly free tier exists; it doesn't quite —
  Google's free tier still requires a billing account on file (same shape
  of gotcha as the WhatsApp Cloud API discussion earlier). Deferred; easy
  to swap in later since `nameToHindi()` is a single function with one
  call site.
- **Sequential vs. random supplier codes** — considered a
  timestamp+random code (`SUP-x7f2k9`) to avoid the insert-then-update
  transaction entirely. Rejected: a khata-style ledger reads much more
  naturally with sequential folio-style numbers, and it's what an arhtiya
  would actually expect a "Code" column to look like.
- **Docker Postgres** — rejected for this machine/session: no Docker
  installed, and Docker Desktop's WSL2 prerequisite is more setup friction
  than just installing Postgres directly for a single local dev database.

## 4. Deliberately left out / deferred

- **Real auth** — hashing, sessions, JWT. Explicitly out of scope per the
  spec ("auth part will be done later").
- **Edit / delete suppliers** — the spec describes the field set for the
  master record; it doesn't ask for edit or delete yet, so only Create and
  List exist. Easy to add as their own small feature spec.
- **Mobile number length validation** — spec only said "numeric input
  only," so that's all that's enforced. No 10-digit check was added since
  it wasn't asked for.
- **Cloud/object storage for photos** — local disk only for now. Will need
  revisiting before any real hosting deploy (Render/Railway free tiers use
  ephemeral disks — an uploaded photo would vanish on redeploy).
- **Pagination/search on the supplier list** — not asked for; fine at
  small scale, will matter once there are real users' worth of data.
- **`package.json#prisma` config deprecation warning** — Prisma printed a
  notice that this config style is removed in Prisma 7 (not out yet).
  Cosmetic for now, not fixed.

---

## 5. Frameworks & concepts — interview prep

You've got a strong C++/backend background but this is your first real
NestJS + Prisma project. Here's what actually happened in this feature,
mapped to the vocabulary an interviewer would expect you to use.

### NestJS — modules, dependency injection, decorators

NestJS is deliberately Angular-shaped: everything is a class, and classes
declare what they need in their constructor rather than constructing their
own dependencies. Compare:

```ts
// what you did NOT write
class AuthService {
  constructor() {
    this.prisma = new PrismaClient(); // manual wiring — brittle, hard to test
  }
}

// what NestJS does for you
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {} // Nest hands you an instance
}
```

This is **dependency injection (DI)**: `AuthService` declares "I need a
`PrismaService`," and Nest's DI container looks up (or creates) the single
shared instance and hands it over. The `@Module({...})` decorator on
`AuthModule`, `SuppliersModule`, etc. is where you register which
providers exist and which controllers use them — it's the same idea as a
Spring `@Configuration` class or a DI container in any statically-typed
backend framework, which is a fair analogy to reach for in an interview if
your interviewer knows Java/C#.

Why it matters here concretely: `PrismaModule` is marked `@Global()`
(`server/src/prisma/prisma.module.ts`), so every other module gets the
same single `PrismaService` — one connection pool for the whole app,
not one per module.

### Controllers, DTOs, and the validation pipe

A controller (`AuthController`, `SuppliersController`) only does routing —
it maps an HTTP verb + path to a method and hands off to a service. The
`@Body() dto: SignupDto` parameter isn't just documentation: NestJS
constructs an actual `SignupDto` instance from the incoming JSON and — because
`app.useGlobalPipes(new ValidationPipe(...))` is set in `main.ts` — runs
`class-validator` decorators (`@IsString()`, `@Matches(/^[0-9]+$/)`, etc.)
against it **before your controller method body ever runs**. A request
missing `city` never reaches `SuppliersService.create` — it 400s at the
framework boundary. This is the same principle as validating at the edge
in any layered backend: fail fast, keep business logic free of
defensive `if (!x) throw` noise.

### Prisma — schema, migrations, generated client

`prisma/schema.prisma` is the single source of truth for your tables.
`npx prisma migrate dev` diffs that schema against the database's current
state and writes a plain SQL file (`prisma/migrations/<timestamp>_init/migration.sql`)
— that file is the actual migration artifact, and it's meant to be
committed and read, not treated as a black box. `npx prisma generate`
then produces a fully-typed client (`PrismaClient`) so
`prisma.supplier.create({ data: {...} })` is type-checked against your
schema at compile time — if you typo a field name or pass a string where
the schema says `Int`, it's a compile error, not a 2am production bug.

### Database transactions (this is your strongest talking point)

`SuppliersService.create` does this:

```ts
return this.prisma.$transaction(async (tx) => {
  const created = await tx.supplier.create({ data: { code: null, ... } });
  const code = `SUP-${String(created.id).padStart(5, '0')}`;
  return tx.supplier.update({ where: { id: created.id }, data: { code } });
});
```

Two statements, one transaction. If the process crashed between the
`create` and the `update`, Postgres would roll the whole thing back — you'd
never end up with a supplier row stuck with `code: null` forever. This is
the same ACID guarantee you'd reach for doing double-entry ledger writes
later (a patti settlement debiting one balance and crediting another must
never partially apply) — worth saying explicitly if asked "why does this
matter beyond this one feature."

The nullable-unique-column trick (`code String? @unique`) is also worth
knowing cold: in SQL, `NULL` is never equal to another `NULL`, so a unique
index permits any number of rows with `code IS NULL` at once. That's what
makes "create first, fill in the derived unique value after" safe instead
of needing a placeholder string that could collide.

### File uploads (multer, disk storage)

`@UseInterceptors(FileInterceptor('photo', { storage: diskStorage(...) }))`
is NestJS's wrapper around **multer**, the standard Express middleware for
`multipart/form-data`. `diskStorage`'s `filename` callback is what
guarantees two people uploading `photo.jpg` on the same day don't
overwrite each other — every file gets a `${timestamp}-${random}` prefix.
Worth knowing the limitation cold, since it'll come up: this only works
because the app runs on one machine with one persistent disk. The moment
you run more than one server instance (horizontal scaling) or deploy to a
host with an ephemeral filesystem, local disk storage breaks, and the real
answer is object storage (S3-compatible) with the DB only holding a URL/key.

### CORS

`app.enableCors({ origin: process.env.CLIENT_ORIGIN })` in `main.ts`
exists because the browser enforces same-origin by default: a page served
from `http://localhost:5173` (Vite) is, as far as the browser is
concerned, a completely different origin than `http://localhost:3000`
(Nest), even though they're both "localhost." Without this, every `fetch`
from the React app to the API would be blocked by the browser before your
server code even runs. This is purely a browser-side security mechanism —
it does nothing to stop a non-browser client (`curl`, Postman) from
hitting your API, which is exactly why it's not a substitute for real
auth.

### React Router

`react-router-dom`'s `<BrowserRouter>` intercepts link clicks and browser
history so that navigating between `/signin` and `/app/suppliers` doesn't
trigger a full page reload — it swaps components client-side using the
History API (`pushState`), then React re-renders. `<Route path="..." element={...} />`
is just a lookup table from URL path to component. `ProtectedRoute`
wrapping a page in `<Navigate to="/signin" />` is the standard "route
guard" pattern — the same idea as an `AuthGuard` in Angular or middleware
in Express, just expressed as a component because React Router's unit of
composition is components, not middleware functions.

### The transliteration function — a genuine algorithms talking point

`server/src/common/transliterate.ts` is small (under 150 lines) but is a
real little state machine, and it's the one part of this feature that
isn't "wire framework A to framework B" — worth having a 90-second answer
ready:

1. **Longest-match tokenization**: at each position in the string, check
   two-letter consonant/vowel combinations (`kh`, `sh`, `aa`, `ee`, …)
   before falling back to single letters. This is the same principle a
   real tokenizer/lexer uses — always try the longest valid token first,
   or `"ch"` would wrongly split into `"c"` + `"h"`.
2. **Context-sensitive emission**: a consonant is rendered differently
   depending on what follows it — a following vowel becomes a *matra*
   (attached diacritic) instead of a full vowel letter; no following
   vowel means either an inherent "a" (word-final) or an explicit halant
   to suppress it (mid-word, before another consonant). That's a small
   but real example of a grammar where output depends on lookahead, not
   just the current token.
3. **Known, stated limitation**: plain Roman "a" can't distinguish short
   अ from long आ (that information isn't in the input), so the function
   is documented as best-effort, not a linguistically complete
   transliterator. Being able to say precisely *why* it's approximate —
   not just "it's not perfect" — is the difference between "I copied
   something" and "I understood the problem."

### Why this whole feature is a better interview story than a CRUD tutorial

Every decision in §2/§3 has a stated reason grounded in a real constraint
(concurrency safety, a contradiction in the spec, dependency quality,
deployment reality) rather than "that's what the tutorial did." That's the
actual difference between "I built a CRUD app" and "I made engineering
tradeoffs" — and it's mechanically reproducible for every feature after
this one if each spec keeps getting a doc like this.
