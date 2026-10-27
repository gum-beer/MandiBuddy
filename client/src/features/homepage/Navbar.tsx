import { Link } from 'react-router'

// Fixed top bar. The section links jump to anchors on this same page;
// Sign in / Sign up go to their own pages.
function Navbar() {
  return (
    <header className="navbar">
      <div className="shell navbar__inner">
        <a className="navbar__brand" href="#top">
          Mandi<span>Buddy</span>
        </a>

        <nav className="navbar__nav" aria-label="Sections">
          <a className="navbar__link" href="#features">
            Features
          </a>
          <a className="navbar__link" href="#about">
            About
          </a>
          <a className="navbar__link" href="#calculator">
            Quick commission calculator
          </a>
        </nav>

        <div className="navbar__actions">
          <Link className="navbar__link" to="/signin">
            Sign in
          </Link>
          <Link className="btn btn--solid" to="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
