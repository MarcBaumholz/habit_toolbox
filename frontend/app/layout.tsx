import './globals.css'
import type { ReactNode } from 'react'
import SidebarNavClient from './SidebarNavClient'

export const metadata = { title: 'HabitLink', description: 'Habit building with accountability' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="min-h-screen flex">
          <SidebarNavClient />
          <main className="flex-1 p-5">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
