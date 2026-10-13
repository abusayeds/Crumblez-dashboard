import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { LegalPage } from '../lib/types'
import { legalPagePath } from '../lib/legalPages'
import { RichTextEditor } from '../components/RichTextEditor'
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

const empty = {
  title: '',
  slug: '',
  contentHtml: '',
  seoDescription: '',
  sortOrder: 0,
  isPublished: true,
}

export function LegalPageFormPage() {
  const { id } = useParams()
  const editId = id ? Number(id) : null
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!editId) return
    api<LegalPage>(`/legal-pages/${editId}`)
      .then((page) =>
        setForm({
          title: page.title,
          slug: page.slug,
          contentHtml: page.contentHtml,
          seoDescription: page.seoDescription || '',
          sortOrder: page.sortOrder,
          isPublished: page.isPublished,
        }),
      )
      .catch((err) => setError(err.message))
  }, [editId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        contentHtml: form.contentHtml,
        seoDescription: form.seoDescription || undefined,
        sortOrder: Number(form.sortOrder),
        isPublished: form.isPublished,
      }
      if (editId) {
        await api(`/legal-pages/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      } else {
        await api('/legal-pages', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      navigate('/legal-pages')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link className={backLink} to="/legal-pages">
        ← Back to legal pages
      </Link>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>
            {editId ? 'Edit legal page' : 'Create legal page'}
          </h2>
          <p className={`m-0 ${muted}`}>
            {form.slug
              ? `Live at ${legalPagePath(form.slug)}`
              : 'The URL is generated from the title unless you set a slug.'}
          </p>
        </div>
      </div>

      {error ? <div className={alert}>{error}</div> : null}

      <form onSubmit={onSubmit}>
        <section className={panel}>
          <div className={`${panelBody} ${formGrid}`}>
            <label className={labelClass}>
              Title
              <input
                className={input}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                value={form.title}
              />
            </label>
            <label className={labelClass}>
              Slug
              <input
                className={input}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="privacy"
                value={form.slug}
              />
            </label>
            <label className={labelClass}>
              SEO description
              <input
                className={input}
                onChange={(e) =>
                  setForm({ ...form, seoDescription: e.target.value })
                }
                value={form.seoDescription}
              />
            </label>
            <label className={labelClass}>
              Sort order
              <input
                className={input}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
                type="number"
                value={form.sortOrder}
              />
            </label>
            <label className={`${check} ${formFull}`}>
              <input
                checked={form.isPublished}
                className={checkbox}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
                type="checkbox"
              />
              Published on the storefront
            </label>
          </div>
        </section>

        <section className={panel}>
          <div className={panelHeader}>
            <h3 className={panelTitle}>Page content</h3>
            <span className={`text-[0.8rem] ${muted}`}>
              Use the toolbar for headings, fonts, colors, links, images and tables
            </span>
          </div>
          <div className={panelBody}>
            <RichTextEditor
              onChange={(contentHtml) => setForm((prev) => ({ ...prev, contentHtml }))}
              value={form.contentHtml}
            />
          </div>
        </section>

        <div className={`mt-4 ${actions}`}>
          <button className={btn} disabled={loading} type="submit">
            {loading ? 'Saving…' : editId ? 'Save changes' : 'Create page'}
          </button>
          <Link to="/legal-pages">
            <button className={btnGhost} type="button">
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}
