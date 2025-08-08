"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { API_BASE } from '../api'

export default function AuthPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'register'>('login')
  return (
    <div className="max-w-md mx-auto mt-10 rounded border bg-white p-6">
      <h1 className="text-xl font-semibold mb-4">{mode==='login'?'Login':'Register'}</h1>
      <div className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex items-center gap-2">
          <Button onClick={async()=>{
            const res = await fetch(`${API_BASE}/auth/${mode}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
            if(!res.ok){ alert('Auth failed'); return }
            const data = await res.json()
            localStorage.setItem('habitlink_token', data.access_token)
            location.href = '/profile'
          }}>{mode==='login'?'Login':'Create account'}</Button>
          <button className="text-sm underline" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Need an account? Register':'Have an account? Login'}</button>
        </div>
      </div>
    </div>
  )
}
