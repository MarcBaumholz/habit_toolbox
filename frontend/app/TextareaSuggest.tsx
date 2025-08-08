"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { api } from './api'

export default function TextareaSuggest() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<any[]|null>(null)

  return (
    <div>
      <textarea className="w-full rounded border p-2" placeholder="e.g., I struggle to wake up early" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="pt-2"><Button onClick={async()=>{
        setLoading(true)
        try {
          const tools = await api('/ai/suggest', { method: 'POST', body: JSON.stringify({ query: q }) })
          setRes(tools)
        } finally { setLoading(false) }
      }}>Suggest Tools</Button></div>
      {loading && <div className="text-sm text-neutral-500 mt-2">Finding tools…</div>}
      {res && res.length>0 && (
        <ul className="mt-3 list-disc pl-5">
          {res.map((t:any)=>(<li key={t.id}><span className="font-medium">{t.title}</span>: {t.description}</li>))}
        </ul>
      )}
    </div>
  )
}
