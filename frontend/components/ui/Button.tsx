import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

export function Button({ className, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-[rgb(var(--card))] px-3 py-2 text-[color:rgb(var(--text))] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cta',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
