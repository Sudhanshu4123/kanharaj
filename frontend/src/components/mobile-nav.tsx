"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Explore', icon: Search, href: '/properties' },
    { label: 'Add', icon: PlusSquare, href: '/admin' },
    { label: 'Inquiry', icon: MessageSquare, href: '/admin?tab=inquiries' },
    { label: 'Account', icon: User, href: isAuthenticated ? '/profile' : '/login' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white border-t border-slate-200 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center relative w-full h-full transition-colors",
                isActive ? "text-rose-600" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium leading-none mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-rose-600 rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
