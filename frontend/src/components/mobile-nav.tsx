"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Phone, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

export function MobileNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Properties', icon: Search, href: '/properties' },
    { label: 'Call Us', icon: Phone, href: 'tel:+919599801767' },
    { label: 'Profile', icon: User, href: mounted ? (isAuthenticated ? '/profile' : '/login') : '/login' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t border-slate-100 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]))

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center relative w-full h-full transition-all",
                isActive
                  ? "text-[#A21133]"
                  : "text-slate-400 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
              <span className="text-[10px] font-bold leading-none mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
