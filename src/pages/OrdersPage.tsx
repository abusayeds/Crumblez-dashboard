import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import {
  alert,
  btnDanger,
  btnGhost,
  input,
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

type Order = {
  id: number
  orderNumber: string
  status: string
  fulfillmentType: string
  customerName: string
  customerPhone: string
  total: string | number
  rewardsEarned: number
  streetAddress?: string | null
  pickupLocation?: string | null
  createdAt: string
  driver?: { id: number; name: string } | null
  items: Array<{ name: string; quantity: number }>
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  async function load() {
    const data = await api<Order[]>('/orders')
    setOrders(data)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function updateStatus(id: number, status: string) {
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete(id: number, orderNumber: string) {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return
    try {
      await api(`/orders/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Orders</h2>
          <p className={`m-0 ${muted}`}>
            Open a delivery order with View to assign a driver for tracking.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Incoming orders</h3>
        </div>
        <div className={panelBody}>
          {orders.length === 0 ? (
            <p className={muted}>No orders yet.</p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Type</th>
                  <th className={th}>Total</th>
                  <th className={th}>Status</th>
                  <th className={th}>Driver</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className={td}>
                      <Link className="font-bold text-blue" to={`/orders/${order.id}`}>
                        {order.orderNumber}
                      </Link>
                      <small>
                        {order.items.map((i) => `${i.name}×${i.quantity}`).join(', ')}
                      </small>
                    </td>
                    <td className={td}>
                      {order.customerName}
                      <br />
                      {order.customerPhone}
                    </td>
                    <td className={td}>
                      {order.fulfillmentType}
                      <br />
                      <small>
                        {order.fulfillmentType === 'pickup'
                          ? order.pickupLocation
                          : order.streetAddress}
                      </small>
                    </td>
                    <td className={td}>
                      ${Number(order.total).toFixed(2)}
                      {order.rewardsEarned ? (
                        <>
                          <br />
                          <small>+{order.rewardsEarned} pts</small>
                        </>
                      ) : null}
                    </td>
                    <td className={td}>{order.status}</td>
                    <td className={td}>
                      {order.fulfillmentType === 'pickup'
                        ? 'Pickup — no driver'
                        : order.driver?.name || 'Unassigned'}
                    </td>
                    <td className={`${td} ${rowActions}`}>
                      <Link className={btnGhost} to={`/orders/${order.id}`}>
                        View
                      </Link>
                      <button
                        type="button"
                        className={btnDanger}
                        onClick={() => onDelete(order.id, order.orderNumber)}
                      >
                        Delete
                      </button>
                      <select
                        className={input}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
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
