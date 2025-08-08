"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Avatar } from '@/components/ui/Avatar'
import { api } from '@/app/api'

type User = {
  id: number
  email: string
  display_name?: string
  photo_url?: string
  lifebook?: Record<string, string>
}

type Habit = { id: number; title: string; current_streak: number }

type Group = { id: number; name: string; members: number }

export default function ProfileClient() {
  const [user, setUser] = useState<User | null>(null)
  const [habits, setHabits] = useState<Habit[] | null>(null)
  const [groups, setGroups] = useState<Group[] | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<{ display_name?: string; photo_url?: string; lifebook?: Record<string, string> }>({})

  useEffect(() => {
    ;(async () => {
      try {
        const u = await api('/users/me')
        setUser(u)
        setForm({ display_name: u.display_name, photo_url: u.photo_url, lifebook: u.lifebook || {} })
      } catch {}
      try {
        const h = await api('/habits')
        setHabits(h)
      } catch { setHabits([]) }
      try {
        const g = await api('/groups')
        setGroups(g)
      } catch { setGroups([]) }
    })()
  }, [])

  const avatar = useMemo(() => {
    const initial = (user?.display_name || user?.email || 'U')?.trim()[0]?.toUpperCase() || 'U'
    return user?.photo_url ? (
      <Avatar src={user.photo_url} alt={user.display_name || user.email} size={80} />
    ) : (
      <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-neutral-900 bg-neutral-100 text-2xl font-semibold">{initial}</div>
    )
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {avatar}
          <div>
            <div className="text-xl font-semibold">{user?.display_name || 'Your Name'}</div>
            <div className="text-neutral-500 text-sm">{user?.email}</div>
          </div>
        </div>
        <Button onClick={() => setEditing(true)}>Edit Profile</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">My Habits</div>
              <a href="/habits" className="underline text-sm">Manage habits →</a>
            </div>
            {!habits && <div className="text-sm text-neutral-500">Loading…</div>}
            {habits && habits.length === 0 && <div className="text-sm text-neutral-500">You haven't added any habits yet.</div>}
            {habits && habits.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3">
                {habits.map(h => (
                  <Card key={h.id} className="p-3">
                    <div className="font-medium">{h.title}</div>
                    <div className="text-sm text-neutral-500">Streak: {h.current_streak}</div>
                    <div className="mt-2 grid grid-cols-7 gap-1">
                      {['M','T','W','T','F','S','S'].map((d,i)=>(
                        <div key={i} className="h-6 rounded bg-neutral-100 border" />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">My Groups</div>
            </div>
            {!groups && <div className="text-sm text-neutral-500">Loading…</div>}
            {groups && groups.length === 0 && <div className="text-sm text-neutral-500">You haven't joined any groups yet.</div>}
            {groups && groups.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3">
                {groups.map(g => (
                  <Card key={g.id} className="p-3">
                    <div className="font-medium">{g.name}</div>
                    <div className="text-sm text-neutral-500">Members: {g.members}</div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <div className="font-medium mb-2">My Lifebook</div>
            <div className="text-sm text-neutral-500 mb-3">Your guiding principles and motivations.</div>
            <div className="space-y-2">
              {Object.entries(user?.lifebook || {}).map(([k,v]) => (
                v ? (
                  <div key={k}>
                    <div className="text-sm font-medium">{k}</div>
                    <div className="text-sm">{v}</div>
                  </div>
                ) : null
              ))}
            </div>
          </Card>
        </div>
      </div>

      {editing && (
         <Dialog title="Edit Profile" trigger={<span />}> 
          <form className="space-y-3" onSubmit={async e => {
            e.preventDefault()
            await api('/users/me', { method: 'PUT', body: JSON.stringify(form) })
            const u = await api('/users/me')
            setUser(u)
            setEditing(false)
          }}>
            <div className="grid gap-3">
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input value={form.display_name || ''} onChange={e=>setForm(f=>({...f, display_name:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Photo URL</label>
                <input value={form.photo_url || ''} onChange={e=>setForm(f=>({...f, photo_url:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Your Top 3-5 Life Goals</label>
                <textarea value={form.lifebook?.goals || ''} onChange={e=>setForm(f=>({...f, lifebook:{...(f.lifebook||{}), goals:e.target.value}}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">What drives you?</label>
                <textarea value={form.lifebook?.motivation || ''} onChange={e=>setForm(f=>({...f, lifebook:{...(f.lifebook||{}), motivation:e.target.value}}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Your Core Values</label>
                <textarea value={form.lifebook?.values || ''} onChange={e=>setForm(f=>({...f, lifebook:{...(f.lifebook||{}), values:e.target.value}}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">What do you want to improve?</label>
                <textarea value={form.lifebook?.improve || ''} onChange={e=>setForm(f=>({...f, lifebook:{...(f.lifebook||{}), improve:e.target.value}}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">What are your main hurdles?</label>
                <textarea value={form.lifebook?.hurdles || ''} onChange={e=>setForm(f=>({...f, lifebook:{...(f.lifebook||{}), hurdles:e.target.value}}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" className="bg-white text-neutral-900" onClick={()=>setEditing(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Habit creation moved to /habits page */}
    </div>
  )
}
