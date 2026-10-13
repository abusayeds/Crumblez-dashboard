import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Customer } from '../lib/types'
import {
  alert,
  muted,
  pageIntro,
  pageIntroTitle,
  panel,
  panelBody,
  panelHeader,
  panelTitle,
  table,
  td,
  th,
} from '../lib/ui'

export function UsersPage() {
  const [items, setItems] = useState<Customer[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api<Customer[]>('/users')
      .then(setItems)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Customers</h2>
          <p className={`m-0 ${muted}`}>
            Optional customer accounts used for rewards points.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Registered customers</h3>
        </div>
        <div className={panelBody}>
          {items.length === 0 ? (
            <p className={muted}>No customer accounts yet.</p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Email</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Points</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className={td}>{item.name}</td>
                    <td className={td}>{item.email}</td>
                    <td className={td}>{item.phone}</td>
                    <td className={td}>{item.rewardsPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
