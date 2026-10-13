import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Category, Deal, Product } from '../lib/types'
import { MonthlyOrdersChart } from '../components/MonthlyOrdersChart'
import {
  alert,
  label as labelClass,
  muted,
  pageIntro,
  pageIntroTitle,
  statCard,
  statGrid,
} from '../lib/ui'

export function OverviewPage() {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    deals: 0,
    orders: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api<Category[]>('/categories?all=true'),
      api<Product[]>('/products?all=true'),
      api<Deal[]>('/deals?all=true'),
      api<unknown[]>('/orders'),
    ])
      .then(([categories, products, deals, orders]) => {
        setStats({
          categories: categories.length,
          products: products.length,
          deals: deals.length,
          orders: orders.length,
        })
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Overview</h2>
          <p className={`m-0 ${muted}`}>
            Quick view of Crumblez Smoke Shop catalog and homepage content.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <div className={statGrid}>
        {[
          { label: 'Categories', value: stats.categories },
          { label: 'Products', value: stats.products },
          { label: 'Deals', value: stats.deals },
          { label: 'Orders', value: stats.orders },
        ].map((stat) => (
          <div key={stat.label} className={statCard}>
            <label className={`${labelClass} mb-[0.4rem]`}>{stat.label}</label>
            <strong className="text-[1.5rem] text-blue-dark">
              {stat.value}
            </strong>
          </div>
        ))}
      </div>
      <MonthlyOrdersChart />
    </div>
  )
}
