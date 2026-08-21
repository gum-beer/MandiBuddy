import { useMemo, useState } from 'react'
import { calculatePatti, formatMoney } from '../lib/calc'
import { sampleLot } from '../data/content'
import PattiSlip from './PattiSlip'
import './Hero.css'

const CONTROLS = [
  { key: 'bags', label: 'Bags', min: 1, max: 150, step: 1, suffix: '' },
  { key: 'kgPerBag', label: 'Weight per bag', min: 20, max: 60, step: 1, suffix: 'kg' },
  { key: 'ratePerQuintal', label: 'Boli rate', min: 1600, max: 3600, step: 5, suffix: '₹/qtl' },
]

export default function Hero({ onSignUp }) {
  const [lot, setLot] = useState(sampleLot)
  const result = useMemo(() => calculatePatti(lot), [lot])

  const update = (key, value) => setLot((prev) => ({ ...prev, [key]: Number(value) }))

  return (
    <section className="hero" id="top">
      <div className="hero__inner shell">
        <div className="hero__copy">
          <p className="hero__eyebrow">For arhtiyas and commission agents of the APMC mandi</p>
          <h1 className="hero__title">
            The bahi-khata,
            <br />
            <span className="hero__title-alt">doing its own maths.</span>
          </h1>
          <p className="hero__lede">
            MandiBuddy is billing, patti and khata software built the way a mandi actually
            works — lots, boli rates, bag weights, dhalta, commission and cess. Not a retail
            invoice with the words changed.
          </p>

          <div className="hero__cta">
            <button className="btn btn--haldi hero__btn" onClick={onSignUp}>
              Sign up
            </button>
            <a className="btn hero__btn hero__btn--ghost" href="#features">
              See what it does
            </a>
          </div>

          <dl className="hero__facts">
            <div>
              <dt>Lot value</dt>
              <dd>₹ {formatMoney(result.grossValue)}</dd>
            </div>
            <div>
              <dt>Your commission</dt>
              <dd>₹ {formatMoney(result.commission)}</dd>
            </div>
            <div>
              <dt>Time to cut</dt>
              <dd>~40 sec</dd>
            </div>
          </dl>
        </div>

        <div className="hero__demo">
          <div className="hero__controls">
            <p className="hero__controls-title">
              Move a number. The patti follows.
            </p>
            {CONTROLS.map((c) => (
              <label className="hero__control" key={c.key}>
                <span className="hero__control-label">
                  {c.label}
                  <b>
                    {lot[c.key]} {c.suffix}
                  </b>
                </span>
                <input
                  type="range"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={lot[c.key]}
                  onChange={(e) => update(c.key, e.target.value)}
                />
              </label>
            ))}
          </div>

          <PattiSlip lot={lot} result={result} stamp="Live sample" />
        </div>
      </div>
    </section>
  )
}
