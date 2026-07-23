"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, ChevronDown, Info, Check, MapPin, Building2, Upload, X, Loader2, IndianRupee, Maximize2, Calendar, FileCheck, Phone,
  Video, Lock, ShieldCheck, Flame, Dumbbell, Waves, Users, Trophy, Car, Zap, Droplets, Wifi,
  Tv, Fingerprint, Footprints, Target, Gamepad2, Sparkles, Settings, Trash2, Trees, Heart, Play, BookOpen, CloudRain, Sun, Compass, Leaf, ShoppingBag, Briefcase, Smile, Landmark,
  Coffee, FileText
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { topCities, otherCities } from "@/lib/cities"
import { getApiUrl } from "@/lib/auth"
import { getAdminAuthHeaders, getApiErrorMessage } from "@/lib/utils"

const projectAmenitiesList = [
  {
    title: "Security & Safety",
    items: [
      { name: "CCTV Surveillance", icon: Video },
      { name: "Gated Community", icon: Lock },
      { name: "24x7 Security Guard", icon: ShieldCheck },
      { name: "Fire Fighting System", icon: Flame },
      { name: "Intercom Facility", icon: Phone },
      { name: "Video Door Phone", icon: Tv },
      { name: "Biometric Access Control", icon: Fingerprint }
    ]
  },
  {
    title: "Sports & Fitness",
    items: [
      { name: "Gymnasium", icon: Dumbbell },
      { name: "Swimming Pool", icon: Waves },
      { name: "Kids Play Area", icon: Trophy },
      { name: "Jogging & Cycling Track", icon: Footprints },
      { name: "Badminton / Tennis Court", icon: Target },
      { name: "Indoor Games Room", icon: Gamepad2 },
      { name: "Skating Rink", icon: Sparkles }
    ]
  },
  {
    title: "Infrastructure & Utilities",
    items: [
      { name: "High-Speed Lifts", icon: Building2 },
      { name: "100% Power Backup", icon: Zap },
      { name: "Reserved Car Parking", icon: Car },
      { name: "Visitor Parking", icon: Car },
      { name: "24x7 Water Supply", icon: Droplets },
      { name: "Water Storage Tank", icon: Droplets },
      { name: "Piped Gas System", icon: Flame },
      { name: "Sewage Treatment Plant", icon: Settings },
      { name: "Waste Disposal System", icon: Trash2 }
    ]
  },
  {
    title: "Leisure & Community",
    items: [
      { name: "Clubhouse / Community Hall", icon: Users },
      { name: "Landscape Garden / Park", icon: Trees },
      { name: "Senior Citizen Area", icon: Heart },
      { name: "Amphitheatre", icon: Sparkles },
      { name: "Mini Theatre", icon: Play },
      { name: "Wi-Fi Connectivity", icon: Wifi },
      { name: "Cafeteria / Food Court", icon: Coffee },
      { name: "Library / Study Lounge", icon: BookOpen }
    ]
  },
  {
    title: "Eco & Green Energy",
    items: [
      { name: "Rain Water Harvesting", icon: CloudRain },
      { name: "Solar Lighting System", icon: Sun },
      { name: "Vastu Compliant", icon: Compass },
      { name: "Eco Friendly Green Zone", icon: Leaf }
    ]
  },
  {
    title: "Convenience & Business",
    items: [
      { name: "In-house Shopping Center", icon: ShoppingBag },
      { name: "Conference Room / Lounge", icon: Briefcase },
      { name: "Daycare / Crèche", icon: Smile },
      { name: "ATM Facility", icon: Landmark }
    ]
  }
]

