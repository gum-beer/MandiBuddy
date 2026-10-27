import { describe, expect, it } from 'vitest'
import { add, formatRupees, mul, percentOf, roundToRupee, toAmount2 } from './money.ts'

describe('roundToRupee', () => {
  it('R22: rounds exactly .50 up (Worked Example B raw net 4112.50 → 4113)', () => {
    expect(roundToRupee('4112.50')).toBe('4113')
  })

  it('R22: rounds just below .50 down', () => {
    expect(roundToRupee('4112.49')).toBe('4112')
  })

  it('R22: rounds just above .50 up', () => {
    expect(roundToRupee('4112.51')).toBe('4113')
  })

  it('R22: leaves whole numbers unchanged (4500, 3750)', () => {
    expect(roundToRupee('4500.00')).toBe('4500')
    expect(roundToRupee('3750')).toBe('3750')
  })

  it('R22: rounds .01 down and .99 up', () => {
    expect(roundToRupee('100.01')).toBe('100')
    expect(roundToRupee('100.99')).toBe('101')
  })

  it('Q5: rounds once from the exact value, not via paise (4112.495 → 4112)', () => {
    expect(roundToRupee('4112.495')).toBe('4112')
  })

  it('R22: takes a string and returns a string', () => {
    expect(roundToRupee('4112.5')).toBe('4113')
  })
})

describe('arithmetic', () => {
  it('stays exact where JS floats do not (1.005 → 1.01)', () => {
    expect(toAmount2('1.005')).toBe('1.01')
  })

  it('R14: 7% of 3750 is exactly 262.50', () => {
    expect(toAmount2(percentOf('3750', '7'))).toBe('262.50')
  })

  it('R14 + R22: Worked Example B buyer side = 3750 + 262.5 + 100 → 4113', () => {
    const basic = mul(150, '25')
    const rawNet = add(basic, percentOf(basic, '7'), mul(10, '10'))
    expect(toAmount2(rawNet)).toBe('4112.50')
    expect(roundToRupee(rawNet)).toBe('4113')
  })
})

describe('formatRupees', () => {
  it('shows 2 decimals by default and whole rupees for net amounts', () => {
    expect(formatRupees('262.5')).toBe('₹262.50')
    expect(formatRupees('4112.5', { whole: true })).toBe('₹4113')
  })
})
