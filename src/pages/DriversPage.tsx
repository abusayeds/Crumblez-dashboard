import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../lib/api'
import {
  actions,
  alert,
  btn,
  btnDanger,
  btnGhost,
  formGrid,
  input,
  label as labelClass,
  muted,
  pageIntro,
  pageIntroTitle,
  panel,
  panelBody,
  panelHeader,
  panelTitle,
  success,
  table,
  td,
  th,
} from '../lib/ui'

type Driver = {
  id: number
  name: string
  email: string
  phone: string
  createdAt: string
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
}

export function DriversPage() {
  const [items, setItems] = useState<Driver[]>([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetId, setResetId] = useState<number | null>(null)
  const [resetPassword, setResetPassword] = useState('')

  async function load() {
    const data = await api<Driver[]>('/users/drivers')
    setItems(data)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api('/users/drivers', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm(emptyForm)
      setNotice(
        'Driver created. They sign in on this same dashboard page with that email and password.',
      )
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  async function onResetPassword(id: number) {
    if (!resetPassword.trim() || resetPassword.trim().length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    setError('')
    setNotice('')
    try {
      await api(`/users/drivers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ password: resetPassword.trim() }),
      })
      setResetId(null)
      setResetPassword('')
      setNotice('Password updated. Give the new password to the driver.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete(driver: Driver) {
    if (
      !confirm(
        `Delete driver ${driver.name} (${driver.email})? Assigned orders will become unassigned.`,
      )
    ) {
      return
    }
    setError('')
    setNotice('')
    try {
      await api(`/users/drivers/${driver.id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Drivers</h2>
          <p className={`m-0 ${muted}`}>
            Create logins here. Drivers use this same dashboard sign-in page —
            after login they only see <strong>My deliveries</strong>, not
            products or settings.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      {notice ? <div className={success}>{notice}</div> : null}

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Add driver</h3>
        </div>
        <form className={panelBody} onSubmit={onCreate}>
          <div className={formGrid}>
            <label className={labelClass}>
              Name
              <input
                className={input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className={labelClass}>
              Email (login)
              <input
                className={input}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className={labelClass}>
              Phone
              <input
                className={input}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </label>
            <label className={labelClass}>
              Password
              <input
                className={input}
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </label>
          </div>
          <div className={`${actions} mt-4`}>
            <button className={btn} type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Create driver'}
            </button>
          </div>
        </form>
      </section>

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Driver accounts ({items.length})</h3>
        </div>
        <div className={panelBody}>
          {items.length === 0 ? (
            <p className={muted}>No drivers yet. Create one above.</p>
          ) : (
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Email</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Password</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className={td}>{item.name}</td>
                    <td className={td}>{item.email}</td>
                    <td className={td}>{item.phone}</td>
                    <td className={td}>
                      {resetId === item.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className={input}
                            type="password"
                            placeholder="New password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className={btn}
                            onClick={() => onResetPassword(item.id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            onClick={() => {
                              setResetId(null)
                              setResetPassword('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={btnGhost}
                          onClick={() => {
                            setResetId(item.id)
                            setResetPassword('')
                          }}
                        >
                          Reset password
                        </button>
                      )}
                    </td>
                    <td className={td}>
                      <button
                        type="button"
                        className={btnDanger}
                        onClick={() => onDelete(item)}
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
