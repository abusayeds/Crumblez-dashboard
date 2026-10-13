import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import {
  actions,
  alert,
  btn,
  btnGhost,
  muted,
  pageIntro,
  pageIntroTitle,
  panel,
  panelBody,
  panelHeader,
  panelTitle,
  rowActions,
  table,
  td,
  th,
} from '../lib/ui'

type ManagementItem = {
  id: number
  type: string
  description: string
}

export function ManagementPage() {
  const [items, setItems] = useState<ManagementItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api<{ data?: ManagementItem[] } | ManagementItem[]>('/management')
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || []
        setItems(list)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Legal pages</h2>
          <p className={`m-0 ${muted}`}>About, terms, and privacy content.</p>
        </div>
        <div className={actions}>
          <Link to="/management/new">
            <button className={btn} type="button">
              Create / update page
            </button>
          </Link>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Current pages</h3>
        </div>
        <div className={panelBody}>
          {items.length === 0 ? (
            <p className={muted}>No legal pages yet.</p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Type</th>
                  <th className={th}>Content</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className={td}>{item.type}</td>
                    <td className={td}>{item.description.slice(0, 120)}…</td>
                    <td className={`${td} ${rowActions}`}>
                      <Link to={`/management/${item.type}/edit`}>
                        <button type="button" className={btnGhost}>
                          Edit
                        </button>
                      </Link>
                    </td>
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
