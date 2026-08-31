# Codebase map — what to read vs. what to ignore

Every file in the project (110, excluding `node_modules`/`.git`/`dist`),
tagged so you know where to spend actual reading time. Line counts included
so you can gauge effort before opening something.

**Legend**
- `[REVIEW]` — hand-written, has real logic or a decision behind it. Worth reading.
- `[SKIM]` — hand-written but thin (styling, wiring, validation lists). Fine to glance at, not worth memorizing.
- `[SKIP]` — framework scaffold, untouched or nearly untouched since a tool generated it. Safe to ignore entirely.
- `[GENERATED]` — 100% machine-written, regenerated from something else, never hand-edited, never worth opening.

---

## client/ — the homepage (pre-existing, before I touched this project)

- `client/index.html` (23) — `[SKIM]` Vite entry HTML + Google Fonts links, standard template shape.
- `client/src/App.jsx` (70) — `[REVIEW]` homepage assembly, the sign-in/up handoff + toast fallback.
- `client/src/App.css` (32) — `[SKIM]` skip-link + toast styling only.
- `client/src/components/NavBar.jsx` (101) — `[REVIEW]` scroll-shrink + active-section highlighting via `IntersectionObserver` — real logic.
- `client/src/components/NavBar.css` (164) — `[SKIM]` styling only.
- `client/src/components/Hero.jsx` (90) — `[REVIEW]` the live patti-slip demo — the page's signature feature.
- `client/src/components/Hero.css` (191) — `[SKIM]` styling only.
- `client/src/components/PattiSlip.jsx` (93) — `[REVIEW]` the settlement-slip renderer, reused by Hero and the calculator.
- `client/src/components/PattiSlip.css` (154) — `[SKIM]` styling only.
- `client/src/components/Features.jsx` (28) — `[SKIM]` trivial list render from `content.js`.
- `client/src/components/Features.css` (76) — `[SKIM]` styling only.
- `client/src/components/Comparison.jsx` (50) — `[SKIM]` trivial table render from `content.js`.
- `client/src/components/Comparison.css` (103) — `[SKIM]` styling only.
- `client/src/components/About.jsx` (59) — `[SKIM]` static copy section.
- `client/src/components/About.css` (80) — `[SKIM]` styling only.
- `client/src/components/Footer.jsx` (40) — `[SKIM]` static footer.
- `client/src/components/Footer.css` (94) — `[SKIM]` styling only.
- `client/src/components/CalculatorPanel.jsx` (126) — `[REVIEW]` the standalone commission calculator modal — real interactive state.
- `client/src/components/CalculatorPanel.css` (154) — `[SKIM]` styling only.
- `client/src/data/content.js` (113) — `[REVIEW]` all homepage copy in one place — read once to see what's placeholder vs. real.
- `client/src/lib/calc.js` (66) — `[REVIEW]` the actual patti math — the one function worth understanding cold.

## client/ — app infrastructure (holds every page together)

- `client/src/main.jsx` (36) — `[REVIEW]` the router table + ErrorBoundary wiring — the map of every route in the app.
- `client/src/config.js` (14) — `[REVIEW]` tiny, but decides where sign-in/up go and what API host is used.
- `client/src/lib/api.js` (46) — `[REVIEW]` the one fetch wrapper every page goes through.
- `client/src/lib/auth.js` (20) — `[REVIEW]` the entire "session" — just a localStorage flag; read this to internalize there's no real auth yet.
- `client/src/lib/dates.js` (16) — `[SKIM]` one small helper, self-explanatory.
- `client/src/components/ProtectedRoute.jsx` (12) — `[SKIM]` trivial route guard.
- `client/src/components/AppLayout.jsx` (48) — `[SKIM]` shared top-bar chrome for signed-in pages.
- `client/src/components/AppLayout.css` (66) — `[SKIM]` styling only.
- `client/src/components/AuthLayout.jsx` (19) — `[SKIM]` shared card chrome for sign-in/up.
- `client/src/components/AuthLayout.css` (92) — `[SKIM]` styling only.
- `client/src/components/ErrorBoundary.jsx` (34) — `[REVIEW]` just added — the app's only crash safety net; non-obvious that it must be a class component.
- `client/src/components/ErrorBoundary.css` (18) — `[SKIM]` styling only.
- `client/src/components/SearchableSelect.jsx` (78) — `[REVIEW]` hand-rolled combobox — filtering, click-away, keyboard handling, all real logic.
- `client/src/components/SearchableSelect.css` (36) — `[SKIM]` styling only.
- `client/src/components/DateRangeFilter.jsx` (31) — `[SKIM]` tiny, presentational, just extracted from duplication.
- `client/src/components/DateRangeFilter.css` (18) — `[SKIM]` styling only.
- `client/src/components/StatStrip.jsx` (17) — `[SKIM]` tiny, presentational, just extracted from duplication.
- `client/src/components/StatStrip.css` (32) — `[SKIM]` styling only.
- `client/src/styles/tokens.css` (52) — `[REVIEW]` every design decision (colour/font/spacing) in one place — read once.
- `client/src/styles/global.css` (261) — `[REVIEW]` shared primitives (`.btn`, `.ledger-head`, `.ledger-table`, etc.) — check here before writing new page CSS.

