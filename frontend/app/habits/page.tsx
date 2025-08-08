"use client"
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import CreateHabitWizard from './CreateWizard'
import { api } from '@/app/api'

export default function HabitsPage(){
  const [open, setOpen] = useState(false)
  const [habits, setHabits] = useState<{id:number; title:string; current_streak:number}[]|null>(null)

  useEffect(()=>{(async()=>{ try{ setHabits(await api('/habits')) } catch { setHabits([]) } })()},[])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Habits</h1>
        <Dialog title="Create a Powerful Habit" trigger={<Button onClick={()=>setOpen(true)}>New Habit</Button>}>
          <CreateHabitWizard onDone={async()=>{ setOpen(false); try{ setHabits(await api('/habits')) } catch {} }} />
        </Dialog>
      </div>
      {!habits && <div className="muted text-sm">Loading…</div>}
      {habits && habits.length===0 && <div className="muted text-sm">No habits yet. Create your first one.</div>}
      {habits && habits.length>0 && (
        <ul className="grid md:grid-cols-2 gap-4">
          {habits.map(h => (
            <li key={h.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-start gap-2 mb-4">
                <a className="font-semibold text-lg hover:underline" href={`/habits/${h.id}`}>{h.title}</a>
                <div className="ml-auto flex items-center gap-1 text-[var(--cta-active)]"><span>⚡</span><span className="font-semibold">{h.current_streak}</span></div>
              </div>
              <WeekPreview habitId={h.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WeekPreview({ habitId }:{habitId:number}){
  const [week,setWeek] = useState<{week_start:string; days:Record<string,boolean>}|null>(null)
  useEffect(()=>{(async()=>{ try{ setWeek(await api(`/habits/${habitId}/week`)) } catch{} })()},[habitId])
  const days = useMemo(()=>{
    if(!week) return [] as {iso:string; label:string}[]
    const start = new Date(week.week_start)
    const labels = ['M','T','W','T','F','S','S']
    return Array.from({length:7}).map((_,i)=>{
      const d = new Date(start); d.setDate(d.getDate()+i)
      return { iso: d.toISOString().slice(0,10), label: labels[i] }
    })
  },[week])
  if(!week) return <div className="h-24 bg-neutral-50 rounded-xl"/>
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
        <span>KW {getWeekNumber(new Date(week.week_start))}</span>
        <span>Day 1 / 66</span>
      </div>
      <div className="flex gap-3">
        {days.map(d=>{
          const active = !!week.days[d.iso]
          return (
            <button
              key={d.iso}
              onClick={async()=>{ try{ await api(`/habits/${habitId}/toggle/${d.iso}`, { method:'POST' }); setWeek(await api(`/habits/${habitId}/week`)) } catch{} }}
              className={`w-14 h-20 rounded-xl border transition ${active? 'bg-[rgb(var(--primary))] border-transparent shadow-sm':'bg-neutral-50'}`}
              aria-label={`Toggle ${d.label}`}
            />
          )
        })}
      </div>
      <div className="mt-3 w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full bg-[rgb(var(--primary))]" style={{width:'2%'}} />
      </div>
    </div>
  )
}

function getWeekNumber(d:Date){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1))
  return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1)/7)
}
