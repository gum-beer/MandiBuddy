import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import DateRangeFilter from '../components/DateRangeFilter'
import StatStrip from '../components/StatStrip'
import { getJson } from '../lib/api'
import { todayIso } from '../lib/dates'

function SaleRegisterInner() {
  const [fromDate, setFromDate] = useState(todayIso())
  const [toDate, setToDate] = useState(todayIso())
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    getJson(`/stock-sales?fromDate=${fromDate}&toDate=${toDate}`)
      .then(setRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          nug: acc.nug + r.nug,
          weight: acc.weight + (r.weight || 0),
          basic: acc.basic + r.basicAmount,
          net: acc.net + r.netAmount,
        }),
        { nug: 0, weight: 0, basic: 0, net: 0 },
      ),
    [rows],
  )

  return (
    <AppLayout>
      <div className="ledger-head">
        <span className="ledger-head__folio">Folio 04</span>
        <h1 className="ledger-head__title">Sale register</h1>
      </div>

      <DateRangeFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onApply={load}
      />

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Loading…</p> : null}

      {!loading && !error ? (
        <>
          <div className="table-scroll">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Seller</th>
                  <th>Item</th>
                  <th>Customer</th>
                  <th>Lot</th>
                  <th>Nug</th>
                  <th>Wt</th>
                  <th>Price</th>
                  <th>Per</th>
                  <th>Basic</th>
                  <th>Net amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-figure">{r.date.slice(0, 10)}</td>
                    <td>{r.arrivalItem.arrivalEntry.supplier.name}</td>
                    <td>{r.arrivalItem.itemName}</td>
                    <td>{r.customerName}</td>
                    <td className="cell-figure">{r.arrivalItem.lotNo}</td>
                    <td className="cell-figure">{r.nug}</td>
                    <td className="cell-figure">{r.weight ?? '—'}</td>
                    <td className="cell-figure">{r.customerRate}</td>
                    <td>{r.unitType}</td>
                    <td className="cell-figure">{r.basicAmount.toFixed(2)}</td>
                    <td className="cell-figure">{r.netAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <StatStrip
            items={[
              { label: 'Total nug', value: totals.nug },
              { label: 'Total kg', value: totals.weight.toFixed(1) },
              { label: 'Basic amt', value: `₹${totals.basic.toFixed(2)}` },
              { label: 'Total amount', value: `₹${totals.net.toFixed(2)}` },
            ]}
          />
        </>
      ) : null}
    </AppLayout>
  )
}

export default function SaleRegisterPage() {
  return (
    <ProtectedRoute>
      <SaleRegisterInner />
    </ProtectedRoute>
  )
}
