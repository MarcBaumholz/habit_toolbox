import { useState, type ReactNode } from 'react'

export function Dialog({ trigger, children, title, open: controlledOpen, onOpenChange }: { trigger: ReactNode; children: ReactNode; title?: string; open?: boolean; onOpenChange?: (v:boolean)=>void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (v:boolean) => { (onOpenChange ?? setInternalOpen)(v) }
  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-block">{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
          <div className="w-full max-w-2xl rounded-2xl border bg-white p-5 shadow-lg max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-medium">{title}</h3>
              <button onClick={() => setOpen(false)} className="btn">Close</button>
            </div>
            <div className="pt-3">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}
