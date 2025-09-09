"use client"
import { useEffect, useState } from 'react'
import { api } from '../api'

export default function LearningsPage() {
  const [items,setItems] = useState<any[]>([])
  useEffect(()=>{ (async()=>{ try{ setItems(await api('/learnings')) }catch{} })() },[])
  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border bg-[rgb(var(--card))]">
        <div className="p-6 bg-gradient-to-b from-indigo-50 to-white">
          <h1 className="text-2xl font-semibold">Insights of the Week</h1>
          <p className="text-sm text-neutral-600">Top learnings from across the community.</p>
        </div>
        <ul className="p-4 space-y-3">
          {items.map((m:any)=> (
            <li key={m.id} className="rounded-xl border p-3 bg-white">
              <div className="text-sm text-neutral-800">{m.content}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
