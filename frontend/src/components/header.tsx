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
  { href: '/properties', label: 'Properties' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/for-sellers', label: 'For Sellers' },
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-9 w-9 flex items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white">
              <img
                src="/logo.png"
                alt="Kanharaj Logo"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden')
                }}
              />
              <Building className="h-7 w-7 text-rose-600 hidden" />
            </div>
            <span className="font-heading text-2xl font-black text-slate-900 tracking-tighter">
              Kanharaj
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
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
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {mounted && isAuthenticated && (user?.role?.toUpperCase() === 'SELLER' || user?.role?.toUpperCase() === 'ADMIN') && (
              <Link href={`${process.env.NEXT_PUBLIC_SELLER_URL}`}>
                <Button variant="ghost" className="text-slate-600 hover:text-rose-600 font-bold px-3 h-9 text-sm">
                  Seller Dashboard
                </Button>
              </Link>
            )}
            


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
              {navLinks.filter(link => link.label !== 'For Sellers').map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {mounted && isAuthenticated && (user?.role?.toUpperCase() === 'SELLER' || user?.role?.toUpperCase() === 'ADMIN') && (
                <Link
                  href={`${process.env.NEXT_PUBLIC_SELLER_URL}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2.5 px-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  🚀 Seller Dashboard
                </Link>
              )}

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

            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}