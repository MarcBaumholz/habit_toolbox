"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const AuthButton = dynamic(()=>import('./AuthButtonClient'),{ ssr:false })

function NavItem({ href, label }:{ href:string; label:string }){
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')
  const base = "block rounded-lg px-3 py-2 hover:bg-neutral-50"
  const activeCls = active ? "bg-neutral-100 font-medium" : ""
  return <Link href={href} className={`${base} ${activeCls}`}>{label}</Link>
}

export default function SidebarNavClient(){
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border bg-[rgb(var(--card))] hover:bg-neutral-50 dark:hover:bg-slate-700"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 border-r bg-[rgb(var(--card))] 
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-3 py-3 flex items-center gap-2">
          <button aria-label="Back" onClick={()=>router.back()} className="h-8 w-8 grid place-items-center rounded-lg border hover:bg-neutral-50 dark:hover:bg-slate-700">←</button>
          <Link href="/" className="px-2 py-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-slate-700 font-semibold">HabitLink</Link>
        </div>
        <nav className="px-3 pb-4 space-y-1">
        <NavItem href="/tools" label="Toolbox" />
        <NavItem href="/community" label="Community" />
        <NavItem href="/groups" label="My Groups" />
        <NavItem href="/habits" label="Habits" />
        <NavItem href="/analytics" label="Analytics" />
        <NavItem href="/profile" label="Profile" />
          <div className="pt-2">
            <AuthButton />
          </div>
        </nav>
      </aside>
    </>
  )
}