## client/ — Auth pages

- `client/src/pages/SignInPage.jsx` (70) — `[REVIEW]` calls `/auth/signin`, sets the session flag.
- `client/src/pages/SignUpPage.jsx` (70) — `[REVIEW]` same shape, `/auth/signup`.

## client/ — Supplier Master pages

- `client/src/pages/SupplierFormPage.jsx` (168) — `[REVIEW]` the create-supplier form, mobile-digit-filtering logic.
- `client/src/pages/SupplierFormPage.css` (24) — `[SKIM]` styling only.
- `client/src/pages/SupplierListPage.jsx` (98) — `[REVIEW]` the list + photo rendering.
- `client/src/pages/SupplierListPage.css` (16) — `[SKIM]` styling only.

## client/ — Arrival / Stock Sale pages (newest, most complex code in the client)

- `client/src/pages/ArrivalEntryFormPage.jsx` (324) — `[REVIEW]` the biggest client page — one component doing create/edit/view, repeatable item rows. Read this carefully.
- `client/src/pages/ArrivalEntryFormPage.css` (70) — `[SKIM]` styling only.
- `client/src/pages/ArrivalBookPage.jsx` (141) — `[REVIEW]` client-side nug/sold/balance aggregation logic.
- `client/src/pages/ArrivalBookPage.css` (13) — `[SKIM]` two page-specific rules left after dedup.
- `client/src/pages/StockSalePage.jsx` (435) — `[REVIEW]` the single largest, most logic-dense file in the client — cascading dropdowns, live commission-math preview, the `useEffect` bug that was fixed here. Read this one first if you only read one.
- `client/src/pages/StockSalePage.css` (136) — `[SKIM]` styling only, all logic lives in the `.jsx`.
- `client/src/pages/SaleRegisterPage.jsx` (118) — `[REVIEW]` the simplest of the four report/entry pages — good one to start with.

## client/ — build/config

- `client/package.json` (21) — `[SKIM]` dependency list, hand-edited a few times.
- `client/vite.config.js` (10) — `[SKIP]` near-default Vite+React plugin config.
- `client/public/favicon.svg` — `[SKIP]` vector image asset, not code.
- `client/package-lock.json` (1,756 lines) — `[GENERATED]` npm-written, never hand-edited.
- `client/node_modules/` (2,445 files) — `[GENERATED]` installed dependencies, gitignored, rebuilt via `npm install`.
- `client/dist/` — `[GENERATED]` build output, gitignored, rebuilt via `npm run build`.

---

## server/ — bootstrap

- `server/src/main.ts` (17) — `[REVIEW]` tiny but critical: CORS, the global validation pipe, uploads-dir bootstrap.
- `server/src/app.module.ts` (31) — `[REVIEW]` module wiring — read this to see every feature module that exists at a glance.
- `server/src/app.controller.ts` (12), `app.service.ts` (8), `app.controller.spec.ts` (22) — `[SKIP]` Nest's default "hello world" scaffold, never used, safe to ignore (or delete).

## server/ — Prisma (the data model)

- `server/prisma/schema.prisma` (134) — `[REVIEW]` the single most important backend file — every table, relationship, and the comments explaining each design decision.
- `server/prisma/seed.ts` (22) — `[SKIM]` seeds the `abc`/`abc` test login.
- `server/prisma/migrations/*/migration.sql` (3 files, 34+65+18 lines) — `[GENERATED]` auto-written by `prisma migrate dev` from the schema — readable as a changelog, never hand-edited.
- `server/prisma/migrations/migration_lock.toml` (3) — `[GENERATED]` Prisma bookkeeping.

## server/ — Auth module

- `server/src/auth/auth.controller.ts` (19), `auth.service.ts` (40), `auth.module.ts` (9) — `[REVIEW]` small and deliberately "vanilla" — the best module to start with, since it's the simplest full controller→service→DB slice.
- `server/src/auth/dto/signin.dto.ts` (11), `signup.dto.ts` (11) — `[SKIM]` field validation only.

## server/ — Suppliers module

- `server/src/suppliers/suppliers.controller.ts` (42), `suppliers.service.ts` (43), `suppliers.module.ts` (9) — `[REVIEW]` the transaction + nullable-unique-code trick lives in the service — the strongest single engineering story in the app.
- `server/src/suppliers/dto/create-supplier.dto.ts` (35) — `[SKIM]` validation only.

## server/ — Arrival Entries module

