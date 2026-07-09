"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, User, Shield, Bell, CreditCard, HelpCircle, LogOut, Lock,
} from 'lucide-react'
import { MobileTopBar } from './mobile-top-bar'
import { useAuthStore, usePropertyStore } from '@/lib/store'
import { useUserActivityStore } from '@/lib/user-activity-store'
import { normalizeProfileImageUrl } from '@/lib/profile-utils'
import { getPropertyImageUrl } from '@/lib/platform-data'

type MobileProfileProps = {
  onEditProfile?: () => void
  onChangePassword?: () => void
}

export function MobileProfile({ onEditProfile, onChangePassword }: MobileProfileProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { properties, wishlist } = usePropertyStore()
  const { recentSearches, contactedPropertyIds } = useUserActivityStore()

  if (!user) return null

  const avatar = normalizeProfileImageUrl(user.profileImage)
  const shortlistedCount = wishlist.length
  const inquiriesCount = contactedPropertyIds?.length ?? 0
  const listingsCount = properties.filter((p) => String(p.userId) === String(user.id)).length

  const recentWithImages = recentSearches.slice(0, 4).map((s) => {
    const match = properties.find((p) => s.href.includes(String(p.id)))
    return { ...s, image: match ? getPropertyImageUrl(match) : '/placeholder.png' }
  })

  const menuItems = [
    { label: 'Personal Information', icon: User, onClick: onEditProfile },
    { label: 'Change Password', icon: Lock, onClick: onChangePassword },
    { label: 'Notification Settings', icon: Bell, href: '/profile?tab=edit' },
    { label: 'Payment Methods', icon: CreditCard, href: 'mailto:kanharaj1389@gmail.com?subject=Payment%20Methods' },
    { label: 'Help & Support', icon: HelpCircle, href: 'tel:+919599801767' },
  ]

  return (
    <div className="lg:hidden bg-[#F5F7FA] min-h-screen -mt-16 sm:-mt-20 pb-4">
      <MobileTopBar />

      <div className="px-4 pt-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-rose-50 shrink-0 border-2 border-white shadow-md">
            {avatar ? (
              <Image src={avatar} alt={user.name} width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-[#A21133]">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-slate-900 truncate">{user.name}</h1>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
              <Shield className="w-3 h-3" /> Verified Profile
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Link
            href="/profile?tab=activity&activity=saved"
            className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm"
          >
            <p className="text-xl font-black text-slate-900">{shortlistedCount}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Shortlisted</p>
          </Link>
          <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
            <p className="text-xl font-black text-slate-900">{listingsCount}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Listings</p>
          </div>
          <Link
            href="/profile?tab=activity&activity=contacted"
            className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm"
          >
            <p className="text-xl font-black text-slate-900">{inquiriesCount}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Inquiries</p>
          </Link>
        </div>

        {/* Recent searches */}
        {recentWithImages.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-slate-900">Recent Searches</h2>
              <Link href="/profile?tab=activity&activity=searches" className="text-xs font-bold text-[#A21133]">
                View All
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {recentWithImages.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  className="shrink-0 w-36 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm"
                >
                  <div className="relative h-20 w-full">
                    <Image src={s.image} alt={s.label} fill className="object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{s.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Account settings */}
        <div className="mt-6">
          <h2 className="text-sm font-black text-slate-900 mb-3 px-1">Account Settings</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {menuItems.map((item) => {
              const inner = (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </>
              )
              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    {inner}
                  </button>
                )
              }
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors"
                >
                  {inner}
                </Link>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              logout()
              router.push('/login')
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-4 bg-white rounded-2xl border border-slate-100 text-[#A21133] font-bold text-sm shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
