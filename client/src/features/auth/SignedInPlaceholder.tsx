import { Link, useNavigate } from 'react-router'
import './auth.css'

// Where a mock sign-in lands until the real app exists. Temporary by design.
function SignedInPlaceholder({ username, onSignOut }: { username: string; onSignOut: () => void }) {
  const navigate = useNavigate()

  function handleSignOut() {
    navigate('/')
    onSignOut()
  }

  return (
    <main className="auth">
      <Link className="auth__brand" to="/">
        Mandi<span>Buddy</span>
      </Link>
      <div className="auth__card">
        <h1 className="auth__title">Signed in as {username}</h1>
        <p className="auth__note">The app comes next. This page is a placeholder for the mock sign-in.</p>
        <button className="btn auth__submit" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </main>
  )
}

export default SignedInPlaceholder
