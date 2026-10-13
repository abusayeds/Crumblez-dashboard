import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fileUrl } from '../lib/api'
import {
  alert,
  backLink,
  btnDanger,
  input,
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

// Everything the storefront captured for one order, so the admin never has to
// guess what was bought or where it goes.

type OrderItem = {
  id: number
  name: string
  flavorName?: string | null
  unitPrice: string | number
  quantity: number
  lineTotal: string | number
  product?: {
    id: number
    name: string
    imageUrl?: string | null
    category?: { name: string } | null
  } | null
  deal?: {
    id: number
    name: string
    imageUrl?: string | null
    items: Array<{ quantity: number; product?: { name: string } | null }>
  } | null
}

type OrderDetails = {
  id: number
  orderNumber: string
  status: string
  fulfillmentType: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  addressType?: string | null
  streetAddress?: string | null
  suite?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  pickupLocation?: string | null
  notes?: string | null
  subtotal: string | number
  total: string | number
  rewardsEarned: number
  trackingStage?: string
  driverId?: number | null
  driver?: { id: number; name: string; email: string } | null
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    name: string
    email: string
    phone: string
    rewardsPoints: number
  } | null
  items: OrderItem[]
}

const money = (value: string | number) => `$${Number(value).toFixed(2)}`

const dateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const rowLabel = 'text-[0.78rem] font-bold uppercase tracking-[0.04em] text-muted'

const infoGrid = 'grid grid-cols-1 gap-4 md:grid-cols-2'

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className={rowLabel}>{label}</div>
      <div className="mt-[0.2rem] text-ink">{value?.trim() ? value : '—'}</div>
    </div>
  )
}

