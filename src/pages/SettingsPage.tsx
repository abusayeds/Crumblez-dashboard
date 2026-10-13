import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../lib/api'
import type { StoreSettings } from '../lib/types'
import {
  actions,
  alert,
  btn,
  formFull,
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
} from '../lib/ui'

const SOCIAL_FIELDS = [
  { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { key: 'twitterUrl', label: 'X (Twitter)', placeholder: 'https://x.com/…' },
  { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@…' },
  { key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
] as const satisfies ReadonlyArray<{
  key: keyof StoreSettings
  label: string
  placeholder: string
}>

const fieldIconBtn =
  'flex h-[1.75rem] w-[1.75rem] cursor-pointer items-center justify-center rounded-[6px] border-0 bg-transparent p-0 text-muted transition-colors hover:bg-black/[0.06] hover:text-blue-dark'

const iconProps = {
  width: 17,
  height: 17,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2.2 12S5.8 5.5 12 5.5 21.8 12 21.8 12 18.2 18.5 12 18.5 2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg {...iconProps}>
      <path d="M10.6 6.7A8.6 8.6 0 0 1 12 6.6c6.2 0 9.8 5.4 9.8 5.4a17 17 0 0 1-2.6 3.2" />
      <path d="M6.4 8.2A16.7 16.7 0 0 0 2.2 12s3.6 5.4 9.8 5.4a9.4 9.4 0 0 0 3.4-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3.5 3.5l17 17" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 5.5l4 4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

export function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [sitePassword, setSitePassword] = useState('')
  const [editingPassword, setEditingPassword] = useState(false)
  const [revealPassword, setRevealPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    const data = await api<StoreSettings>('/admin/settings')
    setSettings(data)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onSaveSettings(e: FormEvent) {
    e.preventDefault()
    if (!settings) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await api('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          storeName: settings.storeName,
          pickupLocation: settings.pickupLocation,
          pickupAddress: settings.pickupAddress,
          rewardsInfo: settings.rewardsInfo,
          rewardsRules: settings.rewardsRules,
          rewardsPointsPerDollar: Number(settings.rewardsPointsPerDollar || 0),
          rewardsPointsPerItem: Number(settings.rewardsPointsPerItem || 2),
          doublePointsDay: Boolean(settings.doublePointsDay),
          facebookUrl: settings.facebookUrl || '',
          instagramUrl: settings.instagramUrl || '',
          twitterUrl: settings.twitterUrl || '',
          tiktokUrl: settings.tiktokUrl || '',
          youtubeUrl: settings.youtubeUrl || '',
        }),
      })
      setMessage('Settings saved')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function onSavePassword(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await api('/admin/settings/site-password', {
        method: 'PATCH',
        body: JSON.stringify({ password: sitePassword }),
      })
      setSitePassword('')
      setEditingPassword(false)
      setRevealPassword(false)
      setMessage('Website access password updated')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!settings) {
    return <p className={muted}>Loading settings…</p>
  }

  const storedPassword = settings.sitePassword || ''

  return (
    <div>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Store settings</h2>
          <p className={`m-0 ${muted}`}>
            Pickup location, rewards copy, and website access password.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      {message ? <div className={success}>{message}</div> : null}

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Pickup &amp; store info</h3>
        </div>
        <form className={`${panelBody} ${formGrid}`} onSubmit={onSaveSettings}>
          <label className={labelClass}>
            Store name
            <input
              className={input}
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
            />
          </label>
          <label className={labelClass}>
            Pickup location
            <input
              className={input}
              value={settings.pickupLocation}
              onChange={(e) =>
                setSettings({ ...settings, pickupLocation: e.target.value })
              }
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Pickup address
            <input
              className={input}
              value={settings.pickupAddress}
              onChange={(e) =>
                setSettings({ ...settings, pickupAddress: e.target.value })
              }
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Rewards info
            <textarea
              className={input}
              rows={4}
              value={settings.rewardsInfo || ''}
              onChange={(e) =>
                setSettings({ ...settings, rewardsInfo: e.target.value })
              }
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Rewards rules
            <textarea
              className={input}
              rows={4}
              value={settings.rewardsRules || ''}
              onChange={(e) =>
                setSettings({ ...settings, rewardsRules: e.target.value })
              }
              placeholder="Paste Jonathan's rewards instructions here when ready"
            />
          </label>
          <label className={labelClass}>
            Points per item
            <input
              className={input}
              type="number"
              min="0"
              step="1"
              value={settings.rewardsPointsPerItem ?? 2}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  rewardsPointsPerItem: Number(e.target.value),
                })
              }
            />
          </label>
          <label className={`${labelClass} flex flex-row items-center gap-2`}>
            <input
              checked={Boolean(settings.doublePointsDay)}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  doublePointsDay: e.target.checked,
                })
              }
              type="checkbox"
            />
            Double Points Day (4 pts per item)
          </label>
          <label className={labelClass}>
            Legacy points per $1
            <input
              className={input}
              type="number"
              min="0"
              step="0.1"
              value={settings.rewardsPointsPerDollar ?? 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  rewardsPointsPerDollar: Number(e.target.value),
                })
              }
            />
          </label>
          <div className={`${actions} ${formFull}`}>
            <button className={btn} type="submit" disabled={loading}>
              Save settings
            </button>
          </div>
        </form>
      </section>

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Social links</h3>
          <span className={`text-[0.8rem] ${muted}`}>
            Shown as icons in the storefront footer. Leave blank to hide an icon.
          </span>
        </div>
        <form className={`${panelBody} ${formGrid}`} onSubmit={onSaveSettings}>
          {SOCIAL_FIELDS.map((field) => (
            <label className={labelClass} key={field.key}>
              {field.label}
              <input
                className={input}
                onChange={(e) =>
                  setSettings({ ...settings, [field.key]: e.target.value })
                }
                placeholder={field.placeholder}
                type="url"
                value={settings[field.key] || ''}
              />
            </label>
          ))}
          <div className={`${actions} ${formFull}`}>
            <button className={btn} disabled={loading} type="submit">
              Save social links
            </button>
          </div>
        </form>
      </section>

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Website access password</h3>
          <span className={`text-[0.8rem] ${muted}`}>
            Customers need this to open the storefront.
          </span>
        </div>
        <form className={`${panelBody} ${formGrid}`} onSubmit={onSavePassword}>
          <label className={labelClass}>
            {editingPassword ? 'New site password' : 'Current site password'}
            <div className="relative">
              <input
                className={`${input} pr-[4.75rem]`}
                type={revealPassword ? 'text' : 'password'}
                value={editingPassword ? sitePassword : storedPassword}
                onChange={(e) => setSitePassword(e.target.value)}
                minLength={editingPassword ? 4 : undefined}
                readOnly={!editingPassword}
                required={editingPassword}
                placeholder={
                  editingPassword ? 'Type the new password' : 'Not available'
                }
              />
              <div className="absolute inset-y-0 right-[0.5rem] flex items-center gap-[0.15rem]">
                <button
                  className={fieldIconBtn}
                  type="button"
                  onClick={() => setRevealPassword((v) => !v)}
                  title={revealPassword ? 'Hide password' : 'Show password'}
                  aria-label={revealPassword ? 'Hide password' : 'Show password'}
                >
                  {revealPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
                <button
                  className={fieldIconBtn}
                  type="button"
                  onClick={() => {
                    if (editingPassword) {
                      setSitePassword('')
                      setEditingPassword(false)
                      return
                    }
                    setSitePassword('')
                    setEditingPassword(true)
                    setRevealPassword(true)
                  }}
                  title={editingPassword ? 'Cancel edit' : 'Edit password'}
                  aria-label={editingPassword ? 'Cancel edit' : 'Edit password'}
                >
                  {editingPassword ? <CloseIcon /> : <PencilIcon />}
                </button>
              </div>
            </div>
          </label>
          {!editingPassword && !storedPassword ? (
            <p className={`m-0 self-end text-[0.8rem] ${muted}`}>
              This password was set before we started keeping a readable copy.
              Set a new one to see it here.
            </p>
          ) : null}
          {editingPassword ? (
            <div className={`${actions} ${formFull}`}>
              <button className={btn} type="submit" disabled={loading}>
                Update site password
              </button>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  )
}
