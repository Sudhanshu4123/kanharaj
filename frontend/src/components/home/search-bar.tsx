"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Home, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

type TabType = 'buy' | 'rent' | 'commercial' | 'plots' | 'projects' | 'pg'

const tabs: { value: TabType; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'projects', label: 'New Projects' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'plots', label: 'Plots' },
  { value: 'pg', label: 'PG / Hotel' },
]

const propertyTypes = [
  'House', 'Apartment', 'Villa', 'Flat', 'Residential Project', 'Plots/Land', 'Commercial', 'PG', 'Hotel', 'Office Space', 'Shop'
]

export function SearchBar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('buy')
  const [search, setSearch] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [budget, setBudget] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (propertyType) params.set('type', propertyType)
    if (budget) params.set('budget', budget)
    if (activeTab === 'projects') {
      params.set('type', 'RESIDENTIAL PROJECT')
      params.set('listing', 'buy')
    } else if (activeTab === 'plots') {
      params.set('type', 'PLOTS/LAND')
      params.set('listing', 'buy')
    } else if (activeTab === 'pg') {
      params.set('type', 'PG')
      params.set('listing', 'rent')
    } else if (activeTab === 'commercial') {
      params.set('type', 'COMMERCIAL')
    } else {
      params.set('listing', activeTab)
    }
    
    router.push(`/properties?${params.toString()}`)
  }

  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const locations = ["Dwarka, New Delhi", "Gurgaon, Haryana", "Noida, UP", "Janakpuri, Delhi", "Vikas Puri, Delhi"]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % locations.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-0 px-2 sm:px-0 overflow-x-auto no-scrollbar scroll-smooth snap-x">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all rounded-t-xl relative shrink-0 snap-start",
              activeTab === tab.value
                ? "text-rose-600 bg-white shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)]"
                : "text-white/80 hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Inputs */}
      <div className="bg-white rounded-xl sm:rounded-tl-none shadow-2xl p-4 sm:p-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Location */}
          <div className="md:col-span-5 relative group">
            <label htmlFor="search-location" className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1 group-focus-within:text-rose-500 transition-colors">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
              <Input
                id="search-location"
                type="text"
                placeholder={`Try "${locations[placeholderIndex]}"`}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-12 h-14 text-base border-slate-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl transition-all placeholder:transition-all placeholder:duration-500"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="md:col-span-3 relative group">
            <label htmlFor="property-type" className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1 group-focus-within:text-rose-500 transition-colors">
              Property Type
            </label>
            <div className="relative">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
              <select
                id="property-type"
                value={propertyType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPropertyType(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="md:col-span-2 relative group">
            <label htmlFor="budget-range" className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1 group-focus-within:text-rose-500 transition-colors">
              Budget
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
              <select 
                id="budget-range"
                value={budget}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBudget(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Any Budget</option>
                {activeTab === 'rent' || activeTab === 'pg' ? (
                  <>
                    <option value="10000-20000">10k - 20k</option>
                    <option value="20000-30000">20k - 30k</option>
                    <option value="30000-50000">30k - 50k</option>
                    <option value="50000-100000">50k - 1L</option>
                    <option value="100000+">1L+</option>
                  </>
                ) : (
                  <>
                    <option value="0-5000000">Under 50L</option>
                    <option value="5000000-10000000">50L - 1Cr</option>
                    <option value="10000000-20000000">1Cr - 2Cr</option>
                    <option value="20000000-50000000">2Cr - 5Cr</option>
                    <option value="50000000+">5Cr+</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <Button 
              onClick={handleSearch} 
              className="w-full h-14 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg shadow-lg hover:shadow-rose-500/20 transition-all group"
            >
              <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Search
            </Button>
          </div>
        </div>

        {/* Popular Searches / Suggestions */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter shrink-0">Popular:</span>
          {['2BHK in Dwarka', 'Ready to move', 'New Projects', 'PG near Metro', 'Commercial Space', 'Hotel Rooms'].map((tag) => (
            <button key={tag} className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 px-2 py-1 rounded-md transition-colors shrink-0">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}