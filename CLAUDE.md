# MandiBuddy homepage — notes for Claude Code

## What this is

The pre-login marketing homepage for MandiBuddy, billing/patti/khata software for
arhtiyas (commission agents) in Indian APMC mandis. It hands off to the main app at
sign in / sign up. Single page, anchor navigation, no router.

## Stack

React 18 + Vite. Plain CSS, one file per component, imported by that component.
No Tailwind, no CSS-in-JS, no component library. Keep it that way unless asked.

Run: `npm install` then `npm run dev` (port 5173). Build: `npm run build`.

## Conventions

- Class names are BEM-ish and prefixed by component: `.hero__title`, `.feature__tag`.
  Never write bare element or generic selectors in a component CSS file.
- Colours, fonts, spacing and motion all come from CSS custom properties in
  `src/styles/tokens.css`. Do not hard-code a hex value in a component.
- Shared primitives live in `src/styles/global.css`: `.shell` (max width + gutter),
  `.section` (vertical rhythm + scroll offset), `.ledger-head` (section heading),
  `.btn` / `.btn--solid` / `.btn--haldi`, `.ruled`, `.sr-only`.
- Repeated copy goes in `src/data/content.js`, not inline in JSX.
- Money and weight are formatted through `src/lib/calc.js` (`formatMoney` uses Indian
  digit grouping). Don't format numbers ad hoc.

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
- `src/config.js`: sign in / sign up URLs are empty, so buttons show a reminder toast.
- Comparison rows in `content.js` and the about aside are placeholder content.
- No "Get started for free" or contact section — intentionally out of scope for now.
