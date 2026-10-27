// Static homepage copy. Kept out of the JSX so the components stay readable.

export const features = [
  {
    title: 'Auto Commission Calculation',
    body: 'Configure commission rates once — per party or per commodity. Commission, market fee, hamali and palledari are calculated on every sale.',
  },
  {
    title: 'APMC Billing & Market Levy',
    body: 'APMC-compliant bills for every sale. Market cess, supervision charges and government levies computed and reported.',
  },
  {
    title: 'GST Billing & E-Invoicing',
    body: 'GST-compliant invoices for every transaction. B2B and B2C billing, with GSTR-1 and GSTR-3B export.',
  },
  {
    title: 'Advanced Crate Management',
    body: 'Track crate issues, returns and outstanding balances, tied to the party ledger so crates stop going missing.',
  },
  {
    title: 'Payment & Settlement Management',
    body: 'Record cash, cheque, UPI and bank transfer payments against any party. Settle multiple farmers in one operation.',
  },
  {
    title: 'Buyer & Farmer Master',
    body: 'Complete profiles for every farmer and buyer — address, contact, guarantor and opening balance.',
  },
  {
    title: 'Native Vernacular Invoicing',
    body: "Print the patti in your farmer's language instead of retyping names by hand.",
  },
]

export const comparison = [
  { feature: 'Auto commission & hamali', generic: 'Manual entry', mandibuddy: 'Auto on every sale' },
  { feature: 'Lot & crate tracking', generic: 'Not supported', mandibuddy: 'Built in' },
  { feature: 'APMC levy reporting', generic: 'Manual workaround', mandibuddy: 'Auto computed' },
  { feature: 'Farmer patti', generic: 'Requires export', mandibuddy: 'One tap share' },
  { feature: 'Real-time khata', generic: 'Manual refresh', mandibuddy: 'Always live' },
  { feature: 'Built for mandi trade', generic: 'Generic tool', mandibuddy: 'Purpose built' },
]

export const about = [
  "For decades, India's agricultural backbone — the APMC mandis — have run on red cloth-bound bahi-khatas and mental math. While corporate India moved to the cloud, mandi traders were left behind, forced to use generic retail billing software that completely failed to understand how a mandi works.",
  'A regular shop sells a fixed item at a fixed price. A mandi trader deals with dynamic lots, varying crate weights, live auction pricing, wastage, farmer advances and complex APMC cess rules.',
  'Arhtiyas and commission agents needed an ecosystem tailored to their vocabulary: auto-calculating commission, instant farmer pattis, and digital khatas that update in real time. That is why MandiBuddy was born.',
]
