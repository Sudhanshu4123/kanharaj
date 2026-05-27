"use client"

import Link from 'next/link'
import { Menu, Bell } from 'lucide-react'
import { BRAND_LOGO_SRC } from '@/lib/utils'

type MobileTopBarProps = {
  onMenuClick?: () => void
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-1 -ml-1 text-[#A21133] touch-target"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <img src={BRAND_LOGO_SRC} alt="Kanharaj" className="w-7 h-7 rounded-lg object-cover" />
          <span className="text-xl font-black text-[#A21133] tracking-tight font-serif">Kanharaj</span>
        </Link>
        <Link href="/contact" className="p-1 -mr-1 text-[#A21133] touch-target" aria-label="Notifications">
          <Bell className="w-6 h-6" />
        </Link>
      </div>
    </div>
  )
}
