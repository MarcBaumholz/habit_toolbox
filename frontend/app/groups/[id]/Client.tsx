"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { api, API_BASE } from '@/app/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ensureToken } from '@/app/lib/auth'

interface ProofItem { user_id: number; day: string; image_url: string; caption?: string }
interface MessageItem { id: number; user_id: number; content: string; type: string; created_at: string }
interface GroupDetail { id: number; name: string; description?: string | null; members: { user_id: number; role: string; habit_title?: string|null; frequency_per_week?: number }[] }

function useToast(){
  const [msg,setMsg] = useState<string|undefined>()
  return { Toast:()=> msg? <div className="fixed top-4 right-4 px-3 py-2 rounded-lg bg-black text-white text-sm shadow">{msg}</div>:null, show:(m:string)=>{ setMsg(m); setTimeout(()=>setMsg(undefined),1300) } }
}

export default function GroupClient({ groupId }: { groupId: number }) {
  const { Toast, show } = useToast()
  const [group, setGroup] = useState<GroupDetail|undefined>()
  const [proofs, setProofs] = useState<ProofItem[]>([])
  const [chat, setChat] = useState<MessageItem[]>([])
  const [learnings, setLearnings] = useState<MessageItem[]>([])
  const [challenges, setChallenges] = useState<MessageItem[]>([])
  const [inputChat, setInputChat] = useState('')
  const [inputSide, setInputSide] = useState('')
  const [attachImage, setAttachImage] = useState<File|null>(null)
  const [rightTab, setRightTab] = useState<'chat'|'learning'|'challenges'>('chat')
  const [me, setMe] = useState<{id:number}|null>(null)
  const [userMap, setUserMap] = useState<Record<number, {display_name?: string|null; email?: string|null; photo_url?: string|null}>>({})
  const [lightbox, setLightbox] = useState<{open:boolean; img?:string; caption?:string; userId?:number}>({open:false})
  const chatRef = useRef<HTMLDivElement>(null)

  async function load() {
    const [g, p, c, l, ch] = await Promise.all([
      api(`/groups/${groupId}`),
      api(`/groups/${groupId}/proofs/week`),
      api(`/groups/${groupId}/messages?type=chat&limit=100&offset=0`),
      api(`/groups/${groupId}/messages?type=learning&limit=100&offset=0`),
      api(`/groups/${groupId}/messages?type=challenge&limit=100&offset=0`).catch(()=>[]),
    ])
    setGroup(g)
    setProofs(p)
    setChat(c)
    setLearnings(l)
    setChallenges(Array.isArray(ch)? ch: [])
    try { const u = await api('/users/me'); setMe(u) } catch {}
    // fetch public profiles for member names
    try {
      const ids = (g.members||[]).map((m:any)=>m.user_id)
      const entries = await Promise.all(ids.map(async(id:number)=>{
        try{ const pu = await api(`/users/${id}`); return [id,{display_name:pu.display_name, email:pu.email, photo_url:pu.photo_url}] as const }catch{ return [id,{}] as const }
      }))
      const map: Record<number, any> = {}
      for(const [id,info] of entries){ map[id]=info }
      setUserMap(map)
    } catch {}
  }
  useEffect(() => { load() }, [groupId])
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }) }, [chat])

  const proofsByUserArr = useMemo(() => {
    const map: Record<number, ProofItem[]> = {}
    for (const p of proofs) {
      map[p.user_id] ||= []
      map[p.user_id].push(p)
    }
    for (const k of Object.keys(map)) {
      map[Number(k)].sort((a,b)=> new Date(a.day).getTime()-new Date(b.day).getTime())
    }
    return map
  }, [proofs])

  async function ensureMember(){
    try{ await api(`/groups/${groupId}`) }catch{}
    if(!group) return
    const amMember = !!group.members?.find(m=>m.user_id===me?.id)
    if(!amMember){
      try{ await api(`/groups/${groupId}/join`, { method:'POST', body: JSON.stringify({}) }) ; setGroup(await api(`/groups/${groupId}`)) }catch{}
    }
  }

  return (
    <div className="space-y-6">
      <Toast />
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">{group?.name || 'Group'}</h1>
          <div className="ml-auto text-sm text-neutral-500">{group?.members?.length || 0} members</div>
        </div>
        {group?.description && (
          <div className="rounded-xl border bg-white p-3 text-sm">
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Purpose</div>
            <div>{group.description}</div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {group?.members?.map(m => (
            <div key={m.user_id} className="flex items-center gap-2 rounded-full border px-3 py-1 bg-white">
              <span className="h-6 w-6 grid place-items-center rounded-full bg-neutral-100 border text-xs">{String(m.user_id).slice(-2)}</span>
              <span className="text-sm">User {m.user_id}</span>
              <span className="text-[10px] rounded bg-neutral-100 px-2 py-0.5 border">{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <Card>
          <div className="flex h-[620px]">
                {/* Left: Weekly Proofs focus, larger panel, 2/3 width */}
                <div className="pr-5 border-r overflow-auto flex-[2] min-w-[420px]">
                  <div className="font-medium mb-2">Weekly Proofs</div>
                  <div className="space-y-3">
                    {group?.members?.map(m => {
                      const freq = m.frequency_per_week || 7
                      const arr = proofsByUserArr[m.user_id] || []
                      return (
                        <div key={m.user_id} className="rounded-xl border p-2 bg-white">
                          <div className="text-sm font-medium mb-1">User {m.user_id}{m.habit_title? ` • ${m.habit_title}`:''}{m.frequency_per_week? ` (${m.frequency_per_week}/wk)`:''}</div>
                          <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {Array.from({length: freq}).map((_,i)=> (
                              <button
                                key={i}
                                className="h-16 rounded-xl bg-neutral-50 border grid place-items-center hover:bg-neutral-100"
                                onClick={async()=>{
                                  if(arr[i]){ // open lightbox for any filled slot (even if not mine)
                                    setLightbox({open:true, img:arr[i].image_url, caption:arr[i].caption, userId:m.user_id}); return
                                  }
                                  if(m.user_id!==me?.id){ show('Only your own cells are uploadable'); return }
                                  if(i < arr.length){ show('Already logged for this slot'); return }
                                  await ensureMember()
                                  const inp = document.createElement('input')
                                  inp.type='file'
                                  inp.accept='image/*'
                                  inp.onchange = async(ev:any)=>{
                                    const file = ev.target?.files?.[0]; if(!file) return
                                    const caption = prompt('Kurze Notiz zum Proof (optional)?') || ''
                                    const fd = new FormData(); fd.append('file', file); if (caption) fd.append('caption', caption)
                                    const token = await ensureToken(API_BASE)
                                    const r = await fetch(`${API_BASE}/groups/${groupId}/proofs/upload`, { method:'POST', headers:{ Authorization: token? `Bearer ${token}`: '' }, body: fd })
                                    if(r.status===403){ await api(`/groups/${groupId}/join`, { method:'POST', body: JSON.stringify({}) }); await fetch(`${API_BASE}/groups/${groupId}/proofs/upload`, { method:'POST', headers:{ Authorization: token? `Bearer ${token}`: '' }, body: fd }) }
                                    setProofs(await api(`/groups/${groupId}/proofs/week`))
                                    show('Proof added')
                                  }
                                  inp.click()
                                }}
                                aria-label={`Upload proof slot ${i+1}`}
                              >
                                {arr[i] ? (
                                  <div className="flex flex-col items-center">
                                    <img src={arr[i].image_url} alt={arr[i].caption||'proof'} className="max-h-12 rounded cursor-zoom-in" />
                                    {arr[i].caption? <div className="text-[10px] text-neutral-500 mt-1 line-clamp-1" title={arr[i].caption}>{arr[i].caption}</div>: null}
                                  </div>
                                ) : <span className="text-neutral-300 text-3xl">?</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )})}
                  </div>
                </div>
                {/* Right: side tabs (1/3 width) */}
                <div className="flex-1 pl-5 flex flex-col">
                  <div className="flex gap-2 mb-2">
                    {(['chat','learning','challenges'] as const).map(k=> (
                      <button key={k} onClick={()=>setRightTab(k)} className={`px-3 py-1.5 rounded-lg border text-sm ${rightTab===k? 'bg-[rgb(var(--primary))] text-white border-transparent':'bg-white'}`}>{k[0].toUpperCase()+k.slice(1)}</button>
                    ))}
                  </div>
                  {rightTab==='chat' && (
                    <>
                      <div ref={chatRef} className="flex-1 overflow-auto rounded-2xl border bg-white p-3">
                        {chat.map(m => (
                          <div key={m.id} className={`my-1 flex ${m.user_id===me?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[72%] rounded-2xl px-3 py-2 text-sm border ${m.user_id===me?.id ? 'bg-[rgb(var(--primary))] text-white border-transparent' : 'bg-neutral-50'}`}>
                              <div className={`text-[11px] mb-1 ${m.user_id===me?.id ? 'text-white/80' : 'text-neutral-600'}`}>{userMap[m.user_id]?.display_name || userMap[m.user_id]?.email || `User ${m.user_id}`}</div>
                              {m.image_url ? (
                                <div className="mb-1">
                                  <img src={m.image_url} alt="attachment" className="max-h-40 rounded cursor-zoom-in" onClick={()=>setLightbox({open:true,img:m.image_url, caption:m.content, userId:m.user_id})} />
                                </div>
                              ) : null}
                              {m.content}
                              <div className={`text-[10px] mt-1 ${m.user_id===me?.id ? 'text-white/70' : 'text-neutral-500'}`}>{new Date(m.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-2 items-center">
                        <input className="flex-1 rounded-lg border p-2" placeholder="Write a message. Shortcuts: /learn, /challenge, /proof" value={inputChat} onChange={e=>setInputChat(e.target.value)} />
                        <label className="text-xs px-2 py-1 rounded border cursor-pointer bg-white">
                          Attach
                          <input type="file" className="hidden" accept="image/*" onChange={e=>setAttachImage(e.target.files?.[0]||null)} />
                        </label>
                        <Button onClick={async()=>{
                          const text = inputChat.trim()
                          if (!text && !attachImage) return
                          let type:'chat'|'learning'|'challenge'|'proof' = 'chat'
                          if (text.startsWith('/learn')) type='learning'
                          else if (text.startsWith('/challenge')) type='challenge'
                          else if (text.startsWith('/proof')) type='proof'
                          let image_url: string | undefined
                          if (attachImage) {
                            const fd = new FormData(); fd.append('file', attachImage)
                            if (type==='proof' && text.replace('/proof','').trim()) fd.append('caption', text.replace('/proof','').trim())
                            const token = await ensureToken(API_BASE)
                            let r = await fetch(`${API_BASE}/groups/${groupId}/proofs/upload`, { method:'POST', headers:{ Authorization: token? `Bearer ${token}`: '' }, body: fd })
                            if(r.status===403){ await api(`/groups/${groupId}/join`, { method:'POST', body: JSON.stringify({}) }); r = await fetch(`${API_BASE}/groups/${groupId}/proofs/upload`, { method:'POST', headers:{ Authorization: token? `Bearer ${token}`: '' }, body: fd }) }
                            const up = await r.json(); image_url = up.image_url
                            setProofs(await api(`/groups/${groupId}/proofs/week`))
                          }
                          try{
                            await api(`/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ content: text || (type==='proof'?'': ''), type, image_url }) })
                          }catch(e:any){
                            // Attempt auto-join then retry on Forbidden
                            if(String(e).includes('Forbidden')){ try{ await api(`/groups/${groupId}/join`, { method:'POST', body: JSON.stringify({}) }) ; await api(`/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ content: text || (type==='proof'?'': ''), type, image_url }) }) }catch{} }
                          }
                          setInputChat(''); setAttachImage(null)
                          if (type==='chat') setChat(await api(`/groups/${groupId}/messages?type=chat&limit=100&offset=0`))
                          if (type==='learning') setLearnings(await api(`/groups/${groupId}/messages?type=learning&limit=100&offset=0`))
                          if (type==='challenge') setChallenges(await api(`/groups/${groupId}/messages?type=challenge&limit=100&offset=0`).catch(()=>[]))
                          show('Sent')
                        }}>Send</Button>
                      </div>
                    </>
                  )}
                  {rightTab==='learning' && (
                    <>
                      <div className="flex-1 overflow-auto rounded-2xl border bg-white p-3">
                        <ul className="list-disc pl-5 space-y-2">
                          {learnings.map(m => (
                            <li key={m.id}>
                              <div className="text-xs text-neutral-500 mb-0.5">User {m.user_id}</div>
                              {(m.content.split('\n').filter(Boolean)).map((line, idx)=>(
                                <div key={idx} className="text-sm">{line}</div>
                              ))}
                              <div className="text-[10px] text-neutral-500">{new Date(m.created_at).toLocaleString()}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input className="flex-1 rounded-lg border p-2" placeholder="Share a learning (bullets allowed)" value={inputSide} onChange={e=>setInputSide(e.target.value)} />
                        <Button onClick={async()=>{
                          if (!inputSide.trim()) return
                          await api(`/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ content: inputSide, type: 'learning' }) })
                          setInputSide('')
                          setLearnings(await api(`/groups/${groupId}/messages?type=learning&limit=100&offset=0`))
                          show('Learning posted')
                        }}>Post</Button>
                      </div>
                    </>
                  )}
                  {rightTab==='challenges' && (
                    <>
                      <div className="flex-1 overflow-auto rounded-2xl border bg-white p-3">
                        <ul className="list-disc pl-5 space-y-2">
                          {challenges.map(m => (
                            <li key={m.id}>
                              <div className="text-xs text-neutral-500 mb-0.5">User {m.user_id}</div>
                              {(m.content.split('\n').filter(Boolean)).map((line, idx)=>(
                                <div key={idx} className="text-sm">{line}</div>
                              ))}
                              <div className="text-[10px] text-neutral-500">{new Date(m.created_at).toLocaleString()}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input className="flex-1 rounded-lg border p-2" placeholder="Start a challenge (bullets allowed)" value={inputSide} onChange={e=>setInputSide(e.target.value)} />
                        <Button onClick={async()=>{
                          if (!inputSide.trim()) return
                          await api(`/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ content: inputSide, type: 'challenge' }) })
                          setInputSide('')
                          setChallenges(await api(`/groups/${groupId}/messages?type=challenge&limit=100&offset=0`).catch(()=>[]))
                          show('Challenge added')
                        }}>Post</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
        </Card>
      </div>

      {lightbox.open && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50" onClick={()=>setLightbox({open:false})}>
          <div className="bg-white rounded-2xl p-3 max-w-3xl w-[92vw]" onClick={e=>e.stopPropagation()}>
            <div className="text-sm text-neutral-500 mb-2">{userMap[lightbox.userId||0]?.display_name || userMap[lightbox.userId||0]?.email || (lightbox.userId? `User ${lightbox.userId}`:'')}</div>
            {lightbox.img? <img src={lightbox.img} alt="proof" className="max-h-[70vh] w-auto mx-auto rounded-xl"/>:null}
            {lightbox.caption? <div className="mt-2 text-sm text-neutral-700">{lightbox.caption}</div>:null}
          </div>
        </div>
      )}
    </div>
  )
}
