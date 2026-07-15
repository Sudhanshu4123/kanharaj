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
}

export function SearchBar({
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  onTabChange,
  title,
  subtitle
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
  const [selectedCity, setSelectedCity] = useState('Delhi')
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
    <div className="w-full max-w-3xl mx-auto">
      {/* Dynamic Tagline Above Tabs (Only shown in Buy mode or default) */}
      {activeTab === 'buy' && (
        <div className="flex items-center gap-2 mb-3 px-2 sm:px-0 justify-center">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
          </span>
          <span className="text-white/95 text-[11px] sm:text-xs font-black tracking-wide drop-shadow-md uppercase">
            👑 {activeCount > 0 ? `${propertyLabel} verified listings` : 'Verified residential listings'} ready to explore
          </span>
        </div>
      )}

      {/* Premium Translucent Tabs Container */}
      <style>{`
        .custom-tab-scrollbar::-webkit-scrollbar {
          height: 5px;
        }
        .custom-tab-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-tab-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
      `}</style>
      <div 
        className="w-full overflow-x-auto scroll-smooth pb-2 custom-tab-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
        }}
      >
        <div className="flex gap-1.5 p-1 bg-black/45 backdrop-blur-md rounded-t-xl border border-white/10 border-b-0 w-fit mx-auto select-none shrink-0 px-2.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => selectTab(tab.value)}
                className={cn(
                  "px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 rounded-lg shrink-0 snap-start",
                  isActive
                    ? "text-slate-950 bg-white shadow-md font-extrabold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Search Container (Nested card styling removed for single-layer layout) */}
      <div className="mt-4 sm:mt-5">

        {/* Dynamic Title / Subtitle inside search card for Buy mode only */}
        {title && (
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-semibold text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Input cluster area */}
        <div className="bg-black border border-[#5e23dc]/45 rounded-xl p-1 md:p-1.5 shadow-inner">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-0">

            {/* City Selection Dropdown (Only for RENT, COMMERCIAL, PG, PLOTS) */}
            {activeTab !== 'buy' && (
              <div ref={dropdownRef} className="flex items-center px-3 py-1 border-b md:border-b-0 md:border-r border-[#5e23dc]/30 shrink-0 select-none relative">
                <MapPin className="h-4 w-4 text-[#36c991] mr-2 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none mb-0.5">City</span>
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      className="w-[70px] text-left focus:outline-none text-white font-black text-xs cursor-pointer pr-4 relative -ml-0.5 select-none truncate flex items-center justify-between h-5"
                    >
                      <span>{selectedCity}</span>
                      <span className="text-[7px] text-[#36c991] font-extrabold absolute right-0 pointer-events-none">▼</span>
                    </button>

                    <AnimatePresence>
                      {isCityDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-2 w-72 max-h-80 bg-black border border-[#5e23dc] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
                        >
                          {/* Search Input Area */}
                          <div className="p-2 border-b border-[#5e23dc]/25 flex items-center bg-slate-950 gap-1.5 shrink-0">
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={citySearchQuery}
                              onChange={(e) => setCitySearchQuery(e.target.value)}
                              placeholder="Search city..."
                              className="w-full bg-transparent focus:outline-none text-xs text-white font-bold placeholder:text-slate-500 h-6 border-0 p-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
                              autoFocus
                            />
                            {citySearchQuery && (
                              <button
                                type="button"
                                onClick={() => setCitySearchQuery('')}
                                className="text-[9px] text-[#36c991] hover:text-[#2eb07e] font-black px-1"
                              >
                                CLEAR
                              </button>
                            )}
                          </div>

                          {/* Cities Scrollable List */}
                          <div className="flex-1 overflow-y-auto max-h-60 py-1.5 text-left scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {filteredTopCities.length === 0 && filteredOtherCities.length === 0 ? (
                              <div className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">
                                No cities found
                              </div>
                            ) : (
                              <>
                                {filteredTopCities.length > 0 && (
                                  <div>
                                    <div className="px-3 py-1 text-[9px] font-black text-slate-450 uppercase tracking-wider bg-slate-900/60">
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
                                            ? "bg-[#5e23dc]/15 text-[#36c991]"
                                            : "text-slate-350 hover:bg-[#5e23dc]/10 hover:text-white"
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
                                    <div className="px-3 py-1 text-[9px] font-black text-slate-450 uppercase tracking-wider bg-slate-900/60">
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
                                            ? "bg-[#5e23dc]/15 text-[#36c991]"
                                            : "text-slate-355 hover:bg-[#5e23dc]/10 hover:text-white"
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
                </div>
              </div>
            )}

            {/* Core Search Input Field */}
            <div className="flex-1 flex items-center px-3 py-1.5">
              <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeTab === 'commercial'
                    ? "Search Locality"
                    : activeTab === 'pg'
                      ? "Search for locality, landmark"
                      : `Try "${locations[placeholderIndex]}"`
                }
                className="w-full bg-transparent focus:outline-none text-xs sm:text-sm text-white font-bold placeholder:text-slate-500 h-8 border-0 p-0 focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:outline-none"
              />
            </div>

            {/* Commercial Radio Buttons Option */}
            {activeTab === 'commercial' && (
              <div className="flex items-center gap-3 px-3 py-1 border-t md:border-t-0 md:border-l border-[#5e23dc]/30 shrink-0 select-none">
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
                    commercialType === 'buy' ? "border-[#36c991] bg-black" : "border-slate-500"
                  )}>
                    {commercialType === 'buy' && <div className="w-2 h-2 rounded-full bg-[#36c991]" />}
                  </div>
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-white uppercase tracking-wider">Buy</span>
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
                    commercialType === 'lease' ? "border-[#36c991] bg-black" : "border-slate-500"
                  )}>
                    {commercialType === 'lease' && <div className="w-2 h-2 rounded-full bg-[#36c991]" />}
                  </div>
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-white uppercase tracking-wider">Lease</span>
                </label>
              </div>
            )}

            {/* Dynamic CTA Search Button */}
            <button
              onClick={() => handleSearch()}
              className={cn(
                "h-9 md:h-10 px-6 rounded-lg font-black text-xs uppercase tracking-wider shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0 md:m-0.5 active:scale-[0.98] border-0",
                (activeTab === 'buy' || activeTab === 'rent')
                  ? "bg-[#5e23dc] hover:bg-[#36c991] hover:text-black text-white shadow-[#5e23dc]/20"
                  : "bg-[#36c991] hover:bg-[#2eb07e] text-black shadow-[#36c991]/20"
              )}
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span>Search</span>
            </button>

          </div>
        </div>



      </div>
    </div>
  )
}