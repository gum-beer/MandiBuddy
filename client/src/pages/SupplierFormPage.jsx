import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import { postForm } from '../lib/api'
import './SupplierFormPage.css'

const EMPTY_FORM = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  mobile1: '',
  guarantorName: '',
  guarantorPhone: '',
}

function SupplierFormInner() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  // Spec: Mobile 1 accepts numeric input only.
  const onMobileChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '')
    setForm((f) => ({ ...f, mobile1: digitsOnly }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value)
      })
      if (photo) data.append('photo', photo)

      await postForm('/suppliers', data)
      navigate('/app/suppliers')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppLayout>
      <div className="ledger-head">
        <span className="ledger-head__folio">Folio 01</span>
        <h1 className="ledger-head__title">Add supplier</h1>
      </div>

      <form className="supplier-form" onSubmit={onSubmit}>
        {error ? <p className="form-error">{error}</p> : null}

        <div className="supplier-form__grid">
          <label className="supplier-form__field">
            <span className="supplier-form__label">Name of the supplier *</span>
            <input
              className="ledger-input"
              value={form.name}
              onChange={update('name')}
              required
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">Select photo</span>
            <input
              className="ledger-input supplier-form__input--file"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">Address line *</span>
            <input
              className="ledger-input"
              value={form.addressLine1}
              onChange={update('addressLine1')}
              required
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">Address line 2</span>
            <input
              className="ledger-input"
              value={form.addressLine2}
              onChange={update('addressLine2')}
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">City *</span>
            <input
              className="ledger-input"
              value={form.city}
              onChange={update('city')}
              required
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">State</span>
            <input
              className="ledger-input"
              value={form.state}
              onChange={update('state')}
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">Mobile 1 *</span>
            <input
              className="ledger-input"
              value={form.mobile1}
              onChange={onMobileChange}
              inputMode="numeric"
              required
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">Guarantor (if any)</span>
            <input
              className="ledger-input"
              value={form.guarantorName}
              onChange={update('guarantorName')}
            />
          </label>

          <label className="supplier-form__field">
            <span className="supplier-form__label">Guarantor phone number</span>
            <input
              className="ledger-input"
              value={form.guarantorPhone}
              onChange={update('guarantorPhone')}
            />
          </label>
        </div>

        <button className="btn btn--solid" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save supplier'}
        </button>
      </form>
    </AppLayout>
  )
}

export default function SupplierFormPage() {
  return (
    <ProtectedRoute>
      <SupplierFormInner />
    </ProtectedRoute>
  )
}
