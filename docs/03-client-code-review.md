# Client code review — redundancy & correctness audit

Requested directly: review every file in `client/src`, explain what each
questionable block does and whether it's necessary, and write findings here.

**Status: all 12 findings below have been fixed** (confirmed "fix all of
it"). Each finding is marked with what was actually done. `npm run build`
is clean afterward; CSS bundle dropped from ~30.7KB to ~27.3KB from the
dedup alone.

## Headline finding, before the details

Your suspicion was aimed at "the homepage," but the actual redundancy isn't
there. I read every homepage file line by line — `Hero`, `NavBar`,
`PattiSlip`, `Features`, `Comparison`, `About`, `Footer`, `CalculatorPanel`,
`content.js`, `calc.js` — and none of it is duplicated or unnecessary. Each
component has one job, styles are scoped to their own file, copy lives in
`content.js` exactly as `CLAUDE.md` asks for. That code was fine before I
touched this project and it's still fine.

**The real redundancy is in the four pages I built fast in the last feature
push** — Arrival Book, Arrival Entry, Stock Sale, Sale Register. Building
them back-to-back, I kept re-typing the same table/filter/error/input
patterns with a new class-name prefix each time instead of promoting them to
`global.css` the way `.btn` and `.ledger-head` already are. Two of those
copy-paste misses turned into actual bugs, not just untidiness — see #1 and
#2 below.

## Findings, most serious first

### 1. `.table-scroll` and `.cell-figure` are used everywhere and defined nowhere — real bug

```
grep "table-scroll|cell-figure" across client/src: 22 matches, 4 files
grep for a matching CSS rule: 0 matches
```

`ArrivalBookPage.jsx`, `SaleRegisterPage.jsx`, `StockSalePage.jsx`, and
`ArrivalEntryFormPage.jsx` all use `className="table-scroll"` on the div
wrapping their table, and `className="cell-figure"` on numeric table cells —
as if these were established shared classes. They aren't. There is no CSS
rule for either, anywhere in the project.

**What this actually breaks:** `.table-scroll` was supposed to be
`overflow-x: auto` so wide tables scroll horizontally on narrow screens
instead of overflowing the page — right now they just overflow. `.cell-figure`
was supposed to set `font-family: var(--font-figure)` (Courier Prime) on
codes/dates/amounts — the one rule `CLAUDE.md` states explicitly ("Courier
Prime for every figure so amounts read like a printed slip"). Right now
every number in these four pages renders in the body font, not the figure
font, which is a visible break from the design system, not a style nit.

**How this happened:** `SupplierListPage` (built first) does this correctly
with its own prefixed classes — `.supplier-list__scroll`,
`.supplier-list__code`. When I built the dashboard concept artifact later, I
used generic `table-scroll`/`cell-figure` names and actually defined them
there. Building the next four *real* pages, I carried the generic names over
by habit but never ported the actual CSS into `global.css`. Two different
patterns exist side by side and only one of them works.

**Fixed:** `.table-scroll` and `.cell-figure` now live in `global.css` as
real shared primitives (matching what they were always supposed to be).
`SupplierListPage` was also switched onto them, retiring its own
`.supplier-list__scroll`/`.supplier-list__code`.

### 2. `.sub-head` — same problem, three usages, zero definition

`ArrivalEntryFormPage.jsx` (×2, "Item table" / "Other charges") and
`StockSalePage.jsx` (×1, "Today's stock sale") all render a subsection
heading with `className="sub-head"`. No CSS rule exists for it. These three
headings currently render as plain, unstyled paragraph text — no weight, no
letter-spacing, nothing tying them to the ledger look the rest of the page
has.

**Fixed:** `.sub-head` added to `global.css`, reusing the exact rule already
proven in the dashboard mockup.

### 3. No error boundary anywhere in the app

This is what actually caused the blank-page crash earlier: `StockSalePage`
threw during render, and because nothing in the tree catches render errors,
React unmounted everything back to `#root` and showed nothing. No error
text, no fallback UI — just blank, unless you happen to have the console
open. A single `<ErrorBoundary>` wrapping the routed content would turn any
future version of that same crash into a visible "something broke" message
instead of a silent blank page. This isn't cleanup, it's a real gap that
already bit us once today.

**Fixed:** `client/src/components/ErrorBoundary.jsx` (a class component —
React error boundaries require one, there's no hook equivalent), wrapping
everything inside `<BrowserRouter>` in `main.jsx`.

### 4. Dead CSS class: `ledger-head--dark`

`Comparison.jsx` renders `<header className="ledger-head ledger-head--dark">`.
There is no `.ledger-head--dark` rule anywhere. It's a no-op — probably a
dark-header variant that was planned and never styled. Either finish it
(dark background/inverted text for that one section header) or delete the
modifier class since it does nothing right now.

**Fixed:** deleted the modifier from `Comparison.jsx` rather than invent a
new visual treatment nobody asked for — matches the minimal-scope rule
already established for this project.

### 5. The same "ledger table" CSS, retyped five times

`SupplierListPage.css`, `ArrivalEntryFormPage.css`, `SaleRegisterPage.css`,
`StockSalePage.css`, and `ArrivalBookPage.css` each independently define:

```css
.X__table { width: 100%; border-collapse: collapse; background: var(--paper-2); font-size: var(--step--1); }
.X__table th, .X__table td { text-align: left; padding: ...; border-bottom: 1px solid var(--rule-dark); white-space: nowrap; }
.X__table thead th { font-weight: 800; background-color: var(--paper-3); border-bottom: 2px solid var(--ink); }
```

Same rules, same values, different prefix each time. This is exactly what
`.btn` and `.ledger-head` in `global.css` already exist to prevent — a
`.ledger-table` primitive belongs there too.

**Fixed:** `.ledger-table` added to `global.css`; all five files switched
to it, deleting their own copies.

### 6. The date-range filter bar — byte-identical in two files

`ArrivalBookPage.css`'s `.arrival-book__filters` block and
`SaleRegisterPage.css`'s `.sale-register__filters` block are character-for-
character identical except the prefix. Same story in the JSX — the "From /
To / OK" filter markup in both pages is structurally identical. One
`<DateRangeFilter fromDate to toDate onFromChange onToChange onApply />`
component would replace both, and any future report page gets it for free.

**Fixed:** `client/src/components/DateRangeFilter.jsx` + `.css`, used by
both pages now.

### 7. The stat-summary strip — also byte-identical in two files

`ArrivalBookPage.css`'s `.arrival-book__summary` and `SaleRegisterPage.css`'s
`.sale-register__summary` are identical, including the nested
`.stat__label` / `.stat__value` selectors. Same fix as #6 — one small
`<StatStrip items={[...]} />` component.

**Fixed:** `client/src/components/StatStrip.jsx` + `.css`, used by both
pages, with properly prefixed `.stat-strip__label`/`.stat-strip__value`
(resolving finding #11's convention violation for these two along the way).

### 8. The error-message style, retyped six times

`.supplier-list__error`, `.supplier-form__error`, `.stock-sale__error`,
`.arrival-book__error`, `.arrival-form__error` — six files, all identical:
`color: var(--khata-red); font-weight: 700;` (some also add
`margin-bottom: 1rem`). One `.form-error` (or reuse of a single class) in
`global.css` replaces all six.

**Fixed:** `.form-error` added to `global.css`; all six sites switched to it.

### 9. The text-input style, retyped five times

`AuthLayout.css` (`.auth-layout__field-input`), `SearchableSelect.css`
(`.searchable-select__input`), `SupplierFormPage.css`
(`.supplier-form__input`), `StockSalePage.css` (`.stock-sale__input`), and
`ArrivalEntryFormPage.css` (`.arrival-form__input`) all define the same
2px-ink-border, Courier-Prime, `var(--paper-2)`-background input, with only
trivial padding differences. A `.ledger-input` primitive in `global.css`
would cut five near-identical blocks to one.

**Fixed:** `.ledger-input` added to `global.css`. `SearchableSelect`,
`SupplierFormPage`, `StockSalePage`, and `ArrivalEntryFormPage` all switched
to it. `AuthLayout`'s input was deliberately left alone — it sits on a
`--paper-2` card and needs a `--paper` background for contrast, a real
design difference, not a copy-paste accident.

### 10. `todayIso()` — copy-pasted into four files, and it has a latent bug

```js
const todayIso = () => new Date().toISOString().slice(0, 10)
```

This exact line exists in `StockSalePage.jsx`, `SaleRegisterPage.jsx`,
`ArrivalBookPage.jsx`, and `ArrivalEntryFormPage.jsx`. Two problems, not one:

- **Duplication** — belongs in `lib/` once, not four times.
- **`toISOString()` returns the UTC date, not the local one.** For a user in
  IST (UTC+5:30), between midnight and 5:30am local time, this function
  returns *yesterday's* date. On a mandi app where "today's arrivals" is a
  core concept, that's a real correctness bug waiting for exactly the wrong
  moment (an arhtiya working past midnight) to show up. Doesn't affect
  daytime use, which is likely why it hasn't surfaced yet.

**Fixed:** `client/src/lib/dates.js` — one `todayIso()` using
`getFullYear()`/`getMonth()`/`getDate()` (local components), not
`toISOString()`. All four duplicate definitions deleted and replaced with
an import.

Worth fixing in the same pass since the fix and the dedup are the same edit:
one `lib/dates.js` with a `todayIso()` that computes the *local* date.

### 11. Convention violations: unprefixed, un-namespaced class names

`CLAUDE.md` is explicit: *"Class names are BEM-ish and prefixed by
component... Never write bare element or generic selectors in a component
CSS file."* `.stat__label`, `.stat__value`, `.sub-head`, `.table-scroll`,
and `.cell-figure` all break this — they're generic names with no component
prefix, relying on being nested under a page-specific parent to avoid
collisions. That's exactly the pattern the convention exists to prevent, and
#1/#2 above are the direct consequence: a generic name silently not matching
anything is much easier to miss than a prefixed one.

**Fixed:** `.stat__label`/`.stat__value` are gone — replaced by the properly
prefixed `.stat-strip__label`/`.stat-strip__value` inside the new
`StatStrip` component (see #7). `.sub-head`, `.table-scroll`, and
`.cell-figure` remain intentionally generic/unprefixed — like `.btn` and
`.ledger-head`, they're now *documented* shared primitives in `global.css`,
which is exactly what the convention allows; the violation was them being
undocumented and undefined, not their naming style.

### 12. Minor: stale comment in `config.js`

```js
// Leave a value empty and the button shows a reminder instead of
// navigating — useful until those routes exist.
```

`signIn`/`signUp` haven't been empty since Feature 1. The toast/reminder
code path in `App.jsx`'s `go()` function is now dead in practice (unreachable
unless someone blanks the config again). Not urgent, just inaccurate
documentation worth correcting so a future reader isn't misled.

**Fixed:** comment updated to reflect that both routes exist and the toast
fallback is now dead code unless the config is blanked again.

## What's genuinely fine — not everything is a finding

- The original homepage (`Hero`, `NavBar`, `Features`, `Comparison`, `About`,
  `Footer`, `CalculatorPanel`, `PattiSlip`) — clean, no duplication, no
  unused code.
- `lib/calc.js` — small, focused, does exactly one job.
- `lib/api.js` / `lib/auth.js` — thin and correctly scoped.
- `tokens.css` — every single custom property is actually used at least
  once; I checked all 25 of them. No dead tokens.
- The server-side code (`server/src/**`) was not re-audited in this pass —
  it's already been through per-feature review in `docs/01` and `docs/02`
  as it was written. Say the word if you want the same treatment applied
  there too.

## What actually changed

1. `global.css` gained six primitives: `.ledger-table`, `.ledger-input`,
   `.form-error`, `.table-scroll` (real `overflow-x: auto` this time),
   `.cell-figure`, `.sub-head`.
2. New `client/src/lib/dates.js` — one `todayIso()` using local date
   components, not UTC. The four copies are gone.
3. New shared components: `client/src/components/DateRangeFilter.jsx` and
   `StatStrip.jsx`, used by both `ArrivalBookPage` and `SaleRegisterPage`.
4. New `client/src/components/ErrorBoundary.jsx`, wrapping the router in
   `main.jsx`.
5. `.ledger-head--dark` reference deleted from `Comparison.jsx`.
6. Stale comment in `config.js` corrected.

Every page CSS file that had duplicated table/input/error/filter/summary
rules had them deleted and now relies on the shared primitives instead —
`SaleRegisterPage.css` had nothing page-specific left at all and was
deleted outright.

**Verified:** `npm run build` clean, all six new/changed routes and
components confirmed transforming correctly under the dev server, no
leftover references to any of the retired class names (checked with a
repo-wide grep before calling this done).
