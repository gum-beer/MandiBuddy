import './About.css'

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="shell">
        <header className="ledger-head">
          <span className="ledger-head__folio">Folio 03</span>
          <h2 className="ledger-head__title">About MandiBuddy</h2>
          <p className="ledger-head__note">Why this exists, in plain words.</p>
        </header>

        <div className="about__grid">
          <div className="about__body">
            <p>
              For decades, India&apos;s agricultural backbone — the APMC mandis — have run on
              red cloth-bound <em>bahi-khatas</em> and mental math. While corporate India moved
              to the cloud, mandi traders were left behind, forced to use generic retail billing
              software that never understood how a mandi works.
            </p>
            <p>
              We realised that arhtiyas and commission agents needed an ecosystem built around
              their own vocabulary. They needed auto-calculating commission, instant WhatsApp
              farmer pattis, and digital khatas that update in real time.
            </p>
            <p className="about__closing">That is why MandiBuddy was born.</p>
          </div>

          <aside className="about__aside">
            <p className="about__aside-title">Built around mandi words</p>
            <ul className="about__glossary">
              <li>
                <b>Arhat</b>
                <span>Commission on the lot</span>
              </li>
              <li>
                <b>Patti</b>
                <span>The farmer&apos;s settlement slip</span>
              </li>
              <li>
                <b>Khata</b>
                <span>Running account, farmer or buyer</span>
              </li>
              <li>
                <b>Dhalta</b>
                <span>Wastage allowance per bag</span>
              </li>
              <li>
                <b>Peshgi</b>
                <span>Advance given, recovered later</span>
              </li>
            </ul>
            {/* TODO: swap in the real team / mandi photo once available. */}
          </aside>
        </div>
      </div>
    </section>
  )
}
