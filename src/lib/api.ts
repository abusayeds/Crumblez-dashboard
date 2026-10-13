const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'
const FILE_BASE = import.meta.env.VITE_FILE_URL || ''

export function fileUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // In Vite dev, /uploads is proxied to backend
  return `${FILE_BASE}${path}`
}

export function getToken() {
  return localStorage.getItem('crumblez_admin_token') || ''
}

export function setToken(token: string) {
  localStorage.setItem('crumblez_admin_token', token)
}

export function clearToken() {
  localStorage.removeItem('crumblez_admin_token')
}

function extractErrorMessage(data: unknown, status: number) {
  if (!data || typeof data !== 'object') {
    return `Request failed (${status})`
  }
  const payload = data as {
    message?: string | string[]
    error?: string
  }
  if (Array.isArray(payload.message)) {
    return payload.message.join(', ')
  }
  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }
  if (payload.error) return payload.error
  return `Request failed (${status})`
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status))
  }
  return data as T
}

export async function uploadImage(file: File) {
  const form = new FormData()
  form.append('file', file)
  return api<{ url: string }>('/uploads', { method: 'POST', body: form })
}
