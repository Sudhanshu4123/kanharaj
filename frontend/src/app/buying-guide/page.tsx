"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MapPin, Search, ChevronDown, Phone, Menu, User, LogOut
} from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { BRAND_LOGO_SRC, getSellerUrl, hasSellerDashboardAccess, cn } from "@/lib/utils"
import { topCities, otherCities } from "@/lib/location-data"

// SVGs matching the layout
const FindingHouseSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Decorations */}
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M90 200h8M94 196v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />

    {/* Magnifying Glass Lens Outline */}
    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />

    <g clipPath="url(#lens-clip)">
      {/* Ground/Grass inside lens */}
      <path d="M50 120c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />

      {/* Bush/Greenery */}
      <circle cx="65" cy="115" r="12" fill="#4ade80" />
      <circle cx="155" cy="115" r="12" fill="#4ade80" />

      {/* House Body */}
      <rect x="75" y="80" width="70" height="50" fill="#ec4899" rx="2" />

      {/* House Roof */}
      <polygon points="70,80 110,40 150,80" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />

      {/* Door */}
      <path d="M102 105h16v25h-16v-25z" fill="#4c0519" rx="1" />

      {/* Window */}
      <rect x="85" y="92" width="10" height="10" fill="#4c0519" rx="1" />
    </g>

    {/* Magnifying Glass Handle */}
    <rect x="150" y="135" width="14" height="45" rx="7" fill="#ec4899" transform="rotate(-45 150 135)" />
    <circle cx="150" cy="135" r="7" fill="#facc15" />

    <defs>
      <clipPath id="lens-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const BudgetingSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />

    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />

    <g clipPath="url(#budget-clip)">
      <path d="M50 120c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />

      <rect x="75" y="85" width="55" height="40" fill="#ec4899" rx="2" />
      <polygon points="70,85 102.5,50 135,85" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
      <path d="M95 105h15v20h-15v-20z" fill="#4c0519" rx="1" />

      <circle cx="150" cy="85" r="22" fill="#eab308" />
      <circle cx="150" cy="85" r="18" fill="#fde047" />
      {/* Rupee Symbol */}
      <path d="M144 79h12M144 83h12M148 79c4 0 6 3 6 6s-2 6-6 6h-4M147 90l8 7" stroke="#a16207" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    <rect x="145" y="125" width="45" height="55" rx="6" fill="#1e293b" />
    <rect x="153" y="133" width="29" height="10" rx="2" fill="#475569" />
    <rect x="153" y="149" width="7" height="7" rx="1" fill="#ec4899" />
    <rect x="164" y="149" width="7" height="7" rx="1" fill="#fde047" />
    <rect x="175" y="149" width="7" height="7" rx="1" fill="#38bdf8" />
    <rect x="153" y="160" width="7" height="7" rx="1" fill="#38bdf8" />
    <rect x="164" y="160" width="18" height="7" rx="1" fill="#0d9488" />

    <defs>
      <clipPath id="budget-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const LegalVerificationSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />

    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />

    <g clipPath="url(#legal-clip)">
      <path d="M50 125c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />

      <rect x="85" y="90" width="50" height="35" fill="#ec4899" rx="2" />
      <polygon points="80,90 110,60 140,90" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
      <path d="M103 108h14v17h-14v-17z" fill="#4c0519" rx="1" />
    </g>

    <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))">
      <rect x="135" y="105" width="50" height="65" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="150" y="99" width="20" height="8" rx="2" fill="#64748b" />
      <line x1="145" y1="120" x2="175" y2="120" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="145" y1="130" x2="165" y2="130" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="145" y1="140" x2="170" y2="140" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

      <circle cx="175" cy="155" r="14" fill="#22c55e" />
      <path d="M169 155l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    <defs>
      <clipPath id="legal-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const PossessionSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />

    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />

    <g clipPath="url(#possession-clip)">
      <path d="M50 120c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />

      <rect x="75" y="80" width="70" height="50" fill="#ec4899" rx="2" />
      <polygon points="70,80 110,40 150,80" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
      <path d="M102 105h16v25h-16v-25z" fill="#4c0519" rx="1" />
      <rect x="85" y="92" width="10" height="10" fill="#4c0519" rx="1" />
    </g>

    <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))">
      <path d="M165 115c-10 0-18 8-18 18s8 18 18 18c8 0 15-5 17-12h18v8h8v-8h6v-8h-32c-2-7-9-12-17-12zm0 8c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" fill="#eab308" />
    </g>

    <defs>
      <clipPath id="possession-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const stepsData = [
  {
    id: 1,
    title: "1. Finding a house",
    desc: "How to research for your dream home and location, and choose a property type that suits your requirements",
    illustration: FindingHouseSVG
  },
  {
    id: 2,
    title: "2. Financials & budgeting",
    desc: "Calculate extra purchasing costs, registration fees, and setup your home loan timeline before booking",
    illustration: BudgetingSVG
  },
  {
    id: 3,
    title: "3. Legal & verification",
    desc: "Thoroughly inspect structural layouts, builder track records, and state title deeds to prevent legal disputes",
    illustration: LegalVerificationSVG
  },
  {
    id: 4,
    title: "4. Registry & possession",
    desc: "Schedule Sub-Registrar slots, execute registry deeds, and run snagging inspections before key handovers",
    illustration: PossessionSVG
  }
]

