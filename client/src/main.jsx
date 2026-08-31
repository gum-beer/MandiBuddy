import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import SupplierListPage from './pages/SupplierListPage'
import SupplierFormPage from './pages/SupplierFormPage'
import ArrivalBookPage from './pages/ArrivalBookPage'
import ArrivalEntryFormPage from './pages/ArrivalEntryFormPage'
import StockSalePage from './pages/StockSalePage'
import SaleRegisterPage from './pages/SaleRegisterPage'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/app/suppliers" element={<SupplierListPage />} />
          <Route path="/app/suppliers/new" element={<SupplierFormPage />} />
          <Route path="/app/arrival-book" element={<ArrivalBookPage />} />
          <Route path="/app/arrival-entries/new" element={<ArrivalEntryFormPage />} />
          <Route path="/app/arrival-entries/:id" element={<ArrivalEntryFormPage readOnly />} />
          <Route path="/app/arrival-entries/:id/edit" element={<ArrivalEntryFormPage />} />
          <Route path="/app/stock-sale" element={<StockSalePage />} />
          <Route path="/app/sale-register" element={<SaleRegisterPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
