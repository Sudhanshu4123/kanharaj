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
        title: 'Property Options',
        items: [
          { label: 'Flat / Apartment', href: '/buy/flat', icon: Building2, iconColor: 'text-[#0052cc]' },
          { label: 'Residential Land', href: '/buy/plot', icon: Grid, iconColor: 'text-[#00875a]' },
          { label: 'Independent House / Villa', href: '/buy/house', icon: Home, iconColor: 'text-[#ffab00]' },
          { label: 'Builder Floor', href: '/buy/floor', icon: Building, iconColor: 'text-[#6554c0]' },
          { label: 'Commercial Property', href: '/buy/commercial', icon: Store, iconColor: 'text-[#36b37e]' },
          { label: 'New Projects', href: '/buy/residential-project', icon: Compass, iconColor: 'text-[#ff5630]' },
          { label: 'Ready to Move', href: '/properties?status=ready&listing=buy', icon: CheckSquare, iconColor: 'text-[#ff007f]' },
        ]
      },
      {
        title: 'Search by BHK',
        items: [
          { label: '1 RK Properties', href: '/properties?bhk=1rk&listing=buy', icon: Building2, iconColor: 'text-indigo-600' },
          { label: '1 BHK Properties', href: '/properties?bhk=1&listing=buy', icon: Building2, iconColor: 'text-indigo-600' },
          { label: '2 BHK Properties', href: '/properties?bhk=2&listing=buy', icon: Building2, iconColor: 'text-blue-600' },
          { label: '3 BHK Properties', href: '/properties?bhk=3&listing=buy', icon: Building2, iconColor: 'text-blue-600' },
          { label: '1 BHK Houses', href: '/properties?type=house&bhk=1&listing=buy', icon: Home, iconColor: 'text-amber-600' },
          { label: '2 BHK Houses', href: '/properties?type=house&bhk=2&listing=buy', icon: Home, iconColor: 'text-amber-600' },
        ]
      },
      {
        title: 'Popular Areas',
        items: [
          { label: 'Vasant Kunj', href: '/properties?search=Vasant+Kunj&listing=buy', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Paschim Vihar', href: '/properties?search=Paschim+Vihar&listing=buy', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Chhattarpur', href: '/properties?search=Chhattarpur&listing=buy', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Sector 3 Rohini', href: '/properties?search=Sector+3+Rohini&listing=buy', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Sector 2 Rohini', href: '/properties?search=Sector+2+Rohini&listing=buy', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Sector 1 Rohini', href: '/properties?search=Sector+1+Rohini&listing=buy', icon: MapPin, iconColor: 'text-rose-500' },
        ]
      },
      {
        title: 'Popular Searches',
        items: [
          { label: 'Zero Brokerage', href: '/properties?brokerage=zero&listing=buy', icon: Gem, iconColor: 'text-amber-500' },
          { label: 'Under Construction', href: '/properties?status=under-construction&listing=buy', icon: Compass, iconColor: 'text-[#00875a]' },
          { label: 'Ready to Move', href: '/properties?status=ready&listing=buy', icon: CheckSquare, iconColor: 'text-[#ff007f]' },
          { label: 'New Projects', href: '/buy/residential-project', icon: Building2, iconColor: 'text-[#0052cc]' },
        ]
      }
    ]
  },
  tenants: {
    sections: [
      {
        title: 'Rental Property Types',
        items: [
          { label: 'Flats for Rent', href: '/rent/flat', icon: Building2, iconColor: 'text-[#0052cc]' },
          { label: 'Houses for Rent', href: '/rent/house', icon: Home, iconColor: 'text-[#ffab00]' },
          { label: 'Builder Floors', href: '/rent/floor', icon: Building, iconColor: 'text-[#6554c0]' },
          { label: 'Villas for Rent', href: '/rent/villa', icon: Compass, iconColor: 'text-[#ff5630]' },
          { label: 'Commercial Lease', href: '/rent/commercial', icon: Store, iconColor: 'text-indigo-600' },
          { label: 'PG / Co-Living', href: '/rent/pg', icon: User, iconColor: 'text-[#36b37e]' },
        ]
      },
      {
        title: 'Search by BHK',
        items: [
          { label: '1 RK Flats', href: '/properties?type=flat&bhk=1rk&listing=rent', icon: Building2, iconColor: 'text-sky-600' },
          { label: '1 BHK Flats', href: '/properties?type=flat&bhk=1&listing=rent', icon: Building2, iconColor: 'text-sky-600' },
          { label: '2 BHK Flats', href: '/properties?type=flat&bhk=2&listing=rent', icon: Building2, iconColor: 'text-blue-600' },
          { label: '3 BHK Flats', href: '/properties?type=flat&bhk=3&listing=rent', icon: Building2, iconColor: 'text-blue-600' },
          { label: '1 BHK Houses', href: '/properties?type=house&bhk=1&listing=rent', icon: Home, iconColor: 'text-amber-600' },
          { label: '2 BHK Houses', href: '/properties?type=house&bhk=2&listing=rent', icon: Home, iconColor: 'text-amber-600' },
        ]
      },
      {
        title: 'Popular Areas',
        items: [
          { label: 'Saket', href: '/properties?search=Saket&listing=rent', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Laxmi Nagar', href: '/properties?search=Laxmi+Nagar&listing=rent', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Lajpat Nagar', href: '/properties?search=Lajpat+Nagar&listing=rent', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Sector 3 Rohini', href: '/properties?search=Sector+3+Rohini&listing=rent', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Sector 2 Rohini', href: '/properties?search=Sector+2+Rohini&listing=rent', icon: MapPin, iconColor: 'text-rose-500' },
          { label: 'Sector 1 Rohini', href: '/properties?search=Sector+1+Rohini&listing=rent', icon: MapPin, iconColor: 'text-rose-500' },
        ]
      },
      {
        title: 'Popular Searches',
        items: [
          { label: 'Zero Brokerage Rent', href: '/properties?brokerage=zero&listing=rent', icon: Gem, iconColor: 'text-amber-500' },
          { label: 'Fully Furnished', href: '/properties?furnishing=fully-furnished&type=flat&listing=rent', icon: Key, iconColor: 'text-purple-600' },
          { label: 'Semi Furnished', href: '/properties?furnishing=semi-furnished&type=flat&listing=rent', icon: Key, iconColor: 'text-blue-500' },
          { label: 'Unfurnished', href: '/properties?furnishing=unfurnished&type=flat&listing=rent', icon: Key, iconColor: 'text-slate-500' },
        ]
      }
    ]
  },
  sellers: {
    sections: [
      {
        title: 'Post & Manage',
        items: [
          { label: 'Post Property FREE', href: '/properties/post', icon: PlusCircle, iconColor: 'text-[#00b56c]' },
          { label: 'Seller Dashboard', href: 'https://seller.kanharaj.com', icon: LayoutGrid, iconColor: 'text-[#0052cc]' },
          { label: 'Post Commercial', href: '/properties/post?type=commercial', icon: Store, iconColor: 'text-[#6554c0]' },
          { label: 'Owner Services', href: '/for-sellers', icon: Tag, iconColor: 'text-[#ffab00]' },
        ]
      },
      {
        title: 'Packages & Solutions',
        items: [
          { label: 'For Developers', description: 'Launch or sell homes', href: '/for-sellers?role=developer', icon: Building, iconColor: 'text-blue-600' },
          { label: 'For Brokers', description: 'List & grow business', href: '/for-sellers?role=broker', icon: UserCheck, iconColor: 'text-indigo-600' },
          { label: 'For Owners', description: 'Sell or rent easily', href: '/for-sellers?role=owner', icon: Home, iconColor: 'text-emerald-600' },
        ]
      }
    ]
  },
  services: {
    sections: [
      {
        title: 'Kanharaj Services',
        items: [
          { label: 'Property Chat & Inquiries', description: 'All chat history & messages', href: '/chat', icon: MessageSquare, iconColor: 'text-indigo-600' },
          { label: 'Home Loan', href: `/coming-soon?title=${encodeURIComponent('Home Loan')}`, icon: CreditCard, iconColor: 'text-[#0052cc]' },
          { label: 'Property Protection', href: `/coming-soon?title=${encodeURIComponent('Property Protection')}`, icon: ShieldCheck, iconColor: 'text-[#00875a]' },
          { label: 'Premium Plan', href: `/coming-soon?title=${encodeURIComponent('Premium Plan')}`, icon: Gem, iconColor: 'text-amber-500' },
        ]
      },
      {
        title: 'Tools & Utilities',
        items: [
          { label: 'Pay Rent', href: '/coming-soon?title=Pay%20Rent', icon: DollarSign, iconColor: 'text-emerald-500' },
          { label: 'Rent Agreement', href: '/coming-soon?title=Rent%20Agreement', icon: FileText, iconColor: 'text-blue-500' },
          { label: 'Hire Expert Advisor', href: '/coming-soon?title=Hire%20Advisor', icon: UserCheck, iconColor: 'text-indigo-600' },
          { label: 'Home Interiors', href: '/coming-soon?title=Home%20Interiors', icon: Sparkles, iconColor: 'text-[#ff007f]' },
        ]
      }
    ]
  },
  news_guide: {
    sections: [
      {
        title: 'Property Market Guide',
        items: [
          { label: 'Real Estate News', description: 'Latest market updates', href: '/news', icon: Newspaper, iconColor: 'text-[#ff5630]' },
          { label: 'Buying Guide', description: 'Expert homebuying tips', href: '/buying-guide', icon: HelpCircle, iconColor: 'text-[#0052cc]' },
          { label: 'Property Research', description: 'Data-driven insights', href: '/#research-insights', icon: Compass, iconColor: 'text-[#00875a]' },
          { label: 'New Delhi Overview', description: 'Real estate highlights', href: `/coming-soon?title=${encodeURIComponent('New Delhi Overview')}`, icon: Building2, iconColor: 'text-[#6554c0]' },
        ]
      }
    ]
  },
  account: {
    sections: [
      {
        title: 'Dashboard & Activity',
        items: [
          { label: 'My Chats & Messages', description: 'View all chat history & messages', href: '/chat', icon: MessageSquare, iconColor: 'text-indigo-600' },
          { label: 'My Wishlist', href: '/profile?tab=wishlist', icon: Heart, iconColor: 'text-[#ff007f]' },
          { label: 'Contacted Properties', href: '/profile?tab=activity&activity=contacted', icon: PhoneCall, iconColor: 'text-[#0052cc]' },
          { label: 'My Transactions', href: '/profile?tab=activity&activity=transactions', icon: CreditCard, iconColor: 'text-[#00875a]' },
          { label: 'My Profile / Edit', href: '/profile', icon: User, iconColor: 'text-[#6554c0]' },
          { label: 'My Reviews', href: '/feedback', icon: Star, iconColor: 'text-amber-500' },
        ]
      },
      {
        title: 'Account Actions',
        items: [
          { label: 'Unsubscribe Alerts', href: 'mailto:kanharaj1389@gmail.com?subject=Unsubscribe%20Alerts', icon: Bell, iconColor: 'text-rose-500' },
          { label: 'Report a Fraud', href: 'mailto:kanharaj1389@gmail.com?subject=Report%20Fraud', icon: ShieldAlert, iconColor: 'text-red-600' },
          { label: 'Log In / Register', href: '/login', icon: LogOut, iconColor: 'text-[#f22b68]' },
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
    <div className="min-h-screen bg-slate-50 flex flex-col pt-safe pb-16">
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
        {/* Left Sidebar Tabs (Exact 99acres style) */}
        <div className="w-[120px] sm:w-[150px] bg-[#f4f5f7] border-r border-slate-200/80 shrink-0 py-2 scrollbar-none">
          {categoriesTabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex flex-col items-center justify-center text-center py-4 px-2 relative transition-all border-b border-slate-200/30 select-none cursor-pointer",
                  isActive ? "bg-white text-slate-900 font-extrabold" : "text-slate-500 font-bold hover:bg-slate-100/70"
                )}
              >
                {/* Left Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0052cc] rounded-r-full" />
                )}

                {/* Icon Container */}
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center mb-1 transition-all",
                  isActive ? "bg-[#e8f0fe] text-[#0052cc] shadow-xs" : "text-slate-500"
                )}>
                  <Icon className="w-5 h-5" />
                  {tab.isBadge && (
                    <span className="bg-[#00b56c] text-white text-[7px] font-extrabold px-1 rounded-full uppercase leading-none absolute top-1 right-2 shadow-xs">
                      {tab.badgeText}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="text-xs leading-tight tracking-tight font-extrabold">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right Content Area (Clean 99acres cards) */}
        <div className="flex-1 bg-white p-4 sm:p-6 overflow-y-auto space-y-6">
          {currentData?.sections.map((section) => (
            <div key={section.title} className="space-y-3">
              {/* Section Header */}
              <h3 className="text-xs font-bold text-[#8c94a0] uppercase tracking-wider block">
                {section.title}
              </h3>

              {/* 2-Column Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {section.items.map((item: any) => {
                  const CardIcon = item.icon
                  const isExternal = item.href.startsWith('http') || item.href.startsWith('mailto:')

                  const cardContent = (
                    <div className="bg-[#f0f5ff] hover:bg-[#e4edff] border border-blue-100/60 rounded-2xl p-3.5 flex flex-col justify-between h-[105px] transition-all active:scale-[0.98] shadow-2xs group cursor-pointer">
                      {/* Top Left Icon (Clean & Unstretched) */}
                      <div className="flex items-center justify-start shrink-0">
                        <CardIcon className={cn("w-6 h-6 transition-transform group-hover:scale-110", item.iconColor || "text-[#0052cc]")} />
                      </div>

                      {/* Bottom Label & Description */}
                      <div className="mt-2">
                        <span className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#0052cc] transition-colors block">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                  )

                  if (isExternal) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {cardContent}
                      </a>
                    )
                  }

                  return (
                    <Link key={item.label} href={item.href}>
                      {cardContent}
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
