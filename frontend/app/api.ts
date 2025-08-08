import { ensureToken } from './lib/auth'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8050'

export async function api(path: string, opts: RequestInit = {}) {
  // attempt 1
  let token = typeof window !== 'undefined' ? await ensureToken(API_BASE) : ''
  let res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '', ...(opts.headers || {}) },
  })
  if (res.status === 401 && typeof window !== 'undefined') {
    // clear and retry once
    try { localStorage.removeItem('habitlink_token') } catch {}
    token = await ensureToken(API_BASE)
    res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '', ...(opts.headers || {}) },
    })
  }
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
