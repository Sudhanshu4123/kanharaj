"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Home, Building2, MapPin, Shield, Phone, ChevronRight, ChevronDown, Award, Compass, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/home/search-bar'
import { FeaturedCollections } from '@/components/home/featured-collections'
import { ProjectGallery } from '@/components/home/project-gallery'
import { PropertyGridSkeleton } from '@/components/skeletons/property-skeletons'
import { usePropertyStore } from '@/lib/store'
import { cn, getPropertyUrl } from '@/lib/utils'
import { HOME_FAQS } from '@/lib/seo'
import {
  fetchPlatformStats,
  getFeaturedOrLatest,
  getPopularCities,
  getPropertyImageUrl,
  formatPropertyPriceDisplay,
  formatAreaDisplay,
  formatBedBath,
  formatStatCount,
  getNewlyAdded
} from '@/lib/platform-data'

const faqs = HOME_FAQS

const heroBackgrounds: Record<string, string> = {
  buy: '/hero-housing.png',
  rent: '/hero-rent.png',
  projects: '/hero-housing.png',
  commercial: '/hero-housing.png',
  plots: '/hero-housing.png',
  pg: '/hero-housing.png',
}

const convertArea = (value: number, from: string) => {
  let sqft = 0
  if (from === 'sqft') sqft = value
  else if (from === 'sqyd') sqft = value * 9
  else if (from === 'sqm') sqft = value * 10.7639
  else if (from === 'acre') sqft = value * 43560
  else if (from === 'hectare') sqft = value * 107639

  return {
    sqft: sqft,
    sqyd: sqft / 9,
    sqm: sqft / 10.7639,
    acre: sqft / 43560,
    hectare: sqft / 107639
  }
}

const calculateEMI = (p: number, annualRate: number, years: number) => {
  const r = annualRate / 1200
  const n = years * 12
  if (r === 0) return { emi: p / n, totalInterest: 0, totalPayment: p }
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const totalPayment = emi * n
  const totalInterest = totalPayment - p
  return { emi, totalInterest, totalPayment }
}

