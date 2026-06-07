"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Home, Calendar, CheckCircle, Building2, MapPin, Shield, Phone, ChevronRight, MessageSquare, ArrowUpRight, Award, Compass, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/home/search-bar'
import { FeaturedCollections } from '@/components/home/featured-collections'
import { ProjectGallery } from '@/components/home/project-gallery'
import { PropertyGridSkeleton } from '@/components/skeletons/property-skeletons'
import { usePropertyStore } from '@/lib/store'
import { cn, formatNumber } from '@/lib/utils'
import { HOME_FAQS } from '@/lib/seo'
import {
  fetchPlatformStats,
  fetchPublishedTestimonials,
  getFeaturedOrLatest,
  getProjectProperties,
  getNewlyAdded,
  getPopularCities,
  getSellerPartners,
  getPropertyImageUrl,
  formatPropertyPriceDisplay,
  formatRelativeTime,
  formatAreaDisplay,
  formatBedBath,
  formatStatCount,
  countByBedrooms,
  SUPPORT_PHONE,
  type TestimonialItem,
} from '@/lib/platform-data'

const categories = [
  { label: 'Buy Residential', icon: '🏠', href: '/properties?listing=buy', desc: 'Flats, Villas, Houses' },
  { label: 'Rent Residential', icon: '🔑', href: '/properties?listing=rent', desc: 'Ready to move in' },
  { label: 'New Projects', icon: '🏗️', href: '/properties?type=RESIDENTIAL+PROJECT&listing=buy', desc: 'Under construction & ready' },
  { label: 'Commercial', icon: '🏢', href: '/properties?type=COMMERCIAL&listing=buy', desc: 'Office, Shop, Warehouse' },
  { label: 'Plots / Land', icon: '📍', href: '/properties?type=PLOTS%2FLAND&listing=buy', desc: 'Residential & Commercial plots' },
  { label: 'PG / Hostel', icon: '🛏️', href: '/properties?listing=rent&type=PG', desc: 'Affordable stays' },
  { label: 'Hotel Rooms', icon: '🏨', href: '/properties?type=HOTEL', desc: 'Hotels & Guest Houses' },
]

const faqs = HOME_FAQS

