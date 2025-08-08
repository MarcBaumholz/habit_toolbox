import { clsx } from 'clsx'
import type { PropsWithChildren, HTMLAttributes } from 'react'

export function Card({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={clsx('surface p-4', className)} {...props}>
      {children}
    </div>
  )
}
