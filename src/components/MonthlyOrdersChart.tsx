import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { alert, muted, panel, panelBody, panelHeader, panelTitle } from '../lib/ui'

// Orders per month for the last twelve months, drawn as a column chart. The
// data is grouped here from the orders list, so no extra endpoint is needed.

type Order = {
  id: number
  total: string | number
  createdAt: string
}

type Bucket = {
  key: string
  label: string
  year: number
  orders: number
  revenue: number
}

const MONTHS = 12

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function buildBuckets(orders: Order[]): Bucket[] {
  const now = new Date()
  const buckets: Bucket[] = []
  const index = new Map<string, Bucket>()

  for (let i = MONTHS - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const bucket: Bucket = {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: MONTH_NAMES[date.getMonth()],
      year: date.getFullYear(),
      orders: 0,
      revenue: 0,
    }
    buckets.push(bucket)
    index.set(bucket.key, bucket)
  }

  for (const order of orders) {
    const date = new Date(order.createdAt)
    const bucket = index.get(`${date.getFullYear()}-${date.getMonth()}`)
    if (!bucket) continue
    bucket.orders += 1
    bucket.revenue += Number(order.total) || 0
  }

  return buckets
}

// Round the top of the scale up so the gridlines land on whole numbers.
function axisMax(peak: number) {
  if (peak <= 4) return 4
  const step = Math.pow(10, Math.floor(Math.log10(peak)))
  return Math.ceil(peak / step) * step
}

export function MonthlyOrdersChart() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Order[]>('/orders')
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const buckets = useMemo(() => buildBuckets(orders), [orders])
  const peak = Math.max(...buckets.map((bucket) => bucket.orders), 0)
  const max = axisMax(peak)
  const total = buckets.reduce((sum, bucket) => sum + bucket.orders, 0)
  const revenue = buckets.reduce((sum, bucket) => sum + bucket.revenue, 0)
  const ticks = [max, Math.round((max * 2) / 3), Math.round(max / 3), 0]

  return (
    <section className={panel}>
      <div className={panelHeader}>
        <h3 className={panelTitle}>Orders per month</h3>
        <span className={`text-[0.8rem] ${muted}`}>
          {`Last 12 months · ${total} orders · $${revenue.toFixed(2)}`}
        </span>
      </div>
      <div className={panelBody}>
        {error ? <div className={alert}>{error}</div> : null}
        {loading ? (
          <p className={`m-0 ${muted}`}>Loading chart…</p>
        ) : (
          <div className="flex gap-[0.6rem]">
            <div className="flex h-[240px] flex-col justify-between py-[2px] text-right text-[0.7rem] text-muted">
              {ticks.map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative h-[240px]">
                {/* Gridlines sit behind the columns to read values off the axis. */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {ticks.map((tick) => (
                    <div className="border-t border-border-soft" key={tick} />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-end gap-[0.4rem]">
                  {buckets.map((bucket) => {
                    const height = max ? (bucket.orders / max) * 100 : 0
                    return (
                      <div
                        className="flex h-full flex-1 items-end justify-center"
                        key={bucket.key}
                        title={`${bucket.label} ${bucket.year}: ${bucket.orders} orders · $${bucket.revenue.toFixed(2)}`}
                      >
                        <div
                          className="relative w-full max-w-[38px] rounded-t-[6px] bg-blue transition-[height] duration-300 hover:bg-blue-dark"
                          style={{ height: `${height}%` }}
                        >
                          {bucket.orders > 0 ? (
                            <span className="absolute -top-[18px] left-0 w-full text-center text-[0.7rem] font-bold text-blue-dark">
                              {bucket.orders}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-[0.4rem] flex gap-[0.4rem]">
                {buckets.map((bucket) => (
                  <span
                    className="flex-1 text-center text-[0.7rem] text-muted"
                    key={bucket.key}
                  >
                    {bucket.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
