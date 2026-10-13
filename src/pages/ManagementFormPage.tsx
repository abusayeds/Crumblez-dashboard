import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import {
  actions,
  alert,
  backLink,
  btn,
  btnGhost,
  formFull,
  formGrid,
  input,
  label as labelClass,
  muted,
  pageIntro,
  pageIntroTitle,
  panel,
  panelBody,
} from '../lib/ui'

type ManagementItem = {
  id: number
  type: string
  description: string
}

export function ManagementFormPage() {
  const { type: routeType } = useParams()
  const isEdit = Boolean(routeType && routeType !== 'new')
  const navigate = useNavigate()
  const [type, setType] = useState(isEdit ? routeType || 'about' : 'about')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isEdit || !routeType) return
    api<{ data?: ManagementItem[] } | ManagementItem[]>(
      `/management?type=${routeType}`,
    )
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || []
        const item = list[0]
        if (item) {
          setType(item.type)
          setDescription(item.description)
        }
      })
      .catch((err) => setError(err.message))
  }, [isEdit, routeType])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api('/management/create', {
        method: 'POST',
        body: JSON.stringify({ type, description }),
      })
      navigate('/management')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link className={backLink} to="/management">
        ← Back to legal pages
      </Link>
      <div className={pageIntro}>
        <div>
          <h2 className={pageIntroTitle}>
            {isEdit ? 'Edit legal page' : 'Create legal page'}
          </h2>
          <p className={`m-0 ${muted}`}>Save to return to the list.</p>
        </div>
      </div>
      {error ? <div className={alert}>{error}</div> : null}
      <section className={panel}>
        <form className={`${panelBody} ${formGrid}`} onSubmit={onSave}>
          <label className={labelClass}>
            Type
            <select
              className={input}
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isEdit}
            >
              <option value="about">about</option>
              <option value="terms">terms</option>
              <option value="privacy">privacy</option>
            </select>
          </label>
          <label className={`${labelClass} ${formFull}`}>
            Description
            <textarea
              className={input}
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
          <div className={`${actions} ${formFull}`}>
            <button className={btn} type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save page'}
            </button>
            <Link to="/management">
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
