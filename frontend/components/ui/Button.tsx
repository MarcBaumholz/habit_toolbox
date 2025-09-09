import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

export function Button({ className, children, variant = 'primary', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>) {
  const base = 'btn'
  const map: Record<Variant, string> = {
    primary: 'btn-primary',
    secondary: 'border-neutral-200 bg-[rgb(var(--card))]',
    ghost: 'bg-transparent border-transparent shadow-none',
  }
  return (
    <button
      className={clsx(base, map[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
