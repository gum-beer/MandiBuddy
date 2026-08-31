import { Link, useNavigate } from 'react-router-dom'
import { getSignedInUser, signOut } from '../lib/auth'
import './AppLayout.css'

/** Shared chrome for pages behind sign in. Not the marketing NavBar —
 *  this is the working khata, not the visiting card. */
export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const user = getSignedInUser()

  const onSignOut = () => {
    signOut()
    navigate('/signin')
  }

  return (
    <div className="app-layout">
      <header className="app-layout__bar">
        <div className="app-layout__shell">
          <Link className="app-layout__brand" to="/app/suppliers">
            MandiBuddy
          </Link>
          <nav className="app-layout__nav">
            <Link className="app-layout__link" to="/app/suppliers">
              Suppliers
            </Link>
            <Link className="app-layout__link" to="/app/arrival-book">
              Arrival book
            </Link>
            <Link className="app-layout__link" to="/app/stock-sale">
              Stock sale
            </Link>
            <Link className="app-layout__link" to="/app/sale-register">
              Sale register
            </Link>
          </nav>
          <div className="app-layout__user">
            <span className="app-layout__username">{user}</span>
            <button className="btn" type="button" onClick={onSignOut}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="app-layout__shell app-layout__content">{children}</main>
    </div>
  )
}
