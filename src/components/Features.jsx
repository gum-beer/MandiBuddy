import { features } from '../data/content'
import './Features.css'

export default function Features() {
  return (
    <section className="section features" id="features">
      <div className="shell">
        <header className="ledger-head">
          <span className="ledger-head__folio">Folio 01</span>
          <h2 className="ledger-head__title">What it does</h2>
          <p className="ledger-head__note">
            The short list. Everything else lives inside the app.
          </p>
        </header>

        <ul className="features__grid">
          {features.map((f) => (
            <li className="feature" key={f.id}>
              <span className="feature__tag">{f.tag}</span>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__body">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
