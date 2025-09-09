import './globals.css'
import type { ReactNode } from 'react'
import SidebarNavClient from './SidebarNavClient'
import DarkModeToggle from '@/components/DarkModeToggle'

export const metadata = { title: 'HabitLink', description: 'Habit building with accountability' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="min-h-screen flex">
          <SidebarNavClient />
          <main className="flex-1 p-5 lg:ml-0 ml-0">
            <div className="fixed top-4 right-4 z-50">
              <DarkModeToggle />
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
