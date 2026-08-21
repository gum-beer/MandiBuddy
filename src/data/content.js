/* ------------------------------------------------------------------
   All homepage copy that repeats lives here, so you can edit words
   without touching layout. Placeholder text is marked TODO.
   ------------------------------------------------------------------ */

/** The short feature list for the homepage. The full list lives in the app. */
export const features = [
  {
    id: 'commission',
    title: 'Commission that adds itself',
    body: 'Set the arhat rate once — per farmer, per commodity or per lot — and every bill carries it without a calculator.',
    tag: 'Arhat',
  },
  {
    id: 'lots',
    title: 'Live auction lots',
    body: 'Enter bags, weight and the boli rate as the lot sells. The lot value moves with it, on the phone in your hand.',
    tag: 'Boli',
  },
  {
    id: 'patti',
    title: 'Patti on WhatsApp',
    body: 'Cut the patti and it reaches the farmer as a readable slip — every deduction shown, nothing to explain twice.',
    tag: 'Patti',
  },
  {
    id: 'khata',
    title: 'Khata that stays current',
    body: 'Farmer and buyer balances update the moment a bill is saved. No evening session with the bahi to tally the day.',
    tag: 'Khata',
  },
  {
    id: 'cess',
    title: 'Market fee and cess, applied',
    body: 'APMC fee, RDF and other state deductions sit in the bill at the right rate instead of in someone’s memory.',
    tag: 'APMC',
  },
  {
    id: 'weights',
    title: 'Crate, bag and dhalta',
    body: 'Tare weights, part-bags and wastage allowances are part of the lot, not an adjustment you make at the end.',
    tag: 'Tol',
  },
  {
    id: 'advance',
    title: 'Advances recovered on their own',
    body: 'Peshgi given in the season is tracked against the farmer and settled at the patti, in full or in parts.',
    tag: 'Peshgi',
  },
  {
    id: 'daybook',
    title: 'Day book that closes itself',
    body: 'Cash in, cash out and the closing figure for the day — ready before you leave the shop.',
    tag: 'Rojnamcha',
  },
]

/**
 * "Why our software was needed" — mandi work vs generic retail billing.
 * TODO: replace with the final comparison content.
 */
export const comparison = {
  them: 'Generic billing software',
  us: 'MandiBuddy',
  rows: [
    {
      job: 'What is being sold',
      them: 'A fixed item at a fixed price',
      us: 'A lot, priced live at auction',
    },
    {
      job: 'Weight',
      them: 'Typed in by hand, one number',
      us: 'Bags, tare, part-bags and dhalta per lot',
    },
    {
      job: 'Commission',
      them: 'Added as a manual line item',
      us: 'Calculated on every bill from your rate',
    },
    {
      job: 'Farmer payment',
      them: 'A retail invoice the farmer cannot read',
      us: 'A patti in mandi vocabulary, sent on WhatsApp',
    },
    {
      job: 'Ledger',
      them: 'Customer balance, updated when you remember',
      us: 'Farmer and buyer khata, updated at save',
    },
    {
      job: 'APMC rules',
      them: 'Not modelled at all',
      us: 'Market fee, RDF and cess built into the bill',
    },
    {
      job: 'Advances',
      them: 'Tracked in a separate notebook',
      us: 'Recovered automatically at settlement',
    },
  ],
}

/** Hero patti demo — starting values. */
export const sampleLot = {
  commodity: 'Wheat',
  farmer: 'Gurmail Singh',
  village: 'Dakha',
  bags: 42,
  kgPerBag: 50,
  ratePerQuintal: 2425,
  advance: 5000,
}