export default function AddProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const brochureInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [city, setCity] = useState("Delhi")
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [projectType, setProjectType] = useState("RESIDENTIAL_PROJECT")
  const [title, setTitle] = useState("")
  const [developer, setDeveloper] = useState("")
  const [reraId, setReraId] = useState("")
  const [price, setPrice] = useState("")
  const [area, setArea] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [pincode, setPincode] = useState("")
  const [state, setState] = useState("")
  const [constructionStatus, setConstructionStatus] = useState("New Launch")
  const [possessionDate, setPossessionDate] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [brochureUrl, setBrochureUrl] = useState("")

  const [projectUnits, setProjectUnits] = useState("")
  const [areaUnit, setAreaUnit] = useState("sq.ft.")
  const [projectArea, setProjectArea] = useState("")
  const [sizes, setSizes] = useState("")
  const [configurations, setConfigurations] = useState("")
  const [projectSize, setProjectSize] = useState("")
  const [launchDate, setLaunchDate] = useState("")
  const [avgPrice, setAvgPrice] = useState("")

  const [projectFlats, setProjectFlats] = useState<{ bhk: string; priceText: string; sqft: string; carpet?: string }[]>([
    { bhk: "2 BHK", priceText: "", sqft: "", carpet: "" }
  ])

  const formatNumberToIndianWords = (val: number): string => {
    if (isNaN(val) || val <= 0) return "";
    if (val < 1000) return `${val}`;
    if (val < 100000) return `${Number((val / 1000).toFixed(2))} K`;
    if (val < 10000000) return `${Number((val / 100000).toFixed(2))} Lac`;
    return `${Number((val / 10000000).toFixed(2))} Cr`;
  };

  // Helper to parse price string like "1.2 Cr" or "85 Lac" into absolute numeric value for Starting Price
  const parsePriceToNumeric = (priceStr: string): number => {
    const cleanStr = priceStr.toLowerCase().replace(/[^0-9.]/g, '').trim();
    const val = parseFloat(cleanStr);
    if (isNaN(val)) return 0;
    
    if (priceStr.toLowerCase().includes('cr')) {
      return val * 10000000;
    }
    if (priceStr.toLowerCase().includes('lac') || priceStr.toLowerCase().includes('lakh')) {
      return val * 100000;
    }
    return val;
  };

  useEffect(() => {
    if (projectType === "COMMERCIAL_PROJECT") {
      setConfigurations("");
      setSizes("");
      return;
    }

    // Generate configurations string: e.g. "2 BHK (1200 sq.ft. / Carpet: 1000 sq.ft.)"
    const configsStr = projectFlats
      .map(f => {
        const bhk = f.bhk.trim();
        const sqft = f.sqft.trim();
        const carpet = f.carpet ? f.carpet.trim() : "";
        
        if (sqft && carpet) {
          return `${bhk} (${sqft} sq.ft. / Carpet: ${carpet} sq.ft.)`;
        } else if (sqft) {
          return `${bhk} (${sqft} sq.ft.)`;
        } else if (carpet) {
          return `${bhk} (Carpet: ${carpet} sq.ft.)`;
        }
        return bhk;
      })
      .filter(Boolean)
      .join(", ");
    setConfigurations(configsStr);

    // Generate sizes string: e.g. "85 Lac, 1.2 Cr"
    const sizesStr = projectFlats
      .map(f => {
        const val = parseFloat(f.priceText);
        return isNaN(val) ? f.priceText.trim() : formatNumberToIndianWords(val);
      })
      .filter(Boolean)
      .join(", ");
    setSizes(sizesStr);

    // Calculate Starting Price (min price of all layout configurations)
    const numericPrices = projectFlats
      .map(f => parsePriceToNumeric(f.priceText))
      .filter(p => p > 0);
    if (numericPrices.length > 0) {
      const minPrice = Math.min(...numericPrices);
      setPrice(minPrice.toString());
    } else {
      setPrice("");
    }
  }, [projectFlats]);

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingBrochure, setUploadingBrochure] = useState(false)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)

  const activeSteps = [
    { id: 0, label: "Project Details", status: currentStep > 0 ? "Completed" : "In progress", score: "" },
    { id: 1, label: "Facilities", status: currentStep > 1 ? "Completed" : currentStep === 1 ? "In progress" : "Pending", score: "Score ↑10%" },
    { id: 2, label: "Photos & Layouts", status: currentStep > 2 ? "Completed" : currentStep === 2 ? "In progress" : "Pending", score: "Score ↑15%" },
    { id: 3, label: "Review & Publish", status: currentStep === 3 ? "In progress" : "Pending", score: "" },
  ]

  const getProgressPercent = () => {
    const percents = [25, 50, 75, 100]
    return percents[currentStep] || 25
  }
  const progressPercent = getProgressPercent()

  const formatHelperAmount = (numStr: string) => {
    const val = parseFloat(numStr)
    if (isNaN(val) || val <= 0) return ""
    if (val < 1000) return `₹ ${val}`
    if (val < 100000) return `₹ ${Number((val / 1000).toFixed(2))}k`
    if (val < 10000000) return `₹ ${Number((val / 100000).toFixed(2))} Lac`
    return `₹ ${Number((val / 10000000).toFixed(2))} Cr`
  }

  const formatSizeHelper = (numStr: string) => {
    const val = parseFloat(numStr)
    if (isNaN(val) || val <= 0) return ""
    if (val < 1000) return `${val} sq.ft.`
    const k = val / 1000
    return `${Number(k.toFixed(1))} K`
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!title) { alert("Please enter project name."); return }
      if (!developer) { alert("Please enter developer/builder name."); return }
      if (!reraId) { alert("Please enter RERA registration ID."); return }
      if (!price) { alert("Please enter starting pricing."); return }
      if (!address) { alert("Please enter project address."); return }
      if (!city) { alert("Please select or enter city."); return }
      if (!state) { alert("Please enter state."); return }
      if (!pincode) { alert("Please enter pincode."); return }

      // Validate address details
      setIsValidatingAddress(true)
      try {
        const query = `${address}, ${city}, ${state}, ${pincode}, India`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'Kanharaj-Admin/1.0' }
        });
        
        let addressFound = false;
        if (res.ok) {
          const data = await res.json();
          if (data && data[0]) {
            addressFound = true;
          }
        }

        if (!addressFound) {
          // If detailed address failed, verify if the City and State themselves are valid
          const cityQuery = `${city}, ${state}, India`;
          const cityRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cityQuery)}`, {
            headers: { 'Accept-Language': 'en', 'User-Agent': 'Kanharaj-Admin/1.0' }
          });
          
          let cityFound = false;
          if (cityRes.ok) {
            const cityData = await cityRes.json();
            if (cityData && cityData[0]) {
              cityFound = true;
            }
          }

          if (!cityFound) {
            alert(`Error: The city "${city}" or state "${state}" you entered could not be found. Please check your spelling and make sure it is a valid location.`);
            return;
          }

          // If city is valid but exact street address failed geocoding, show user verification warning
          const proceed = window.confirm(
            `Warning: We found the city "${city}", but could not pinpoint the exact address "${address}" on the map. \n\nAre you sure this address is correct? Click OK to proceed anyway, or Cancel to check and edit.`
          );
          if (!proceed) {
            return;
          }
        }
      } catch (err) {
        console.warn("Address verification check failed:", err);
      } finally {
        setIsValidatingAddress(false);
      }
    } else if (currentStep === 1) {
      // Facilities step is optional, no validation required
    } else if (currentStep === 2) {
      if (images.length === 0) { alert("Please upload at least one project photo or layout diagram."); return }
    }
    setCurrentStep(prev => Math.min(activeSteps.length - 1, prev + 1))
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const data = new FormData()
    for (let i = 0; i < files.length; i++) {
      data.append("files", files[i])
    }

    const token = localStorage.getItem("admin_token")
    try {
      const res = await fetch(`${getApiUrl()}/upload/images`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: data
      })
      
      if (res.status === 401 || res.status === 403) {
        alert("Your session has expired. Please login again.")
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_user")
        router.push("/login")
        return
      }

      if (!res.ok) {
        const errText = await res.text()
        alert("Image upload failed: " + errText)
        return
      }

      const result = await res.json()
      if (result.urls) {
        setImages(prev => [...prev, ...result.urls])
      }
    } catch (err: any) {
      alert("Image upload error: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBrochure(true)
    const data = new FormData()
    data.append("file", file)

    const token = localStorage.getItem("admin_token")
    try {
      const res = await fetch(`${getApiUrl()}/upload/document`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: data
      })

      if (res.status === 401 || res.status === 403) {
        alert("Your session has expired. Please login again.")
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_user")
        router.push("/login")
        return
      }

      if (!res.ok) {
        const errText = await res.text()
        alert("Brochure upload failed: " + errText)
        return
      }

      const result = await res.json()
      if (result.url) {
        setBrochureUrl(result.url)
      }
    } catch (err: any) {
      alert("Brochure upload error: " + err.message)
    } finally {
      setUploadingBrochure(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeBrochure = () => {
    setBrochureUrl("")
  }

  const handleSubmit = async () => {
    const userData = localStorage.getItem("admin_user")
    const authHeaders = getAdminAuthHeaders()
    if (!userData || !authHeaders) {
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      // Geocode address dynamically
      let lat = 28.5921;
      let lng = 77.0266;
      try {
        const geoQuery = `${address ? address + ', ' : ''}${city}, ${state}, ${pincode}, India`;
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(geoQuery)}`, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'Kanharaj-Admin/1.0' }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          } else {
            // Fallback to city and state
            const broadQuery = `${city}, ${state}, India`;
            const broadRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(broadQuery)}`, {
              headers: { 'Accept-Language': 'en', 'User-Agent': 'Kanharaj-Admin/1.0' }
            });
            if (broadRes.ok) {
              const broadData = await broadRes.json();
              if (broadData && broadData[0]) {
                lat = parseFloat(broadData[0].lat);
                lng = parseFloat(broadData[0].lon);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Geocoding failed:", err);
      }

      let finalAvgPrice = avgPrice.trim();
      if (finalAvgPrice && !finalAvgPrice.toLowerCase().includes('/sq')) {
        finalAvgPrice = `${finalAvgPrice}/sq.ft.`;
      }

      const payload = {
        title,
        description,
        price: parseFloat(price),
        address,
        city,
        state,
        pincode,
        propertyType: projectType,
        listingType: "BUY",
        developer,
        reraId,
        constructionStatus,
        possessionDate,
        area: area ? parseFloat(area) : 0,
        projectUnits: projectUnits ? parseInt(projectUnits) : null,
        areaUnit,
        projectArea,
        sizes,
        configurations,
        projectSize,
        launchDate,
        avgPrice: finalAvgPrice,
        images,
        amenities,
        brochureUrl,
        status: "ACTIVE",
        bedrooms: 0,
        bathrooms: 0,
        latitude: lat,
        longitude: lng,
        userId: "1"
      }

      const res = await fetch(`${getApiUrl()}/properties`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await getApiErrorMessage(res, "Failed to publish developer project.")
        alert("Error: " + msg)
        return
      }

      alert("Project published successfully!")
      router.push("/projects")
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-10">

      {/* Top Decoration */}
      <div className="max-w-[1100px] mx-auto pt-6 md:pt-8 px-4 flex flex-col md:flex-row gap-6 items-start relative z-10">

        {/* ── Left Sidebar ── */}
        <aside className="w-full md:w-[280px] shrink-0 bg-white rounded-none md:rounded-2xl shadow-md md:shadow-sm border-b border-slate-150 md:border md:border-slate-100 p-3 md:p-6 fixed md:sticky top-14 md:top-24 left-0 right-0 md:left-auto md:right-auto z-30">

          <Link href="/projects" className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2 md:mb-6 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Return to dashboard
          </Link>

          <h1 className="hidden md:block text-xl font-black text-slate-900 leading-tight">Post your project</h1>
          <p className="hidden md:block text-sm font-medium text-slate-500 mb-6">Create developer project</p>

          <div className="hidden md:flex items-center gap-2 mb-8">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[10px] font-black text-slate-700 flex items-center gap-1">
              {progressPercent}% <Info className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          {/* Stepper */}
          {/* Desktop Stepper (Vertical) */}
          <div className="hidden md:block relative pl-3 space-y-8 before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
            {activeSteps.map((step) => {
              const isPast = step.status === "Completed"
              const isActive = step.status === "In progress"
              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white transition-colors ${
                    isPast ? "bg-[#0a2540] text-white" : isActive ? "bg-white border-[3px] border-[#0a2540]" : "bg-slate-100 text-slate-400"
                  }`}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-[#0a2540]" /> : null}
                  </div>
                  <div className="flex flex-col -mt-0.5">
                    <span className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                      {step.label}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${
                        isActive ? "bg-[#0a2540]/5 text-[#0a2540]" : "bg-transparent text-slate-400 border border-slate-200"
                      }`}>
                        {isActive ? "In progress" : step.status}
                      </span>
                      {step.score && (
                        <span className="text-[9px] font-black text-emerald-650">{step.score}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile Stepper (Horizontal) */}
          <div className="md:hidden relative flex items-center justify-between w-full mt-2 px-1 pb-1">
            {/* Connector Line */}
            <div className="absolute top-[14px] left-[12.5%] right-[12.5%] h-0.5 bg-slate-100 -z-0" />
            
            {activeSteps.map((step) => {
              const isPast = step.status === "Completed"
              const isActive = step.status === "In progress"
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                  {/* Step Circle */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white transition-all duration-300 ${
                    isPast ? "bg-[#0a2540] text-white" : isActive ? "bg-white border-[3px] border-[#0a2540]" : "bg-slate-100 text-slate-400"
                  }`}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-[#0a2540]" /> : null}
                  </div>
                  {/* Label */}
                  <span className={`text-[9px] font-black mt-2 text-center leading-tight transition-colors px-1 ${
                    isActive ? "text-slate-900 font-extrabold" : "text-slate-400"
                  }`}>
                    {step.label}
                  </span>
                  {/* Score */}
                  {step.score && isActive && (
                    <span className="text-[8px] font-black text-emerald-600 mt-0.5">{step.score.replace('Score ', '')}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="hidden md:flex mt-12 pt-6 border-t border-slate-100 items-center gap-1 text-xs font-medium text-slate-500">
            Need Help? <Phone className="w-3.5 h-3.5 text-[#0a2540] ml-1" /> <a href="tel:9599801767" className="font-bold text-[#0a2540] hover:underline">Call 9599801767</a>
          </div>
        </aside>

        {/* ── Main Form Area ── */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 w-full min-h-[600px] flex flex-col mt-[76px] md:mt-0">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* Step 0: Project Details */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="bg-white p-0 rounded-3xl space-y-6">
                    <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50 space-y-2 text-center">
                      <h2 className="text-2xl font-black text-slate-800">Create Developer Project</h2>
                      <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Start by filling in the project details
                      </p>
                    </div>

                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Project Specifications</h3>

                     {/* Project Category */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Project Category *</label>
                      <div className="flex gap-3">
                        {[
                          { value: "RESIDENTIAL_PROJECT", label: "Residential" },
                          { value: "COMMERCIAL_PROJECT", label: "Commercial" }
                        ].map(t => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setProjectType(t.value)}
                            className={`px-5 py-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              projectType === t.value
                                ? "bg-[#0a2540] text-white border-[#0a2540]"
                                : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title & Developer */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Project Name *</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. DLF Park Place" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Developer/Builder Name *</label>
                        <input required type="text" value={developer} onChange={e => setDeveloper(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. DLF Builders" />
                      </div>
                    </div>

                    {/* Flats Layout & Pricing List */}
                    {projectType === "RESIDENTIAL_PROJECT" ? (
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase text-[#0a2540] tracking-wider">Flats / Layout Configurations & Prices *</label>
                          <button
                            type="button"
                            onClick={() => setProjectFlats(prev => [...prev, { bhk: "2 BHK", priceText: "", sqft: "", carpet: "" }])}
                            className="px-2.5 py-1 bg-[#0a2540]/5 hover:bg-[#0a2540]/10 text-[#0a2540] text-[10px] font-black rounded-lg border border-[#0a2540]/10 transition-colors cursor-pointer"
                          >
                            + Add BHK / Flat
                          </button>
                        </div>

                        <div className="space-y-3">
                          {projectFlats.map((flat, idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="flex-1 grid grid-cols-4 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Configuration / BHK</label>
                                  <input
                                    type="text"
                                    value={flat.bhk}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setProjectFlats(prev => prev.map((f, i) => i === idx ? { ...f, bhk: val } : f));
                                    }}
                                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-[11px] font-bold focus:border-indigo-500 outline-none"
                                    placeholder="e.g. 2 BHK, 3 BHK"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Size (Sq.Ft.)</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={flat.sqft}
                                      onChange={e => {
                                        const val = e.target.value;
                                        setProjectFlats(prev => prev.map((f, i) => i === idx ? { ...f, sqft: val } : f));
                                      }}
                                      className="w-full h-9 bg-white border border-slate-200 rounded-lg pl-3 pr-20 text-[11px] font-bold focus:border-indigo-500 outline-none"
                                      placeholder="e.g. 1200"
                                    />
                                    {flat.sqft ? (
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded pointer-events-none">
                                        {formatSizeHelper(flat.sqft)}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Carpet Area (Sq.Ft.)</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={flat.carpet || ""}
                                      onChange={e => {
                                        const val = e.target.value;
                                        setProjectFlats(prev => prev.map((f, i) => i === idx ? { ...f, carpet: val } : f));
                                      }}
                                      className="w-full h-9 bg-white border border-slate-200 rounded-lg pl-3 pr-20 text-[11px] font-bold focus:border-indigo-500 outline-none"
                                      placeholder="e.g. 1000"
                                    />
                                    {flat.carpet ? (
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded pointer-events-none">
                                        {formatSizeHelper(flat.carpet)}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Price (in ₹)</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      max={10000000000}
                                      value={flat.priceText}
                                      onChange={e => {
                                        const val = e.target.value;
                                        if (val && Number(val) > 10000000000) return;
                                        setProjectFlats(prev => prev.map((f, i) => i === idx ? { ...f, priceText: val } : f));
                                      }}
                                      className="w-full h-9 bg-white border border-slate-200 rounded-lg pl-3 pr-20 text-[11px] font-bold focus:border-indigo-500 outline-none"
                                      placeholder="e.g. 8500000"
                                    />
                                    {flat.priceText ? (
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded pointer-events-none">
                                        {formatHelperAmount(flat.priceText)}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                              
                              {projectFlats.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setProjectFlats(prev => prev.filter((_, i) => i !== idx))}
                                  className="mt-4 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors shrink-0 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Starting Price (in ₹) *</label>
                        <div className="relative">
                          <input
                            required
                            type="number"
                            max={10000000000}
                            value={price}
                            onChange={e => {
                              const val = e.target.value;
                              if (val && Number(val) > 10000000000) return;
                              setPrice(val);
                            }}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            placeholder="e.g. 8500000"
                          />
                          {price ? (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded pointer-events-none">
                              {formatHelperAmount(price)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* RERA ID & Construction Status */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">RERA ID *</label>
                        <input required type="text" value={reraId} onChange={e => setReraId(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. RERA-HR-1234" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Construction Status</label>
                        <select value={constructionStatus} onChange={e => setConstructionStatus(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-indigo-500 cursor-pointer">
                          <option value="New Launch">New Launch</option>
                          <option value="Under Construction">Under Construction</option>
                          <option value="Ready to Move">Ready to Move</option>
                        </select>
                      </div>
                    </div>

                    {/* Possession date */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Expected Possession Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="date" value={possessionDate} onChange={e => setPossessionDate(e.target.value)} className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer" />
                        </div>
                      </div>
                    </div>
                    </div>

                  {/* Project Specifications */}
                  {projectType !== "COMMERCIAL_PROJECT" && (
                    <div className="bg-white p-0 rounded-3xl space-y-6 pt-6 border-t border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Project Specs & Stats</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Project Units (Total flats/plots count)</label>
                          <input type="number" value={projectUnits} onChange={e => setProjectUnits(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 475" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Area Unit</label>
                          <input type="text" value={areaUnit} onChange={e => setAreaUnit(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. sq.ft., Acres" />
                        </div>
                      </div>

                       <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Total Buildings / Towers</label>
                          <input type="text" value={projectSize} onChange={e => setProjectSize(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 6 Buildings" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Launch Date</label>
                          <input type="date" value={launchDate} onChange={e => setLaunchDate(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Avg. Price / Formatted per unit price</label>
                          <div className="relative">
                            <input type="text" value={avgPrice} onChange={e => setAvgPrice(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-24 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 29.55k/sq.ft. or 29.55 K/sq.ft" />
                            {avgPrice && /^\d+$/.test(avgPrice.trim()) ? (
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded pointer-events-none">
                                {formatHelperAmount(avgPrice)}/sq.ft.
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Section */}
                  <div className="bg-white p-0 rounded-3xl space-y-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Project Location</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Address */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Address Line *</label>
                        <input required type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Sector 54, Golf Course Road" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* City */}
                      <div className="space-y-1.5 relative" ref={cityDropdownRef}>
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">City *</label>
                        <input
                          required
                          type="text"
                          value={city}
                          onChange={e => { setCity(e.target.value); setIsCityDropdownOpen(true) }}
                          onFocus={() => setIsCityDropdownOpen(true)}
                          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                          placeholder="Enter city"
                        />
                        {isCityDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-25 divide-y divide-slate-150">
                            {topCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).map(c => (
                              <div key={c} onClick={() => { setCity(c); setIsCityDropdownOpen(false) }} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 cursor-pointer">{c}</div>
                            ))}
                            {otherCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).slice(0, 15).map(c => (
                              <div key={c} onClick={() => { setCity(c); setIsCityDropdownOpen(false) }} className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 cursor-pointer">{c}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">State *</label>
                        <input required type="text" value={state} onChange={e => setState(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Haryana" />
                      </div>

                      {/* Pincode */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Pincode *</label>
                        <input required type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="122002" />
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="bg-white p-0 rounded-3xl space-y-4 pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider font-bold">Project Layout Description</label>
                    <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none" placeholder="Explain the project layout, specifications, green surroundings, and nearby connectivity details..." />
                  </div>
                </div>
              )}

              {/* Step 1: Facilities / Amenities */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50 space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-800">Project Facilities & Amenities</h2>
                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Choose from the comprehensive list of facilities below
                    </p>
                  </div>

                  {projectAmenitiesList.map(category => (
                    <div key={category.title} className="space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">{category.title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {category.items.map(item => {
                          const isSelected = amenities.includes(item.name);
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => {
                                setAmenities(prev =>
                                  isSelected
                                    ? prev.filter(a => a !== item.name)
                                    : [...prev, item.name]
                                );
                              }}
                              className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                                isSelected
                                  ? "bg-[#0a2540] border-[#0a2540] text-white shadow-md scale-[1.02]"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-[#0a2540] hover:shadow-sm"
                              }`}
                            >
                              <item.icon
                                size={28}
                                strokeWidth={1.5}
                                className={`mb-3 transition-colors ${isSelected ? "text-white" : "text-slate-500"}`}
                              />
                              <span className="text-xs font-bold text-center leading-tight">
                                {item.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: Photos & Media */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-white p-0 rounded-3xl space-y-6">
                    <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50 space-y-2 text-center">
                      <h2 className="text-2xl font-black text-slate-800">Upload Project Photos & Brochure</h2>
                      <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Upload project brochure (PDF/Image) and progress photos
                      </p>
                    </div>

                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Project Brochure (PDF / Image)</h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Upload the official project brochure for prospective buyers.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {brochureUrl ? (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 w-full md:w-auto min-w-[280px]">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">Project Brochure</p>
                            <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-600 hover:underline">View PDF Document</a>
                          </div>
                          <button type="button" onClick={removeBrochure} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl px-6 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50/20 text-slate-400 hover:text-indigo-650 transition-all w-full md:w-auto min-w-[280px]">
                          {uploadingBrochure ? (
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6" />
                              <span className="text-xs font-black uppercase">Upload Brochure PDF</span>
                              <span className="text-[9px] text-slate-400 font-semibold">(Max 20MB)</span>
                            </>
                          )}
                          <input ref={brochureInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleBrochureUpload} disabled={uploadingBrochure} />
                        </label>
                      )}
                    </div>

                    <div className="border-b border-slate-100 pb-3 pt-6">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Upload Project Photos</h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Upload project brochures, construction progress photos, and elevation layout models.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {images.map((url, i) => (
                        <div key={url} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-250 group">
                          <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      ))}

                      <label className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl aspect-video flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-indigo-50/20 text-slate-400 hover:text-indigo-650 transition-all">
                        {uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            <span className="text-[9px] font-black uppercase">Upload Photo</span>
                          </>
                        )}
                        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-white p-0 rounded-3xl space-y-6">
                    <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50 space-y-2 text-center">
                      <h2 className="text-2xl font-black text-slate-800">Review & Publish Project</h2>
                      <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Please verify all details before publishing
                      </p>
                    </div>

                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-emerald-600">
                      <FileCheck className="w-5 h-5" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Review Project</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-xs text-slate-600 font-bold">
                      <div className="space-y-2 border-r border-slate-100 pr-6">
                        <div className="flex justify-between"><span>Project Name:</span><span className="text-slate-900">{title}</span></div>
                        <div className="flex justify-between"><span>Developer/Builder:</span><span className="text-slate-900">{developer}</span></div>
                        <div className="flex justify-between"><span>RERA ID:</span><span className="text-slate-900 font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{reraId}</span></div>
                        <div className="flex justify-between"><span>Starting Price:</span><span className="text-slate-900 font-black">{formatHelperAmount(price)}</span></div>
                      </div>

                      <div className="space-y-2 pl-2">
                        <div className="flex justify-between"><span>Category:</span><span className="text-slate-900">{projectType === "RESIDENTIAL_PROJECT" ? "Residential Project" : "Commercial Project"}</span></div>
                        <div className="flex justify-between"><span>Construction Status:</span><span className="text-slate-900">{constructionStatus}</span></div>
                        <div className="flex justify-between"><span>Possession Date:</span><span className="text-slate-900">{possessionDate || 'N/A'}</span></div>
                        <div className="flex justify-between"><span>Location Address:</span><span className="text-slate-900 line-clamp-1">{address}, {city}</span></div>
                        
                        {brochureUrl && (
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                            <span>Brochure:</span>
                            <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-extrabold hover:underline flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> View Brochure PDF
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Selected Facilities Display */}
                      <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-2">Facilities / Amenities ({amenities.length})</span>
                        {amenities.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {amenities.map(name => (
                              <span key={name} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg">{name}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 font-semibold italic">No facilities selected.</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-2">Description Layout</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">{description || 'No description provided.'}</p>
                    </div>

                    {/* Photos Gallery View */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Photos Uploaded ({images.length})</span>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {images.map(url => (
                          <div key={url} className="w-24 h-16 rounded-lg overflow-hidden border border-slate-250 shrink-0 bg-slate-100">
                            <img src={url} alt="Review thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Navigation Bar */}
          <div className="flex items-center justify-between mt-8 border-t border-slate-200 pt-6">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0 || isSubmitting}
              className="h-11 px-5 border border-slate-200 text-slate-650 rounded-xl font-bold hover:bg-slate-100 disabled:opacity-40 transition-all uppercase tracking-wider text-xs flex items-center gap-1"
            >
              Back
            </button>

            {currentStep < activeSteps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={isValidatingAddress}
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all uppercase tracking-wider text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {isValidatingAddress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 px-6 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-xl font-bold transition-all uppercase tracking-wider text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Publish Project"
                )}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
