import './Footer.css'

export default function Footer({ onSignIn, onSignUp }) {
  return (
    <footer className="foot">
      <div className="shell foot__inner">
        <div className="foot__brand">
          <p className="foot__name">
            Mandi<span>Buddy</span>
          </p>
          <p className="foot__line">
            Billing, patti and khata for the APMC mandi. Built for arhtiyas, not for retail
            counters.
          </p>
        </div>

        <nav className="foot__nav" aria-label="Footer">
          <a href="#features">Features</a>
          <a href="#why">Why MandiBuddy</a>
          <a href="#about">About</a>
        </nav>

        <div className="foot__actions">
          <button className="btn foot__btn" onClick={onSignIn}>
            Sign in
          </button>
          <button className="btn btn--haldi foot__btn" onClick={onSignUp}>
            Sign up
          </button>
        </div>
      </div>

      <div className="shell foot__base">
        <span>© {new Date().getFullYear()} MandiBuddy</span>
        {/* TODO: link real policy pages when they exist. */}
        <span>Ludhiana, Punjab</span>
      </div>
    </footer>
  )
}
