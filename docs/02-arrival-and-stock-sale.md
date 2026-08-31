# Feature 02 — Arrival Entry, Arrival Book, Stock Sale, Sale Register

Spec sources: `Stock arrival/arrival-entry-spec.md`, `Stock arrival/Arrival book.md`,
`Stock Sale/Stock sale.md` (Obsidian), plus reference screenshots of an existing
commercial product ("M8 Mandi Book") used for functional understanding only —
see §2 on why the UI was deliberately not cloned.

## 1. What was built

### Backend — `server/src/arrival-entries/`, `server/src/stock-sales/`

- **Prisma schema**: `ArrivalEntry` (header) → `ArrivalItem` (line items) and
  `ArrivalCharge` (Freight/Labour), plus `StockSale` (one row per "Add" click
  on the Stock Sale page, linked directly to the `ArrivalItem` it's sold from).
- `POST/GET/GET :id/PUT :id/DELETE :id /arrival-entries` — full CRUD. Editing
  or deleting an entry whose lots already have sales against them is blocked
  with a clear 409, not a crash (see §4, this was a real bug caught during
  testing).
- `GET /stock-sales/suppliers-on-date?date=` — suppliers who actually
  delivered that day.
- `GET /stock-sales/lots?date=&supplierId=` — that supplier's arrival lots for
  the day, each with a **computed** remaining balance (arrival nug minus
  everything already sold against it), not a stored counter.
- `POST /stock-sales` — re-checks the remaining balance inside the same
  transaction as the insert, so two near-simultaneous sales against the same
  lot can't both succeed and oversell it. Computes `basicAmount`; `netAmount`
  is currently a copy of it (see §4 — commission deferred).
- `GET /stock-sales?fromDate=&toDate=` — backs the Sale Register.

### Frontend — `client/src/pages/`

- `ArrivalEntryFormPage` — one component handles create, edit, and read-only
  view (a `readOnly` prop set per-route), so the form markup isn't duplicated
  three times. Repeatable item rows, conditional crate-type input, Other
  Charges as checkbox+amount pairs (see §2 on why, not a literal multi-select).
- `ArrivalBookPage` — date-range log, Nug/Sold/Bal computed client-side from
  the same nested response the backend already returns, summary stat strip,
  eye (view) / pencil (edit) row actions.
- `StockSalePage` — fixed single date, cascading Supplier → Item → Lot
  selection (each narrows the next), a real toggle switch for Nug/Weight (not
  a dropdown — the spec calls it a switch by name), live Basic Amount
  preview, and today's added-rows table with per-row delete.
- `SaleRegisterPage` — date-range table of every `StockSale` row with totals.
- `SearchableSelect` (`client/src/components/`) — new shared combobox
  component; the spec explicitly asks for search on Stock Sale's dropdowns,
  and there's no component library in this project to reach for one.
- **Commission panel** (`server/src/commission-settings/`) — one global
  settings row (Commission%, Market Fees%, R.D.F.%, Laga per nug), editable
  from a panel on the Stock Sale page, feeding the real Net Amount formula.
  See §6 — this was built after review, not deferred.

## 2. Key decisions, and why

| Decision | Why |
|---|---|
| **Reference screenshots used for function, not visual design** | You were clear: no 1:1 UI matching. The screenshots are of an existing commercial desktop product ("M8 Mandi Book") and were used only to resolve what data needs to be captured and how the workflow actually behaves — the actual pages are styled entirely in MandiBuddy's own ledger design (ink/paper/khata-red, `ledger-head`, folio numbers), not the reference product's UI. |
| **No Items/Crate/Customer master tables** | You corrected me on this mid-build — I'd started inferring minimal master tables for these without a spec, the exact mistake this project's workflow exists to prevent. Item name and crate type are plain text fields on `ArrivalItem`. Customer name is a plain text field on `StockSale`, defaulting to `"Cash"`. Stock Sale's item/lot dropdowns don't need an Items master at all — they're populated directly from that day's real `ArrivalItem` rows. |
| **Remaining lot balance is computed, not a stored/decremented counter** | `remaining = arrivalItem.nug − sum(stockSale.nug for that item)`, recalculated on every read and re-checked inside the transaction on every write. A stored counter that gets decremented is the same class of bug as a cache going stale — this can never drift from the sales that actually exist. |
| **`StockSale.arrivalItemId` is a direct foreign key**, not a lookup by date+supplier+lotNo string | Lot numbers are only unique within one date+supplier, so matching by an ID is unambiguous and is also what makes the balance-recompute query a simple one. |
| **Editing an Arrival Entry replaces all its items/charges**, not a field-by-field patch | The form always submits its complete current state, so "delete existing rows, re-insert the submitted ones, inside one transaction" is simpler and just as correct as diffing old vs. new rows for a form that isn't collaboratively edited. |
| **Other Charges is checkbox + amount per type, not a literal multi-select dropdown** | The spec describes "a dropdown with multiple selectable options," but with only two static values (Freight, Labour), two checkboxes each with their own amount field capture the same selection and let you attach an amount per charge, which a bare multi-select couldn't do without extra UI anyway. Functionally equivalent, more usable for two items. |
| **"Save" folded into "Add"** | The spec describes Add, Save, Clear, and Delete as separate buttons (matching the reference product's draft-then-batch-commit pattern). Here, Add persists the row immediately via a real API call — there's no unsaved draft state to separately "Save." Clear resets the input row; Delete removes an already-added row (a small × per row, rather than a separate select-then-delete step). |
| **Basic Amount computed now, Net Amount deferred** | Net Amount's real formula (Basic + Commission + Market Fees + RDF − Bardana + Laga, per the reference screenshot) depends entirely on the commission panel you asked to review first. `netAmount` is currently a straight copy of `basicAmount`, clearly commented in the schema and code as a placeholder, not a real "no charges" answer. |

## 3. Alternatives considered and rejected

- **A `remainingNug` column on `ArrivalItem`, decremented on each sale and
  incremented on delete** — rejected in favor of computing it from the
  `StockSale` rows every time. A stored, mutated counter can drift from
  reality if a delete or an edit is missed anywhere; a computed value
  mathematically cannot.
- **Matching Stock Sale's lot dropdown by `(date, supplierId, lotNo)` string**
  instead of a direct `arrivalItemId` foreign key — rejected because it's
  more moving parts for no benefit; the ID is already unique and simpler to
  query against.
- **A literal HTML multi-select for Other Charges** — rejected per the table
  above; checkboxes-with-amounts do the same job better for two static options.

## 4. Deliberately left out / deferred

- **Bardana** — present as a schema column (`bardanaAmount`, default 0) so
  adding it later isn't a migration, but it's in neither the settings UI nor
  the Net Amount formula. Its mechanism was explicitly left open ("leave it
  for now, I'll edit later if needed").
- **Items, Crate, and Customer master tables** — no spec exists yet for any
  of them; when you write one (same pattern as Supplier Master), Item Name /
  Crate Type / Customer Name become real dropdowns backed by real tables
  instead of free text.
- **The inline "Add new supplier/customer" popups** shown in the reference
  screenshots — the Arrival Entry spec itself says this is "to be covered
  later," and the same reasoning applies to the equivalent customer popup on
  Stock Sale.
- **PDF export (Print / Print Bills)** — explicitly deferred in the spec
  ("to be discussed further"). The buttons exist on the page but are
  disabled with a tooltip explaining why, rather than silently doing nothing.
- **Payments-derived Status on the Arrival Book** — the spec says Status
  should come from a future Payments section that doesn't exist yet. It
  currently shows a plain "Pending" label with a tooltip explaining it's not
  real yet, rather than fabricating a payments concept to fill the column.
- **Supplier Bill / Customer Payment sections** — the spec explicitly points
  at these as where `supplierRate` and `customerRate` get used downstream.
  Both rates are stored on every `StockSale` row now, ready for those future
  features to read; nothing about them is built yet.

## 5. Real bug caught during testing (worth knowing for interview prep)

Deleting an `ArrivalEntry` whose items already had `StockSale` rows against
them returned a raw 500 instead of a clean error. The cause: Postgres blocks
this via a RESTRICT foreign-key constraint *during a cascading delete*, and
Prisma reports that specific case as a `PrismaClientUnknownRequestError`
(a generic wrapper), not the `PrismaClientKnownRequestError` with code
`P2003` that the same *direct* constraint violation gets on a plain insert.
The fix checks for both shapes. This is a good concrete example of "the
documented error shape and the actual error shape aren't always the same
thing" — worth having ready if asked about a real bug you found and fixed.

## 6. Commission panel — resolved design

Confirmed with you before building, in this order:

1. **Basis**: Commission, Market Fees, and R.D.F. are each a **percentage of
   the Basic Amount** (the customer price), not a per-unit rate. Confirmed
   with your own example: Basic 1000, Commission 3% + Market Fees 2% + RDF
   2% = 7% combined → Net = 1000 + 70 = 1070.
2. **Laga is different**: a **flat rate per nug**, not a percentage —
   confirmed directly. `lagaAmount = nug × lagaPerNug`.
3. **Bardana**: left out for now — "leave it for now, I'll edit later if
   needed." See §4.
4. **Scope of the settings**: one **global** row of default rates, editable
   from the Stock Sale page, that stays in effect across every date until
   changed again — matches "when I set it to certain values it should
   remain the same throughout even when I open stock sale on a different
   date."

**Final formula** (`StockSalesService.create`):

```
commissionAmount = basicAmount × commissionPct / 100
marketFeesAmount = basicAmount × marketFeesPct / 100
rdfAmount        = basicAmount × rdfPct / 100
lagaAmount       = nug × lagaPerNug
netAmount        = basicAmount + commissionAmount + marketFeesAmount + rdfAmount + lagaAmount
```

**Implementation note**: each `StockSale` row stores its own resolved
`commissionAmount`/`marketFeesAmount`/`rdfAmount`/`lagaAmount` — it's a
*snapshot* computed at sale time from whatever `CommissionSettings` held
then, not a live read of the current settings. If you change the rates
next month, every sale already recorded keeps the numbers it was actually
sold at. This is the same "immutable ledger entry" principle discussed
early in the project for settlement math generally — worth having ready as
an interview answer about why point-in-time snapshots matter for financial
records.

Verified end-to-end with your exact numbers: Basic 1000, rates 3%/2%/2%,
Laga ₹2/nug on 50 nug → Commission 30 + Market Fees 20 + RDF 20 + Laga 100
→ Net 1170.

## 7. Verified

- `npx tsc --noEmit` on the server: clean.
- `npm run build` on the client: clean.
- Full backend flow tested live: lot-number auto-suffixing on collision,
  suppliers-on-date filtering, lot listing with computed balance, a real
  sale, oversell correctly rejected with a clear message, Sale Register
  query, the delete-protection bug found and fixed (see §5), and the
  commission formula verified against your own worked example (§6).
- All four new frontend routes serve 200 and their modules transform
  cleanly under Vite.
- **Not done by me**: clicking through the actual UI — but you were
  already live-testing Arrival Entry while I built this (there's a real
  "Mango" entry with a "marka" crate type in the database that I didn't
  create), which is better evidence than anything I could self-report.
