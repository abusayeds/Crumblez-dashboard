import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, fileUrl, uploadImage } from '../lib/api'
import type { Category } from '../lib/types'
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
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
}

export function CategoryFormPage() {
  const { id } = useParams()
  const editId = id ? Number(id) : null
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!editId) return
    api<Category[]>(`/categories?all=true`)
      .then((items) => {
        const item = items.find((c) => c.id === editId)
        if (!item) throw new Error('Category not found')
        setForm({
          name: item.name,
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        })
      })
      .catch((err) => setError(err.message))
  }, [editId])

  async function onUpload(file?: File) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const res = await uploadImage(file)
      setForm((prev) => ({ ...prev, imageUrl: res.url }))
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
      const payload = {
        name: form.name,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      }
      if (editId) {
        await api(`/categories/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await api('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      navigate('/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link className={backLink} to="/categories">
        ← Back to categories
      </Link>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>
            {editId ? 'Edit category' : 'Create category'}
          </h2>
          <p className={`m-0 ${muted}`}>
            Upload an image — it shows on the menu banner slider.
          </p>
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
            Sort order
            <input
              className={input}
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
            />
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Description
            <textarea
              className={input}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label className={labelClass}>
            Image upload
            <input
              className={input}
              type="file"
              accept="image/*"
              onChange={(e) => onUpload(e.target.files?.[0])}
              disabled={uploading}
            />
          </label>
          <label className={labelClass}>
            Image URL
            <input
              className={input}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="/uploads/..."
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
          {form.imageUrl ? (
            <div className={formFull}>
              <img
                className={thumbLarge}
                src={fileUrl(form.imageUrl)}
                alt="Category preview"
              />
            </div>
          ) : null}
          <div className={`${actions} ${formFull}`}>
            <button className={btn} type="submit" disabled={loading || uploading}>
              {loading
                ? 'Saving…'
                : uploading
                  ? 'Uploading…'
                  : editId
                    ? 'Update category'
                    : 'Create category'}
            </button>
            <Link to="/categories">
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
