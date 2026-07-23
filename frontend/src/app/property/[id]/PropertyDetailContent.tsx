"use client"

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bed, Bath, Maximize, MapPin, Calendar, Phone, Mail, Heart, Share2, Home,
  ChevronLeft, ChevronRight, Check, MessageCircle, MessageSquare, ArrowLeft, Building2,
  ShieldAlert, ShieldCheck, Info, Sparkles, AlertCircle, Compass, Star,
  X, Printer, DollarSign, Download, School, Activity, Shield, ArrowUpDown,
  ChevronDown, Search, Menu, User, LogOut, IndianRupee, FileText,
  Video, Lock, Flame, Dumbbell, Waves, Trophy, Footprints, Target, Gamepad2,
  Zap, Car, Droplets, Settings, Trash2, Users, Trees, Play, Wifi, Coffee,
  BookOpen, CloudRain, Sun, ShoppingBag, Briefcase, Smile, Landmark, Fingerprint, Tv, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { formatPrice, formatNumber, cn, BRAND_LOGO_SRC, hasSellerDashboardAccess, getSellerUrl, getApiUrl } from '@/lib/utils'
import { useInquiryStore, useAuthStore, usePropertyStore } from '@/lib/store'
import { useUserActivityStore } from '@/lib/user-activity-store'
import { useChatBoxStore } from '@/lib/chat-box-store'
import { Property } from '@/lib/data'
import { FloorPlanSchematic } from '@/components/properties/floor-plan-schematic'
import { PropertyLocalityMap } from '@/components/properties/property-locality-map'
import PdfViewer from '@/components/properties/pdf-viewer'
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

const amenityIconMap: Record<string, any> = {
  // Security & Safety
  "cctv surveillance": Video,
  "gated community": Lock,
  "24x7 security guard": Shield,
  "security": Shield,
  "fire fighting system": Flame,
  "intercom facility": Phone,
  "video door phone": Tv,
  "biometric access control": Fingerprint,
  
  // Sports & Fitness
  "gymnasium": Dumbbell,
  "gym": Dumbbell,
  "swimming pool": Waves,
  "pool": Waves,
  "kids play area": Trophy,
  "play area": Trophy,
  "jogging & cycling track": Footprints,
  "badminton / tennis court": Target,
  "tennis court": Target,
  "badminton court": Target,
  "cricket ground": Target,
  "indoor games room": Gamepad2,
  "skating rink": Sparkles,
  "sauna": Flame,
  "steam room": Flame,

  // Infrastructure & Utilities
  "high-speed lifts": Building2,
  "lift": Building2,
  "100% power backup": Zap,
  "power backup": Zap,
  "reserved car parking": Car,
  "visitor parking": Car,
  "parking": Car,
  "24x7 water supply": Droplets,
  "water storage tank": Droplets,
  "piped gas system": Flame,
  "sewage treatment plant": Settings,
  "waste disposal system": Trash2,

  // Leisure & Community
  "clubhouse / community hall": Users,
  "club house": Users,
  "landscape garden / park": Trees,
  "garden": Trees,
  "senior citizen area": Heart,
  "amphitheatre": Sparkles,
  "mini theatre": Play,
  "wi-fi connectivity": Wifi,
  "cafeteria / food court": Coffee,
  "library / study lounge": BookOpen,

  // Eco & Green Energy
  "rain water harvesting": CloudRain,
  "solar lighting system": Sun,
  "vastu compliant": Compass,
  "eco friendly green zone": Trees,

  // Convenience & Business
  "in-house shopping center": ShoppingBag,
  "conference room / lounge": Briefcase,
  "daycare / crèche": Smile,
  "atm facility": Landmark
}

function getAmenityIcon(name: string) {
  const normalized = name.trim().toLowerCase();
  return amenityIconMap[normalized] || Check;
}

interface PropertyDetailContentProps {
  property: Property
}

