import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fileUrl, uploadImage } from '../lib/api'
import type { Category, Product } from '../lib/types'
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
  thumbLarge,
} from '../lib/ui'

const empty = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  categoryId: 0,
  stock: 0,
  isActive: true,
  showOnHome: false,
  flavorsText: '',
}

export function ProductFormPage() {
  const { id } = useParams()
  const editId = id ? Number(id) : null
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api<Category[]>('/categories?all=true')
      .then((cats) => {
        setCategories(cats)
        if (!editId && cats[0]) {
          setForm((prev) => ({ ...prev, categoryId: cats[0].id }))
        }
      })
      .catch((err) => setError(err.message))
  }, [editId])

  useEffect(() => {
    if (!editId) return
    api<Product>(`/products/${editId}`)
      .then((item) => {
        setForm({
          name: item.name,
          description: item.description || '',
          price: Number(item.price),
          imageUrl: item.imageUrl || '',
          categoryId: item.categoryId,
          stock: item.stock,
          isActive: item.isActive,
          showOnHome: item.showOnHome,
          flavorsText: item.flavors?.map((f) => f.name).join('\n') || '',
        })
      })
      .catch((err) => setError(err.message))
  }, [editId])

  function payloadFromForm() {
    const flavors = form.flavorsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ name }))

    return {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      imageUrl: form.imageUrl || undefined,
      categoryId: Number(form.categoryId),
      stock: Number(form.stock),
      isActive: form.isActive,
      showOnHome: form.showOnHome,
      flavors,
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body = payloadFromForm()
      if (editId) {
        await api(`/products/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      } else {
        await api('/products', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
      navigate('/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function onUpload(file?: File | null) {
    if (!file) return
    try {
      const res = await uploadImage(file)
      setForm((prev) => ({ ...prev, imageUrl: res.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  return (
    <div>
      <Link className={backLink} to="/products">
        ← Back to products
      </Link>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>
            {editId ? 'Edit product' : 'Create product'}
          </h2>
          <p className={`m-0 ${muted}`}>Save to return to the product list.</p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <form className={`${panelBody} ${formGrid}`} onSubmit={onSubmit}>
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
            Price ($)
            <input
              className={input}
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </label>
          <label className={labelClass}>
            Category
            <select
              className={input}
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: Number(e.target.value) })
              }
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Stock
            <input
              className={input}
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Description
            <textarea
              className={input}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Image upload
            <input
              className={input}
              type="file"
              accept="image/*"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </label>
          <label className={labelClass}>
            Image URL
            <input
              className={input}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Flavors (one per line — for nicotine vapes)
            <textarea
              className={input}
              rows={4}
              value={form.flavorsText}
              onChange={(e) => setForm({ ...form, flavorsText: e.target.value })}
              placeholder={'Blue Razz\nMango\nStrawberry'}
            />
          </label>
          <label className={`${labelClass} ${check}`}>
            <input
              className={checkbox}
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <label className={`${labelClass} ${check}`}>
            <input
              className={checkbox}
              type="checkbox"
              checked={form.showOnHome}
              onChange={(e) =>
                setForm({ ...form, showOnHome: e.target.checked })
              }
            />
            Show on What&apos;s New
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
          <div className={`${actions} ${formFull}`}>
            <button className={btn} type="submit" disabled={loading}>
              {loading ? 'Saving…' : editId ? 'Update product' : 'Create product'}
            </button>
            <Link to="/products">
              <button type="button" className={btnGhost}>
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}
