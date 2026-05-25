"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Phone,
  CheckSquare,
  Heart,
  Clock,
  PhoneCall,
  Search,
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { usePropertyStore } from '@/lib/store'
import { useUserActivityStore } from '@/lib/user-activity-store'
import { Property } from '@/lib/data'
import { ContactSellerModal } from '@/components/properties/contact-seller-modal'
import { ActivityMiniCardsSkeleton } from '@/components/skeletons/property-skeletons'

export type ActivityTab = 'contacted' | 'seen' | 'saved' | 'searches'

type MyActivityPanelProps = {
  variant?: 'desktop' | 'mobile'
  activeTab: ActivityTab
  setActiveTab: (tab: ActivityTab) => void
  onNavigate?: () => void
}

function propertyImage(property: Property): string {
  return property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
}

export function MyActivityPanel({
  variant = 'desktop',
  activeTab,
  setActiveTab,
  onNavigate,
}: MyActivityPanelProps) {
  const { properties, wishlist, fetchProperties, loading } = usePropertyStore()
  const {
    seenPropertyIds,
    contactedPropertyIds,
    recentSearches,
  } = useUserActivityStore()

  const [contactProperty, setContactProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (properties.length === 0) fetchProperties()
  }, [properties.length, fetchProperties])

  const savedIds = wishlist
  const counts = useMemo(
    () => ({
      contacted: contactedPropertyIds.length,
      seen: seenPropertyIds.length,
      saved: savedIds.length,
      searches: recentSearches.length,
    }),
    [contactedPropertyIds.length, seenPropertyIds.length, savedIds.length, recentSearches.length]
  )

  const resolveProperties = (ids: string[]): Property[] =>
    ids
      .map((id) => properties.find((p) => String(p.id) === id))
      .filter((p): p is Property => !!p)

  const tabProperties = useMemo(() => {
    if (activeTab === 'contacted') return resolveProperties(contactedPropertyIds)
    if (activeTab === 'seen') return resolveProperties(seenPropertyIds)
    if (activeTab === 'saved') return resolveProperties(savedIds)
    return []
  }, [activeTab, contactedPropertyIds, seenPropertyIds, savedIds, properties])

  const padCount = (n: number) => String(n).padStart(2, '0')

  const activeCount =
    activeTab === 'contacted'
      ? counts.contacted
      : activeTab === 'seen'
        ? counts.seen
        : activeTab === 'saved'
          ? counts.saved
          : 0
  const showPropertySkeleton =
    activeTab !== 'searches' &&
    loading &&
    tabProperties.length === 0 &&
    (properties.length === 0 || activeCount > 0)

  const tabs: { id: ActivityTab; label: string; shortLabel: string; icon: typeof Phone; count: number }[] = [
    { id: 'contacted', label: 'Contacted Properties', shortLabel: 'Contacted', icon: Phone, count: counts.contacted },
    { id: 'seen', label: 'Seen Properties', shortLabel: 'Seen', icon: CheckSquare, count: counts.seen },
    { id: 'saved', label: 'Saved Properties', shortLabel: 'Saved', icon: Heart, count: counts.saved },
    { id: 'searches', label: 'Recent Searches', shortLabel: 'Searches', icon: Clock, count: counts.searches },
  ]

  const isMobile = variant === 'mobile'

  return (
    <>
      <div className="flex flex-col gap-2">
        {!isMobile && (
          <h3 className="text-sm font-black text-slate-800 tracking-tight">My Activity</h3>
        )}
        {isMobile && (
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">My Activity</span>
        )}
        <div className="grid grid-cols-4 gap-1.5 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-between rounded-xl border text-center transition-all duration-200 relative',
                  isMobile ? 'p-1.5 min-h-[76px]' : 'p-2 min-h-[84px]',
                  active
                    ? 'border-indigo-500 bg-indigo-50/20 text-indigo-700 shadow-sm'
                    : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600'
                )}
              >
                <div
                  className={cn(
                    'rounded-full flex items-center justify-center mb-1 shrink-0',
                    isMobile ? 'w-6 h-6' : 'w-7 h-7',
                    tab.id === 'contacted' && 'bg-[#fef2f2] text-rose-500',
                    tab.id === 'seen' && 'bg-[#f5f3ff] text-indigo-500',
                    tab.id === 'saved' && 'bg-[#fff1f2] text-rose-600',
                    tab.id === 'searches' && 'bg-[#eff6ff] text-blue-500'
                  )}
                >
                  <Icon className={cn(isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4', tab.id === 'saved' && 'fill-rose-500 text-rose-500')} />
                </div>
                <span className={cn('font-black leading-tight text-slate-700', isMobile ? 'text-[8px]' : 'text-[10px]')}>
                  {isMobile ? tab.shortLabel : tab.label}
                </span>
                <span className="text-[10px] font-extrabold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-full mt-1">
                  {padCount(tab.count)}
                </span>
                {active && !isMobile && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-indigo-500 rotate-45 z-10" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-2 gap-3 mt-1 bg-slate-50/50 rounded-2xl border border-slate-100',
          isMobile ? 'p-2 gap-2' : 'p-2.5'
        )}
      >
        {showPropertySkeleton ? (
          <ActivityMiniCardsSkeleton count={2} />
        ) : activeTab === 'searches' ? (
          recentSearches.length > 0 ? (
            recentSearches.slice(0, 4).map((search) => (
              <Link
                key={search.id}
                href={search.href}
                onClick={onNavigate}
                className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-indigo-200 transition-colors"
              >
                <div className={cn('relative w-full bg-indigo-50 flex items-center justify-center', isMobile ? 'h-16' : 'h-24')}>
                  <Search className={cn('text-indigo-400', isMobile ? 'h-6 w-6' : 'h-8 w-8')} />
                </div>
                <div className={cn('flex flex-col flex-grow', isMobile ? 'p-1.5' : 'p-2')}>
                  <h5 className={cn('font-extrabold text-slate-800 leading-snug line-clamp-2', isMobile ? 'text-[8px]' : 'text-[10px]')}>
                    {search.label}
                  </h5>
                  <p className={cn('font-semibold text-slate-400 mt-0.5', isMobile ? 'text-[8px]' : 'text-[9px]')}>
                    Tap to open results
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <EmptyActivity message="No recent searches yet." colSpan />
          )
        ) : tabProperties.length > 0 ? (
          tabProperties.slice(0, 4).map((property) => (
            <div
              key={property.id}
              className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <Link href={`/property/${property.id}`} onClick={onNavigate} className="block">
                <div className={cn('relative w-full bg-slate-100', isMobile ? 'h-16' : 'h-24')}>
                  <img
                    src={propertyImage(property)}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className={cn('flex flex-col flex-grow', isMobile ? 'p-1.5' : 'p-2')}>
                  <div className={cn('font-black text-slate-900 leading-tight mb-1', isMobile ? 'text-[11px]' : 'text-[13px]')}>
                    {formatPrice(property.price)}
                  </div>
                  <h5 className={cn('font-extrabold text-slate-800 leading-snug line-clamp-1', isMobile ? 'text-[8px]' : 'text-[10px]')}>
                    {property.title}
                  </h5>
                  <p className={cn('font-semibold text-slate-400 mt-0.5 truncate', isMobile ? 'text-[8px]' : 'text-[9px]')}>
                    {property.city || property.address}
                  </p>
                </div>
              </Link>
              <div className={cn(isMobile ? 'p-1 pt-0' : 'p-1.5 pt-0')}>
                <button
                  type="button"
                  onClick={() => setContactProperty(property)}
                  className={cn(
                    'w-full bg-[#10b981] hover:bg-[#059669] text-white rounded-lg flex items-center justify-center gap-1 font-extrabold shadow-sm transition-colors',
                    isMobile ? 'h-6.5 text-[9px] rounded-md' : 'h-8 text-[11px]'
                  )}
                >
                  <PhoneCall className={isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                  Contact
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyActivity
            message={
              activeTab === 'saved'
                ? 'Heart properties to save them here.'
                : activeTab === 'contacted'
                  ? 'Contact a listing to see it here.'
                  : 'Open property pages to track seen listings.'
            }
            colSpan
          />
        )}
      </div>

      {contactProperty && (
        <ContactSellerModal
          property={contactProperty}
          onClose={() => setContactProperty(null)}
        />
      )}
    </>
  )
}

function EmptyActivity({ message, colSpan }: { message: string; colSpan?: boolean }) {
  return (
    <div
      className={cn(
        'col-span-2 py-8 text-center text-xs font-semibold text-slate-400 bg-white rounded-xl border border-dashed border-slate-200',
        colSpan && 'col-span-2'
      )}
    >
      {message}
    </div>
  )
}
