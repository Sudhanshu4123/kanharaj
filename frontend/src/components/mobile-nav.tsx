"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, Building2, User } from 'lucide-react'
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
    {
      label: 'Post FREE',
      icon: PlusSquare,
      href: '/properties/post',
      highlight: true,
    },
    { label: 'Projects', icon: Building2, href: '/properties?type=RESIDENTIAL+PROJECT&listing=buy' },
    { label: mounted && isAuthenticated ? 'Profile' : 'Login', icon: User, href: mounted ? (isAuthenticated ? '/profile' : '/login') : '/login' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]))
          const highlight = (item as any).highlight

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center relative w-full h-full transition-all",
                highlight
                  ? "text-white"
                  : isActive
                  ? "text-rose-600"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {highlight ? (
                <div className="flex flex-col items-center -mt-4">
                  <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/40 border-4 border-white">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 mt-0.5 leading-none">Post FREE</span>
                </div>
              ) : (
                <>
                  <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                  <span className="text-[10px] font-medium leading-none mt-1">{item.label}</span>
                  {isActive && (
                    <div className="absolute top-0 w-8 h-0.5 bg-rose-600 rounded-b-full" />
                  )}
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
