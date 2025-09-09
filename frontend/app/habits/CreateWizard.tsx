"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { api } from '@/app/api'

export default function CreateHabitWizard({ onDone }: { onDone?: (habitId: number) => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    icon: '📘',
    keystone: false,
    frequency: '',
    context: '',
    difficulty: 'easy',
    why: '',
    identity_goal: '',
    minimal_dose: '',
    cue: '',
    craving: '',
    routine: '',
    reward: '',
    implementation_intentions: '',
    hurdles: '',
    reminder_type: '',
    is_public: true,
  })

  function next() { setStep(s => Math.min(5, s + 1)) }
  function back() { setStep(s => Math.max(1, s - 1)) }

  async function create() {
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        why: form.why,
        identity_goal: form.identity_goal,
        minimal_dose: form.minimal_dose,
        implementation_intentions: form.implementation_intentions,
        is_public: form.is_public,
        loop: {
          icon: form.icon,
          keystone: form.keystone,
          frequency: form.frequency,
          context: form.context,
          difficulty: form.difficulty,
          habit_loop: { cue: form.cue, craving: form.craving, routine: form.routine, reward: form.reward },
          hurdles: form.hurdles,
          reminder_type: form.reminder_type,
        },
      }
      const res = await api('/habits', { method: 'POST', body: JSON.stringify(payload) })
      onDone?.(res.id)
      // redirect to new habit page
      if (typeof window !== 'undefined') window.location.href = `/habits/${res.id}`
    } finally { setLoading(false) }
  }

  const progress = Math.round((step-1)/4*100)

  return (
    <div className="w-[min(640px,92vw)]">
      <div className="h-2 w-full rounded bg-neutral-100 overflow-hidden mb-3">
        <div className="h-full bg-[rgb(var(--primary))] transition-all" style={{width: `${progress}%`}} />
      </div>
      {step===1 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="text-2xl font-semibold">Create a Powerful Habit (Step 1/5)</div>
            <div className="muted">Start with the basics. What habit are you building?</div>
          </div>
          <div className="grid gap-3">
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Habit Name</label>
              <input autoFocus value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="e.g., Read daily" />
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-2">Icon</label>
              <div className="flex gap-2 pt-1">
                {['📘','⚙️','🧩','💪','🧘','📝'].map(ic=> (
                  <button key={ic} type="button" onClick={()=>setForm(f=>({...f, icon: ic}))} className={`h-10 w-10 rounded-lg border grid place-items-center bg-white ${form.icon===ic? 'ring-2 ring-[rgb(var(--primary))]': ''}`}>{ic}</button>
                ))}
              </div>
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.keystone} onChange={e=>setForm(f=>({...f, keystone:e.target.checked}))} /><span>This is a Keystone Habit</span></label>
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_public} onChange={e=>setForm(f=>({...f, is_public:e.target.checked}))} /><span>Make habit public (discoverable)</span></label>
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={next} disabled={!form.title.trim()} className="px-5 py-2 rounded-xl">Next →</Button></div>
        </div>
      )}

      {step===2 && (
        <div className="space-y-5">
          <div>
            <div className="text-2xl font-semibold">Create a Powerful Habit (Step 2/5)</div>
            <div className="muted">Define the context. When, where, and how often?</div>
          </div>
          <div className="grid gap-3">
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <input value={form.frequency} onChange={e=>setForm(f=>({...f, frequency:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="e.g., Daily, Tue/Thu, twice a day" />
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Context (Time, Duration, Location)</label>
              <input value={form.context} onChange={e=>setForm(f=>({...f, context:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="e.g., Morning, 15 minutes, at desk" />
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <div className="flex gap-2 pt-1">
                {['easy','medium','hard'].map(d => (
                  <button key={d} type="button" onClick={()=>setForm(f=>({...f, difficulty:d}))} className={`px-3 py-1.5 rounded-lg border ${form.difficulty===d? 'bg-[rgb(var(--primary))] text-white' : 'bg-white'}`}>{d[0].toUpperCase()+d.slice(1)}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between"><Button className="bg-white text-neutral-900" onClick={back}>← Back</Button><Button onClick={next}>Next →</Button></div>
        </div>
      )}

      {step===3 && (
        <div className="space-y-5">
          <div className="text-2xl font-semibold">Create a Powerful Habit (Step 3/5)</div>
          <div className="muted">Connect to your identity. Why is this important to you?</div>
          <div className="grid gap-3">
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Why this habit?</label>
              <textarea value={form.why} onChange={e=>setForm(f=>({...f, why:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="What motivates you?" />
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Identity & Goal Setting (SMART Goal)</label>
              <textarea value={form.identity_goal} onChange={e=>setForm(f=>({...f, identity_goal:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="I want to become a person who ..." />
            </div>
          </div>
          <div className="flex justify-between"><Button className="bg-white text-neutral-900" onClick={back}>← Back</Button><Button onClick={next}>Next →</Button></div>
        </div>
      )}

      {step===4 && (
        <div className="space-y-5">
          <div className="text-2xl font-semibold">Create a Powerful Habit (Step 4/5)</div>
          <div className="muted">Design the behavior. Make it obvious, attractive, easy, and satisfying.</div>
          <div className="grid gap-3">
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Minimal Dose ⭐</label>
              <input value={form.minimal_dose} onChange={e=>setForm(f=>({...f, minimal_dose:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="e.g., Read one sentence" />
            </div>
            <div className="grid gap-3">
              {['cue','craving','routine','reward'].map((k)=> (
                <div key={k} className="border rounded-xl p-4 bg-neutral-50">
                  <input value={(form as any)[k]} onChange={e=>setForm(f=>({...f, [k]:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder={`${k[0].toUpperCase()+k.slice(1)}: ...`} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between"><Button className="bg-white text-neutral-900" onClick={back}>← Back</Button><Button onClick={next}>Next →</Button></div>
        </div>
      )}

      {step===5 && (
        <div className="space-y-5">
          <div className="text-2xl font-semibold">Create a Powerful Habit (Step 5/5)</div>
          <div className="muted">Prepare for challenges. What are the hurdles and how will you overcome them?</div>
          <div className="grid gap-3">
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Implementation Intentions (If-Then Plans)</label>
              <textarea value={form.implementation_intentions} onChange={e=>setForm(f=>({...f, implementation_intentions:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="IF I finish breakfast, THEN I will ..." />
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">What hurdles could appear?</label>
              <textarea value={form.hurdles} onChange={e=>setForm(f=>({...f, hurdles:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="Possible obstacles and mitigation" />
            </div>
            <div className="border rounded-xl p-4 bg-neutral-50">
              <label className="block text-sm font-medium mb-1">Reminder Type</label>
              <input value={form.reminder_type} onChange={e=>setForm(f=>({...f, reminder_type:e.target.value}))} className="w-full rounded-lg border p-3 bg-white" placeholder="Calendar, app, social, none ..." />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button className="bg-white text-neutral-900" onClick={back}>← Back</Button>
            <Button onClick={create} disabled={loading}>{loading? 'Creating…' : 'Create Habit'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
