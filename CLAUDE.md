# MandiBuddy — notes for Claude Code

## What this is

Billing/patti/khata software for arhtiyas (commission agents) in Indian APMC mandis,
scoped to the fruit trade. Two apps in one repo, talking only over HTTP:

- `client/` — the pre-login marketing homepage (single page, anchor navigation, no
  router *within* the homepage itself) **plus** the real app behind sign in
  (currently: Farmer/Supplier Master). Routing between the two exists via
  `react-router-dom` — see `client/src/main.jsx`.
- `server/` — NestJS + PostgreSQL (via Prisma).

Every feature built behind sign in has a write-up in `docs/` (what was built, key
decisions, alternatives rejected, what was deliberately deferred) — check there before
assuming something is missing by accident vs. on purpose. Work feature-by-feature from
specs the user writes separately; don't scaffold ahead of what's been asked.

## Workflow — commit as you go

When a feature is done (its `docs/NN-…` write-up included), commit it — don't leave
finished work sitting in the working tree until "later." One commit (or a small
tight series) per feature, not one commit for a pile of unrelated features. Update
this file's Stack/Conventions/Open TODOs in the same commit if the feature changes
them — don't let CLAUDE.md drift silently behind the code. Ask before pushing to
`origin/main` if it's not already the established rhythm for this session.

## Stack — `client/`

React 18 + Vite. Plain CSS, one file per component, imported by that component.
No Tailwind, no CSS-in-JS, no component library. Keep it that way unless asked.

Run: `cd client && npm install` then `npm run dev` (port 5173). Build: `npm run build`.

## Stack — `server/`

NestJS (TypeScript) + PostgreSQL via Prisma. Passwords are plaintext for now —
real auth (hashing, sessions/JWT) is intentionally deferred; see `docs/01-…`.

Run: `cd server && npm install`, set up `.env` from `.env.example`,
`npx prisma migrate dev`, `npm run db:seed`, then `npm run start:dev` (port 3000).

## Conventions — `client/`

- Class names are BEM-ish and prefixed by component: `.hero__title`, `.feature__tag`.
  Never write bare element or generic selectors in a component CSS file.
- Colours, fonts, spacing and motion all come from CSS custom properties in
  `client/src/styles/tokens.css`. Do not hard-code a hex value in a component.
- Shared primitives live in `client/src/styles/global.css`: `.shell` (max width +
  gutter), `.section` (vertical rhythm + scroll offset), `.ledger-head` (section
  heading), `.btn` / `.btn--solid` / `.btn--haldi`, `.ruled`, `.sr-only`.
- Repeated copy goes in `client/src/data/content.js`, not inline in JSX.
- Money and weight are formatted through `client/src/lib/calc.js` (`formatMoney` uses
  Indian digit grouping). Don't format numbers ad hoc.
- API calls go through `client/src/lib/api.js`; don't call `fetch` directly in a
  component.

## Design direction — keep this intact

The page is a bahi-khata: ink on ruled paper, a red cloth spine down the left of the
hero, haldi-yellow used only for the number that matters, and Courier Prime for every
figure so amounts read like a printed slip. Sections are numbered as folios.

The signature element is the live patti slip in the hero — moving a slider recalculates
the farmer's settlement in real time. Keep it the loudest thing on the page; if
something new competes with it, quieten the new thing.

Typefaces: Khand (display), Karla (body), Courier Prime (figures). Loaded in
`index.html`.

## Domain vocabulary

arhat = commission · patti = farmer settlement slip · khata = running ledger ·
boli = auction bid rate · dhalta = wastage allowance per bag · peshgi = advance ·
palledari = labour charge · quintal = 100 kg · APMC market fee and RDF = state levies.

Rates in `DEFAULT_RATES` are demo placeholders. They vary by state and commodity —
never present them as authoritative.

## Open TODOs

- `NavBar.jsx`: quick commission calculator currently opens a panel; swap to a route
  link once the destination is decided.
- Comparison rows in `content.js` and the about aside are placeholder content.
- No "Get started for free" or contact section — intentionally out of scope for now.
- Supplier Master: create + list only, no edit/delete yet; photos are stored on local
  disk (`server/uploads/`), which won't survive a real deploy — see
  `docs/01-auth-and-supplier-master.md` §4 for the full deferred list.
- Arrival Entry / Arrival Book / Stock Sale / Sale Register exist (`docs/02-…`).
  The commission panel (Cm%/MarketFees/RDF/Bardana/Laga → Net Amount) is
  intentionally not built — `netAmount` is a placeholder copy of `basicAmount`
  until that's signed off; see `docs/02-…` §6 before touching it.
- No Items, Crate, or Customer master tables exist — item/crate/customer are
  plain text fields until those get their own spec, same as Supplier did.
