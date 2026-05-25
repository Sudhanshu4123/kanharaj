"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Home, Calendar, CheckCircle, Building2, MapPin, TrendingUp, Users, Shield, Phone, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/home/search-bar'
import { FeaturedCollections } from '@/components/home/featured-collections'
import { ProjectGallery } from '@/components/home/project-gallery'
import { PropertyGridSkeleton } from '@/components/skeletons/property-skeletons'
import { usePropertyStore } from '@/lib/store'
import { cn, formatNumber } from '@/lib/utils'
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

const faqs = [
  {
    question: 'How to buy a property in Dwarka, Delhi?',
    answer: 'To buy a property in Dwarka, start by browsing our verified listings. Once you find a property, contact us for a site visit. We assist with documentation and direct connection with builders for a smooth transaction.'
  },
  {
    question: 'What is the average price of 3 BHK flats in Dwarka?',
    answer: 'The price of 3 BHK flats in Dwarka depends on the sector and amenities. On average, prices range from ₹1.2 Cr to ₹2.5 Cr. Sector 7, 10, and 12 are among the most premium areas.'
  },
  {
    question: 'Does Kanharaj Properties provide zero brokerage options?',
    answer: 'Yes, we have many direct-from-builder listings where you can save on brokerage. Look for the "Verified" and "Direct" badges on our property listings.'
  },
  {
    question: 'Are the properties on your website verified?',
    answer: 'Absolutely. Every property listed on Kanharaj Properties undergoes a verification process to ensure authenticity of details, price, and ownership.'
  }
]

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

  // Area & EMI Calculators State
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
          title: 'Find Your Perfect Property in Dwarka',
          subtitle: 'Verified flats, builder floors, and luxury homes directly from partners & builders.',
          bgImage: heroBackgrounds.buy,
          gradientClass: 'from-slate-900/60 to-slate-900/40',
        }
      case 'rent':
        return {
          title: 'Rental Properties in Dwarka',
          subtitle: 'Ready-to-move-in flats and houses at direct prices.',
          bgImage: heroBackgrounds.rent,
          gradientClass: 'from-indigo-950/60 to-indigo-900/40',
        }
      case 'commercial':
        return {
          title: 'Premium Commercial Spaces',
          subtitle: 'Offices, shops, and showrooms in premium commercial hubs.',
          bgImage: heroBackgrounds.commercial,
          gradientClass: 'from-slate-950/60 to-slate-900/40',
        }
      case 'pg':
        return {
          title: 'PG & Shared Accommodations',
          subtitle: 'Affordable and verified paying guest stays in Dwarka Delhi.',
          bgImage: heroBackgrounds.pg,
          gradientClass: 'from-emerald-950/60 to-emerald-900/40',
        }
      case 'plots':
        return {
          title: 'Residential & Commercial Plots',
          subtitle: 'Premium land and plots in upcoming locations.',
          bgImage: heroBackgrounds.plots,
          gradientClass: 'from-amber-950/60 to-amber-900/40',
        }
      default:
        return {
          title: 'Find Your Perfect Property in Dwarka',
          subtitle: 'Verified flats, builder floors, and luxury homes directly from partners & builders.',
          bgImage: heroBackgrounds.buy,
          gradientClass: 'from-slate-900/60 to-slate-900/40',
        }
    }
  }

  const currentTheme = getHeroConfig()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center pt-24 pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={currentTheme.bgImage}
                alt={currentTheme.title}
                fill
                className="object-cover"
                priority
                quality={75}
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-slate-900/40 z-10" />
          <div className={cn("absolute inset-0 bg-gradient-to-b via-transparent to-white z-10", currentTheme.gradientClass)} />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto gap-6">

            {/* Search and Header Section */}
            <div className="flex flex-col w-full items-center text-center">
              {/* Header Title (Directly in Hero for tabs other than 'buy') */}
              {activeTab !== 'buy' && (
                <div className="mb-6 px-1 text-center w-full max-w-4xl mx-auto flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center text-center"
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-rose-600/20 backdrop-blur-sm text-rose-400 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase mb-3 border border-rose-500/20">
                      India's Trusted Property Portal
                    </span>
                    <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                      {currentTheme.title}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-white/90 font-semibold drop-shadow-sm max-w-2xl">
                      {currentTheme.subtitle}
                    </p>
                  </motion.div>
                </div>
              )}

              {/* BUY active shows title INSIDE the search card layout for cohesive look */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full"
              >
                <SearchBar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  title={activeTab === 'buy' ? currentTheme.title : undefined}
                  subtitle={activeTab === 'buy' ? currentTheme.subtitle : undefined}
                />
              </motion.div>
            </div>

          </div>

          {/* Quick Stats inside Hero - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 grid grid-cols-2 md:flex md:justify-center gap-4 sm:gap-10 w-full"
          >
            {[
              { value: platformStats.properties, label: 'Properties' },
              { value: platformStats.buyers, label: 'Happy Buyers' },
              { value: `${platformStats.verifiedPercent}%`, label: 'Verified' },
              { value: platformStats.cities, label: 'Cities' },
            ].map((s) => (
              <div key={s.label} className="text-center p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 md:bg-transparent md:backdrop-blur-none md:border-none min-w-[120px]">
                <p className="text-lg sm:text-xl font-black text-white">{s.value}</p>
                <p className="text-[9px] text-white/80 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Quick Links - 99acres style */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">What are you looking for?</h2>
            <p className="text-slate-600 mt-2 text-sm">Select a category to start your property search</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={cat.href}>
                  <div className="group flex flex-col items-center p-5 rounded-2xl border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50/50 transition-all cursor-pointer text-center">
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">{cat.label}</h3>
                    <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Expert Solutions</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Our Premium Services</h2>
            <div className="w-20 h-1.5 bg-rose-600 mx-auto mt-6 rounded-full" />
            <p className="mt-6 text-slate-600 max-w-2xl mx-auto text-lg font-medium">
              We provide comprehensive support for all your <strong>real estate in Delhi NCR Dwarka</strong> needs, from buying to legal documentation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Property Buying & Selling', icon: Building2, desc: 'Find the best 3 BHK flats and luxury builder floors in Dwarka with expert guidance.' },
              { title: 'Legal & Documentation', icon: Shield, desc: 'Hassle-free registry and documentation support for all property transactions in Delhi.' },
              { title: 'Property Valuation', icon: MapPin, desc: 'Professional assessment of your property market value in Dwarka sectors.' },
              { title: 'Rental Management', icon: Home, desc: 'Top <strong>brokers in Dwarka for rent</strong> to help you find verified tenants or dream rentals.' },
              { title: 'Investment Advisory', icon: Star, desc: 'High-ROI <strong>real estate investing</strong> opportunities in Dwarka Expressway & Delhi NCR.' },
            ].map((service, index) => (
              <Link href={`/services/coming-soon?title=${encodeURIComponent(service.title)}`} className="block">
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                    <service.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: service.desc }} />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Housing's Top Picks */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[#f22b68] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f22b68] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f22b68]"></span>
                </span>
                Handpicked Premium Properties
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">Housing's Top Picks</h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">Dwarka's most premium and highly recommended properties</p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="text-[#f22b68] hover:text-[#4e20b1] hover:bg-rose-50 font-bold flex items-center gap-1">
                View All Picks <ArrowRight className="h-4 w-4" />
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
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#f22b68]/5 hover:border-[#f22b68]/30 transition-all duration-500 flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div className="relative h-64 overflow-hidden shrink-0">
                      <img
                        src={getPropertyImageUrl(property)}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {isVerified && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Verified
                          </span>
                        )}
                        {property.featured && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#f22b68] to-[#4e20b1] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Pricing Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <p className="text-2xl font-black tracking-tight">{formatPropertyPriceDisplay(property)}</p>
                          <p className="text-xs text-white/90 font-medium">{property.propertyType?.toUpperCase()} • {property.listingType?.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description Area */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-[#f22b68] transition-colors line-clamp-1 mb-2">
                        {property.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-4">
                        <MapPin className="h-4 w-4 text-[#f22b68] shrink-0" />
                        <span className="truncate">{property.city ? `${property.address}, ${property.city}` : property.address || 'Location unavailable'}</span>
                      </div>

                      {/* Property Features */}
                      <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 text-center text-slate-600 font-bold text-xs mb-6 mt-auto">
                        <div className="bg-slate-50 py-2 rounded-xl border border-slate-100/50">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-0.5">Beds</p>
                          <p className="text-slate-800 font-black">{beds}</p>
                        </div>
                        <div className="bg-slate-50 py-2 rounded-xl border border-slate-100/50">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-0.5">Bath</p>
                          <p className="text-slate-800 font-black">{baths}</p>
                        </div>
                        <div className="bg-slate-50 py-2 rounded-xl border border-slate-100/50">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mb-0.5">Area</p>
                          <p className="text-slate-800 font-black truncate">{formatAreaDisplay(property.area)}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link href={`/property/${property.id}`} className="block">
                        <Button className="w-full h-11 bg-slate-900 hover:bg-[#f22b68] text-white font-bold rounded-xl transition-all duration-300 shadow-md">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Building2 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No properties listed yet</h3>
              <p className="text-slate-400 mt-2 mb-6">Be the first to list your property!</p>
            </div>
          )}
        </div>
      </section>

      {/* Prominent Projects to Explore */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#f22b68] text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Premium Builder Collaborations
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-4">
              Prominent Projects to Explore
            </h2>
            <div className="w-12 h-1 bg-[#f22b68] mx-auto mt-4 rounded-full" />
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm font-medium">
              Discover top-tier luxury complexes and builder floor configurations under development in Dwarka
            </p>
          </div>

          {projectListings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">No project listings yet. Browse all properties.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projectListings.map((project, index) => {
                const sellerName = project.user?.name || 'Listed on Kanharaj'
                const config =
                  project.bedrooms > 0
                    ? `${project.bedrooms} BHK • ${formatAreaDisplay(project.area)}`
                    : formatAreaDisplay(project.area)
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-slate-50/50 rounded-[2.5rem] overflow-hidden border border-slate-100 hover:bg-white hover:border-[#f22b68]/30 hover:shadow-2xl hover:shadow-[#f22b68]/5 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="relative h-60 overflow-hidden shrink-0">
                      <img
                        src={getPropertyImageUrl(project)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      {project.featured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-[#f22b68] to-[#4e20b1] text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-wider">
                          Featured Project
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 text-white">
                        <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          {config}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-[#f22b68] transition-colors mb-1 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide mb-4">
                        Listed by: {sellerName}
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-6">
                        <MapPin className="h-4 w-4 text-[#f22b68] shrink-0" />
                        <span>{[project.address, project.city].filter(Boolean).join(', ')}</span>
                      </div>
                      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Price</p>
                          <p className="text-lg font-black text-slate-900">{formatPropertyPriceDisplay(project)}</p>
                        </div>
                        <Link href={`/property/${project.id}`}>
                          <Button className="bg-slate-900 hover:bg-[#f22b68] text-white font-bold rounded-xl transition-all flex items-center gap-1 h-11 px-5 shadow">
                            View Project
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
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[#f22b68] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Fresh Postings
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">Newly-Added Properties</h2>
              <p className="text-slate-500 mt-1 text-sm font-medium">Freshly listed residential and luxury floor options in Dwarka</p>
            </div>
            <Link href="/properties">
              <Button variant="ghost" className="text-[#f22b68] hover:text-[#4e20b1] hover:bg-rose-50 font-bold flex items-center gap-1">
                View All Fresh Listings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {newlyAdded.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-500">No new listings yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newlyAdded.map((prop, idx) => {
                const phone = prop.user?.phone?.replace(/\D/g, '') || SUPPORT_PHONE
                const { beds } = formatBedBath(prop)
                return (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#f22b68]/5 hover:border-[#f22b68]/30 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="relative h-56 overflow-hidden shrink-0">
                      <img
                        src={getPropertyImageUrl(prop)}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/10 shadow flex items-center gap-1 uppercase tracking-wider">
                        <Building2 className="w-3.5 h-3.5 text-[#f22b68]" />
                        {formatAreaDisplay(prop.area)}
                      </div>
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        New
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-xl font-black tracking-tight">{formatPropertyPriceDisplay(prop)}</p>
                      </div>
                      <div className="absolute bottom-4 right-4 text-white/95 text-[10px] font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
                        {formatRelativeTime(prop.createdAt)}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#f22b68] transition-colors mb-2 line-clamp-1">
                        {prop.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-4">
                        <MapPin className="h-4 w-4 text-[#f22b68] shrink-0" />
                        <span className="truncate">{[prop.address, prop.city].filter(Boolean).join(', ')}</span>
                      </div>
                      <div className="flex gap-4 text-slate-500 text-xs font-bold mb-6 pt-4 border-t border-slate-100">
                        <span className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-slate-700 font-extrabold">{beds}</span>
                        <span className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-slate-700 font-extrabold">{prop.propertyType}</span>
                      </div>
                      {phone ? (
                        <a href={`tel:+91${phone}`} className="w-full mt-auto">
                          <Button className="w-full h-11 bg-emerald-600 hover:bg-[#4e20b1] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                            <Phone className="w-4 h-4" />
                            Contact {prop.user?.name ? prop.user.name.split(' ')[0] : 'Seller'}
                          </Button>
                        </a>
                      ) : (
                        <Link href={`/property/${prop.id}`} className="w-full mt-auto block">
                          <Button className="w-full h-11 bg-emerald-600 hover:bg-[#4e20b1] text-white font-bold rounded-xl">View Details</Button>
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

      {/* Search by City */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-widest">Explore by City</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Popular Cities</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularCities.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/properties?search=${city.name}`}>
                  <div className="relative rounded-2xl overflow-hidden h-40 group cursor-pointer">
                    <Image
                      src={city.image}
                      alt={`Real estate properties in ${city.name}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-rose-400" />
                      <span className="text-white font-bold text-lg">{city.name}</span>
                      <span className="text-white/80 text-xs font-bold">({city.count} listings)</span>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-5 w-5 text-white" />
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

      <FeaturedCollections />

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-widest">Simple Process</span>
            <h2 className="font-heading text-2xl md:text-3xl font-black text-slate-900 mt-1">
              How It Works
            </h2>
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm">
              Finding your dream property has never been easier.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'Search', description: `Browse ${platformStats.properties} verified properties by location, budget & type.`, step: '01' },
              { icon: '❤️', title: 'Shortlist', description: 'Save your favourite properties and compare them side by side.', step: '02' },
              { icon: '📞', title: 'Connect', description: 'Contact owners or builders directly — zero brokerage.', step: '03' },
              { icon: '🏠', title: 'Move In', description: 'Complete paperwork and get the keys to your new home!', step: '04' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <span className="absolute top-4 right-5 text-5xl font-black text-rose-50 leading-none">{item.step}</span>
                <h3 className="font-heading text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-slate-500 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live inventory highlights */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#f22b68] text-xs font-black uppercase tracking-[0.2em] bg-rose-50 px-4 py-1.5 rounded-full inline-block">
              Live Inventory
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4">Browse by Configuration</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Counts from active listings on Kanharaj right now</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: '2 BHK Properties',
                count: bhk2Count,
                href: '/properties?bhk=2',
                image: newlyAdded[0] ? getPropertyImageUrl(newlyAdded[0]) : displayProperties[0] ? getPropertyImageUrl(displayProperties[0]) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
              },
              {
                title: '3 BHK Properties',
                count: bhk3Count,
                href: '/properties?bhk=3',
                image: newlyAdded[1] ? getPropertyImageUrl(newlyAdded[1]) : displayProperties[1] ? getPropertyImageUrl(displayProperties[1]) : 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400',
              },
              {
                title: 'All Active Listings',
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
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={item.href} className="group block bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-40">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                    <span className="absolute bottom-4 left-4 text-white font-black text-lg">{item.title}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-2xl font-black text-[#f22b68]">{formatNumber(item.count)}+</p>
                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">Available now</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-rose-500 text-xs font-bold uppercase tracking-widest">Real Stories</span>
            <h2 className="font-heading text-2xl md:text-3xl font-black mt-1">
              What Our Clients Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.length === 0 ? (
              <p className="col-span-3 text-center text-slate-400 text-sm py-8">
                Share your experience on our <Link href="/feedback" className="text-rose-400 font-bold hover:underline">Feedback</Link> page — reviews appear here automatically.
              </p>
            ) : testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Network Excellence</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Our Strategic Partners</h2>
            <div className="w-20 h-1.5 bg-rose-600 mx-auto mt-6 rounded-full" />
            <p className="mt-6 text-slate-500 max-w-2xl mx-auto text-lg font-medium">
              Verified sellers with active listings on Kanharaj — contact them directly for zero-brokerage deals.
            </p>
          </motion.div>

          {sellerPartners.length === 0 ? (
            <p className="text-center text-slate-500 font-medium py-8">Seller partners appear here when properties are listed on the platform.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sellerPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:bg-white hover:border-rose-500 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500"
                >
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-black mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    {partner.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                    {partner.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{partner.listingCount} active listing{partner.listingCount !== 1 ? 's' : ''}</p>
                  <div className="space-y-4">
                    {partner.address && (
                      <div className="flex items-start gap-3 text-slate-500">
                        <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-relaxed line-clamp-2">{partner.address}</p>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="flex items-center gap-3 text-slate-500">
                        <Phone className="h-5 w-5 text-rose-500 shrink-0" />
                        <a href={`tel:+91${partner.phone.replace(/\D/g, '')}`} className="text-sm font-bold hover:text-rose-600 transition-colors tracking-tight">
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
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-rose-600/10 skew-x-12 translate-x-1/4" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-rose-600 hover:bg-rose-600 border-none px-4 py-1 mb-6">Coming Soon</Badge>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                  Download the <span className="text-rose-500">Kanharaj</span> <br />Mobile App
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-md">
                  Get personalized property alerts, direct chat with owners, and exclusive new project launches right on your phone.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 cursor-not-allowed grayscale">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-slate-900 font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Available on</p>
                      <p className="text-white font-bold">App Store</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 cursor-not-allowed grayscale">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-slate-900 font-bold">G</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Get it on</p>
                      <p className="text-white font-bold">Google Play</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px] hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
                  alt="App Preview"
                  fill
                  className="object-cover rounded-3xl opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-3 block">Got Questions?</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-slate-500">Find quick answers to common queries about property in Dwarka.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs shrink-0">Q</span>
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-rose-600 to-rose-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-black text-white">
                Own a property? List it <span className="underline">Now</span>
              </h2>
              <p className="mt-2 text-white text-sm max-w-xl">
                Post your property and connect directly with thousands of verified buyers & tenants. No hidden charges.
              </p>
              <div className="mt-4 flex items-center gap-4 text-rose-100 text-sm">
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Verified Buyers</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Instant Listing</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/for-sellers">
                <Button size="lg" className="bg-white text-rose-600 hover:bg-rose-50 font-bold shadow-xl px-8 w-full sm:w-auto">
                  Get Started as Seller
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
