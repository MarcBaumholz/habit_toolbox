"use client"
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/app/api'
import { Button } from '@/components/ui/Button'
import WeeklyNavigation from '@/components/WeeklyNavigation'

function useToast(){
  const [msg,setMsg] = useState<string|undefined>()
  return {
    Toast: () => msg? <div className="fixed top-4 right-4 px-3 py-2 rounded-lg bg-black text-white text-sm shadow">{msg}</div>: null,
    show: (m:string)=>{ setMsg(m); setTimeout(()=>setMsg(undefined), 1400) }
  }
}

export default function HabitClient({ habitId }: { habitId: number }){
  const { Toast, show } = useToast()
  const [habit,setHabit] = useState<any|null>(null)
  const [week,setWeek] = useState<{week_start:string; days:Record<string,boolean>}|null>(null)
  const [busy,setBusy] = useState(false)
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>('')

  // Get current week start (Monday)
  const getCurrentWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().slice(0, 10)
  }

  // Initialize with current week
  useEffect(() => {
    if (!selectedWeekStart) {
      setSelectedWeekStart(getCurrentWeekStart())
    }
  }, [selectedWeekStart])

  async function load(){
    try{
      const [h,w] = await Promise.all([
        api(`/habits/${habitId}`),
        api(`/habits/${habitId}/week?week_start=${selectedWeekStart}`),
      ])
      setHabit(h)
      setWeek(w)
    }catch(e){ /* ignore */ }
  }

  useEffect(()=>{ load() },[habitId, selectedWeekStart])

  const daysArr = useMemo(()=>{
    if(!selectedWeekStart) return [] as {iso:string; label:string}[]
    const start = new Date(selectedWeekStart)
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    return Array.from({length:7}).map((_,i)=>{
      const d = new Date(start)
      d.setDate(d.getDate()+i)
      const iso = d.toISOString().slice(0,10)
      return {iso, label: labels[i]}
    })
  },[selectedWeekStart])

  async function toggle(dayIso:string){
    if(busy) return
    setBusy(true)
    try{
      await api(`/habits/${habitId}/toggle/${dayIso}`, { method: 'POST' })
      const w = await api(`/habits/${habitId}/week?week_start=${selectedWeekStart}`)
      setWeek(w)
      const h = await api(`/habits/${habitId}`)
      setHabit(h)
      show('Saved')
    } finally { setBusy(false) }
  }

  if(!habit || !week) return <div className="muted text-sm">Loading…</div>

  const isOwn = habit?.is_own !== undefined ? !!habit.is_own : true

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold">{habit.title}</h1>
        <div className="ml-auto flex items-center gap-2 text-[var(--cta-active)]">
          <span>⚡</span>
          <span className="font-semibold">{habit.current_streak}</span>
        </div>
      </div>

      {selectedWeekStart && (
        <WeeklyNavigation 
          currentWeekStart={selectedWeekStart}
          onWeekChange={setSelectedWeekStart}
          className="mb-6"
        />
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-lg">Weekly Progress</div>
            <div className="text-sm text-gray-600">
              {(() => {
                const start = new Date(selectedWeekStart)
                const end = new Date(start)
                end.setDate(end.getDate() + 6)
                const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return `${formatDate(start)} - ${formatDate(end)}`
              })()}
            </div>
          </div>
          <div className="text-sm muted mb-4">Click a day to mark it complete for the current week.</div>
          <div className="flex items-end gap-3">
            {daysArr.map((d,i)=>{
              const active = !!week.days[d.iso]
              return (
                <button key={d.iso} onClick={()=>toggle(d.iso)}
                  className={`transition-all w-20 h-28 rounded-2xl border flex flex-col items-center justify-end pb-3 relative ${active? 'bg-green-500 text-white border-transparent shadow-sm':'bg-neutral-50 border-[rgba(0,0,0,0.08)]'}`}
                  disabled={busy}
                  aria-label={`Toggle ${d.label}`}
                >
                  <span className="absolute top-1 left-1 text-[10px] text-neutral-500">{d.label}</span>
                  <div className={`w-16 h-16 rounded-xl ${active? 'bg-[rgba(255,255,255,0.25)]':'bg-white border'}`}></div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold text-lg mb-3">Stats & Journey</div>
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-neutral-600">Current Streak</span><span className="font-semibold">{habit.current_streak} days</span></div>
          <div className="text-sm text-neutral-600 mb-2">66‑Day Journey</div>
          <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[rgb(var(--primary))]" style={{width:'2%'}} />
          </div>
          {!isOwn ? (
            habit.is_subscribed ? (
              <Button className="w-full bg-neutral-200 text-neutral-900" onClick={async()=>{ try{ await api(`/habits/${habitId}/unsubscribe`, { method:'POST' }) } catch(e) { /* treat as idempotent */ } finally { setHabit({...habit, is_subscribed:false}); show('Unsubscribed') } }}>Unsubscribe</Button>
            ) : (
              <Button className="w-full" onClick={async()=>{ try{ await api(`/habits/${habitId}/subscribe`, { method:'POST' }); setHabit({...habit, is_subscribed:true}); show('Subscribed'); } catch(e){ show('Unable to subscribe') } }}>Subscribe</Button>
            )
          ) : null}
        </div>
      </div>

      {!!habit.tools?.length && (
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold text-lg mb-2">Linked Tools</div>
          <div className="grid gap-2">
            {habit.tools.map((t:any)=> (
              <div key={t.id} className="rounded-xl border p-3">
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-neutral-600">{t.description}</div>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {(t.keywords||[]).map((k:string)=>(<span key={k} className="chip">{k}</span>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold">The 'Why'</div>
          <div className="text-sm muted mt-1">{habit.why || 'No \"why\" defined.'}</div>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold">Identity & Goal</div>
          <div className="text-sm muted mt-1">{habit.identity_goal || 'No identity goal set.'}</div>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold">Difficulty</div>
          <div className="text-sm muted mt-1">{habit.loop?.difficulty || 'N/A'}</div>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold">Habit Loop</div>
          <div className="text-sm muted mt-1">Cue: {habit.loop?.cue || 'N/A'}</div>
          <div className="text-sm muted">Craving: {habit.loop?.craving || 'N/A'}</div>
          <div className="text-sm muted">Routine: {habit.loop?.routine || 'N/A'}</div>
          <div className="text-sm muted">Reward: {habit.loop?.reward || 'N/A'}</div>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold">Minimal Dose</div>
          <div className="text-sm muted mt-1">{habit.minimal_dose || 'Not set'}</div>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <div className="font-semibold">Implementation Intentions</div>
          <div className="text-sm muted mt-1">{habit.implementation_intentions || 'Not set'}</div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={()=>show('Reminder set')}>Set Reminder</Button>
      </div>
    </div>
  )
}
