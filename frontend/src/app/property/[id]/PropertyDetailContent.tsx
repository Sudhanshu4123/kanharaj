"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bed, Bath, Maximize, MapPin, Calendar, Phone, Mail, Heart, Share2,
  ChevronLeft, ChevronRight, Check, MessageCircle, ArrowLeft, Building2,
  ShieldAlert, ShieldCheck, Info, Sparkles, AlertCircle, Compass, Star,
  X, Printer, DollarSign, Download, School, Activity, Shield, ArrowUpDown,
  ChevronDown, Search, Menu, User, LogOut
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatPrice, formatNumber, cn, BRAND_LOGO_SRC, hasSellerDashboardAccess, getSellerUrl, getApiUrl } from '@/lib/utils'
import { useInquiryStore, useAuthStore } from '@/lib/store'
import { useUserActivityStore } from '@/lib/user-activity-store'
import { useChatBoxStore } from '@/lib/chat-box-store'
import { Property } from '@/lib/data'
import { FloorPlanSchematic } from '@/components/properties/floor-plan-schematic'
import { PropertyLocalityMap } from '@/components/properties/property-locality-map'
import { buildFloorPlanRooms, isResidentialFloorPlan } from '@/lib/floor-plan'
import { SUPPORT_PHONE } from '@/lib/platform-data'
import { topCities, otherCities } from '@/components/home/search-bar'


interface ParsedHighlights {
  bhk?: string;
  transactionType?: string;
  constructionStatus?: string;
  bathrooms?: string;
  balconies?: string;
  furnishType?: string;
  furnishings?: string[];
  coveredParking?: string;
  openParking?: string;
  preferredTenant?: string;
  petFriendly?: string;
  availableFrom?: string;
  maintenanceCharges?: string;
  parkingCharges?: string;
  paintingCharges?: string;
  securityDeposit?: string;
  lockInPeriod?: string;
  brokerageCharges?: string;
  carpetArea?: string;
  floorDetails?: string;
  facing?: string;
  servantRoom?: string;
  reraId?: string;
  ageOfProperty?: string;
  // PG Fields
  pgName?: string;
  locality?: string;
  totalBeds?: string;
  pgFor?: string;
  bestSuitedFor?: string;
  mealsAvailable?: string;
  noticePeriod?: string;
  commonAreas?: string;
  managedBy?: string;
  managerStaysAtProperty?: string;
  nonVegAllowed?: string;
  oppositeSexAllowed?: string;
  anyTimeAllowed?: string;
  visitorsAllowed?: string;
  guardianAllowed?: string;
  drinkingAllowed?: string;
  smokingAllowed?: string;
  onetimeMoveInCharges?: string;
  mealCharges?: string;
  electricityCharges?: string;
  roomDetails?: string;
  // Commercial Fields
  zoneType?: string;
  locationHub?: string;
  propertyCondition?: string;
  electricityChargesIncluded?: string;
  waterChargesIncluded?: string;
  expectedRentIncrease?: string;
  dgUpsChargesIncluded?: string;
  ownership?: string;
  priceNegotiable?: string;
  subPropertyType?: string;
  possessionStatus?: string;
  flooring?: string;
  staircases?: string;
  passengerLifts?: string;
  serviceLifts?: string;
  privateParking?: string;
  publicParking?: string;
  builtUpArea?: string;
}