export function OrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [drivers, setDrivers] = useState<Array<{ id: number; name: string; email: string }>>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const data = await api<OrderDetails>(`/orders/${id}`)
    setOrder(data)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
    api<Array<{ id: number; name: string; email: string }>>('/orders/drivers')
      .then(setDrivers)
      .catch(() => setDrivers([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function updateStatus(status: string) {
    setSaving(true)
    setError('')
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!order) return
    if (!confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) {
      return
    }
    setSaving(true)
    setError('')
    try {
      await api(`/orders/${order.id}`, { method: 'DELETE' })
      navigate('/orders')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setSaving(false)
    }
  }

  const isDelivery = order?.fulfillmentType === 'delivery'
  const addressLines = order
    ? [
        order.streetAddress,
        order.suite,
        [order.city, order.state, order.zipCode].filter(Boolean).join(', '),
      ].filter((line) => line && line.trim())
    : []

  return (
    <div>
      <Link className={backLink} to="/orders">
        ← Back to orders
      </Link>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>
            {order ? `Order ${order.orderNumber}` : 'Order details'}
          </h2>
          <p className={`m-0 ${muted}`}>
            {order
              ? `Placed ${dateTime(order.createdAt)} · ${order.fulfillmentType}`
              : 'Loading…'}
          </p>
        </div>
        {order ? (
          <label className={rowLabel}>
            Status
            <select
              className={input}
              disabled={saving}
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
        ) : null}
      </div>
      {error ? <div className={alert}>{error}</div> : null}

      {order ? (
        <>
          <section className={panel}>
            <div className={panelHeader}>
              <h3 className={panelTitle}>Customer</h3>
            </div>
            <div className={`${panelBody} ${infoGrid}`}>
              <Field label="Name" value={order.customerName} />
              <Field label="Phone" value={order.customerPhone} />
              <Field label="Email" value={order.customerEmail} />
              <Field
                label="Account"
                value={
                  order.user
                    ? `${order.user.name} (${order.user.email}) · ${order.user.rewardsPoints} pts`
                    : 'Guest checkout'
                }
              />
            </div>
          </section>

          <section className={panel}>
            <div className={panelHeader}>
              <h3 className={panelTitle}>Assign driver (tracking)</h3>
            </div>
            <div className={panelBody}>
              {isDelivery ? (
                <>
                  <p className={`m-0 mb-3 ${muted}`}>
                    Pick a driver so this order shows up in their dashboard
                    under My deliveries. The customer then sees updates on{' '}
                    <strong>/tracker</strong>.
                  </p>
                  <label className={rowLabel}>
                    Driver
                    <select
                      className={input}
                      disabled={saving}
                      value={order.driverId || ''}
                      onChange={async (e) => {
                        const driverId = Number(e.target.value)
                        if (!driverId) return
                        setSaving(true)
                        setError('')
                        try {
                          await api(`/orders/${id}/assign`, {
                            method: 'PATCH',
                            body: JSON.stringify({ driverId }),
                          })
                          await load()
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : 'Assign failed',
                          )
                        } finally {
                          setSaving(false)
                        }
                      }}
                    >
                      <option value="">Unassigned — choose a driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.email})
                        </option>
                      ))}
                    </select>
                  </label>
                  {drivers.length === 0 ? (
                    <p className={`mt-3 mb-0 ${muted}`}>
                      No driver accounts found. Add one under{" "}
                      <strong>Drivers</strong> in the sidebar.
                    </p>
                  ) : order.driver ? (
                    <p className="mt-3 mb-0 text-blue-dark">
                      Assigned to <strong>{order.driver.name}</strong>
                      {order.driver.email ? ` (${order.driver.email})` : ''}.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className={`m-0 ${muted}`}>
                  This is a <strong>pickup</strong> order, so there is no driver
                  to assign. Driver assign only appears on{' '}
                  <strong>delivery</strong> orders.
                </p>
              )}
            </div>
          </section>

          <section className={panel}>
            <div className={panelHeader}>
              <h3 className={panelTitle}>
                {isDelivery ? 'Delivery address' : 'Pickup'}
              </h3>
            </div>
            <div className={`${panelBody} ${infoGrid}`}>
              {isDelivery ? (
                <>
                  <Field label="Address type" value={order.addressType} />
                  <Field
                    label="Address"
                    value={addressLines.join(' · ') || null}
                  />
                </>
              ) : (
                <Field label="Pickup location" value={order.pickupLocation} />
              )}
              <Field label="Notes" value={order.notes} />
            </div>
          </section>

          <section className={panel}>
            <div className={panelHeader}>
              <h3 className={panelTitle}>Items ({order.items.length})</h3>
            </div>
            <div className={panelBody}>
              <table className={table}>
                <thead>
                  <tr>
                    <th className={th}>Item</th>
                    <th className={th}>Type</th>
                    <th className={th}>Unit price</th>
                    <th className={th}>Qty</th>
                    <th className={th}>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const image = item.product?.imageUrl || item.deal?.imageUrl
                    return (
                      <tr key={item.id}>
                        <td className={td}>
                          <div className="flex items-center gap-[0.65rem]">
                            {image ? (
                              <img
                                alt=""
                                className={thumb}
                                src={fileUrl(image)}
                              />
                            ) : null}
                            <div>
                              <div>{item.name}</div>
                              {item.flavorName ? (
                                <small className={muted}>
                                  Flavor: {item.flavorName}
                                </small>
                              ) : null}
                              {/* A deal line is a bundle, so its contents are
                                  spelled out under the line's own name. */}
                              {item.deal?.items?.length ? (
                                <small className={`block ${muted}`}>
                                  Includes:{' '}
                                  {item.deal.items
                                    .map(
                                      (dealItem) =>
                                        `${dealItem.product?.name} ×${dealItem.quantity}`,
                                    )
                                    .join(', ')}
                                </small>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className={td}>
                          {item.deal
                            ? 'Deal'
                            : item.product?.category?.name || 'Product'}
                        </td>
                        <td className={td}>{money(item.unitPrice)}</td>
                        <td className={td}>{item.quantity}</td>
                        <td className={td}>{money(item.lineTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className={panel}>
            <div className={panelHeader}>
              <h3 className={panelTitle}>Totals</h3>
            </div>
            <div className={`${panelBody} ${infoGrid}`}>
              <Field label="Subtotal" value={money(order.subtotal)} />
              <Field label="Total" value={money(order.total)} />
              <Field
                label="Rewards earned"
                value={`${order.rewardsEarned} pts`}
              />
              <Field label="Last updated" value={dateTime(order.updatedAt)} />
            </div>
          </section>

          <section className={panel}>
            <div className={panelHeader}>
              <h3 className={panelTitle}>Delete order</h3>
            </div>
            <div className={panelBody}>
              <p className={`m-0 mb-3 ${muted}`}>
                Permanently remove this order and its line items from the
                dashboard.
              </p>
              <button
                type="button"
                className={btnDanger}
                disabled={saving}
                onClick={onDelete}
              >
                Delete order
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
