/* ------------------------------------------------------------------
   Patti (farmer settlement) maths.
   All rates here are placeholders for the demo on the homepage —
   real rates vary by state, mandi and commodity. Edit freely.
   ------------------------------------------------------------------ */

export const DEFAULT_RATES = {
  commissionPct: 2.5, // arhat / commission charged to the buyer or farmer
  marketFeePct: 1.0, // APMC market fee
  rdfPct: 1.0, // rural development fund
  labourPerBag: 12, // palledari, rupees per bag
  dhaltaKgPerBag: 0.25, // wastage allowance deducted per bag
}

/** One lot, start to finish. Weights in kg, rate in rupees per quintal. */
export function calculatePatti({
  bags = 0,
  kgPerBag = 0,
  ratePerQuintal = 0,
  advance = 0,
  rates = DEFAULT_RATES,
}) {
  const grossKg = bags * kgPerBag
  const dhaltaKg = bags * rates.dhaltaKgPerBag
  const netKg = Math.max(grossKg - dhaltaKg, 0)
  const quintals = netKg / 100

  const grossValue = quintals * ratePerQuintal
  const commission = (grossValue * rates.commissionPct) / 100
  const marketFee = (grossValue * rates.marketFeePct) / 100
  const rdf = (grossValue * rates.rdfPct) / 100
  const labour = bags * rates.labourPerBag

  const deductions = commission + marketFee + rdf + labour + advance
  const netPayable = grossValue - deductions

  return {
    grossKg,
    dhaltaKg,
    netKg,
    quintals,
    grossValue,
    commission,
    marketFee,
    rdf,
    labour,
    advance,
    deductions,
    netPayable,
  }
}

const inr = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

/** 128450 -> "1,28,450" (Indian digit grouping) */
export function formatMoney(value) {
  if (!Number.isFinite(value)) return '0'
  return inr.format(Math.round(value))
}

export function formatWeight(kg) {
  if (!Number.isFinite(kg)) return '0'
  return kg.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}
