import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import { getJson, postJson, putJson, deleteJson } from '../lib/api'
import { todayIso } from '../lib/dates'
import './ArrivalEntryFormPage.css'

const EMPTY_ITEM = { itemName: '', lotNo: '', nug: '', isCrateForm: false, crateType: '', weight: '' }
const CHARGE_TYPES = ['Freight', 'Labour']

function ArrivalEntryFormInner({ readOnly = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [suppliers, setSuppliers] = useState([])
  const [date, setDate] = useState(todayIso())
  const [arrivalType, setArrivalType] = useState('Party Stock')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [charges, setCharges] = useState(
    Object.fromEntries(CHARGE_TYPES.map((t) => [t, { checked: false, amount: '' }])),
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getJson('/suppliers').then((rows) => setSuppliers(rows)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    getJson(`/arrival-entries/${id}`).then((entry) => {
      setDate(entry.date.slice(0, 10))
      setArrivalType(entry.arrivalType)
      setVehicleNumber(entry.vehicleNumber)
      setSupplierId(String(entry.supplierId))
      setItems(
        entry.items.map((i) => ({
          itemName: i.itemName,
          lotNo: i.lotNo,
          nug: String(i.nug),
          isCrateForm: i.isCrateForm,
          crateType: i.crateType ?? '',
          weight: i.weight != null ? String(i.weight) : '',
        })),
      )
      const chargeState = Object.fromEntries(CHARGE_TYPES.map((t) => [t, { checked: false, amount: '' }]))
      for (const c of entry.charges) {
        chargeState[c.chargeType] = { checked: true, amount: String(c.amount) }
      }
      setCharges(chargeState)
    })
  }, [id])

  const updateItem = (index, patch) =>
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  const addItemRow = () => setItems((rows) => [...rows, { ...EMPTY_ITEM }])
  const removeItemRow = (index) => setItems((rows) => rows.filter((_, i) => i !== index))

  const onSave = async () => {
    setError('')
    setBusy(true)
    try {
      const payload = {
        date,
        arrivalType,
        vehicleNumber,
        supplierId: Number(supplierId),
        items: items
          .filter((row) => row.itemName.trim() && row.lotNo.trim())
          .map((row) => ({
            itemName: row.itemName.trim(),
            lotNo: row.lotNo.trim(),
            nug: Number(row.nug) || 0,
            isCrateForm: row.isCrateForm,
            crateType: row.isCrateForm ? row.crateType.trim() || undefined : undefined,
            weight: row.weight !== '' ? Number(row.weight) : undefined,
          })),
        charges: Object.entries(charges)
          .filter(([, v]) => v.checked && v.amount !== '')
          .map(([chargeType, v]) => ({ chargeType, amount: Number(v.amount) })),
      }

      if (isEdit) {
        await putJson(`/arrival-entries/${id}`, payload)
      } else {
        await postJson('/arrival-entries', payload)
      }
      navigate('/app/arrival-book')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async () => {
    if (!window.confirm('Delete this arrival entry? This cannot be undone.')) return
    setBusy(true)
    setError('')
    try {
      await deleteJson(`/arrival-entries/${id}`)
      navigate('/app/arrival-book')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppLayout>
      <div className="ledger-head">
        <span className="ledger-head__folio">Folio 02</span>
        <h1 className="ledger-head__title">
          {readOnly ? 'Arrival entry' : isEdit ? 'Edit arrival entry' : 'New arrival entry'}
        </h1>
        <div className="arrival-form__actions">
          {!readOnly ? (
            <button className="btn btn--solid" type="button" onClick={onSave} disabled={busy}>
              Save
            </button>
          ) : null}
          {!readOnly && isEdit ? (
            <button className="btn" type="button" onClick={onDelete} disabled={busy}>
              Delete
            </button>
          ) : null}
          <button className="btn" type="button" onClick={() => navigate('/app/arrival-book')}>
            Close
          </button>
          <button className="btn" type="button" disabled title="PDF export not implemented yet">
            Print
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="arrival-form__grid">
        <label className="arrival-form__field">
          <span className="arrival-form__label">Date</span>
          <input
            className="ledger-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={readOnly}
          />
        </label>

        <label className="arrival-form__field">
          <span className="arrival-form__label">Arrival type</span>
          <select
            className="ledger-input"
            value={arrivalType}
            onChange={(e) => setArrivalType(e.target.value)}
            disabled={readOnly}
          >
            <option>Party Stock</option>
            <option>Self Purchase</option>
          </select>
        </label>

        <label className="arrival-form__field">
          <span className="arrival-form__label">Vehicle number</span>
          <input
            className="ledger-input"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            disabled={readOnly}
          />
        </label>

        <label className="arrival-form__field">
          <span className="arrival-form__label">Supplier name</span>
          <select
            className="ledger-input"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            disabled={readOnly}
          >
            <option value="">Select supplier…</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="sub-head">Item table</p>
      <div className="table-scroll">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Item name</th>
              <th>Lot no. / variety</th>
              <th>Nug</th>
              <th>Crate form</th>
              <th>Weight</th>
              {!readOnly ? <th></th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    className="ledger-input"
                    value={row.itemName}
                    onChange={(e) => updateItem(index, { itemName: e.target.value })}
                    disabled={readOnly}
                  />
                </td>
                <td>
                  <input
                    className="ledger-input"
                    value={row.lotNo}
                    onChange={(e) => updateItem(index, { lotNo: e.target.value })}
                    disabled={readOnly}
                  />
                </td>
                <td>
                  <input
                    className="ledger-input"
                    type="number"
                    value={row.nug}
                    onChange={(e) => updateItem(index, { nug: e.target.value })}
                    disabled={readOnly}
                  />
                </td>
                <td className="arrival-form__crate-cell">
                  <label className="arrival-form__checkbox">
                    <input
                      type="checkbox"
                      checked={row.isCrateForm}
                      onChange={(e) => updateItem(index, { isCrateForm: e.target.checked })}
                      disabled={readOnly}
                    />
                    Crate form
                  </label>
                  {row.isCrateForm ? (
                    <input
                      className="ledger-input"
                      placeholder="Crate type"
                      value={row.crateType}
                      onChange={(e) => updateItem(index, { crateType: e.target.value })}
                      disabled={readOnly}
                    />
                  ) : null}
                </td>
                <td>
                  <input
                    className="ledger-input"
                    type="number"
                    value={row.weight}
                    onChange={(e) => updateItem(index, { weight: e.target.value })}
                    disabled={readOnly}
                  />
                </td>
                {!readOnly ? (
                  <td>
                    <button
                      className="arrival-form__remove-row"
                      type="button"
                      onClick={() => removeItemRow(index)}
                      disabled={items.length === 1}
                    >
                      ×
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly ? (
        <button className="btn" type="button" onClick={addItemRow}>
          + Add item
        </button>
      ) : null}

      <p className="sub-head">Other charges</p>
      <div className="arrival-form__charges">
        {CHARGE_TYPES.map((type) => (
          <label key={type} className="arrival-form__charge-row">
            <input
              type="checkbox"
              checked={charges[type].checked}
              onChange={(e) =>
                setCharges((c) => ({ ...c, [type]: { ...c[type], checked: e.target.checked } }))
              }
              disabled={readOnly}
            />
            {type}
            <input
              className="ledger-input"
              type="number"
              placeholder="Amount"
              value={charges[type].amount}
              onChange={(e) => setCharges((c) => ({ ...c, [type]: { ...c[type], amount: e.target.value } }))}
              disabled={readOnly || !charges[type].checked}
            />
          </label>
        ))}
      </div>
    </AppLayout>
  )
}

export default function ArrivalEntryFormPage({ readOnly = false }) {
  return (
    <ProtectedRoute>
      <ArrivalEntryFormInner readOnly={readOnly} />
    </ProtectedRoute>
  )
}
