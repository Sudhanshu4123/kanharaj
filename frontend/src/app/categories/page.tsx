"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Home, Building, User, PlusCircle, Building2, Grid,
  Compass, Store, CheckSquare, Heart, Key, LayoutGrid, Newspaper,
  HelpCircle, Gem, PhoneCall, ArrowLeft, Tag, Sparkles, CreditCard, Star,
  ShieldCheck, FileText, UserCheck, DollarSign, Bell, ShieldAlert, LogOut, MapPin,
  MessageSquare
} from 'lucide-react'
import { cn, BRAND_LOGO_SRC } from '@/lib/utils'

const categoriesTabs = [
  { id: 'buyers', label: 'For Buyers', icon: Home },
  { id: 'tenants', label: 'For Tenants', icon: Key },
  { id: 'sellers', label: 'For Sellers', icon: Tag, isBadge: true, badgeText: 'FREE' },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'news_guide', label: 'News & Guide', icon: Newspaper },
  { id: 'account', label: 'Account (Dashboard)', icon: User },
]

const categoriesData = {
  buyers: {
    sections: [
      {
        title: 'Property Types',
        items: [
          { label: 'Flats', href: '/buy/flat', icon: Building, iconBg: 'bg-[#0052cc]' },
          { label: 'Houses', href: '/buy/house', icon: Home, iconBg: 'bg-[#ffab00]' },
          { label: 'Builder floors', href: '/buy/floor', icon: Building2, iconBg: 'bg-[#6554c0]' },
          { label: 'Plots', href: '/buy/plot', icon: Grid, iconBg: 'bg-[#00875a]' },
          { label: 'Villas', href: '/buy/villa', icon: Compass, iconBg: 'bg-[#ff5630]' },
          { label: 'Commercial', href: '/buy/commercial', icon: Store, iconBg: 'bg-[#36b37e]' },
        ]
      },
      {
        title: 'Search by BHK',
        items: [
          { label: '1 RK Properties', href: '/properties?bhk=1rk&listing=buy', icon: Building2, iconBg: 'bg-indigo-500' },
          { label: '1 BHK Properties', href: '/properties?bhk=1&listing=buy', icon: Building2, iconBg: 'bg-indigo-600' },
          { label: '2 BHK Properties', href: '/properties?bhk=2&listing=buy', icon: Building2, iconBg: 'bg-blue-600' },
          { label: '3 BHK Properties', href: '/properties?bhk=3&listing=buy', icon: Building2, iconBg: 'bg-blue-700' },
          { label: '1 BHK Houses', href: '/properties?type=house&bhk=1&listing=buy', icon: Home, iconBg: 'bg-amber-600' },
          { label: '2 BHK Houses', href: '/properties?type=house&bhk=2&listing=buy', icon: Home, iconBg: 'bg-amber-700' },
        ]
      },
      {
        title: 'Popular Areas',
        items: [
          { label: 'Vasant Kunj', href: '/properties?search=Vasant+Kunj&listing=buy', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Paschim Vihar', href: '/properties?search=Paschim+Vihar&listing=buy', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Chhattarpur', href: '/properties?search=Chhattarpur&listing=buy', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Sector 3 Rohini', href: '/properties?search=Sector+3+Rohini&listing=buy', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Sector 2 Rohini', href: '/properties?search=Sector+2+Rohini&listing=buy', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Sector 1 Rohini', href: '/properties?search=Sector+1+Rohini&listing=buy', icon: MapPin, iconBg: 'bg-rose-500' },
        ]
      },
      {
        title: 'Popular Searches',
        items: [
          { label: 'Zero Brokerage', href: '/properties?brokerage=zero&listing=buy', icon: Gem, iconBg: 'bg-amber-500' },
          { label: 'Under Construction', href: '/properties?status=under-construction&listing=buy', icon: Compass, iconBg: 'bg-[#00875a]' },
          { label: 'Ready to Move', href: '/properties?status=ready&listing=buy', icon: CheckSquare, iconBg: 'bg-[#ff007f]' },
          { label: 'New Projects', href: '/buy/residential-project', icon: Building2, iconBg: 'bg-[#0052cc]' },
        ]
      }
    ]
  },
  tenants: {
    sections: [
      {
        title: 'Rental Property Types',
        items: [
          { label: 'Flats for Rent', href: '/rent/flat', icon: Building, iconBg: 'bg-[#0052cc]' },
          { label: 'Houses for Rent', href: '/rent/house', icon: Home, iconBg: 'bg-[#ffab00]' },
          { label: 'Builder Floors', href: '/rent/floor', icon: Building2, iconBg: 'bg-[#6554c0]' },
          { label: 'Villas for Rent', href: '/rent/villa', icon: Compass, iconBg: 'bg-[#ff5630]' },
          { label: 'Commercial Lease', href: '/rent/commercial', icon: Store, iconBg: 'bg-indigo-500' },
          { label: 'PG / Co-Living', href: '/rent/pg', icon: User, iconBg: 'bg-[#36b37e]' },
        ]
      },
      {
        title: 'Search by BHK',
        items: [
          { label: '1 RK Flats', href: '/properties?type=flat&bhk=1rk&listing=rent', icon: Building2, iconBg: 'bg-sky-600' },
          { label: '1 BHK Flats', href: '/properties?type=flat&bhk=1&listing=rent', icon: Building2, iconBg: 'bg-sky-700' },
          { label: '2 BHK Flats', href: '/properties?type=flat&bhk=2&listing=rent', icon: Building2, iconBg: 'bg-blue-600' },
          { label: '3 BHK Flats', href: '/properties?type=flat&bhk=3&listing=rent', icon: Building2, iconBg: 'bg-blue-700' },
          { label: '1 BHK Houses', href: '/properties?type=house&bhk=1&listing=rent', icon: Home, iconBg: 'bg-amber-600' },
          { label: '2 BHK Houses', href: '/properties?type=house&bhk=2&listing=rent', icon: Home, iconBg: 'bg-amber-700' },
        ]
      },
      {
        title: 'Popular Areas',
        items: [
          { label: 'Saket', href: '/properties?search=Saket&listing=rent', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Laxmi Nagar', href: '/properties?search=Laxmi+Nagar&listing=rent', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Lajpat Nagar', href: '/properties?search=Lajpat+Nagar&listing=rent', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Sector 3 Rohini', href: '/properties?search=Sector+3+Rohini&listing=rent', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Sector 2 Rohini', href: '/properties?search=Sector+2+Rohini&listing=rent', icon: MapPin, iconBg: 'bg-rose-500' },
          { label: 'Sector 1 Rohini', href: '/properties?search=Sector+1+Rohini&listing=rent', icon: MapPin, iconBg: 'bg-rose-500' },
        ]
      },
      {
        title: 'Popular Searches',
        items: [
          { label: 'Zero Brokerage Rent', href: '/properties?brokerage=zero&listing=rent', icon: Gem, iconBg: 'bg-amber-500' },
          { label: 'Fully Furnished', href: '/properties?furnishing=fully-furnished&type=flat&listing=rent', icon: Key, iconBg: 'bg-purple-600' },
          { label: 'Semi Furnished', href: '/properties?furnishing=semi-furnished&type=flat&listing=rent', icon: Key, iconBg: 'bg-blue-500' },
          { label: 'Unfurnished', href: '/properties?furnishing=unfurnished&type=flat&listing=rent', icon: Key, iconBg: 'bg-slate-500' },
        ]
      }
    ]
  },
  sellers: {
    sections: [
      {
        title: 'Post & Manage',
        items: [
          { label: 'Post Property FREE', href: '/properties/post', icon: PlusCircle, iconBg: 'bg-[#00b56c]' },
          { label: 'Seller Dashboard', href: 'https://seller.kanharaj.com', icon: LayoutGrid, iconBg: 'bg-[#0052cc]' },
          { label: 'Post Commercial', href: '/properties/post?type=commercial', icon: Store, iconBg: 'bg-[#6554c0]' },
          { label: 'Owner Services', href: '/for-sellers', icon: Tag, iconBg: 'bg-[#ffab00]' },
        ]
      },
      {
        title: 'Packages & Solutions',
        items: [
          { label: 'For Developers', description: 'Launch or sell homes', href: '/for-sellers?role=developer', icon: Building, iconBg: 'bg-blue-600' },
          { label: 'For Brokers', description: 'List & grow business', href: '/for-sellers?role=broker', icon: UserCheck, iconBg: 'bg-indigo-600' },
          { label: 'For Owners', description: 'Sell or rent easily', href: '/for-sellers?role=owner', icon: Home, iconBg: 'bg-emerald-600' },
        ]
      }
    ]
  },
  services: {
    sections: [
      {
        title: 'Kanharaj Services',
        items: [
          { label: 'Property Chat & Inquiries', description: 'All chat history & messages', href: '/chat', icon: MessageSquare, iconBg: 'bg-indigo-600' },
          { label: 'Home Loan', href: `/coming-soon?title=${encodeURIComponent('Home Loan')}`, icon: CreditCard, iconBg: 'bg-[#0052cc]' },
          { label: 'Property Protection', href: `/coming-soon?title=${encodeURIComponent('Property Protection')}`, icon: ShieldCheck, iconBg: 'bg-[#00875a]' },
          { label: 'Premium Plan', href: `/coming-soon?title=${encodeURIComponent('Premium Plan')}`, icon: Gem, iconBg: 'bg-amber-500' },
        ]
      },
      {
        title: 'Tools & Utilities',
        items: [
          { label: 'Pay Rent', href: '/coming-soon?title=Pay%20Rent', icon: DollarSign, iconBg: 'bg-emerald-500' },
          { label: 'Rent Agreement', href: '/coming-soon?title=Rent%20Agreement', icon: FileText, iconBg: 'bg-blue-500' },
          { label: 'Hire Expert Advisor', href: '/coming-soon?title=Hire%20Advisor', icon: UserCheck, iconBg: 'bg-indigo-600' },
          { label: 'Home Interiors', href: '/coming-soon?title=Home%20Interiors', icon: Sparkles, iconBg: 'bg-[#ff007f]' },
        ]
      }
    ]
  },
  news_guide: {
    sections: [
      {
        title: 'Property Market Guide',
        items: [
          { label: 'Real Estate News', description: 'Latest market updates', href: '/news', icon: Newspaper, iconBg: 'bg-[#ff5630]' },
          { label: 'Buying Guide', description: 'Expert homebuying tips', href: '/buying-guide', icon: HelpCircle, iconBg: 'bg-[#0052cc]' },
          { label: 'Property Research', description: 'Data-driven insights', href: '/#research-insights', icon: Compass, iconBg: 'bg-[#00875a]' },
          { label: 'New Delhi Overview', description: 'Real estate highlights', href: `/coming-soon?title=${encodeURIComponent('New Delhi Overview')}`, icon: Building2, iconBg: 'bg-[#6554c0]' },
        ]
      }
    ]
  },
  account: {
    sections: [
      {
        title: 'Dashboard & Activity',
        items: [
          { label: 'My Chats & Messages', description: 'View all chat history & messages', href: '/chat', icon: MessageSquare, iconBg: 'bg-indigo-600' },
          { label: 'My Wishlist', href: '/profile?tab=wishlist', icon: Heart, iconBg: 'bg-[#ff007f]' },
          { label: 'Contacted Properties', href: '/profile?tab=activity&activity=contacted', icon: PhoneCall, iconBg: 'bg-[#0052cc]' },
          { label: 'My Transactions', href: '/profile?tab=activity&activity=transactions', icon: CreditCard, iconBg: 'bg-[#00875a]' },
          { label: 'My Profile / Edit', href: '/profile', icon: User, iconBg: 'bg-[#6554c0]' },
          { label: 'My Reviews', href: '/feedback', icon: Star, iconBg: 'bg-amber-500' },
        ]
      },
      {
        title: 'Account Actions',
        items: [
          { label: 'Unsubscribe Alerts', href: 'mailto:kanharaj1389@gmail.com?subject=Unsubscribe%20Alerts', icon: Bell, iconBg: 'bg-rose-500' },
          { label: 'Report a Fraud', href: 'mailto:kanharaj1389@gmail.com?subject=Report%20Fraud', icon: ShieldAlert, iconBg: 'bg-red-600' },
          { label: 'Log In / Register', href: '/login', icon: LogOut, iconBg: 'bg-[#f22b68]' },
        ]
      }
    ]
  }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'buyers' | 'tenants' | 'sellers' | 'services' | 'news_guide' | 'account'>('buyers')

  const currentData = categoriesData[activeTab]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-0 md:pt-4 pb-16">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 -ml-1 text-slate-700 hover:text-slate-900 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">All Categories</h1>
        </div>
        <Link href="/" className="flex items-center gap-1.5">
          <img src={BRAND_LOGO_SRC} alt="Kanharaj" className="w-6 h-6 rounded-full object-cover" />
          <span className="font-sans font-black text-slate-900 text-xs tracking-tight">KANHARAJ</span>
        </Link>
      </div>

      {/* Main Container - Split View */}
      <div className="flex-1 flex max-w-5xl w-full mx-auto bg-white min-h-[calc(100vh-120px)] border-x border-slate-200/60 shadow-xs">
        {/* Left Sidebar Tabs */}
        <div className="w-[120px] sm:w-[160px] bg-[#f4f5f7] border-r border-slate-200/80 shrink-0 py-2 scrollbar-none">
          {categoriesTabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex flex-col items-center justify-center text-center py-4 px-2 relative transition-all border-b border-slate-200/40 select-none cursor-pointer",
                  isActive ? "bg-white text-slate-900 font-extrabold shadow-xs" : "text-slate-600 font-semibold hover:bg-slate-100/60"
                )}
              >
                {/* Left Active Indicator Line */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0052cc] rounded-r-full" />
                )}

                {/* Icon */}
                <div className="relative mb-1">
                  <Icon className={cn("w-5.5 h-5.5", isActive ? "text-[#0052cc]" : "text-slate-500")} />
                  {tab.isBadge && (
                    <span className="bg-[#00b56c] text-white text-[7.5px] font-extrabold px-1 rounded-full uppercase leading-none absolute -bottom-1 -right-2 shadow-xs">
                      {tab.badgeText}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="text-xs leading-tight font-bold tracking-tight mt-0.5">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white p-4 sm:p-6 overflow-y-auto space-y-6">
          {currentData?.sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052cc]" />
                {section.title}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {section.items.map((item: any) => {
                  const CardIcon = item.icon
                  const isExternal = item.href.startsWith('http') || item.href.startsWith('mailto:')

                  if (isExternal) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="bg-[#f0f5ff] hover:bg-[#e2edff] border border-blue-100/70 rounded-2xl p-3.5 flex flex-col justify-between min-h-[105px] transition-all active:scale-[0.98] shadow-xs group"
                      >
                        <div className={cn("w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white", item.iconBg)}>
                          <CardIcon className="w-4.5 h-4.5" />
                        </div>

                        <div>
                          <span className="text-xs font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-[#0052cc] transition-colors block">
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 line-clamp-1">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="bg-[#f0f5ff] hover:bg-[#e2edff] border border-blue-100/70 rounded-2xl p-3.5 flex flex-col justify-between min-h-[105px] transition-all active:scale-[0.98] shadow-xs group"
                    >
                      <div className={cn("w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white", item.iconBg)}>
                        <CardIcon className="w-4.5 h-4.5" />
                      </div>

                      <div>
                        <span className="text-xs font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-[#0052cc] transition-colors block">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
