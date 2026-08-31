# Concepts index

A fast pre-interview skim, not a framework tutorial. One line per concept: what
it is, where it actually lives in this codebase, and why it's here. Full
reasoning for anything below lives in the linked feature doc — this file is
just the table of contents over it.

Updated every time a feature adds a new concept — one or two rows, not a
rewrite.

## Implemented in this codebase

### Backend — NestJS

| Concept | Where | Why it's here |
|---|---|---|
| Modules & dependency injection | `server/src/*/*.module.ts` · [01 §5](01-auth-and-supplier-master.md#5-frameworks--concepts--interview-prep) | one shared `PrismaService` instance, not one DB connection per module |
| Controller / service split | `suppliers.controller.ts` + `suppliers.service.ts` · [01 §5](01-auth-and-supplier-master.md#5-frameworks--concepts--interview-prep) | routing has zero business logic; the service has zero HTTP awareness |
| DTOs + `ValidationPipe` (class-validator) | `server/src/*/dto/*.dto.ts` · [01 §5](01-auth-and-supplier-master.md#5-frameworks--concepts--interview-prep) | a bad request 400s before it ever reaches a service method |
| CORS | `server/src/main.ts` · [01 §5](01-auth-and-supplier-master.md#5-frameworks--concepts--interview-prep) | browsers block cross-origin `fetch` by default (client on :5173, API on :3000) |
| File uploads (`multer` / `FileInterceptor`) | `suppliers.controller.ts` · [01 §5](01-auth-and-supplier-master.md#5-frameworks--concepts--interview-prep) | the Supplier Master's photo upload |

### Database — Prisma / PostgreSQL

| Concept | Where | Why it's here |
|---|---|---|
| Schema-first migrations | `server/prisma/schema.prisma` · [01 §5](01-auth-and-supplier-master.md#5-frameworks--concepts--interview-prep) | one source of truth; `migrate dev` writes the real SQL, doesn't hide it |
| DB transactions (`$transaction`) | `suppliers.service.ts` · [01 §2/§5](01-auth-and-supplier-master.md#2-key-decisions-and-why) | race-condition-safe sequential code generation (`SUP-00001`) — **your strongest single technical story** |
| Nullable unique columns | `schema.prisma` (`code String? @unique`) · [01 §2](01-auth-and-supplier-master.md#2-key-decisions-and-why) | lets insert-then-update avoid a placeholder-string collision (`NULL != NULL` in SQL) |
| Computed vs. stored derived values | `stock-sales.service.ts` (`lotsFor`, `create`) · [02 §2](02-arrival-and-stock-sale.md#2-key-decisions-and-why) | remaining lot balance = nug − sum(sales), recalculated every read, never a mutated counter that can drift |
| RESTRICT foreign keys as a data-integrity guard | `arrival-entries.service.ts` (`isForeignKeyRestriction`) · [02 §5](02-arrival-and-stock-sale.md#5-real-bug-caught-during-testing-worth-knowing-for-interview-prep) | blocks deleting/editing an arrival lot that already has real sales against it — a real bug found and fixed, good interview story about error shapes not matching docs |
| Snapshotting vs. live-computing a financial value | `StockSale.commissionAmount` etc. · [02 §6](02-arrival-and-stock-sale.md#6-commission-panel--resolved-design) | each sale stores the rates *resolved at sale time*, not a live join to current settings — changing the global commission rate later never rewrites a past sale's numbers |
| Global singleton settings row | `CommissionSettings` (`id Int @id @default(1)`) · [02 §6](02-arrival-and-stock-sale.md#6-commission-panel--resolved-design) | `@default(1)` on the PK means a second insert without an explicit id collides with the first — the schema itself enforces "only one row," not just app logic |

### Frontend — React

| Concept | Where | Why it's here |
|---|---|---|
| Client-side routing (`react-router-dom`) | `client/src/main.jsx` · [01 §2](01-auth-and-supplier-master.md#2-key-decisions-and-why) | first screen that isn't a `#section` anchor on the homepage |
| Route guards | `client/src/components/ProtectedRoute.jsx` | gates pages behind a client-only "signed in" flag — UX, not real security (auth is still plaintext) |
| Keys in lists | `client/src/pages/SupplierListPage.jsx` (`key={s.id}`) | stable identity across reorders/inserts — see "reconciliation" below for why this matters |
| Data fetching via `useEffect` | `client/src/pages/SupplierListPage.jsx` | the naive baseline, chosen deliberately for one list — see "React Query" below for the next step |
| Local component state (`useState`) | `client/src/pages/SignInPage.jsx` | form fields nobody outside the component needs |
| Cascading/dependent dropdowns | `client/src/pages/StockSalePage.jsx` | supplier narrows item, item narrows lot — each selection re-fetches or re-filters the next, and resets it on change |
| A hand-rolled combobox (no component library) | `client/src/components/SearchableSelect.jsx` · [02 §1](02-arrival-and-stock-sale.md#1-what-was-built) | the spec asks for searchable dropdowns by name; this project deliberately has no UI library to reach for one |
| One component, three route-driven modes | `client/src/pages/ArrivalEntryFormPage.jsx` (`readOnly` prop) | create/edit/view share one form instead of three near-duplicate pages — the mode is just a prop set per `<Route>` |
| The `useEffect(fn, deps)` implicit-return trap | fixed in `StockSalePage.jsx` · [03](03-client-code-review.md) | passing a function with an expression body (`() => promise.then()`) straight to `useEffect` makes React treat the returned Promise as a cleanup function — "destroy is not a function" crashes the whole tree with no visible error |
| Error boundaries | `client/src/components/ErrorBoundary.jsx` · [03](03-client-code-review.md) | React error boundaries must be class components — no hook equivalent exists (`getDerivedStateFromError`/`componentDidCatch`) — added after the bug above proved the app had no fallback for a render crash |
| DRY via shared CSS/component primitives | `global.css` (`.ledger-table`, `.ledger-input`, `.form-error`, etc.) · [03](03-client-code-review.md) | five pages had independently retyped the same table/input/error styles; consolidating into named primitives (same pattern as `.btn`) cut the CSS bundle ~11% |

### Algorithms

| Concept | Where | Why it's here |
|---|---|---|
| Greedy longest-match tokenization | `server/src/common/transliterate.ts` · [01 §3/§5](01-auth-and-supplier-master.md#3-alternatives-considered-and-rejected) | Roman → Devanagari for "Name in Hindi" — a real small parsing algorithm, not a dependency |

## Fluent-but-not-yet-in-the-code (likely interview questions)

Condensed from conversation — expand on any of these anytime, this is just the jog-your-memory version.

- **Local vs. Context vs. external state** — local (`useState`) by default; Context for values many components *read* but that change rarely (signed-in user, theme) — wrong for anything fast-changing since every consumer re-renders; external (Redux/Zustand) once many unrelated places *write* shared state or you need selective subscriptions/devtools. Server data (a fetched list) usually isn't "state" at all — see React Query below.
- **Reconciliation & keys** — React diffs old vs. new tree in O(n) via two rules: same type at the same spot → patch it in place; different type → tear down and rebuild. Lists default to matching by *array index*, which breaks the moment you reorder/insert/delete — a `key` gives each item a stable identity so React tracks "this item moved" instead of "everything after it changed."
- **`useEffect` vs. React Query vs. React Server Components** — `useEffect`+`fetch` is the naive baseline (no caching, no dedup, hand-rolled loading/race handling) — fine for one list, what this app currently does. React Query is the grown-up version: caching, dedup, background refetch, `useMutation` with cache invalidation — the natural next step once more than one or two places fetch overlapping data. RSC (Next.js only) runs a component's data-fetching *on the server* and ships pre-rendered output — doesn't apply to this Vite SPA at all, but worth knowing why.
- **Retrofitting accessibility** — automated audit first (axe/Lighthouse) for a prioritized list, then fix semantic HTML (real `<button>`/`<label>`) before reaching for ARIA, then a keyboard-only pass, then contrast, then ARIA only where semantic HTML genuinely can't express the widget (e.g. the dashboard mockup's custom tabs). This codebase already has one real a11y feature: `:focus-visible` in `global.css`.
