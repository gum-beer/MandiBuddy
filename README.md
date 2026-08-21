# MandiBuddy — homepage

The pre-login homepage for MandiBuddy: hero with a live patti demo, a short features
list, a comparison against generic billing software, an about section, and a quick
commission calculator in the navigation.

Built with React + Vite and plain CSS (no Tailwind, no UI library) so every style is
readable and editable in one place.

---

## Run it locally

You need **Node.js 18 or newer** ([download](https://nodejs.org)). Check with `node -v`.

```bash
# 1. install dependencies (first time only)
npm install

# 2. start the dev server
npm run dev
```

It opens at **http://localhost:5173**. Save any file and the browser updates instantly.

Other commands:

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
src/
├── App.jsx                    page assembly, sign in/up handling
├── config.js                  where Sign in / Sign up should go
├── data/content.js            ALL repeated copy: features, comparison, sample lot
├── lib/calc.js                patti maths + default commission/cess rates
├── styles/
│   ├── tokens.css             colours, fonts, spacing — change here first
│   └── global.css             base styles + shared .section / .btn / .ledger-head
└── components/
    ├── NavBar.jsx/.css        fixed nav, anchor links, calculator button
    ├── Hero.jsx/.css          headline + live patti demo with sliders
    ├── PattiSlip.jsx/.css     the settlement slip (used in hero and calculator)
    ├── Features.jsx/.css      section #features
    ├── Comparison.jsx/.css    section #why
    ├── About.jsx/.css         section #about
    ├── CalculatorPanel.jsx/.css  quick commission calculator
    └── Footer.jsx/.css        footer
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

**Sign in / Sign up** — `src/config.js`. Leave a URL empty and the button shows a
reminder instead of navigating. Fill it in and the button goes there.

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
