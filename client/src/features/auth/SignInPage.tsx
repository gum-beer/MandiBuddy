import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import AuthLayout from './AuthLayout.tsx'
import PasswordInput from './PasswordInput.tsx'

// Mock sign-in (spec: auth is built later). The only account is abc / abc, checked here in the
// browser; nothing goes to the server (Q6).
const MOCK_USERNAME = 'abc'
const MOCK_PASSWORD = 'abc'

function SignInPage({ onSignIn }: { onSignIn: (username: string) => void }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [wrongCredentials, setWrongCredentials] = useState(false)

  const usernameError = submitted && !username.trim() ? 'Enter your email or username' : undefined
  const passwordError = submitted && !password ? 'Enter your password' : undefined

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (!username.trim() || !password) {
      setWrongCredentials(false)
      document.getElementById(username.trim() ? 'signin-password' : 'signin-username')?.focus()
      return
    }
    if (username.trim() !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
      setWrongCredentials(true)
      return
    }
    onSignIn(MOCK_USERNAME)
    navigate('/app')
  }

  return (
    <AuthLayout title="Sign in">
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <div className="auth__field auth__field--wide">
          <label className="auth__label" htmlFor="signin-username">
            Email / Username
          </label>
          <input
            id="signin-username"
            className="auth__input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            aria-invalid={usernameError ? true : undefined}
            aria-describedby={usernameError ? 'signin-username-msg' : undefined}
          />
          {usernameError && (
            <p id="signin-username-msg" className="auth__msg auth__msg--error">
              {usernameError}
            </p>
          )}
        </div>

        <div className="auth__field auth__field--wide">
          <label className="auth__label" htmlFor="signin-password">
            Password
          </label>
          <PasswordInput
            id="signin-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            invalid={Boolean(passwordError)}
            describedBy={passwordError ? 'signin-password-msg' : undefined}
          />
          {passwordError && (
            <p id="signin-password-msg" className="auth__msg auth__msg--error">
              {passwordError}
            </p>
          )}
        </div>

        {wrongCredentials && (
          <p className="auth__alert" role="alert">
            Wrong username or password
          </p>
        )}

        <button className="btn btn--solid auth__submit" type="submit">
          Sign in →
        </button>
        <p className="auth__note">Mock sign-in for now: use abc / abc.</p>
      </form>
    </AuthLayout>
  )
}

export default SignInPage
