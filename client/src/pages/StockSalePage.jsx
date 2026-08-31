import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import SearchableSelect from '../components/SearchableSelect'
import { getJson, postJson, putJson, deleteJson } from '../lib/api'
import { todayIso } from '../lib/dates'
import './StockSalePage.css'

function StockSaleInner() {
  const [date, setDate] = useState(todayIso())
  const [suppliers, setSuppliers] = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [lots, setLots] = useState([])
  const [itemName, setItemName] = useState('')
  const [arrivalItemId, setArrivalItemId] = useState('')
  const [customerName, setCustomerName] = useState('Cash')
  const [nug, setNug] = useState('')
  const [weight, setWeight] = useState('')
  const [unitType, setUnitType] = useState('Nug')
  const [customerRate, setCustomerRate] = useState('')
  const [supplierRate, setSupplierRate] = useState('')
  const [addedRows, setAddedRows] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showCommissionPanel, setShowCommissionPanel] = useState(false)
  const [settings, setSettings] = useState(null)
  const [settingsDraft, setSettingsDraft] = useState(null)

  // Block bodies on purpose, even though these could be one-line expressions:
  // an arrow function with an expression body implicitly *returns* the
  // promise chain, and passed straight to useEffect that return value gets
  // treated as a cleanup function — "destroy is not a function" the moment
  // React tries to call it. Braces make the function return undefined.
  const reloadSettings = () => {
    getJson('/commission-settings').then(setSettings).catch(() => {})
  }

  const reloadSuppliers = () => {
    getJson(`/stock-sales/suppliers-on-date?date=${date}`).then(setSuppliers).catch(() => {})
  }

  const reloadLots = () => {
    if (!supplierId) {
      setLots([])
      return
    }
    getJson(`/stock-sales/lots?date=${date}&supplierId=${supplierId}`)
      .then(setLots)
      .catch(() => {})
  }

  const reloadAddedRows = () => {
    getJson(`/stock-sales?fromDate=${date}&toDate=${date}`).then(setAddedRows).catch(() => {})
  }

  useEffect(reloadSettings, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(reloadSuppliers, [date]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(reloadLots, [date, supplierId]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(reloadAddedRows, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ value: String(s.id), label: s.name })),
    [suppliers],
  )

  const itemOptions = useMemo(() => {
    const names = [...new Set(lots.map((l) => l.itemName))]
    return names.map((n) => ({ value: n, label: n }))
  }, [lots])

  const lotOptions = useMemo(
    () =>
      lots
        .filter((l) => l.itemName === itemName)
        .map((l) => ({ value: String(l.id), label: `${l.lotNo}  (available: ${l.remaining})` })),
    [lots, itemName],
  )

  const selectedLot = lots.find((l) => String(l.id) === arrivalItemId)
  const quantity = unitType === 'Nug' ? Number(nug) || 0 : Number(weight) || 0
  const basicAmount = quantity * (Number(customerRate) || 0)

  // Live preview only — the server recomputes this from whatever
  // CommissionSettings actually holds at save time, so this can never be
  // the value that ends up on the persisted row if it drifts.
  const netAmount = settings
    ? basicAmount +
      (basicAmount * settings.commissionPct) / 100 +
      (basicAmount * settings.marketFeesPct) / 100 +
      (basicAmount * settings.rdfPct) / 100 +
      (Number(nug) || 0) * settings.lagaPerNug
    : basicAmount

  const openCommissionPanel = () => {
    setSettingsDraft(settings)
    setShowCommissionPanel(true)
  }

  const saveCommissionSettings = async () => {
    setBusy(true)
    setError('')
    try {
      const saved = await putJson('/commission-settings', {
        commissionPct: Number(settingsDraft.commissionPct) || 0,
        marketFeesPct: Number(settingsDraft.marketFeesPct) || 0,
        rdfPct: Number(settingsDraft.rdfPct) || 0,
        lagaPerNug: Number(settingsDraft.lagaPerNug) || 0,
      })
      setSettings(saved)
      setShowCommissionPanel(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const resetRow = () => {
    setItemName('')
    setArrivalItemId('')
    setNug('')
    setWeight('')
    setCustomerRate('')
    setSupplierRate('')
  }

  const onAdd = async () => {
    setError('')
    setBusy(true)
    try {
      await postJson('/stock-sales', {
        date,
        arrivalItemId: Number(arrivalItemId),
        customerName: customerName.trim() || 'Cash',
        nug: Number(nug) || 0,
        weight: weight !== '' ? Number(weight) : undefined,
        unitType,
        customerRate: Number(customerRate) || 0,
        supplierRate: Number(supplierRate) || 0,
      })
      resetRow()
      reloadLots()
      reloadAddedRows()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onDeleteRow = async (id) => {
    setBusy(true)
    try {
      await deleteJson(`/stock-sales/${id}`)
      reloadLots()
      reloadAddedRows()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppLayout>
      <div className="ledger-head">
        <span className="ledger-head__folio">Folio 03</span>
        <h1 className="ledger-head__title">Stock sale</h1>
        <button className="btn" type="button" onClick={openCommissionPanel} disabled={!settings}>
          Commission
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {showCommissionPanel && settingsDraft ? (
        <div className="stock-sale__commission-panel">
          <p className="stock-sale__commission-intro">
            These rates apply to every sale from now on, on any date, until you change them again.
            Commission, Market Fees, and R.D.F. are each a % of the Basic Amount; Laga is a flat
            rate per nug. (Bardana isn't wired in yet.)
          </p>
          <div className="stock-sale__commission-grid">
            <label>
              Cm %
              <input
                type="number"
                value={settingsDraft.commissionPct}
                onChange={(e) => setSettingsDraft((s) => ({ ...s, commissionPct: e.target.value }))}
              />
            </label>
            <label>
              Market fees %
              <input
                type="number"
                value={settingsDraft.marketFeesPct}
                onChange={(e) => setSettingsDraft((s) => ({ ...s, marketFeesPct: e.target.value }))}
              />
            </label>
            <label>
              R.D.F %
              <input
                type="number"
                value={settingsDraft.rdfPct}
                onChange={(e) => setSettingsDraft((s) => ({ ...s, rdfPct: e.target.value }))}
              />
            </label>
            <label>
              Laga (₹ / nug)
              <input
                type="number"
                value={settingsDraft.lagaPerNug}
                onChange={(e) => setSettingsDraft((s) => ({ ...s, lagaPerNug: e.target.value }))}
              />
            </label>
          </div>
          <div className="stock-sale__commission-actions">
            <button className="btn btn--solid" type="button" onClick={saveCommissionSettings} disabled={busy}>
              Save
            </button>
            <button className="btn" type="button" onClick={() => setShowCommissionPanel(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="stock-sale__grid">
        <label className="stock-sale__field">
          <span className="stock-sale__label">Date</span>
          <input
            className="ledger-input"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setSupplierId('')
              resetRow()
            }}
          />
        </label>

        <label className="stock-sale__field">
          <span className="stock-sale__label">Supplier name</span>
          <SearchableSelect
            options={supplierOptions}
            value={supplierId}
            onChange={(v) => {
              setSupplierId(v)
              resetRow()
            }}
            placeholder="Search supplier…"
          />
        </label>

        <label className="stock-sale__field">
          <span className="stock-sale__label">Customer name</span>
          <input
            className="ledger-input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Cash"
          />
        </label>

        <label className="stock-sale__field">
          <span className="stock-sale__label">Item name</span>
          <SearchableSelect
            options={itemOptions}
            value={itemName}
            onChange={(v) => {
              setItemName(v)
              setArrivalItemId('')
            }}
            placeholder="Search item…"
            disabled={!supplierId}
          />
        </label>

        <label className="stock-sale__field">
          <span className="stock-sale__label">Lot no. / variety</span>
          <SearchableSelect
            options={lotOptions}
            value={arrivalItemId}
            onChange={setArrivalItemId}
            placeholder="Search lot…"
            disabled={!itemName}
          />
        </label>
      </div>

      <div className="stock-sale__grid">
        <label className="stock-sale__field">
          <span className="stock-sale__label">
            Nug {selectedLot ? `(available: ${selectedLot.remaining})` : ''}
          </span>
          <input
            className="ledger-input"
            type="number"
            value={nug}
            onChange={(e) => setNug(e.target.value)}
            disabled={!arrivalItemId}
          />
        </label>

        <label className="stock-sale__field">
          <span className="stock-sale__label">Weight</span>
          <input
            className="ledger-input"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={!arrivalItemId}
          />
        </label>

        <div className="stock-sale__field">
          <span className="stock-sale__label">Per</span>
          <button
            type="button"
            className="stock-sale__toggle"
            data-on={unitType === 'Weight'}
            onClick={() => setUnitType((u) => (u === 'Nug' ? 'Weight' : 'Nug'))}
            disabled={!arrivalItemId}
          >
            <span>Nug</span>
            <span className="stock-sale__toggle-thumb" />
            <span>Weight</span>
          </button>
        </div>

        <label className="stock-sale__field">
          <span className="stock-sale__label">Customer rate</span>
          <input
            className="ledger-input"
            type="number"
            value={customerRate}
            onChange={(e) => setCustomerRate(e.target.value)}
            disabled={!arrivalItemId}
          />
        </label>

        <label className="stock-sale__field">
          <span className="stock-sale__label">Supplier rate</span>
          <input
            className="ledger-input"
            type="number"
            value={supplierRate}
            onChange={(e) => setSupplierRate(e.target.value)}
            disabled={!arrivalItemId}
          />
        </label>
      </div>

      <div className="stock-sale__grid">
        <div className="stock-sale__field">
          <span className="stock-sale__label">Basic amount</span>
          <p className="stock-sale__amount">₹{basicAmount.toFixed(2)}</p>
        </div>
        <div className="stock-sale__field">
          <span className="stock-sale__label">Net amount</span>
          <p className="stock-sale__amount">₹{netAmount.toFixed(2)}</p>
        </div>
        <div className="stock-sale__field stock-sale__add-cell">
          <button
            className="btn btn--solid"
            type="button"
            onClick={onAdd}
            disabled={busy || !arrivalItemId || quantity <= 0}
          >
            Add
          </button>
          <button className="btn" type="button" onClick={resetRow} disabled={busy}>
            Clear
          </button>
        </div>
      </div>

      <p className="sub-head">Today's stock sale</p>
      <div className="table-scroll">
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Item name</th>
              <th>Customer</th>
              <th>Lot</th>
              <th>Nug</th>
              <th>Kg</th>
              <th>Price</th>
              <th>Per</th>
              <th>Basic</th>
              <th>Net amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {addedRows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.arrivalItem.itemName}</td>
                <td>{row.customerName}</td>
                <td className="cell-figure">{row.arrivalItem.lotNo}</td>
                <td className="cell-figure">{row.nug}</td>
                <td className="cell-figure">{row.weight ?? '—'}</td>
                <td className="cell-figure">{row.customerRate}</td>
                <td>{row.unitType}</td>
                <td className="cell-figure">{row.basicAmount.toFixed(2)}</td>
                <td className="cell-figure">{row.netAmount.toFixed(2)}</td>
                <td>
                  <button
                    className="stock-sale__delete-row"
                    type="button"
                    onClick={() => onDeleteRow(row.id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}

export default function StockSalePage() {
  return (
    <ProtectedRoute>
      <StockSaleInner />
    </ProtectedRoute>
  )
}