const heroBackgrounds: Record<string, string> = {
  buy: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920',
  rent: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920',
  projects: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920',
  commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
  plots: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920',
  pg: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920',
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
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'commercial' | 'pg' | 'plots'>('buy')
  const [platformStats, setPlatformStats] = useState({
    properties: '0',
    buyers: '0',
    cities: '0',
    verifiedPercent: '100',
  })
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])

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
    fetchPublishedTestimonials(3).then(setTestimonials)
  }, [])

  const displayProperties = useMemo(() => getFeaturedOrLatest(properties, 3), [properties])
  const projectListings = useMemo(() => getProjectProperties(properties, 3), [properties])
  const newlyAdded = useMemo(() => getNewlyAdded(properties, 3), [properties])
  const popularCities = useMemo(() => getPopularCities(properties, 4), [properties])
  const sellerPartners = useMemo(() => getSellerPartners(properties, 3), [properties])
  const bhk2Count = useMemo(() => countByBedrooms(properties, 2), [properties])
  const bhk3Count = useMemo(() => countByBedrooms(properties, 3), [properties])

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
      {/* Hero Section */}
      <section className="relative min-h-[550px] sm:min-h-[620px] flex items-center pt-24 sm:pt-28 pb-12 sm:pb-20 overflow-hidden">
        {/* Background Slide Carousel */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={currentTheme.bgImage}
                alt={currentTheme.title}
                fill
                className="object-cover brightness-[0.85]"
                priority
                quality={85}
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-slate-950/45 z-10" />
          <div className={cn("absolute inset-0 bg-gradient-to-b via-transparent to-slate-50/90 z-10", currentTheme.gradientClass)} />

          {/* Subtle Grid Overlay for Tech-Premium Aesthetics */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] z-10 pointer-events-none" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto gap-8">

            {/* Header Content & Search Bar Card */}
            <div className="flex flex-col w-full items-center text-center">
              <div className="mb-6 px-1 text-center w-full max-w-4xl mx-auto flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center text-center"
                  >
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-4 border border-white/20 shadow-lg">
                      <Award className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                      Delhi's Premium Real Estate Agency
                    </span>
                    <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                      {currentTheme.title}
                    </h1>
                    <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-100/90 font-medium drop-shadow-md max-w-2xl leading-relaxed">
                      {currentTheme.subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Search Bar Card - Sleek Compact Layout */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="w-full max-w-4xl mx-auto bg-white/95 sm:bg-white/90 sm:backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-100/80 relative"
              >
                {/* Visual Accent */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full shadow-md z-20">
                  Search Gateway
                </div>

                <SearchBar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            </div>

          </div>

          {/* Quick Stats Grid with Interactive Hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 md:flex md:justify-center gap-4 sm:gap-8 w-full max-w-4xl mx-auto"
          >
            {[
              { value: platformStats.properties, label: 'Properties Listed', color: 'border-rose-500/20' },
              { value: platformStats.buyers, label: 'Happy Clients', color: 'border-blue-500/20' },
              { value: `${platformStats.verifiedPercent}%`, label: 'Partner Verified', color: 'border-emerald-500/20' },
              { value: platformStats.cities, label: 'Prime Regions', color: 'border-amber-500/20' },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "text-center p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 min-w-[130px] flex-1 transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-slate-900/80 shadow-md",
                  s.color
                )}
              >
                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{s.value}</p>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Quick Links - Premium Interactive Grid */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Market Segments
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 mt-4">What are you looking for?</h2>
            <div className="w-12 h-1 bg-rose-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-xl mx-auto font-medium">Select a segment to jump straight into tailored real estate listings.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={cat.href} className="block group">
                  <div className="h-full flex flex-col items-center p-6 rounded-3xl border-2 border-slate-100 hover:border-rose-500/50 hover:bg-gradient-to-b hover:from-rose-50/30 hover:to-rose-50/50 hover:shadow-xl hover:shadow-rose-600/5 transition-all duration-300 cursor-pointer text-center relative overflow-hidden group-hover:-translate-y-1.5">
                    {/* Glowing highlight in background */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-400/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />

                    <span className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 block">{cat.icon}</span>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors leading-tight mb-2">{cat.label}</h3>
                    <p className="text-[11px] text-slate-400 font-medium group-hover:text-slate-500 transition-colors leading-snug">{cat.desc}</p>

                    {/* Tiny visual cue trigger */}
                    <span className="text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 mt-3 flex items-center gap-0.5">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Expert Solutions
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-900 mt-4 leading-tight">Our Premium Services</h2>
            <div className="w-16 h-1.5 bg-rose-600 mx-auto mt-6 rounded-full" />
            <p className="mt-6 text-slate-600 max-w-2xl mx-auto text-base sm:text-lg font-medium leading-relaxed">
              We provide end-to-end guidance and verified assistance for all your <strong>real estate requirements in Delhi NCR, Dwarka, Gurugram, and Noida</strong>.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Property Buying & Selling', icon: Building2, desc: 'Find the best 3 BHK flats and luxury builder floors in Dwarka, Gurugram, and Noida with expert guidance.' },
              { title: 'Legal & Documentation', icon: Shield, desc: 'Hassle-free registry and documentation support for all property transactions in Delhi NCR.' },
              { title: 'Property Valuation', icon: MapPin, desc: 'Professional assessment of your property market value in Dwarka, Noida, and Gurugram sectors.' },
              { title: 'Rental Management', icon: Home, desc: 'Top <strong>brokers in Delhi NCR for rent</strong> to help you find verified tenants or dream rentals.' },
              { title: 'Investment Advisory', icon: Star, desc: 'High-ROI <strong>real estate investing</strong> opportunities in Noida, Gurugram, and Delhi NCR.' },
              { title: 'Personalized Relocation', icon: Compass, desc: 'End-to-end support for moving families or businesses to premium NCR sectors.' },
            ].map((service, index) => (
              <Link key={service.title} href={`/services/coming-soon?title=${encodeURIComponent(service.title)}`} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 flex flex-col group-hover:-translate-y-1.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <service.icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: service.desc }} />

                  <div className="mt-auto text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors flex items-center gap-1">
                    Learn More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Housing's Top Picks */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-slate-100 pb-8">
            <div>
              <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                Handpicked Premium Properties
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight mt-3">Housing's Top Picks</h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">Dwarka, Gurugram, and Noida's most premium and highly recommended properties with direct builder contact.</p>
            </div>
            <Link href="/properties">
              <Button className="bg-slate-950 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/20 text-white font-bold rounded-2xl flex items-center gap-1.5 h-12 px-6 shadow-md transition-all">
                Browse All Deals <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading && displayProperties.length === 0 ? (
            <PropertyGridSkeleton count={3} variant="home" />
          ) : displayProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProperties.map((property, index) => {
                const { beds, baths } = formatBedBath(property)
                const isVerified = property.featured || (property.images?.length ?? 0) > 0
                return (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                    className="group bg-white rounded-[2.2rem] overflow-hidden border border-slate-100 shadow-md hover:shadow-[0_24px_50px_-12px_rgba(244,63,94,0.1)] hover:border-rose-500/30 transition-all duration-500 flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div className="relative h-64 overflow-hidden shrink-0">
                      <img
                        src={getPropertyImageUrl(property)}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.93]"
                      />
                      {/* Gradient bottom shadow to ensure overlay readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      {/* Badges container */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {isVerified && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Verified Agent Listing
                          </span>
                        )}
                        {property.featured && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                            Featured Spotlight
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-rose-600 hover:text-white transition-all shadow-md group/fav">
                        <Heart className="w-4.5 h-4.5 group-hover/fav:fill-white" />
                      </button>

                      {/* Pricing Overlay */}
                      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
                        <div>
                          <p className="text-2xl font-black tracking-tight">{formatPropertyPriceDisplay(property)}</p>
                          <p className="text-xs text-slate-200/90 font-bold uppercase tracking-wider mt-0.5">
                            {property.propertyType?.replace('_', ' ')} • For {property.listingType}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-6 sm:p-8 flex flex-col flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-2">
                        {property.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-6">
                        <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                        <span className="truncate">{property.city ? `${property.address}, ${property.city}` : property.address || 'Address on request'}</span>
                      </div>

                      {/* Grid attributes */}
                      <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 text-center text-slate-600 font-bold text-xs mb-6 mt-auto">
                        <div className="bg-slate-50/50 py-2.5 rounded-2xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-0.5">Beds</p>
                          <p className="text-slate-800 font-black text-sm">{beds}</p>
                        </div>
                        <div className="bg-slate-50/50 py-2.5 rounded-2xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-0.5">Baths</p>
                          <p className="text-slate-800 font-black text-sm">{baths}</p>
                        </div>
                        <div className="bg-slate-50/50 py-2.5 rounded-2xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold mb-0.5">Builtup</p>
                          <p className="text-slate-800 font-black text-sm truncate">{formatAreaDisplay(property.area)}</p>
                        </div>
                      </div>

                      {/* View Details Action */}
                      <Link href={`/property/${property.id}`} className="block">
                        <Button className="w-full h-12 bg-slate-900 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/20 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
                          Explore Listing <ArrowRight className="w-4 h-4" />
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

      {/* Prominent Projects to Explore */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.08),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-rose-500 text-xs font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full inline-block border border-white/10">
              Premium Builder Collaborations
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-white tracking-tight mt-4">
              Prominent Projects to Explore
            </h2>
            <div className="w-14 h-1.5 bg-rose-500 mx-auto mt-6 rounded-full" />
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-medium">
              Discover flagship complexes, luxury towers, and major builder floor configurations under development in Dwarka, Gurugram, Noida, and across Delhi NCR.
            </p>
          </div>

          {projectListings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No project listings currently active. Browse general inventory.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projectListings.map((project, index) => {
                const sellerName = project.user?.name || 'Kanharaj verified builder'
                const config =
                  project.bedrooms > 0
                    ? `${project.bedrooms} BHK • ${formatAreaDisplay(project.area)}`
                    : formatAreaDisplay(project.area)
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="group bg-slate-800/50 rounded-[2.5rem] overflow-hidden border border-white/5 hover:bg-slate-800 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="relative h-60 overflow-hidden shrink-0">
                      <img
                        src={getPropertyImageUrl(project)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {project.featured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[9px] font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-wider">
                          Premium Project
                        </div>
                      )}
                      <div className="absolute bottom-4 left-5 text-white">
                        <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/10">
                          {config}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-white group-hover:text-rose-500 transition-colors mb-2 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                        Developer: <span className="text-slate-300 font-extrabold">{sellerName}</span>
                      </p>

                      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-6">
                        <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                        <span className="truncate">{[project.address, project.city].filter(Boolean).join(', ')}</span>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Valuation</p>
                          <p className="text-lg font-black text-white">{formatPropertyPriceDisplay(project)}</p>
                        </div>
                        <Link href={`/property/${project.id}`}>
                          <Button className="bg-white text-slate-950 hover:bg-rose-600 hover:text-white font-bold rounded-2xl transition-all flex items-center gap-1 h-11 px-5 shadow">
                            View Showcase <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newly-Added Properties */}
      <section className="py-24 bg-slate-50 border-b border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-slate-200/50 pb-8">
            <div>
              <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Postings Today
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight mt-3">Newly-Added Properties</h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">Freshly listed residential apartments and builder floors in Dwarka, Noida, and Gurugram sectors.</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="border-slate-300 hover:border-rose-500 hover:text-rose-600 font-bold rounded-2xl flex items-center gap-1.5 h-12 px-6 shadow-sm transition-all bg-white">
                View All Fresh Postings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {newlyAdded.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-500">No new postings found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newlyAdded.map((prop, idx) => {
                const phone = prop.user?.phone?.replace(/\D/g, '') || SUPPORT_PHONE
                const { beds } = formatBedBath(prop)
                return (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    className="group bg-white rounded-[2.2rem] overflow-hidden border border-slate-100 shadow-md hover:shadow-[0_24px_50px_-12px_rgba(244,63,94,0.08)] hover:border-rose-500/30 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="relative h-56 overflow-hidden shrink-0">
                      <img
                        src={getPropertyImageUrl(prop)}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />

                      <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl border border-white/10 shadow flex items-center gap-1.5 uppercase tracking-wider">
                        <Building2 className="w-3.5 h-3.5 text-rose-500" />
                        {formatAreaDisplay(prop.area)}
                      </div>

                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase shadow">
                        Just In
                      </div>

                      <div className="absolute bottom-4 left-5 text-white">
                        <p className="text-2xl font-black tracking-tight">{formatPropertyPriceDisplay(prop)}</p>
                      </div>

                      <div className="absolute bottom-4 right-5 text-white/95 text-[10px] font-black bg-slate-950/45 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10">
                        {formatRelativeTime(prop.createdAt)}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2 line-clamp-1">
                        {prop.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-5">
                        <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                        <span className="truncate">{[prop.address, prop.city].filter(Boolean).join(', ')}</span>
                      </div>

                      <div className="flex gap-2 text-slate-500 text-xs font-bold mb-6 pt-4 border-t border-slate-100">
                        <span className="bg-slate-50 border border-slate-100/50 px-3.5 py-1.5 rounded-xl text-slate-800 font-black">{beds} Configuration</span>
                        <span className="bg-slate-50 border border-slate-100/50 px-3.5 py-1.5 rounded-xl text-slate-800 font-black">{prop.propertyType}</span>
                      </div>

                      {phone ? (
                        <a href={`tel:+91${phone}`} className="w-full mt-auto block">
                          <Button className="w-full h-12 bg-emerald-600 hover:bg-rose-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                            <Phone className="w-4 h-4 animate-bounce" />
                            Call Agent: {prop.user?.name ? prop.user.name.split(' ')[0] : 'Partner'}
                          </Button>
                        </a>
                      ) : (
                        <Link href={`/property/${prop.id}`} className="w-full mt-auto block">
                          <Button className="w-full h-12 bg-emerald-600 hover:bg-rose-600 text-white font-bold rounded-xl transition-all">
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Search by City - Elegant Photo Gallery Card Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Regional Highlights
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 mt-4">Popular Hubs to Explore</h2>
            <div className="w-12 h-1 bg-rose-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-xl mx-auto font-medium">Browse verified listings sorted by premium residential and commercial sectors.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="h-44"
              >
                <Link href={`/properties?search=${city.name}`}>
                  <div className="relative rounded-3xl overflow-hidden h-full group cursor-pointer border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <Image
                      src={city.image}
                      alt={`Real estate properties in ${city.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 flex flex-col gap-0.5 text-white">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4.5 w-4.5 text-rose-500" />
                        <span className="font-bold text-lg tracking-tight">{city.name}</span>
                      </div>
                      <span className="text-slate-300 text-[11px] font-bold uppercase tracking-widest pl-6">
                        {city.count} verified listings
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      <ProjectGallery />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* How It Works - Visual Timeline */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Seamless Workflow
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-black text-slate-900 mt-4">
              How It Works
            </h2>
            <div className="w-14 h-1.5 bg-rose-600 mx-auto mt-6 rounded-full" />
            <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm sm:text-base font-medium">
              Find, verify, and secure your next home in four simple steps.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connection line for desktop */}
            <div className="absolute top-[75px] left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-rose-600/20 hidden md:block z-0" />

            {[
              { icon: '🔍', title: 'Smart Search', description: `Browse over ${platformStats.properties} listings filtered by budget and sectors.`, step: '01' },
              { icon: '❤️', title: 'Compare Favorites', description: 'Bookmark flats and inspect attributes side-by-side easily.', step: '02' },
              { icon: '📞', title: 'Direct Contact', description: 'Reach owners and trusted partner agents directly with zero hassle.', step: '03' },
              { icon: '🔑', title: 'Acquire & Move', description: 'Finalize agreements and step right into your premium new home.', step: '04' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all z-10 flex flex-col items-center text-center group"
              >
                {/* Floating Big Index Watermark */}
                <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 group-hover:text-rose-50 transition-colors leading-none font-serif z-0 select-none">
                  {item.step}
                </span>

                <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center text-4xl mb-6 relative z-10 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Configuration Highlights */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Active Dashboard Metrics
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 mt-4">Browse by Configuration</h2>
            <div className="w-12 h-1 bg-rose-600 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-xl mx-auto font-medium">Instant links to current inventory metrics listed right now on our portal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: '2 BHK Residences',
                count: bhk2Count,
                href: '/properties?bhk=2',
                image: newlyAdded[0] ? getPropertyImageUrl(newlyAdded[0]) : displayProperties[0] ? getPropertyImageUrl(displayProperties[0]) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
              },
              {
                title: '3 BHK Residences',
                count: bhk3Count,
                href: '/properties?bhk=3',
                image: newlyAdded[1] ? getPropertyImageUrl(newlyAdded[1]) : displayProperties[1] ? getPropertyImageUrl(displayProperties[1]) : 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400',
              },
              {
                title: 'All Active Inventory',
                count: Number(platformStats.properties.replace(/\D/g, '')) || properties.filter((p) => p.status === 'ACTIVE').length,
                href: '/properties',
                image: newlyAdded[2] ? getPropertyImageUrl(newlyAdded[2]) : displayProperties[2] ? getPropertyImageUrl(displayProperties[2]) : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="h-full"
              >
                <Link href={item.href} className="group block bg-slate-50 border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-rose-600/5 transition-all duration-300">
                  <div className="relative h-44 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <span className="absolute bottom-5 left-5 text-white font-bold text-lg tracking-tight">{item.title}</span>
                  </div>
                  <div className="p-8">
                    <p className="text-3xl font-black text-rose-600">{formatNumber(item.count)}+</p>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">Available Options Now</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Immersive Dark Block */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.05),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-500 text-xs font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full inline-block border border-white/10">
              Client Commendations
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black mt-4">
              What Our Clients Say
            </h2>
            <div className="w-12 h-1 bg-rose-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length === 0 ? (
              <p className="col-span-3 text-center text-slate-400 text-sm py-8">
                Share your client experience on our <Link href="/feedback" className="text-rose-400 font-bold hover:underline">Feedback Portal</Link> — reviews are live here.
              </p>
            ) : testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-slate-800/40 rounded-3xl p-8 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm italic leading-relaxed font-medium">"{testimonial.text}"</p>
                </div>

                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-white/5">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-white/10"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />{testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Network Excellence
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-900 mt-4 leading-tight">Our Strategic Partners</h2>
            <div className="w-16 h-1.5 bg-rose-600 mx-auto mt-6 rounded-full" />
            <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-base sm:text-lg font-medium">
              Verified agents and brokers with active listings on Kanharaj — contact directly for zero-brokerage listings.
            </p>
          </motion.div>

          {sellerPartners.length === 0 ? (
            <p className="text-center text-slate-400 font-medium py-8 bg-slate-50 rounded-2xl border">Registered seller brokers will display here.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sellerPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:bg-white hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-black mb-8 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-sm border border-rose-100">
                      {partner.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                      {partner.name}
                    </h3>
                    <Badge variant="secondary" className="bg-rose-50 text-rose-600 border border-rose-100 font-extrabold uppercase text-[10px] tracking-wider mb-6">
                      {partner.listingCount} active listing{partner.listingCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100/80">
                    {partner.address && (
                      <div className="flex items-start gap-3 text-slate-500">
                        <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-relaxed line-clamp-2">{partner.address}</p>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="flex items-center gap-3 text-slate-500">
                        <Phone className="h-5 w-5 text-rose-500 shrink-0" />
                        <a href={`tel:+91${partner.phone.replace(/\D/g, '')}`} className="text-sm font-black hover:text-rose-600 transition-colors tracking-tight">
                          +91 {partner.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-rose-600/10 skew-x-12 translate-x-1/4" />
            <div className="absolute -left-12 -top-12 w-44 h-44 bg-rose-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-rose-600 text-white border-none px-4 py-1.5 mb-6 text-[10px] tracking-widest uppercase font-extrabold">Coming Soon</Badge>
                <h2 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight mb-6">
                  Download the <span className="text-rose-500">Kanharaj</span> <br />Mobile Platform
                </h2>
                <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-md leading-relaxed">
                  Stay updated with instant alert pings, direct whatsapp connections, and premium listing collections from verified agents in Delhi NCR, Dwarka, Noida, and Gurugram.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3 cursor-not-allowed grayscale">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-slate-950 font-black text-sm">A</span>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Available on</p>
                      <p className="text-white font-bold text-sm">App Store</p>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3 cursor-not-allowed grayscale">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-slate-950 font-black text-sm">G</span>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Get it on</p>
                      <p className="text-white font-bold text-sm">Google Play</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px] hidden lg:block rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
                  alt="App Preview Mockup"
                  fill
                  className="object-cover opacity-60 scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Quick Reference
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 mt-4">Frequently Asked Questions</h2>
            <div className="w-12 h-1 bg-rose-600 mx-auto mt-4 rounded-full" />
            <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm sm:text-base font-medium">Find answers to queries regarding listings, builder floor configurations, and transactions in Dwarka, Noida, Gurugram, and across Delhi NCR.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-black shrink-0 shadow-sm border border-rose-100">Q</span>
                    <span className="pt-0.5 leading-snug">{faq.question}</span>
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-10">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Vibrant Rose Gradient Banner */}
      <section className="py-20 bg-gradient-to-br from-rose-600 via-rose-500 to-pink-700 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight">
                Own a property in All India? List it <span className="underline decoration-2 underline-offset-4">FREE</span> Now
              </h2>
              <p className="mt-4 text-white/90 text-sm sm:text-base max-w-xl leading-relaxed">
                Connect directly with thousands of verified clients searching for properties in All India. Zero middleman fees.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-white text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4.5 w-4.5 text-white" /> Verified Buyers</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4.5 w-4.5 text-white" /> Instant Activation</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <Link href="/for-sellers" className="w-full sm:w-auto block">
                <Button size="lg" className="bg-white hover:bg-slate-900 hover:text-white text-rose-600 font-extrabold shadow-xl px-10 h-14 rounded-2xl w-full sm:w-auto transition-all text-sm uppercase tracking-wider">
                  List Your Property Free
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
