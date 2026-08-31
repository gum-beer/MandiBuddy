import { DEFAULT_RATES, formatMoney, formatWeight } from '../lib/calc'
import './PattiSlip.css'

/**
 * The farmer's settlement slip. Give it a lot and the result of
 * calculatePatti() and it prints the whole working, top to bottom.
 */
export default function PattiSlip({ lot, result, rates = DEFAULT_RATES, stamp = 'Sample' }) {
  const lines = [
    {
      label: 'Gross weight',
      note: `${lot.bags} bags × ${formatWeight(lot.kgPerBag)} kg`,
      value: `${formatWeight(result.grossKg)} kg`,
    },
    {
      label: 'Dhalta',
      note: `${rates.dhaltaKgPerBag} kg per bag`,
      value: `− ${formatWeight(result.dhaltaKg)} kg`,
    },
    {
      label: 'Net weight',
      note: `${formatWeight(result.quintals)} qtl`,
      value: `${formatWeight(result.netKg)} kg`,
      strong: true,
    },
  ]

  const deductions = [
    { label: 'Commission', note: `${rates.commissionPct}%`, value: result.commission },
    { label: 'Market fee', note: `${rates.marketFeePct}%`, value: result.marketFee },
    { label: 'RDF', note: `${rates.rdfPct}%`, value: result.rdf },
    { label: 'Labour', note: `₹${rates.labourPerBag} × ${lot.bags} bags`, value: result.labour },
    { label: 'Advance recovered', note: 'peshgi', value: result.advance },
  ]

  return (
    <article className="patti" aria-label="Farmer settlement slip">
      <header className="patti__head">
        <div>
          <p className="patti__eyebrow">Patti</p>
          <h3 className="patti__farmer">{lot.farmer}</h3>
          <p className="patti__meta">
            {lot.village} · {lot.commodity} · Lot 14
          </p>
        </div>
        <span className="patti__stamp">{stamp}</span>
      </header>

      <div className="patti__block">
        {lines.map((line) => (
          <Row key={line.label} {...line} />
        ))}
      </div>

      <div className="patti__rate">
        <span>Rate</span>
        <span className="patti__rate-value">
          ₹{formatMoney(lot.ratePerQuintal)} <small>/ qtl</small>
        </span>
      </div>

      <div className="patti__block">
        <Row label="Gross value" value={`₹ ${formatMoney(result.grossValue)}`} strong />
        {deductions.map((d) => (
          <Row
            key={d.label}
            label={d.label}
            note={d.note}
            value={`− ₹ ${formatMoney(d.value)}`}
            muted
          />
        ))}
      </div>

      <footer className="patti__total">
        <span className="patti__total-label">Payable to farmer</span>
        <span className="patti__total-value">₹ {formatMoney(result.netPayable)}</span>
      </footer>
    </article>
  )
}

function Row({ label, note, value, strong, muted }) {
  return (
    <div className={`patti__row ${strong ? 'is-strong' : ''} ${muted ? 'is-muted' : ''}`}>
      <span className="patti__label">
        {label}
        {note ? <em className="patti__note">{note}</em> : null}
      </span>
      <span className="patti__value">{value}</span>
    </div>
  )
}