export default function BuyingGuidePage() {
  const router = useRouter()

  const [activeStep, setActiveStep] = useState(1)
  const [propertyTab, setPropertyTab] = useState("under-construction")
  const [selectedArea, setSelectedArea] = useState("carpet")

  // Properties Header states
  const [selectedCity, setSelectedCity] = useState("")
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [citySearchQuery, setCitySearchQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [listingMode] = useState<'BUY' | 'RENT'>('BUY')
  const [sellerUrl, setSellerUrl] = useState('https://seller.kanharaj.com')

  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSellerUrl(getSellerUrl())
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { isAuthenticated, user, token, logout } = useAuthStore()
  const showSellerDashboard = isAuthenticated && hasSellerDashboardAccess(user)
  const sellerDashboardHref = token ? `${sellerUrl}/login?token=${token}` : `${sellerUrl}/login`

  const currentStepData = stepsData.find(s => s.id === activeStep) || stepsData[0]
  const Illustration = currentStepData.illustration

  const filteredTopCities = topCities.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()))
  const filteredOtherCities = otherCities.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()))

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setIsCityDropdownOpen(false)
    if (city) {
      router.push(`/properties?city=${encodeURIComponent(city)}`)
    } else {
      router.push('/properties')
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      router.push(`/properties?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    logout()
    setProfileDropdownOpen(false)
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50/50 -mt-16 sm:-mt-20 pt-[120px] sm:pt-[140px] md:pt-[100px] pb-20">

      {/* Header Container - Fixed to Top */}
      <div className="fixed top-0 left-0 right-0 z-45">
        {/* Properties search bar — same on phone & desktop (responsive website) */}
        <div className="flex bg-[#0a2540] text-white py-2 px-3 sm:px-4 md:px-6 flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-5">

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
            <div ref={cityDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer hover:text-white/80 transition whitespace-nowrap max-w-[140px] sm:max-w-none truncate"
              >
                <MapPin className="w-4 h-4 opacity-80" />
                {listingMode === 'RENT' ? 'Rent In' : 'Buy In'} {selectedCity || 'All Cities'}
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
          <div className="flex-1 w-full min-w-0 max-w-[800px] relative order-3 md:order-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0a2540]" />
            <input
              type="text"
              placeholder="Enter Locality, Landmark, Project or builder"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="bg-white border-0 text-slate-900 placeholder:text-slate-400 rounded-md h-[42px] pl-10 focus-visible:ring-0 shadow-inner w-full text-xs"
            />
          </div>

          {/* Right Actions */}
          <div className="flex gap-2 sm:gap-4 items-center ml-auto shrink-0 flex-wrap">
            <a href="tel:+919599801767" className="text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded transition whitespace-nowrap">
              <Phone className="w-4 h-4" /> Contact
            </a>

            {showSellerDashboard && (
              <a href={sellerDashboardHref} target="_blank" rel="noopener noreferrer">
                <button className="bg-[#00D289] hover:bg-[#00c07d] text-white font-bold rounded shadow-none h-9 px-5 whitespace-nowrap cursor-pointer text-xs">
                  Dashboard
                </button>
              </a>
            )}

            {/* Profile Menu Dropdown */}
            <div className="relative profile-menu-container" ref={profileDropdownRef}>
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
                          onClick={handleLogout}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">

          {/* LEFT COLUMN: Sticky Step Summary */}
          <div className="lg:col-span-4 relative w-full lg:self-stretch">
            <div className="lg:sticky lg:top-[160px] flex flex-col items-center text-center p-4">

              {/* Custom SVG Illustration */}
              <div className="w-64 h-64 flex items-center justify-center mb-6">
                <Illustration />
              </div>

              {/* Current Step title */}
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {currentStepData.title}
              </h2>

              {/* Current Step short desc */}
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                {currentStepData.desc}
              </p>

              {/* Dot Pagination indicators */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {stepsData.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    aria-label={`Go to step ${step.id}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeStep === step.id
                      ? "bg-purple-600 scale-110"
                      : "bg-slate-200 hover:bg-slate-300"
                      }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Stack of Cards */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >

                {/* STEP 1 DETAILS */}
                {activeStep === 1 && (
                  <>
                    {/* Card 1: Begin Search */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        How Do I Begin My Home Search?
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        The most important step of buying a home, is choosing a property that's right for you. This involves several steps of research and due diligence. It's advisable to use a mix of resources for finding a home to stay informed.
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Online Realty Portals", isLink: true, href: "#" },
                          { text: "Online/Offline classifieds", isLink: false },
                          { text: "Print Ads in Newspaper", isLink: false },
                          { text: "Property Fairs / Exhibitions", isLink: true, href: "#" },
                          { text: "Agents", isLink: true, href: "#" },
                          { text: "Developers", isLink: true, href: "#" },
                          { text: "Hoardings/Ads", isLink: false },
                          { text: "Family/Friends", isLink: false }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card 2: Location */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Location
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        Your quality of life will depend on the location you choose for your home. Choose a location based on:
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Connectivity with your workplace", isLink: false },
                          { text: "Ease of commute", isLink: false },
                          { text: "Presence of basic amenities/markets", isLink: false },
                          { text: "Future appreciation prospects", isLink: false },
                          { text: "Social infrastructure", isLink: false },
                          { text: "Explore More", isLink: true, href: "#" }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card 3: Property Types */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Property Types
                      </h3>

                      {/* Horizontal Tabs with Purple Underline */}
                      <div className="flex border-b border-slate-150 mb-4 overflow-x-auto gap-2">
                        {[
                          { id: "under-construction", label: "Under Construction Properties" },
                          { id: "ready-to-move", label: "Ready-To-Move Properties" },
                          { id: "resale", label: "Resale Properties" }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setPropertyTab(tab.id)}
                            className={`pb-2 px-3 text-[11px] font-semibold whitespace-nowrap transition-all relative -mb-[1px] ${propertyTab === tab.id
                              ? "text-purple-600 border-b-2 border-purple-600"
                              : "text-slate-400 hover:text-slate-600"
                              }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Content metrics matching screenshot */}
                      <div className="space-y-2 text-xs">
                        {propertyTab === "under-construction" && (
                          <>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Property price</b> - Discount over market rate</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Fund security</b>- Risky</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Possession delivery</b> - Delays possible</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Construction quality check</b> - Verifiable at possession time</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Social infrastructure</b> - Not present</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Physical infrastructure</b> - May not be present</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Return on investment</b> - High</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Loan facility</b> - Depends on project</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Overall risk</b>- High</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Suitable for</b> - Investor</p>
                          </>
                        )}
                        {propertyTab === "ready-to-move" && (
                          <>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Property price</b> - Market rate</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Fund security</b>- Safe</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Possession delivery</b> - Immediate</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Construction quality check</b> - Can check before purchase</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Social infrastructure</b> - Developed</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Physical infrastructure</b> - Developed</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Return on investment</b> - Moderate</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Loan facility</b> - Easy sanction</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Overall risk</b>- Low</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Suitable for</b> - Self use / Immediate rental</p>
                          </>
                        )}
                        {propertyTab === "resale" && (
                          <>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Property price</b> - Negotiable</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Fund security</b>- Safe (registered owner transfer)</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Possession delivery</b> - Immediate</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Construction quality check</b> - Check wear & tear</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Social infrastructure</b> - Developed</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Physical infrastructure</b> - Developed</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Return on investment</b> - Stable</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Loan facility</b> - Depends on property age</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Overall risk</b>- Low</p>
                            <p className="text-slate-500"><b className="text-slate-800 font-semibold">Suitable for</b> - Self use</p>
                          </>
                        )}
                      </div>

                      {/* Custom lightbulb tip box */}
                      <div className="p-3.5 rounded-lg bg-white border border-slate-100 text-[12px] text-slate-500 flex items-start gap-3 mt-4">
                        <div className="shrink-0 mt-0.5">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z" fill="#FACC15" />
                            <path d="M9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21V20H9V21Z" fill="#94A3B8" />
                            <path d="M11.5 6V8M11.5 10V12M11.5 8C11.5 8.28 11.72 8.5 12 8.5C12.28 8.5 12.5 8.28 12.5 8H11.5ZM11.5 10C11.5 9.72 11.72 9.5 12 9.5C12.28 9.5 12.5 9.72 12.5 10H11.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="leading-relaxed">
                          {propertyTab === "under-construction"
                            ? "Under Construction properties appreciate faster, but ready-to-move flats can earn 1.5% to 2% (of the property value) per annum if you lease it."
                            : propertyTab === "ready-to-move"
                              ? "Ready-To-Move properties save you from double expenditure (rent + loan EMIs) and carry zero GST liabilities in India."
                              : "For resale properties, ensure you verify that all past society maintenance dues, electricity, and water bills are fully paid before signing."
                          }
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Areas Explained */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Areas Explained
                      </h3>

                      {/* Area tabs */}
                      <div className="flex border-b border-slate-100 mb-6 overflow-x-auto gap-2">
                        {[
                          { id: "carpet", label: "Carpet Area" },
                          { id: "built-up", label: "Built-Up Area" },
                          { id: "super-built-up", label: "Super Built-Up" }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setSelectedArea(tab.id)}
                            className={`pb-2 px-3 text-[11px] font-semibold whitespace-nowrap transition-all relative -mb-[1px] ${selectedArea === tab.id
                              ? "text-purple-600 border-b-2 border-purple-600"
                              : "text-slate-400 hover:text-slate-600"
                              }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-7 space-y-4">
                          {selectedArea === "carpet" && (
                            <>
                              <h4 className="font-bold text-slate-900 text-xs">What is Carpet Area?</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                This is the net usable floor area of an apartment, excluding the area covered by the external walls, areas under services shafts, exclusive balcony or verandah area and exclusive open terrace area, but including the area covered by the internal partition walls of the apartment.
                              </p>
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-[11px] text-purple-800 font-semibold">
                                🔑 <b>Simple rule:</b> The area where you can literally spread a carpet (wall-to-wall space inside rooms).
                              </div>
                            </>
                          )}
                          {selectedArea === "built-up" && (
                            <>
                              <h4 className="font-bold text-slate-900 text-xs">What is Built-Up Area?</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                Built-up Area is the sum of carpet area, wall thickness, and other unusable utility areas like balconies, utility ducts, and private terraces. Typically, it is 10% to 15% more than the carpet area.
                              </p>
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-[11px] text-purple-800 font-semibold font-mono">
                                📝 <b>Formula:</b> Carpet Area + Wall Area + Balcony Space = Built-Up Area.
                              </div>
                            </>
                          )}
                          {selectedArea === "super-built-up" && (
                            <>
                              <h4 className="font-bold text-slate-900 text-xs">What is Super Built-Up Area?</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                This is the built-up area plus a proportionate share of the building's common areas like elevators, lobby corridors, staircases, generator rooms, security cabins, and clubhouse amenities.
                              </p>
                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-[11px] text-purple-800 font-semibold font-mono">
                                📊 <b>Calculation:</b> Carpet Area x (1 + Loading Factor) = Super Built-Up Area.
                              </div>
                            </>
                          )}
                        </div>

                        {/* Interactive Blueprint Graphic using Purple/Violet accent */}
                        <div className="md:col-span-5 bg-slate-900 rounded-2xl p-6 text-white text-center space-y-4 shadow-xl">
                          <h5 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Visual Blueprint Map</h5>

                          <div className="w-full h-36 bg-slate-800 rounded-xl border border-slate-700 relative flex items-center justify-center p-2">
                            {/* Visual Grid representing rooms */}
                            <div className="absolute inset-2 border border-dashed border-slate-600 rounded grid grid-cols-3 grid-rows-2 gap-1 bg-slate-950/40">
                              <div className={`border-r border-b border-dashed border-slate-600 flex items-center justify-center text-[10px] transition-all duration-300 ${selectedArea === "carpet" || selectedArea === "built-up" || selectedArea === "super-built-up" ? "bg-purple-600/30 text-purple-300 font-bold" : "text-slate-500"}`}>Bedroom</div>
                              <div className="border-r border-b border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">Kitchen</div>
                              <div className={`border-b border-dashed border-slate-600 flex items-center justify-center text-[10px] transition-all duration-300 ${selectedArea === "built-up" || selectedArea === "super-built-up" ? "bg-purple-700/60 text-purple-200 font-bold" : "text-slate-500"}`}>Balcony</div>
                              <div className="border-r border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">Bath</div>
                              <div className="border-r border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">Living</div>
                              <div className={`flex items-center justify-center text-[9px] transition-all duration-300 ${selectedArea === "super-built-up" ? "bg-purple-500/20 text-purple-400 font-bold" : "text-slate-500"}`}>Lobby (Common)</div>
                            </div>
                          </div>

                          <div className="text-left space-y-1">
                            <span className="text-[10px] text-purple-300 font-semibold">Measurement Loading Factor</span>
                            <p className="text-[11px] text-slate-300 leading-normal">
                              In India, loading factors range from <b>20% to 40%</b>. Builders charge prices based on the Super Built-Up area.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2 DETAILS */}
                {activeStep === 2 && (
                  <>
                    {/* Card 1: Actual Cost */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Understanding Actual Cost of Buying
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        The advertised price of a home is rarely the final cost. Ensure you plan for these mandatory extra costs:
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Circle rates and Stamp Duty charges (4-8% of property value)", isLink: true, href: "#" },
                          { text: "Registration Fees (usually 1% of property value)", isLink: false },
                          { text: "Goods & Services Tax (GST) for under-construction flats", isLink: false },
                          { text: "Society Maintenance advance & security deposits", isLink: true, href: "#" },
                          { text: "Home Loan Processing & legal verification fees", isLink: false }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card 2: Home Loan Timeline */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Home Loan Timeline
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        Securing a bank loan requires executing these key operational steps:
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Checking CIBIL score & eligibility criteria", isLink: true, href: "#" },
                          { text: "Submitting Income tax files (ITR) & bank sheets", isLink: false },
                          { text: "Bank legal valuation of site plan & approvals", isLink: false },
                          { text: "Sanction Letter execution by bank manager", isLink: true, href: "#" },
                          { text: "Disbursement Check handover directly to seller", isLink: false }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* STEP 3 DETAILS */}
                {activeStep === 3 && (
                  <>
                    {/* Card 1: Checklist */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Mandatory Document Checklist
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        Never transfer token deposits or sign contracts without examining certified copies of these core records:
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Original Sale Deed & historic title chains", isLink: true, href: "#" },
                          { text: "Mother Deed tracking for 30 years of history", isLink: false },
                          { text: "RERA Certificate checking on state portals", isLink: true, href: "#" },
                          { text: "Approved Building Layout Sanction Plan", isLink: false },
                          { text: "Encumbrance Certificate (EC) verifying zero mortgages", isLink: true, href: "#" }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card 2: Local Due Diligence */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Local Due Diligence
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        Confirm regional factors and developer verification points before registry:
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Outstanding society maintenance dues verification", isLink: false },
                          { text: "Local municipality occupancy permissions (OC)", isLink: true, href: "#" },
                          { text: "Property tax receipt clearing records", isLink: false },
                          { text: "Water connection and electric sub-meter transfers", isLink: false }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* STEP 4 DETAILS */}
                {activeStep === 4 && (
                  <>
                    {/* Card 1: Registry */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Registry Execution Process
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        The final transfer of property title occurs through these formal steps at the local Sub-Registrar office:
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Purchasing digital E-Stamp paper from state bank", isLink: true, href: "#" },
                          { text: "Booking slot timings online at municipal sub-registrar", isLink: false },
                          { text: "Executing Sale Deed with signatures from two witnesses", isLink: false },
                          { text: "Completing biometric registration & document submissions", isLink: true, href: "#" }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card 2: Snagging */}
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Possession Handover Snagging
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        Perform a thorough visual and functional walk-through of the home before accepting keys:
                      </p>

                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {[
                          { text: "Inspecting walls for dampness, seepage, and cracks", isLink: false },
                          { text: "Testing all electric switches and MCB panel boards", isLink: false },
                          { text: "Running taps to check drainage blocks or leaks", isLink: true, href: "#" },
                          { text: "Verifying window slides and door lock functions", isLink: false },
                          { text: "Receiving NOC letters & previous invoice clearance sheets", isLink: true, href: "#" }
                        ].map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                            {bullet.isLink ? (
                              <Link
                                href={bullet.href || "#"}
                                className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                              >
                                {bullet.text}
                              </Link>
                            ) : (
                              <span className="text-slate-700">{bullet.text}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  )
}
