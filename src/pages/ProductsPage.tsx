import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fileUrl } from '../lib/api'
import type { Product } from '../lib/types'
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
  thumbFallback,
} from '../lib/ui'

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [error, setError] = useState('')

  async function load() {
    setItems(await api<Product[]>('/products?all=true'))
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onDelete(id: number) {
    if (!confirm('Delete this product?')) return
    try {
      await api(`/products/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Products</h2>
          <p className={`m-0 ${muted}`}>
            Manage name, price, image, category, stock, and flavors.
          </p>
        </div>
        <div className={actions}>
          <Link to="/products/new">
            <button className={btn} type="button">
              Create product
            </button>
          </Link>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>All products</h3>
        </div>
        <div className={panelBody}>
          {items.length === 0 ? (
            <p className={muted}>No products yet. Create one to get started.</p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Category</th>
                  <th className={th}>Price</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Home</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className={td}>
                      <div className="flex items-center gap-[0.65rem]">
                        {item.imageUrl ? (
                          <img
                            className={thumb}
                            src={fileUrl(item.imageUrl)}
                            alt=""
                          />
                        ) : (
                          <span className={thumbFallback}>No img</span>
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className={td}>{item.category?.name}</td>
                    <td className={td}>${Number(item.price).toFixed(2)}</td>
                    <td className={td}>
                      {item.stock === 0 ? 'Out of stock' : item.stock}
                    </td>
                    <td className={td}>{item.showOnHome ? 'Yes' : 'No'}</td>
                    <td className={`${td} ${rowActions}`}>
                      <Link to={`/products/${item.id}/edit`}>
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
