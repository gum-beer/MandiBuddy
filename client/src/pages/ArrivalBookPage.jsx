import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import DateRangeFilter from '../components/DateRangeFilter'
import StatStrip from '../components/StatStrip'
import { getJson } from '../lib/api'
import { todayIso } from '../lib/dates'
import './ArrivalBookPage.css'

function entryTotals(entry) {
  const nug = entry.items.reduce((sum, i) => sum + i.nug, 0)
  const sold = entry.items.reduce(
    (sum, i) => sum + i.stockSales.reduce((s, x) => s + x.nug, 0),
    0,
  )
  return { nug, sold, bal: nug - sold }
}

function ArrivalBookInner() {
  const [fromDate, setFromDate] = useState(todayIso())
  const [toDate, setToDate] = useState(todayIso())
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    getJson(`/arrival-entries?fromDate=${fromDate}&toDate=${toDate}`)
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const t = entryTotals(entry)
        return {
          count: acc.count + 1,
          nug: acc.nug + t.nug,
          sold: acc.sold + t.sold,
          bal: acc.bal + t.bal,
        }
      },
      { count: 0, nug: 0, sold: 0, bal: 0 },
    )
  }, [entries])

  return (
    <AppLayout>
      <div className="ledger-head">
        <span className="ledger-head__folio">Folio 02</span>
        <h1 className="ledger-head__title">Arrival book</h1>
        <Link className="btn btn--solid" to="/app/arrival-entries/new">
          + New entry
        </Link>
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
                  <th>Veh. no.</th>
                  <th>Party name</th>
                  <th>Nug</th>
                  <th>Sold</th>
                  <th>Bal</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const t = entryTotals(entry)
                  return (
                    <tr key={entry.id}>
                      <td className="cell-figure">{entry.date.slice(0, 10)}</td>
                      <td className="cell-figure">{entry.vehicleNumber}</td>
                      <td>{entry.supplier.name}</td>
                      <td className="cell-figure">{t.nug}</td>
                      <td className="cell-figure">{t.sold}</td>
                      <td className="cell-figure">{t.bal}</td>
                      <td>
                        <span className="arrival-book__status" title="Payment status tracking isn't built yet">
                          Pending
                        </span>
                      </td>
                      <td className="arrival-book__row-actions">
                        <Link to={`/app/arrival-entries/${entry.id}`} title="View" aria-label="View">
                          👁
                        </Link>
                        <Link to={`/app/arrival-entries/${entry.id}/edit`} title="Edit" aria-label="Edit">
                          ✎
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <StatStrip
            items={[
              { label: 'Count #', value: totals.count },
              { label: 'Total nug', value: totals.nug },
              { label: 'Sold nug', value: totals.sold },
              { label: 'Balance nug', value: totals.bal },
            ]}
          />
        </>
      ) : null}
    </AppLayout>
  )
}

export default function ArrivalBookPage() {
  return (
    <ProtectedRoute>
      <ArrivalBookInner />
    </ProtectedRoute>
  )
}
