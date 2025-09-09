"use client"
import { useEffect, useState } from 'react'
import { apiBaseFromWindow } from '../lib/auth'

export default function AuthPage(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [mode,setMode] = useState<'login'|'register'>('login')
  const [msg,setMsg] = useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setMsg('')
    const base = apiBaseFromWindow()
    const path = mode==='login'? '/auth/login':'/auth/register'
    const res = await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    const ok = res.ok
    const data = ok? await res.json(): null
    if(ok){
      try{ localStorage.setItem('habitlink_token', data.access_token); localStorage.removeItem('habitlink_disable_auto_login') }catch{}
      setMsg(mode==='login'? 'Logged in. You can close this tab.':'Registered and logged in.')
      window.location.href = '/profile'
    }else{
      setMsg('Error: '+await res.text())
    }
  }

  useEffect(()=>{ try{ localStorage.setItem('habitlink_disable_auto_login','1') } catch{} },[])

  function logout(){
    try{ localStorage.removeItem('habitlink_token'); localStorage.setItem('habitlink_disable_auto_login','1') }catch{}
    setMsg('Logged out.')
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">{mode==='login'? 'Login':'Register'}</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn btn-primary w-full" type="submit">{mode==='login'? 'Login':'Register'}</button>
      </form>
      <div className="text-sm text-neutral-600">{mode==='login'? 'Kein Account?':'Schon ein Account?'} <button className="underline" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Registrieren':'Login'}</button></div>
      <div className="text-xs text-neutral-500">{msg}</div>
      <div className="pt-2">
        <button className="w-full border rounded-lg py-2" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
