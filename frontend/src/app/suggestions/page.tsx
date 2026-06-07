"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, TrendingUp, Eye, Clock, SearchX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePropertyStore, API_URL } from '@/lib/store'
import { useUserActivityStore } from '@/lib/user-activity-store'
import { HousingPropertyCard } from '@/components/properties/housing-property-card'
import { Property } from '@/lib/data'
import { cn } from '@/lib/utils'

type TabKey = 'for-you' | 'recently-viewed' | 'trending'

export default function SuggestionsPage() {
  const { properties, fetchProperties, loading } = usePropertyStore()
  const { seenPropertyIds, recentSearches } = useUserActivityStore()
  const [activeTab, setActiveTab] = useState<TabKey>('for-you')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (properties.length === 0) {
      fetchProperties(100)
    }
  }, [])

  // Build user preference profile from viewed properties
  const userPreferences = useMemo(() => {
    if (!mounted) return { cities: new Map<string, number>(), types: new Map<string, number>(), bhks: new Map<string, number>() }

    const viewedProps = properties.filter(p => seenPropertyIds.includes(String(p.id)))
    const cities = new Map<string, number>()
    const types = new Map<string, number>()
    const bhks = new Map<string, number>()

    viewedProps.forEach(p => {
      if (p.city) cities.set(p.city.toLowerCase(), (cities.get(p.city.toLowerCase()) || 0) + 1)
      if (p.propertyType) types.set(p.propertyType.toLowerCase(), (types.get(p.propertyType.toLowerCase()) || 0) + 1)
      if (p.bedrooms) bhks.set(String(p.bedrooms), (bhks.get(String(p.bedrooms)) || 0) + 1)
    })

    // Also learn from recent searches
    recentSearches.forEach(s => {
      const label = s.label.toLowerCase()
      // Extract city-like tokens
      const cityMatch = label.match(/in\s+(\w+)/i)
      if (cityMatch) cities.set(cityMatch[1].toLowerCase(), (cities.get(cityMatch[1].toLowerCase()) || 0) + 2)
      // Extract BHK
      const bhkMatch = label.match(/(\d)\s*bhk/i)
      if (bhkMatch) bhks.set(bhkMatch[1], (bhks.get(bhkMatch[1]) || 0) + 2)
    })

    return { cities, types, bhks }
  }, [mounted, properties, seenPropertyIds, recentSearches])

  // Score each property based on user preferences
  const suggestedProperties = useMemo(() => {
    if (!mounted || properties.length === 0) return []

    const scored = properties
      .filter(p => !seenPropertyIds.includes(String(p.id))) // Exclude already viewed
      .map(p => {
        let score = 0
        // City match (strongest signal)
        if (p.city && userPreferences.cities.has(p.city.toLowerCase())) {
          score += (userPreferences.cities.get(p.city.toLowerCase()) || 0) * 10
        }
        // Property type match
        if (p.propertyType && userPreferences.types.has(p.propertyType.toLowerCase())) {
          score += (userPreferences.types.get(p.propertyType.toLowerCase()) || 0) * 5
        }
        // BHK match
        if (p.bedrooms && userPreferences.bhks.has(String(p.bedrooms))) {
          score += (userPreferences.bhks.get(String(p.bedrooms)) || 0) * 3
        }
        // Boost featured
        if (p.featured) score += 2
        // Small recency boost
        if (p.createdAt) {
          const daysOld = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          if (daysOld < 7) score += 3
          else if (daysOld < 30) score += 1
        }
        return { property: p, score }
      })
      .sort((a, b) => b.score - a.score)

    // If user has no preferences, return newest first
    if (userPreferences.cities.size === 0 && userPreferences.types.size === 0 && userPreferences.bhks.size === 0) {
      return properties
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 24)
    }

    return scored.slice(0, 24).map(s => s.property)
  }, [mounted, properties, seenPropertyIds, userPreferences])

  // Recently viewed
  const recentlyViewed = useMemo(() => {
    if (!mounted) return []
    return seenPropertyIds
      .map(id => properties.find(p => String(p.id) === id))
      .filter(Boolean) as Property[]
  }, [mounted, properties, seenPropertyIds])

  // Trending = featured + most recently added
  const trendingProperties = useMemo(() => {
    if (!mounted || properties.length === 0) return []
    return properties
      .slice()
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      .slice(0, 24)
  }, [mounted, properties])

  const tabs: { key: TabKey; label: string; icon: typeof Sparkles; count: number }[] = [
    { key: 'for-you', label: 'For You', icon: Sparkles, count: suggestedProperties.length },
    { key: 'recently-viewed', label: 'Recently Viewed', icon: Eye, count: recentlyViewed.length },
    { key: 'trending', label: 'Trending', icon: TrendingUp, count: trendingProperties.length },
  ]

  const activeProperties =
    activeTab === 'for-you' ? suggestedProperties :
    activeTab === 'recently-viewed' ? recentlyViewed :
    trendingProperties

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Suggestions
              </h1>
              <p className="text-xs text-slate-500 font-medium">Properties picked for you based on your activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border",
                activeTab === tab.key
                  ? "bg-gradient-to-r from-[#f22b68] to-[#e01f5c] text-white border-transparent shadow-md shadow-rose-500/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent searches summary (for-you tab) */}
      {activeTab === 'for-you' && recentSearches.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Based on:</span>
            {recentSearches.slice(0, 5).map(s => (
              <span key={s.id} className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 sm:h-72 bg-slate-100 rounded-xl sm:rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <SearchX className="w-9 h-9 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">
              {activeTab === 'recently-viewed' ? 'No viewed properties yet' : 'No suggestions yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              {activeTab === 'recently-viewed'
                ? 'Properties you view will appear here so you can quickly revisit them.'
                : 'Browse some properties first — we\'ll learn your taste and suggest matches here.'}
            </p>
            <Link
              href="/properties"
              className="mt-5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#f22b68] to-[#e01f5c] text-white font-bold text-sm shadow-md shadow-rose-500/20 hover:shadow-lg transition-all"
            >
              Explore Properties
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5"
            >
              {activeProperties.map((property, i) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <HousingPropertyCard property={property} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
