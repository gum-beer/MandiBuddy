import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { postJson } from '../lib/api'
import { setSignedInUser } from '../lib/auth'

export default function SignUpPage() {
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
      await postJson('/auth/signup', { username, password })
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
      title="Sign up"
      subtitle="Vanilla for now — real auth comes later."
      footer={<>Already have a login? <Link to="/signin">Sign in</Link></>}
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
            autoComplete="new-password"
            required
          />
        </div>
        <button className="btn btn--solid" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  )
}
