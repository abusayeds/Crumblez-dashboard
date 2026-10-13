import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fileUrl, uploadImage } from '../lib/api'
import type { Deal, Product } from '../lib/types'
import {
  actions,
  alert,
  backLink,
  btn,
  btnGhost,
  check,
  checkbox,
  checkList,
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
  thumbLarge,
} from '../lib/ui'

// Every line of storefront promo tile copy is a field here, so the tiles on the
// home page, the menu page's featured slot and the deals list are fully
// admin-authored.
const empty = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  badgeText: '',
  subhead: '',
  headline: '',
  headlineAccent: '',
  bodyText: '',
  ctaLabel: '',
  disclaimerStrong: '',
  disclaimerText: '',
  showOnHome: false,
  isFeatured: false,
}

export function DealFormPage() {
  const { id } = useParams()
  const editId = id ? Number(id) : null
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api<Product[]>('/products?all=true')
      .then(setProducts)
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!editId) return
    api<Deal>(`/deals/${editId}`)
      .then((deal) => {
        setForm({
          name: deal.name,
          description: deal.description || '',
          price: Number(deal.price),
          imageUrl: deal.imageUrl || '',
          badgeText: deal.badgeText || '',
          subhead: deal.subhead || '',
          headline: deal.headline || '',
          headlineAccent: deal.headlineAccent || '',
          bodyText: deal.bodyText || '',
          ctaLabel: deal.ctaLabel || '',
          disclaimerStrong: deal.disclaimerStrong || '',
          disclaimerText: deal.disclaimerText || '',
          showOnHome: deal.showOnHome ?? false,
          isFeatured: deal.isFeatured ?? false,
        })
        setSelected(deal.items.map((item) => item.productId))
      })
      .catch((err) => setError(err.message))
  }, [editId])

  function toggleProduct(productId: number) {
    setSelected((prev) =>
      prev.includes(productId)
        ? prev.filter((x) => x !== productId)
        : [...prev, productId],
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selected.length) {
      setError('Select at least one product for the deal')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        badgeText: form.badgeText,
        subhead: form.subhead,
        headline: form.headline,
        headlineAccent: form.headlineAccent,
        bodyText: form.bodyText,
        ctaLabel: form.ctaLabel,
        disclaimerStrong: form.disclaimerStrong,
        disclaimerText: form.disclaimerText,
        showOnHome: form.showOnHome,
        isFeatured: form.isFeatured,
        isActive: true,
        items: selected.map((productId) => ({ productId, quantity: 1 })),
      }
      if (editId) {
        await api(`/deals/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      } else {
        await api('/deals', { method: 'POST', body: JSON.stringify(body) })
      }
      navigate('/deals')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (patch: Partial<typeof empty>) =>
    setForm((prev) => ({ ...prev, ...patch }))

  return (
    <div>
      <Link className={backLink} to="/deals">
        ← Back to deals
      </Link>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>
            {editId ? 'Edit deal' : 'Create deal'}
          </h2>
          <p className={`m-0 ${muted}`}>Save to return to the deals list.</p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <form onSubmit={onSubmit}>
        <section className={panel}>
          <div className={`${panelBody} ${formGrid}`}>
            <label className={labelClass}>
              Deal name
              <input
                className={input}
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                required
              />
            </label>
            <label className={labelClass}>
              Deal price ($)
              <input
                className={input}
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set({ price: Number(e.target.value) })}
                required
              />
            </label>
            <label className={`${labelClass} ${formFull}`}>
              Description (internal / cart)
              <textarea
                className={input}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Image upload
              <input
                className={input}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const res = await uploadImage(file)
                    set({ imageUrl: res.url })
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : 'Upload failed',
                    )
                  }
                }}
              />
            </label>
            <label className={labelClass}>
              Image URL
              <input
                className={input}
                value={form.imageUrl}
                onChange={(e) => set({ imageUrl: e.target.value })}
              />
            </label>
            {form.imageUrl ? (
              <div className={formFull}>
                <img
                  className={thumbLarge}
                  src={fileUrl(form.imageUrl)}
                  alt="Preview"
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className={panel}>
          <div className={panelHeader}>
            <h3 className={panelTitle}>Storefront tile text</h3>
            <span className={`text-[0.8rem] ${muted}`}>
              Leave a field empty to hide that line on the tile
            </span>
          </div>
          <div className={`${panelBody} ${formGrid}`}>
            <label className={labelClass}>
              Badge
              <input
                className={input}
                placeholder="Now with Stuffed Crust"
                value={form.badgeText}
                onChange={(e) => set({ badgeText: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Subhead
              <input
                className={input}
                placeholder="Best deal ever"
                value={form.subhead}
                onChange={(e) => set({ subhead: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Headline
              <input
                className={input}
                placeholder="Any pizza. Any toppings. "
                value={form.headline}
                onChange={(e) => set({ headline: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Headline highlight (red)
              <input
                className={input}
                placeholder="$9.99 each."
                value={form.headlineAccent}
                onChange={(e) => set({ headlineAccent: e.target.value })}
              />
            </label>
            <label className={`${labelClass} ${formFull}`}>
              Body text
              <textarea
                className={input}
                placeholder="Choose your crust. Choose your size. Choose up to 7 toppings."
                value={form.bodyText}
                onChange={(e) => set({ bodyText: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Button label
              <input
                className={input}
                placeholder="Add deal"
                value={form.ctaLabel}
                onChange={(e) => set({ ctaLabel: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Fine print — bold lead-in
              <input
                className={input}
                placeholder="PRICES HIGHER FOR SOME LOCATIONS"
                value={form.disclaimerStrong}
                onChange={(e) => set({ disclaimerStrong: e.target.value })}
              />
            </label>
            <label className={`${labelClass} ${formFull}`}>
              Fine print — rest
              <textarea
                className={input}
                placeholder=" Select this offer online only."
                value={form.disclaimerText}
                onChange={(e) => set({ disclaimerText: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className={panel}>
          <div className={panelHeader}>
            <h3 className={panelTitle}>Storefront slots</h3>
            <span className={`text-[0.8rem] ${muted}`}>
              Only one deal can hold each slot — turning it on here removes it
              from any other deal
            </span>
          </div>
          <div className={`${panelBody} ${formGrid}`}>
            <label className={`${labelClass} ${check}`}>
              <input
                className={checkbox}
                type="checkbox"
                checked={form.showOnHome}
                onChange={(e) => set({ showOnHome: e.target.checked })}
              />
              Show on the home page
            </label>
            <label className={`${labelClass} ${check}`}>
              <input
                className={checkbox}
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set({ isFeatured: e.target.checked })}
              />
              Show as the menu page&apos;s featured deal
            </label>
          </div>
        </section>

        <section className={panel}>
          <div className={panelBody}>
            <p className={muted}>Include products</p>
            <div className={checkList}>
              {products.map((product) => (
                <label key={product.id} className={`${labelClass} ${check}`}>
                  <input
                    className={checkbox}
                    type="checkbox"
                    checked={selected.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />
                  {product.name} (${Number(product.price).toFixed(2)})
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className={`mt-4 ${actions}`}>
          <button className={btn} type="submit" disabled={loading}>
            {loading ? 'Saving…' : editId ? 'Update deal' : 'Create deal'}
          </button>
          <Link to="/deals">
            <button type="button" className={btnGhost}>
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}
