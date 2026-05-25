import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  shimmer?: boolean
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-slate-200/90', className)}
      {...props}
    >
      {shimmer && (
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent"
          aria-hidden
        />
      )}
    </div>
  )
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-full', className)} />
}
