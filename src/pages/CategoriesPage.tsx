import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fileUrl } from '../lib/api'
import type { Category } from '../lib/types'
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
  thumb,
} from '../lib/ui'

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [error, setError] = useState('')

  async function load() {
    const data = await api<Category[]>('/categories?all=true')
    setItems(data)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onDelete(id: number) {
    if (!confirm('Delete this category?')) return
    try {
      await api(`/categories/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Categories</h2>
          <p className={`m-0 ${muted}`}>
            Flower, Disposables, Edibles, Vapes, Extras and more.
          </p>
        </div>
        <div className={actions}>
          <Link to="/categories/new">
            <button className={btn} type="button">
              Create category
            </button>
          </Link>
        </div>
      </div>

      {error ? <div className={alert}>{error}</div> : null}

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>All categories</h3>
        </div>
        <div className={panelBody}>
          {items.length === 0 ? (
            <p className={muted}>No categories yet. Create one to get started.</p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Image</th>
                  <th className={th}>Name</th>
                  <th className={th}>Products</th>
                  <th className={th}>Status</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className={td}>
                      {item.imageUrl ? (
                        <img
                          className={thumb}
                          src={fileUrl(item.imageUrl)}
                          alt=""
                        />
                      ) : (
                        <span className={muted}>No image</span>
                      )}
                    </td>
                    <td className={td}>{item.name}</td>
                    <td className={td}>{item._count?.products ?? 0}</td>
                    <td className={td}>{item.isActive ? 'Active' : 'Hidden'}</td>
                    <td className={`${td} ${rowActions}`}>
                      <Link to={`/categories/${item.id}/edit`}>
                        <button type="button" className={btnGhost}>
                          Edit
                        </button>
                      </Link>
                      <button
                        type="button"
                        className={btnDanger}
                        onClick={() => onDelete(item.id)}
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
