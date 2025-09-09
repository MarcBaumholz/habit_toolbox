'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/app/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PublicProfile({ userId }: { userId: number }){
  const [user, setUser] = useState<any>(null)
  const [habits, setHabits] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [trusted, setTrusted] = useState<number[]>([])
  const [subs,setSubs] = useState<number[]>([])
  const [busy,setBusy] = useState(false)

  useEffect(()=>{(async()=>{
    try{ setUser(await api(`/users/${userId}`)) }catch{}
    try{ setHabits(await api(`/users/${userId}/habits?public_only=true`)) }catch{ setHabits([]) }
    try{ setGroups(await api(`/users/${userId}/groups`)) }catch{ setGroups([]) }
    try{ const t = await api('/social/trusted'); setTrusted(t) }catch{}
    try{ const s = await api('/habits/subscriptions'); setSubs(s.map((h:any)=>h.id)) }catch{}
  })()},[userId])

  const isTrusted = trusted.includes(userId)

  async function toggleSubscribe(habitId:number){
    if(busy) return; setBusy(true)
    try{
      if(subs.includes(habitId)){
        await api(`/habits/${habitId}/subscribe`, { method:'DELETE' })
        setSubs(s=>s.filter(id=>id!==habitId))
      }else{
        await api(`/habits/${habitId}/subscribe`, { method:'POST' })
        setSubs(s=>[...s,habitId])
      }
    } finally{ setBusy(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-12 w-12 grid place-items-center rounded-full bg-neutral-100 border text-sm">{(user?.display_name||user?.email||'U').slice(0,2).toUpperCase()}</span>
          <div className="min-w-0">
            <div className="text-2xl font-semibold truncate">{user?.display_name||user?.email||'User'}</div>
            <div className="text-sm text-neutral-500 truncate">{user?.email}</div>
            {user?.description && <div className="text-sm text-neutral-700 mt-1 line-clamp-2">{user.description}</div>}
          </div>
        </div>
        {isTrusted ? (
          <Button variant="secondary" onClick={async()=>{ await api(`/social/trust/${userId}`, { method:'DELETE' }); setTrusted(t=>t.filter(x=>x!==userId)) }}>Unfollow</Button>
        ) : (
          <Button onClick={async()=>{ await api(`/social/trust/${userId}`, { method:'POST' }); setTrusted(t=>[...t,userId]) }}>Follow</Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Habits */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Habits</div>
            </div>
            {habits.length===0 && <div className="text-sm text-neutral-500">No public habits.</div>}
            {habits.length>0 && (
              <div className="grid md:grid-cols-2 gap-3">
                {habits.map(h=> (
                  <Card key={h.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate">{h.title}</div>
                      {subs.includes(h.id) ? (
                        <Button className="bg-neutral-200 text-neutral-900" disabled={busy} onClick={()=>toggleSubscribe(h.id)}>Unsubscribe</Button>
                      ) : (
                        <Button disabled={busy} onClick={()=>toggleSubscribe(h.id)}>Subscribe</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Groups */}
          <Card>
            <div className="font-medium mb-2">Groups</div>
            {groups.length===0 && <div className="text-sm text-neutral-500">No groups.</div>}
            {groups.length>0 && (
              <div className="grid md:grid-cols-2 gap-3">
                {groups.map((g:any)=> (
                  <Card key={g.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{g.name}</div>
                        {g.members && <div className="text-sm text-neutral-500">Members: {g.members}</div>}
                      </div>
                      <a href={`/groups/${g.id}`} className="text-sm underline">Open</a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
        {/* Profile summary */}
        <Card>
          <div className="font-medium mb-2">Profile Summary</div>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {user?.display_name || 'Unknown'}</div>
            {user?.description && <div><span className="font-medium">About:</span> {user.description}</div>}
            {user?.big_why && <div><span className="font-medium">Big Why:</span> {user.big_why}</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
