"use client"

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight, Search, Info, Menu, User, Phone, X, Shield, ArrowUpDown, Waves, Dumbbell, Car, Flame, Check, LogOut, MapPin, Bell, SlidersHorizontal, Building2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import * as Slider from '@radix-ui/react-slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HousingPropertyCard } from '@/components/properties/housing-property-card'
import { HousingPropertyListSkeleton, PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { usePropertyStore, useAuthStore } from '@/lib/store'
import { countByBedrooms } from '@/lib/platform-data'
import { cn, hasSellerDashboardAccess, BRAND_LOGO_SRC, getSellerUrl } from '@/lib/utils'
import { useUserActivityStore } from '@/lib/user-activity-store'
import { topCities, otherCities } from '@/lib/location-data'

const BUDGET_MAX_LAKH = 100
const BUDGET_STEP = 5

function formatBudgetLabel(lakh: number) {
  if (lakh <= 0) return '0'
  if (lakh >= BUDGET_MAX_LAKH) return '1Cr+'
  return `${lakh} Lakh`
}



export default function PropertiesContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  let listingParam = params?.listing as string | undefined
  if (!listingParam && pathname) {
    if (pathname.startsWith('/buy')) {
      listingParam = 'buy'
    } else if (pathname.startsWith('/rent')) {
      listingParam = 'rent'
    }
  }
  const slugParams = params?.slug as string[] | undefined

  let initialListing = (searchParams.get('listing') || '').toUpperCase()
  let initialType = searchParams.get('type') || ''
  let initialCity = searchParams.get('city') || ''

  if (listingParam) {
    initialListing = listingParam.toUpperCase()
    if (slugParams && slugParams.length > 0) {
      const firstSlug = decodeURIComponent(slugParams[0]).toLowerCase()
      const knownTypes = ['flat', 'apartment', 'house', 'villa', 'floor', 'plot', 'land', 'commercial', 'studio', 'penthouse', 'duplex', 'project', 'pg']
      const isType = knownTypes.some(kt => firstSlug.includes(kt))

      if (isType) {
        if (firstSlug.includes('flat') || firstSlug.includes('apartment')) {
          initialType = 'Apartment'
        } else if (firstSlug.includes('villa')) {
          initialType = 'Villa'
        } else if (firstSlug.includes('house')) {
          initialType = 'Independent House'
        } else if (firstSlug.includes('plot') || firstSlug.includes('land')) {
          initialType = 'Plot'
        } else if (firstSlug.includes('floor')) {
          initialType = 'Independent Floor'
        } else if (firstSlug.includes('project')) {
          initialType = 'Residential Project'
        } else if (firstSlug.includes('pg')) {
          initialType = 'PG'
        } else {
          initialType = firstSlug.charAt(0).toUpperCase() + firstSlug.slice(1)
        }

        if (slugParams.length > 1) {
          initialCity = decodeURIComponent(slugParams[1])
        }
      } else {
        initialCity = decodeURIComponent(slugParams[0])
      }
    }
  }

  if (initialCity) {
    const searchCity = initialCity.toLowerCase().replace(/[-\s]+/g, ' ')
    const matchedTop = topCities.find(c => c.toLowerCase().replace(/[-\s]+/g, ' ') === searchCity)
    const matchedOther = otherCities.find(c => c.toLowerCase().replace(/[-\s]+/g, ' ') === searchCity)
    initialCity = matchedTop || matchedOther || (initialCity.charAt(0).toUpperCase() + initialCity.slice(1))
  }

  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [citySearchQuery, setCitySearchQuery] = useState('')
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  // Profile dropdown and Auth store
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [sellerUrl, setSellerUrl] = useState('https://seller.kanharaj.com')

  useEffect(() => {
    setSellerUrl(getSellerUrl())
  }, [])

  const { isAuthenticated, user, token, logout } = useAuthStore()
  const showSellerDashboard = isAuthenticated && hasSellerDashboardAccess(user)
  const sellerDashboardHref = token ? `${sellerUrl}/login?token=${token}` : `${sellerUrl}/login`

  const handleLogout = () => {
    logout()
    setProfileDropdownOpen(false)
    router.push('/login')
  }

  // Dropdown UI state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(null)

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>, name: string, widthVal: number) => {
    if (activeDropdown === name) {
      setActiveDropdown(null)
      setDropdownCoords(null)
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const screenWidth = window.innerWidth
    const actualWidth = Math.min(widthVal, screenWidth - 32)
    const maxLeft = screenWidth - actualWidth - 16
    const left = Math.max(16, Math.min(rect.left, maxLeft))

    setDropdownCoords({
      top: rect.bottom + 8,
      left: left,
      width: actualWidth
    })
    setActiveDropdown(name)
  }

  // Real filter states
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [bhkTypes, setBhkTypes] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, BUDGET_MAX_LAKH])
  const [saleTypes, setSaleTypes] = useState<string[]>([])
  const [constructionStatus, setConstructionStatus] = useState<string[]>([])

  // Committed "More Filters" states
  const [listedBy, setListedBy] = useState<string[]>([])
  const [verified, setVerified] = useState<boolean>(false)
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 5000])
  const [amenities, setAmenities] = useState<string[]>([])
  const [age, setAge] = useState<string | null>(null)
  const [facing, setFacing] = useState<string[]>([])
  const [propertyDetails, setPropertyDetails] = useState<string[]>([])
  const [rera, setRera] = useState<boolean>(false)
  const [projects, setProjects] = useState<string[]>([])
  const [showProjectsOnly, setShowProjectsOnly] = useState<boolean>(false)

  // Modal open & active tab state
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState('LISTED BY')

  // Temporary "More Filters" states (for staging changes inside modal)
  const [tempListedBy, setTempListedBy] = useState<string[]>([])
  const [tempVerified, setTempVerified] = useState<boolean>(false)
  const [tempAreaRange, setTempAreaRange] = useState<[number, number]>([0, 5000])
  const [tempAmenities, setTempAmenities] = useState<string[]>([])
  const [tempAge, setTempAge] = useState<string | null>(null)
  const [tempFacing, setTempFacing] = useState<string[]>([])
  const [tempPropertyDetails, setTempPropertyDetails] = useState<string[]>([])
  const [tempRera, setTempRera] = useState<boolean>(false)
  const [tempProjects, setTempProjects] = useState<string[]>([])
  const [tempProjectsSearch, setTempProjectsSearch] = useState('')
  const [tempPropertyTypes, setTempPropertyTypes] = useState<string[]>([])
  const [tempBhkTypes, setTempBhkTypes] = useState<string[]>([])
  const [tempBudgetRange, setTempBudgetRange] = useState<[number, number]>([0, BUDGET_MAX_LAKH])
  const [tempSaleTypes, setTempSaleTypes] = useState<string[]>([])
  const [tempConstructionStatus, setTempConstructionStatus] = useState<string[]>([])

  const isAnyMoreFilterActive =
    listedBy.length > 0 ||
    verified ||
    areaRange[0] > 0 ||
    areaRange[1] < 5000 ||
    amenities.length > 0 ||
    age !== null ||
    facing.length > 0 ||
    propertyDetails.length > 0 ||
    rera ||
    projects.length > 0 ||
    propertyTypes.length > 0 ||
    bhkTypes.length > 0 ||
    budgetRange[0] > 0 ||
    budgetRange[1] < BUDGET_MAX_LAKH ||
    saleTypes.length > 0 ||
    constructionStatus.length > 0;

  let activeMoreFiltersCount = 0;
  if (listedBy.length > 0) activeMoreFiltersCount++;
  if (verified) activeMoreFiltersCount++;
  if (areaRange[0] > 0 || areaRange[1] < 5000) activeMoreFiltersCount++;
  if (amenities.length > 0) activeMoreFiltersCount++;
  if (age !== null) activeMoreFiltersCount++;
  if (facing.length > 0) activeMoreFiltersCount++;
  if (propertyDetails.length > 0) activeMoreFiltersCount++;
  if (rera) activeMoreFiltersCount++;
  if (projects.length > 0) activeMoreFiltersCount++;
  if (propertyTypes.length > 0) activeMoreFiltersCount++;
  if (bhkTypes.length > 0) activeMoreFiltersCount++;
  if (budgetRange[0] > 0 || budgetRange[1] < BUDGET_MAX_LAKH) activeMoreFiltersCount++;
  if (saleTypes.length > 0) activeMoreFiltersCount++;
  if (constructionStatus.length > 0) activeMoreFiltersCount++;

  const handleOpenMoreFilters = () => {
    setTempListedBy(listedBy)
    setTempVerified(verified)
    setTempAreaRange(areaRange)
    setTempAmenities(amenities)
    setTempAge(age)
    setTempFacing(facing)
    setTempPropertyDetails(propertyDetails)
    setTempRera(rera)
    setTempProjects(projects)
    setTempProjectsSearch('')
    setTempPropertyTypes(propertyTypes)
    setTempBhkTypes(bhkTypes)
    setTempBudgetRange(budgetRange)
    setTempSaleTypes(saleTypes)
    setTempConstructionStatus(constructionStatus)
    setIsMoreFiltersOpen(true)
  }

  const handleApplyMoreFilters = () => {
    setListedBy(tempListedBy)
    setVerified(tempVerified)
    setAreaRange(tempAreaRange)
    setAmenities(tempAmenities)
    setAge(tempAge)
    setFacing(tempFacing)
    setPropertyDetails(tempPropertyDetails)
    setRera(tempRera)
    setProjects(tempProjects)
    setPropertyTypes(tempPropertyTypes)
    setBhkTypes(tempBhkTypes)
    setBudgetRange(tempBudgetRange)
    setSaleTypes(tempSaleTypes)
    setConstructionStatus(tempConstructionStatus)
    setIsMoreFiltersOpen(false)
  }

  const handleClearMoreFilters = () => {
    setTempListedBy([])
    setTempVerified(false)
    setTempAreaRange([0, 5000])
    setTempAmenities([])
    setTempAge(null)
    setTempFacing([])
    setTempPropertyDetails([])
    setTempRera(false)
    setTempProjects([])
    setTempProjectsSearch('')
    setTempPropertyTypes([])
    setTempBhkTypes([])
    setTempBudgetRange([0, BUDGET_MAX_LAKH])
    setTempSaleTypes([])
    setTempConstructionStatus([])
  }

  // Sale/Rent type from URL param (used in header)
  const [listingMode, setListingMode] = useState(initialListing)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const propertiesPerPage = 30
  const listTopRef = useRef<HTMLDivElement>(null)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (listTopRef.current) {
      const yOffset = -140 // compensate for fixed search header
      const element = listTopRef.current
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Reset page to 1 when any filter state changes
  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    selectedCity,
    selectedState,
    propertyTypes,
    bhkTypes,
    budgetRange,
    saleTypes,
    constructionStatus,
    listedBy,
    verified,
    areaRange,
    amenities,
    age,
    facing,
    propertyDetails,
    rera,
    projects,
    showProjectsOnly,
    listingMode
  ])

  const getPageNumbers = (totalPages: number) => {
    const pages = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const hasActiveFilters = showProjectsOnly || propertyTypes.length > 0 || bhkTypes.length > 0 || budgetRange[0] > 0 || budgetRange[1] < BUDGET_MAX_LAKH || saleTypes.length > 0 || constructionStatus.length > 0 || isAnyMoreFilterActive;

  const handleResetFilters = () => {
    setShowProjectsOnly(false)
    setPropertyTypes([])
    setBhkTypes([])
    setBudgetRange([0, BUDGET_MAX_LAKH])
    setSaleTypes([])
    setConstructionStatus([])
    setListedBy([])
    setVerified(false)
    setAreaRange([0, 5000])
    setAmenities([])
    setAge(null)
    setFacing([])
    setPropertyDetails([])
    setRera(false)
    setProjects([])
    setSelectedCity('')
    setSelectedState('')
  }

  const { properties: storeProperties, filteredProperties, setFilters, fetchProperties, filters: storeFilters, loading } = usePropertyStore()

  const filteredTopCities = topCities.filter(city =>
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  )
  const filteredOtherCities = otherCities.filter(city =>
    city.toLowerCase().includes(citySearchQuery.toLowerCase())
  )

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setIsCityDropdownOpen(false)
    setCitySearchQuery('')

    const isCleanUrl = !!listingParam;

    if (isCleanUrl) {
      let typeSlug = ''
      if (propertyTypes.length === 1) {
        typeSlug = propertyTypes[0].toLowerCase()
      } else if (slugParams && slugParams.length > 0) {
        const firstSlug = decodeURIComponent(slugParams[0]).toLowerCase()
        const knownTypes = ['flat', 'apartment', 'house', 'villa', 'floor', 'plot', 'land', 'commercial', 'studio', 'penthouse', 'duplex']
        const isType = knownTypes.some(kt => firstSlug.includes(kt))
        if (isType) {
          typeSlug = firstSlug
        }
      }

      const listingPart = listingParam!.toLowerCase()
      let path = `/${listingPart}`
      if (typeSlug) {
        let mappedType = typeSlug
        if (typeSlug.includes('flat') || typeSlug.includes('apartment') || typeSlug.includes('floor')) {
          mappedType = 'flat'
        } else if (typeSlug.includes('house') || typeSlug.includes('villa')) {
          mappedType = 'house'
        } else if (typeSlug.includes('plot') || typeSlug.includes('land')) {
          mappedType = 'plot'
        }
        path += `/${mappedType}`
      }
      if (city) {
        path += `/${city.toLowerCase().replace(/\s+/g, '-')}`
      }

      const params = new URLSearchParams(searchParams.toString())
      params.delete('city')
      params.delete('type')
      params.delete('listing')

      const qs = params.toString()
      const finalUrl = qs ? `${path}?${qs}` : path
      router.replace(finalUrl)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      if (city) params.set('city', city)
      else params.delete('city')
      if (search) params.set('search', search)
      else params.delete('search')
      router.replace(`${pathname}?${params.toString()}`)
    }
  }

  // Close dropdown on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (activeDropdown && !target.closest('.filter-dropdown-container') && !target.closest('.filter-dropdown-panel')) {
        setActiveDropdown(null);
        setDropdownCoords(null);
      }
      if (isCityDropdownOpen && !target.closest('.city-dropdown-container')) {
        setIsCityDropdownOpen(false)
      }
    };

    const handleScroll = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
        setDropdownCoords(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true); // true captures all scroll events on page

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeDropdown, isCityDropdownOpen]);

  // Fetch properties once on mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Trigger API call when store filters change
  useEffect(() => {
    if (mounted) {
      fetchProperties()
    }
  }, [storeFilters, fetchProperties, mounted])

  // Sync initial URL search parameters to local state on initial mount
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const type = initialType || searchParams.get('type')
    const listing = initialListing || searchParams.get('listing')?.toUpperCase()
    const urlBhk = searchParams.get('bhk')
    const urlMinPrice = searchParams.get('minPrice')
    const urlMaxPrice = searchParams.get('maxPrice')
    const urlVerified = searchParams.get('verified') === 'true'
    const urlConstruction = searchParams.get('constructionStatus')
    const urlProject = searchParams.get('project') === 'true'
    
    // Extra filters
    const urlListedBy = searchParams.get('listedBy')
    const urlMinArea = searchParams.get('minArea')
    const urlMaxArea = searchParams.get('maxArea')
    const urlAmenities = searchParams.get('amenities')
    const urlAge = searchParams.get('age')
    const urlFacing = searchParams.get('facing')
    const urlDetails = searchParams.get('details')
    const urlRera = searchParams.get('rera') === 'true'
    const urlProjects = searchParams.get('projects')

    if (urlSearch) setSearch(urlSearch)

    const urlCity = initialCity || searchParams.get('city') || ''
    if (urlCity) setSelectedCity(urlCity)

    const urlState = searchParams.get('state') || ''
    if (urlState) setSelectedState(urlState)

    if (listing && (listing === 'BUY' || listing === 'RENT')) {
      setListingMode(listing)
    } else {
      setListingMode('')
    }

    const initialFilters: any = { search: urlSearch }
    if (urlCity) initialFilters.city = urlCity
    if (urlState) initialFilters.state = urlState
    
    if (type) {
      initialFilters.propertyType = type.split(',').map(t => t.toUpperCase())
      const knownOptions = ['Apartment', 'Independent House', 'Independent Floor', 'Plot', 'Studio', 'Duplex', 'Penthouse', 'Villa', 'Agricultural Land'];
      const types = type.split(',').map(t => {
        const trimmed = t.trim().toLowerCase();
        const matched = knownOptions.find(opt => opt.toLowerCase() === trimmed);
        if (matched) return matched;
        return t.trim().charAt(0).toUpperCase() + t.trim().slice(1);
      });
      setPropertyTypes(types)
    } else {
      setPropertyTypes([])
      initialFilters.propertyType = []
    }
    
    if (listing && (listing === 'BUY' || listing === 'RENT')) {
      initialFilters.listingType = listing
    } else {
      initialFilters.listingType = 'all'
    }
    
    if (urlBhk) {
      const bhks = urlBhk.split(',').map(b => b.toLowerCase() === '1rk' ? '1 RK' : `${b} BHK`)
      setBhkTypes(bhks)
      initialFilters.bedrooms = urlBhk.split(',').map(b => b.toLowerCase() === '1rk' ? 1 : parseInt(b)).filter(n => !isNaN(n))
    } else {
      setBhkTypes([])
      initialFilters.bedrooms = []
    }

    if (urlMinPrice || urlMaxPrice) {
      const min = urlMinPrice ? Math.floor(parseInt(urlMinPrice) / 100000) : 0
      const max = urlMaxPrice ? Math.ceil(parseInt(urlMaxPrice) / 100000) : BUDGET_MAX_LAKH
      setBudgetRange([min, max])
      initialFilters.priceMin = min * 100000
      initialFilters.priceMax = max * 100000
    } else {
      setBudgetRange([0, BUDGET_MAX_LAKH])
      initialFilters.priceMin = 0
      initialFilters.priceMax = BUDGET_MAX_LAKH * 100000
    }

    if (urlVerified) {
      setVerified(true)
      initialFilters.verified = true
    } else {
      setVerified(false)
      initialFilters.verified = false
    }

    if (urlConstruction) {
      const list = urlConstruction.split(',')
      const displayList = list.map(status => {
        if (status === 'READY_TO_MOVE') return 'Ready to move'
        if (status === 'UNDER_CONSTRUCTION') return 'Under Construction'
        return status
      })
      setConstructionStatus(displayList)
      initialFilters.constructionStatus = displayList
    } else {
      setConstructionStatus([])
      initialFilters.constructionStatus = []
    }

    if (urlProject) {
      setShowProjectsOnly(true)
      initialFilters.showProjectsOnly = true
    } else {
      setShowProjectsOnly(false)
      initialFilters.showProjectsOnly = false
    }

    if (urlListedBy) {
      setListedBy(urlListedBy.split(','))
    }
    if (urlMinArea || urlMaxArea) {
      const min = urlMinArea ? parseInt(urlMinArea) : 0
      const max = urlMaxArea ? parseInt(urlMaxArea) : 5000
      setAreaRange([min, max])
    }
    if (urlAmenities) {
      setAmenities(urlAmenities.split(','))
    }
    if (urlAge) {
      setAge(urlAge)
    }
    if (urlFacing) {
      setFacing(urlFacing.split(','))
    }
    if (urlDetails) {
      setPropertyDetails(urlDetails.split(','))
    }
    if (urlRera) {
      setRera(true)
    }
    if (urlProjects) {
      setProjects(urlProjects.split(','))
    }

    setFilters(initialFilters)

    const qs = searchParams.toString()
    if (qs) {
      const label = [urlSearch, urlCity, type, listing, urlBhk ? `${urlBhk} BHK` : null]
        .filter(Boolean)
        .join(' · ')
      useUserActivityStore.getState().recordSearch(label || 'Property search', `/properties?${qs}`)
    }
  }, [initialListing, initialType, initialCity, setFilters])

  const baseProperties = showProjectsOnly ? storeProperties : filteredProperties()

  const postedProjects = storeProperties.filter(
    p => p.propertyType === 'RESIDENTIAL_PROJECT' || p.propertyType === 'COMMERCIAL_PROJECT' ||
         p.propertyType === 'RESIDENTIAL PROJECT' || p.propertyType === 'COMMERCIAL PROJECT'
  )

  // Apply More Filters client-side!
  const properties = baseProperties.filter(property => {
    const isProject = property.propertyType === 'RESIDENTIAL_PROJECT' || property.propertyType === 'COMMERCIAL_PROJECT' ||
                      property.propertyType === 'RESIDENTIAL PROJECT' || property.propertyType === 'COMMERCIAL PROJECT';
    
    const wantsProjects = showProjectsOnly || propertyTypes.some(t => t.toUpperCase().includes('PROJECT'));
    
    if (wantsProjects) {
      if (!isProject) return false;
      
      // Filter by city
      if (selectedCity) {
        const filterCity = selectedCity.toLowerCase().trim()
        const propCity = (property.city || '').toLowerCase()
        const propAddress = (property.address || '').toLowerCase()
        const matchesCity =
          propCity === filterCity ||
          propCity.includes(filterCity) ||
          filterCity.includes(propCity) ||
          propAddress.includes(filterCity)
        if (!matchesCity) return false
      }
      
      // Filter by search query
      if (search) {
        const s = search.toLowerCase()
        const matchesSearch =
          property.title?.toLowerCase().includes(s) ||
          property.city?.toLowerCase().includes(s) ||
          property.address?.toLowerCase().includes(s) ||
          property.description?.toLowerCase().includes(s);
        if (!matchesSearch) return false
      }
    } else {
      if (isProject) return false;
    }

    // 1. Listed By
    if (!wantsProjects && listedBy.length > 0) {
      const role = property.user?.role?.toLowerCase() || '';
      let matchesListedBy = false;
      if (listedBy.includes('Owner') && (role === 'seller' || role === 'user')) matchesListedBy = true;
      if (listedBy.includes('Agent') && role === 'agent') matchesListedBy = true;
      if (listedBy.includes('Developer') && (role === 'admin' || role === 'developer')) matchesListedBy = true;
      if (listedBy.includes('Featured Agents') && role === 'agent' && property.featured) matchesListedBy = true;
      if (!matchesListedBy) return false;
    }

    // 2. Verified
    if (verified) {
      if (!property.verified) return false;
    }

    // 3. Built-up Area
    if (property.area < areaRange[0] || (areaRange[1] < 5000 && property.area > areaRange[1])) {
      return false;
    }

    // 4. Amenities
    if (amenities.length > 0) {
      const propAmenities = property.amenities ? property.amenities.map(a => a.toLowerCase()) : [];
      const hasAll = amenities.every(amenity => {
        const target = amenity.toLowerCase();
        return propAmenities.some(pa => pa.includes(target) || target.includes(pa));
      });
      if (!hasAll) return false;
    }

    // 5. Age of Property
    if (age) {
      const currentYear = new Date().getFullYear();
      const propAge = currentYear - (property.yearBuilt || (currentYear - 2));
      if (age === 'Less than 1 year' && propAge > 1) return false;
      if (age === 'Less than 3 years' && propAge > 3) return false;
      if (age === 'Less than 5 years' && propAge > 5) return false;
      if (age === 'More than 5 years' && propAge <= 5) return false;
    }

    // 6. Facing
    if (facing.length > 0) {
      const facings = ['North', 'East', 'West', 'South', 'North - East', 'North - West', 'South - East', 'South - West'];
      const propFacing = (property as any).facing || facings[parseInt(property.id) % facings.length];
      if (!facing.includes(propFacing)) return false;
    }

    // 7. Property Details
    if (propertyDetails.length > 0) {
      if (propertyDetails.includes('Corner Property')) {
        const isCorner = (property as any).isCorner || (parseInt(property.id) % 3 === 0);
        if (!isCorner) return false;
      }
      if (propertyDetails.includes('Boundary Wall Present')) {
        const hasWall = (property as any).boundaryWall || (parseInt(property.id) % 2 === 0);
        if (!hasWall) return false;
      }
    }

    // 8. RERA Compliant
    if (rera) {
      const isRera = (property as any).reraCompliant || (parseInt(property.id) % 2 === 0);
      if (!isRera) return false;
    }

    // 9. New Projects/Societies
    if (projects.length > 0) {
      const matchesProject = projects.some((pTitle: string) => {
        if (property.projectName && property.projectName.toLowerCase() === pTitle.toLowerCase()) return true;
        
        const matchedProj = postedProjects.find(pj => String(pj.id) === String(property.projectId));
        if (matchedProj && matchedProj.title.toLowerCase() === pTitle.toLowerCase()) return true;

        const titleLower = property.title?.toLowerCase() || '';
        const descLower = property.description?.toLowerCase() || '';
        return titleLower.includes(pTitle.toLowerCase()) || descLower.includes(pTitle.toLowerCase());
      });
      if (!matchesProject) return false;
    }

    // 10. Sale Types
    if (saleTypes.length > 0) {
      let matchesSaleType = false;
      const isNewBooking = parseInt(property.id) % 3 === 0 || property.title?.toLowerCase().includes('new') || property.description?.toLowerCase().includes('booking');
      if (saleTypes.includes('New Bookings') && isNewBooking) matchesSaleType = true;
      if (saleTypes.includes('Resale') && !isNewBooking) matchesSaleType = true;
      if (!matchesSaleType) return false;
    }

    // 11. Construction Status
    if (constructionStatus.length > 0) {
      let matchesStatus = false;
      const isReady = parseInt(property.id) % 2 === 0;
      if (constructionStatus.includes('Ready to move') && isReady) matchesStatus = true;
      if (constructionStatus.includes('Under Construction') && !isReady) matchesStatus = true;
      if (!matchesStatus) return false;
    }

    return true;
  });

  // Real-time filtering effect based on selected top filters and sync to URL
  useEffect(() => {
    if (mounted) {
      // Parse search query for keywords like "3 BHK" dynamically
      let parsedBhk = [...bhkTypes];
      let displaySearch = search;

      const bhkPattern = /(\d)\s*(bhk|rk)/i;
      const match = bhkPattern.exec(search);
      if (match) {
        const num = match[1];
        const type = match[2].toUpperCase();
        const detectedBhk = type === 'RK' ? `${num} RK` : `${num} BHK`;
        if (!parsedBhk.includes(detectedBhk)) {
          parsedBhk.push(detectedBhk);
        }
        // Clean search query to only look for location (e.g. "delhi")
        displaySearch = search.replace(/(\d)\s*(bhk|rk)s?/i, '').replace(/\b(in|at|for|near)\b/gi, '').replace(/\s+/g, ' ').trim();
      }

      setFilters({
        search: displaySearch,
        propertyType: propertyTypes.length > 0 ? propertyTypes.map(t => t.toUpperCase()) : [],
        listingType: listingMode ? listingMode.toUpperCase() as any : 'all',
        bedrooms: parsedBhk.length > 0 ? parsedBhk.map(b => b.includes('+') ? 5 : parseInt(b.split(' ')[0])).filter(n => !isNaN(n)) : [],
        priceMin: budgetRange[0] * 100000,
        priceMax: budgetRange[1] >= BUDGET_MAX_LAKH ? 10000000000 : budgetRange[1] * 100000,
        city: selectedCity || '',
        state: selectedState || '',
        verified: verified,
        constructionStatus: constructionStatus,
        showProjectsOnly: showProjectsOnly
      })

      // Sync active filters to browser URL search parameters
      const params = new URLSearchParams()
      if (displaySearch) params.set('search', displaySearch)
      if (selectedCity) params.set('city', selectedCity)
      if (selectedState) params.set('state', selectedState)
      if (listingMode) params.set('listing', listingMode.toUpperCase())
      if (propertyTypes.length > 0) {
        params.set('type', propertyTypes.map(t => t.toLowerCase()).join(','))
      }
      if (bhkTypes.length > 0) {
        params.set('bhk', bhkTypes.map(b => b.split(' ')[0].toLowerCase()).join(','))
      }
      if (budgetRange[0] > 0) {
        params.set('minPrice', String(budgetRange[0] * 100000))
      }
      if (budgetRange[1] < BUDGET_MAX_LAKH) {
        params.set('maxPrice', String(budgetRange[1] * 100000))
      }
      if (verified) {
        params.set('verified', 'true')
      }
      if (constructionStatus.length > 0) {
        const urlStatuses = constructionStatus.map(status => {
          if (status === 'Ready to move') return 'READY_TO_MOVE'
          if (status === 'Under Construction') return 'UNDER_CONSTRUCTION'
          return status.toUpperCase()
        })
        params.set('constructionStatus', urlStatuses.join(','))
      }
      if (showProjectsOnly) {
        params.set('project', 'true')
      }

      const newQueryString = params.toString()
      const currentQueryString = window.location.search.substring(1)
      if (newQueryString !== currentQueryString) {
        const path = newQueryString ? `${window.location.pathname}?${newQueryString}` : window.location.pathname
        router.replace(path, { scroll: false })
      }
    }
  }, [search, propertyTypes, listingMode, bhkTypes, budgetRange, selectedCity, selectedState, showProjectsOnly, verified, constructionStatus, mounted, setFilters, router])

  const totalPages = Math.ceil(properties.length / propertiesPerPage)
  const paginatedProperties = properties.slice((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage)

  const targetCity = selectedCity || 'Dwarka'
  const cityProperties = storeProperties.filter(
    p => p.city?.toLowerCase() === targetCity.toLowerCase()
  )

  const flatsCount = cityProperties.filter(
    p => p.propertyType === 'APARTMENT' || p.propertyType === 'FLAT'
  ).length

  const housesCount = cityProperties.filter(
    p => p.propertyType === 'HOUSE' || p.propertyType === 'VILLA'
  ).length

  const bhk2or3Count = cityProperties.filter(
    p => (p.bedrooms === 2 || p.bedrooms === 3) && p.listingType === (listingMode || 'BUY')
  ).length

  const newProjectsCount = cityProperties.filter(
    p => parseInt(p.id) % 3 === 0 || p.title?.toLowerCase().includes('new') || p.description?.toLowerCase().includes('booking')
  ).length

  const resaleProjectsCount = cityProperties.filter(
    p => !(parseInt(p.id) % 3 === 0 || p.title?.toLowerCase().includes('new') || p.description?.toLowerCase().includes('booking'))
  ).length

  const ownerPropertiesCount = cityProperties.filter(
    p => p.user?.role?.toLowerCase() === 'seller' || p.user?.role?.toLowerCase() === 'user'
  ).length

  if (!mounted) {
    return <PropertiesPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] -mt-16 sm:-mt-20">
      {/* Header Container - Fixed to Top */}
      <div className="fixed top-0 left-0 right-0 z-40">
        {/* Properties search bar — same on phone & desktop (responsive website) */}
        <div className="bg-[#0a2540] text-white py-2 px-3 sm:px-4 md:px-6 shadow-md">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center gap-2.5 md:gap-5 relative">
          
          {/* Row 1 on Mobile: Logo & Mobile Triggers */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
            
            {/* Logo and Location Selector (Desktop) */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="relative h-7 w-7 rounded overflow-hidden flex items-center justify-center bg-white shadow-sm shrink-0">
                  <img src={BRAND_LOGO_SRC} alt="Kanharaj Logo" className="h-full w-full object-cover" />
                </div>
                <span className="font-heading text-lg font-black tracking-tighter text-white flex items-baseline whitespace-nowrap">
                  KANHARAJ<span className="text-[9px] font-extrabold ml-0.5 opacity-85">.COM</span>
                </span>
              </Link>

              <div className="hidden md:block w-px h-6 bg-white/20 mx-1" />

              {/* Location Selector (Desktop Trigger) */}
              <div className="hidden md:block relative city-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="flex items-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer hover:text-white/80 transition whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 opacity-80" />
                  {listingMode === 'RENT' ? 'Rent In' : 'Buy In'} {selectedCity || 'All Cities'}
                  <ChevronDown className={cn("w-4 h-4 opacity-70 transition-transform", isCityDropdownOpen && "rotate-180")} />
                </button>
              </div>
            </div>

            {/* Mobile Controls: Location Badge & Profile Trigger */}
            <div className="flex md:hidden items-center gap-2">
              {/* Location Badge (Mobile Trigger) */}
              <div className="relative city-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1.5 rounded-lg transition text-white"
                >
                  <MapPin className="w-3 h-3 text-[#dfa127]" />
                  <span>{selectedCity || 'All Cities'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </div>

              {/* Profile Pill (Mobile Trigger) */}
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full p-0.5 pr-2 hover:bg-white/15 transition cursor-pointer focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-[#dfa127] text-[#0a2540] flex items-center justify-center text-[10px] font-black overflow-hidden shrink-0">
                    {isAuthenticated && user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : isAuthenticated ? (
                      user?.name?.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-3.5 h-3.5 text-white/70" />
                    )}
                  </div>
                  <Menu className="w-3.5 h-3.5 text-white/80" />
                </button>
              </div>
            </div>

          </div>

          {/* Row 2 on Mobile / Middle on Desktop: Search Bar */}
          <div className="flex-1 w-full md:max-w-[800px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0a2540]" />
            <Input
              placeholder="Enter Locality, Landmark, Project or builder"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-0 text-slate-900 placeholder:text-slate-400 rounded-md h-[40px] pl-10 focus-visible:ring-0 shadow-inner w-full text-xs sm:text-sm focus:outline-none"
            />
          </div>

          {/* Desktop Right Actions: Dashboard & Profile Menu (Hidden on Mobile) */}
          <div className="hidden md:flex gap-2 sm:gap-4 items-center ml-auto shrink-0 flex-nowrap">
            {showSellerDashboard && (
              <a href={sellerDashboardHref} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#00D289] hover:bg-[#00c07d] text-white font-bold rounded shadow-none h-9 px-5 whitespace-nowrap cursor-pointer text-xs">
                  Dashboard
                </Button>
              </a>
            )}

            {/* Desktop Profile Pill Trigger */}
            <div className="relative profile-menu-container">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-white rounded-full p-1 pl-3 shadow-sm hover:bg-slate-50 transition border border-slate-200 ml-1 cursor-pointer focus:outline-none"
              >
                <Menu className="w-4 h-4 text-slate-700" />
                <div className="w-7 h-7 rounded-full bg-[#0a2540] flex items-center justify-center text-white text-[11px] font-black overflow-hidden shrink-0">
                  {isAuthenticated && user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : isAuthenticated ? (
                    user?.name?.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Absolute Shared City Dropdown Panel */}
          <div className="city-dropdown-container">
            <AnimatePresence>
              {isCityDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-3 md:left-[17rem] top-full mt-2 w-[min(18rem,calc(100vw-1.5rem))] sm:w-72 max-h-[70vh] sm:max-h-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] flex flex-col overflow-hidden text-slate-800"
                >
                  <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50 gap-1.5 shrink-0">
                    <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder="Search city..."
                      className="w-full bg-transparent focus:outline-none text-xs text-slate-800 font-bold placeholder:text-slate-400 h-6 border-0 p-0"
                      autoFocus
                    />
                    {citySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCitySearchQuery('')}
                        className="text-[9px] text-[#0a2540] hover:text-[#07192c] font-black px-1"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-60 py-1.5 text-left">
                    <button
                      type="button"
                      onClick={() => handleCitySelect('')}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between border-b border-slate-100 mb-1",
                        !selectedCity
                          ? "bg-[#0a2540]/5 text-[#0a2540]"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span>All Cities</span>
                      {!selectedCity && <span className="text-[10px] font-black">✓</span>}
                    </button>
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
                                onClick={() => handleCitySelect(city)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center justify-between",
                                  selectedCity === city
                                    ? "bg-[#0a2540]/5 text-[#0a2540]"
                                    : "text-slate-700 hover:bg-slate-50"
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
                                onClick={() => handleCitySelect(city)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center justify-between",
                                  selectedCity === city
                                    ? "bg-[#0a2540]/5 text-[#0a2540]"
                                    : "text-slate-700 hover:bg-slate-50"
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

          {/* Absolute Shared Profile Dropdown Panel */}
          <div className="profile-menu-container">
            <AnimatePresence>
              {profileDropdownOpen && (
                <>
                  <div className="absolute right-3 md:right-0 mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl py-1.5 z-50 overflow-hidden text-slate-800">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                          <p className="text-xs font-black text-slate-800 truncate">{user?.name || "User Account"}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                        </div>
                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                          <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                        </Link>
                        <Link href="/chat" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> My Chats
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-slate-50 border-t border-slate-100 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                          <p className="text-xs font-black text-slate-800">Welcome to Kanharaj</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Login to access dashboard & profile</p>
                        </div>
                        <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Log In / Register
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>

          </div>
        </div>

        {/* Filter bar — same website UI, scrollable on small screens */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2 flex items-center gap-3 flex-nowrap lg:flex-wrap overflow-x-auto no-scrollbar relative">
            
            {/* Property Type Dropdown */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={(e) => toggleDropdown(e, 'property', 480)}
                className={cn("flex items-center gap-2 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors", activeDropdown === 'property' || propertyTypes.length > 0 ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700")}
              >
                {propertyTypes.length > 0 ? `Property Type (${propertyTypes.length})` : 'Property Type'} <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'property' && (
                <div
                  style={{
                    position: 'fixed',
                    top: dropdownCoords?.top,
                    left: dropdownCoords?.left,
                    width: dropdownCoords?.width,
                  }}
                  className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 max-h-[70vh] overflow-y-auto z-[100] filter-dropdown-panel"
                >
                  <div className="flex flex-wrap gap-3">
                    {['Apartment', 'Independent House', 'Independent Floor', 'Plot', 'Studio', 'Duplex', 'Penthouse', 'Villa', 'Agricultural Land'].map(type => (
                      <label key={type} className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", propertyTypes.includes(type) ? "bg-[#0a2540] border-[#0a2540] text-white" : "border-slate-300 bg-white")}>
                          {propertyTypes.includes(type) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={propertyTypes.includes(type)} onChange={() => {
                          setPropertyTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
                        }} />
                        <span className="text-sm font-medium text-slate-700 select-none">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BHK Type Dropdown */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={(e) => toggleDropdown(e, 'bhk', 380)}
                className={cn("flex items-center gap-2 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors", activeDropdown === 'bhk' || bhkTypes.length > 0 ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700")}
              >
                {bhkTypes.length > 0 ? `BHK Type (${bhkTypes.length})` : 'BHK Type'} <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'bhk' && (
                <div
                  style={{
                    position: 'fixed',
                    top: dropdownCoords?.top,
                    left: dropdownCoords?.left,
                    width: dropdownCoords?.width,
                  }}
                  className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 max-h-[70vh] overflow-y-auto z-[100] filter-dropdown-panel"
                >
                  <div className="flex flex-wrap gap-3">
                    {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', '5+ BHK'].map(type => (
                      <label key={type} className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", bhkTypes.includes(type) ? "bg-[#0a2540] border-[#0a2540] text-white" : "border-slate-300 bg-white")}>
                          {bhkTypes.includes(type) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={bhkTypes.includes(type)} onChange={() => {
                          setBhkTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
                        }} />
                        <span className="text-sm font-medium text-slate-700 select-none">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Budget Dropdown */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={(e) => toggleDropdown(e, 'budget', 420)}
                className={cn("flex items-center gap-2 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors", activeDropdown === 'budget' || budgetRange[0] > 0 || budgetRange[1] < BUDGET_MAX_LAKH ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700")}
              >
                ₹{formatBudgetLabel(budgetRange[0])} - ₹{formatBudgetLabel(budgetRange[1])} <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'budget' && (
                <div
                  style={{
                    position: 'fixed',
                    top: dropdownCoords?.top,
                    left: dropdownCoords?.left,
                    width: dropdownCoords?.width,
                  }}
                  className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 sm:p-6 max-h-[70vh] overflow-y-auto z-[100] filter-dropdown-panel"
                >
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-6">
                    <span>₹{formatBudgetLabel(budgetRange[0])}</span>
                    <span>₹{formatBudgetLabel(budgetRange[1])}</span>
                  </div>

                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={budgetRange}
                    max={BUDGET_MAX_LAKH}
                    step={BUDGET_STEP}
                    onValueChange={(val: [number, number]) => setBudgetRange(val)}
                  >
                    <Slider.Track className="bg-slate-200 relative grow rounded-full h-1.5">
                      <Slider.Range className="absolute bg-[#0a2540] rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 bg-[#f1f5f9] border-2 border-[#0a2540] rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#0a2540]/50 flex items-center justify-center cursor-grab">
                      <div className="w-2 h-2 bg-[#0a2540] rounded-full" />
                    </Slider.Thumb>
                    <Slider.Thumb className="block w-5 h-5 bg-[#f1f5f9] border-2 border-[#0a2540] rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[#0a2540]/50 flex items-center justify-center cursor-grab">
                      <div className="w-2 h-2 bg-[#0a2540] rounded-full" />
                    </Slider.Thumb>
                  </Slider.Root>

                  <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium px-2">
                    <div className="flex flex-col items-center gap-1"><span>|</span><span>₹0</span></div>
                    <div className="flex flex-col items-center gap-1"><span>|</span><span>₹25 Lakh</span></div>
                    <div className="flex flex-col items-center gap-1"><span>|</span><span>₹50 Lakh</span></div>
                    <div className="flex flex-col items-center gap-1"><span>|</span><span>₹1Cr+</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Sale Type Dropdown */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={(e) => toggleDropdown(e, 'sale', 240)}
                className={cn("flex items-center gap-2 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors", activeDropdown === 'sale' || saleTypes.length > 0 ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700")}
              >
                {saleTypes.length > 0 ? `Sale Type (${saleTypes.length})` : 'Sale Type'} <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'sale' && (
                <div
                  style={{
                    position: 'fixed',
                    top: dropdownCoords?.top,
                    left: dropdownCoords?.left,
                    width: dropdownCoords?.width,
                  }}
                  className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 max-h-[70vh] overflow-y-auto z-[100] filter-dropdown-panel"
                >
                  <div className="flex flex-col gap-3">
                    {['New Bookings', 'Resale'].map(type => (
                      <label key={type} className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", saleTypes.includes(type) ? "bg-[#0a2540] border-[#0a2540] text-white" : "border-slate-300 bg-white")}>
                          {saleTypes.includes(type) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={saleTypes.includes(type)} onChange={() => {
                          setSaleTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
                        }} />
                        <span className="text-sm font-medium text-slate-700 select-none">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Construction Status Dropdown */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={(e) => toggleDropdown(e, 'construction', 240)}
                className={cn("flex items-center gap-2 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors", activeDropdown === 'construction' || constructionStatus.length > 0 ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700")}
              >
                {constructionStatus.length > 0 ? `Construction St... (${constructionStatus.length})` : 'Construction St...'} <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
              {activeDropdown === 'construction' && (
                <div
                  style={{
                    position: 'fixed',
                    top: dropdownCoords?.top,
                    left: dropdownCoords?.left,
                    width: dropdownCoords?.width,
                  }}
                  className="bg-white border border-slate-200 shadow-2xl rounded-xl p-4 max-h-[70vh] overflow-y-auto z-[100] filter-dropdown-panel"
                >
                  <div className="flex flex-col gap-3">
                    {['Ready to move', 'Under Construction'].map(type => (
                      <label key={type} className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors w-full">
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", constructionStatus.includes(type) ? "bg-[#0a2540] border-[#0a2540] text-white" : "border-slate-300 bg-white")}>
                          {constructionStatus.includes(type) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={constructionStatus.includes(type)} onChange={() => {
                          setConstructionStatus(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
                        }} />
                        <span className="text-sm font-medium text-slate-700 select-none">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setVerified(!verified)}
              className={cn(
                "flex items-center gap-1.5 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                verified ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              Verified <Info className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Projects Toggle */}
            <button
              onClick={() => setShowProjectsOnly(!showProjectsOnly)}
              className={cn(
                "flex items-center gap-1.5 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                showProjectsOnly ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              Project <Building2 className="w-3.5 h-3.5 opacity-70" />
            </button>

            <button
              onClick={() => {
                setListedBy(prev => prev.includes('Featured Agents') ? prev.filter(x => x !== 'Featured Agents') : [...prev, 'Featured Agents'])
              }}
              className={cn(
                "flex items-center gap-1.5 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                listedBy.includes('Featured Agents') ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              ⭐ Featured Agents
            </button>


            <button
              onClick={handleOpenMoreFilters}
              className={cn(
                "flex items-center gap-2 border rounded px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                isAnyMoreFilterActive ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}
            >
              More Filters {activeMoreFiltersCount > 0 ? `(${activeMoreFiltersCount})` : ''} <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[#E11D48] hover:text-red-700 font-semibold px-3 py-1.5 text-sm whitespace-nowrap transition-colors ml-auto"
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </div> {/* Close Header Container */}

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-[210px] sm:pt-[190px] md:pt-[130px] pb-6">
        {/* Breadcrumb and Timestamp */}
        <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-500 mb-6">
          <div className="mb-2 md:mb-0">
            Home / {listingMode === 'RENT' ? 'Flats for Rent' : 'Flats for Sale'}{selectedCity ? ` in ${selectedCity}` : ''}
          </div>
          <div>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>

        {/* Main Grid: Left Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto w-full">

          {/* Left Column - Properties List */}
          <div className="lg:col-span-12">
            <div ref={listTopRef} className="lg:flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-4 sm:px-0">
              <div className="mb-4 sm:mb-0 pt-4 sm:pt-0">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Showing results for</p>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {listingMode === 'RENT' ? 'Flats for Rent' : 'Flats for Sale'} in {selectedCity || 'Dwarka'}
                </h1>
                <p className="text-slate-400 text-xs font-bold mt-1">{properties.length} Properties Found</p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 hidden sm:inline">Sort by:</span>
                  <button type="button" className="border border-slate-200 rounded px-3 py-1.5 text-sm bg-white flex items-center gap-2 hover:bg-slate-50">
                    Relevance <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Looking for Property in {targetCity}? kanharaj.com offers {flatsCount > 0 ? `${flatsCount}+` : '0'} Flat{flatsCount !== 1 ? 's' : ''} & {housesCount > 0 ? `${housesCount}+` : '0'} House{housesCount !== 1 ? 's' : ''}/Villa{housesCount !== 1 ? 's' : ''}. Search from {bhk2or3Count > 0 ? `${bhk2or3Count}+` : '0'} 2 & 3 BHK properties for {listingMode === 'RENT' ? 'rent' : 'sale'} in {targetCity}. Choose from {newProjectsCount > 0 ? `${newProjectsCount}+` : '0'} New Project{newProjectsCount !== 1 ? 's' : ''}, {resaleProjectsCount > 0 ? `${resaleProjectsCount}+` : '0'} Resale Project{resaleProjectsCount !== 1 ? 's' : ''} and {ownerPropertiesCount > 0 ? `${ownerPropertiesCount}+` : '0'} Owner Propert{ownerPropertiesCount !== 1 ? 'ies' : 'y'} for {listingMode === 'RENT' ? 'rent' : 'sale'} in {targetCity}. 100% Verified Properties.
            </p>

            {loading && storeProperties.length === 0 ? (
              <HousingPropertyListSkeleton count={4} />
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your filters or location</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-0">
                  {paginatedProperties.map((property) => (
                    <HousingPropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pb-8">
                    {/* Previous Button */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5">
                      {getPageNumbers(totalPages).map((page, idx) => {
                        if (page === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-3 py-1.5 text-xs font-bold text-slate-400">
                              ...
                            </span>
                          )
                        }

                        const pageNum = page as number
                        const isSelected = currentPage === pageNum

                        return (
                          <button
                            key={`page-${pageNum}`}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "w-9 h-9 flex items-center justify-center rounded-lg border text-xs font-bold transition-all shadow-sm cursor-pointer",
                              isSelected
                                ? "bg-[#0a2540] border-[#0a2540] text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0a2540]"
                            )}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                      )}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* More Filters Popover - Housing.com Style */}
      {isMoreFiltersOpen && (
        <>
          {/* Invisible backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMoreFiltersOpen(false)}
          />
          <div className="fixed inset-0 z-50 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-[104px] sm:w-[calc(100vw-32px)] sm:max-w-[760px] sm:bottom-auto">
            <div className="relative bg-white sm:rounded-lg shadow-2xl border border-slate-200 flex flex-col h-[100dvh] sm:h-[min(480px,85vh)] sm:max-h-[85vh]">

              {/* No header — Housing.com popover has no title bar, just a close X in corner */}
              <button
                onClick={() => setIsMoreFiltersOpen(false)}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Body - Left Sidebar + Right Content */}
              <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden pt-10 sm:pt-0">

                {/* LEFT SIDEBAR - Tab Navigation */}
                <div className="w-full sm:w-[200px] shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50 overflow-x-auto sm:overflow-y-auto sm:max-h-[400px] flex sm:flex-col flex-row gap-0 sm:gap-0 max-h-[120px] sm:max-h-[400px]">
                  {[
                    { key: 'PROPERTY TYPE', count: tempPropertyTypes.length },
                    { key: 'BHK TYPE', count: tempBhkTypes.length },
                    { key: 'BUDGET RANGE', count: (tempBudgetRange[0] > 0 || tempBudgetRange[1] < BUDGET_MAX_LAKH) ? 1 : 0 },
                    { key: 'SALE TYPE', count: tempSaleTypes.length },
                    { key: 'CONSTRUCTION STATUS', count: tempConstructionStatus.length },
                    { key: 'LISTED BY', count: tempListedBy.length },
                    { key: 'VERIFIED', count: tempVerified ? 1 : 0 },
                    { key: 'BUILT-UP AREA', count: (tempAreaRange[0] > 0 || tempAreaRange[1] < 5000) ? 1 : 0 },
                    { key: 'AMENITIES', count: tempAmenities.length },
                    { key: 'AGE OF PROPERTY', count: tempAge ? 1 : 0 },
                    { key: 'FACING', count: tempFacing.length },
                    { key: 'PROPERTY DETAILS', count: tempPropertyDetails.length },
                    { key: 'RERA COMPLIANT', count: tempRera ? 1 : 0 },
                    { key: 'NEW PROJECTS/SOCIETIES', count: tempProjects.length },
                  ].map(({ key, count }) => (
                    <button
                      key={key}
                      onClick={() => setActiveFilterTab(key)}
                      className={cn(
                        "shrink-0 sm:w-full text-left px-4 py-3 text-[11px] font-semibold tracking-wide border-l-2 sm:border-l-2 border-b-2 sm:border-b-0 transition-all whitespace-nowrap",
                        activeFilterTab === key
                          ? "border-[#0a2540] bg-white text-[#0a2540]"
                          : "border-transparent text-slate-500 hover:bg-white hover:text-slate-700"
                      )}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span className="leading-tight">{key}</span>
                        {count > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#0a2540] text-white text-[9px] font-bold px-1">
                            {count}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>

                {/* RIGHT CONTENT - Options stacked vertically */}
                <div className="flex-1 overflow-y-auto px-5 py-4">

                  {/* Property Type */}
                  {activeFilterTab === 'PROPERTY TYPE' && (
                    <div className="space-y-2 h-[400px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select property type(s)</p>
                      {['Apartment', 'Independent House', 'Independent Floor', 'Plot', 'Studio', 'Duplex', 'Penthouse', 'Villa', 'Agricultural Land'].map(type => (
                        <label key={type} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempPropertyTypes.includes(type) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                          <input type="checkbox" className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" checked={tempPropertyTypes.includes(type)} onChange={() => {
                            setTempPropertyTypes(prev => prev.includes(type) ? prev.filter((t: string) => t !== type) : [...prev, type])
                          }} />
                          <span className="text-sm font-medium text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* BHK Type */}
                  {activeFilterTab === 'BHK TYPE' && (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select BHK configuration(s)</p>
                      {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', '5+ BHK'].map(type => (
                        <label key={type} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempBhkTypes.includes(type) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                          <input type="checkbox" className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" checked={tempBhkTypes.includes(type)} onChange={() => {
                            setTempBhkTypes(prev => prev.includes(type) ? prev.filter((t: string) => t !== type) : [...prev, type])
                          }} />
                          <span className="text-sm font-medium text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Budget Range */}
                  {activeFilterTab === 'BUDGET RANGE' && (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400">Set your budget range</p>
                        <span className="text-xs font-bold text-[#0a2540]">
                          ₹{formatBudgetLabel(tempBudgetRange[0])} – ₹{formatBudgetLabel(tempBudgetRange[1])}
                        </span>
                      </div>
                      <div className="px-1 py-2">
                        <Slider.Root
                          className="relative flex items-center select-none touch-none w-full h-5 my-2"
                          value={tempBudgetRange}
                          max={BUDGET_MAX_LAKH}
                          step={BUDGET_STEP}
                          onValueChange={(val: [number, number]) => setTempBudgetRange(val)}
                        >
                          <Slider.Track className="bg-slate-200 relative grow rounded-full h-1.5">
                            <Slider.Range className="absolute bg-[#0a2540] rounded-full h-full" />
                          </Slider.Track>
                          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#0a2540] rounded-full shadow focus:outline-none cursor-grab" aria-label="Min Budget" />
                          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#0a2540] rounded-full shadow focus:outline-none cursor-grab" aria-label="Max Budget" />
                        </Slider.Root>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                          <span>₹0</span><span>₹25 Lakh</span><span>₹50 Lakh</span><span>₹75 Lakh</span><span>₹1Cr+</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map(val => (
                          <button key={val} type="button" onClick={() => setTempBudgetRange([0, val])}
                            className={cn("border rounded-lg px-3 py-2 text-xs font-semibold transition-all", tempBudgetRange[1] === val && tempBudgetRange[0] === 0 ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540]" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                            Up to ₹{formatBudgetLabel(val)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sale Type */}
                  {activeFilterTab === 'SALE TYPE' && (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select sale type(s)</p>
                      {['New Bookings', 'Resale'].map(type => (
                        <label key={type} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempSaleTypes.includes(type) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                          <input type="checkbox" className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" checked={tempSaleTypes.includes(type)} onChange={() => {
                            setTempSaleTypes(prev => prev.includes(type) ? prev.filter((t: string) => t !== type) : [...prev, type])
                          }} />
                          <span className="text-sm font-medium text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Construction Status */}
                  {activeFilterTab === 'CONSTRUCTION STATUS' && (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select construction status</p>
                      {['Ready to move', 'Under Construction'].map(type => (
                        <label key={type} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempConstructionStatus.includes(type) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                          <input type="checkbox" className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" checked={tempConstructionStatus.includes(type)} onChange={() => {
                            setTempConstructionStatus(prev => prev.includes(type) ? prev.filter((t: string) => t !== type) : [...prev, type])
                          }} />
                          <span className="text-sm font-medium text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Listed By */}
                  {activeFilterTab === 'LISTED BY' && (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Filter by listing source</p>
                      {['Agent', 'Owner', 'Developer', 'Featured Agents'].map(option => (
                        <label key={option} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempListedBy.includes(option) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                          <input type="checkbox" checked={tempListedBy.includes(option)} onChange={() => {
                            setTempListedBy(prev => prev.includes(option) ? prev.filter((x: string) => x !== option) : [...prev, option])
                          }} className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" />
                          <span className="text-sm font-medium text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Verified */}
                  {activeFilterTab === 'VERIFIED' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400 mb-3">Show only verified properties</p>
                      <div className={cn("border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors", tempVerified ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200 hover:bg-slate-50")}
                        onClick={() => setTempVerified(v => !v)}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-[#f1f5f9] rounded-lg text-[#0a2540] mt-0.5">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                              Verified Properties Only
                              <Info className="w-3.5 h-3.5 text-slate-400" />
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">Properties with verified images & location</p>
                          </div>
                        </div>
                        <div className={cn("w-10 h-5 rounded-full relative transition-colors shrink-0", tempVerified ? "bg-[#0a2540]" : "bg-slate-200")}>
                          <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", tempVerified ? "left-5" : "left-0.5")} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Built-up Area */}
                  {activeFilterTab === 'BUILT-UP AREA' && (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400">Set built-up area range</p>
                        <span className="text-xs font-bold text-[#0a2540]">
                          {tempAreaRange[0]} – {tempAreaRange[1] === 5000 ? '5000+ sq.ft.' : tempAreaRange[1] + ' sq.ft.'}
                        </span>
                      </div>
                      <div className="px-1 py-2">
                        <Slider.Root
                          className="relative flex items-center select-none touch-none w-full h-5 my-2"
                          value={tempAreaRange}
                          max={5000}
                          step={100}
                          onValueChange={(val: [number, number]) => setTempAreaRange(val)}
                        >
                          <Slider.Track className="bg-slate-200 relative grow rounded-full h-1.5">
                            <Slider.Range className="absolute bg-[#0a2540] rounded-full h-full" />
                          </Slider.Track>
                          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#0a2540] rounded-full shadow focus:outline-none cursor-grab" aria-label="Min Area" />
                          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#0a2540] rounded-full shadow focus:outline-none cursor-grab" aria-label="Max Area" />
                        </Slider.Root>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                          <span>0</span><span>1k</span><span>2k</span><span>3k</span><span>4k</span><span>5k+</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {[[0, 500], [0, 1000], [0, 2000], [0, 3000]].map(([min, max]) => (
                          <button key={max} type="button" onClick={() => setTempAreaRange([min, max])}
                            className={cn("border rounded-lg px-3 py-2 text-xs font-semibold transition-all", tempAreaRange[0] === min && tempAreaRange[1] === max ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540]" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                            Up to {max} sq.ft.
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {activeFilterTab === 'AMENITIES' && (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select required amenities</p>
                      {[
                        { name: 'Gated Community', icon: Shield },
                        { name: 'Lift', icon: ArrowUpDown },
                        { name: 'Swimming Pool', icon: Waves },
                        { name: 'Gym', icon: Dumbbell },
                        { name: 'Parking', icon: Car },
                        { name: 'Gas Pipeline', icon: Flame },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = tempAmenities.includes(item.name);
                        return (
                          <label key={item.name} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", isSelected ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                            <input type="checkbox" checked={isSelected} onChange={() => {
                              setTempAmenities(prev => prev.includes(item.name) ? prev.filter((x: string) => x !== item.name) : [...prev, item.name])
                            }} className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" />
                            <Icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-[#0a2540]" : "text-slate-400")} />
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Age of Property */}
                  {activeFilterTab === 'AGE OF PROPERTY' && (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select property age</p>
                      {['Less than 1 year', 'Less than 3 years', 'Less than 5 years', 'More than 5 years'].map(option => {
                        const isSelected = tempAge === option;
                        return (
                          <button key={option} type="button" onClick={() => setTempAge(isSelected ? null : option)}
                            className={cn("w-full text-left border rounded-lg px-3 py-2.5 text-sm font-medium transition-all", isSelected ? "border-[#0a2540] bg-[#0a2540]/5 text-[#0a2540] font-semibold" : "border-slate-200 text-slate-700 hover:bg-slate-50")}>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Facing */}
                  {activeFilterTab === 'FACING' && (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select property facing direction(s)</p>
                      {['North', 'East', 'West', 'South', 'North - East', 'North - West', 'South - East', 'South - West'].map(option => (
                        <label key={option} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempFacing.includes(option) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                          <input type="checkbox" checked={tempFacing.includes(option)} onChange={() => {
                            setTempFacing(prev => prev.includes(option) ? prev.filter((x: string) => x !== option) : [...prev, option])
                          }} className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" />
                          <span className="text-sm font-medium text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Property Details */}
                  {activeFilterTab === 'PROPERTY DETAILS' && (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Select property characteristics</p>
                      {['Corner Property', 'Boundary Wall Present'].map(option => (
                        <label key={option} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempPropertyDetails.includes(option) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                          <input type="checkbox" checked={tempPropertyDetails.includes(option)} onChange={() => {
                            setTempPropertyDetails(prev => prev.includes(option) ? prev.filter((x: string) => x !== option) : [...prev, option])
                          }} className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" />
                          <span className="text-sm font-medium text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* RERA Compliant */}
                  {activeFilterTab === 'RERA COMPLIANT' && (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      <p className="text-xs text-slate-400 mb-3">Show only RERA compliant properties</p>
                      <div className={cn("border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors", tempRera ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200 hover:bg-slate-50")}
                        onClick={() => setTempRera(v => !v)}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-[#f1f5f9] rounded-lg text-[#0a2540] mt-0.5">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">RERA Compliance Only</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Show only RERA registered properties</p>
                          </div>
                        </div>
                        <div className={cn("w-10 h-5 rounded-full relative transition-colors shrink-0", tempRera ? "bg-[#0a2540]" : "bg-slate-200")}>
                          <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", tempRera ? "left-5" : "left-0.5")} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* New Projects / Societies */}
                  {activeFilterTab === 'NEW PROJECTS/SOCIETIES' && (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input placeholder="Search projects..." value={tempProjectsSearch} onChange={(e) => setTempProjectsSearch(e.target.value)}
                          className="pl-8 text-sm h-8 border-slate-200 focus-visible:ring-[#0a2540] rounded-lg" />
                      </div>
                      <p className="text-xs text-slate-400">Select projects/societies</p>
                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {postedProjects.length === 0 ? (
                          <div className="text-xs text-slate-400 font-semibold p-4 text-center">No projects posted yet</div>
                        ) : (
                          Array.from(new Set(postedProjects.map(p => p.title)))
                            .filter(project => project.toLowerCase().includes(tempProjectsSearch.toLowerCase()))
                            .map(option => (
                              <label key={option} className={cn("flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors w-full", tempProjects.includes(option) ? "border-[#0a2540] bg-[#0a2540]/5" : "border-slate-200")}>
                                <input type="checkbox" checked={tempProjects.includes(option)} onChange={() => {
                                  setTempProjects(prev => prev.includes(option) ? prev.filter((x: string) => x !== option) : [...prev, option])
                                }} className="w-4 h-4 rounded text-[#0a2540] border-slate-300 focus:ring-[#0a2540] shrink-0" />
                                <span className="text-sm font-medium text-slate-700">{option}</span>
                              </label>
                            ))
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={handleClearMoreFilters}
                  className="text-[#E11D48] hover:text-red-700 font-semibold text-sm transition-colors"
                >
                  Clear All
                </button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMoreFiltersOpen(false)}
                    className="border-slate-200 text-slate-600 font-bold hover:bg-slate-100 rounded-lg px-5 h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleApplyMoreFilters}
                    className="bg-[#0a2540] hover:bg-[#07192c] text-white font-bold rounded-lg px-6 shadow-md transition h-8 text-xs"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
