"use client"
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import CreateHabitWizard from './CreateWizard'
import WeeklyNavigation from '@/components/WeeklyNavigation'
import { api } from '@/app/api'

export default function HabitsPage(){
  const [open, setOpen] = useState(false)
  const [myHabits, setMyHabits] = useState<{id:number; title:string; current_streak:number}[]|null>(null)
  const [subHabits, setSubHabits] = useState<{id:number; title:string; current_streak:number}[]|null>(null)
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
      const [mine, subs] = await Promise.all([
        api('/habits').catch(()=>[]),
        api('/habits/subscriptions').catch(()=>[])
      ])
      setMyHabits(mine); setSubHabits(subs)
    }catch{ setMyHabits([]); setSubHabits([]) }
  }
  useEffect(()=>{ load() },[])

  async function unsubscribe(habitId:number){
    try{
      await api(`/habits/${habitId}/unsubscribe`, { method:'POST' })
      // Reload from server to ensure it persists across tab switches
      await load()
    }catch(e){
      // If server rejects, do not remove locally; optionally show message
      console.warn('Unable to unsubscribe', e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Habits</h1>
        <Dialog title="Create a Powerful Habit" trigger={<Button onClick={()=>setOpen(true)}>New Habit</Button>}>
          <CreateHabitWizard onDone={async()=>{ setOpen(false); await load() }} />
        </Dialog>
      </div>

      {selectedWeekStart && (
        <WeeklyNavigation 
          currentWeekStart={selectedWeekStart}
          onWeekChange={setSelectedWeekStart}
          className="mb-6"
        />
      )}

      {/* My habits */}
      {!myHabits && <div className="muted text-sm">Loading…</div>}
      {myHabits && (
        <>
          {myHabits.length===0 ? <div className="muted text-sm">No habits yet. Create your first one.</div> : (
            <ul className="grid md:grid-cols-2 gap-4">
              {myHabits.map(h => (
                <li key={h.id} className="bg-white rounded-2xl border p-5">
                  <div className="flex items-start gap-2 mb-4">
                    <a className="font-semibold text-lg hover:underline" href={`/habits/${h.id}`}>{h.title}</a>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex items-center gap-1 text-orange-500">
                        <span className="text-lg">🔥</span>
                        <span className="font-bold text-lg">{h.current_streak}</span>
                      </div>
                      {h.current_streak >= 7 && (
                        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                          {h.current_streak >= 30 ? '🔥' : h.current_streak >= 14 ? '💪' : '🎯'} Week
                        </div>
                      )}
                    </div>
                  </div>
                  <WeekPreview habitId={h.id} selectedWeekStart={selectedWeekStart} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Subscribed habits */}
      {subHabits && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Subscribed Habits</h2>
          {subHabits.length===0 ? (
            <div className="muted text-sm">You have not subscribed to any community habits yet.</div>
          ) : (
            <ul className="grid md:grid-cols-2 gap-4">
              {subHabits.map(h => (
                <li key={h.id} className="relative bg-white rounded-2xl border p-5">
                  <button aria-label="Unsubscribe" onClick={()=>unsubscribe(h.id)} className="absolute top-3 right-3 h-6 w-6 rounded-full border text-neutral-500 hover:text-neutral-900">×</button>
                  <div className="flex items-start gap-2 mb-4">
                    <a className="font-semibold text-lg hover:underline" href={`/habits/${h.id}`}>{h.title}</a>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex items-center gap-1 text-orange-500">
                        <span className="text-lg">🔥</span>
                        <span className="font-bold text-lg">{h.current_streak}</span>
                      </div>
                      {h.current_streak >= 7 && (
                        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                          {h.current_streak >= 30 ? '🔥' : h.current_streak >= 14 ? '💪' : '🎯'} Week
                        </div>
                      )}
                    </div>
                  </div>
                  <WeekPreview habitId={h.id} selectedWeekStart={selectedWeekStart} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function WeekPreview({ habitId, selectedWeekStart }:{habitId:number; selectedWeekStart:string}){
  const [week,setWeek] = useState<{week_start:string; days:Record<string,boolean>}|null>(null)
  useEffect(()=>{(async()=>{ try{ setWeek(await api(`/habits/${habitId}/week?week_start=${selectedWeekStart}`)) } catch{} })()},[habitId, selectedWeekStart])
  const days = useMemo(()=>{
    if(!selectedWeekStart) return [] as {iso:string; label:string}[]
    const start = new Date(selectedWeekStart)
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    return Array.from({length:7}).map((_,i)=>{
      const d = new Date(start); d.setDate(d.getDate()+i)
      return { iso: d.toISOString().slice(0,10), label: labels[i] }
    })
  },[selectedWeekStart])
  if(!week) return <div className="h-24 bg-neutral-50 rounded-xl"/>
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
        <div className="flex items-center gap-2">
          <span>KW {getWeekNumber(new Date(selectedWeekStart))}</span>
          <span className="text-xs">
            {(() => {
              const start = new Date(selectedWeekStart)
              const end = new Date(start)
              end.setDate(end.getDate() + 6)
              const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return `${formatDate(start)} - ${formatDate(end)}`
            })()}
          </span>
        </div>
        <span>Day 1 / 66</span>
      </div>
      <div className="flex gap-3">
        {days.map(d=>{
          const active = !!week.days[d.iso]
          return (
            <button
              key={d.iso}
              onClick={async()=>{ try{ await api(`/habits/${habitId}/toggle/${d.iso}`, { method:'POST' }); setWeek(await api(`/habits/${habitId}/week?week_start=${selectedWeekStart}`)) } catch{} }}
              className={`w-14 h-20 rounded-xl border transition relative ${active? 'bg-green-500 text-white border-transparent shadow-sm':'bg-neutral-50'}`}
              aria-label={`Toggle ${d.label}`}
            >
              <span className="absolute top-1 left-1 text-[10px] text-neutral-500">{d.label}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-3 w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500" style={{width:'2%'}} />
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
