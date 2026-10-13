import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { LegalPage } from '../lib/types'
import { legalPagePath } from '../lib/legalPages'
import {
  actions,
  alert,
  btn,
  btnDanger,
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

export function LegalPagesPage() {
  const [items, setItems] = useState<LegalPage[]>([])
  const [error, setError] = useState('')

  async function load() {
    setItems(await api<LegalPage[]>('/legal-pages?all=true'))
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onDelete(id: number) {
    if (!confirm('Delete this page? The storefront link will stop working.')) return
    try {
      await api(`/legal-pages/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Legal Pages</h2>
          <p className={`m-0 ${muted}`}>
            Privacy, Terms of Use, Accessibility Policy and Do Not Sell. Content,
            fonts, colors and layout are all editable.
          </p>
        </div>
        <div className={actions}>
          <Link to="/legal-pages/new">
            <button className={btn} type="button">
              Create page
            </button>
          </Link>
        </div>
      </div>

      {error ? <div className={alert}>{error}</div> : null}

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>All pages</h3>
        </div>
        <div className={panelBody}>
          {items.length === 0 ? (
            <p className={muted}>No pages yet. Create one to get started.</p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Title</th>
                  <th className={th}>Storefront URL</th>
                  <th className={th}>Status</th>
                  <th className={th}>Updated</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className={td}>{item.title}</td>
                    <td className={td}>
                      <code className="text-[0.8rem] text-muted">
                        {legalPagePath(item.slug)}
                      </code>
                    </td>
                    <td className={td}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </td>
                    <td className={td}>
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className={`${td} ${rowActions}`}>
                      <Link to={`/legal-pages/${item.id}/edit`}>
                        <button className={btnGhost} type="button">
                          Edit
                        </button>
                      </Link>
                      <button
                        className={btnDanger}
                        onClick={() => onDelete(item.id)}
                        type="button"
                      >
                        Delete
                      </button>
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
