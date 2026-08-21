import { useEffect, useState } from 'react'
import './NavBar.css'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#why', label: 'Why MandiBuddy' },
  { href: '#about', label: 'About' },
]

export default function NavBar({ onOpenCalculator, onSignIn, onSignUp }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  // shrink / add shadow once the page moves
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // highlight the section you are currently reading
  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean)
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive('#' + entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner shell">
        <a className="nav__brand" href="#top" onClick={() => setOpen(false)}>
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__name">
            Mandi<span className="nav__name-alt">Buddy</span>
          </span>
        </a>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="nav-menu" className={`nav__menu ${open ? 'is-open' : ''}`}>
          <ul className="nav__links">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`nav__link ${active === link.href ? 'is-active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            {/* Quick commission calculator sits in place of a dropdown.
                TODO: when the destination page exists, swap this button for a
                link to that route instead of opening the panel. */}
            <button
              className="btn btn--haldi nav__calc"
              onClick={() => {
                setOpen(false)
                onOpenCalculator()
              }}
            >
              <span className="nav__calc-icon" aria-hidden="true">
                ₹
              </span>
              Quick commission calculator
            </button>

            <button className="btn" onClick={onSignIn}>
              Sign in
            </button>
            <button className="btn btn--solid" onClick={onSignUp}>
              Sign up
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
