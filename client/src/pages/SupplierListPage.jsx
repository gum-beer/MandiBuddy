import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import { getJson } from '../lib/api'
import { API_BASE_URL } from '../config'
import './SupplierListPage.css'

function SupplierListInner() {
  const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJson('/suppliers')
      .then(setSuppliers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="ledger-head">
        <span className="ledger-head__folio">Folio 01</span>
        <h1 className="ledger-head__title">Suppliers</h1>
        <Link className="btn btn--solid" to="/app/suppliers/new">
          + Add supplier
        </Link>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Loading…</p> : null}

      {!loading && !error && suppliers.length === 0 ? (
        <p className="supplier-list__empty">
          No suppliers yet — add the first one.
        </p>
      ) : null}

      {suppliers.length > 0 ? (
        <div className="table-scroll">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Code</th>
                <th>Name</th>
                <th>Name (Hindi)</th>
                <th>City</th>
                <th>State</th>
                <th>Mobile 1</th>
                <th>Guarantor</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.photoPath ? (
                      <img
                        className="supplier-list__photo"
                        src={`${API_BASE_URL}/uploads/${s.photoPath}`}
                        alt={s.name}
                      />
                    ) : (
                      <span className="supplier-list__photo supplier-list__photo--empty" />
                    )}
                  </td>
                  <td className="cell-figure">{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.nameHindi}</td>
                  <td>{s.city}</td>
                  <td>{s.state}</td>
                  <td className="cell-figure">{s.mobile1}</td>
                  <td>
                    {s.guarantorName
                      ? `${s.guarantorName}${
                          s.guarantorPhone ? ` (${s.guarantorPhone})` : ''
                        }`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AppLayout>
  )
}

export default function SupplierListPage() {
  return (
    <ProtectedRoute>
      <SupplierListInner />
    </ProtectedRoute>
  )
}
