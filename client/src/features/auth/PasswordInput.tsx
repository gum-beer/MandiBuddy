import { useState } from 'react'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}

// Password field with a Show/Hide toggle (the eye in spec images 2 and 3).
// Owns only whether the text is visible; the value belongs to the form.
function PasswordInput({ id, value, onChange, autoComplete, placeholder, invalid, describedBy }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth__password">
      <input
        id={id}
        className="auth__input"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        className="auth__reveal"
        onClick={() => setVisible((v) => !v)}
        aria-controls={id}
        aria-pressed={visible}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export default PasswordInput
