"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Building, User, Menu, X, ChevronDown, Phone, PlusCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties?listing=buy', label: 'Buy' },
  { href: '/properties?listing=rent', label: 'Rent' },
  {
    href: '#', label: 'More', dropdown: [
      { label: '🏗️ New Projects', href: '/properties?type=RESIDENTIAL+PROJECT&listing=buy' },
      { label: '🏢 Commercial', href: '/properties?type=COMMERCIAL' },
      { label: '📍 Plots / Land', href: '/properties?type=PLOTS%2FLAND' },
      { label: '🛏️ PG / Hostel', href: '/properties?type=PG&listing=rent' },
      { label: '🏨 Hotel Rooms', href: '/properties?type=HOTEL' },
    ]
  },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white shadow-md border-b border-slate-200"
        : "bg-white/95 backdrop-blur-md border-b border-slate-200"
    )}>
      {/* Top bar */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>India's Trusted Real Estate Portal — Dwarka, Delhi, Gurgaon, Noida & more</span>
          <div className="flex items-center gap-4">
            <Link href="tel:+919599801767" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="h-3 w-3" /> +91 9599801767
            </Link>
            <span>|</span>
            <Link href="/properties/post" className="hover:text-rose-400 transition-colors font-bold">
              FREE Property Listing
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-9 w-9 flex items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white">
              <img
                src="/logo.png"
                alt="Kanharaj Builder Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden')
                }}
              />
              <Building className="h-7 w-7 text-rose-600 hidden" />
            </div>
            <span className="font-heading text-xl font-bold text-slate-900">
              Kanharaj<span className="text-rose-600">Builder</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50">
                    {link.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openDropdown === link.label && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 mt-1 z-50 overflow-hidden"
                      >
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors font-medium"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 text-sm font-semibold transition-colors rounded-lg",
                    pathname === link.href.split('?')[0]
                      ? "text-rose-600 bg-rose-50"
                      : "text-slate-700 hover:text-rose-600 hover:bg-rose-50"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/properties/post">
              <Button variant="outline" className="hidden xl:flex border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold px-4 h-9 text-sm rounded-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post Property
              </Button>
            </Link>

            {mounted && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link href="/profile">
                      <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 font-semibold px-4 h-9 text-sm">
                        <User className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                        {user?.name?.split(' ')[0] || 'Account'}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button className="h-9 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-sm">
                      Login / Register
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-slate-900" />
            ) : (
              <Menu className="h-6 w-6 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-white border-b border-slate-200 shadow-xl"
        >
          <div className="px-4 py-4 space-y-1">
            {[
              { href: '/', label: '🏠 Home' },
              { href: '/properties?listing=buy', label: '🏢 Buy Property' },
              { href: '/properties?listing=rent', label: '🔑 Rent Property' },
              { href: '/properties?type=RESIDENTIAL+PROJECT&listing=buy', label: '🏗️ New Projects' },
              { href: '/properties?type=COMMERCIAL', label: '🏢 Commercial' },
              { href: '/properties?type=PLOTS%2FLAND', label: '📍 Plots / Land' },
              { href: '/properties?type=PG&listing=rent', label: '🛏️ PG / Hostel' },
              { href: '/properties?type=HOTEL', label: '🏨 Hotel Rooms' },
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 space-y-2">
              {mounted && !isAuthenticated ? (
                <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold">
                    Login / Register
                  </Button>
                </Link>
              ) : (
                <Link href="/profile" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-bold">
                    <User className="h-4 w-4 mr-2 text-rose-600" /> My Profile
                  </Button>
                </Link>
              )}
              <Link href="/properties/post" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  Post Property FREE
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}