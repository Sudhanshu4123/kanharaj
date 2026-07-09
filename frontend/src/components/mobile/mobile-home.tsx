"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Home, Key, Mountain, Building2, Heart, MapPin } from 'lucide-react'
import { MobileTopBar } from './mobile-top-bar'
import { usePropertyStore } from '@/lib/store'
import {
  formatPropertyPriceDisplay,
  formatBedBath,
  formatAreaDisplay,
  getFeaturedOrLatest,
  getPropertyImageUrl,
} from '@/lib/platform-data'
import { cn } from '@/lib/utils'
import { parseSearchInput, getRoutingUrl } from '@/lib/routing-utils'

const quickCategories = [
  { label: 'Buy', icon: Home, href: '/properties?listing=buy', bg: 'bg-[#A21133]' },
  { label: 'Rent', icon: Key, href: '/properties?listing=rent', bg: 'bg-sky-500' },
  { label: 'Plots', icon: Mountain, href: '/properties?type=PLOTS%2FLAND&listing=buy', bg: 'bg-emerald-500' },
  { label: 'Commercial', icon: Building2, href: '/properties?type=COMMERCIAL&listing=buy', bg: 'bg-slate-500' },
]

const collectionCards = [
  {
    title: 'Luxury Homes',
    subtitle: 'Curated high-end estates',
    tag: 'PREMIUM SELECTION',
    href: '/properties?listing=buy',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  },
  {
    title: 'Ready to Move',
    subtitle: 'Zero waiting period',
    href: '/properties?status=ready&listing=buy',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
  },
  {
    title: 'Newly Launched',
    subtitle: 'Best early prices',
    href: '/properties',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
  },
]

export function MobileHome() {
  const { properties, loading, fetchProperties, toggleWishlist, isInWishlist } = usePropertyStore()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProperties(24)
  }, [fetchProperties])

  const recommended = useMemo(() => getFeaturedOrLatest(properties, 6), [properties])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      const parsed = parseSearchInput(q, 'Delhi')
      const href = getRoutingUrl({
        listing: 'buy',
        city: parsed.city,
        search: parsed.search,
      })
      window.location.href = href
    } else {
      window.location.href = '/properties'
    }
  }

  return (
    <div className="lg:hidden bg-white min-h-screen -mt-16 sm:-mt-20 pb-4">
      <MobileTopBar />

      <div className="px-4 pt-4 pb-2">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by locality, project or builder"
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#A21133] focus:bg-white"
          />
        </form>
      </div>

      {/* Quick categories */}
      <div className="px-4 py-4 grid grid-cols-4 gap-3">
        {quickCategories.map((cat) => (
          <Link key={cat.label} href={cat.href} className="flex flex-col items-center gap-2">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm', cat.bg)}>
              <cat.icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">{cat.label}</span>
          </Link>
        ))}
      </div>

      {/* Featured Collections */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-slate-900">Featured Collections</h2>
          <Link href="/properties" className="text-sm font-bold text-[#A21133]">View all</Link>
        </div>

        <Link href={collectionCards[0].href} className="block relative rounded-2xl overflow-hidden h-44 mb-3 shadow-md">
          <Image src={collectionCards[0].image} alt={collectionCards[0].title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute top-3 left-3 bg-[#A21133] text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wide">
            {collectionCards[0].tag}
          </span>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-lg font-black">{collectionCards[0].title}</h3>
            <p className="text-xs text-white/80 font-medium">{collectionCards[0].subtitle}</p>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {collectionCards.slice(1).map((card) => (
            <Link key={card.title} href={card.href} className="relative rounded-2xl overflow-hidden h-28 shadow-sm">
              <Image src={card.image} alt={card.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <h3 className="text-sm font-black leading-tight">{card.title}</h3>
                <p className="text-[10px] text-white/80">{card.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-black text-slate-900 mb-4">Recommended for You</h2>

        {loading && recommended.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {recommended.map((property) => {
              const img = getPropertyImageUrl(property)
              const wishlisted = isInWishlist(String(property.id))
              const isNew = property.featured || (property.createdAt &&
                (Date.now() - new Date(property.createdAt).getTime()) / 86400000 < 30)

              return (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-100 flex items-center justify-center text-slate-400">
                    {property.images && property.images.length > 0 && property.images[0] && property.images[0] !== '[]' ? (
                      <Image src={img} alt={property.title} fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-300">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Image</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(String(property.id))
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <Heart className={cn('w-4 h-4', wishlisted ? 'fill-[#A21133] text-[#A21133]' : 'text-slate-600')} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/75 text-white text-sm font-black px-3 py-1 rounded-lg">
                      {formatPropertyPriceDisplay(property)}
                    </div>
                  </div>
                  <div className="p-4">
                    <span className={cn(
                      'text-[10px] font-black uppercase px-2 py-0.5 rounded',
                      isNew ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    )}>
                      {isNew ? 'New Launch' : 'Ready to Move'}
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="line-clamp-1">{property.address || property.city}</span>
                    </div>
                    <h3 className="font-black text-slate-900 mt-1 line-clamp-1">{property.title}</h3>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600 font-semibold">
                      <span>{formatBedBath(property).beds}</span>
                      <span>{formatAreaDisplay(property.area)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <Link
          href="/properties"
          className="mt-6 block w-full text-center py-3 rounded-xl border-2 border-[#A21133] text-[#A21133] font-bold text-sm"
        >
          View all properties
        </Link>
      </div>
    </div>
  )
}
