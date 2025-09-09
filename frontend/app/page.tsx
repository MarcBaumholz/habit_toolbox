'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from './api'
import { useRouter } from 'next/navigation'

function GuideChat(){
  const [q,setQ] = useState('')
  const router = useRouter()
  const shortcuts = useMemo(()=>[
    {k:'group', to:'/groups'},
    {k:'groups', to:'/groups'},
    {k:'habit', to:'/habits'},
    {k:'habits', to:'/habits'},
    {k:'tool', to:'/tools'},
    {k:'tools', to:'/tools'},
    {k:'profile', to:'/profile'},
    {k:'learn', to:'/learnings'},
    {k:'summary', to:'/summary'},
  ],[])
  return (
    <div className="space-y-2">
      <input className="input" placeholder="Ask e.g. ‘take me to my habits’" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ const t=q.toLowerCase(); const hit=shortcuts.find(s=>t.includes(s.k)); if(hit){ router.push(hit.to); setQ('') } }} } />
      <div className="text-xs text-neutral-500">Try: “open groups”, “show toolbox”, “go to profile”.</div>
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const [summary, setSummary] = useState<any | null>(null)
  const [insights, setInsights] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [s, l] = await Promise.all([
          api('/summary').catch(() => null),
          api('/learnings').catch(() => []),
        ])
        if (!mounted) return
        setSummary(s)
        setInsights(Array.isArray(l) ? l : [])
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      {/* Hero with centered Guide Chat and soft cover */}
      <div className="rounded-2xl overflow-hidden border bg-[rgb(var(--card))]">
        <div className="p-8 flex flex-col items-center text-center bg-gradient-to-b from-indigo-50 to-white">
          {/* "egg" visual */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 shadow-sm mb-4" />
          <h1 className="text-3xl font-semibold">HabitLink</h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">Your lightweight hub for building habits, finding accountable groups, and sharing learnings. Calm, focused, and humane.</p>
          <div className="w-full max-w-xl mt-4">
            <GuideChat />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={()=>router.push('/habits')}>Discover Habits</Button>
            <Button variant="secondary" onClick={()=>router.push('/groups')}>Discover Groups</Button>
          </div>
        </div>
        {/* Explorer tiles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {[
            { href:'/groups', title:'Groups', desc:'Find accountability partners', img:'/placeholder/cover-groups.png' },
            { href:'/habits', title:'Habits', desc:'Track and build routines', img:'/placeholder/cover-habits.png' },
            { href:'/tools', title:'Toolbox', desc:'Proven strategies that work', img:'/placeholder/cover-tools.png' },
            { href:'/community', title:'Community', desc:'Find people you trust', img:'/placeholder/cover-people.png' },
          ].map(t => (
            <a key={t.href} href={t.href} className="group block rounded-xl overflow-hidden border bg-white hover:shadow-md transition">
              <div className="h-28 bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">image</div>
              <div className="p-3">
                <div className="font-medium flex items-center justify-between">
                  <span>{t.title}</span>
                  <span className="text-xs text-neutral-500 group-hover:text-neutral-700">Explore →</span>
                </div>
                <div className="text-xs text-neutral-600 mt-1">{t.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Insights and Weekly Summary with enhanced styling */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
          <div className="p-5">
            <div className="font-semibold mb-1">Insights of the Week</div>
            <div className="text-sm text-neutral-500">Top learnings from your trusted network</div>
            <ul className="mt-3 space-y-2">
              {(summary?.trusted_insights || insights || []).slice(0,5).map((m:any)=> (
                <li key={m.id ?? m.created_at ?? Math.random()} className="text-sm text-neutral-800 line-clamp-2">{m.content}</li>
              ))}
            </ul>
            <div className="pt-3"><a href="/learnings" className="underline text-sm">Browse all learnings →</a></div>
          </div>
        </div>
        <div className="rounded-2xl border overflow-hidden bg-gradient-to-b from-indigo-50 to-white">
          <div className="p-5">
            <div className="font-semibold mb-1">Your Weekly Summary</div>
            <div className="text-sm text-neutral-600">A calm overview of your recent progress</div>
            <ul className="text-sm space-y-1 text-neutral-800 mt-3">
              <li>• Total completions (last 7 days): {summary?.total_completions ?? '—'}</li>
              <li>• Best current streak: {summary?.best_streak ?? '—'}</li>
              <li>• Most consistent habit: {summary?.best_habit?.title ?? '—'}</li>
            </ul>
            <div className="pt-3"><a href="/summary" className="underline text-sm">Open full summary →</a></div>
          </div>
        </div>
      </section>
    </div>
  )
}
