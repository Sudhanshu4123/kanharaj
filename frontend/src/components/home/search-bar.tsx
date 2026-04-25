"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Home, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

type TabType = 'buy' | 'rent' | 'commercial'

const tabs: { value: TabType; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'commercial', label: 'Commercial' },
]

const propertyTypes = [
  'House', 'Apartment', 'Villa', 'Flat', 'Plot'
]

export function SearchBar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('buy')
  const [search, setSearch] = useState('')
  const [propertyType, setPropertyType] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (propertyType) params.set('type', propertyType)
    if (activeTab !== 'buy') params.set('listing', activeTab)
    
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex bg-white rounded-t-xl overflow-hidden shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 py-4 text-base font-medium transition-colors relative",
              activeTab === tab.value
                ? "text-rose-600 bg-white"
                : "text-slate-500 hover:text-slate-700 bg-slate-50"
            )}
          >
            {tab.label}
            {activeTab === tab.value && (
              <motion.div
                layoutId="searchTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Search Inputs */}
      <div className="bg-white rounded-b-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Location / City"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* Property Type */}
          <div className="relative">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2"
            >
              <option value="">Property Type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select className="w-full h-11 pl-12 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2">
              <option value="">Price Range</option>
              <option value="0-5000000">Under 50 Lakhs</option>
              <option value="5000000-10000000">50 Lakhs - 1 Crore</option>
              <option value="10000000-20000000">1 - 2 Crores</option>
              <option value="20000000-50000000">2 - 5 Crores</option>
              <option value="50000000+">Above 5 Crores</option>
            </select>
          </div>

          {/* Search Button */}
          <Button onClick={handleSearch} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}