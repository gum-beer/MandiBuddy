# Arrival, Sale & Stock Pendency — Functional Specification

> Source: handwritten notes, scanned 01-Sep-2026 (`DocScanner_01-Sep-2026_06-25_PM.pdf`, 16 pages),
> plus clarifications given in chat on top of that scan.
> **[INFERRED]** = derived by me, not stated outright. **[OPEN]** = still needs your answer.

---

> ## ⚠️ BIG WARNING — READ BEFORE BUILDING ANYTHING FROM THIS FILE
>
> The **arrival and sale tables in this document are illustrative only**, rebuilt from a scan of
> your handwriting so this file is self-contained. You have your **own markdowns with the actual
> reference images and tables** for these entries — those are the source of truth, not the tables
> reproduced here.
>
> **Rule going forward:** if anything you send conflicts with what's written in this file
> (a field name, a column order, a value, a naming convention, anything), **do not silently
> resolve it either way — ask the question first**, then update this doc once you answer. Nothing
> gets built against a guess.

---

## Table of contents

1. [Glossary & the three parties](#1-glossary--the-three-parties)
2. [Scenario setup](#2-scenario-setup)
3. [Arrival entry — the data](#3-arrival-entry--the-data)
4. [Sale entry — selection flow & dropdown dependency](#4-sale-entry--selection-flow--dropdown-dependency)
5. [Lot number rules](#5-lot-number-rules)
6. [Sale entry — fields](#6-sale-entry--fields)
7. [Rate & amount calculation logic](#7-rate--amount-calculation-logic)
8. [Worked example A — sale by Nug](#8-worked-example-a--sale-by-nug)
9. [Worked example B — sale by Weight](#9-worked-example-b--sale-by-weight)
10. [Stock pendency register](#10-stock-pendency-register)
11. [Over-selling guard (hard rule)](#11-over-selling-guard-hard-rule)
12. [Rounding rule](#12-rounding-rule)
13. [Charges — global settings + per-entry override](#13-charges--global-settings--per-entry-override)
14. [Registers & filters](#14-registers--filters)
15. [Crate handling — deferred](#15-crate-handling--deferred)
16. [Consolidated rule list](#16-consolidated-rule-list)
17. [Suggested data model](#17-suggested-data-model-inferred)
18. [Open questions still outstanding](#18-open-questions-still-outstanding)
19. [Changelog](#19-changelog)
20. [Tenancy model — multi-tenant (confirmed)](#20-tenancy-model--multi-tenant-confirmed)

---

## 1. Glossary & the three parties

There are exactly **three parties** in this system. Use these terms consistently — several of
them are interchangeable and any field/table naming should pick one and stick to it.

| Party | Also called | Role |
|---|---|---|
| **Seller** | Grower, Farmer, **Supplier** | Brings stock in (arrival side). e.g. MAX FARMER, JOHN FARMER. |
| **Buyer** | **Customer** | Purchases stock (sale side). e.g. Raju. |
| **Trader** | — | The person/business the app is built for. Not a transacting party in the ledger sense — they sit in the middle, receiving stock from Sellers and selling it to Buyers, earning the commission/fees/Laga spread. **Confirmed: each Trader is a tenant** in a shared multi-tenant deployment — see §20. |

> Note: earlier drafts of this doc used "Supplier" as the field name throughout. That stays as the
> **field/column name** (`supplier_id`, "Supplier" dropdown, etc.) — Seller/Grower/Farmer are just
> the spoken synonyms for the same party. Same logic for Customer/Buyer.

Other terms:

| Term | Meaning |
|---|---|
| **Arrival** | Stock received from a Seller on a given date, recorded lot-wise. |
| **Lot no.** | Identifier for a consignment batch. Alphanumeric, **not globally unique** — see §5. |
| **Commodity / Item** | The produce (Mango, Banana, Cherry). |
| **Nug** | Unit of count (packages / pieces). **This is the unit balance/pendency is tracked in.** |
| **Weight** | Alternative quantity basis, used for pricing and customer-facing reports/sales — **not** used for stock balance (see §10). |
| **Crate** | Whether the goods came in crates — `Y` / `N`. Full handling deferred, see §15. |
| **Crate type** | Type of crate, only applicable when Crate = `Y` (e.g. `marka`, `daala`). |
| **Customer rate** | Rate charged to the Buyer (per Nug or per Weight). |
| **Supplier rate** | Rate at which we settle with the Seller. |
| **Per** | Dropdown deciding the pricing basis for a sale line: `Nug` or `Weight`. |
| **Basic amount** | Quantity × customer rate, before any charges. |
| **Net amount** | Basic amount + percentage charges + Laga, **rounded** — see §12. What the Buyer owes. |
| **Market fees** | Configurable %, global setting, overridable per line. See §13. |
| **Commission** | Configurable %, global setting, overridable per line. See §13. |
| **RDF** | **Rural Development Fund.** Configurable %, global setting, overridable per line — see §13. Not applicable in every mandi, so it can legitimately be set to `0`. That's why it doesn't appear in the worked examples: this mandi's RDF is 0%, not omitted from the formula. |
| **Laga** | Flat charge (example ₹10), applied **per Nug**, configurable, overridable per line. |
| **Stock pendency** | Trader-facing register of remaining unsold Nug balance per Seller + lot + item. |

---

## 2. Scenario setup

Arrival stock was entered on **23rd June 2026** for **two Sellers**, each bringing **5 lots**:

- **MAX FARMER**
- **JOHN FARMER**

> Corrected: both brought **5 lots each**. (An earlier draft of this doc had John's heading say
> "10 lots" — that was a misread; it's 5, matching the 5 rows actually listed.)

---

## 3. Arrival entry — the data

> ⚠️ Per the warning above: treat this table as illustrative. Your own markdown/images are the
> reference for the real arrival data.

### 3.1 MAX FARMER — 5 lots

| Commodity | Lot no. | Nug | Crate | Crate type |
|---|---|---|---|---|
| Mango | 25 | 25 | Y | marka |
| Mango | 25(a) | 25 | Y | daala |
| Mango | 35 | 35 | N | — |
| Banana | 45 | 45 | N | — |
| Banana | 45(a) | 45 | N | — |

### 3.2 JOHN FARMER — 5 lots

| Commodity | Lot no. | Nug | Crate | Crate type |
|---|---|---|---|---|
| Mango | 25 | 25 | Y | marka |
| Mango | 25(a) | 25 | Y | daala |
| Mango | 38 | 38 | N | — |
| Cherry | 43 | 43 | N | — |
| Banana | 26 | 42 | N | — |

### 3.3 What changed here and why

Both farmers' Mango rows were originally written as manually-named lots `25-a` / `25-b`. Per your
correction, these are now shown as the **auto-suffix duplicate-handling rule in action**: the
trader entered lot `25` twice for the same Seller on the same day, and the second entry was
auto-renamed to `25(a)` — same mechanism as MAX's Banana `45` → `45(a)`. This is intentional, and
it now happens **consistently for both farmers**, demonstrating that the rule applies per-Seller,
not as a one-off.

**Every downstream reference to "lot `25-b`" in the original notes is now "lot `25(a)`"** —
updated throughout §4, §6, §8, §9, §10 below.

### 3.4 Arrival field list

Per arrival line:

1. Date
2. Seller (Supplier)
3. Commodity / Item
4. Lot no.
5. Nug
6. Crate (Y/N)
7. Crate type (only when Crate = Y)
8. Weight — **optional at arrival**, see §11.3 of the original notes / confirmed in §10 below.

---

## 4. Sale entry — selection flow & dropdown dependency

Sales dated **23rd June 2026**.

### 4.1 Selection order (strict)

1. **Seller (Supplier)**
2. **Item name**
3. **Buyer (Customer) name**
4. **Lot no.**

### 4.2 The gating rule

**The first thing selected is the Seller. Before that, all other options are inaccessible**,
because only on the basis of the Seller selected will the system show the respective **Lot no.**
and **Item name** in the dropdowns.

- Seller dropdown is the only enabled control on a fresh sale line.
- Item and Lot no. dropdowns are filtered by the selected Seller and by remaining open balance
  (a lot at 0 Nug balance shouldn't appear as sellable) — and, per §5.6, span **all open lots
  regardless of arrival date**, not just the sale's own date. See §5.7 for how the Lot no.
  dropdown handles the same lot no. appearing on more than one arrival date for that Seller.
- Changing the Seller after the fact must reset/re-filter Item and Lot no.

---

## 5. Lot number rules

### 5.1 Where duplication IS allowed

- Same lot no. can exist for **2 different Sellers**.
- Same lot no. can exist for **2 different days, same Seller**.

### 5.2 The only forbidden case

**Same Seller + same day + same lot no. cannot exist as two entries.** If the user enters it
anyway, the system does not reject it — it auto-repairs it.

### 5.3 Validity matrix

| Case | Entry 1 | Entry 2 | Result |
|---|---|---|---|
| Different Seller, same day, same lot | Date 23/7 · Seller John · Lot 25 | Date 23/7 · Seller Max · Lot 25 | ✅ Valid |
| Same Seller, different day, same lot | Date 23/7 · Seller John · Lot 25 | Date 24/7 · Seller John · Lot 25 | ✅ Valid |
| Same Seller, same day, same lot | Date 23/7 · Seller John · Lot 25 | Date 23/7 · Seller John · Lot 25 | ❌ Invalid → auto-repaired |

### 5.4 Auto-suffix algorithm — confirmed sequential

The suffix **appends in order**, checking each candidate in turn:

```
given (date, seller, lot_no) about to be saved:
    if (date, seller, lot_no) is not already taken → save as lot_no
    else:
        try lot_no + "(a)"
        if that's taken too → try lot_no + "(b)"
        if that's taken too → try lot_no + "(c)"
        ... continue through the alphabet
        (26 letters is expected to comfortably cover real-world duplicate counts
        for one seller/lot/day)
```

Worked: first `25` stays `25`. Second `25` on the same Seller+day becomes `25(a)`. If a third `25`
came in on the same Seller+day, it becomes `25(b)`. And so on.

Only the **duplicate instance** is renamed — the original that was already saved keeps its number.

### 5.5 Lot number format

Alpha-numeric plus `(`, `)`, `-`, `_` and other "basic non-conflicting" characters. [INFERRED]
"non-conflicting" should exclude characters that break parsing/export/search, e.g. `/ \ , " ' | %`.

### 5.6 Cross-date sales — confirmed

**Stock arriving on one date can be sold on any later date** — sales aren't restricted to the
arrival day. Both worked examples happen to be same-day, but that was just the scenario, not a
rule. Practical consequence: the **Lot no. dropdown on a sale line must include every currently
open lot (balance > 0) for the selected Seller**, not just lots that arrived "today" or on the
sale's own date.

### 5.7 Lot dropdown disambiguation — design brainstorm (raw, not finalized)

> This section formalizes a raw idea into something precise enough to evaluate — it is explicitly
> **not a locked decision yet**. Sub-points at the end still need your call.

**The underlying tension.** R6 already establishes that `(Date, Seller, Lot no.)` is the real
uniqueness key at the point of arrival — so two arrivals for the same Seller with lot no. `25` on
two different dates are legitimate, distinct records, and nothing is wrong with the data. The
problem only shows up one layer up: once §5.6 allows selling any open lot regardless of date, the
**Sales-page Lot no. dropdown** for a given Seller can end up listing `25` twice with nothing to
tell them apart, because a dropdown flattens lot no. down to just its text.

**Proposed rule (your idea, made precise):** don't annotate every option with its arrival date by
default — only annotate the specific lot no. value that's actually ambiguous *in that dropdown's
current option set*, and annotate **all** of its colliding siblings when it happens (not just the
second one, so the two options read consistently):

```
25 (23 Jun 2026)
25 (24 Jun 2026)
35
45
45(a)
```

Here `35`, `45`, `45(a)` stay plain because each is unique for this Seller among currently-open
lots; only the two `25`s, which collide, get the date appended — to both of them.

**Detection logic, to build the dropdown:**

```
When building the Lot no. dropdown for a selected Seller (+ Item, if already chosen):
    candidates = all open arrivals (balance_nug > 0) for that Seller [+ Item]
    group candidates by lot_no text
    for each group:
        if group has 2+ entries → append "(arrival date)" to every entry in that group
        else                    → show lot_no with no annotation
```

**Feasibility notes:**

- This is purely a **display-time decoration**, computed fresh whenever the dropdown is built —
  the stored `lot_no` value in the database is never touched by it.
- Contrast with the `(a)` / `(b)` / `(c)` auto-suffix from §5.4: that one *does* get written into
  the stored `lot_no`, because it's resolving a genuine same-day duplicate at the data level. This
  date-in-brackets idea is the opposite axis of the problem — same-day duplicates are a **write-time**
  fix baked into the identifier; cross-date lookalikes are a **read-time** labeling problem
  confined to picker/dropdown UI.
- Cost: for one Seller (± Item), the number of currently-open lots is small in any realistic
  scenario, so grouping by lot_no text to spot collisions is cheap — not a performance concern.
- Scope: this only matters for **flattened list/dropdown controls**. Anywhere the lot no. already
  sits next to its own date column — Arrival Register, Sales Register rows, Stock Pendency — there's
  no ambiguity, because the date is already visible right there (see §10, §14). It's specific to
  the sale-entry Lot no. picker.

**Still open — your call on these before this gets built:**

a) **Display format** for the date annotation — `25 (23 Jun 2026)`, `25 — 23/06/26`, or something
   else you prefer.

b) **Whether remaining balance should also show inline**, e.g. `25 (23 Jun 2026) — 5 left`, to
   help pick the right one faster — or whether that's unnecessary clutter on top of the date fix.

c) **Whether the Item filter changes the collision check.** If the Lot no. dropdown is ever shown
   filtered by Seller only (before Item is picked), two *different* Items could also coincidentally
   share a lot no. on different dates — same fix applies, just grouping needs to consider Item too
   at that stage. Worth confirming whether Item is always picked before Lot no. is shown (§4.1 says
   yes — Item is step 2, Lot no. is step 4) or whether there's ever a path where Lot no. is exposed
   Item-agnostic.

---

## 6. Sale entry — fields

| # | Field | Notes |
|---|---|---|
| 0 | **Sr no.** | System-generated, not manually entered. |
| 1 | Seller (Supplier) | Dropdown, selected first. |
| 2 | Item | Dropdown, filtered by Seller. |
| 3 | Buyer (Customer) | Dropdown. |
| 4 | Lot no. | Dropdown, filtered by Seller. |
| 5 | **Nug** | Always required — drives Laga and stock balance regardless of `Per`. |
| 6 | **Weight** | Required only when `Per = Weight`; otherwise optional/blank. This per-line cell is also the answer to "how much weight did we sell this Buyer" — no separate aggregate/rollup weight report is needed (confirmed); it's a per-sale-line figure, not a summary metric. |
| 7 | **Customer rate** | Rate charged to the Buyer. |
| 8 | **Supplier rate** | Rate for settling with the Seller. |
| 9 | **Per (dropdown)** | `Nug` or `Weight` — decides the calculation basis. |
| 10 | **Basic amount** | Calculated. |
| 11 | **Net amount** | Calculated, then rounded — see §12. |
| 12 | **Charge override toggle** | Optional. When off, this line uses the global charge settings. When on, exposes editable Market fee % / Commission % / RDF % / Laga just for this line — see §13. |

Sale header also carries: **Date**.

Each sale line is an **independent entry** — there is no grouping/header that bundles multiple
lot-lines into one transaction. Two sales of the same lot to the same customer on the same day are
two separate rows with two separate Sr. nos. (this is exactly what Worked Examples A and B show).

---

## 7. Rate & amount calculation logic

### 7.1 Charge configuration (example values — actual values live in global settings, §13)

| Charge | Example value | Type |
|---|---|---|
| Market fees | 2% | Percentage |
| Commission | 5% | Percentage |
| RDF | 1% | Percentage — not applied in worked examples, see §18 Q1 |
| Laga | ₹10 | **Flat**, per Nug |

### 7.2 Unified formula

```
Quantity      = Nug      if Per = Nug
              = Weight   if Per = Weight

Basic amount  = Quantity × Customer rate
Raw net       = Basic amount × (1 + charge%) + (Nug × Laga)
Net amount    = ROUND_TO_NEAREST_RUPEE(Raw net)      ← see §12
```

Where `charge%` = Market fees % + Commission % + RDF %. In the worked examples this mandi has
RDF set to 0%, so `charge% = Commission (5%) + Market fees (2%) + RDF (0%) = 7%`. A mandi where
RDF applies would simply have a non-zero RDF % in global settings, and the same formula picks it
up automatically.

### 7.3 Supplier settlement

```
Raw Seller payable = Quantity × Supplier rate
Seller payable      = ROUND_TO_NEAREST_RUPEE(Raw Seller payable)   ← see §12, same rule as Net amount
```

No percentage charges and no Laga apply to the Seller side — those are levied on the Buyer only.
Rounding, however, applies to both sides equally.

---

## 8. Worked example A — sale by Nug

**Selection:** Buyer `Raju` · Seller `MAX` · Item `Mango` · Lot `25(a)`

| Sr no. | Nug | Weight | Customer rate | Supplier rate | Per | Basic amount | Net amount |
|---|---|---|---|---|---|---|---|
| 1 | 10 | — | 500 | 450 | Nug | 5000 | 5450 |

```
Buyer side:  ((500 + 7% of 500) + 10) × 10 = (535 + 10) × 10 = 5450
Seller side: 450 × 10 = ₹4500
```

For 10 Nugs of lot `25(a)`: we are **owed ₹5450 from Raju**, and we **owe ₹4500 to MAX**.
Both figures land on a whole rupee already, so rounding (§12) applies to both but changes nothing
visible here.

---

## 9. Worked example B — sale by Weight

Same lot (`25(a)`), same Seller (`Max`), same Buyer (`Raju`) — a **second, independent** sale line.

| Sr no. | Nug | Weight | Customer rate | Supplier rate | Per | Basic amount | Raw net | Net amount (rounded) |
|---|---|---|---|---|---|---|---|---|
| 2 | 10 | 150 | 25 | 25 | Weight | 3750 | 4112.5 | **4113** |

```
Buyer side:  (150 × 25) + 7% of (150 × 25) + (10 × 10) = 3750 + 262.5 + 100 = 4112.5 → rounds to 4113
Seller side: since supplier rate = customer rate, basic amount = raw amount owed to Seller = 3750
             → already whole, rounding (§12) applies but changes nothing
```

For this line: **MAX is owed ₹3750**, and **Raju owes ₹4113** (post-rounding; the pre-rounding
figure was 4112.5 — see §12 for the rule).

---

## 10. Stock pendency register

After both sale lines: lot `25(a)` (MAX) arrived with **25 Nug**, entry 1 sold 10 Nug, entry 2
sold 10 Nug → **20 Nug sold, balance = 5 Nug.**

### 10.1 Balance is Nug-only — confirmed

**Balance/pendency is tracked purely in Nug.** Weight is not part of the balance calculation at
all — it exists only on the Buyer-facing side (customer reports, sale line pricing) and is
irrelevant to how much of a lot is left. Entry 2 above was priced by Weight, but it still consumed
**10 Nug** from the lot's stock for balance purposes, exactly like entry 1.

- **Stock pendency** = trader-facing view of remaining Nug per lot.
- **Weight** = customer-facing / sales-facing concern only (pricing, invoices, reports) — it
  never appears in the pendency table.

### 10.2 Stock pendency columns

| Seller (Account name) | Lot number | Item | Balance (Nug) |
|---|---|---|---|
| MAX | 25(a) | Mango | 5 |

### 10.3 Balance formula

```
Balance (Nug) = Arrival Nug for (Date, Seller, Lot, Item)
              − SUM(Nug) of all sale lines against that lot
```

---

## 11. Over-selling guard (hard rule)

**A lot can never have more Nug sold against it than it has remaining.** This is a hard block, not
a soft warning.

**Required UI behaviour when a user tries to save a sale line whose Nug exceeds the lot's current
balance:**

1. Reject the save.
2. Show a standard inline validation error message (e.g. "Only 5 Nug remaining in lot 25(a) —
   cannot sell 10.").
3. Scroll/focus the page directly to the offending cell.
4. Put a **standard red validation border/frame around that specific cell** — plain, conventional
   form-validation styling (red outline, nothing fancy, nothing animated). No custom treatment.

This is a straightforward form-validation pattern, not something to get creative with.

---

## 12. Rounding rule

**Rounding applies to every final monetary figure — Buyer's Net amount and the Seller-payable
amount alike — not just one side.** It's standard round-half-up on two-decimal currency math:

- `x.01` – `x.49` → rounds **down** to `x`
- `x.50` – `x.99` → rounds **up** to `x + 1`
- Whole numbers (`x.00`) are unaffected — there's nothing after the decimal point to round, so
  they pass through unchanged.

Example from Worked Example B: raw net `4112.50` → rounds up to **4113**. The Seller-payable side
in both worked examples happens to land on whole rupees already (4500, 3750), so rounding has no
visible effect there in this scenario — but the rule still applies to that figure too, it just
didn't need to do anything this time.

---

## 13. Charges — global settings + per-entry override

- Market fees %, Commission %, RDF %, and Laga (flat) are **not hardcoded** — they live in a
  **global settings** screen and can be tweaked at any time.
- **RDF (Rural Development Fund)** is not applicable in every mandi, so it's a normal field in
  both global settings and the per-line override — it just gets set to `0` for mandis where it
  doesn't apply, rather than being hidden or removed as a field.
- Each **sale line** can optionally **override** the global charge values for that line only,
  via a small edit control on the row.
  - When overridden: that specific sale line uses its own custom Market fee / Commission / RDF /
    Laga values.
  - The sale lines **before and after** it are unaffected and continue using whatever the global
    setting is at the time they're saved.
- [INFERRED] Once a sale line is saved (with either global or overridden charges), the values used
  should be **snapshotted onto that line** — so a later change to the global settings never
  silently rewrites the calculated amount on a historical sale. See §17 data model.

---

## 14. Registers & filters

Three registers exist, and the same filter pattern applies across all of them:

1. **Arrival Register**
2. **Sales Register**
3. **Stock Pendency Report**

### 14.1 Common filter behaviour

- Every register **starts with a date filter**. Once a date range is set, the full list for that
  range becomes visible.
- Within that range, results can additionally be filtered by:
  - **Commodity**
  - **Seller (Supplier)**

### 14.2 Sales-side extra filter

- **Confirmed:** only the **Sales Register** gets an additional filter by **Buyer (Customer)
  name**, on top of Date range, Commodity, and Seller. The Stock Pendency Report does **not** get
  a Buyer filter — makes sense, since pendency rows are unsold stock with no buyer attached yet
  (§10.2 only carries Seller/Lot/Item/Balance).

### 14.3 Filter summary table

| Register | Date range | Commodity | Seller | Buyer |
|---|---|---|---|---|
| Arrival Register | ✅ | ✅ | ✅ | — |
| Sales Register | ✅ | ✅ | ✅ | ✅ |
| Stock Pendency Report | ✅ | ✅ | ✅ | — |

---

## 15. Crate handling — deferred

Crate (Y/N) and Crate type are captured at arrival (§3), but full crate-lifecycle handling
(tracking, return, charging, whether it flows into sale/pendency) is **out of scope for this
document**. You've said a separate markdown for the crate section is coming — this doc will be
updated against it once it arrives, following the same "flag conflicts, don't guess" rule.

---

## 16. Consolidated rule list

| # | Rule |
|---|---|
| R1 | Arrival is recorded per **(Date, Seller, Item, Lot no.)** with Nug, Crate flag, Crate type. |
| R2 | Crate type is only applicable when Crate = `Y`. |
| R3 | Weight is **optional** at arrival. |
| R4 | Lot no. may repeat across **different Sellers** on the same date. |
| R5 | Lot no. may repeat for the **same Seller on different dates**. |
| R6 | Lot no. must be unique within **(Date + Seller)**. |
| R7 | On collision, auto-suffix the duplicate: `25` → `25(a)` → `25(b)` → … sequentially through the alphabet, checked against existing entries each time. |
| R8 | Lot no. is alphanumeric plus `( ) - _` and other basic non-conflicting characters. |
| R9 | On a sale line, **Seller must be selected first**; everything else stays disabled until then. |
| R10 | Item and Lot no. dropdowns are filtered by the selected Seller. |
| R10a | Sales aren't restricted to the arrival date — any currently-open lot (balance > 0) for the selected Seller can be sold on any later date. Lot no. dropdown must span all such lots, not just today's arrivals. Where the same lot no. text appears more than once for a Seller due to different arrival dates, the dropdown needs a disambiguation treatment — design brainstormed in §5.7, not yet finalized. |
| R11 | Selection order: Seller → Item → Buyer → Lot no. All are dropdowns. |
| R12 | `Per` dropdown (`Nug` / `Weight`) determines the pricing quantity. |
| R13 | `Basic amount = Quantity × Customer rate`, Quantity = Nug or Weight per R12. |
| R14 | `Raw net = Basic amount × (1 + charge%) + (Nug × Laga)`, then rounded per R22. |
| R15 | Laga is a **flat amount multiplied by Nug**, in both Nug and Weight modes. |
| R16 | Charge% = Market fees % + Commission % + RDF %. RDF (Rural Development Fund) isn't applicable in every mandi and can be set to 0 — in the worked examples this mandi's RDF is 0, giving 5% + 2% + 0% = 7%. |
| R17 | `Raw Seller payable = Quantity × Supplier rate`, then rounded per R22 — no charges, no Laga applied to this side. |
| R18 | A single lot may be sold across **multiple independent sale lines**, to the same or different Buyers. |
| R19 | `Per`, customer rate, and supplier rate are set **per sale line**, not per lot. |
| R20 | Stock pendency shows Seller / Lot no. / Item / **Balance (Nug only)** — Weight never appears in pendency. |
| R21 | `Balance = Arrival Nug − Σ(Sale Nug)` for that lot. |
| R22 | Both Net amount (Buyer side) and Seller payable round to nearest rupee, half-up (`.50`+ rounds up; whole numbers unaffected). |
| R23 | **Hard block** on over-selling: sale Nug can never exceed a lot's current Nug balance. On violation: inline error, focus jumps to the cell, standard red validation border. |
| R24 | Market fees / Commission / RDF / Laga are global settings, editable at any time, and each has an optional per-sale-line override that doesn't affect other lines. |
| R25 | Every sale line carries a Sr. no. and is an independent record — no multi-lot header grouping. |
| R26 | Arrival Register, Sales Register, and Stock Pendency Report all filter by Date range (primary), then Commodity and Seller. Sales Register additionally filters by Buyer. |

---

## 17. Suggested data model [INFERRED]

> Updated for the confirmed multi-tenant decision — see §20 for the reasoning. Every table below
> now carries `tenant_id`, and every uniqueness rule from §5/§16 is scoped **within** a tenant,
> not globally. Two different Traders can both have a Seller called "MAX" and a lot `25` with zero
> collision between them — they're in entirely separate tenant partitions.

### `tenants`
| Column | Type | Notes |
|---|---|---|
| `tenant_id` | UUID, PK | System-generated at signup — see §20.1. Never user-chosen or sequential. |
| `name` | text | Business name shown in the app. |
| `created_at` | timestamp | Set at signup. |

### `parties`
| Column | Type | Notes |
|---|---|---|
| `party_id` | PK | |
| `tenant_id` | FK → tenants | A Seller/Buyer belongs to exactly one Trader's book — not shared across tenants. |
| `role` | enum('seller','buyer') | Trader is the app owner/operator, not a row here. |
| `name` | text | |

### `items`
| Column | Type | Notes |
|---|---|---|
| `item_id` | PK | |
| `tenant_id` | FK → tenants NULL | **[OPEN — see §20]** Nullable pending a decision: `NULL` = shared master catalog row visible to all tenants; a real `tenant_id` = a tenant-specific commodity. Placeholder until resolved. |
| `name` | text | (Mango, Banana, Cherry) |

### `arrivals`
| Column | Type | Notes |
|---|---|---|
| `arrival_id` | PK | |
| `tenant_id` | FK → tenants | |
| `arrival_date` | date | |
| `seller_id` | FK → parties | |
| `item_id` | FK | |
| `lot_no` | text | subject to R6–R8, now scoped per tenant too |
| `nug` | int | |
| `weight` | numeric NULL | optional (R3) |
| `is_crate` | bool | |
| `crate_type` | text NULL | only when `is_crate` |

**Constraint:** `UNIQUE (tenant_id, arrival_date, seller_id, lot_no)` — enforced via pre-insert
auto-suffixing (R7), never surfaced to the user as a rejected save. Note the added `tenant_id` at
the front of the key — this is the change from the single-tenant version of this schema.

### `global_charge_settings`
| Column | Type | Example | Notes |
|---|---|---|---|
| `setting_id` | PK | | |
| `tenant_id` | FK → tenants | | **Not shared** — every mandi sets its own Commission/Laga/RDF, confirmed back in the original notes ("say Market fees is set at 2%"). |
| `market_fee_pct` | numeric | 2 | |
| `commission_pct` | numeric | 5 | |
| `rdf_pct` | numeric | 1 | |
| `laga_flat` | numeric | 10 | |
| `effective_from` | timestamp | | for history/versioning |

### `sales`
| Column | Type | Notes |
|---|---|---|
| `sale_id` | PK | Sr. no. |
| `tenant_id` | FK → tenants | |
| `sale_date` | date | |
| `arrival_id` | FK | resolves Seller + Item + Lot in one link — must belong to the same `tenant_id` |
| `buyer_id` | FK → parties | must belong to the same `tenant_id` |
| `nug` | int | always required (R14, R23) |
| `weight` | numeric NULL | required when `per = 'weight'` |
| `customer_rate` | numeric | |
| `supplier_rate` | numeric | |
| `per` | enum('nug','weight') | |
| `uses_override_charges` | bool | R24 |
| `applied_market_fee_pct` | numeric | snapshot — global or overridden value actually used |
| `applied_commission_pct` | numeric | snapshot |
| `applied_rdf_pct` | numeric | snapshot |
| `applied_laga_flat` | numeric | snapshot |
| `basic_amount` | numeric | derived |
| `raw_net_amount` | numeric | derived, pre-rounding |
| `net_amount` | numeric | derived, post-rounding (R22) — Buyer-facing |
| `raw_seller_payable` | numeric | derived, pre-rounding |
| `seller_payable` | numeric | derived, post-rounding (R22) — Seller-facing |

Snapshotting the applied charge values onto each row (rather than joining live to
`global_charge_settings`) means a future settings change never rewrites a historical invoice.

### `stock_pendency` (view)
```sql
SELECT a.tenant_id, a.seller_id, a.lot_no, a.item_id,
       a.nug - COALESCE(SUM(s.nug), 0) AS balance_nug
FROM arrivals a
LEFT JOIN sales s ON s.arrival_id = a.arrival_id
GROUP BY a.arrival_id
```

### Over-sell check (application layer, R23)
```
on sale line save:
    balance = arrival.nug - SUM(existing sale.nug for that arrival_id)
    -- arrival_id already pins this to one tenant, but the service layer should
    -- also assert sale.tenant_id == arrival.tenant_id defensively before this check runs
    if new_line.nug > balance:
        reject save
        return error targeting the Nug cell of this line
        render standard red validation border on that cell
```

### Auto-suffix algorithm (R7)
```
given (tenant_id, date, seller_id, lot_no) about to be saved:
    if not exists within this tenant_id: save as-is
    else:
        for suffix in a, b, c, ..., z, aa, ab, ...:
            candidate = f"{lot_no}({suffix})"
            if not exists(candidate) within this tenant_id: save as candidate; stop
```

---

## 18. Open questions still outstanding

All three previously-listed questions are now resolved:

- Rounding scope → confirmed to apply to **both** Buyer Net amount and Seller payable (§12, §7.3).
- Cross-date sales → confirmed **allowed** (§5.6).
- Weight rollup → confirmed **not needed**; the per-line Weight cell (§6, field 6) already covers it.

The only things still genuinely open are the three sub-decisions at the end of **§5.7** (display
format, whether to show balance inline, and whether Item always precedes Lot no. in the flow) —
that's a raw design brainstorm, not a locked spec, and needs your input before it gets built.

---

## 19. Changelog

- Both Sellers corrected to **5 lots each** (was mistakenly 10 for John).
- Mango lots renamed from manual `25-a` / `25-b` to auto-suffix `25` / `25(a)` for **both** MAX
  and JOHN, consistent with the Banana `45` / `45(a)` duplicate-handling example. All downstream
  references to `25-b` updated to `25(a)`.
- Added top-of-document warning: tables here are illustrative only; user's own markdown/images are
  source of truth; conflicts get raised as questions, not silently resolved.
- Auto-suffix algorithm confirmed as sequential `(a) → (b) → (c)...` through the alphabet.
- Confirmed: pendency/balance is Nug-only; Weight is customer/sales-report-facing only.
- Added hard over-sell block with specific UI requirement (focus + standard red cell border).
- Added rounding rule: nearest rupee, half-up.
- Added global charge settings + per-sale-line override mechanism.
- Confirmed each sale line is an independent record (no multi-lot header).
- Added Registers & Filters section (§14): date range first, then Commodity/Seller on all three
  registers, Buyer additionally on Sales Register (Pendency still open).
- Added party terminology: Seller = Grower = Farmer = Supplier; Buyer = Customer; Trader = app
  owner, non-transacting.
- Marked crate handling as deferred pending separate upload.
- Rounding rule confirmed as standard round-half-up on two-decimal currency amounts — no
  special-casing.
- Buyer filter confirmed to apply to the **Sales Register only**, not the Stock Pendency Report.
- RDF confirmed to stand for **Rural Development Fund** — not applicable in every mandi, so it's
  a normal field (global + per-line override) that simply gets set to `0` where it doesn't apply,
  rather than being a placeholder or omitted field.
- Rounding scope broadened: confirmed to apply to **both** Buyer Net amount and Seller payable
  (previously assumed Buyer-side only); whole numbers pass through unaffected since there's
  nothing after the decimal to round.
- Cross-date sales confirmed: any currently-open lot can be sold on any date, not just its
  arrival date.
- Added §5.6 (cross-date sales) and §5.7 (lot no. dropdown disambiguation — raw design brainstorm,
  not finalized, with three sub-decisions still open).
- Confirmed the per-line Weight cell already covers "weight sold to this Buyer" — no separate
  aggregate/rollup weight report needed.
- Closed out all three previously-open questions in §18; only the §5.7 sub-decisions remain live.
- **Confirmed multi-tenant architecture** (reasoning: Traders shouldn't need to self-host/install).
  Added §20 with full reasoning. Updated §17 data model throughout: added a `tenants` table,
  `tenant_id` on every table, and scoped every uniqueness constraint to `(tenant_id, ...)` instead
  of globally. One sub-question raised by this decision is still open — whether the `items`
  commodity catalog is shared across tenants or per-tenant (§20.3). Auth/access model remains
  explicitly deferred, separate from and layered on top of this tenancy decision.
- Confirmed tenant creation flow: a tenant is created automatically at signup, with a
  system-generated unique `tenant_id` (UUID); every row the user subsequently creates carries it.
  Flagged (not assumed) whether this also settles the `items`-sharing question from §20.3.

---

## 20. Tenancy model — multi-tenant (confirmed)

**Decision: multi-tenant. One shared deployment serves many Traders.** Reasoning given: the
Traders using this app aren't expected to be technically capable of running their own install
("a computer rookie") — so this has to be a SaaS-style product where a Trader just signs up and
starts working, not something that requires infrastructure setup per customer.

### 20.1 What that means concretely

- **One Trader = one tenant.** Every Trader's Sellers, Buyers, arrivals, sales, and charge
  settings sit in their own isolated partition of the same database.
- **A tenant is created at signup.** When a user signs up, the system creates a new `tenants` row
  and hands back a system-generated, unique `tenant_id` (a UUID, [INFERRED] — standard practice
  for a value that must be unguessable and never collide, unlike an auto-incrementing integer).
  From that point on, every row the user creates — Sellers, Buyers, arrivals, sales, settings —
  carries that `tenant_id`, which is how isolation actually gets enforced at the data layer.
- Every uniqueness rule in this doc (§5.6, §16 R6) now scopes **within a tenant**, not globally.
  Two different Traders can both have a Seller called "MAX FARMER" and both use lot number `25`
  on the same calendar day — zero conflict, because they're different tenants. Only within a
  single tenant does the same-day-same-seller-same-lot collision rule (§5.2) apply.
- `global_charge_settings` (§13) is **per-tenant**, not shared — this was already implied by the
  original notes ("say Market fees is set at 2%") and is now explicit in the schema.
- `parties` (Sellers and Buyers) are **per-tenant, not shared** — one Trader's book of contacts
  and pricing relationships is private business data, invisible to every other tenant.

### 20.2 What's confirmed vs. still open

| Data | Tenant-scoped? |
|---|---|
| Sellers / Buyers (`parties`) | ✅ Confirmed — always tenant-scoped, no ambiguity here. |
| `global_charge_settings` | ✅ Confirmed — always tenant-scoped. |
| Arrivals, Sales | ✅ Confirmed — always tenant-scoped (they reference tenant-scoped parties anyway). |
| **`items`** (commodity master list — Mango, Banana, Cherry...) | ❓ **Open.** See §20.3 below. |

### 20.3 The one open question this decision raises: is the item catalog shared or per-tenant?

Two real options, not yet decided:

- **Shared master catalog** — one global `items` list (Mango is Mango for every tenant). Pro:
  consistent naming, no risk of "Mango" vs "mango" vs "Mangoes" fragmenting across tenants, and
  it keeps the door open if you ever want cross-tenant reporting/benchmarking on the platform
  side. Con: a Trader can't rename or add a hyper-local commodity without going through you (or
  an admin flow) to add it to the shared list.
- **Per-tenant catalog** — each Trader manages their own item list from day one, no shared table.
  Pro: zero friction, any Trader can add whatever commodity they deal in immediately. Con: no
  guaranteed naming consistency, and any future "compare across mandis" feature would need a
  normalization/mapping layer bolted on afterward.

The schema in §17 stubs this with a nullable `tenant_id` on `items` so either answer is a small
migration, not a rebuild — but it's worth deciding before that table gets real data in it, since
retrofitting naming consistency across tenants after the fact is the harder direction to migrate.

> Flagging rather than assuming: your framing that "henceforth everything is unique for that
> user" reads like it could extend to `items` too (per-tenant catalog, no sharing) — but it could
> also just describe the transactional data (parties, arrivals, sales, settings), leaving room for
> `items` to be the one deliberate exception as a shared master list. Worth an explicit yes/no on
> this one specifically, since §20.3 lays out real tradeoffs either way.

### 20.4 Deliberately not addressed here

**Auth/access model is still on hold, by your own instruction, and this section doesn't touch it.**
Tenancy answers *"whose data is this row?"* — auth answers *"who's allowed to read or write it?"*.
Multi-tenancy needs to be decided first because it changes the shape of the schema (`tenant_id`
everywhere); auth then sits on top of that shape once you're ready to design it — e.g. how a user
gets tied to a tenant, whether a Trader can have multiple staff logins, whether there's a
platform-admin role that can see across tenants for support purposes. None of that is decided or
assumed here.
