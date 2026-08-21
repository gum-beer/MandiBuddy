import { comparison } from '../data/content'
import './Comparison.css'

export default function Comparison() {
  return (
    <section className="section compare" id="why">
      <div className="shell">
        <header className="ledger-head ledger-head--dark">
          <span className="ledger-head__folio">Folio 02</span>
          <h2 className="ledger-head__title">Why we had to build it</h2>
          <p className="ledger-head__note">
            The same day&apos;s work, entered two ways.
          </p>
        </header>

        <div className="compare__table" role="table" aria-label="Generic billing software compared with MandiBuddy">
          <div className="compare__row compare__row--head" role="row">
            <span role="columnheader">The job</span>
            <span role="columnheader">{comparison.them}</span>
            <span role="columnheader" className="compare__us">
              {comparison.us}
            </span>
          </div>

          {comparison.rows.map((row) => (
            <div className="compare__row" role="row" key={row.job}>
              <span className="compare__job" role="cell">
                {row.job}
              </span>
              <span className="compare__them" role="cell">
                <em className="compare__mobile-label">{comparison.them}</em>
                {row.them}
              </span>
              <span className="compare__us" role="cell">
                <em className="compare__mobile-label">{comparison.us}</em>
                {row.us}
              </span>
            </div>
          ))}
        </div>

        <p className="compare__foot">
          A regular shop sells a fixed item at a fixed price. A mandi trader deals with dynamic
          lots, varying crate weights, live auction pricing, wastage, farmer advances and APMC
          cess rules — so the software has to know all of it.
        </p>
      </div>
    </section>
  )
}