- `server/src/arrival-entries/arrival-entries.controller.ts` (43), `arrival-entries.module.ts` (10) — `[SKIM]` thin routing/wiring.
- `server/src/arrival-entries/arrival-entries.service.ts` (179) — `[REVIEW]` the most complex service in the backend: lot-number auto-suffix resolution, the FK-restriction bug fix, transactional item/charge writes.
- `server/src/arrival-entries/dto/create-arrival-entry.dto.ts` (75) — `[SKIM]` worth a glance to see nested-array DTO validation, otherwise just field lists.

## server/ — Stock Sales module

- `server/src/stock-sales/stock-sales.controller.ts` (42), `stock-sales.module.ts` (9) — `[SKIM]` thin routing.
- `server/src/stock-sales/stock-sales.service.ts` (127) — `[REVIEW]` balance computation, oversell prevention, the commission-math formula — read alongside `StockSalePage.jsx`.
- `server/src/stock-sales/dto/create-stock-sale.dto.ts` (31) — `[SKIM]` validation only.

## server/ — Commission Settings module

- `server/src/commission-settings/commission-settings.controller.ts` (18), `.module.ts` (10), `.service.ts` (30) — `[SKIM]` small; the singleton-row pattern (`@default(1)` on the PK) is the one interesting bit, explained in `schema.prisma`.
- `server/src/commission-settings/dto/update-commission-settings.dto.ts` (19) — `[SKIM]` validation only.

## server/ — shared

- `server/src/common/transliterate.ts` (152) — `[REVIEW]` the hand-rolled Hindi transliteration algorithm — the one genuine "interesting algorithm" file in the project, worth reading end to end.
- `server/src/prisma/prisma.module.ts` (9), `prisma.service.ts` (16) — `[SKIM]` tiny glue, explains why every module shares one DB connection.

## server/ — test scaffold

- `server/test/app.e2e-spec.ts` (29), `jest-e2e.json` (9) — `[SKIP]` Nest's default e2e test, checks the unused default route, never extended. (Note: this is also the project's only test file — there is no real test coverage yet, flagged already in `docs/01` §4.)

## server/ — build/config

- `server/package.json` (85) — `[SKIM]` dependency list, hand-edited each time a module was added.
- `server/tsconfig.json` (25), `tsconfig.build.json` (4) — `[SKIP]` standard Nest TypeScript config, essentially untouched.
- `server/nest-cli.json` (8) — `[SKIP]` Nest CLI scaffold config, untouched.
- `server/eslint.config.mjs` (35), `.prettierrc` (4) — `[SKIP]` auto-generated by `nest new`, untouched.
- `server/.env.example` (3) — `[SKIM]` template listing the required env vars.
- `server/.env` (3) — `[SKIP]` your actual local secrets (DB password), gitignored, personal — never opened by anyone but you.
- `server/.gitignore` (6) — `[SKIM]` trivial.
- `server/README.md` (98) — `[SKIP]` Nest's default generated README — boilerplate text about the framework, not about this project.
- `server/package-lock.json` (10,892 lines) — `[GENERATED]` npm-written, never opened.
- `server/node_modules/` (37,153 files) — `[GENERATED]` installed dependencies — this is why the server install is so much bigger than the client's.
- `server/dist/` — `[GENERATED]` compiled JS build output.
- `server/uploads/` — `[GENERATED AT RUNTIME]` currently empty; where uploaded supplier photos land; the folder itself is created automatically on server boot (`main.ts`), its *contents* are user data, not code.

---

## Root

- `README.md` (164) — `[REVIEW]` how to actually run both halves — read this first if you're picking the project back up cold.
- `CLAUDE.md` (85) — `[REVIEW]` the project's own standing instructions/conventions — worth rereading periodically, it's the thing that keeps sessions consistent.
- `docs/00-concepts-index.md` (64), `01-auth-and-supplier-master.md` (340), `02-arrival-and-stock-sale.md` (173), `03-client-code-review.md` (267) — `[REVIEW]` all four — this is the running "what and why" record for everything built so far.
- `.gitignore` (8) — `[SKIM]` trivial.
- `.claude/settings.json` (23) — `[SKIM]` the permission rules set up together this session.
- `.claude/settings.local.json` (39) — `[SKIP]` auto-generated by the CLI, tracking approved commands — personal/machine-specific, gitignored.

---

## The honest summary

Out of 110 files: **~35 are worth actually reading** (marked `[REVIEW]` above —
mostly the `.jsx`/`.ts` files with real logic, the schema, the docs). Another
~30 are `[SKIM]`-worthy (mostly `.css` and thin DTOs/wiring — glance, don't
memorize). The rest — roughly a third of the file *count*, but essentially
none of the *lines you'd ever read* — is either framework scaffold nobody
touches (`[SKIP]`) or fully machine-written (`[GENERATED]`: two lockfiles
totaling ~12,600 lines, ~39,600 `node_modules` files, migration SQL, build
output). That last category is exactly what showed up as "so many files" in
your file explorer earlier — none of it is something you or I wrote.
