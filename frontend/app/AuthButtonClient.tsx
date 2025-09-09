"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AuthButtonClient(){
  const [token,setToken] = useState<string | null>(null)
  useEffect(()=>{ try{ setToken(localStorage.getItem('habitlink_token')) }catch{} },[])
  function logout(){
    try{
      localStorage.removeItem('habitlink_token')
      localStorage.setItem('habitlink_disable_auto_login','1')
    }catch{}
    if(typeof window!=='undefined') window.location.href = '/'
  }
  if(!token) return <Link href="/auth" className="block rounded-lg px-3 py-2 border border-neutral-200 text-center">Login</Link>
  return <button onClick={logout} className="w-full rounded-lg px-3 py-2 border border-neutral-200 text-center hover:bg-neutral-50">Logout</button>
}
