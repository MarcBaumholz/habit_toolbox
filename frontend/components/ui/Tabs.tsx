import { useState, type ReactNode } from 'react'

export function Tabs({ tabs }: { tabs: { key: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key)
  return (
    <div>
      <div className="flex gap-2 border-b">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-3 py-2 text-sm ${active === t.key ? 'border-b-2 border-neutral-900 font-medium' : 'text-neutral-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-3">
        {tabs.find(t => t.key === active)?.content}
      </div>
    </div>
  )
}
