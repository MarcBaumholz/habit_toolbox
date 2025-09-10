"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  return (
    <aside className="w-64 border-r bg-[rgb(var(--card))]">
      <div className="px-3 py-3 flex items-center gap-2">
        <button aria-label="Back" onClick={()=>router.back()} className="h-8 w-8 grid place-items-center rounded-lg border hover:bg-neutral-50">←</button>
        <Link href="/" className="px-2 py-1 rounded-lg hover:bg-neutral-50 font-semibold">HabitLink</Link>
      </div>
      <nav className="px-3 pb-4 space-y-1">
        <NavItem href="/tools" label="Toolbox" />
        <NavItem href="/community" label="Community" />
        <NavItem href="/groups" label="My Groups" />
        <NavItem href="/habits" label="Habits" />
        <NavItem href="/profile" label="Profile" />
        <div className="pt-2">
          {/* Reuse the existing auth button for Login/Logout */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <AuthButton />
        </div>
      </nav>
    </aside>
  )
}
