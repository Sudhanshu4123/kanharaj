import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function HousingPropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row overflow-hidden mb-6 h-auto sm:h-[260px] animate-pulse">
      <Skeleton className="w-full sm:w-[320px] h-64 sm:h-full shrink-0 rounded-none" shimmer />
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-6 w-4/5 max-w-md" />
        <Skeleton className="h-4 w-3/5 max-w-sm" />
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100 flex gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex justify-end gap-3 sm:absolute sm:bottom-5 sm:right-5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm">
      <Skeleton className="aspect-[16/10] w-full rounded-none" shimmer />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-6 w-28" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  )
}

export function HomePickCardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 flex flex-col h-full">
      <Skeleton className="h-64 w-full rounded-none" shimmer />
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-3 gap-2 mt-auto">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function HousingPropertyListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <HousingPropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PropertyGridSkeleton({ count = 6, variant = 'card' }: { count?: number; variant?: 'card' | 'home' }) {
  const Card = variant === 'home' ? HomePickCardSkeleton : PropertyCardSkeleton
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  )
}

export function ActivityMiniCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden flex flex-col">
          <Skeleton className="h-24 w-full rounded-none" shimmer />
          <div className="p-2 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-full rounded-lg mt-1" />
          </div>
        </div>
      ))}
    </>
  )
}

export function PropertiesPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] -mt-20">
      <div className="bg-[#6B46C1] h-14" />
      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-72" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <HousingPropertyListSkeleton count={3} />
      </div>
    </div>
  )
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn('w-full min-h-[240px] rounded-2xl', className)} shimmer />
  )
}

export function LocalityPlacesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Skeleton className="h-4 w-4 rounded shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function PropertyDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="aspect-[16/9] w-full max-h-[480px] rounded-2xl" shimmer />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-lg" shimmer />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4 max-w-lg" />
            <Skeleton className="h-5 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
