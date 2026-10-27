// Money helpers. Never do arithmetic on JS numbers: 1.005 * 100 is 100.49999… in binary.
// Arithmetic returns exact Decimals (chain them); output functions return strings (send those).
import { Decimal } from 'decimal.js'

const Money = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export type MoneyValue = string | number | Decimal

export function money(value: MoneyValue): Decimal {
  return new Money(value)
}

export function add(...values: MoneyValue[]): Decimal {
  return values.reduce<Decimal>((sum, v) => sum.plus(money(v)), money(0))
}

export function sub(a: MoneyValue, b: MoneyValue): Decimal {
  return money(a).minus(money(b))
}

export function mul(a: MoneyValue, b: MoneyValue): Decimal {
  return money(a).times(money(b))
}

/** `percent`% of `amount`, exact (7% of 3750 = 262.5). */
export function percentOf(amount: MoneyValue, percent: MoneyValue): Decimal {
  return money(amount).times(money(percent)).dividedBy(100)
}

/**
 * R22: nearest rupee, half-up (.50 and above rounds up). Whole numbers are unchanged.
 * Q5: rounds once, straight from the exact value; never round to paise first.
 */
export function roundToRupee(value: MoneyValue): string {
  return money(value).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toFixed(0)
}

/** 2 decimals, half-up. For display and non-final amounts only, never before roundToRupee (Q5). */
export function toAmount2(value: MoneyValue): string {
  return money(value).toFixed(2, Decimal.ROUND_HALF_UP)
}

/** Display: `₹262.50`, or `₹4113` with `whole` (net amounts, R22). */
export function formatRupees(value: MoneyValue, opts: { whole?: boolean } = {}): string {
  return `₹${opts.whole ? roundToRupee(value) : toAmount2(value)}`
}
