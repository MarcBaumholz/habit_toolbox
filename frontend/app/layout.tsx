import './globals.css'
import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata = { title: 'HabitLink', description: 'Habit building with accountability' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <header className="bg-[rgb(var(--card))] border-b">
          <nav className="mx-auto max-w-6xl px-5 py-4 flex gap-6 items-center">
            <span className="font-semibold">HabitLink</span>
            <Link href="/" className="muted hover:text-black">Dashboard</Link>
            <Link href="/groups" className="muted hover:text-black">Groups</Link>
            <Link href="/habits" className="muted hover:text-black">Habits</Link>
            <Link href="/learnings" className="muted hover:text-black">Learnings</Link>
            <Link href="/summary" className="muted hover:text-black">Summary</Link>
            <Link href="/tools" className="muted hover:text-black">Toolbox</Link>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/profile" className="muted hover:text-black">Profile</Link>
              <Link href="/auth" className="px-3 py-1 rounded-lg border border-neutral-200">Login</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-5">{children}</main>
      </body>
    </html>
  )
}
