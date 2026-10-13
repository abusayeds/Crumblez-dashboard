import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import {
  alert,
  btn,
  input,
  label as labelClass,
  muted,
  pageIntro,
  pageIntroTitle,
  panel,
  panelBody,
  panelHeader,
  panelTitle,
} from '../lib/ui'

type DeliveryStatus =
  | 'received'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'

type DriverDelivery = {
  orderId: string
  orderNumber: string
  customerName: string
  customerAddress: string
  customerPhone?: string
  items: Array<{ name: string; quantity: number }>
  status: DeliveryStatus
  distanceMiles?: number
  estimatedMinutes?: number
  currentDeliveryNumber?: number
}

const STAGES: DeliveryStatus[] = [
  'received',
  'preparing',
  'out_for_delivery',
  'delivered',
]

const STAGE_LABELS: Record<DeliveryStatus, string> = {
  received: 'Received',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
}

export function DriverDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const data = await api<DriverDelivery[]>('/driver/deliveries')
    setDeliveries(data)
  }, [])

  useEffect(() => {
    load().catch((err) => setError(err.message))
    const id = window.setInterval(() => {
      load().catch(() => null)
    }, 30_000)
    return () => window.clearInterval(id)
  }, [load])

  async function updateDelivery(
    orderId: string,
    updates: Partial<
      Pick<
        DriverDelivery,
        | 'status'
        | 'distanceMiles'
        | 'estimatedMinutes'
        | 'currentDeliveryNumber'
      >
    >,
  ) {
    setError('')
    try {
      await api(`/driver/deliveries/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
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
          <h2 className={pageIntroTitle}>My deliveries</h2>
          <p className={`m-0 ${muted}`}>
            Only orders assigned to you. Save distance, ETA, and queue number so
            the customer can see them on Track Order.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}

      {deliveries.length === 0 && !error ? (
        <section className={panel}>
          <div className={panelBody}>
            <p className={muted}>No deliveries assigned to you right now.</p>
          </div>
        </section>
      ) : null}

      {deliveries.map((delivery) => (
        <DeliveryCard
          key={delivery.orderId}
          delivery={delivery}
          onUpdate={updateDelivery}
        />
      ))}
    </div>
  )
}

function DeliveryCard({
  delivery,
  onUpdate,
}: {
  delivery: DriverDelivery
  onUpdate: (
    orderId: string,
    updates: Partial<
      Pick<
        DriverDelivery,
        | 'status'
        | 'distanceMiles'
        | 'estimatedMinutes'
        | 'currentDeliveryNumber'
      >
    >,
  ) => void
}) {
  const [distance, setDistance] = useState(
    delivery.distanceMiles?.toString() || '',
  )
  const [eta, setEta] = useState(delivery.estimatedMinutes?.toString() || '')
  const [queueNum, setQueueNum] = useState(
    delivery.currentDeliveryNumber?.toString() || '',
  )
  const delivered = delivery.status === 'delivered'

  return (
    <section className={`${panel} ${delivered ? 'opacity-60' : ''}`}>
      <div className={panelHeader}>
        <h3 className={panelTitle}>Order {delivery.orderNumber}</h3>
        <span className="text-sm font-bold text-blue-dark">
          {STAGE_LABELS[delivery.status]}
        </span>
      </div>
      <div className={panelBody}>
        <p className="m-0 font-semibold">
          {delivery.customerName}
          {delivery.customerPhone ? ` · ${delivery.customerPhone}` : ''}
        </p>
        <p className={`m-0 mt-1 ${muted}`}>
          {delivery.customerAddress || 'No address'}
        </p>
        <p className={`m-0 mt-2 ${muted}`}>
          {delivery.items
            .map((item) => `${item.quantity}× ${item.name}`)
            .join(' · ')}
        </p>

        {!delivered ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className={labelClass}>
                Distance (miles)
                <input
                  className={input}
                  type="number"
                  min="0"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </label>
              <label className={labelClass}>
                ETA (minutes)
                <input
                  className={input}
                  type="number"
                  min="0"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                />
              </label>
              <label className={labelClass}>
                Queue position
                <input
                  className={input}
                  type="number"
                  min="1"
                  value={queueNum}
                  onChange={(e) => setQueueNum(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className={btn}
                type="button"
                onClick={() =>
                  onUpdate(delivery.orderId, {
                    distanceMiles: distance ? parseFloat(distance) : undefined,
                    estimatedMinutes: eta ? parseInt(eta, 10) : undefined,
                    currentDeliveryNumber: queueNum
                      ? parseInt(queueNum, 10)
                      : undefined,
                  })
                }
              >
                Save info
              </button>
              {delivery.status !== 'out_for_delivery' ? (
                <button
                  className={btn}
                  type="button"
                  onClick={() => {
                    const idx = STAGES.indexOf(delivery.status)
                    if (idx < STAGES.length - 1) {
                      onUpdate(delivery.orderId, { status: STAGES[idx + 1] })
                    }
                  }}
                >
                  Next stage
                </button>
              ) : (
                <button
                  className="cursor-pointer rounded-full border-none bg-success px-[1.15rem] py-[0.7rem] font-bold text-white"
                  type="button"
                  onClick={() =>
                    onUpdate(delivery.orderId, { status: 'delivered' })
                  }
                >
                  Mark delivered
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