function parsePropertyHighlights(description: string): { highlights: ParsedHighlights; cleanDescription: string } {
  const highlights: ParsedHighlights = {};
  let cleanDescription = description || '';

  if (description && description.includes('PROPERTY HIGHLIGHTS:')) {
    const parts = description.split('---');
    const highlightsPart = parts[0];
    cleanDescription = parts.slice(1).join('---').trim();

    const lines = highlightsPart.split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*•\s*([^:]+)\s*:\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();

        switch (key) {
          case 'BHK':
            highlights.bhk = value;
            break;
          case 'Transaction Type':
            highlights.transactionType = value;
            break;
          case 'Construction Status':
            highlights.constructionStatus = value;
            break;
          case 'Bathrooms':
            highlights.bathrooms = value;
            break;
          case 'Balconies':
            highlights.balconies = value;
            break;
          case 'Furnish Type':
            highlights.furnishType = value;
            break;
          case 'Furnishings':
            highlights.furnishings = value.split(',').map(f => f.trim()).filter(Boolean);
            break;
          case 'Covered Parking':
            highlights.coveredParking = value;
            break;
          case 'Open Parking':
            highlights.openParking = value;
            break;
          case 'Preferred Tenant':
            highlights.preferredTenant = value;
            break;
          case 'Pet Friendly':
            highlights.petFriendly = value;
            break;
          case 'Available From':
            highlights.availableFrom = value;
            break;
          case 'Maintenance':
          case 'Maintenance Charges':
            highlights.maintenanceCharges = value;
            break;
          case 'Parking Charges':
            highlights.parkingCharges = value;
            break;
          case 'Painting Charges':
            highlights.paintingCharges = value;
            break;
          case 'Security Deposit':
            highlights.securityDeposit = value;
            break;
          case 'Lock-in Period':
            highlights.lockInPeriod = value;
            break;
          case 'Brokerage Charges':
            highlights.brokerageCharges = value;
            break;
          case 'Carpet Area':
            highlights.carpetArea = value;
            break;
          case 'Floor details':
          case 'Floor Details':
            highlights.floorDetails = value;
            break;
          case 'Facing':
            highlights.facing = value;
            break;
          case 'Servant Room':
            highlights.servantRoom = value;
            break;
          case 'RERA ID':
            highlights.reraId = value;
            break;
          case 'Age of Property':
            highlights.ageOfProperty = value;
            break;
          case 'PG Name':
            highlights.pgName = value;
            break;
          case 'Locality':
            highlights.locality = value;
            break;
          case 'Total Beds':
            highlights.totalBeds = value;
            break;
          case 'PG is for':
            highlights.pgFor = value;
            break;
          case 'Best Suited For':
            highlights.bestSuitedFor = value;
            break;
          case 'Meals Available':
            highlights.mealsAvailable = value;
            break;
          case 'Notice Period':
            highlights.noticePeriod = value;
            break;
          case 'Common Areas':
            highlights.commonAreas = value;
            break;
          case 'Managed By':
            highlights.managedBy = value;
            break;
          case 'Manager Stays At Property':
            highlights.managerStaysAtProperty = value;
            break;
          case 'Non-Veg Allowed':
            highlights.nonVegAllowed = value;
            break;
          case 'Opposite Sex Allowed':
            highlights.oppositeSexAllowed = value;
            break;
          case 'Any Time Allowed':
            highlights.anyTimeAllowed = value;
            break;
          case 'Visitors Allowed':
            highlights.visitorsAllowed = value;
            break;
          case 'Guardian Allowed':
            highlights.guardianAllowed = value;
            break;
          case 'Drinking Allowed':
            highlights.drinkingAllowed = value;
            break;
          case 'Smoking Allowed':
            highlights.smokingAllowed = value;
            break;
          case 'Onetime Move-in Charges':
            highlights.onetimeMoveInCharges = value;
            break;
          case 'Meal Charges':
            highlights.mealCharges = value;
            break;
          case 'Electricity Charges':
            highlights.electricityCharges = value;
            break;
          case 'Room Details':
            highlights.roomDetails = value;
            break;
          case 'Zone Type':
            highlights.zoneType = value;
            break;
          case 'Location Hub':
            highlights.locationHub = value;
            break;
          case 'Property Condition':
            highlights.propertyCondition = value;
            break;
          case 'Electricity Charges Included':
            highlights.electricityChargesIncluded = value;
            break;
          case 'Water Charges Included':
            highlights.waterChargesIncluded = value;
            break;
          case 'Expected Rent Increase':
            highlights.expectedRentIncrease = value;
            break;
          case 'DG & UPS Charges Included':
            highlights.dgUpsChargesIncluded = value;
            break;
          case 'Ownership':
            highlights.ownership = value;
            break;
          case 'Price Negotiable':
            highlights.priceNegotiable = value;
            break;
          case 'Sub Property Type':
            highlights.subPropertyType = value;
            break;
          case 'Possession Status':
            highlights.possessionStatus = value;
            break;
          case 'Flooring':
            highlights.flooring = value;
            break;
          case 'Staircases':
            highlights.staircases = value;
            break;
          case 'Passenger Lifts':
            highlights.passengerLifts = value;
            break;
          case 'Service Lifts':
            highlights.serviceLifts = value;
            break;
          case 'Private Parking':
            highlights.privateParking = value;
            break;
          case 'Public Parking':
            highlights.publicParking = value;
            break;
          case 'Built Up Area':
            highlights.builtUpArea = value;
            break;
        }
      }
    });
  }

  return { highlights, cleanDescription };
}

interface PropertyDetailContentProps {
  property: Property
}

