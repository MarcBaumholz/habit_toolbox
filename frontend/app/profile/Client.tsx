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

function WeekPreview({ habitId }:{habitId:number}){
  const [week,setWeek] = useState<{week_start:string; days:Record<string,boolean>}|null>(null)
  useEffect(()=>{(async()=>{ try{ setWeek(await api(`/habits/${habitId}/week`)) } catch{} })()},[habitId])
  const days = useMemo(()=>{
    if(!week) return [] as {iso:string; label:string}[]
    const start = new Date(week.week_start)
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    return Array.from({length:7}).map((_,i)=>{
      const d = new Date(start); d.setDate(d.getDate()+i)
      return { iso: d.toISOString().slice(0,10), label: labels[i] }
    })
  },[week])
  if(!week) return <div className="h-16 bg-neutral-50 rounded-xl"/>
  return (
    <div className="flex gap-2 mt-2">
      {days.map(d=>{
        const active = !!week.days[d.iso]
        return (
          <div key={d.iso} className={`w-10 h-10 rounded-lg border relative ${active? 'bg-green-500 border-transparent shadow-sm':'bg-neutral-50'}`}>
            <span className="absolute top-0.5 left-0.5 text-[10px] text-neutral-500">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

type Group = { id: number; name: string; members: number; owner_id: number; description?: string | null }

export default function ProfileClient() {
  const [user, setUser] = useState<User | null>(null)
  const [habits, setHabits] = useState<Habit[] | null>(null)
  const [groups, setGroups] = useState<Group[] | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<{ display_name?: string; photo_url?: string; description?: string; big_why?: string; lifebook?: Record<string, string> }>({})

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
        // Align with My Groups page: only groups where the user is a member (owned or joined)
        await api('/users/me') // ensure session; also used for owner split if needed later
        const mine = await api('/groups/me/list')
        setGroups(mine)
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
            <div className="text-2xl font-semibold">{user?.display_name || 'Your Name'}</div>
            <div className="text-neutral-500 text-sm">{user?.email}</div>
            {user?.description && <div className="text-sm mt-1">{user.description}</div>}
            {user?.big_why && <div className="text-sm text-neutral-600 mt-1">Big Why: {user.big_why}</div>}
          </div>
        </div>
        <Dialog title="Edit Profile" trigger={<Button>Edit Profile</Button>}>
          <form className="space-y-3" onSubmit={async e => {
            e.preventDefault()
            await api('/users/me', { method: 'PUT', body: JSON.stringify(form) })
            const u = await api('/users/me')
            setUser(u)
          }}>
            <div className="grid gap-3">
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input value={form.display_name || ''} onChange={e=>setForm(f=>({...f, display_name:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea value={form.description || ''} onChange={e=>setForm(f=>({...f, description:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="Who are you and what do you focus on?" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Big Why</label>
                <textarea value={form.big_why || ''} onChange={e=>setForm(f=>({...f, big_why:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="Why do you do it?" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Profile Picture (URL)</label>
                <input value={form.photo_url || ''} onChange={e=>setForm(f=>({...f, photo_url:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="https://..." />
              </div>

              {/* Lifebook prompts */}
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Your Top 3-5 Life Goals (one per line)</label>
                <textarea value={form.lifebook?.goals || ''} onChange={e=>setForm(f=>({...f, lifebook:{...(f.lifebook||{}), goals:e.target.value}}))} className="w-full rounded-lg border p-3 bg-white" placeholder="e.g., Achieve financial independence" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">What drives you? (Core motivation)</label>
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
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Dialog>
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
                    <div className="flex items-start gap-2">
                      <a href={`/habits/${h.id}`} className="font-medium hover:underline">{h.title}</a>
                      <div className="ml-auto flex items-center gap-1 text-[var(--cta-active)]"><span>⚡</span><span className="font-semibold">{h.current_streak}</span></div>
                    </div>
                    <WeekPreview habitId={h.id} />
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
              <div className="space-y-4">
                {/* Owned by me */}
                <div>
                  <div className="text-sm font-semibold mb-2">Owned by me</div>
                  {groups.filter(g=> g.owner_id === user?.id).length === 0 ? (
                    <div className="text-sm text-neutral-500">No owned groups.</div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {groups.filter(g=> g.owner_id === user?.id).map(g => (
                        <Card key={g.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{g.name}</div>
                              <div className="text-sm text-neutral-500">Members: {g.members}</div>
                            </div>
                            <a className="text-sm underline" href={`/groups/${g.id}`}>Open</a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                {/* Subscribed Groups */}
                <div>
                  <div className="text-sm font-semibold mb-2">Subscribed Groups</div>
                  {groups.filter(g=> g.owner_id !== user?.id).length === 0 ? (
                    <div className="text-sm text-neutral-500">No subscriptions yet.</div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {groups.filter(g=> g.owner_id !== user?.id).map(g => (
                        <Card key={g.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{g.name}</div>
                              <div className="text-sm text-neutral-500">Members: {g.members}</div>
                            </div>
                            <a className="text-sm underline" href={`/groups/${g.id}`}>Open</a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <div className="font-medium mb-2">Profile Summary</div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {user?.display_name || 'Unknown'}</div>
              {user?.description && <div><span className="font-medium">About:</span> {user.description}</div>}
              {user?.big_why && <div><span className="font-medium">Big Why:</span> {user.big_why}</div>}
            </div>
          </Card>
          <SubscribedHabits />
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
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea value={form.description || ''} onChange={e=>setForm(f=>({...f, description:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="Who are you and what do you focus on?" />
              </div>
              <div className="border rounded-xl p-4 bg-neutral-50">
                <label className="block text-sm font-medium mb-1">Big Why</label>
                <textarea value={form.big_why || ''} onChange={e=>setForm(f=>({...f, big_why:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="Why do you do it?" />
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

function SubscribedHabits(){
  const [subs,setSubs] = useState<Habit[]|null>(null)
  const [busy,setBusy] = useState<number|null>(null)
  useEffect(()=>{(async()=>{ try{ setSubs(await api('/habits/subscriptions')) } catch{ setSubs([]) } })()},[])

  async function unsubscribe(habitId:number){
    setBusy(habitId)
    try{
      await api(`/habits/${habitId}/unsubscribe`, { method:'POST' })
      // reload or optimistically remove
      setSubs(list => (list||[]).filter(h => h.id !== habitId))
    }finally{ setBusy(null) }
  }

  return (
    <Card>
      <div className="font-medium mb-2">Inspiration • Subscribed Habits</div>
      {!subs && <div className="text-sm text-neutral-500">Loading…</div>}
      {subs && subs.length===0 && <div className="text-sm text-neutral-500">No subscriptions yet. Subscribe to habits you like.</div>}
      {subs && subs.length>0 && (
        <div className="space-y-2">
          {subs.map(h=> (
            <div key={h.id} className="flex items-center justify-between rounded border p-2">
              <div className="font-medium truncate pr-2">{h.title}</div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-neutral-500">⚡ {h.current_streak}</div>
                <button
                  aria-label="Unsubscribe"
                  onClick={()=>unsubscribe(h.id)}
                  disabled={busy===h.id}
                  className="px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-50"
                >Unsubscribe</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
