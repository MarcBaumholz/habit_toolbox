"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '../api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'

interface GroupRead { id: number; name: string; members: number }

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupRead[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await api('/groups')
      setGroups(res)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Groups</h1>
        <Dialog
          title="Create Group"
          trigger={<Button onClick={() => setCreating(true)}>New Group</Button>}
        >
          <div className="space-y-3">
            <input
              className="w-full rounded border p-2"
              placeholder="Group name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="text-right">
              <Button onClick={async () => {
                await api('/groups', { method: 'POST', body: JSON.stringify({ name: newName, is_public: true }) })
                setNewName('')
                await load()
              }}>Create</Button>
            </div>
          </div>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="font-medium mb-2">Discover</div>
          {loading && <div className="text-sm text-neutral-500">Loading…</div>}
          <ul className="space-y-2">
            {groups?.map((g) => (
              <li key={g.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-neutral-500">{g.members} members</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="bg-white text-neutral-900 border" onClick={async()=>{
                    await api(`/groups/${g.id}/join`, { method: 'POST' })
                    await load()
                  }}>Join</Button>
                  <Link href={`/groups/${g.id}`} className="text-sm underline">Open</Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="font-medium mb-2">My Groups</div>
          <div className="text-sm text-neutral-500">All groups you can access.</div>
          <ul className="mt-2 space-y-2">
            {groups?.map((g) => (
              <li key={g.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{g.name}</div>
                </div>
                <Link href={`/groups/${g.id}`} className="text-sm underline">Open</Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
