"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, Grid, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PropertyCard } from '@/components/properties/property-card'
import { usePropertyStore } from '@/lib/store'
import { amenitiesList } from '@/lib/data'
import { cn } from '@/lib/utils'

const propertyTypes = ['HOUSE', 'APARTMENT', 'VILLA', 'FLAT', 'PLOT']
const bedroomOptions = [1, 2, 3, 4, 5]

export default function PropertiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const { filteredProperties, setFilters, fetchProperties, filters: storeFilters } = usePropertyStore()

  useEffect(() => {
    setMounted(true)
    fetchProperties()
    
    // Enable filters by default on desktop
    if (window.innerWidth >= 768) {
      setShowFilters(true)
    }
    
    // Apply initial filters from URL
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const listing = searchParams.get('listing')?.toUpperCase()
    const budget = searchParams.get('budget')
    
    const initialFilters: any = { search }
    if (type) {
      initialFilters.propertyType = [type.toUpperCase()]
      setSelectedTypes([type.toUpperCase()])
    }
    if (listing && (listing === 'BUY' || listing === 'RENT')) {
      initialFilters.listingType = listing
    }
    
    if (budget) {
      if (budget.includes('-')) {
        const [min, max] = budget.split('-').map(Number)
        setPriceRange([min, max])
        initialFilters.priceMin = min
        initialFilters.priceMax = max
      } else if (budget.endsWith('+')) {
        const min = Number(budget.replace('+', ''))
        setPriceRange([min, 1000000000])
        initialFilters.priceMin = min
        initialFilters.priceMax = 1000000000
      }
    }
    
    setFilters(initialFilters)
  }, [])

  const properties = filteredProperties()

  // Real-time filtering effect
  useEffect(() => {
    if (mounted) {
      setFilters({
        search,
        propertyType: selectedTypes,
        bedrooms: selectedBedrooms,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
      })

      // Sync to URL
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedTypes.length > 0) params.set('type', selectedTypes[0])
      if (storeFilters.listingType !== 'all') params.set('listing', storeFilters.listingType.toLowerCase())
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }, [search, selectedTypes, selectedBedrooms, priceRange, storeFilters.listingType, mounted, setFilters, router, pathname])

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleBedroom = (bed: number) => {
    setSelectedBedrooms(prev =>
      prev.includes(bed)
        ? prev.filter(b => b !== bed)
        : [...prev, bed]
    )
  }

  const handleSearch = () => {
    setFilters({
      search,
      propertyType: selectedTypes,
      bedrooms: selectedBedrooms,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
    })
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedTypes([])
    setSelectedBedrooms([])
    setPriceRange([0, 1000000000])
    setSelectedAmenities([])
    setFilters({
      search: '',
      propertyType: [],
      bedrooms: [],
      priceMin: 0,
      priceMax: 1000000000,
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="pt-8 md:pt-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Properties
            </h1>
            <p className="text-slate-500 mt-2 text-sm md:text-lg">
              Explore {properties.length} premium properties.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Sticky Search & Filter Bar */}
      <div className="sticky top-16 lg:top-24 z-40 bg-white/80 backdrop-blur-xl border-y border-slate-200 shadow-sm mb-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search location or project..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-11 border-slate-200 focus:ring-rose-500 rounded-xl text-sm shadow-sm md:shadow-none"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-11 px-3 md:px-4 flex items-center gap-2 font-bold rounded-xl border-slate-200 transition-all",
                  showFilters && 'bg-rose-50 text-rose-600 border-rose-200'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>

              <div className="hidden lg:flex border border-slate-200 rounded-xl overflow-hidden h-11">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'px-3 transition-colors flex items-center justify-center',
                    viewMode === 'grid'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 transition-colors flex items-center justify-center',
                    viewMode === 'list'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Filters - Mobile Only */}
            <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-1 -mx-4 px-4 scroll-smooth">
              {[
                { label: 'Buy', action: () => setFilters({ listingType: 'BUY' }), active: storeFilters.listingType === 'BUY' },
                { label: 'Rent', action: () => setFilters({ listingType: 'RENT' }), active: storeFilters.listingType === 'RENT' },
                { label: 'Flat', action: () => toggleType('FLAT'), active: selectedTypes.includes('FLAT') },
                { label: 'House', action: () => toggleType('HOUSE'), active: selectedTypes.includes('HOUSE') },
                { label: 'Plot', action: () => toggleType('PLOTS/LAND'), active: selectedTypes.includes('PLOTS/LAND') },
                { label: 'Commercial', action: () => toggleType('COMMERCIAL'), active: selectedTypes.includes('COMMERCIAL') },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={chip.action}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                    chip.active
                      ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "w-full lg:w-72 flex-shrink-0 z-[45]",
                  "fixed top-16 inset-x-0 bottom-0 bg-white lg:sticky lg:top-[160px] lg:inset-auto lg:bg-transparent",
                  "lg:overflow-visible overflow-y-auto no-scrollbar shadow-2xl lg:shadow-none"
                )}
              >
                <div className="bg-white lg:rounded-xl border-0 lg:border border-slate-200 lg:max-h-[calc(100vh-200px)] flex flex-col overflow-hidden shadow-sm h-full lg:h-auto">
                  {/* Fixed Header within Sidebar */}
                  <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 bg-white z-10">
                    <h3 className="font-semibold text-slate-900 text-xl lg:text-base">Filters</h3>
                    <div className="flex gap-4">
                      <button
                        onClick={resetFilters}
                        className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden text-sm font-bold text-slate-900"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Body within Sidebar */}
                  <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">

                  {/* Listing Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3 uppercase tracking-wider text-xs">I want to</h4>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setFilters({ listingType: 'BUY' })}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                          storeFilters.listingType === 'BUY'
                            ? "bg-white text-rose-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setFilters({ listingType: 'RENT' })}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                          storeFilters.listingType === 'RENT'
                            ? "bg-white text-rose-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        Rent
                      </button>
                      <button
                        onClick={() => setFilters({ listingType: 'all' })}
                        className={cn(
                          "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                          storeFilters.listingType === 'all'
                            ? "bg-white text-rose-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        )}
                      >
                        All
                      </button>
                    </div>
                  </div>
                  
                  {/* Property Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3 uppercase tracking-wider text-xs">Property Type</h4>
                    <div className="space-y-2">
                      {['Apartment', 'House', 'Villa', 'Flat', 'Residential Project', 'Plots/Land', 'Commercial', 'PG', 'Hotel'].map((type) => (
                        <label key={type} className="flex items-center group cursor-pointer">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(type.toUpperCase())}
                              onChange={() => toggleType(type.toUpperCase())}
                              className="peer appearance-none h-5 w-5 border-2 border-slate-200 rounded-md checked:bg-rose-600 checked:border-rose-600 transition-all cursor-pointer"
                            />
                            <svg className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-rose-600 transition-colors">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3 uppercase tracking-wider text-xs">Bedrooms</h4>
                    <div className="flex flex-wrap gap-2">
                      {bedroomOptions.map((bed) => (
                        <button
                          key={bed}
                          onClick={() => toggleBedroom(bed)}
                          className={cn(
                            'w-10 h-10 rounded-lg border text-sm font-medium transition-colors',
                            selectedBedrooms.includes(bed)
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'border-slate-200 text-slate-600 hover:border-rose-600'
                          )}
                        >
                          {bed}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3 uppercase tracking-wider text-xs">Price Range</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0] || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="bg-slate-50"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1] || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer within Sidebar */}
                  <div className="p-6 pt-0 border-t border-slate-100 bg-white">
                    <Button 
                      onClick={() => { 
                        handleSearch(); 
                        if (window.innerWidth < 1024) setShowFilters(false); 
                      }} 
                      className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Properties Grid */}
          <div className="flex-1">
            {properties.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">No properties found</h3>
                <p className="text-slate-600 mt-2">Try adjusting your filters to find what you're looking for</p>
                <Button onClick={resetFilters} variant="outline" className="mt-6">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {properties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
