"use client"
import { useEffect, useState } from 'react'
import { api } from '../api'

export default function SummaryPage() {
  const [data,setData] = useState<any|null>(null)
  useEffect(()=>{ (async()=>{ try{ setData(await api('/summary')) }catch{} })() },[])
  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border bg-[rgb(var(--card))]">
        <div className="p-6 bg-gradient-to-b from-indigo-50 to-white">
          <h1 className="text-2xl font-semibold">Your Weekly Summary</h1>
          <p className="text-sm text-neutral-600">A calm overview of your recent progress.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 p-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="font-medium mb-1">Weekly Stats</div>
            <ul className="text-sm text-neutral-800 space-y-1">
              <li>• Total completions: {data?.total_completions ?? '—'}</li>
              <li>• Best current streak: {data?.best_streak ?? '—'}</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="font-medium mb-1">Most Consistent Habit</div>
            <div className="text-sm text-neutral-800">{data?.best_habit?.title ?? '—'}</div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <div className="font-medium mb-1">Insights from Trusted</div>
            <ul className="space-y-1 text-sm">
              {(data?.trusted_insights||[]).map((m:any)=>(<li key={m.id}>{m.content}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
