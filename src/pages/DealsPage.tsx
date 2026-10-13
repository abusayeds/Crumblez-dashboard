import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, fileUrl } from '../lib/api'
import type { Deal } from '../lib/types'
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

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [error, setError] = useState('')

  async function load() {
    setDeals(await api<Deal[]>('/deals?all=true'))
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  // The backend clears the slot on every other deal, so a reload always shows
  // exactly one deal per slot.
  async function toggleSlot(deal: Deal, slot: 'showOnHome' | 'isFeatured') {
    try {
      await api(`/deals/${deal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [slot]: !deal[slot] }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this deal?')) return
    try {
      await api(`/deals/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Deals</h2>
          <p className={`m-0 ${muted}`}>Bundle products with one deal price.</p>
        </div>
        <div className={actions}>
          <Link to="/deals/new">
            <button className={btn} type="button">
              Create deal
            </button>
          </Link>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>All deals</h3>
        </div>
        <div className={panelBody}>
          {deals.length === 0 ? (
            <p className={muted}>
              No deals yet. Create Jonathan&apos;s packages here.
            </p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Deal</th>
                  <th className={th}>Price</th>
                  <th className={th}>Products</th>
                  <th className={th}>Home</th>
                  <th className={th}>Featured</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td className={td}>
                      <div className="flex items-center gap-[0.65rem]">
                        {deal.imageUrl ? (
                          <img
                            className={thumb}
                            src={fileUrl(deal.imageUrl)}
                            alt=""
                          />
                        ) : (
                          <span className={thumbFallback}>Bundle</span>
                        )}
                        <span>{deal.name}</span>
                      </div>
                    </td>
                    <td className={td}>${Number(deal.price).toFixed(2)}</td>
                    <td className={td}>
                      {deal.items
                        .map((item) => item.product?.name || `#${item.productId}`)
                        .join(' + ')}
                    </td>
                    <td className={td}>
                      <button
                        type="button"
                        className={deal.showOnHome ? btn : btnGhost}
                        onClick={() => toggleSlot(deal, 'showOnHome')}
                      >
                        {deal.showOnHome ? 'On home' : 'Set as home'}
                      </button>
                    </td>
                    <td className={td}>
                      <button
                        type="button"
                        className={deal.isFeatured ? btn : btnGhost}
                        onClick={() => toggleSlot(deal, 'isFeatured')}
                      >
                        {deal.isFeatured ? 'Featured' : 'Set featured'}
                      </button>
                    </td>
                    <td className={`${td} ${rowActions}`}>
                      <Link to={`/deals/${deal.id}/edit`}>
                        <button type="button" className={btnGhost}>
                          Edit
                        </button>
                      </Link>
                      <button
                        type="button"
                        className={btnDanger}
                        onClick={() => onDelete(deal.id)}
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
