# MandiBuddy

Billing/patti/khata software for arhtiyas (commission agents) in Indian APMC mandis,
scoped to the fruit trade. Two independent apps in one repo:

- **`client/`** — the pre-login homepage (hero with a live patti demo, features,
  comparison, about) plus the real app behind sign in (Farmer/Supplier Master, more
  to come). React + Vite, plain CSS.
- **`server/`** — the backend. NestJS + PostgreSQL via Prisma.

They only ever talk over HTTP (`client` calls `server`'s REST API) — no shared build
tooling, no shared `node_modules`.

Each feature has a short write-up in `docs/` — what was built, why, what was rejected,
and (deliberately) what's still missing. Start with `docs/01-auth-and-supplier-master.md`.
New to the codebase? `docs/04-codebase-map.md` tags every file — what to actually
read vs. what's boilerplate/generated and safe to skip.

---

## Run it locally

You need **Node.js 18+** and a local **PostgreSQL** install.

**Backend** (`server/`):

```bash
cd server
npm install                     # first time only
cp .env.example .env            # then edit DATABASE_URL to match your local Postgres
npx prisma migrate dev          # creates the tables
npm run db:seed                 # seeds the abc/abc test login
npm run start:dev               # http://localhost:3000
```

**Frontend** (`client/`), in a second terminal:

```bash
cd client
npm install    # first time only
npm run dev    # http://localhost:5173
```

Sign in at `/signin` with `abc` / `abc` (see `docs/01-auth-and-supplier-master.md` for
why that's plaintext and temporary).

Other client commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

---

## Open it in VS Code

1. Unzip the folder somewhere you keep projects.
2. In VS Code: **File → Open Folder…** and pick `mandibuddy-homepage`.
3. Open the terminal (**Ctrl + `** / **Cmd + `**) and run `npm install`, then `npm run dev`.

### Start git (recommended before you change anything)

```bash
git init
git add .
git commit -m "MandiBuddy homepage: first version"
```

Then you can always get back to a working state with `git restore .`.

### Using Claude Code on it

```bash
npm install -g @anthropic-ai/claude-code   # once
cd mandibuddy-homepage
claude
```

Claude Code reads the whole folder, so ask in plain terms:

- "Change the hero headline and make the accent colour green instead of yellow"
- "Add three more features to the list"
- "Make the comparison table two columns on mobile"
- "Wire the Sign in button to https://app.mandibuddy.in/sign-in"

There is a `CLAUDE.md` in the root that tells Claude Code how this project is arranged —
keep it updated as the project grows.

---

## Where everything lives

```
client/src/
├── App.jsx                    homepage assembly (unchanged — still the visiting card)
├── config.js                  Sign in / Sign up routes, API base URL
├── data/content.js            ALL repeated copy: features, comparison, sample lot
├── lib/
│   ├── calc.js                 patti maths + default commission/cess rates
│   ├── api.js                  fetch wrapper for the NestJS API
│   └── auth.js                 client-side "signed in" flag (localStorage)
├── styles/
│   ├── tokens.css             colours, fonts, spacing — change here first
│   └── global.css             base styles + shared .section / .btn / .ledger-head
├── components/
│   ├── NavBar.jsx/.css        fixed nav, anchor links, calculator button
│   ├── Hero.jsx/.css          headline + live patti demo with sliders
│   ├── PattiSlip.jsx/.css     the settlement slip (used in hero and calculator)
│   ├── Features.jsx/.css      section #features
│   ├── Comparison.jsx/.css    section #why
│   ├── About.jsx/.css         section #about
│   ├── CalculatorPanel.jsx/.css  quick commission calculator
│   ├── Footer.jsx/.css        footer
│   ├── AppLayout.jsx/.css     top bar for pages behind sign in
│   ├── AuthLayout.jsx/.css    shared card chrome for sign in/up
│   └── ProtectedRoute.jsx     redirects to /signin if not signed in
└── pages/
    ├── SignInPage.jsx / SignUpPage.jsx
    └── SupplierFormPage.jsx(+.css) / SupplierListPage.jsx(+.css)

server/src/
├── auth/           signup, signin (plaintext password — see docs/01-…)
├── suppliers/      Farmer/Supplier Master: create, list
├── prisma/         PrismaService — the one DB connection every module shares
└── common/
    └── transliterate.ts   Roman → Devanagari for the "Name in Hindi" field
```

Each component has a CSS file next to it, and class names are prefixed with the
component name (`.hero__title`, `.feature__tag`) so styles never collide.

---

## Common edits

**Text on the page** — features and the comparison table are in `src/data/content.js`.
Hero and about copy sit inside `Hero.jsx` and `About.jsx`.

**Colours and fonts** — `src/styles/tokens.css`. For example, change `--haldi` and every
yellow accent on the page changes. Fonts load from Google Fonts in `index.html`
(Khand for headings, Karla for body, Courier Prime for figures).

**Commission and cess rates** — `src/lib/calc.js` → `DEFAULT_RATES`. These are sample
values for the demo; the real rates differ by state, mandi and commodity.

**Sign in / Sign up** — `client/src/config.js`. Now point at `/signin` and `/signup`,
real routes served by this same app (see `docs/01-auth-and-supplier-master.md`).

**Quick commission calculator** — right now the nav button opens a panel over the page
(`CalculatorPanel.jsx`). When you decide where it should actually go, replace the
button in `NavBar.jsx` with a link to that route — there's a `TODO` comment marking it.

**Navigation jumps** — the nav links are plain `#features`, `#why`, `#about` anchors.
Smooth scrolling comes from `scroll-behavior: smooth` in `global.css`; set it to `auto`
for an instant jump. Section ids are set on the `<section>` tags.

---

## Deliberately not built yet

Per the brief, there is no "Get started for free" section and no contact section. Both
are easy to add later — the section pattern to copy is `Features.jsx`.

Everything marked `TODO` in the code is placeholder content waiting on real material:
the comparison rows, the about-section aside, and footer links.
