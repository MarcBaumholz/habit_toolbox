'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PublicUser { id:number; display_name?:string|null; email:string; photo_url?:string|null; description?:string|null; habits_count?:number; groups_count?:number }

export default function CommunityPage(){
  type Tab = 'people'|'groups'|'habits'
  const [tab,setTab] = useState<Tab>('people')
  const router = useRouter()
  const [users, setUsers] = useState<PublicUser[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [loading,setLoading] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [trusted, setTrusted] = useState<number[]>([])

  const filteredUsers = useMemo(() => users.filter(u => {
    if (!q.trim()) return true
    const t = q.toLowerCase()
    return (u.display_name||'').toLowerCase().includes(t) || u.email.toLowerCase().includes(t)
  }), [users, q])

  const filteredHabits = useMemo(() => habits.filter((h:any) => {
    if (!q.trim()) return true
    const t = q.toLowerCase()
    return (h.title||'').toLowerCase().includes(t)
  }), [habits, q])

  const filteredGroups = useMemo(() => groups.filter((g:any) => {
    if (!q.trim()) return true
    const t = q.toLowerCase()
    return (g.name||'').toLowerCase().includes(t)
  }), [groups, q])

  async function load(){
    setLoading(true)
    try{
      if(tab==='people'){
        const list = await api(`/users${q?`?search=${encodeURIComponent(q)}&limit=200`:'?limit=200'}`)
        setUsers(list)
        try{ const t = await api('/social/trusted'); setTrusted(t) }catch{}
      }else if(tab==='habits'){
        const list = await api(`/habits/public/discover${q?`?search=${encodeURIComponent(q)}&limit=200`:'?limit=200'}`)
        setHabits(list)
      }else{
        const list = await api(`/groups?is_public=true`)
        setGroups(list)
      }
    } finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[q, tab])

  function HabitSubButton({habitId, ownerId}:{habitId:number; ownerId:number}){
    const [me,setMe] = useState<{id:number}|null>(null)
    const [subs,setSubs] = useState<number[]>([])
    useEffect(()=>{ (async()=>{
      try{ const u = await api('/users/me'); setMe(u) }catch{}
      try{ const list = await api('/habits/subscriptions'); setSubs(list.map((h:any)=>h.id)) }catch{}
    })() },[])
    const isOwn = me && me.id===ownerId
    const isSub = subs.includes(habitId)
    if(isOwn) return null
    return isSub ? (
      <Button variant="secondary" onClick={async()=>{ await api(`/habits/${habitId}/subscribe`, { method:'DELETE' }); setSubs(s=>s.filter(id=>id!==habitId)) }}>Unsubscribe</Button>
    ) : (
      <Button onClick={async()=>{ await api(`/habits/${habitId}/subscribe`, { method:'POST' }); setSubs(s=>[...s,habitId]) }}>Subscribe</Button>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Community</h1>
          <p className="text-sm text-neutral-600">Discover people, public habits and public groups. Calm, non-addictive, and focused on giving you time back.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className={`chip ${tab==='people'?'bg-[rgb(var(--primary))] text-white border-transparent':''}`} onClick={()=>setTab('people')}>People</button>
        <button className={`chip ${tab==='groups'?'bg-[rgb(var(--primary))] text-white border-transparent':''}`} onClick={()=>setTab('groups')}>Groups</button>
        <button className={`chip ${tab==='habits'?'bg-[rgb(var(--primary))] text-white border-transparent':''}`} onClick={()=>setTab('habits')}>Habits</button>
      </div>

      <Card>
        <div className="flex gap-2 items-center">
          <input className="input flex-1" placeholder={tab==='people'?"Search people by name or email": tab==='habits'?"Search public habits":"Search public groups"} value={q} onChange={e=>setQ(e.target.value)} />
          <span className="text-xs text-neutral-500">{tab==='people'? filteredUsers.length : tab==='groups'? filteredGroups.length : filteredHabits.length} results</span>
        </div>
      </Card>

      {tab==='people' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
          {filteredUsers.map(u=> (
            <Card key={u.id} className="p-0 overflow-hidden flex flex-col">
              <div className="p-4 flex items-start gap-3">
                <span className="h-12 w-12 grid place-items-center rounded-full bg-neutral-100 border text-sm shrink-0">
                  {(u.display_name||u.email).slice(0,2).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.display_name||u.email}</div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="chip">{u.habits_count||0} habits</span>
                    <span className="chip">{u.groups_count||0} groups</span>
                  </div>
                  <div className="text-xs text-neutral-500 truncate mt-1">{u.email}</div>
                  {u.description && <div className="mt-1 text-sm text-neutral-700 line-clamp-2">{u.description}</div>}
                </div>
              </div>
              <div className="px-4 pb-4 pt-3 border-t flex items-center justify-between gap-2">
                <Link href={`/public/${u.id}`} className="inline-flex"><Button variant="ghost">View</Button></Link>
                {trusted.includes(u.id) ? (
                  <Button variant="secondary" onClick={async()=>{ await api(`/social/trust/${u.id}`, { method:'DELETE' }); setTrusted(t=>t.filter(x=>x!==u.id)) }}>Unfollow</Button>
                ) : (
                  <Button onClick={async()=>{ await api(`/social/trust/${u.id}`, { method:'POST' }); setTrusted(t=>[...t,u.id]) }}>Follow</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab==='habits' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
          {filteredHabits.map((h:any)=> (
            <Card key={h.id} className="p-4 flex flex-col gap-2">
              <div className="font-semibold">{h.title}</div>
              <div className="text-xs text-neutral-500">by user #{h.user_id}</div>
              <div className="pt-2 flex gap-2">
                <Link href={`/public/${h.user_id}`} className="inline-flex"><Button variant="ghost">Open user</Button></Link>
                <HabitSubButton habitId={h.id} ownerId={h.user_id} />
              </div>
            </Card>
          ))}
          {!loading && filteredHabits.length===0 && <div className="muted text-sm">No public habits yet.</div>}
        </div>
      )}

      {tab==='groups' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
          {filteredGroups.map((g:any)=> (
            <Card key={g.id} className="p-4 flex flex-col gap-2">
              <div className="font-semibold">{g.name}</div>
              {g.description && <div className="text-sm text-neutral-700 line-clamp-2">{g.description}</div>}
              <div className="text-xs text-neutral-500">{g.members} members</div>
              <div className="pt-2 flex gap-2">
                <Link href={`/groups/${g.id}`} className="inline-flex"><Button variant="ghost">Open</Button></Link>
                <Button onClick={async()=>{ await api(`/groups/${g.id}/join`, { method:'POST', body: JSON.stringify({}) }); }}>Subscribe</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
