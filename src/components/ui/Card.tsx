import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl border border-gray-200 shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('px-6 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl', className)}
      {...props}
    />
  )
}
