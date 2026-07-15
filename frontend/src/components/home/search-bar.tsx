"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Home, DollarSign, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import { useUserActivityStore } from '@/lib/user-activity-store'
import { usePropertyStore } from '@/lib/store'
import { formatStatCount } from '@/lib/platform-data'
import { topCities, otherCities } from '@/lib/location-data'
import { parseSearchInput, getRoutingUrl } from '@/lib/routing-utils'

type TabType = 'buy' | 'rent' | 'projects' | 'commercial' | 'pg' | 'plots'

const tabs: { value: TabType; label: string }[] = [
  { value: 'buy', label: 'BUY' },
  { value: 'rent', label: 'RENT' },
  { value: 'projects', label: 'PROJECTS' },
  { value: 'commercial', label: 'COMMERCIAL' },
  { value: 'pg', label: 'PG / CO-LIVING' },
  { value: 'plots', label: 'PLOTS' },
]

export { topCities, otherCities }

interface SearchBarProps {
  activeTab?: TabType
  setActiveTab?: (tab: TabType) => void
  onTabChange?: (tab: TabType) => void
  title?: string
  subtitle?: string
  selectedCity?: string
  setSelectedCity?: (city: string) => void
}

export function SearchBar({
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  onTabChange,
  title,
  subtitle,
  selectedCity: externalSelectedCity,
  setSelectedCity: externalSetSelectedCity
}: SearchBarProps = {}) {
  const router = useRouter()
  const { properties } = usePropertyStore()
  const activeCount = properties.filter((p) => p.status === 'ACTIVE').length
  const propertyLabel = activeCount > 0 ? formatStatCount(activeCount) : 'live'
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>('buy')

  const activeTab = externalActiveTab || internalActiveTab
  const setActiveTab = externalSetActiveTab || setInternalActiveTab

  const [search, setSearch] = useState('')
  const [commercialType, setCommercialType] = useState<'buy' | 'lease'>('buy')
  const [internalSelectedCity, setInternalSelectedCity] = useState('Delhi')
  const selectedCity = externalSelectedCity || internalSelectedCity
  const setSelectedCity = externalSetSelectedCity || setInternalSelectedCity
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [citySearchQuery, setCitySearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredTopCities = topCities.filter(city =>
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  )

  const filteredOtherCities = otherCities.filter(city =>
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  )

  const handleSearch = (customSearchTerm?: string) => {
    const searchTerm = customSearchTerm !== undefined ? customSearchTerm : search
    const parsed = parseSearchInput(searchTerm, selectedCity)

    let listing = 'buy'
    let type = ''
    let commercialMode = ''

    if (activeTab === 'plots') {
      type = 'PLOTS/LAND'
      listing = 'buy'
    } else if (activeTab === 'pg') {
      type = 'PG'
      listing = 'rent'
    } else if (activeTab === 'projects') {
      type = 'PROJECT'
      listing = 'buy'
    } else if (activeTab === 'commercial') {
      type = 'COMMERCIAL'
      listing = commercialType === 'buy' ? 'buy' : 'rent'
      commercialMode = commercialType
    } else {
      listing = activeTab
    }

    const href = getRoutingUrl({
      listing,
      type,
      city: parsed.city,
      search: parsed.search,
      commercialMode,
    })

    const labelParts = [
      parsed.search || null,
      parsed.city || null,
      activeTab === 'plots' ? 'Plots / Land' : activeTab === 'pg' ? 'PG' : activeTab === 'commercial' ? 'Commercial' : activeTab,
    ].filter(Boolean)
    useUserActivityStore.getState().recordSearch(labelParts.join(' · ') || 'Property search', href)
    router.push(href)
  }

  // Location suggestions loop for placeholder animation
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const locations = [
    "Dwarka, New Delhi",
    "Paschim Vihar, Delhi",
    "Chhattarpur, Delhi",
    "Sector 19 Dwarka",
    "Uttam Nagar, Delhi"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % locations.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const selectTab = (tabValue: TabType) => {
    setActiveTab(tabValue)
    onTabChange?.(tabValue)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Premium Translucent Tabs Container */}
      <div className={cn(
        "w-full overflow-x-auto scrollbar-none rounded-t-xl border border-b-0",
        activeTab === 'rent' ? "bg-[#9c756b] border-white/20" : "bg-[#1e1d32]/95 border-white/10"
      )}>
        <div className="flex gap-6 px-6 py-3 select-none items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => selectTab(tab.value)}
                className={cn(
                  "text-xs font-bold uppercase tracking-wider pb-1 transition-all duration-200 relative shrink-0",
                  isActive
                    ? "text-white font-extrabold"
                    : "text-slate-450 hover:text-white"
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Search Input Box */}
      <div className="bg-white rounded-b-xl border border-slate-200/80 p-2 shadow-lg w-full">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 w-full">

          {/* City Selection Dropdown (Only for RENT, COMMERCIAL, PG, PLOTS) */}
          {activeTab !== 'buy' && (
            <div ref={dropdownRef} className="flex items-center pl-3 pr-2 border-b md:border-b-0 md:border-r border-slate-200 shrink-0 select-none relative h-8 justify-between md:justify-start">
              <div className="flex items-center">
                <MapPin className={cn("h-4 w-4 mr-1 shrink-0", activeTab === 'rent' ? "text-[#ea7d68]" : "text-[#5e23dc]")} />
                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="focus:outline-none text-slate-800 font-extrabold text-xs cursor-pointer pr-4 relative select-none truncate flex items-center gap-1"
                >
                  <span>{selectedCity}</span>
                  <span className="text-[8px] text-slate-400">▼</span>
                </button>
              </div>

              <AnimatePresence>
                {isCityDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 w-72 max-h-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden text-left"
                  >
                    {/* Search Input Area */}
                    <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50 gap-1.5 shrink-0">
                      <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={citySearchQuery}
                        onChange={(e) => setCitySearchQuery(e.target.value)}
                        placeholder="Search city..."
                        className="w-full bg-transparent focus:outline-none text-xs text-slate-800 font-bold placeholder:text-slate-400 h-6 border-0 p-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                        autoFocus
                      />
                      {citySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCitySearchQuery('')}
                          className="text-[9px] text-[#5e23dc] hover:text-[#4e20b1] font-black px-1"
                        >
                          CLEAR
                        </button>
                      )}
                    </div>

                    {/* Cities Scrollable List */}
                    <div className="flex-1 overflow-y-auto max-h-60 py-1.5 text-left scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      {filteredTopCities.length === 0 && filteredOtherCities.length === 0 ? (
                        <div className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">
                          No cities found
                        </div>
                      ) : (
                        <>
                          {filteredTopCities.length > 0 && (
                            <div>
                              <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                Top Cities
                              </div>
                              {filteredTopCities.map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCity(city)
                                    setIsCityDropdownOpen(false)
                                    setCitySearchQuery('')
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center justify-between",
                                    selectedCity === city
                                      ? "bg-[#5e23dc]/5 text-[#5e23dc]"
                                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                  )}
                                >
                                  <span>{city}</span>
                                  {selectedCity === city && <span className="text-[10px] font-black">✓</span>}
                                </button>
                              ))}
                            </div>
                          )}

                          {filteredOtherCities.length > 0 && (
                            <div className="mt-1">
                              <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                Other Cities
                              </div>
                              {filteredOtherCities.map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCity(city)
                                    setIsCityDropdownOpen(false)
                                    setCitySearchQuery('')
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center justify-between",
                                    selectedCity === city
                                      ? "bg-[#5e23dc]/5 text-[#5e23dc]"
                                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                  )}
                                >
                                  <span>{city}</span>
                                  {selectedCity === city && <span className="text-[10px] font-black">✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Core Search Input Field */}
          <div className="flex-1 flex items-center px-3 py-1">
            <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for locality, landmark, project, or builder"
              className="w-full bg-transparent focus:outline-none text-sm text-slate-800 placeholder:text-slate-400 h-10 border-0 p-0 focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:outline-none"
            />
          </div>

          {/* Commercial Radio Buttons Option */}
          {activeTab === 'commercial' && (
            <div className="flex items-center gap-3 px-3 py-1 border-t md:border-t-0 md:border-l border-slate-200 shrink-0 select-none">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="radio"
                  name="commercial_type"
                  checked={commercialType === 'buy'}
                  onChange={() => setCommercialType('buy')}
                  className="sr-only"
                />
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                  commercialType === 'buy' ? "border-[#5e23dc] bg-white" : "border-slate-300"
                )}>
                  {commercialType === 'buy' && <div className="w-2 h-2 rounded-full bg-[#5e23dc]" />}
                </div>
                <span className="text-[10px] font-black text-slate-700 group-hover:text-slate-950 uppercase tracking-wider">Buy</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="radio"
                  name="commercial_type"
                  checked={commercialType === 'lease'}
                  onChange={() => setCommercialType('lease')}
                  className="sr-only"
                />
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all",
                  commercialType === 'lease' ? "border-[#5e23dc] bg-white" : "border-slate-300"
                )}>
                  {commercialType === 'lease' && <div className="w-2 h-2 rounded-full bg-[#5e23dc]" />}
                </div>
                <span className="text-[10px] font-black text-slate-700 group-hover:text-slate-950 uppercase tracking-wider">Lease</span>
              </label>
            </div>
          )}

          {/* Dynamic CTA Search Button */}
          <button
            onClick={() => handleSearch()}
            className={cn(
              "h-10 px-8 rounded-lg text-white font-bold text-sm tracking-wide shadow-md transition-all duration-200 flex items-center justify-center shrink-0 active:scale-[0.98] border-0",
              activeTab === 'rent'
                ? "bg-[#ea7d68] hover:bg-[#d96a55]"
                : "bg-[#5e23dc] hover:bg-[#4e20b1]"
            )}
          >
            Search
          </button>

        </div>
      </div>
    </div>
  )
}