export default function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  // Image gallery states
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Custom states
  const [isFavorite, setIsFavorite] = useState(false)
  const [shareTooltip, setShareTooltip] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedQuickMsg, setSelectedQuickMsg] = useState(
    "I'm interested in this property. Please contact me with details."
  )

  // EMI Calculator states
  const [downPaymentPercent, setDownPaymentPercent] = useState(20) // default 20%
  const [interestRate, setInterestRate] = useState(8.5) // default 8.5%
  const [tenureYears, setTenureYears] = useState(20) // default 20 years

  const router = useRouter()

  // Search header state
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [citySearchQuery, setCitySearchQuery] = useState('')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const [sellerUrl, setSellerUrl] = useState('https://seller.kanharaj.com')
  useEffect(() => {
    setSellerUrl(getSellerUrl())
  }, [])

  // Auth store
  const { isAuthenticated, user, token, logout } = useAuthStore()
  const showSellerDashboard = isAuthenticated && hasSellerDashboardAccess(user)
  const sellerDashboardHref = token ? `${sellerUrl}/login?token=${token}` : `${sellerUrl}/login`

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isCityDropdownOpen && !target.closest('.city-dropdown-container')) {
        setIsCityDropdownOpen(false)
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isCityDropdownOpen]);

  const handleLogout = () => {
    logout()
    setProfileDropdownOpen(false)
    router.push('/login')
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setIsCityDropdownOpen(false)
    setCitySearchQuery('')
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (search) params.set('search', search)
    router.push(`/properties?${params.toString()}`)
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const params = new URLSearchParams()
    if (selectedCity) params.set('city', selectedCity)
    if (search) params.set('search', search)
    router.push(`/properties?${params.toString()}`)
  }

  // Parse Property Highlights from description
  const { highlights, cleanDescription } = useMemo(() => {
    return parsePropertyHighlights(property.description)
  }, [property.description])

  const roomsList = useMemo(() => {
    if (!highlights.roomDetails) return []
    try {
      return JSON.parse(highlights.roomDetails) as Array<{
        roomType: string;
        totalBeds?: string;
        rent: string;
        securityDeposit: string;
        facilities: string[];
      }>
    } catch (e) {
      console.error("Failed to parse room details:", e)
      return []
    }
  }, [highlights.roomDetails])

  const isPlotOrLand = property.propertyType?.toUpperCase() === 'PLOT' || property.propertyType?.toUpperCase() === 'PLOTS/LAND'
  const isCommercial = property.propertyType?.toUpperCase() === 'OFFICE_SPACE' ||
    property.propertyType?.toUpperCase() === 'SHOP' ||
    property.propertyType?.toUpperCase() === 'COMMERCIAL'

  // Derived metadata display values
  const bedroomsVal = (isPlotOrLand || isCommercial) ? null : (highlights.bhk || (property.bedrooms ? `${property.bedrooms} BHK` : '3 BHK'))
  const bathroomsVal = (isPlotOrLand || isCommercial) ? null : (highlights.bathrooms ? `${highlights.bathrooms} Baths` : (property.bathrooms ? `${property.bathrooms} Baths` : '3 Baths'))
  const areaVal = highlights.carpetArea || (property.area ? `${formatNumber(property.area)} Sq.Ft.` : 'N/A')
  const areaLabel = isPlotOrLand ? 'Plot Area' : isCommercial ? 'Built Up Area' : (highlights.carpetArea ? 'Carpet Area' : 'Super Area')
  const facingVal = highlights.facing ? `${highlights.facing} Facing` : 'East Facing'
  const possessionVal = highlights.possessionStatus || (property.listingType === 'RENT'
    ? (highlights.availableFrom ? `From ${highlights.availableFrom}` : 'Immediately')
    : (highlights.constructionStatus || 'Ready To Move'))
  const ageVal = highlights.ageOfProperty
    ? highlights.ageOfProperty
    : (property.yearBuilt ? `${new Date().getFullYear() - property.yearBuilt} Years` : 'Newly Built')
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const contactLocked = isAuthenticated && !!user

  useEffect(() => {
    if (!isAuthenticated || !user) return
    setInquiryForm((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
    }))
  }, [isAuthenticated, user?.id, user?.name, user?.email, user?.phone])

  // Track property views
  useEffect(() => {
    const trackView = async () => {
      try {
        const apiUrl = getApiUrl() || '';
        await fetch(`${apiUrl}/properties/${property.id}/view`, {
          method: 'POST',
        });
      } catch (err) {
        console.warn("View tracking failed:", err);
      }
    };

    if (property.id) {
      trackView();
      useUserActivityStore.getState().recordSeen(String(property.id));
    }
  }, [property.id]);

  // Image source normalizer
  const getImageUrl = (imageInput: any) => {
    let url = '';

    if (!imageInput) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

    if (Array.isArray(imageInput) && imageInput.length > 0) {
      url = imageInput[0];
    } else if (typeof imageInput === 'string') {
      if (imageInput.startsWith('[') && imageInput.endsWith(']')) {
        try {
          const parsed = JSON.parse(imageInput);
          url = Array.isArray(parsed) ? parsed[0] : imageInput;
        } catch (e) {
          url = imageInput;
        }
      } else {
        url = imageInput;
      }
    }

    if (!url || url === '[]') return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

    if (url.startsWith('http')) {
      if (url.includes('localhost')) return url;
      return url.replace('http://', 'https://');
    }

    const apiUrl = getApiUrl()?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Safe images list
  const propertyImages = useMemo(() => {
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images.map(img => getImageUrl(img));
    }
    return ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'];
  }, [property.images]);

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev + 1) % propertyImages.length)
  }

  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length)
  }

  // Live EMI Math
  const emiDetails = useMemo(() => {
    const price = property.price || 0;
    const downPayment = (price * downPaymentPercent) / 100;
    const loanPrincipal = Math.max(0, price - downPayment);
    const monthlyRate = (interestRate / 12) / 100;
    const totalMonths = tenureYears * 12;

    let monthlyEmi = 0;
    if (monthlyRate === 0) {
      monthlyEmi = loanPrincipal / totalMonths;
    } else {
      monthlyEmi = (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalRepayment = monthlyEmi * totalMonths;
    const interestPayable = Math.max(0, totalRepayment - loanPrincipal);
    const principalPercent = totalRepayment > 0 ? (loanPrincipal / totalRepayment) * 100 : 0;
    const interestPercent = totalRepayment > 0 ? (interestPayable / totalRepayment) * 100 : 0;

    return {
      downPayment,
      loanPrincipal,
      monthlyEmi: isNaN(monthlyEmi) ? 0 : monthlyEmi,
      interestPayable: isNaN(interestPayable) ? 0 : interestPayable,
      totalRepayment: isNaN(totalRepayment) ? 0 : totalRepayment,
      principalPercent,
      interestPercent
    };
  }, [property.price, downPaymentPercent, interestRate, tenureYears]);

  // Quick message options
  const quickMessages = [
    "I'm interested in this property. Please contact me with details.",
    "I would like to schedule a site visit for this property.",
    "Can you share the documentation of this property?",
    "I want to enquire about price negotiation for this listing."
  ];

  // Inquiry Form Submit handler
  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    try {
      const msg = inquiryForm.message.trim() || selectedQuickMsg;
      await useInquiryStore.getState().addInquiry({
        propertyId: String(property.id),
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        message: msg,
        status: 'PENDING'
      })
      useUserActivityStore.getState().recordContacted(String(property.id))
      alert('Inquiry sent successfully!')
      setInquiryForm((prev) => ({
        name: contactLocked && user ? (user.name || prev.name) : '',
        email: contactLocked && user ? (user.email || prev.email) : '',
        phone: contactLocked && user ? (user.phone || prev.phone) : '',
        message: '',
      }))
      if (contactLocked) setSelectedQuickMsg(quickMessages[0])
    } catch (err) {
      alert('Failed to send inquiry. Please try again.')
    } finally {
      setSubmitted(false)
    }
  }

  // Copy shareable link
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  }

  const handleChatStart = () => {
    const sId = property.user?.id || property.userId
    if (String(user?.id) === String(sId)) {
      alert("You cannot chat with yourself on your own listing.");
      return;
    }

    if (!isAuthenticated || !user) {
      const currentPath = window.location.pathname
      const target = `${currentPath}?sellerId=${sId}&propertyId=${property.id}`
      router.push(`/login?redirect=${encodeURIComponent(target)}`)
      return
    }

    useChatBoxStore.getState().openChat(String(sId), String(property.id))
  }

  const floorPlanMeta = useMemo(
    () => (isResidentialFloorPlan(property) ? buildFloorPlanRooms(property) : null),
    [property]
  )

  const filteredTopCities = useMemo(() => {
    return topCities.filter(city =>
      city.toLowerCase().includes(citySearchQuery.toLowerCase())
    )
  }, [citySearchQuery])

  const filteredOtherCities = useMemo(() => {
    return otherCities.filter(city =>
      city.toLowerCase().includes(citySearchQuery.toLowerCase())
    )
  }, [citySearchQuery])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Properties search bar — same on phone & desktop (responsive website) */}
      <div className="flex bg-[#0a2540] text-white py-2 px-3 sm:px-4 md:px-6 flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-5 fixed top-0 left-0 right-0 z-50 shadow-md">

        {/* Logo and Location Selector */}
        <div className="flex items-center gap-2 sm:gap-4 md:border-r border-white/20 md:pr-4 shrink-0 pb-2 md:pb-0 border-b border-white/15 md:border-b-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-7 w-7 rounded overflow-hidden flex items-center justify-center bg-white shadow-sm">
              <img src={BRAND_LOGO_SRC} alt="Kanharaj Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-heading text-lg font-black tracking-tighter text-white flex items-baseline">
              KANHARAJ<span className="text-[9px] font-extrabold ml-0.5 opacity-85">.COM</span>
            </span>
          </Link>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <div className="relative city-dropdown-container">
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer hover:text-white/80 transition whitespace-nowrap max-w-[140px] sm:max-w-none truncate"
            >
              <MapPin className="w-4 h-4 opacity-80" />
              {property.listingType === 'RENT' ? 'Rent In' : 'Buy In'} {selectedCity || 'All Cities'}
              <ChevronDown className={cn("w-4 h-4 opacity-70 transition-transform", isCityDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isCityDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-[min(18rem,calc(100vw-1.5rem))] sm:w-72 max-h-[70vh] sm:max-h-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] flex flex-col overflow-hidden text-slate-800"
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
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full min-w-0 max-w-[800px] relative order-3 md:order-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0a2540]" />
          <Input
            placeholder="Enter Locality, Landmark, Project or builder"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border-0 text-slate-900 placeholder:text-slate-400 rounded-md h-[42px] pl-10 focus-visible:ring-0 shadow-inner w-full focus:outline-none"
          />
        </form>

        {/* Right Actions */}
        <div className="flex gap-2 sm:gap-4 items-center ml-auto shrink-0 flex-wrap">
          <a href="tel:+919599801767" className="text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded transition whitespace-nowrap">
            <Phone className="w-4 h-4" /> Contact
          </a>

          {showSellerDashboard && (
            <a href={sellerDashboardHref} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#00D289] hover:bg-[#00c07d] text-white font-bold rounded shadow-none h-9 px-5 whitespace-nowrap cursor-pointer">
                Dashboard
              </Button>
            </a>
          )}

          {/* Profile Menu Dropdown */}
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
                  <User className="w-4 h-4" />
                )}
              </div>
            </button>

            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl py-1.5 z-50 overflow-hidden text-slate-800">
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
          </div>
        </div>

      </div>

      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200 py-3 relative z-30 shadow-sm mt-12 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">

          {/* Breadcrumb Links */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#6B46C1] transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/properties" className="hover:text-[#6B46C1] transition-colors">Properties</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="hover:text-[#6B46C1] transition-colors uppercase">{property.propertyType}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-800 truncate max-w-[200px]">{property.title}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(prev => !prev)}
              className={cn("h-9 border-slate-200 hover:bg-slate-50 rounded-xl font-semibold", isFavorite ? "text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-50" : "text-slate-600")}
            >
              <Heart className={cn("h-4 w-4 mr-2", isFavorite ? "fill-current" : "")} />
              {isFavorite ? 'Saved' : 'Save Listing'}
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <AnimatePresence>
                {shareTooltip && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded font-bold whitespace-nowrap shadow-lg"
                  >
                    Link copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold hidden md:flex"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Main Title Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0 w-full">

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-700 font-bold border-none px-3 py-1 flex items-center gap-1 rounded-lg">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Agent Listing
                </Badge>
                {property.featured && (
                  <Badge className="bg-[#6B46C1]/10 hover:bg-[#6B46C1]/10 text-[#6B46C1] font-bold border-none px-3 py-1 flex items-center gap-1 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5" /> Featured Listing
                  </Badge>
                )}
                <Badge className="bg-indigo-100 hover:bg-indigo-100 text-indigo-700 font-bold border-none px-3 py-1 rounded-lg">
                  Vastu Compliant
                </Badge>
                <Badge className="bg-rose-100 hover:bg-rose-100 text-rose-700 font-bold border-none px-3 py-1 rounded-lg">
                  For {property.listingType === 'RENT' ? 'Rent' : 'Sale'}
                </Badge>
              </div>

              {/* Title & Location */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center text-slate-500 mt-2">
                <MapPin className="h-4 w-4 mr-1.5 text-rose-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-600">{property.address}, {property.city}, {property.state} - {property.pincode}</span>
              </div>

            </div>

            {/* Price Callout Box */}
            <div className="w-full sm:w-auto p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white min-w-[220px] shadow-md">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Expected Pricing</span>
              <div className="text-3xl font-black flex items-baseline">
                {formatPrice(property.price)}
                {property.listingType === 'RENT' && <span className="text-sm font-semibold text-slate-400 ml-1">/mo</span>}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Avg: ₹{(property.price / (property.area || 1)).toFixed(0)}/sq.ft{property.listingType === 'RENT' && '/mo'}</span>
                <span className="text-emerald-400 flex items-center"><Check className="w-3.5 h-3.5 mr-0.5" /> Zero Brokerage</span>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Tiled Media Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">

          {/* Main Large Image */}
          <div
            onClick={() => openLightbox(0)}
            className="md:col-span-2 relative aspect-[16/10] md:h-[450px] rounded-2xl overflow-hidden bg-slate-200 cursor-zoom-in group shadow-sm"
          >
            <Image
              src={propertyImages[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Secondary Stacked Images (Desktop) */}
          <div className="hidden md:flex flex-col gap-3 h-[450px]">
            {/* Small Image 1 */}
            <div
              onClick={() => openLightbox(1 % propertyImages.length)}
              className="relative flex-1 rounded-2xl overflow-hidden bg-slate-200 cursor-zoom-in group shadow-sm"
            >
              <Image
                src={propertyImages[1 % propertyImages.length]}
                alt={`${property.title} - View 2`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Small Image 2 / With Overlap count */}
            <div
              onClick={() => openLightbox(2 % propertyImages.length)}
              className="relative flex-1 rounded-2xl overflow-hidden bg-slate-200 cursor-zoom-in group shadow-sm"
            >
              <Image
                src={propertyImages[2 % propertyImages.length]}
                alt={`${property.title} - View 3`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center text-white" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none select-none">
                <span className="text-2xl font-black">+{propertyImages.length}</span>
                <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">View All Photos</span>
              </div>
            </div>
          </div>

        </div>

        {/* Two-Column Details & Contact layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT SECTION (Col Span 2) - Key details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Highlights bullet card */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Key Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { title: "Vastu Shastra Compliant", desc: "Designed according to layout alignments for positive energy flow." },
                  { title: "Zero Brokerage", desc: "No agent fees, buy or lease directly without middleman commission." },
                  { title: "Immediate Possession", desc: "The property is fully completed and ready for immediate moving." },
                  { title: "Excellent Locality Connect", desc: "Conveniently situated close to schools, hospitals, and subway metro." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                      <Check className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Structured Specifications Grid */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4">Specifications Table</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">

                {!isPlotOrLand && (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                      <Bed className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Bedrooms</span>
                      <span className="text-sm font-bold text-slate-800">{bedroomsVal}</span>
                    </div>
                  </div>
                )}

                {!isPlotOrLand && (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                      <Bath className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Bathrooms</span>
                      <span className="text-sm font-bold text-slate-800">{bathroomsVal}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Maximize className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">{areaLabel}</span>
                    <span className="text-sm font-bold text-slate-800">{areaVal}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Facing Direction</span>
                    <span className="text-sm font-bold text-slate-800">{facingVal}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Possession Status</span>
                    <span className="text-sm font-bold text-slate-800">{possessionVal}</span>
                  </div>
                </div>

                {!isPlotOrLand && (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Property Age</span>
                      <span className="text-sm font-bold text-slate-800">{ageVal}</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Extended specs table rows */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-sm font-semibold">
                  {!isPlotOrLand && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Floor Number</span>
                      <span className="text-slate-800">{highlights.floorDetails || '2nd of 4 floors'}</span>
                    </div>
                  )}
                  {!isPlotOrLand && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Furnishing Status</span>
                      <span className="text-slate-800">{highlights.furnishType || 'Semi-Furnished'}</span>
                    </div>
                  )}
                  {!isPlotOrLand && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Car Parking Space</span>
                      <span className="text-slate-800">
                        {highlights.coveredParking || highlights.openParking
                          ? `${highlights.coveredParking || '0'} Covered, ${highlights.openParking || '0'} Open`
                          : '1 Covered Parking'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Water Supply</span>
                    <span className="text-slate-800">24 Hours Guaranteed</span>
                  </div>
                  {highlights.transactionType && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Transaction Type</span>
                      <span className="text-slate-800">{highlights.transactionType}</span>
                    </div>
                  )}
                  {highlights.preferredTenant && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Preferred Tenant</span>
                      <span className="text-slate-800">
                        {(() => {
                          const val = highlights.preferredTenant.trim();
                          const lower = val.toLowerCase();
                          if (lower.includes("family") && lower.includes("bachelors") && lower.includes("company")) {
                            return "All (Family, Bachelors, Company)";
                          }
                          return val;
                        })()}
                      </span>
                    </div>
                  )}
                  {highlights.petFriendly && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Pet Friendly</span>
                      <span className="text-slate-800">{highlights.petFriendly}</span>
                    </div>
                  )}
                  {highlights.maintenanceCharges && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Maintenance Charges</span>
                      <span className="text-slate-800">{highlights.maintenanceCharges}</span>
                    </div>
                  )}
                  {highlights.parkingCharges && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Parking Charges</span>
                      <span className="text-slate-800">{highlights.parkingCharges}</span>
                    </div>
                  )}
                  {highlights.paintingCharges && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Painting Charges</span>
                      <span className="text-slate-800">{highlights.paintingCharges}</span>
                    </div>
                  )}
                  {highlights.securityDeposit && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Security Deposit</span>
                      <span className="text-slate-800">{highlights.securityDeposit}</span>
                    </div>
                  )}
                  {highlights.lockInPeriod && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Lock-in Period</span>
                      <span className="text-slate-800">{highlights.lockInPeriod}</span>
                    </div>
                  )}
                  {highlights.brokerageCharges && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Brokerage Charges</span>
                      <span className="text-slate-800">{highlights.brokerageCharges}</span>
                    </div>
                  )}
                  {highlights.servantRoom && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Servant Room</span>
                      <span className="text-slate-800">{highlights.servantRoom}</span>
                    </div>
                  )}
                  {highlights.reraId && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">RERA ID</span>
                      <span className="text-slate-800">{highlights.reraId}</span>
                    </div>
                  )}
                  {highlights.subPropertyType && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Commercial Subtype</span>
                      <span className="text-slate-800">{highlights.subPropertyType}</span>
                    </div>
                  )}
                  {highlights.zoneType && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Zone Type</span>
                      <span className="text-slate-800">{highlights.zoneType}</span>
                    </div>
                  )}
                  {highlights.locationHub && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Location Hub</span>
                      <span className="text-slate-800">{highlights.locationHub}</span>
                    </div>
                  )}
                  {highlights.propertyCondition && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Property Condition</span>
                      <span className="text-slate-800">{highlights.propertyCondition}</span>
                    </div>
                  )}
                  {highlights.electricityChargesIncluded && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Electricity Charges Included</span>
                      <span className="text-slate-800">{highlights.electricityChargesIncluded}</span>
                    </div>
                  )}
                  {highlights.waterChargesIncluded && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Water Charges Included</span>
                      <span className="text-slate-800">{highlights.waterChargesIncluded}</span>
                    </div>
                  )}
                  {highlights.expectedRentIncrease && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Expected Rent Increase</span>
                      <span className="text-slate-800">
                        {highlights.expectedRentIncrease}
                        {!highlights.expectedRentIncrease.includes('%') && /^\d+(\.\d+)?$/.test(highlights.expectedRentIncrease.trim()) && '%'}
                      </span>
                    </div>
                  )}
                  {highlights.dgUpsChargesIncluded && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">DG & UPS Charges Included</span>
                      <span className="text-slate-800">{highlights.dgUpsChargesIncluded}</span>
                    </div>
                  )}
                  {highlights.ownership && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Ownership</span>
                      <span className="text-slate-800">{highlights.ownership}</span>
                    </div>
                  )}
                  {highlights.priceNegotiable && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Price Negotiable</span>
                      <span className="text-slate-800">{highlights.priceNegotiable}</span>
                    </div>
                  )}
                  {highlights.flooring && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Flooring</span>
                      <span className="text-slate-800">{highlights.flooring}</span>
                    </div>
                  )}
                  {highlights.staircases && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Staircases</span>
                      <span className="text-slate-800">{highlights.staircases}</span>
                    </div>
                  )}
                  {highlights.passengerLifts && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Passenger Lifts</span>
                      <span className="text-slate-800">{highlights.passengerLifts}</span>
                    </div>
                  )}
                  {highlights.serviceLifts && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Service Lifts</span>
                      <span className="text-slate-800">{highlights.serviceLifts}</span>
                    </div>
                  )}
                  {highlights.privateParking && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Private Parking</span>
                      <span className="text-slate-800">{highlights.privateParking}</span>
                    </div>
                  )}
                  {highlights.publicParking && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Public Parking</span>
                      <span className="text-slate-800">{highlights.publicParking}</span>
                    </div>
                  )}
                  {highlights.builtUpArea && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Built Up Area</span>
                      <span className="text-slate-800">{highlights.builtUpArea}</span>
                    </div>
                  )}
                  {highlights.constructionStatus && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Construction Status</span>
                      <span className="text-slate-800">{highlights.constructionStatus}</span>
                    </div>
                  )}
                  {highlights.pgName && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">PG Name</span>
                      <span className="text-slate-800">{highlights.pgName}</span>
                    </div>
                  )}
                  {highlights.locality && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Locality</span>
                      <span className="text-slate-800">{highlights.locality}</span>
                    </div>
                  )}
                  {highlights.totalBeds && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Total Beds</span>
                      <span className="text-slate-800">{highlights.totalBeds}</span>
                    </div>
                  )}
                  {highlights.pgFor && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">PG is for</span>
                      <span className="text-slate-800">{highlights.pgFor}</span>
                    </div>
                  )}
                  {highlights.bestSuitedFor && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Best Suited For</span>
                      <span className="text-slate-800">{highlights.bestSuitedFor}</span>
                    </div>
                  )}
                  {highlights.mealsAvailable && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Meals Available</span>
                      <span className="text-slate-800">{highlights.mealsAvailable}</span>
                    </div>
                  )}
                  {highlights.noticePeriod && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Notice Period</span>
                      <span className="text-slate-800">{highlights.noticePeriod}</span>
                    </div>
                  )}
                  {highlights.lockInPeriod && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Lock-in Period</span>
                      <span className="text-slate-800">{highlights.lockInPeriod}</span>
                    </div>
                  )}
                  {highlights.commonAreas && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Common Areas</span>
                      <span className="text-slate-800">{highlights.commonAreas}</span>
                    </div>
                  )}
                  {highlights.managedBy && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Managed By</span>
                      <span className="text-slate-800">{highlights.managedBy}</span>
                    </div>
                  )}
                  {highlights.managerStaysAtProperty && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Manager Stays At Property</span>
                      <span className="text-slate-800">{highlights.managerStaysAtProperty}</span>
                    </div>
                  )}
                  {highlights.nonVegAllowed && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Non-Veg Allowed</span>
                      <span className="text-slate-800">{highlights.nonVegAllowed}</span>
                    </div>
                  )}
                  {highlights.oppositeSexAllowed && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Opposite Sex Allowed</span>
                      <span className="text-slate-800">{highlights.oppositeSexAllowed}</span>
                    </div>
                  )}
                  {highlights.anyTimeAllowed && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Any Time Allowed</span>
                      <span className="text-slate-800">{highlights.anyTimeAllowed}</span>
                    </div>
                  )}
                  {highlights.visitorsAllowed && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Visitors Allowed</span>
                      <span className="text-slate-800">{highlights.visitorsAllowed}</span>
                    </div>
                  )}
                  {highlights.guardianAllowed && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Guardian Allowed</span>
                      <span className="text-slate-800">{highlights.guardianAllowed}</span>
                    </div>
                  )}
                  {highlights.drinkingAllowed && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Drinking Allowed</span>
                      <span className="text-slate-800">{highlights.drinkingAllowed}</span>
                    </div>
                  )}
                  {highlights.smokingAllowed && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Smoking Allowed</span>
                      <span className="text-slate-800">{highlights.smokingAllowed}</span>
                    </div>
                  )}
                  {highlights.onetimeMoveInCharges && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Onetime Move-in Charges</span>
                      <span className="text-slate-800">{highlights.onetimeMoveInCharges}</span>
                    </div>
                  )}
                  {highlights.mealCharges && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Meal Charges</span>
                      <span className="text-slate-800">{highlights.mealCharges}</span>
                    </div>
                  )}
                  {highlights.electricityCharges && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Electricity Charges</span>
                      <span className="text-slate-800">{highlights.electricityCharges}</span>
                    </div>
                  )}
                  {highlights.balconies && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Balconies</span>
                      <span className="text-slate-800">{highlights.balconies}</span>
                    </div>
                  )}
                  {highlights.furnishings && highlights.furnishings.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-slate-100 md:col-span-2">
                      <span className="text-slate-500">Furnishings Included</span>
                      <span className="text-slate-800">{highlights.furnishings.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Room Configurations Card */}
            {roomsList.length > 0 && (
              <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Bed className="h-5 w-5 text-indigo-600" />
                  Room Configurations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomsList.map((room, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-all hover:shadow-md hover:border-slate-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Badge className="bg-indigo-100 hover:bg-indigo-100 text-indigo-700 font-bold border-none px-3 py-1 rounded-lg">
                            {room.roomType}
                          </Badge>
                          {room.totalBeds && (
                            <span className="text-xs text-slate-500 font-bold ml-2">
                              {room.totalBeds} Bed{parseInt(room.totalBeds) > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 bg-white p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Rent</span>
                          <span className="text-base font-black text-slate-800">{formatPrice(parseFloat(room.rent))}</span>
                          <span className="text-[10px] text-slate-400 font-bold">/month</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Security Deposit</span>
                          <span className="text-base font-black text-slate-800">{formatPrice(parseFloat(room.securityDeposit))}</span>
                        </div>
                      </div>

                      {room.facilities && room.facilities.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Facilities Offered</span>
                          <div className="flex flex-wrap gap-1.5">
                            {room.facilities.map((fac) => (
                              <Badge key={fac} variant="outline" className="text-[10px] font-bold text-slate-600 border-slate-200 bg-white">
                                {fac}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Description Tab area */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-3">Property Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                {cleanDescription || "No description provided for this listing."}
              </p>
            </Card>

            {/* Categorized Amenities section */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Amenities list
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-slate-500 font-medium py-4">No amenities listed for this property.</p>
                )}
              </div>
            </Card>

            {/* Locality — real map + nearby places from OpenStreetMap */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <PropertyLocalityMap property={property} />
            </Card>

            {/* Collapsible Accordion FAQs */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4">Frequently Asked Questions</h2>

              <div className="space-y-2">
                {[
                  { q: "Is the price negotiable for this listing?", a: "Prices are based on builder estimates, but there is always minor scope for discussion during face-to-face meetings depending on downpayment capabilities." },
                  { q: "Are there any brokerage/agency commission charges?", a: "This property is listed directly with zero brokerage fee requirements. You pay exactly the property price shown." },
                  { q: "Is the documentation verified and registry clean?", a: "Yes, all registry documents, property title deeds, and tax clearances have been verified. The property has a clean record." },
                  { q: "What amenities are available within the society complex?", a: "The complex is equipped with 24/7 CCTV surveillance, a passenger lift, power backup generator, dedicated parking slots, and round-the-clock water supply." }
                ].map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-700 hover:text-[#6B46C1] transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isOpen ? "rotate-180 text-[#6B46C1]" : "text-slate-400")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 pt-0 text-xs font-medium text-slate-500 leading-relaxed border-t border-slate-100 bg-white">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>

          {/* RIGHT SIDEBAR (Col Span 1) - Contact form & Agent details */}
          <div className="space-y-6 lg:sticky lg:top-24">

            {/* Inquiry Send card */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h3 className="text-lg font-black text-slate-900 mb-1">Send Property Inquiry</h3>
              {contactLocked && (
                <p className="text-[11px] text-emerald-700 font-semibold mb-4 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  Logged in as {user?.name} — your details are filled. Pick a message (optional) and tap Request Callback.
                </p>
              )}
              {!contactLocked && (
                <p className="text-xs text-slate-500 font-medium mb-4">
                  <Link href="/login" className="text-[#6B46C1] font-bold hover:underline">Log in</Link> to auto-fill your name, email and phone.
                </p>
              )}

              <form onSubmit={handleInquiry} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={inquiryForm.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    readOnly={contactLocked}
                    required
                    className={cn(
                      "bg-slate-50/50 border-slate-200 focus-visible:ring-[#6B46C1] rounded-xl h-10 mt-1",
                      contactLocked && "bg-slate-100 cursor-default text-slate-700"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    placeholder="Enter your email"
                    value={inquiryForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    readOnly={contactLocked}
                    required
                    className={cn(
                      "bg-slate-50/50 border-slate-200 focus-visible:ring-[#6B46C1] rounded-xl h-10 mt-1",
                      contactLocked && "bg-slate-100 cursor-default text-slate-700"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Mobile Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    placeholder="Your mobile number"
                    value={inquiryForm.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    readOnly={contactLocked}
                    required
                    className={cn(
                      "bg-slate-50/50 border-slate-200 focus-visible:ring-[#6B46C1] rounded-xl h-10 mt-1",
                      contactLocked && "bg-slate-100 cursor-default text-slate-700"
                    )}
                  />
                </div>

                {/* Quick Message Options */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block">Quick Message template</span>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                    {quickMessages.map((msg, idx) => {
                      const isSelected = selectedQuickMsg === msg;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedQuickMsg(msg);
                            setInquiryForm(prev => ({ ...prev, message: '' }));
                          }}
                          className={cn("w-full text-left p-2.5 rounded-lg border text-xs font-semibold transition-all leading-snug",
                            isSelected ? "border-[#6B46C1] bg-[#6B46C1]/5 text-[#6B46C1]" : "border-slate-100 hover:bg-slate-50 text-slate-500")}
                        >
                          {msg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom message textarea */}
                <div>
                  <Label htmlFor="message" className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Custom Message (Optional)</Label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={inquiryForm.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setInquiryForm({ ...inquiryForm, message: e.target.value });
                      setSelectedQuickMsg(""); // clear selected quick message
                    }}
                    placeholder="Type details if any..."
                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B46C1] focus:border-[#6B46C1] mt-1"
                  />
                </div>

                <Button type="submit" disabled={submitted} className="w-full h-11 bg-[#6B46C1] hover:bg-[#5A38A7] text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10">
                  <Mail className="h-4.5 w-4.5 mr-2" />
                  Request Callback
                </Button>
              </form>
            </Card>

            {/* Listed by seller */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-4">Listed By</span>

              <div className="flex items-center gap-4.5">
                {property.user?.profileImage ? (
                  <img
                    src={property.user.profileImage}
                    alt={property.user.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                    {(property.user?.name || 'K').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                    {property.user?.name || 'Kanharaj Seller'}
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </h4>
                  {property.user?.experienceYears && (
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{property.user.experienceYears} experience</p>
                  )}
                  {property.user?.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{property.user.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex gap-3">
                  <a
                    href={`tel:+91${(property.user?.phone || SUPPORT_PHONE).replace(/\D/g, '')}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5">
                      <Phone className="w-4 h-4 text-rose-500" /> Call Owner
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/91${(property.user?.phone || SUPPORT_PHONE).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5">
                      <MessageCircle className="w-4.5 h-4.5" /> WhatsApp
                    </Button>
                  </a>
                </div>
                <Button
                  onClick={handleChatStart}
                  className="w-full h-11 bg-[#6B46C1] hover:bg-[#5A38A7] text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4.5 h-4.5" /> Chat with Owner
                </Button>
              </div>
            </Card>

          </div>

        </div>

      </div>

      {/* Full screen photo Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex flex-col justify-between p-4"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between text-white p-3 z-10">
              <span className="text-sm font-bold">{lightboxIndex + 1} / {propertyImages.length}</span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Image Viewport */}
            <div className="relative flex-1 flex items-center justify-center px-4 md:px-12 select-none">

              {/* Prev Button */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Central Image */}
              <div className="relative w-full h-[65vh] max-w-4xl">
                <Image
                  src={propertyImages[lightboxIndex]}
                  alt={`${property.title} - Fullscreen View ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextLightbox}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

            </div>

            {/* Horizontal Lightbox Thumbnails */}
            <div className="flex gap-2.5 overflow-x-auto justify-center pb-4 px-4 py-2 border-t border-white/10 no-scrollbar">
              {propertyImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={cn(
                    "relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all",
                    lightboxIndex === idx ? 'ring-2 ring-[#6B46C1] scale-105' : 'opacity-50'
                  )}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Call Actions bar */}
      <div className="fixed bottom-mobile-nav left-0 right-0 z-40 bg-white border-t border-slate-200 p-3.5 pb-safe block lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-700 text-xs px-2" onClick={() => window.location.href = `tel:+91${(property.user?.phone || SUPPORT_PHONE).replace(/\D/g, '')}`}>
            <Phone className="h-4.5 w-4.5 mr-1 text-rose-500" />
            CALL
          </Button>
          <Button className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-2" onClick={() => window.location.href = `https://wa.me/91${(property.user?.phone || SUPPORT_PHONE).replace(/\D/g, '')}`}>
            <MessageCircle className="h-4.5 w-4.5 mr-1" />
            WHATSAPP
          </Button>
          <Button className="flex-1 h-12 rounded-xl bg-[#6B46C1] hover:bg-[#5A38A7] text-white font-bold text-xs px-2" onClick={handleChatStart}>
            <MessageCircle className="h-4.5 w-4.5 mr-1" />
            CHAT
          </Button>
        </div>
      </div>

    </div>
  )
}
