import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { postJson } from '../lib/api'
import { setSignedInUser } from '../lib/auth'

export default function SignInPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await postJson('/auth/signin', { username, password })
      setSignedInUser(username)
      navigate('/app/suppliers')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Test login: abc / abc"
      footer={<>New here? Use the same abc / abc, or sign up below.</>}
    >
      <form onSubmit={onSubmit}>
        {error ? <p className="auth-layout__error">{error}</p> : null}
        <div className="auth-layout__field">
          <label className="auth-layout__field-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="auth-layout__field-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="auth-layout__field">
          <label className="auth-layout__field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="auth-layout__field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn btn--solid" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}
