import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router'
import './auth.css'

// Shared frame for Sign in and Sign up: brand, the two-tab switch (spec images 2 and 3), the card.
function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth">
      <Link className="auth__brand" to="/">
        Mandi<span>Buddy</span>
      </Link>

      <div className="auth__card">
        <nav className="auth__tabs" aria-label="Sign in or create account">
          <NavLink className="auth__tab" to="/signin">
            Sign in
          </NavLink>
          <NavLink className="auth__tab" to="/signup">
            Create account
          </NavLink>
        </nav>

        <h1 className="auth__title">{title}</h1>
        {children}
      </div>
    </main>
  )
}

export default AuthLayout
