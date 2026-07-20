"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, Heart, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { useLocationStore } from '@/lib/location-store'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLocationStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePostPropertyClick = (e: React.MouseEvent) => {
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

  // Active status checks
  const isHomeActive = pathname === '/'
  const isSearchActive = pathname === '/properties' || pathname.startsWith('/buy') || pathname.startsWith('/rent')
  const isPostActive = pathname === '/properties/post'
  const isActivityActive = pathname.startsWith('/profile') || pathname.includes('tab=activity')
  const isMenuActive = pathname === '/categories'

  // Hide on property detail, project detail, and chat pages
  const isHiddenPage =
    pathname?.startsWith('/property/') ||
    pathname?.startsWith('/project/') ||
    pathname === '/chat' ||
    pathname?.startsWith('/chat')
  if (isHiddenPage) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-[60px] px-1">
        
        {/* Home */}
        <Link
          href="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center relative w-full h-full transition-all gap-1",
            isHomeActive ? "text-slate-900" : "text-slate-400"
          )}
        >
          <Home className={cn("h-[22px] w-[22px]", isHomeActive && "fill-slate-900")} />
          <span className="text-[10px] font-bold leading-none">Home</span>
        </Link>

        {/* Search */}
        <Link
          href="/properties"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center relative w-full h-full transition-all gap-1",
            isSearchActive ? "text-slate-900" : "text-slate-400"
          )}
        >
          <Search className="h-[22px] w-[22px]" />
          <span className="text-[10px] font-bold leading-none">Search</span>
        </Link>

        {/* Sell/Rent (Custom post property icon with FREE badge) */}
        <button
          onClick={(e) => {
            setIsMobileMenuOpen(false)
            handlePostPropertyClick(e)
          }}
          className={cn(
            "flex flex-col items-center justify-center relative w-full h-full transition-all gap-1",
            isPostActive ? "text-slate-900" : "text-slate-400"
          )}
        >
          <div className="relative flex flex-col items-center justify-center -mt-4.5 mb-1 select-none">
            {/* Border card shape */}
            <div className={cn(
              "w-[34px] h-[34px] border-2 rounded-xl flex items-center justify-center bg-white shadow-sm transition-all duration-200",
              isPostActive ? "border-slate-800 shadow-md" : "border-slate-400"
            )}>
              <span className={cn(
                "text-lg font-black leading-none -mt-0.5",
                isPostActive ? "text-slate-800" : "text-slate-400"
              )}>+</span>
            </div>
            {/* FREE Badge */}
            <span className="absolute bottom-[-6px] bg-[#00b56c] text-white text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full tracking-wider leading-none shadow-sm uppercase">
              FREE
            </span>
          </div>
          <span className="text-[10px] font-bold leading-none">Sell/Rent</span>
        </button>

        {/* Activity */}
        <Link
          href={mounted ? (isAuthenticated ? '/profile?tab=activity' : '/login?redirect=/profile?tab=activity') : '/login'}
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center relative w-full h-full transition-all gap-1",
            isActivityActive ? "text-slate-900" : "text-slate-400"
          )}
        >
          <Heart className={cn("h-[22px] w-[22px]", isActivityActive && "fill-slate-900")} />
          <span className="text-[10px] font-bold leading-none">Activity</span>
        </Link>

        {/* Menu (Categories Page Link) */}
        <Link
          href="/categories"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "flex flex-col items-center justify-center relative w-full h-full transition-all gap-1",
            isMenuActive ? "text-slate-900" : "text-slate-400"
          )}
        >
          <Menu className={cn("h-[22px] w-[22px]", isMenuActive && "text-slate-900")} />
          <span className="text-[10px] font-bold leading-none">Menu</span>
        </Link>

      </div>
    </nav>
  )
}
