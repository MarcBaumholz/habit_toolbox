export function uuid() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

export async function ensureToken(apiBase: string): Promise<string> {
  const storageKey = 'habitlink_token'
  const existing = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
  if (existing) return existing

  const email = `dev_${uuid()}@example.com`
  const password = 'dev-password-123'

  // try register
  let res = await fetch(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    // try login if already exists
    res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  }
  if (!res.ok) throw new Error('Unable to acquire token')
  const data = await res.json()
  const token = data.access_token as string
  localStorage.setItem(storageKey, token)
  return token
}

export function apiBaseFromWindow(): string {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8050'
  return 'http://127.0.0.1:8050'
}