export default function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  const isPlotOrLand = property.propertyType?.toUpperCase() === 'PLOT' || property.propertyType?.toUpperCase() === 'PLOTS/LAND'
  const isCommercial = property.propertyType?.toUpperCase() === 'OFFICE_SPACE' ||
    property.propertyType?.toUpperCase() === 'SHOP' ||
    property.propertyType?.toUpperCase() === 'COMMERCIAL'
  const isProject = property.propertyType?.toUpperCase() === 'RESIDENTIAL_PROJECT' ||
    property.propertyType?.toUpperCase() === 'COMMERCIAL_PROJECT' ||
    property.propertyType?.toUpperCase() === 'RESIDENTIAL PROJECT' ||
    property.propertyType?.toUpperCase() === 'COMMERCIAL PROJECT'

  const formatDateLabel = (dateStr: string | undefined | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (!isNaN(date.getTime()) && dateStr.includes('-')) {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    return dateStr
  }

  // Image gallery states
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Custom states
  const [isFavorite, setIsFavorite] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [shareTooltip, setShareTooltip] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [isBrochureDownloading, setIsBrochureDownloading] = useState(false)

  // Download brochure as blob to force real file download
  const handleBrochureDownload = async () => {
    if (!property.brochureUrl || isBrochureDownloading) return
    const url = property.brochureUrl.startsWith('http')
      ? property.brochureUrl
      : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`
    setIsBrochureDownloading(true)
    try {
      const response = await fetch(url, { mode: 'cors' })
      if (!response.ok) throw new Error('Fetch failed')
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      const safeName = property.title
        ? property.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : 'brochure'
      link.download = `${safeName}_brochure.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
    } catch (err) {
      console.warn('Blob download failed, opening in new tab:', err)
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setIsBrochureDownloading(false)
    }
  }
  
  // Project units list
  const [projectUnits, setProjectUnits] = useState<Property[]>([])
  useEffect(() => {
    if (isProject && property.id) {
      const fetchUnits = async () => {
        try {
          const apiUrl = getApiUrl() || ''
          const res = await fetch(`${apiUrl}/properties/project/${property.id}`)
          if (res.ok) {
            const data = await res.json()
            setProjectUnits(data.content || data || [])
          }
        } catch (e) {
          console.error("Failed to load project units:", e)
        }
      }
      fetchUnits()
    }
  }, [isProject, property.id])
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
  
  // Derived metadata display values
  const bedroomsVal = (isPlotOrLand || isCommercial || isProject) ? null : (highlights.bhk || (property.bedrooms ? `${property.bedrooms} BHK` : '3 BHK'))
  const bathroomsVal = (isPlotOrLand || isCommercial || isProject) ? null : (highlights.bathrooms ? `${highlights.bathrooms} Baths` : (property.bathrooms ? `${property.bathrooms} Baths` : '3 Baths'))
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

    if (!imageInput) return '';

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

    if (!url || url === '[]') return '';

    if (url.startsWith('http')) {
      if (url.includes('localhost')) return url;
      return url.replace('http://', 'https://');
    }

    const apiUrl = getApiUrl()?.replace(/\/api$/, '') || '';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isPdfFile = (url: string): boolean => {
    const cleanUrl = url.trim().toLowerCase();
    return cleanUrl.endsWith('.pdf') || 
           cleanUrl.includes('/raw/upload/') || 
           cleanUrl.includes('.pdf?');
  };

  const getBrochureViewerUrl = (url: string): string => {
    const absoluteUrl = url.startsWith('http')
      ? url
      : `${getApiUrl().replace(/\/api$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;

    if (isPdfFile(absoluteUrl)) {
      if (absoluteUrl.includes('localhost') || absoluteUrl.includes('127.0.0.1') || absoluteUrl.includes('192.168.')) {
        return `${absoluteUrl}#toolbar=0&navpanes=0`;
      }
      return `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    }
    return absoluteUrl;
  };

  // Safe images list
  const propertyImages = useMemo(() => {
    let list = Array.isArray(property.images) ? property.images : [];
    if (property.brochureUrl) {
      const bUrl = property.brochureUrl.trim().toLowerCase();
      list = list.filter(img => {
        if (!img) return false;
        const iUrl = img.trim().toLowerCase();
        return iUrl !== bUrl && 
               !iUrl.endsWith(bUrl) && 
               !bUrl.endsWith(iUrl);
      });
    }
    if (list.length > 0) {
      return list.map(img => getImageUrl(img));
    }
    return ['/placeholder.png'];
  }, [property.images, property.brochureUrl]);

  // Store properties for similar comparison
  const { properties: storeProperties, fetchProperties } = usePropertyStore()

  useEffect(() => {
    if (storeProperties.length === 0) {
      fetchProperties(50)
    }
  }, [storeProperties.length, fetchProperties])

  // Get similar properties for dynamic comparison
  const similarProperties = useMemo(() => {
    if (!storeProperties || storeProperties.length === 0) return []

    const currentId = String(property.id)
    const currentListingType = (property.listingType || 'SALE').toUpperCase()
    const currentType = (property.propertyType || '').toLowerCase().replace(/_/g, ' ')
    const isPlot = currentType.includes('plot') || currentType.includes('land')
    const isCommercial = currentType.includes('commercial') || currentType.includes('office') || currentType.includes('shop')
    const isHouse = currentType.includes('house') || currentType.includes('villa') || currentType.includes('floor')

    // Filter properties matching category & listingType
    let matches = storeProperties.filter(p => {
      if (String(p.id) === currentId) return false
      const pListingType = (p.listingType || 'SALE').toUpperCase()
      if (pListingType !== currentListingType) return false

      const pType = (p.propertyType || '').toLowerCase().replace(/_/g, ' ')
      if (isPlot) return pType.includes('plot') || pType.includes('land')
      if (isCommercial) return pType.includes('commercial') || pType.includes('office') || pType.includes('shop')
      if (isHouse) return pType.includes('house') || pType.includes('villa') || pType.includes('floor')
      return !pType.includes('plot') && !pType.includes('land') && !pType.includes('commercial')
    })

    if (matches.length < 3) {
      const fallbackMatches = storeProperties.filter(p => String(p.id) !== currentId && (p.listingType || 'SALE').toUpperCase() === currentListingType)
      const existingIds = new Set(matches.map(m => m.id))
      for (const f of fallbackMatches) {
        if (!existingIds.has(f.id)) {
          matches.push(f)
          if (matches.length >= 6) break
        }
      }
    }

    return matches.slice(0, 6)
  }, [storeProperties, property])

  const getCompareTitle = () => {
    const pType = (property.propertyType || '').toLowerCase().replace(/_/g, ' ')
    const isRent = property.listingType === 'RENT'
    const suffix = isRent ? 'for Rent' : 'for Sale'

    if (pType.includes('plot') || pType.includes('land')) {
      return `Compare with Similar Plots ${suffix}`
    } else if (pType.includes('house') || pType.includes('villa') || pType.includes('floor')) {
      return `Compare with Similar Houses ${suffix}`
    } else if (pType.includes('commercial') || pType.includes('office') || pType.includes('shop')) {
      return `Compare with Similar Commercial Properties ${suffix}`
    } else {
      return `Compare with Similar Flats ${suffix}`
    }
  }

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

  // Share property using Web Share API or copy link fallback
  const copyShareLink = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = {
      title: property.title || 'Property Details',
      text: property.title ? `${property.title} - Kanharaj Property` : 'Check out this property',
      url: currentUrl,
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      }
    }

    // Fallback: Copy link to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentUrl)
        setShareTooltip(true)
        setTimeout(() => setShareTooltip(false), 2000)
      } catch (err) {
        console.error('Failed to copy link', err)
      }
    }
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

    useChatBoxStore.getState().openChat(String(sId), String(property.id), {
      sellerName: property.user?.name || `Owner #${String(sId).slice(0, 4)}`,
      sellerPhone: property.user?.phone || '',
      sellerProfileImage: property.user?.profileImage || '',
      propertyTitle: property.title,
      propertyPrice: property.price,
      propertyImage: (property.images && property.images.length > 0) ? property.images[0] : ''
    })
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

  // Mobile swipe carousel handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentImageIndex(prev => (prev + 1) % propertyImages.length)
      else setCurrentImageIndex(prev => (prev - 1 + propertyImages.length) % propertyImages.length)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Properties search bar — desktop only (mobile uses image carousel back button) */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[#0a2540] text-white py-2 px-3 sm:px-4 md:px-6 shadow-md">
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
                  {property.listingType === 'RENT' ? 'Rent In' : 'Buy In'} {selectedCity || 'All Cities'}
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
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-[800px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0a2540]" />
            <Input
              placeholder="Enter Locality, Landmark, Project or builder"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-0 text-slate-900 placeholder:text-slate-400 rounded-md h-[40px] pl-10 focus-visible:ring-0 shadow-inner w-full text-xs sm:text-sm focus:outline-none"
            />
          </form>

          {/* Desktop Right Actions: Dashboard & Profile Menu (Hidden on Mobile) */}
          <div className="hidden md:flex gap-2 sm:gap-4 items-center ml-auto shrink-0 flex-nowrap">
            {showSellerDashboard && (
              <a href={sellerDashboardHref} target={typeof window !== 'undefined' && ((window as any).Capacitor || window.innerWidth < 1024) ? '_self' : '_blank'} rel="noopener noreferrer">
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

      {/* ===== MOBILE HOUSING.COM STYLE LAYOUT ===== */}
      <div className="block md:hidden -mt-[60px]">

        {/* Mobile Full-Screen Image Carousel */}
        <div
          className="relative w-full bg-black overflow-hidden"
          style={{ height: '85vw', maxHeight: '420px' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {propertyImages.map((img, idx) => (
            <div
              key={idx}
              className={cn(
                'absolute inset-0 transition-opacity duration-300',
                currentImageIndex === idx ? 'opacity-100' : 'opacity-0'
              )}
              onClick={() => openLightbox(idx)}
            >
              <Image src={img} alt={`${property.title} photo ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
            </div>
          ))}

          {/* Overlay: Back + Heart + Share at top */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
              <ArrowLeft className="h-4 w-4 text-slate-800" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(prev => !prev)}
                className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
              >
                <Heart className={cn('h-4 w-4', isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-700')} />
              </button>
              <div className="relative">
                <button onClick={copyShareLink} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                  <Share2 className="h-4 w-4 text-slate-700" />
                </button>
                <AnimatePresence>
                  {shareTooltip && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute right-0 top-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap shadow-lg"
                    >
                      Link copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom overlay: agent info + count */}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/60 to-transparent z-10 flex items-end justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#dfa127] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                {(property.user?.name || 'K').charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-[10px] font-semibold">
                by {property.user?.name || 'Kanharaj'}
              </span>
            </div>
            <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-full">
              📷 {propertyImages.length} | 🎬 0
            </span>
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {propertyImages.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  currentImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                )}
              />
            ))}
          </div>
        </div>

        {/* Mobile Content Card - Housing.com style */}
        <div className="bg-white rounded-t-3xl -mt-4 relative z-10 pb-32">

          {/* Verified + info row */}
          <div className="px-4 pt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Price */}
          <div className="px-4 pt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{formatPrice(property.price)}</span>
              {property.listingType === 'RENT' && <span className="text-sm text-slate-500 font-semibold">/month</span>}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Negotiable, No Brokerage,{' '}
              <span className="text-blue-600 font-bold cursor-pointer">See Price Details ›</span>
            </p>
          </div>

          {/* Tags (Ready to Move, etc) */}
          <div className="px-4 pt-3 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-600 border border-slate-300 px-3 py-1 rounded-full">
              {possessionVal}
            </span>
            {bedroomsVal && (
              <span className="text-xs font-semibold text-slate-600 border border-slate-300 px-3 py-1 rounded-full">
                {bedroomsVal}
              </span>
            )}
            {areaVal !== 'N/A' && (
              <span className="text-xs font-semibold text-slate-600 border border-slate-300 px-3 py-1 rounded-full">
                {areaVal}
              </span>
            )}
          </div>

          {/* Amenities as checklist — Housing.com style */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="px-4 pt-4 space-y-2.5">
              {(showAllAmenities ? property.amenities : property.amenities.slice(0, 5)).map((amenity) => (
                <div key={amenity} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{amenity}</span>
                </div>
              ))}
              {property.amenities.length > 5 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="text-xs font-bold text-blue-600 mt-1"
                >
                  {showAllAmenities ? 'Show less' : `+${property.amenities.length - 5} more amenities`}
                </button>
              )}
            </div>
          )}

          {/* Social proof */}
          <div className="mx-4 mt-4 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
            <div className="w-5 h-5 rounded-full bg-[#dfa127] flex items-center justify-center text-white text-[9px] font-black shrink-0">
              {(property.user?.name || 'K').charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {((Number(property.id) % 5) + 2)} people already contacted yesterday
            </span>
          </div>

          {/* Address */}
          <div className="px-4 pt-3 flex items-start gap-1.5">
            <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-slate-600">{property.address}, {property.city}, {property.state}</span>
          </div>

          {/* Divider */}
          <div className="h-2 bg-slate-100 mt-5" />

          {/* Complete Specifications & Details Table */}
          <div className="px-4 py-4">
            <h2 className="text-sm font-black text-slate-900 mb-3">Complete Property Specifications</h2>
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {bedroomsVal && (
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Bedrooms</div>
                    <div className="text-xs font-bold text-slate-800">{bedroomsVal}</div>
                  </div>
                </div>
              )}
              {bathroomsVal && (
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Bathrooms</div>
                    <div className="text-xs font-bold text-slate-800">{bathroomsVal}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{areaLabel}</div>
                  <div className="text-xs font-bold text-slate-800">{areaVal}</div>
                </div>
              </div>
              {highlights.carpetArea && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Carpet Area</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.carpetArea}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Facing</div>
                  <div className="text-xs font-bold text-slate-800">{facingVal}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Possession</div>
                  <div className="text-xs font-bold text-slate-800">{possessionVal}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Property Age</div>
                  <div className="text-xs font-bold text-slate-800">{ageVal}</div>
                </div>
              </div>
              {highlights.furnishType && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Furnishing</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.furnishType}</div>
                  </div>
                </div>
              )}
              {highlights.balconies && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Balconies</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.balconies}</div>
                  </div>
                </div>
              )}
              {highlights.floorDetails && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Floor Details</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.floorDetails}</div>
                  </div>
                </div>
              )}
              {highlights.coveredParking && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Covered Parking</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.coveredParking}</div>
                  </div>
                </div>
              )}
              {highlights.openParking && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Open Parking</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.openParking}</div>
                  </div>
                </div>
              )}
              {highlights.preferredTenant && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Preferred Tenant</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.preferredTenant}</div>
                  </div>
                </div>
              )}
              {highlights.securityDeposit && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Security Deposit</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.securityDeposit}</div>
                  </div>
                </div>
              )}
              {highlights.maintenanceCharges && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Maintenance</div>
                    <div className="text-xs font-bold text-slate-800">{highlights.maintenanceCharges}</div>
                  </div>
                </div>
              )}
              {(property.reraId || highlights.reraId) && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">RERA ID</div>
                    <div className="text-xs font-bold text-slate-800">{property.reraId || highlights.reraId}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {cleanDescription && (
            <div className="px-4 py-4 border-t border-slate-100">
              <h2 className="text-sm font-black text-slate-900 mb-2">Property Description</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {cleanDescription}
              </p>
            </div>
          )}

          {/* Floor Plan Schematics */}
          <div className="px-4 py-4 border-t border-slate-100">
            <h2 className="text-sm font-black text-slate-900 mb-3">Floor Plan & Layout Schematics</h2>
            <FloorPlanSchematic property={property} />
          </div>

          {/* Locality Map & Trends */}
          <div className="px-4 py-4 border-t border-slate-100">
            <h2 className="text-sm font-black text-slate-900 mb-3">Locality Map & Surrounding Highlights</h2>
            <PropertyLocalityMap property={property} />
          </div>

          {/* PDF Brochure Download */}
          {property.brochureUrl && (
            <div className="px-4 py-4 border-t border-slate-100">
              <h2 className="text-sm font-black text-slate-900 mb-2">Property Brochure</h2>
              <PdfViewer
                pdfUrl={property.brochureUrl.startsWith('http') ? property.brochureUrl : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`}
                title={property.title}
              />
            </div>
          )}



          {/* Request Callback / Inquiry Form */}
          <div className="px-4 py-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-black text-slate-900 mb-1">Request Callback</h3>
              <p className="text-[11px] text-slate-500 font-medium mb-3">Send your contact info directly to the property owner.</p>
              <form onSubmit={handleInquiry} className="space-y-3">
                <Input
                  name="name"
                  placeholder="Full Name"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  readOnly={contactLocked}
                  required
                  className="bg-white border-slate-200 text-xs h-9 rounded-lg"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  readOnly={contactLocked}
                  required
                  className="bg-white border-slate-200 text-xs h-9 rounded-lg"
                />
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Mobile Number"
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  readOnly={contactLocked}
                  required
                  className="bg-white border-slate-200 text-xs h-9 rounded-lg"
                />
                <Button type="submit" disabled={submitted} className="w-full h-10 bg-[#6B46C1] text-white font-bold rounded-xl text-xs">
                  <Mail className="h-3.5 w-3.5 mr-1.5" /> Request Callback
                </Button>
              </form>
            </div>
          </div>

          {/* Dynamic Compare with Similar Properties (Mobile View) */}
          {similarProperties && similarProperties.length > 0 && (
            <div className="px-4 py-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <ArrowUpDown className="w-4 h-4 text-[#6B46C1]" />
                  {getCompareTitle()}
                </h3>
              </div>
              <div className="space-y-3">
                {similarProperties.map((simProp) => {
                  const simImage = getImageUrl(simProp.images);
                  const pricePerSqFt = simProp.area > 0 ? Math.round(simProp.price / simProp.area) : null;

                  return (
                    <div
                      key={simProp.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 items-center justify-between"
                    >
                      <img src={simImage} alt={simProp.title} className="w-16 h-16 rounded-lg object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">{simProp.title}</div>
                        <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                          {formatPrice(simProp.price)}
                          {simProp.listingType === 'RENT' && <span className="text-[10px] text-slate-500 font-normal">/mo</span>}
                          {pricePerSqFt && <span className="text-[9px] text-slate-400 font-semibold ml-1.5">({pricePerSqFt}/sq.ft)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                          <span>{simProp.address}, {simProp.city}</span>
                        </div>
                      </div>
                      <Link href={`/property/${simProp.id}`} className="shrink-0">
                        <Button size="sm" className="h-8 bg-[#6B46C1] hover:bg-[#5A38A7] text-white text-[10px] font-bold px-2.5 rounded-lg">
                          Compare →
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ONLY ===== */}
      <div className="hidden md:block">

      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200 py-3 relative z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">

          {/* Breadcrumb Links */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#6B46C1] transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {isProject ? (
              <>
                <Link href="/properties?type=PROJECT" className="hover:text-[#6B46C1] transition-colors">Projects</Link>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <Link href="/properties" className="hover:text-[#6B46C1] transition-colors">Properties</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="hover:text-[#6B46C1] transition-colors capitalize">
                  {property.propertyType?.replace('_', ' ')?.toLowerCase()}
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
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
              className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {property.brochureUrl && (
              <a
                href={property.brochureUrl.startsWith('http') ? property.brochureUrl : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
              >
                <Download className="h-4 w-4" />
                Download Brochure
              </a>
            )}
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
                {isProject ? (
                  <>
                    {property.featured && (
                      <Badge className="bg-[#6B46C1]/10 hover:bg-[#6B46C1]/10 text-[#6B46C1] font-bold border-none px-3 py-1 flex items-center gap-1 rounded-lg">
                        <Sparkles className="h-3.5 w-3.5" /> Featured Spotlight
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {property.title}
              </h1>
              {property.projectId && property.projectName && (
                <div className="mt-2.5">
                  <Link href={`/property/${property.projectId}`} className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100/70 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl transition">
                    <Building2 className="w-3.5 h-3.5 font-bold" />
                    Located in Project: <span className="underline decoration-indigo-300 decoration-2">{property.projectName}</span>
                  </Link>
                </div>
              )}
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

            {/* Structured Specifications Grid */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-lg font-black text-slate-900 mb-4">Specifications Table</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {isProject ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Developer / Builder</span>
                        <span className="text-sm font-bold text-slate-800">{property.developer || 'Verified Builder'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">RERA ID</span>
                        <span className="text-sm font-bold text-slate-800">{property.reraId || 'Not Registered'}</span>
                        {property.reraId && (
                          <a href="https://up-rera.in/" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-600 hover:underline block mt-0.5">
                            Check RERA Status →
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                        <Compass className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Construction Status</span>
                        <span className="text-sm font-bold text-slate-800">{property.constructionStatus || 'New Launch'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Possession Starts</span>
                        <span className="text-sm font-bold text-slate-800">{formatDateLabel(property.possessionDate) || 'Immediate'}</span>
                      </div>
                    </div>

                    {property.brochureUrl && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Project Brochure</span>
                          <a
                            href={property.brochureUrl.startsWith('http') ? property.brochureUrl : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-black text-rose-600 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </a>
                        </div>
                      </div>
                    )}

                    {property.projectUnits && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Project Units</span>
                          <span className="text-sm font-bold text-slate-800">{property.projectUnits} Units</span>
                        </div>
                      </div>
                    )}

                    {property.projectArea && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <Maximize className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Project Area</span>
                          <span className="text-sm font-bold text-slate-800">{property.projectArea}</span>
                        </div>
                      </div>
                    )}

                    {property.sizes && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <Maximize className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Sizes</span>
                          <span className="text-sm font-bold text-slate-800">{property.sizes}</span>
                        </div>
                      </div>
                    )}

                    {property.configurations && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <Compass className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Configurations</span>
                          <span className="text-sm font-bold text-slate-800">{property.configurations}</span>
                        </div>
                      </div>
                    )}

                    {property.projectSize && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Project Size</span>
                          <span className="text-sm font-bold text-slate-800">{property.projectSize}</span>
                        </div>
                      </div>
                    )}

                    {property.launchDate && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Launch Date</span>
                          <span className="text-sm font-bold text-slate-800">{formatDateLabel(property.launchDate)}</span>
                        </div>
                      </div>
                    )}

                    {property.avgPrice && (
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                          <IndianRupee className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Avg. Price</span>
                          <span className="text-sm font-bold text-slate-800">{property.avgPrice}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}

              </div>

              {/* Extended specs table rows */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-sm font-semibold">
                  {!isPlotOrLand && !isProject && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Floor Number</span>
                      <span className="text-slate-800">{highlights.floorDetails || '2nd of 4 floors'}</span>
                    </div>
                  )}
                  {!isPlotOrLand && !isProject && (
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Furnishing Status</span>
                      <span className="text-slate-800">{highlights.furnishType || 'Semi-Furnished'}</span>
                    </div>
                  )}
                  {!isPlotOrLand && !isProject && (
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

            {/* Project BHK Configurations Card */}
            {isProject && property.configurations && (
              <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl mb-6">
                <h2 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  Project BHK Rates & Configurations
                </h2>
                <p className="text-xs text-slate-500 font-semibold mb-6">
                  Available layouts and starting prices for flats in {property.title}.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {property.configurations.split(',').map((config, idx) => {
                    const sizesArray = property.sizes ? property.sizes.split(',') : [];
                    const configName = config.trim();
                    const configPrice = sizesArray[idx]?.trim() || 'N/A';
                    return (
                      <div
                        key={idx}
                        className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <Badge className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-extrabold border border-indigo-100 px-3 py-1 rounded-lg">
                            {configName}
                          </Badge>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Rate / Price</span>
                          <span className="text-lg font-black text-slate-800">{configPrice}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {property.amenities && property.amenities.length > 0 ? (
                  (showAllAmenities ? property.amenities : property.amenities.slice(0, 8)).map((amenity) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={amenity} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0 border border-indigo-100">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{amenity}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="col-span-full text-sm text-slate-500 font-medium py-4 text-center">No amenities listed for this property.</p>
                )}
                {property.amenities && property.amenities.length > 8 && (
                  <div className="col-span-full flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="h-9 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-1.5 transition text-xs shadow-sm"
                    >
                      {showAllAmenities ? "Read Less" : `Read More (${property.amenities.length - 8} more)`}
                      <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-500", showAllAmenities && "rotate-180")} />
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* View Official Brochure Section */}
            {property.brochureUrl && (
              <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">View official brochure</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {property.title} Brochure & Payment Plan
                    </p>
                  </div>
                  <div className="p-1.5 bg-slate-100 rounded-full text-slate-400">
                    <Info className="w-4 h-4" />
                  </div>
                </div>
                {/* Brochure Viewer Box */}
                {isPdfFile(property.brochureUrl) ? (
                  <PdfViewer
                    pdfUrl={property.brochureUrl.startsWith('http') ? property.brochureUrl : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`}
                    title={property.title}
                  />
                ) : (
                  <div className="relative bg-[#0d1527] rounded-2xl overflow-hidden md:h-[450px] aspect-[16/10] border border-slate-800 flex items-center justify-center group shadow-inner">
                    <img
                      src={property.brochureUrl.startsWith('http') ? property.brochureUrl : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`}
                      alt={`${property.title} Brochure`}
                      className="max-h-full max-w-full object-contain"
                    />
                    
                    {/* Overlays */}
                    <a
                      href={property.brochureUrl.startsWith('http') ? property.brochureUrl : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-6 left-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition opacity-95 hover:opacity-100 hover:scale-105 z-20 flex items-center justify-center"
                    >
                      <Download className="w-5 h-5" />
                    </a>

                    <a
                      href={property.brochureUrl.startsWith('http') ? property.brochureUrl : `${getApiUrl().replace(/\/api$/, '')}${property.brochureUrl.startsWith('/') ? '' : '/'}${property.brochureUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-6 right-6 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition opacity-0 group-hover:opacity-100 z-20 flex items-center justify-center"
                    >
                      <Maximize className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Bottom Download Card */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-slate-50 border border-slate-150 rounded-xl mt-4">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-650 shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-800 leading-tight">
                        Download Brochure & Payment Plan of {property.title}
                      </p>
                      <p className="text-[11px] font-bold text-slate-450 mt-0.5">
                        Get the complete official drawing, details and pricing breakdown.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBrochureDownload}
                    disabled={isBrochureDownloading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-xs font-black transition shadow-sm uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    {isBrochureDownloading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
                      : <><Download className="w-4 h-4" /> Download</>
                    }
                  </button>
                </div>
              </Card>
            )}

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

          </div> {/* end right sidebar */}

        </div> {/* end 2-column grid */}

        {/* Dynamic Compare with Similar Properties (Desktop View) */}
        {similarProperties && similarProperties.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-[#6B46C1]" />
                  {getCompareTitle()}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Compare prices, area, and key details with similar properties in {property.city || 'this area'}.
                </p>
              </div>
              <Link href={`/properties?listing=${(property.listingType || 'buy').toLowerCase()}`}>
                <span className="text-xs font-extrabold text-[#6B46C1] hover:underline cursor-pointer flex items-center gap-1">
                  View All Similar Properties →
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {similarProperties.map((simProp) => {
                const simImage = getImageUrl(simProp.images);
                const pricePerSqFt = simProp.area > 0 ? Math.round(simProp.price / simProp.area) : null;

                return (
                  <div
                    key={simProp.id}
                    className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#6B46C1]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full bg-slate-200 shrink-0 overflow-hidden">
                        <img
                          src={simImage}
                          alt={simProp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                        />
                        <Badge className="absolute top-3 left-3 bg-[#0a2540] text-white text-[11px] font-bold px-2.5 py-1 rounded-md border-none">
                          {simProp.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
                        </Badge>
                        {simProp.verified && (
                          <Badge className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md border-none flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </Badge>
                        )}
                      </div>

                      <div className="p-4 space-y-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-lg font-black text-slate-900">
                            {formatPrice(simProp.price)}
                            {simProp.listingType === 'RENT' && <span className="text-xs font-semibold text-slate-500">/mo</span>}
                          </span>
                          {pricePerSqFt && (
                            <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                              ₹{pricePerSqFt}/sq.ft
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#6B46C1] transition-colors">
                          {simProp.title}
                        </h4>

                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{simProp.address}, {simProp.city}</span>
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold text-slate-700">
                          {simProp.bedrooms > 0 && (
                            <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-indigo-500" /> {simProp.bedrooms} BHK
                            </span>
                          )}
                          {simProp.bathrooms > 0 && (
                            <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5 text-indigo-500" /> {simProp.bathrooms} Baths
                            </span>
                          )}
                          {simProp.area > 0 && (
                            <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Maximize className="w-3.5 h-3.5 text-indigo-500" /> {simProp.area} Sq.Ft.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link href={`/property/${simProp.id}`} className="block">
                        <Button className="w-full h-10 bg-[#6B46C1] hover:bg-[#5A38A7] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm">
                          Compare Details →
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Project Inventory / Sub-units list */}
        {isProject && (
          <div className="mt-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Flats & Configurations in this Project</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Explore all the developer listings and direct-owner flats currently listed within {property.title}.</p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 font-black border border-indigo-150 px-3.5 py-1.5 rounded-xl shrink-0">
                {projectUnits.length} Units Available
              </Badge>
            </div>

            {projectUnits.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-700">No flats listed yet</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Be the first to list a flat in this project via the seller panel!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectUnits.map(unit => (
                  <div key={unit.id} className="group bg-slate-50 hover:bg-white border border-slate-150 hover:border-indigo-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col">
                    {/* Thumbnail Image */}
                    <div className="relative h-48 w-full bg-slate-100 shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(unit.images)}
                        alt={unit.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                      />
                      <Badge className="absolute top-3 left-3 bg-[#0a2540] text-white font-extrabold px-2.5 py-1 rounded-lg border-none">
                        {unit.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {unit.title}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span className="truncate">{unit.address || property.address}</span>
                        </div>
                        
                        {/* Area, Bedrooms, Bathrooms Specs */}
                        <div className="flex gap-4 pt-2 text-xs font-bold text-slate-700 border-t border-slate-100">
                          {unit.bedrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4 text-slate-450 shrink-0" /> {unit.bedrooms} BHK
                            </div>
                          )}
                          {unit.bathrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4 text-slate-455 shrink-0" /> {unit.bathrooms} Baths
                            </div>
                          )}
                          {unit.area > 0 && (
                            <div className="flex items-center gap-1">
                              <Maximize className="w-4 h-4 text-slate-456 shrink-0" /> {unit.area} Sq.Ft.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-150 shrink-0">
                        <div>
                          <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Pricing</span>
                          <span className="text-base font-black text-slate-900">
                            {formatPrice(unit.price)}
                            {unit.listingType === 'RENT' && <span className="text-xs font-bold text-slate-500">/mo</span>}
                          </span>
                        </div>
                        <Link href={`/property/${unit.id}`}>
                          <Button size="sm" className="bg-[#0a2540] hover:bg-[#07192c] text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition">
                            View Flat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div> {/* end desktop max-w-7xl */}
      </div> {/* end hidden md:block */}

        {/* Project Inventory / Sub-units list */}
        {isProject && (
          <div className="mt-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Flats & Configurations in this Project</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Explore all the developer listings and direct-owner flats currently listed within {property.title}.</p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 font-black border border-indigo-150 px-3.5 py-1.5 rounded-xl shrink-0">
                {projectUnits.length} Units Available
              </Badge>
            </div>

            {projectUnits.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                <h4 className="text-sm font-bold text-slate-700">No flats listed yet</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Be the first to list a flat in this project via the seller panel!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectUnits.map(unit => (
                  <div key={unit.id} className="group bg-slate-50 hover:bg-white border border-slate-150 hover:border-indigo-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col">
                    {/* Thumbnail Image */}
                    <div className="relative h-48 w-full bg-slate-100 shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(unit.images)}
                        alt={unit.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                      />
                      <Badge className="absolute top-3 left-3 bg-[#0a2540] text-white font-extrabold px-2.5 py-1 rounded-lg border-none">
                        {unit.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {unit.title}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span className="truncate">{unit.address || property.address}</span>
                        </div>
                        
                        {/* Area, Bedrooms, Bathrooms Specs */}
                        <div className="flex gap-4 pt-2 text-xs font-bold text-slate-700 border-t border-slate-100">
                          {unit.bedrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4 text-slate-450 shrink-0" /> {unit.bedrooms} BHK
                            </div>
                          )}
                          {unit.bathrooms > 0 && (
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4 text-slate-455 shrink-0" /> {unit.bathrooms} Baths
                            </div>
                          )}
                          {unit.area > 0 && (
                            <div className="flex items-center gap-1">
                              <Maximize className="w-4 h-4 text-slate-456 shrink-0" /> {unit.area} Sq.Ft.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-150 shrink-0">
                        <div>
                          <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Pricing</span>
                          <span className="text-base font-black text-slate-900">
                            {formatPrice(unit.price)}
                            {unit.listingType === 'RENT' && <span className="text-xs font-bold text-slate-500">/mo</span>}
                          </span>
                        </div>
                        <Link href={`/property/${unit.id}`}>
                          <Button size="sm" className="bg-[#0a2540] hover:bg-[#07192c] text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition">
                            View Flat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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

      {/* Sticky Mobile Call Actions bar — Housing.com style */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2.5 pb-safe block lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex gap-2">
          {/* Call */}
          <a
            href={`tel:+91${(property.user?.phone || SUPPORT_PHONE).replace(/\D/g, '')}`}
            className="flex-none flex flex-col items-center justify-center gap-0.5 border-2 border-slate-300 rounded-full h-12 px-4 font-bold text-slate-700 text-[10px] bg-white active:bg-slate-50"
          >
            <Phone className="h-4 w-4 text-rose-500" />
            <span>Call</span>
          </a>
          {/* WhatsApp */}
          <a
            href={`https://wa.me/91${(property.user?.phone || SUPPORT_PHONE).replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1fba58] text-white font-bold text-sm rounded-full h-12"
          >
            <MessageCircle className="h-4.5 w-4.5" />
            WHATSAPP
          </a>
          {/* Chat */}
          <button
            onClick={handleChatStart}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#1565C0] hover:bg-[#0d47a1] text-white font-bold text-sm rounded-full h-12"
          >
            <MessageSquare className="h-4.5 w-4.5" />
            Chat
          </button>
        </div>
      </div>

    </div>
  )
}
