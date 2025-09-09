'use client'

import { useEffect, useState } from 'react'
import { api } from '../api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface PublicUser { id:number; display_name?:string|null; email:string; photo_url?:string|null; description?:string|null; habits_count?:number; groups_count?:number }

export default function InspirationPage(){
  const [users, setUsers] = useState<PublicUser[]>([])
  const [q, setQ] = useState('')
  const [trusted, setTrusted] = useState<number[]>([])

  async function load(){
    const list = await api(`/users${q?`?search=${encodeURIComponent(q)}`:''}`)
    setUsers(list)
    try{ const t = await api('/social/trusted'); setTrusted(t) }catch{}
  }
  useEffect(()=>{ load() },[q])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Inspiration</h1>
        <Button onClick={async()=>{ await api('/users/dev_seed', { method:'POST' }); await load() }}>Add demo person</Button>
      </div>
      <Card>
        <div className="flex gap-2 items-center">
          <input className="input flex-1" placeholder="Search people by name or email" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-3">
        {users.map(u=> (
          <Card key={u.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="h-12 w-12 grid place-items-center rounded-full bg-neutral-100 border text-sm">
                {(u.display_name||u.email).slice(0,2).toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{u.display_name||u.email}</div>
                  <span className="chip">{u.habits_count||0} habits</span>
                  <span className="chip">{u.groups_count||0} groups</span>
                </div>
                <div className="text-xs text-neutral-500">{u.email}</div>
                {u.description && <div className="mt-1 text-sm text-neutral-700 line-clamp-2">{u.description}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/public/${u.id}`} className="text-sm underline">View</Link>
                {trusted.includes(u.id) ? (
                  <Button variant="secondary" onClick={async()=>{ await api(`/social/trust/${u.id}`, { method:'DELETE' }); setTrusted(t=>t.filter(x=>x!==u.id)) }}>Unsubscribe</Button>
                ) : (
                  <Button onClick={async()=>{ await api(`/social/trust/${u.id}`, { method:'POST' }); setTrusted(t=>[...t,u.id]) }}>Subscribe</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
