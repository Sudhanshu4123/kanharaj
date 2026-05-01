"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const { filteredProperties, setFilters } = usePropertyStore()

  useEffect(() => {
    setMounted(true)
    usePropertyStore.getState().fetchProperties()
  }, [])

  const properties = filteredProperties()

  const handleSearch = () => {
    setFilters({
      search,
      propertyType: selectedTypes,
      bedrooms: selectedBedrooms,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
    })
  }

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

  const resetFilters = () => {
    setSearch('')
    setSelectedTypes([])
    setSelectedBedrooms([])
    setPriceRange([0, 100000000])
    setSelectedAmenities([])
    setFilters({
      search: '',
      propertyType: [],
      bedrooms: [],
      priceMin: 0,
      priceMax: 100000000,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="font-heading text-3xl font-bold text-slate-900">
                Properties
              </h1>
              <p className="text-slate-600 mt-1">
                Showing {mounted ? properties.length : '...'} properties
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && 'bg-rose-50')}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
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
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "w-64 flex-shrink-0 z-50",
                "fixed inset-0 bg-white p-6 md:relative md:inset-auto md:bg-transparent md:p-0",
                "overflow-y-auto md:overflow-visible"
              )}
            >
              <div className="bg-white rounded-xl border-0 md:border border-slate-200 p-0 md:p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-900 text-xl md:text-base">Filters</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={resetFilters}
                      className="text-sm text-rose-600 hover:text-rose-700"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="md:hidden text-sm font-bold text-slate-900"
                    >
                      Close
                    </button>
                  </div>
                </div>
                
                {/* Property Type */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-900 mb-3 uppercase tracking-wider text-xs">Property Type</h4>
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    {propertyTypes.map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-100 md:border-0">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="rounded border-slate-300 text-rose-600 focus:ring-rose-600"
                        />
                        <span className="text-sm text-slate-600 capitalize">{type}</span>
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
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="bg-slate-50"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1] || ''}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => { handleSearch(); if (window.innerWidth < 768) setShowFilters(false); }} className="w-full mt-4 h-12 md:h-10">
                  Apply Filters
                </Button>
              </div>
            </motion.aside>
          )}

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
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
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
