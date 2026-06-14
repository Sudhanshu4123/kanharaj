"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Building, User, Menu, X, ChevronDown, LogOut, PlusCircle,
  Building2, Grid, Compass, Store, Phone, CheckSquare, Heart,
  Search, Clock, Gem, CreditCard, Star, Bell, ShieldAlert,
  HelpCircle, ChevronRight, QrCode, Facebook, Instagram, Twitter,
  Linkedin, Youtube, PhoneCall, Key, LayoutGrid, Tag, Newspaper
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { cn, hasSellerDashboardAccess, BRAND_LOGO_SRC, getSellerUrl } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { normalizeProfileImageUrl } from '@/lib/profile-utils'
import { MyActivityPanel, type ActivityTab } from '@/components/header/my-activity-panel'



const buyersMegaData = {
  propertyTypes: [
    { label: 'Flats', href: '/properties?type=flat&listing=buy', icon: Building },
    { label: 'Houses', href: '/properties?type=house&listing=buy', icon: Home },
    { label: 'Builder floors', href: '/properties?type=builder+floor&listing=buy', icon: Building2 },
    { label: 'Plots', href: '/properties?type=plots%2Fland&listing=buy', icon: Grid },
    { label: 'Villas', href: '/properties?type=villa&listing=buy', icon: Compass },
    { label: 'Commercial properties', href: '/properties?type=commercial&listing=buy', icon: Store },
  ],
  popularAreas: [
    { label: 'Vasant Kunj', href: '/properties?search=Vasant+Kunj&listing=buy' },
    { label: 'Paschim Vihar', href: '/properties?search=Paschim+Vihar&listing=buy' },
    { label: 'Chhattarpur', href: '/properties?search=Chhattarpur&listing=buy' },
    { label: 'Sector 3 Rohini', href: '/properties?search=Sector+3+Rohini&listing=buy' },
    { label: 'Sector 2 Rohini', href: '/properties?search=Sector+2+Rohini&listing=buy' },
    { label: 'Sector 1 Rohini', href: '/properties?search=Sector+1+Rohini&listing=buy' },
  ],
  byBhk: [
    { label: '1 RK Properties', href: '/properties?bhk=1rk&listing=buy' },
    { label: '1 BHK Properties', href: '/properties?bhk=1&listing=buy' },
    { label: '2 BHK Properties', href: '/properties?bhk=2&listing=buy' },
    { label: '3 BHK Properties', href: '/properties?bhk=3&listing=buy' },
    { label: '1 BHK Houses', href: '/properties?type=house&bhk=1&listing=buy' },
    { label: '2 BHK Houses', href: '/properties?type=house&bhk=2&listing=buy' },
  ],
  popularSearches: [
    { label: 'Flats without brokerage', href: '/properties?brokerage=zero&listing=buy' },
    { label: 'Under construction flats', href: '/properties?status=under-construction&listing=buy' },
    { label: 'Ready to move-in projects', href: '/properties?status=ready&type=residential+project&listing=buy' },
    { label: 'New residential projects', href: '/properties?type=residential+project&listing=buy' },
    { label: 'Resale properties', href: '/properties?condition=resale&listing=buy' },
    { label: 'Ready to move properties', href: '/properties?status=ready&listing=buy' },
  ]
}

