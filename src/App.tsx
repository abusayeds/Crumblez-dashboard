import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './layouts/DashboardLayout'
import { api, getToken } from './lib/api'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryFormPage } from './pages/CategoryFormPage'
import { DealFormPage } from './pages/DealFormPage'
import { DealsPage } from './pages/DealsPage'
import { LegalPageFormPage } from './pages/LegalPageFormPage'
import { LegalPagesPage } from './pages/LegalPagesPage'
import { LoginPage } from './pages/LoginPage'
import { ManagementFormPage } from './pages/ManagementFormPage'
import { ManagementPage } from './pages/ManagementPage'
import { DriversPage } from './pages/DriversPage'
import { DriverDeliveriesPage } from './pages/DriverDeliveriesPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailsPage } from './pages/OrderDetailsPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProductFormPage } from './pages/ProductFormPage'
import { ProductsPage } from './pages/ProductsPage'
import { SettingsPage } from './pages/SettingsPage'
import { UsersPage } from './pages/UsersPage'
import { WhatsNewPage } from './pages/WhatsNewPage'
import { HomePromoFormPage } from './pages/HomePromoFormPage'

type StaffRole = 'admin' | 'driver'

export default function App() {
  const [ready, setReady] = useState(false)
  const [role, setRole] = useState<StaffRole | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }
    api<{ role?: string }>('/auth/me')
      .then((user) => {
        if (user.role === 'admin' || user.role === 'driver') {
          setRole(user.role)
        } else {
          setRole(null)
        }
      })
      .catch(() => setRole(null))
      .finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-muted">
        Loading…
      </div>
    )
  }

  if (!role) {
    return (
      <LoginPage
        onLoggedIn={(nextRole) => {
          setRole(nextRole)
        }}
      />
    )
  }

  if (role === 'driver') {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <DashboardLayout
                role="driver"
                onLogout={() => setRole(null)}
              />
            }
          >
            <Route index element={<DriverDeliveriesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <DashboardLayout role="admin" onLogout={() => setRole(null)} />
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<CategoryFormPage />} />
          <Route path="categories/:id/edit" element={<CategoryFormPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="deals/new" element={<DealFormPage />} />
          <Route path="deals/:id/edit" element={<DealFormPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="whats-new" element={<WhatsNewPage />} />
          <Route path="whats-new/banner" element={<HomePromoFormPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="legal-pages" element={<LegalPagesPage />} />
          <Route path="legal-pages/new" element={<LegalPageFormPage />} />
          <Route path="legal-pages/:id/edit" element={<LegalPageFormPage />} />
          <Route path="management" element={<ManagementPage />} />
          <Route path="management/new" element={<ManagementFormPage />} />
          <Route path="management/:type/edit" element={<ManagementFormPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
