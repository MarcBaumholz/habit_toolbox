"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/app/api'
import { useRouter } from 'next/navigation'

function LinkToHabit({ toolId, onLinked }:{ toolId:number; onLinked: ()=>void }){
  const router = useRouter()
  const [habits,setHabits] = useState<any[]>([])
  const [habitId,setHabitId] = useState<number|''>('' as any)
  const [busy,setBusy] = useState(false)

  useEffect(()=>{ (async()=>{ try{ setHabits(await api('/habits')) }catch{} })() },[])

  async function link(){
    if(!habitId || busy) return
    setBusy(true)
    try{
      await api(`/habits/${habitId}/tools`, { method:'POST', body: JSON.stringify({ tool_id: toolId }) })
      onLinked()
      // Navigate directly to the habit to see the linked tool
      router.push(`/habits/${habitId}`)
    } finally { setBusy(false) }
  }

  return (
    <div className="rounded-2xl border p-3 bg-neutral-50">
      <div className="font-semibold mb-2">Link to one of my habits</div>
      <div className="flex items-center gap-2">
        <select className="input" value={habitId} onChange={e=>setHabitId(Number(e.target.value))}>
          <option value="">Select habit…</option>
          {habits.map(h=> <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>
        <Button disabled={!habitId || busy} onClick={link}>Link</Button>
        {habitId? <Button variant="secondary" onClick={()=>router.push(`/habits/${habitId}`)}>Open Habit</Button>:null}
      </div>
    </div>
  )
}

export default function ToolsClient() {
  const router = useRouter()
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
        <Dialog title="Create a New Tool" trigger={<span/>} open={adding} onOpenChange={setAdding}>
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
        <Dialog title={detail.title} trigger={<span/>} open={!!detail} onOpenChange={(v)=>{ if(!v) setDetail(null) }}>
          <div className="space-y-3">
            <div className="text-neutral-700">{detail.description}</div>
            <div className="flex gap-2 flex-wrap">
              {(detail.keywords||[]).map((k:string)=>(<span key={k} className="rounded-full border px-2 py-0.5 text-xs">{k}</span>))}
            </div>
            <div className="pt-1">
              <div className="font-semibold mb-1">How to Use It</div>
              <ul className="list-disc pl-5">
                {(detail.steps||[]).map((s:string, idx:number)=>(<li key={idx}>{s}</li>))}
              </ul>
            </div>
            <LinkToHabit toolId={detail.id} onLinked={async()=>{ try{ const next=await api('/tools'); setTools(next) }catch{}; /* After linking, auto-open the chosen habit page from inside LinkToHabit via its "Open Habit" button. */ }} />
          </div>
        </Dialog>
      )}
    </div>
  )
}