export default function HomeContent() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'projects' | 'commercial' | 'pg' | 'plots'>('buy')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - 340 : scrollLeft + 340
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }
  const [platformStats, setPlatformStats] = useState({
    properties: '0',
    buyers: '0',
    cities: '0',
    verifiedPercent: '100',
  })

  // Area & EMI Calculators State (Declared but unused locally - kept for compatibility)
  const [areaValue, setAreaValue] = useState<number>(100)
  const [areaUnit, setAreaUnit] = useState<string>('sqft')
  const [emiAmount, setEmiAmount] = useState<number>(7500000)
  const [emiRate, setEmiRate] = useState<number>(8.6)
  const [emiTenure, setEmiTenure] = useState<number>(20)

  const { properties, loading } = usePropertyStore()

  useEffect(() => {
    setMounted(true)
    usePropertyStore.getState().fetchProperties(36)

    fetchPlatformStats().then((data) => {
      if (data) {
        setPlatformStats({
          properties: formatStatCount(data.properties),
          buyers: formatStatCount(data.buyers),
          cities: formatStatCount(data.cities),
          verifiedPercent: String(data.verifiedPercent),
        })
      }
    })
  }, [])

  const displayProperties = useMemo(() => getFeaturedOrLatest(properties, 3), [properties])
  const popularCities = useMemo(() => getPopularCities(properties, 4), [properties])
  const newlyAddedProperties = useMemo(() => getNewlyAdded(properties, 8), [properties])

  const getHeroConfig = () => {
    switch (activeTab) {
      case 'buy':
        return {
          title: 'Find Your Perfect Property in All india',
          subtitle: 'Verified flats, builder floors, and luxury homes directly from partners & builders.',
          bgImage: heroBackgrounds.buy,
          gradientClass: 'from-slate-950/70 via-slate-900/50 to-slate-900/10',
        }
      case 'rent':
        return {
          title: 'Rental Properties in All India',
          subtitle: 'Ready-to-move-in flats and houses at direct prices.',
          bgImage: heroBackgrounds.rent,
          gradientClass: 'from-indigo-950/70 via-indigo-900/50 to-indigo-900/10',
        }
      case 'projects':
        return {
          title: 'Premium New Projects',
          subtitle: 'Explore ready-to-move and under construction developer projects directly from partners & builders.',
          bgImage: heroBackgrounds.projects,
          gradientClass: 'from-slate-950/70 via-slate-900/50 to-slate-900/10',
        }
      case 'commercial':
        return {
          title: 'Premium Commercial Spaces',
          subtitle: 'Offices, shops, and showrooms in premium commercial hubs.',
          bgImage: heroBackgrounds.commercial,
          gradientClass: 'from-slate-950/70 via-slate-900/50 to-slate-900/10',
        }
      case 'pg':
        return {
          title: 'PG & Shared Accommodations',
          subtitle: 'Affordable and verified paying guest stays in Dwarka Delhi.',
          bgImage: heroBackgrounds.pg,
          gradientClass: 'from-emerald-950/70 via-emerald-900/50 to-emerald-900/10',
        }
      case 'plots':
        return {
          title: 'Residential & Commercial Plots',
          subtitle: 'Premium land and plots in upcoming locations.',
          bgImage: heroBackgrounds.plots,
          gradientClass: 'from-amber-950/70 via-amber-900/50 to-amber-900/10',
        }
      default:
        return {
          title: 'Find Your Perfect Property in Dwarka',
          subtitle: 'Verified flats, builder floors, and luxury homes directly from partners & builders.',
          bgImage: heroBackgrounds.buy,
          gradientClass: 'from-slate-950/70 via-slate-900/50 to-slate-900/10',
        }
    }
  }

  const currentTheme = getHeroConfig()

  return (
    <div className="min-h-screen bg-slate-50/30 overflow-x-hidden font-sans">
      {/* ═══════════════════════════════════════════════════
          HERO SECTION
          - RENT tab  → full coral image background (Housing.com style)
          - BUY/other → purple gradient + right family panel
      ═══════════════════════════════════════════════════ */}

      {activeTab === 'rent' ? (
        /* ── RENT: Full background image, dark text, Housing.com layout ── */
        <section className="relative min-h-[420px] sm:min-h-[480px] flex items-center pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden">
          {/* Full coral banner image */}
          <div className="absolute inset-0">
            <Image
              src="/hero-rent.png"
              alt="Rental Properties"
              fill
              className="object-cover object-center"
              priority
              quality={90}
              sizes="100vw"
            />
          </div>

          {/* Content — centered in left half, DARK text (image is light coral) */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center w-full max-w-[55%] gap-5">

              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-bold text-slate-800 leading-tight tracking-tight">
                  {currentTheme.title}
                </h1>
                <p className="mt-2 text-[11px] sm:text-xs md:text-sm text-slate-600 font-semibold max-w-sm leading-relaxed">
                  {currentTheme.subtitle}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="w-full max-w-xl"
              >
                <SearchBar activeTab={activeTab} setActiveTab={setActiveTab} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-wrap gap-2 sm:gap-3 w-full"
              >
                {[
                  { value: platformStats.properties, label: 'Properties Listed' },
                  { value: platformStats.buyers, label: 'Happy Clients' },
                  { value: `${platformStats.verifiedPercent}%`, label: 'Partner Verified' },
                  { value: platformStats.cities, label: 'Prime Regions' },
                ].map((s) => (
                  <div key={s.label} className="text-center py-2 px-3 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 flex-1 min-w-[85px] transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 shadow">
                    <p className="text-sm sm:text-base font-black text-slate-800 tracking-tight">{s.value}</p>
                    <p className="text-[8px] sm:text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>

            </div>
          </div>
        </section>
      ) : (
        /* ── BUY / PROJECTS / COMMERCIAL / PG / PLOTS: Purple gradient + right panel ── */
        <section className={cn(
          "relative min-h-[420px] sm:min-h-[480px] flex items-center pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden",
          activeTab === 'pg'
            ? "bg-gradient-to-br from-[#065f46] via-[#047857] to-[#10b981]"
            : activeTab === 'plots'
            ? "bg-gradient-to-br from-[#78350f] via-[#b45309] to-[#d97706]"
            : "bg-gradient-to-br from-[#3a28b0] via-[#5235d8] to-[#6c48e8]"
        )}>
          {/* Family photo — right half */}
          <div className="absolute right-0 top-0 bottom-0 w-[44%] md:w-[40%] z-0 pointer-events-none">
            <Image
              src={currentTheme.bgImage}
              alt="Happy family finding perfect property"
              fill
              className="object-cover object-[82%_top]"
              priority
              quality={90}
              sizes="44vw"
            />
            <div className={cn(
              "absolute inset-y-0 left-0 w-28 z-10 bg-gradient-to-r to-transparent",
              activeTab === 'pg' ? "from-[#047857]" : activeTab === 'plots' ? "from-[#b45309]" : "from-[#5235d8]"
            )} />
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-16 z-10 bg-gradient-to-t to-transparent",
              activeTab === 'pg' ? "from-[#065f46]/60" : activeTab === 'plots' ? "from-[#78350f]/60" : "from-[#3a28b0]/60"
            )} />
          </div>

          {/* Building line SVG */}
          <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
            <svg className="absolute bottom-0 left-0 h-full w-[56%] opacity-[0.12]" viewBox="0 0 600 400" preserveAspectRatio="xMinYMax meet" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" stroke="white" strokeWidth="1.2">
                <rect x="20" y="120" width="30" height="280" /><rect x="25" y="140" width="6" height="8" /><rect x="35" y="140" width="6" height="8" />
                <rect x="25" y="170" width="6" height="8" /><rect x="35" y="170" width="6" height="8" />
                <rect x="60" y="60" width="50" height="340" /><rect x="68" y="80" width="8" height="10" /><rect x="82" y="80" width="8" height="10" /><rect x="96" y="80" width="8" height="10" />
                <rect x="68" y="116" width="8" height="10" /><rect x="82" y="116" width="8" height="10" /><rect x="96" y="116" width="8" height="10" />
                <rect x="120" y="90" width="40" height="310" /><rect x="128" y="108" width="7" height="9" /><rect x="140" y="108" width="7" height="9" /><rect x="152" y="108" width="7" height="9" />
                <rect x="170" y="150" width="28" height="250" /><rect x="176" y="165" width="6" height="8" /><rect x="186" y="165" width="6" height="8" />
                <rect x="205" y="180" width="35" height="220" /><rect x="210" y="195" width="7" height="9" /><rect x="222" y="195" width="7" height="9" />
                <rect x="248" y="210" width="22" height="190" /><rect x="278" y="240" width="18" height="160" />
              </g>
            </svg>
            <svg className="absolute top-10 left-[14%] opacity-25 w-16" viewBox="0 0 80 25" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12 Q9 7 13 12" fill="none" stroke="white" strokeWidth="1.4"/>
              <path d="M22 8 Q26 3 30 8" fill="none" stroke="white" strokeWidth="1.4"/>
              <path d="M42 14 Q46 9 50 14" fill="none" stroke="white" strokeWidth="1.4"/>
            </svg>
          </div>

          {/* Content — white text on purple/dark bg */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center w-full max-w-[55%] gap-5">

              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <h1 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-[2.1rem] font-bold text-white leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                  {currentTheme.title}
                </h1>
                <p className="mt-2 text-[11px] sm:text-xs md:text-sm text-white/80 font-semibold max-w-sm leading-relaxed">
                  {currentTheme.subtitle}
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="w-full max-w-xl">
                <SearchBar activeTab={activeTab} setActiveTab={setActiveTab} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex flex-wrap gap-2 sm:gap-3 w-full">
                {[
                  { value: platformStats.properties, label: 'Properties Listed' },
                  { value: platformStats.buyers, label: 'Happy Clients' },
                  { value: `${platformStats.verifiedPercent}%`, label: 'Partner Verified' },
                  { value: platformStats.cities, label: 'Prime Regions' },
                ].map((s) => (
                  <div key={s.label} className="text-center py-2 px-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex-1 min-w-[85px] transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 shadow">
                    <p className="text-sm sm:text-base font-black text-white tracking-tight">{s.value}</p>
                    <p className="text-[8px] sm:text-[9px] text-white/65 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>

            </div>
          </div>
        </section>
      )}





      {/* Kanharaj's Top Picks */}
      <section className="py-10 sm:py-14 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                Handpicked Premium Properties
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-2">Kanharaj's Top Picks</h2>
              <p className="text-slate-500 mt-1 text-xs font-medium">Most premium and recommended properties with direct builder contact.</p>
            </div>
            <Link href="/properties">
              <Button className="bg-slate-950 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center gap-1.5 h-10 px-5 shadow-sm transition-all text-sm">
                Browse All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {loading && displayProperties.length === 0 ? (
            <PropertyGridSkeleton count={3} variant="home" />
          ) : displayProperties.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 justify-center justify-items-center">
              {displayProperties.map((property, index) => {
                const { beds, baths } = formatBedBath(property)
                const isVerified = property.featured || (property.images?.length ?? 0) > 0
                return (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.06 }}
                    className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-500/30 transition-all duration-300 flex flex-col h-full max-w-[380px] w-full mx-auto"
                  >
                    {/* Image Area */}
                    <div className="relative h-28 sm:h-52 overflow-hidden shrink-0 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                      {property.images && property.images.length > 0 && property.images[0] && property.images[0] !== '[]' ? (
                        <img
                          src={getPropertyImageUrl(property)}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.93]"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-slate-300">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Image</span>
                        </div>
                      )}
                      {/* Gradient bottom shadow to ensure overlay readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      {/* Badges container */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {isVerified && (
                          <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="hidden sm:inline">Verified Agent Listing</span>
                            <span className="sm:hidden">Verified</span>
                          </span>
                        )}
                        {property.featured && (
                          <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-wider shadow-md">
                            <span className="hidden sm:inline">Featured Spotlight</span>
                            <span className="sm:hidden">Featured</span>
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button className="absolute top-2 right-2 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-rose-600 hover:text-white transition-all shadow-md group/fav">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 group-hover/fav:fill-white" />
                      </button>

                      {/* Pricing Overlay */}
                      <div className="absolute bottom-2 sm:bottom-4 left-2.5 sm:left-5 right-2.5 sm:right-5 flex items-end justify-between text-white">
                        <div>
                          <p className="text-sm sm:text-2xl font-black tracking-tight leading-tight">{formatPropertyPriceDisplay(property)}</p>
                          <p className="text-[8px] sm:text-xs text-slate-200/90 font-bold uppercase tracking-wider mt-0">
                            {property.propertyType?.replace('_', ' ')} • {property.listingType}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-2.5 sm:p-4 flex flex-col flex-grow">
                      <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-1">
                        {property.title}
                      </h3>

                      <div className="flex items-center gap-1 text-slate-500 text-[10px] sm:text-xs font-semibold mb-2 sm:mb-4">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500 shrink-0" />
                        <span className="truncate">{property.city || property.address || 'Location on request'}</span>
                      </div>

                      {/* Grid attributes - hidden on very small, shown compact */}
                      <div className="grid grid-cols-3 gap-1 py-1.5 sm:py-3 border-y border-slate-100 text-center text-slate-600 font-bold text-xs mb-2 sm:mb-4 mt-auto">
                        <div className="bg-slate-50/50 py-1.5 sm:py-2.5 rounded-lg sm:rounded-2xl border border-slate-100/50">
                          <p className="text-[7px] sm:text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-0">Beds</p>
                          <p className="text-slate-800 font-black text-[10px] sm:text-sm">{beds}</p>
                        </div>
                        <div className="bg-slate-50/50 py-1.5 sm:py-2.5 rounded-lg sm:rounded-2xl border border-slate-100/50">
                          <p className="text-[7px] sm:text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-0">Baths</p>
                          <p className="text-slate-800 font-black text-[10px] sm:text-sm">{baths}</p>
                        </div>
                        <div className="bg-slate-50/50 py-1.5 sm:py-2.5 rounded-lg sm:rounded-2xl border border-slate-100/50">
                          <p className="text-[7px] sm:text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-0">Area</p>
                          <p className="text-slate-800 font-black text-[10px] sm:text-sm truncate">{formatAreaDisplay(property.area)}</p>
                        </div>
                      </div>

                      {/* View Details Action */}
                      <Link href={getPropertyUrl(property)} className="block">
                        <Button className="w-full h-7 sm:h-10 bg-slate-900 hover:bg-rose-600 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1 text-[10px] sm:text-sm">
                          View <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No Premium Picks Found</h3>
              <p className="text-slate-400 mt-2 mb-6">Database properties will display here once added.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newly-added properties */}
      <section className="py-10 sm:py-14 bg-white relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Newly-added properties</h2>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">Fresh listings to check out</p>
          </div>

          <div className="relative group">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-800 z-10 hover:bg-slate-50 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll Left"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto scroll-smooth pb-4 no-scrollbar snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newlyAddedProperties.map((property) => (
                <div
                  key={property.id}
                  className="min-w-[260px] sm:min-w-[300px] max-w-[300px] bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col snap-start"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-slate-50 shrink-0">
                    {property.images && property.images.length > 0 && property.images[0] && property.images[0] !== '[]' ? (
                      <img
                        src={getPropertyImageUrl(property)}
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-50 font-bold text-xs uppercase tracking-wider">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex flex-col flex-grow text-left">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 mb-1">
                      {property.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-bold mb-0.5 leading-snug">
                      {property.configurations || (property.bedrooms ? `${property.bedrooms} BHK ${property.propertyType?.replace('_', ' ')}` : property.propertyType?.replace('_', ' '))}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium mb-2.5 truncate">
                      {property.city || property.address || 'Delhi NCR'}
                    </p>
                    <p className="font-extrabold text-sm sm:text-base text-slate-900 mb-4">
                      {formatPropertyPriceDisplay(property)}
                    </p>

                    <Link href={getPropertyUrl(property)} className="w-full mt-auto">
                      <Button className="w-full border border-[#5e23dc] hover:bg-[#5e23dc] hover:text-white text-[#5e23dc] font-bold rounded-xl py-2 h-9 text-xs transition-all bg-transparent flex items-center justify-center border-solid">
                        Contact
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-800 z-10 hover:bg-slate-50 active:scale-95 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Search by City - Elegant Photo Gallery Card Grid */}
      <section className="py-10 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <span className="text-rose-600 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block">
              Regional Highlights
            </span>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 mt-2.5 sm:mt-4">Popular Hubs to Explore</h2>
            <div className="w-10 sm:w-12 h-1 bg-rose-600 mx-auto mt-3 sm:mt-4 rounded-full" />
            <p className="text-slate-500 mt-2.5 text-xs sm:text-base max-w-xl mx-auto font-medium">Browse verified listings sorted by premium residential and commercial sectors.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {popularCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="h-28 sm:h-44"
              >
                <Link href={`/properties?search=${city.name}`}>
                  <div className="relative rounded-xl sm:rounded-3xl overflow-hidden h-full group cursor-pointer border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <Image
                      src={city.image}
                      alt={`Real estate properties in ${city.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    <div className="absolute bottom-2.5 sm:bottom-5 left-2.5 sm:left-5 flex flex-col gap-0.5 text-white">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <MapPin className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-rose-500" />
                        <span className="font-bold text-xs sm:text-lg tracking-tight">{city.name}</span>
                      </div>
                      <span className="text-slate-300 text-[8px] sm:text-[11px] font-bold uppercase tracking-widest pl-4 sm:pl-6">
                        {city.count} verified listings
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 w-6 h-6 sm:top-4 sm:right-4 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow">
                      <ChevronRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>




      {/* FAQ Section for SEO */}
      <section className="py-12 bg-slate-50 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-3 py-1 rounded-full inline-block">
              Quick Reference
            </span>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 mt-3">Frequently Asked Questions</h2>
            <div className="w-8 h-0.5 bg-rose-600 mx-auto mt-3 rounded-full" />
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-[10px] font-black shrink-0 border border-rose-100 mt-0.5">Q</span>
                      <span className="leading-snug">{faq.question}</span>
                    </h3>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0", isOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 pl-[38px] text-slate-500 text-xs leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


    </div>
  )
}
