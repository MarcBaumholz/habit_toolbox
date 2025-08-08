import { useState, type ReactNode } from 'react'

export function Dialog({ trigger, children, title }: { trigger: ReactNode; children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-block">{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
          <div className="w-full max-w-2xl rounded-xl border bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium">{title}</h3>
              <button onClick={() => setOpen(false)} className="text-neutral-500 hover:text-neutral-800">✕</button>
            </div>
            <div className="pt-3">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}
