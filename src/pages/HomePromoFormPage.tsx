import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, uploadImage } from '../lib/api'
import type { HomePromo } from '../lib/types'
import { HomePromoPreview } from '../components/HomePromoPreview'
import {
  actions,
  alert,
  backLink,
  btn,
  btnGhost,
  check,
  checkbox,
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
} from '../lib/ui'

// The storefront prints the headline as three pieces so the middle one keeps the
// red highlight, e.g. "TRY OUR " + "NEW" + " SLICE SAUCE".
const empty: HomePromo = {
  id: 1,
  headlinePre: '',
  headlineAccent: '',
  headlinePost: '',
  bodyText: '',
  ctaLabel: 'Order Now',
  ctaHref: '/menu',
  imageUrl: '',
  isActive: true,
  updatedAt: '',
}

export function HomePromoFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<HomePromo>(empty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api<HomePromo>('/home-promo')
      .then((promo) => setForm({ ...promo, imageUrl: promo.imageUrl || '' }))
      .catch((err) => setError(err.message))
  }, [])

  function set(patch: Partial<HomePromo>) {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  async function onUpload(file?: File) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const res = await uploadImage(file)
      set({ imageUrl: res.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api('/home-promo', {
        method: 'PATCH',
        body: JSON.stringify({
          headlinePre: form.headlinePre,
          headlineAccent: form.headlineAccent,
          headlinePost: form.headlinePost,
          bodyText: form.bodyText,
          ctaLabel: form.ctaLabel,
          ctaHref: form.ctaHref,
          imageUrl: form.imageUrl,
          isActive: form.isActive,
        }),
      })
      navigate('/whats-new')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link className={backLink} to="/whats-new">
        ← Back to What&apos;s New
      </Link>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>Edit What&apos;s New banner</h2>
          <p className={`m-0 ${muted}`}>
            This is the promo tile above the What&apos;s New products on the
            homepage.
          </p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}

      <section className={panel}>
        <div className={panelHeader}>
          <h3 className={panelTitle}>Live preview</h3>
        </div>
        <div className={panelBody}>
          <HomePromoPreview promo={form} />
        </div>
      </section>

      <section className={panel}>
        <form className={`${panelBody} ${formGrid}`} onSubmit={onSubmit}>
          <label className={labelClass}>
            Headline start
            <input
              className={input}
              value={form.headlinePre}
              onChange={(e) => set({ headlinePre: e.target.value })}
              placeholder="TRY OUR "
            />
          </label>
          <label className={labelClass}>
            Highlighted word (red)
            <input
              className={input}
              value={form.headlineAccent}
              onChange={(e) => set({ headlineAccent: e.target.value })}
              placeholder="NEW"
            />
          </label>
          <label className={labelClass}>
            Headline end
            <input
              className={input}
              value={form.headlinePost}
              onChange={(e) => set({ headlinePost: e.target.value })}
              placeholder=" SLICE SAUCE"
            />
          </label>
          <label className={labelClass}>
            Button label
            <input
              className={input}
              value={form.ctaLabel}
              onChange={(e) => set({ ctaLabel: e.target.value })}
              placeholder="Order Now"
            />
          </label>
          <label className={labelClass}>
            Button link
            <input
              className={input}
              value={form.ctaHref}
              onChange={(e) => set({ ctaHref: e.target.value })}
              placeholder="/menu"
            />
          </label>
          <label className={labelClass}>
            Image URL
            <input
              className={input}
              value={form.imageUrl || ''}
              onChange={(e) => set({ imageUrl: e.target.value })}
              placeholder="/uploads/..."
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Description
            <textarea
              className={input}
              rows={2}
              value={form.bodyText}
              onChange={(e) => set({ bodyText: e.target.value })}
              placeholder="Creamy and zesty with a hint of Parmesan."
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Upload banner image
            <input
              className={input}
              type="file"
              accept="image/*"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
            {uploading ? <span className={muted}>Uploading…</span> : null}
          </label>
          <label className={`${labelClass} ${check} ${formFull}`}>
            <input
              className={checkbox}
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set({ isActive: e.target.checked })}
            />
            Show this banner on the homepage
          </label>
          <div className={`${actions} ${formFull}`}>
            <button className={btn} disabled={loading} type="submit">
              {loading ? 'Saving…' : 'Save banner'}
            </button>
            <Link className={btnGhost} to="/whats-new">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}
