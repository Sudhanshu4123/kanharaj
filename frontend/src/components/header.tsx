"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Building, User, Menu, X, ChevronDown, LogOut, PlusCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  {
    label: 'Services',
    subLinks: [
      { href: '/terms', label: 'Terms of service' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/feedback', label: 'Feedback' }
    ]
  },
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
              <div
                key={link.label}
                className="relative group"
                onMouseEnter={() => !link.href && setOpenDropdown(link.label)}
                onMouseLeave={() => !link.href && setOpenDropdown(null)}
              >
                {link.href ? (
                  <Link
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
                ) : (
                  <button
                    className={cn(
                      "px-3 py-2 text-sm font-semibold transition-colors rounded-lg flex items-center gap-1",
                      openDropdown === link.label
                        ? "text-rose-600 bg-rose-50"
                        : "text-slate-700 hover:text-rose-600 hover:bg-rose-50"
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", openDropdown === link.label ? "rotate-180" : "")} />
                  </button>
                )}

                {link.subLinks && (
                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-2 overflow-hidden"
                      >
                        {link.subLinks.map(sub => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
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
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown('user')}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {/* Avatar Button */}
                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50 transition-all shadow-sm">
                      <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-black shrink-0 overflow-hidden">
                        {user?.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name || "User"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", openDropdown === 'user' ? 'rotate-180' : '')} />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {openDropdown === 'user' && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50"
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <p className="text-sm font-black text-slate-900">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              href="/profile"
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <User className="h-4 w-4 text-rose-500" />
                              Edit My Profile
                            </Link>
                            {(user?.role?.toUpperCase() === 'ADMIN') && (
                              <Link
                                href="/admin"
                                onClick={() => setOpenDropdown(null)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <PlusCircle className="h-4 w-4 text-rose-500" />
                                Admin Dashboard
                              </Link>
                            )}
                          </div>

                          {/* Logout */}
                          <div className="border-t border-slate-100 py-2">
                            <button
                              onClick={() => { logout(); setOpenDropdown(null) }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
              <div key={link.label}>
                {link.href ? (
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      {link.label}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", openDropdown === link.label ? "rotate-180" : "")} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === link.label && link.subLinks && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-4 overflow-hidden"
                        >
                          {link.subLinks.map(sub => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => {
                                setIsMenuOpen(false)
                                setOpenDropdown(null)
                              }}
                              className="block py-2.5 px-3 text-sm font-medium text-slate-600 hover:text-rose-600 rounded-lg transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
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

            <div className="pt-3 space-y-2 border-t border-slate-100">
              {mounted && !isAuthenticated ? (
                <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold">
                    Login / Register
                  </Button>
                </Link>
              ) : (
                <>
                  {/* User Info */}
                  {mounted && isAuthenticated && (
                    <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1">
                      <p className="text-sm font-black text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-2.5 px-3 text-sm font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-rose-500" />
                    Edit My Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false) }}
                    className="flex items-center gap-3 w-full py-2.5 px-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}