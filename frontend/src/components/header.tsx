"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Building, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 md:h-12 md:w-12 flex items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-white">
              <img 
                src="/logo.png" 
                alt="Kanharaj Builder Logo" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Building className="h-8 w-8 text-rose-600 hidden" />
            </div>
            <span className="font-heading text-xl md:text-2xl font-bold text-slate-900">
              Kanharaj<span className="text-rose-600">Builder</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-rose-600",
                  pathname === link.href
                    ? "text-rose-600"
                    : "text-slate-600"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rose-600"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        {user?.name}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
            <Link href="/contact">
              <Button size="sm">Enquire Now</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          className="md:hidden bg-white border-b border-slate-200"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block py-2 text-base font-medium",
                  pathname === link.href
                    ? "text-rose-600"
                    : "text-slate-600"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {mounted && (
                <>
                  {!isAuthenticated ? (
                    <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/profile" className="block" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        My Profile
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <Link href="/contact" className="block" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Enquire Now</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}