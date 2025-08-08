"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { api, API_BASE } from '@/app/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { ensureToken } from '@/app/lib/auth'

interface ProofItem { user_id: number; day: string; image_url: string }
interface MessageItem { id: number; user_id: number; content: string; type: string; created_at: string }
interface GroupDetail { id: number; name: string; members: { user_id: number; role: string }[] }

function useToast(){
  const [msg,setMsg] = useState<string|undefined>()
  return { Toast:()=> msg? <div className="fixed top-4 right-4 px-3 py-2 rounded-lg bg-black text-white text-sm shadow">{msg}</div>:null, show:(m:string)=>{ setMsg(m); setTimeout(()=>setMsg(undefined),1300) } }
}

export default function GroupClient({ groupId }: { groupId: number }) {
  const { Toast, show } = useToast()
  const [group, setGroup] = useState<GroupDetail|undefined>()
  const [proofs, setProofs] = useState<ProofItem[]>([])
  const [fileUrl, setFileUrl] = useState('')
  const [chat, setChat] = useState<MessageItem[]>([])
  const [learnings, setLearnings] = useState<MessageItem[]>([])
  const [inputChat, setInputChat] = useState('')
  const [inputLearn, setInputLearn] = useState('')
  const [chatPage, setChatPage] = useState(0)
  const [learnPage, setLearnPage] = useState(0)
  const [me, setMe] = useState<{id:number}|null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  async function load() {
    const [g, p, c, l] = await Promise.all([
      api(`/groups/${groupId}`),
      api(`/groups/${groupId}/proofs/week`),
      api(`/groups/${groupId}/messages?type=chat&limit=50&offset=${chatPage*50}`),
      api(`/groups/${groupId}/messages?type=learning&limit=50&offset=${learnPage*50}`),
    ])
    setGroup(g)
    setProofs(p)
    setChat(c)
    setLearnings(l)
    try { const u = await api('/users/me'); setMe(u) } catch {}
  }
  useEffect(() => { load() }, [groupId, chatPage, learnPage])
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }) }, [chat])

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  const proofsByUser = useMemo(() => {
    const map: Record<number, Record<string, ProofItem>> = {}
    for (const p of proofs) {
      map[p.user_id] ||= {}
      map[p.user_id][new Date(p.day).toDateString().slice(0,3)] = p
    }
    return map
  }, [proofs])

  return (
    <div className="space-y-6">
      <Toast />
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">{group?.name || 'Group'}</h1>
          <div className="ml-auto text-sm text-neutral-500">{group?.members?.length || 0} members</div>
        </div>
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

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <Tabs tabs={[
            { key: 'chat', label: 'Chat', content: (
              <div className="flex h-[520px]">
                <div className="w-64 pr-3 border-r overflow-auto">
                  <div className="font-medium mb-2">Weekly Proofs</div>
                  <div className="space-y-3">
                    {group?.members?.map(m => (
                      <div key={m.user_id} className="rounded border p-2">
                        <div className="text-sm font-medium mb-1">User {m.user_id}</div>
                        <div className="grid grid-cols-7 gap-1">
                          {weekDays.map(d => (
                            <div key={d} className="h-10 rounded bg-neutral-50 border grid place-items-center">
                              {proofsByUser[m.user_id]?.[d] ? <img src={proofsByUser[m.user_id][d].image_url} className="max-h-8" /> : <span className="text-neutral-300 text-xl">?</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 pl-3 flex flex-col">
                  <div ref={chatRef} className="flex-1 overflow-auto rounded-2xl border bg-white p-3">
                    {chat.map(m => (
                      <div key={m.id} className={`my-1 flex ${m.user_id===me?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[72%] rounded-2xl px-3 py-2 text-sm border ${m.user_id===me?.id ? 'bg-[rgb(var(--primary))] text-white border-transparent' : 'bg-neutral-50'}`}>
                          {m.content}
                          <div className={`text-[10px] mt-1 ${m.user_id===me?.id ? 'text-white/70' : 'text-neutral-500'}`}>{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs muted">Page {chatPage+1}</div>
                    <div className="flex gap-2">
                      <Button className="bg-white text-neutral-900 border" onClick={()=>setChatPage(p=>Math.max(0,p-1))}>Prev</Button>
                      <Button className="bg-white text-neutral-900 border" onClick={()=>setChatPage(p=>p+1)}>Next</Button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input className="flex-1 rounded-lg border p-2" placeholder="Write a message" value={inputChat} onChange={e=>setInputChat(e.target.value)} />
                    <Button onClick={async()=>{
                      if (!inputChat.trim()) return
                      await api(`/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ content: inputChat, type: 'chat' }) })
                      setInputChat('')
                      setChat(await api(`/groups/${groupId}/messages?type=chat&limit=50&offset=${chatPage*50}`))
                      show('Message sent')
                    }}>Send</Button>
                  </div>
                </div>
              </div>
            )},
            { key: 'learn', label: 'Learnings', content: (
              <div>
                <ul className="list-disc pl-5 space-y-2">
                  {learnings.map(m => (
                    <li key={m.id}>
                      {(m.content.split('\n').filter(Boolean)).map((line, idx)=>(
                        <div key={idx} className="text-sm">{line}</div>
                      ))}
                      <div className="text-[10px] text-neutral-500">{new Date(m.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs muted">Page {learnPage+1}</div>
                  <div className="flex gap-2">
                    <Button className="bg-white text-neutral-900 border" onClick={()=>setLearnPage(p=>Math.max(0,p-1))}>Prev</Button>
                    <Button className="bg-white text-neutral-900 border" onClick={()=>setLearnPage(p=>p+1)}>Next</Button>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <input className="flex-1 rounded-lg border p-2" placeholder="Share a learning (bullets allowed)" value={inputLearn} onChange={e=>setInputLearn(e.target.value)} />
                  <Button onClick={async()=>{
                    if (!inputLearn.trim()) return
                    await api(`/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify({ content: inputLearn, type: 'learning' }) })
                    setInputLearn('')
                    setLearnings(await api(`/groups/${groupId}/messages?type=learning&limit=50&offset=${learnPage*50}`))
                    show('Learning posted')
                  }}>Post</Button>
                </div>
              </div>
            )}
          ]} />
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="font-medium mb-2">Upload Proof for Today</div>
            <input className="w-full rounded border p-2" placeholder="Image URL" value={fileUrl} onChange={e=>setFileUrl(e.target.value)} />
            <div className="text-right pt-2">
              <Button onClick={async()=>{
                await api(`/groups/${groupId}/proofs`, { method: 'POST', body: JSON.stringify({ image_url: fileUrl }) })
                setFileUrl('')
                setProofs(await api(`/groups/${groupId}/proofs/week`))
                show('Proof added')
              }}>Upload</Button>
            </div>
            <div className="mt-3">
              <input type="file" onChange={async(e)=>{
                if (!e.target.files || e.target.files.length===0) return
                const fd = new FormData();
                fd.append('file', e.target.files[0])
                const token = await ensureToken(API_BASE)
                await fetch(`${API_BASE}/groups/${groupId}/proofs/upload`, { method:'POST', headers:{ Authorization: token? `Bearer ${token}`: '' }, body: fd })
                setProofs(await api(`/groups/${groupId}/proofs/week`))
                show('Image uploaded')
              }} />
            </div>
          </Card>
          <Card>
            <div className="font-medium mb-2">Members</div>
            <div className="space-y-2">
              {group?.members?.map(m => (
                <div key={m.user_id} className="flex items-center gap-3">
                  <span className="h-8 w-8 grid place-items-center rounded-full bg-neutral-100 border text-xs">{String(m.user_id).slice(-2)}</span>
                  <div className="flex-1">
                    <div className="text-sm">User {m.user_id}</div>
                    <div className="text-[10px] text-neutral-500">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
