import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_RATES, calculatePatti } from '../lib/calc'
import { sampleLot } from '../data/content'
import PattiSlip from './PattiSlip'
import './CalculatorPanel.css'

const LOT_FIELDS = [
  { key: 'bags', label: 'Bags', suffix: 'nos', step: 1 },
  { key: 'kgPerBag', label: 'Weight per bag', suffix: 'kg', step: 0.5 },
  { key: 'ratePerQuintal', label: 'Rate', suffix: '₹/qtl', step: 5 },
  { key: 'advance', label: 'Advance to recover', suffix: '₹', step: 100 },
]

const RATE_FIELDS = [
  { key: 'commissionPct', label: 'Commission', suffix: '%', step: 0.25 },
  { key: 'marketFeePct', label: 'Market fee', suffix: '%', step: 0.25 },
  { key: 'rdfPct', label: 'RDF', suffix: '%', step: 0.25 },
  { key: 'labourPerBag', label: 'Labour per bag', suffix: '₹', step: 1 },
  { key: 'dhaltaKgPerBag', label: 'Dhalta per bag', suffix: 'kg', step: 0.05 },
]

export default function CalculatorPanel({ open, onClose }) {
  const [lot, setLot] = useState(sampleLot)
  const [rates, setRates] = useState(DEFAULT_RATES)
  const closeRef = useRef(null)

  const result = useMemo(() => calculatePatti({ ...lot, rates }), [lot, rates])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="calc" role="dialog" aria-modal="true" aria-label="Quick commission calculator">
      <button className="calc__backdrop" aria-label="Close calculator" onClick={onClose} />

      <div className="calc__sheet">
        <header className="calc__head">
          <div>
            <p className="calc__eyebrow">Quick commission calculator</p>
            <h2 className="calc__title">Work out a lot in ten seconds</h2>
          </div>
          <button className="btn calc__close" onClick={onClose} ref={closeRef}>
            Close
          </button>
        </header>

        <div className="calc__grid">
          <div className="calc__inputs">
            <fieldset className="calc__set">
              <legend>The lot</legend>
              {LOT_FIELDS.map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={lot[f.key]}
                  onChange={(v) => setLot((p) => ({ ...p, [f.key]: v }))}
                />
              ))}
            </fieldset>

            <fieldset className="calc__set">
              <legend>Your rates</legend>
              {RATE_FIELDS.map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={rates[f.key]}
                  onChange={(v) => setRates((p) => ({ ...p, [f.key]: v }))}
                />
              ))}
            </fieldset>

            <button
              className="calc__reset"
              onClick={() => {
                setLot(sampleLot)
                setRates(DEFAULT_RATES)
              }}
            >
              Reset to sample values
            </button>
          </div>

          <div className="calc__output">
            <PattiSlip lot={lot} result={result} rates={rates} stamp="Not saved" />
            <p className="calc__note">
              Rates shown are samples. Market fee, RDF and commission differ by state and
              commodity — set your own above. Inside MandiBuddy these are saved per mandi and
              applied to every bill.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ field, value, onChange }) {
  return (
    <label className="calc__field">
      <span className="calc__field-label">{field.label}</span>
      <span className="calc__field-input">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step={field.step}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        <em>{field.suffix}</em>
      </span>
    </label>
  )
}
