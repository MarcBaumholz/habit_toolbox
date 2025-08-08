"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/app/api'

export default function ToolsClient() {
  const [tools, setTools] = useState<any[] | null>(null)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [detail, setDetail] = useState<any | null>(null)
  const [form, setForm] = useState({ title: '', description: '', keywords: '', steps: '' })
  const [me, setMe] = useState<any | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const list = await api('/tools')
        setTools(list)
      } catch { setTools([]) }
      try {
        const u = await api('/users/me')
        setMe(u)
      } catch {}
    })()
  }, [])

  const filtered = useMemo(() => {
    if (!tools) return null
    const q = query.toLowerCase()
    return tools.filter(t => !q || (t.title||'').toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q) || (t.keywords||[]).some((k:string)=>k.toLowerCase().includes(q)))
  }, [tools, query])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Habit Toolbox</h1>
        <Button onClick={()=>setAdding(true)}>Add Custom Tool</Button>
      </div>

      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tools by name, keyword, or description..." className="w-full rounded border p-2" />

      {!filtered && <div className="text-sm text-neutral-500">Loading…</div>}
      {filtered && filtered.length === 0 && <div className="text-sm text-neutral-500">No tools yet.</div>}

      {filtered && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(t => (
            <Card key={t.id} className="p-4 cursor-pointer" onClick={()=>setDetail(t)}>
              <div className="text-lg font-semibold">{t.title}</div>
              <div className="text-sm text-neutral-600">{t.description}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                {(t.keywords||[]).map((k:string)=>(<span key={k} className="rounded-full border px-2 py-0.5 text-xs">{k}</span>))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {adding && (
        <Dialog title="Create a New Tool" trigger={<span/>}>
          <form className="space-y-3" onSubmit={async e=>{
            e.preventDefault()
            if (!form.title.trim() || !form.description.trim()) return
            const payload = {
              title: form.title.trim(),
              description: form.description.trim(),
              keywords: form.keywords.split(',').map(s=>s.trim()).filter(Boolean),
              steps: form.steps.split('\n').map(s=>s.trim()).filter(Boolean)
            }
            const tool = await api('/tools', { method: 'POST', body: JSON.stringify(payload) })
            const next = await api('/tools')
            setTools(next)
            setAdding(false)
            setDetail(tool)
          }}>
            <div>
              <label className="block text-sm font-medium">Tool Name</label>
              <input required value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} className="mt-1 w-full rounded border p-2" placeholder="e.g., The Pomodoro Technique" />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea required value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} className="mt-1 w-full rounded border p-2" placeholder="Briefly explain what this tool is." />
            </div>
            <div>
              <label className="block text-sm font-medium">Keywords (comma-separated)</label>
              <input value={form.keywords} onChange={e=>setForm(f=>({...f, keywords:e.target.value}))} className="mt-1 w-full rounded border p-2" placeholder="e.g., Focus, Productivity, Time Management" />
            </div>
            <div>
              <label className="block text-sm font-medium">How to use it (one step per line)</label>
              <textarea value={form.steps} onChange={e=>setForm(f=>({...f, steps:e.target.value}))} className="mt-1 w-full rounded border p-2" placeholder="Step 1: Do this\nStep 2: Do that" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" className="bg-white text-neutral-900" onClick={()=>setAdding(false)}>Cancel</Button>
              <Button type="submit">Create Tool</Button>
            </div>
          </form>
        </Dialog>
      )}

      {detail && (
        <Dialog title={detail.title} trigger={<span/>}>
          <div className="space-y-2">
            <div className="text-neutral-700">{detail.description}</div>
            <div className="flex gap-2 flex-wrap">
              {(detail.keywords||[]).map((k:string)=>(<span key={k} className="rounded-full border px-2 py-0.5 text-xs">{k}</span>))}
            </div>
            {detail.created_by_user_id && (
              <div className="text-sm text-neutral-500 flex items-center gap-2 pt-1">
                <span>👤</span>
                <span>Created by User {detail.created_by_user_id}</span>
              </div>
            )}
            <div className="pt-2">
              <div className="font-semibold">How to Use It:</div>
              <ul className="list-disc pl-5">
                {(detail.steps||[]).map((s:string, idx:number)=>(<li key={idx}>{s}</li>))}
              </ul>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