const tenantsMegaData = {
  propertyTypes: [
    { label: 'Flats', href: '/properties?type=flat&listing=rent', icon: Building },
    { label: 'Houses', href: '/properties?type=house&listing=rent', icon: Home },
    { label: 'Builder floors', href: '/properties?type=builder+floor&listing=rent', icon: Building2 },
    { label: 'Villas', href: '/properties?type=villa&listing=rent', icon: Compass },
    { label: 'Commercial properties', href: '/properties?type=commercial&listing=rent', icon: Store },
  ],
  popularAreas: [
    { label: 'Saket', href: '/properties?search=Saket&listing=rent' },
    { label: 'Laxmi Nagar', href: '/properties?search=Laxmi+Nagar&listing=rent' },
    { label: 'Lajpat Nagar', href: '/properties?search=Lajpat+Nagar&listing=rent' },
    { label: 'Sector 3 Rohini', href: '/properties?search=Sector+3+Rohini&listing=rent' },
    { label: 'Sector 2 Rohini', href: '/properties?search=Sector+2+Rohini&listing=rent' },
    { label: 'Sector 1 Rohini', href: '/properties?search=Sector+1+Rohini&listing=rent' },
  ],
  byBhk: [
    { label: '1 RK Flats', href: '/properties?type=flat&bhk=1rk&listing=rent' },
    { label: '1 BHK Flats', href: '/properties?type=flat&bhk=1&listing=rent' },
    { label: '2 BHK Flats', href: '/properties?type=flat&bhk=2&listing=rent' },
    { label: '3 BHK Flats', href: '/properties?type=flat&bhk=3&listing=rent' },
    { label: '1 BHK Houses', href: '/properties?type=house&bhk=1&listing=rent' },
    { label: '2 BHK Houses', href: '/properties?type=house&bhk=2&listing=rent' },
  ],
  popularSearches: [
    { label: 'Flats for rent without brokerage', href: '/properties?brokerage=zero&type=flat&listing=rent' },
    { label: 'Houses for rent without brokerage', href: '/properties?brokerage=zero&type=house&listing=rent' },
    { label: 'Fully furnished houses for rent', href: '/properties?furnishing=fully-furnished&type=house&listing=rent' },
    { label: 'Fully furnished flats for rent', href: '/properties?furnishing=fully-furnished&type=flat&listing=rent' },
    { label: 'Semi furnished flats for rent', href: '/properties?furnishing=semi-furnished&type=flat&listing=rent' },
    { label: 'Unfurnished flats for rent', href: '/properties?furnishing=unfurnished&type=flat&listing=rent' },
  ]
}

const sellersMegaData = {
  title: 'Packages for',
  items: [
    { label: 'Developers', description: 'Launch or sell homes', href: '/for-sellers?role=developer' },
    { label: 'Brokers', description: 'List and grow business', href: '/for-sellers?role=broker' },
    { label: 'Owners', description: 'Sell or rent easily', href: '/for-sellers?role=owner' },
  ]
}

const servicesMegaData = {
  edge: {
    title: 'Kanharaj Services',
    items: [
      { label: 'Home Loan', href: `/coming-soon?title=${encodeURIComponent('Home Loan')}` },
      { label: 'Property Protection', href: `/coming-soon?title=${encodeURIComponent('Property Protection')}` },
      { label: 'Premium Plan', href: `/coming-soon?title=${encodeURIComponent('Premium Plan')}` },
    ]
  },
  tools: {
    title: 'Tools',
    items: [
      { label: 'Pay Rent', href: '/coming-soon' },
      { label: 'Create Rent Agreement', href: '/coming-soon' },
      { label: 'Hire Expert Advisor', href: '/coming-soon' },
      { label: 'Home Interiors', href: '/coming-soon' },
    ]
  }
}

const newsMegaData = {
  title: 'Property market guide',
  items: [
    { label: 'Real Estate News', description: 'Latest market updates', href: '/#news' },
    { label: 'Buying Guide', description: 'Expert homebuying tips', href: `/coming-soon?title=${encodeURIComponent('Buying Guide')}` },
    { label: 'Property Research', description: 'Data-driven insights', href: '/#research-insights' },
    { label: 'New Delhi Overview', description: 'Real estate & area highlights', href: `/coming-soon?title=${encodeURIComponent('New Delhi Overview')}` },
  ]
}


