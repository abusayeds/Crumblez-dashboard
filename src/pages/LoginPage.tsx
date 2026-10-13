import { useState } from 'react'
import type { FormEvent } from 'react'
import { api, setToken } from '../lib/api'
import { alert, btn, input, label as labelClass, muted } from '../lib/ui'

type Props = {
  onLoggedIn: (role: 'admin' | 'driver') => void
}

export function LoginPage({ onLoggedIn }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api<{
        accessToken: string
        user: { role: string }
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (res.user.role !== 'admin' && res.user.role !== 'driver') {
        throw new Error('Staff account required')
      }
      setToken(res.accessToken)
      onLoggedIn(res.user.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,rgba(190,2,1,0.22),transparent_42%),linear-gradient(180deg,#2a1413,#fbf7f6_55%)] p-6">
      <form
        className="grid w-[min(420px,100%)] gap-[0.85rem] rounded-[18px] border border-border-soft bg-surface p-6 shadow-card"
        onSubmit={onSubmit}
      >
        <div className="flex items-center gap-[0.65rem] px-2 py-[0.35rem]">
          <img
            alt="Crumblez"
            className="size-12 shrink-0 rounded-[12px] object-cover ring-1 ring-[#be0201]/30"
            src="/brand-logo.png"
          />
          <div className="flex flex-col leading-tight">
            <strong>Crumblez Staff</strong>
            <span className="text-[0.72rem] italic opacity-80">
              Crave Different
            </span>
          </div>
        </div>
        <h1 className="m-0 text-[1.4rem] text-blue-dark">Sign in</h1>
        <p className={muted}>
          Admin and drivers use this same page. Drivers only see their
          deliveries after sign-in.
        </p>
        {error ? <div className={alert}>{error}</div> : null}
        <label className={labelClass}>
          Email
          <input
            className={input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={labelClass}>
          Password
          <input
            className={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className={btn} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
