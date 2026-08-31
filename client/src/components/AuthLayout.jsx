import { Link } from 'react-router-dom'
import './AuthLayout.css'

/** Shared card chrome for the Sign In / Sign Up pages. */
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="auth-layout ruled">
      <div className="auth-layout__card">
        <Link className="auth-layout__brand" to="/">
          MandiBuddy
        </Link>
        <h1 className="auth-layout__title">{title}</h1>
        {subtitle ? <p className="auth-layout__subtitle">{subtitle}</p> : null}
        {children}
        {footer ? <p className="auth-layout__footer">{footer}</p> : null}
      </div>
    </div>
  )
}