const navLinks = [
  {
    label: 'For Buyers',
    icon: Home,
    subLinks: [
      { href: '/properties?listing=buy', label: 'Buy Residential' },
      { href: '/properties?type=RESIDENTIAL+PROJECT&listing=buy', label: 'New Projects' },
      { href: '/properties?type=PLOTS%2FLAND&listing=buy', label: 'Plots / Land' }
    ]
  },
  {
    label: 'For Tenants',
    icon: Key,
    subLinks: [
      { href: '/properties?listing=rent', label: 'Rent Residential' },
      { href: '/properties?listing=rent&type=PG', label: 'PG / Co-Living' }
    ]
  },
  {
    label: 'For Sellers',
    icon: Tag,
    subLinks: [
      { href: '/for-sellers', label: 'Post Property FREE' }
    ]
  },
  {
    label: 'Services',
    icon: LayoutGrid,
    subLinks: [
      { href: '/coming-soon', label: 'Home Loans' },
      { href: '/coming-soon', label: 'Rent Agreement' },
      { href: '/coming-soon', label: 'Expert Advice' }
    ]
  },
  {
    label: 'News & Guide',
    icon: Newspaper,
    subLinks: [
      { href: '/#research-insights', label: 'Research & Insights' },
      { href: '/#news', label: 'Real Estate News' }
    ]
  }
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/properties' || pathname?.startsWith('/property/')) {
    return null
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityTab>('seen')
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [sellerUrl, setSellerUrl] = useState('https://seller.kanharaj.com')
  useEffect(() => {
    setSellerUrl(getSellerUrl())
  }, [])

  const { isAuthenticated, user, token, logout, refreshUser } = useAuthStore()
  const showSellerDashboard = isAuthenticated && hasSellerDashboardAccess(user)
  const sellerDashboardHref = token ? `${sellerUrl}/login?token=${token}` : `${sellerUrl}/login`

  const handleLogout = () => {
    logout()
    setOpenDropdown(null)
    setIsMenuOpen(false)
    router.push('/login')
  }

  const handlePostPropertyFreeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('Please login to post a property.')
      router.push('/login?redirect=/properties/post')
      return
    }

    const role = String(user?.role || '').toUpperCase()
    const plan = String(user?.subscriptionPlan || 'NONE').toUpperCase()
    const freePostsUsed = user?.freePostsUsed ?? 0
    const isAdmin = role === 'ADMIN'

    if (!isAdmin && plan === 'NONE' && freePostsUsed >= 3) {
      alert('You have used all 3 free posts. Please purchase a subscription to continue.')
      router.push('/for-sellers')
    } else {
      router.push('/properties/post')
    }
  }

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mounted && isAuthenticated) {
      refreshUser()
    }
  }, [mounted, isAuthenticated, refreshUser])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        openDropdown === 'user' &&
        !target.closest('.profile-menu-container')
      ) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [openDropdown])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0a2540] h-[60px] flex items-center px-4 sm:px-6 lg:px-10 justify-between border-b border-white/10",
      scrolled && "shadow-lg shadow-black/20",
      pathname === '/properties' && "hidden"
    )}>
      {/* Logo */}
      <div className="flex items-center shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-[#0d233a] border border-[#dfa127] shrink-0 shadow-sm">
            <img
              src={BRAND_LOGO_SRC}
              alt="Kanharaj Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <div className="flex items-baseline">
              <span className="font-sans font-black text-base text-white tracking-tighter leading-none">KANHARAJ</span>
              <span className="text-[9px] font-black text-[#dfa127] ml-0.5 leading-none">.COM</span>
            </div>
            <span className="hidden sm:block text-[8px] font-bold text-white/50 mt-0.5 uppercase tracking-wide whitespace-nowrap">Dream Property. Right Place.</span>
          </div>
        </Link>
      </div>

      <nav className="hidden lg:flex items-center gap-2 xl:gap-4 ml-auto mr-4">
        {navLinks.map((link) => (
          <div
            key={link.label}
            className="relative group py-2"
            onMouseEnter={() => setOpenDropdown(link.label)}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              className="px-2.5 py-1.5 text-xs sm:text-sm font-bold text-white hover:text-[#dfa127] group-hover:text-[#dfa127] transition-colors flex items-center gap-1.5 rounded-lg"
            >
              {link.icon && <link.icon className="h-4 w-4 text-white/70 group-hover:text-[#dfa127] transition-colors" />}
              <span>{link.label}</span>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform duration-200 opacity-70",
                openDropdown === link.label ? "rotate-180" : ""
              )} />
            </button>

            {link.subLinks && (
              <AnimatePresence>
                {openDropdown === link.label && (
                  link.label === 'For Buyers' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-[25%] mt-1 w-[820px] bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 grid grid-cols-4 gap-6 z-50 text-slate-800 border-t-4 border-[#f22b68] pointer-events-auto"
                    >
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Property type</span>
                        <div className="space-y-1">
                          {buyersMegaData.propertyTypes.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpenDropdown(null)}
                                className="flex items-center gap-3 py-2 px-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors font-bold text-sm group"
                              >
                                <Icon className="h-4.5 w-4.5 text-slate-400 shrink-0 group-hover:text-[#f22b68] transition-colors" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Popular areas</span>
                        <div className="space-y-2">
                          {buyersMegaData.popularAreas.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block py-0.5 px-1 font-semibold text-slate-600 hover:text-[#f22b68] text-sm transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Search by BHK</span>
                        <div className="space-y-2">
                          {buyersMegaData.byBhk.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block py-0.5 px-1 font-semibold text-slate-600 hover:text-[#f22b68] text-sm transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Popular searches</span>
                        <div className="space-y-2">
                          {buyersMegaData.popularSearches.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block py-0.5 px-1 font-semibold text-slate-600 hover:text-[#f22b68] text-sm transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : link.label === 'For Tenants' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-[40%] mt-1 w-[820px] bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 grid grid-cols-4 gap-6 z-50 text-slate-800 border-t-4 border-[#f22b68] pointer-events-auto"
                    >
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Property type</span>
                        <div className="space-y-1">
                          {tenantsMegaData.propertyTypes.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpenDropdown(null)}
                                className="flex items-center gap-3 py-2 px-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors font-bold text-sm group"
                              >
                                <Icon className="h-4.5 w-4.5 text-slate-400 shrink-0 group-hover:text-[#f22b68] transition-colors" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Popular areas</span>
                        <div className="space-y-2">
                          {tenantsMegaData.popularAreas.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block py-0.5 px-1 font-semibold text-slate-600 hover:text-[#f22b68] text-sm transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Search by BHK</span>
                        <div className="space-y-2">
                          {tenantsMegaData.byBhk.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block py-0.5 px-1 font-semibold text-slate-600 hover:text-[#f22b68] text-sm transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-4 block">Popular searches</span>
                        <div className="space-y-2">
                          {tenantsMegaData.popularSearches.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block py-0.5 px-1 font-semibold text-slate-600 hover:text-[#f22b68] text-sm transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : link.label === 'For Sellers' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-50 text-slate-800 border-t-4 border-[#f22b68] pointer-events-auto"
                    >
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 px-2 block">{sellersMegaData.title}</span>
                      <div className="space-y-1">
                        {sellersMegaData.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                          >
                            <span className="text-slate-900 text-sm font-bold block group-hover:text-slate-900 transition-colors">{item.label}</span>
                            <span className="text-slate-400 text-xs font-semibold block mt-0.5">{item.description}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ) : link.label === 'Services' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-[420px] bg-white border border-slate-100 shadow-2xl rounded-2xl p-5 grid grid-cols-2 gap-6 z-50 text-slate-800 border-t-4 border-[#f22b68] pointer-events-auto"
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 block">{servicesMegaData.edge.title}</span>
                        <div className="space-y-2">
                          {servicesMegaData.edge.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block font-bold text-slate-700 hover:text-[#f22b68] text-sm transition-colors py-0.5 px-1 rounded-md hover:bg-slate-50"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 block">{servicesMegaData.tools.title}</span>
                        <div className="space-y-2">
                          {servicesMegaData.tools.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block font-bold text-slate-700 hover:text-[#f22b68] text-sm transition-colors py-0.5 px-1 rounded-md hover:bg-slate-50"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : link.label === 'News & Guide' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-[60%] mt-1 w-[290px] bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-50 text-slate-800 border-t-4 border-[#f22b68] pointer-events-auto"
                    >
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 px-2 block">{newsMegaData.title}</span>
                      <div className="space-y-1">
                        {newsMegaData.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block p-2 rounded-xl hover:bg-slate-50 group transition-colors"
                          >
                            <span className="text-slate-900 text-sm font-bold block group-hover:text-slate-900 transition-colors">{item.label}</span>
                            <span className="text-slate-400 text-xs font-semibold block mt-0.5">{item.description}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-100 shadow-xl rounded-xl py-2 overflow-hidden z-50 text-slate-800"
                    >
                      {link.subLinks.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-3 shrink-0">
        {showSellerDashboard && (
          <a href={sellerDashboardHref} target="_blank" rel="noopener noreferrer">
            <Button className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs shadow-sm transition-all duration-300">
              Seller Dashboard
            </Button>
          </a>
        )}

        <button
          onClick={handlePostPropertyFreeClick}
          className="h-11 px-5 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-full text-xs shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-white/20 shrink-0"
        >
          <span className="flex items-center justify-center w-4 h-4 rounded-full border border-white text-white font-bold text-[10px] leading-none shrink-0">+</span>
          <span>Post Property</span>
          <span className="bg-[#ffbe1a] text-[#0a2540] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-none">FREE</span>
        </button>

        {mounted && (
          <div className="relative profile-menu-container flex items-center gap-2.5">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
              className="w-11 h-11 rounded-full bg-[#dfa127] hover:bg-[#c29224] flex items-center justify-center text-white transition-all shrink-0 shadow-sm overflow-hidden"
              aria-label="User profile"
            >
              {isAuthenticated && user && normalizeProfileImageUrl(user.profileImage) ? (
                <img
                  src={normalizeProfileImageUrl(user.profileImage)}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : isAuthenticated ? (
                <span className="text-sm font-black">{user?.name?.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </button>

            <AnimatePresence>
              {openDropdown === 'user' && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-3 w-[390px] sm:w-[420px] max-h-[85vh] bg-white border border-slate-200 shadow-2xl rounded-[28px] overflow-y-auto p-5 z-50 text-slate-800 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-slate-200 pointer-events-auto"
                >
                  <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {isAuthenticated ? `Hello ${user?.name || 'there'}!` : 'Welcome to Kanharaj'}
                        </h4>
                        {isAuthenticated ? (
                          <>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">{user?.email}</p>
                            {user?.phone && <p className="text-xs text-slate-500 font-semibold">{user.phone}</p>}
                          </>
                        ) : (
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">Log in to save properties and manage your account</p>
                        )}
                      </div>
                    </div>
                    {isAuthenticated ? (
                      <Link href="/profile" onClick={() => setOpenDropdown(null)}>
                        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm transition-colors">Edit</button>
                      </Link>
                    ) : (
                      <Link href="/login" onClick={() => setOpenDropdown(null)}>
                        <button className="bg-[#f22b68] hover:bg-[#e01f5c] text-white text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm transition-colors">Log In</button>
                      </Link>
                    )}
                  </div>

                  {isAuthenticated && (
                    <>
                      <MyActivityPanel
                        variant="desktop"
                        activeTab={activeActivityTab}
                        setActiveTab={setActiveActivityTab}
                        onNavigate={() => setOpenDropdown(null)}
                      />
                      <div className="flex flex-col border-t border-slate-100 pt-3 gap-0.5">
                        <Link href="/properties?brokerage=zero" onClick={() => setOpenDropdown(null)} className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold text-sm">
                          <div className="flex items-center gap-3"><Gem className="h-4.5 w-4.5 text-amber-500 shrink-0" /><span>Zero Brokerage Properties</span></div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                        <Link href="/profile?tab=activity&activity=contacted" onClick={() => setOpenDropdown(null)} className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold text-sm">
                          <div className="flex items-center gap-3"><CreditCard className="h-4.5 w-4.5 text-blue-500 shrink-0" /><span>My Transactions</span></div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                        <Link href="/feedback" onClick={() => setOpenDropdown(null)} className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold text-sm">
                          <div className="flex items-center gap-3"><Star className="h-4.5 w-4.5 text-yellow-500 shrink-0" /><span>My Reviews</span><span className="ml-2 px-2 py-0.5 text-[8px] font-black tracking-wider bg-[#ff007f] text-white rounded-full uppercase leading-none">NEW</span></div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                        <a href="mailto:kanharaj1389@gmail.com?subject=Unsubscribe%20Alerts" onClick={() => setOpenDropdown(null)} className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold text-sm">
                          <div className="flex items-center gap-3"><Bell className="h-4.5 w-4.5 text-rose-500 shrink-0" /><span>Unsubscribe Alerts</span></div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </a>
                        <a href="mailto:kanharaj1389@gmail.com?subject=Report%20Fraud" onClick={() => setOpenDropdown(null)} className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold text-sm border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3"><ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0" /><span>Report a Fraud</span></div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </a>
                      </div>
                    </>
                  )}

                  {isAuthenticated ? (
                    <button type="button" onClick={() => handleLogout()} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl flex items-center justify-between transition-all shadow-sm font-extrabold text-xs w-full">
                      <div className="flex items-center gap-3"><LogOut className="h-4.5 w-4.5 text-slate-500" /><span>Log Out</span></div>
                      <ChevronRight className="h-4.5 w-4.5 text-slate-500" />
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setOpenDropdown(null)} className="bg-[#f22b68] hover:bg-[#e01f5c] text-white px-4 py-3 rounded-2xl flex items-center justify-between transition-all shadow-sm font-extrabold text-xs w-full">
                      <div className="flex items-center gap-3"><User className="h-4.5 w-4.5" /><span>Log In / Register</span></div>
                      <ChevronRight className="h-4.5 w-4.5" />
                    </Link>
                  )}

                  <div className="flex items-center justify-between px-1 text-slate-400">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Follow on</span>
                    <div className="flex items-center gap-2">
                      <a href="#" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 hover:text-[#1877f2] flex items-center justify-center transition-colors"><Facebook className="w-3.5 h-3.5" /></a>
                      <a href="#" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 hover:text-[#c13584] flex items-center justify-center transition-colors"><Instagram className="w-3.5 h-3.5" /></a>
                      <a href="#" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 hover:text-[#1da1f2] flex items-center justify-center transition-colors"><Twitter className="w-3.5 h-3.5" /></a>
                      <a href="#" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 hover:text-[#0077b5] flex items-center justify-center transition-colors"><Linkedin className="w-3.5 h-3.5" /></a>
                      <a href="#" className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 hover:text-[#ff0000] flex items-center justify-center transition-colors"><Youtube className="w-3.5 h-3.5" /></a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <button
        className="lg:hidden w-11 h-11 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-[#0a2540] transition-colors shrink-0 shadow-sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="lg:hidden absolute top-[84px] left-0 right-0 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 max-h-[75vh] overflow-y-auto z-50 text-slate-800 flex flex-col gap-4"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <div className="space-y-1">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    {link.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", openDropdown === link.label ? "rotate-180" : "")} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-4 overflow-hidden py-2 space-y-4 border-l border-slate-100 ml-3"
                      >
                        {link.label === 'For Buyers' ? (
                          <>
                            {/* Property Type */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Property type</span>
                              <div className="grid grid-cols-2 gap-1">
                                {buyersMegaData.propertyTypes.map((item) => {
                                  const Icon = item.icon;
                                  return (
                                    <Link
                                      key={item.label}
                                      href={item.href}
                                      onClick={() => {
                                        setIsMenuOpen(false)
                                        setOpenDropdown(null)
                                      }}
                                      className="flex items-center gap-2 py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                    >
                                      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                      {item.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Popular Areas */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Popular areas</span>
                              <div className="grid grid-cols-2 gap-1">
                                {buyersMegaData.popularAreas.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => {
                                      setIsMenuOpen(false)
                                      setOpenDropdown(null)
                                    }}
                                    className="block py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>

                            {/* BHK */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Search by BHK</span>
                              <div className="grid grid-cols-2 gap-1">
                                {buyersMegaData.byBhk.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => {
                                      setIsMenuOpen(false)
                                      setOpenDropdown(null)
                                    }}
                                    className="block py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>

                            {/* Popular Searches */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Popular searches</span>
                              <div className="space-y-1">
                                {buyersMegaData.popularSearches.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => {
                                      setIsMenuOpen(false)
                                      setOpenDropdown(null)
                                    }}
                                    className="block py-1 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : link.label === 'For Tenants' ? (
                          <>
                            {/* Property Type */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Property type</span>
                              <div className="grid grid-cols-2 gap-1">
                                {tenantsMegaData.propertyTypes.map((item) => {
                                  const Icon = item.icon;
                                  return (
                                    <Link
                                      key={item.label}
                                      href={item.href}
                                      onClick={() => {
                                        setIsMenuOpen(false)
                                        setOpenDropdown(null)
                                      }}
                                      className="flex items-center gap-2 py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                    >
                                      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                      {item.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Popular Areas */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Popular areas</span>
                              <div className="grid grid-cols-2 gap-1">
                                {tenantsMegaData.popularAreas.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => {
                                      setIsMenuOpen(false)
                                      setOpenDropdown(null)
                                    }}
                                    className="block py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>

                            {/* BHK */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Search by BHK</span>
                              <div className="grid grid-cols-2 gap-1">
                                {tenantsMegaData.byBhk.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => {
                                      setIsMenuOpen(false)
                                      setOpenDropdown(null)
                                    }}
                                    className="block py-1.5 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>

                            {/* Popular Searches */}
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Popular searches</span>
                              <div className="space-y-1">
                                {tenantsMegaData.popularSearches.map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => {
                                      setIsMenuOpen(false)
                                      setOpenDropdown(null)
                                    }}
                                    className="block py-1 px-2 text-xs font-semibold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : link.label === 'For Sellers' ? (
                          <>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">{sellersMegaData.title}</span>
                            <div className="space-y-1">
                              {sellersMegaData.items.map((item) => (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  onClick={() => {
                                    setIsMenuOpen(false)
                                    setOpenDropdown(null)
                                  }}
                                  className="block py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-all group"
                                >
                                  <span className="text-xs font-bold text-slate-900 block group-hover:text-slate-900">{item.label}</span>
                                  <span className="text-[10px] font-semibold text-slate-400 block">{item.description}</span>
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : link.label === 'Services' ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">{servicesMegaData.edge.title}</span>
                                <div className="space-y-1">
                                  {servicesMegaData.edge.items.map((item) => (
                                    <Link
                                      key={item.label}
                                      href={item.href}
                                      onClick={() => {
                                        setIsMenuOpen(false)
                                        setOpenDropdown(null)
                                      }}
                                      className="block py-1.5 px-2 text-xs font-bold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">{servicesMegaData.tools.title}</span>
                                <div className="space-y-1">
                                  {servicesMegaData.tools.items.map((item) => (
                                    <Link
                                      key={item.label}
                                      href={item.href}
                                      onClick={() => {
                                        setIsMenuOpen(false)
                                        setOpenDropdown(null)
                                      }}
                                      className="block py-1.5 px-2 text-xs font-bold text-slate-600 hover:text-[#f22b68] hover:bg-slate-50 rounded-lg transition-all"
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : link.label === 'News & Guide' ? (
                          <>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">{newsMegaData.title}</span>
                            <div className="space-y-1">
                              {newsMegaData.items.map((item) => (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  onClick={() => {
                                    setIsMenuOpen(false)
                                    setOpenDropdown(null)
                                  }}
                                  className="block py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-all group"
                                >
                                  <span className="text-xs font-bold text-slate-900 block group-hover:text-slate-900">{item.label}</span>
                                  <span className="text-[10px] font-semibold text-slate-400 block">{item.description}</span>
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          link.subLinks && link.subLinks.map(sub => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => {
                                setIsMenuOpen(false)
                                setOpenDropdown(null)
                              }}
                              className="block py-2 px-3 text-sm font-semibold text-slate-600 hover:text-rose-600 rounded-lg transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                onClick={(e) => {
                  setIsMenuOpen(false)
                  handlePostPropertyFreeClick(e)
                }}
                className="w-full bg-gradient-to-r from-[#f22b68] to-[#e01f5c] text-white font-extrabold h-11 flex items-center justify-center gap-2 rounded-xl hover:opacity-95 shadow-sm active:scale-95 transition-all text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Property FREE</span>
              </button>

              {showSellerDashboard && (
                <a
                  href={sellerDashboardHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 flex items-center justify-center gap-2 rounded-xl">
                    <span>Seller Dashboard</span>
                  </Button>
                </a>
              )}

              {/* Collapsible Mobile Dashboard Accordion */}
              <div className="space-y-1">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'mobile-user' ? null : 'mobile-user')}
                  className="w-full flex items-center justify-between py-3 px-3.5 text-sm font-extrabold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="h-4.5 w-4.5 text-[#f22b68]" />
                    <span>
                      {isAuthenticated ? (user?.name || 'My Account') : 'Account'} (Dashboard)
                    </span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 text-slate-400", openDropdown === 'mobile-user' ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'mobile-user' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-3 overflow-hidden py-3 space-y-4 ml-1 flex flex-col gap-4 border-l border-indigo-100"
                    >
                      {/* Mobile Profile Card */}
                      <div className="bg-[#f8fafc] border border-slate-100 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight">
                            {isAuthenticated ? (user?.name || 'My Account') : 'Welcome to Kanharaj'}
                          </h4>
                          {isAuthenticated ? (
                            <>
                              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                                {user?.email}
                              </p>
                              {user?.phone && (
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                  {user.phone}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                              Log in to access your dashboard
                            </p>
                          )}
                        </div>
                        {isAuthenticated ? (
                          <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] px-3 py-1 rounded-full font-bold shadow-sm transition-colors">
                              Edit
                            </button>
                          </Link>
                        ) : (
                          <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                            <button className="bg-[#f22b68] hover:bg-[#e01f5c] text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm transition-colors">
                              Log In
                            </button>
                          </Link>
                        )}
                      </div>

                      {isAuthenticated && (
                        <>
                          <MyActivityPanel
                            variant="mobile"
                            activeTab={activeActivityTab}
                            setActiveTab={setActiveActivityTab}
                            onNavigate={() => setIsMenuOpen(false)}
                          />

                          {/* Mobile Links List */}
                          <div className="flex flex-col gap-1 pr-2">
                            <Link
                              href="/properties?brokerage=zero"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Gem className="h-4 w-4 text-amber-500" />
                                <span>Zero Brokerage Properties</span>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </Link>

                            <Link
                              href="/profile?tab=activity&activity=contacted"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-blue-500" />
                                <span>My Transactions</span>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </Link>

                            <Link
                              href="/feedback"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <div className="flex items-center">
                                  <span>My Reviews</span>
                                  <span className="ml-2 px-1.5 py-0.5 text-[7px] font-black bg-[#ff007f] text-white rounded-full uppercase">NEW</span>
                                </div>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </Link>

                            <a
                              href="mailto:kanharaj1389@gmail.com?subject=Unsubscribe%20Alerts"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-rose-500" />
                                <span>Unsubscribe Alerts</span>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </a>

                            <a
                              href="mailto:kanharaj1389@gmail.com?subject=Report%20Fraud"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                                <span>Report a Fraud</span>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </a>
                          </div>

                        </>
                      )}

                      {/* Actions */}
                      <div className="space-y-2 pr-2">

                        {isAuthenticated ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleLogout()
                            }}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors font-extrabold text-xs w-full"
                          >
                            <div className="flex items-center gap-2">
                              <LogOut className="h-4 w-4 text-slate-500" />
                              <span>Log Out</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-500" />
                          </button>
                        ) : (
                          <Link
                            href="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-[#f22b68] hover:bg-[#e01f5c] text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors font-extrabold text-xs w-full"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Log In / Register</span>
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
