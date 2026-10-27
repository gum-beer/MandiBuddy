import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import AuthLayout from './AuthLayout.tsx'
import PasswordInput from './PasswordInput.tsx'
import { emptySignUp, validateSignUp, type SignUpValues } from './signUp.ts'

// Mock sign-up: fields from spec image 1, structure and hints from image 2. Validates, then says
// nothing was saved — there is no account creation until real auth (Q6).
function SignUpPage() {
  const [values, setValues] = useState<SignUpValues>(emptySignUp)
  const [submitted, setSubmitted] = useState(false)
  const [done, setDone] = useState(false)

  // Computed during render; shown only after the first submit.
  const errors = submitted ? validateSignUp(values) : {}

  function set(name: keyof SignUpValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    const found = validateSignUp(values)
    // Keys of emptySignUp are in on-screen order, so this is the first bad field.
    const first = (Object.keys(emptySignUp) as (keyof SignUpValues)[]).find((k) => found[k])
    if (first) {
      document.getElementById(`signup-${first}`)?.focus()
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout title="Create company">
        <p className="auth__alert auth__alert--ok" role="status">
          Mock: the form is valid, but nothing was saved. Sign in with abc / abc.
        </p>
        <Link className="btn btn--solid auth__submit" to="/signin">
          Go to sign in →
        </Link>
      </AuthLayout>
    )
  }

  function text(
    name: keyof SignUpValues,
    type: 'text' | 'tel' | 'email' | 'url' = 'text',
    autoComplete = 'off',
  ) {
    const id = `signup-${name}`
    return (
      <input
        id={id}
        className="auth__input"
        type={type}
        value={values[name]}
        onChange={(e) => set(name, e.target.value)}
        autoComplete={autoComplete}
        inputMode={type === 'tel' ? 'numeric' : undefined}
        maxLength={type === 'tel' ? 10 : undefined}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={`${id}-msg`}
      />
    )
  }

  return (
    <AuthLayout title="Create company">
      <form className="auth__form auth__form--grid" onSubmit={handleSubmit} noValidate>
        <Field name="companyName" label="Name of company" required error={errors.companyName} wide>
          {text('companyName', 'text', 'organization')}
        </Field>
        <Field name="printName" label="Print name" wide>
          {text('printName')}
        </Field>
        <Field name="address" label="Address" wide>
          {text('address', 'text', 'address-line1')}
        </Field>
        <Field name="address2" label="Address 2">
          {text('address2', 'text', 'address-line2')}
        </Field>
        <Field name="city" label="City">
          {text('city', 'text', 'address-level2')}
        </Field>
        <Field name="state" label="State">
          {text('state', 'text', 'address-level1')}
        </Field>
        <div className="auth__field">
          <label className="auth__label" htmlFor="signup-country">
            Country
          </label>
          {/* Fixed to India for now; becomes a searchable dropdown when more countries are needed. */}
          <input id="signup-country" className="auth__input" type="text" value="India (+91)" readOnly />
        </div>
        <Field
          name="mobile1"
          label="Mobile 1"
          required
          error={errors.mobile1}
          hint="10-digit Indian mobile number (starts with 6–9)"
        >
          <div className="auth__prefixed">
            <span className="auth__prefix">+91</span>
            {text('mobile1', 'tel', 'tel-national')}
          </div>
        </Field>
        <Field name="mobile2" label="Mobile 2" error={errors.mobile2}>
          <div className="auth__prefixed">
            <span className="auth__prefix">+91</span>
            {text('mobile2', 'tel')}
          </div>
        </Field>
        <Field name="email" label="Email">
          {text('email', 'email', 'email')}
        </Field>
        <Field name="website" label="Website">
          {text('website', 'url', 'url')}
        </Field>
        <Field name="contactPerson" label="Contact person / Owner name">
          {text('contactPerson', 'text', 'name')}
        </Field>
        <Field name="marka" label="Marka / Bill title">
          {text('marka')}
        </Field>
        <Field
          name="username"
          label="Username"
          required
          error={errors.username}
          hint="Letters, numbers, underscores only. Min 6 characters."
        >
          {text('username', 'text', 'username')}
        </Field>
        <Field name="password" label="Password" required error={errors.password} hint="Min 6 characters">
          <PasswordInput
            id="signup-password"
            value={values.password}
            onChange={(v) => set('password', v)}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            describedBy="signup-password-msg"
          />
        </Field>
        <Field name="confirmPassword" label="Confirm password" required error={errors.confirmPassword} right>
          <PasswordInput
            id="signup-confirmPassword"
            value={values.confirmPassword}
            onChange={(v) => set('confirmPassword', v)}
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
            describedBy={errors.confirmPassword ? 'signup-confirmPassword-msg' : undefined}
          />
        </Field>

        <button className="btn btn--solid auth__submit auth__field--wide" type="submit">
          Create company
        </button>
      </form>
    </AuthLayout>
  )
}

type FieldProps = {
  name: keyof SignUpValues
  label: string
  required?: boolean
  error?: string
  hint?: string
  /** Full row instead of half (image 1 layout). */
  wide?: boolean
  /** Sit in the right-hand column (Confirm password under Password). */
  right?: boolean
  children: ReactNode
}

// Label + control + one message line (the error if there is one, else the hint).
function Field({ name, label, required, error, hint, wide, right, children }: FieldProps) {
  const id = `signup-${name}`
  const message = error ?? hint
  const className = ['auth__field', wide && 'auth__field--wide', right && 'auth__field--right']
    .filter(Boolean)
    .join(' ')
  return (
    <div className={className}>
      <label className={required ? 'auth__label auth__label--required' : 'auth__label'} htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {message && (
        <p id={`${id}-msg`} className={error ? 'auth__msg auth__msg--error' : 'auth__msg'}>
          {message}
        </p>
      )}
    </div>
  )
}

export default SignUpPage
