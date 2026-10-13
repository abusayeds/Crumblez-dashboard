import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fileUrl } from '../lib/api'
import type { HomePromo, Product } from '../lib/types'
import { HomePromoPreview } from '../components/HomePromoPreview'
import {
  alert,
  btnGhost,
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
  thumb,
} from '../lib/ui'

export function WhatsNewPage() {
  const [items, setItems] = useState<Product[]>([])
  const [promo, setPromo] = useState<HomePromo | null>(null)
  const [error, setError] = useState('')

  async function load() {
    const products = await api<Product[]>('/products?all=true')
    setItems(products)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
    api<HomePromo>('/home-promo')
      .then(setPromo)
      .catch((err) => setError(err.message))
  }, [])

  async function toggle(product: Product) {
    try {
      await api(`/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ showOnHome: !product.showOnHome }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>What&apos;s New</h2>
          <p className={`m-0 ${muted}`}>
            Toggle which products appear on the homepage What&apos;s New section.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Homepage banner</h3>
          <Link className={btnGhost} to="/whats-new/banner">
            Edit banner
          </Link>
        </div>
        <div className={panelBody}>
          {promo ? (
            <>
              <HomePromoPreview promo={promo} />
              {!promo.isActive ? (
                <p className={`mb-0 mt-[0.7rem] ${muted}`}>
                  Hidden on the homepage right now.
                </p>
              ) : null}
            </>
          ) : (
            <p className={`m-0 ${muted}`}>Loading banner…</p>
          )}
        </div>
      </section>
      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Homepage featured products</h3>
        </div>
        <div className={panelBody}>
          <table className={table}>
            <thead>
              <tr>
                <th className={th}>Product</th>
                <th className={th}>Category</th>
                <th className={th}>On homepage</th>
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
                      ) : null}
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className={td}>{item.category?.name}</td>
                  <td className={td}>{item.showOnHome ? 'Yes' : 'No'}</td>
                  <td className={td}>
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => toggle(item)}
                    >
                      {item.showOnHome ? 'Remove from home' : 'Show on home'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
