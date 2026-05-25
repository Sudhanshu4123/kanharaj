"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  Info,
  Check,
  Building,
  Home,
  MapPin,
  Maximize2,
  Phone,
  Building2,
  Upload,
  X,
  Loader2,
  IndianRupee,
  Bed,
  Bath,
  Calendar,
  Sofa,
  Car,
  Users,
  ChevronDown,
  ChevronUp,
  Store,
  Warehouse,
  Map,
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  getSellerAuthHeaders,
  getApiErrorMessage,
  mapSellerPropertyType,
  mapSellerListingType,
  parseBedroomsFromBhk,
} from "@/lib/utils"

const steps = [
  { id: 0, label: "Property Details", status: "In progress", score: "" },
  { id: 1, label: "Photos", status: "Pending", score: "Score ↑15%" },
  { id: 2, label: "Verify", status: "Pending", score: "Score ↑20%" },
  { id: 3, label: "Review", status: "Pending", score: "" },
]

export default function AddPropertyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    async function checkSubscription() {
      const userData = localStorage.getItem("seller_user")
      const token = localStorage.getItem("seller_token")
      if (!userData || !token) {
        router.push("/login")
        return
      }
      
      const user = JSON.parse(userData)
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/status`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        
        let plan = user.subscriptionPlan
        if (res.ok) {
          const statusData = await res.json()
          plan = statusData.plan
          
          // Keep local storage synchronized
          const updatedUser = { ...user, subscriptionPlan: plan }
          localStorage.setItem("seller_user", JSON.stringify(updatedUser))
        }
        
        if (plan === "NONE") {
          setHasSubscription(false)
        } else {
          setHasSubscription(true)
        }
      } catch (err) {
        console.error("Subscription validation error", err)
        if (user.subscriptionPlan !== "NONE") {
          setHasSubscription(true)
        } else {
          setHasSubscription(false)
        }
      } finally {
        setLoadingSubscription(false)
      }
    }
    checkSubscription()
  }, [router])

  // Form State
  const [sector, setSector] = useState("Residential")
  const [lookingTo, setLookingTo] = useState("Sell")
  const [city, setCity] = useState("New Delhi")
  const [buildingName, setBuildingName] = useState("")
  const [buildingNameError, setBuildingNameError] = useState("")
  const [propertyType, setPropertyType] = useState("Apartment")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    pincode: "",
    bedrooms: 3,
    bathrooms: 3,
    area: "",
    amenities: [] as string[],
    images: [] as string[]
  })

  // Extended Property Details State from screenshots
  const [bhk, setBhk] = useState("3 BHK")
  const [ageOfProperty, setAgeOfProperty] = useState("")
  const [bathroomCount, setBathroomCount] = useState(3)
  const [balconyCount, setBalconyCount] = useState(1)

  const [furnishType, setFurnishType] = useState("Unfurnished")
  const [furnishings, setFurnishings] = useState<string[]>([])
  const [coveredParking, setCoveredParking] = useState("0")
  const [openParking, setOpenParking] = useState("0")
  const [preferredTenant, setPreferredTenant] = useState("Family")
  const [petFriendly, setPetFriendly] = useState("No")

  const [availableFrom, setAvailableFrom] = useState("")
  const [maintenanceCharges, setMaintenanceCharges] = useState("Include in rent")
  const [securityDeposit, setSecurityDeposit] = useState("None")
  const [lockInPeriod, setLockInPeriod] = useState("None")
  const [brokerageCharge, setBrokerageCharge] = useState("None")
  const [brokerageNegotiable, setBrokerageNegotiable] = useState(false)

  const [carpetArea, setCarpetArea] = useState("")
  const [floorNo, setFloorNo] = useState("")
  const [totalFloors, setTotalFloors] = useState("")
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)

  // Conditional fields states
  const [mealOfferings, setMealOfferings] = useState<string[]>([])
  const [mealSpecialities, setMealSpecialities] = useState<string[]>([])
  const [bachelorPreference, setBachelorPreference] = useState("Open for both")
  const [customMaintenance, setCustomMaintenance] = useState("")
  const [customSecurityDeposit, setCustomSecurityDeposit] = useState("")
  const [customLockInPeriod, setCustomLockInPeriod] = useState("")
  const [customBrokerage, setCustomBrokerage] = useState("")

  // Additional Details states
  const [parkingCharges, setParkingCharges] = useState("Include in rent")
  const [paintingCharges, setPaintingCharges] = useState("None")
  const [customPaintingCharges, setCustomPaintingCharges] = useState("")
  const [facing, setFacing] = useState("")
  const [additionalAddress, setAdditionalAddress] = useState("")
  const [servantRoom, setServantRoom] = useState("No")

  // PG Specific State
  const [locality, setLocality] = useState("")
  const [pgName, setPgName] = useState("")
  const [totalBeds, setTotalBeds] = useState("")
  const [pgFor, setPgFor] = useState("Boys")
  const [bestSuitedFor, setBestSuitedFor] = useState("Students")
  const [mealsAvailable, setMealsAvailable] = useState("Yes")
  const [noticePeriodDays, setNoticePeriodDays] = useState("")
  const [pgLockInDays, setPgLockInDays] = useState("")
  const [pgCommonAreas, setPgCommonAreas] = useState<string[]>([])
  const [propertyManagedBy, setPropertyManagedBy] = useState("Landlord")
  const [managerStaysAtProperty, setManagerStaysAtProperty] = useState("Yes")
  const [pgRules, setPgRules] = useState({
    nonVegAllowed: "No",
    oppositeSexAllowed: "No",
    anyTimeAllowed: "No",
    visitorsAllowed: "No",
    guardianAllowed: "Yes",
    drinkingAllowed: "No",
    smokingAllowed: "No"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (!buildingName) {
        setBuildingNameError("Please fill this to continue")
        return
      }
      if ((furnishType === "Fully Furnished" || furnishType === "Semi Furnished") && furnishings.length < 3) {
        alert("Please add at least 3 flat furnishings to continue.")
        return
      }
      if (!availableFrom) {
        alert("Please fill 'Available From' date.")
        return
      }
      if (!formData.price) {
        alert("Please enter price / rent.")
        return
      }
      if (!floorNo || !totalFloors) {
        alert("Please enter Floor Number and Total Floors.")
        return
      }
    }
    setBuildingNameError("")
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))
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

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
        method: "POST",
        body: data
      })
      const result = await res.json()
      if (result.urls) {
        const absoluteUrls = result.urls.map((url: string) => {
          if (url.startsWith('/api/')) {
            return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${url}`
          }
          return url
        })
        setFormData(prev => ({ ...prev, images: [...prev.images, ...absoluteUrls] }))
      }
    } catch (err) {
      console.error("Upload failed", err)
      alert("Image upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (formData.images.length === 0) {
      alert("Please upload at least one image.")
      return
    }
    const userData = localStorage.getItem("seller_user")
    const authHeaders = getSellerAuthHeaders()
    if (!userData || !authHeaders) {
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      const mappedPropertyType = mapSellerPropertyType(propertyType, sector, lookingTo)
      const bedroomsCount = parseBedroomsFromBhk(bhk)
      const yearBuiltVal = ageOfProperty ? (new Date().getFullYear() - parseInt(ageOfProperty)) : null

      const richDescription = `PROPERTY HIGHLIGHTS:
• BHK: ${bhk}
• Age of Property: ${ageOfProperty ? ageOfProperty + ' years' : 'N/A'}
• Bathrooms: ${bathroomCount}
• Balconies: ${balconyCount}
• Furnish Type: ${furnishType}
${furnishings.length > 0 ? `• Furnishings: ${furnishings.join(', ')}\n` : ''}• Covered Parking: ${coveredParking}
• Open Parking: ${openParking}
• Preferred Tenant: ${preferredTenant}
• Pet Friendly: ${petFriendly}
• Available From: ${availableFrom || 'Immediately'}
• Maintenance: ${maintenanceCharges}
• Security Deposit: ${securityDeposit}
• Lock-in Period: ${lockInPeriod}
• Brokerage Charges: ${brokerageCharge}${brokerageNegotiable ? ' (Negotiable)' : ''}
• Carpet Area: ${carpetArea ? carpetArea + ' Sq. Ft.' : 'N/A'}
• Floor details: Floor ${floorNo} of ${totalFloors}

---

${formData.description}`

      const payload = {
        title: formData.title || `${bhk} ${propertyType} in ${buildingName}`,
        description: richDescription,
        price: parseFloat(formData.price) || 0,
        propertyType: mappedPropertyType,
        listingType: mapSellerListingType(lookingTo),
        address: `${buildingName}, ${formData.address}`,
        city: city,
        state: "Delhi",
        pincode: formData.pincode,
        bedrooms: bedroomsCount,
        bathrooms: bathroomCount,
        area: parseFloat(formData.area) || parseFloat(carpetArea) || 0,
        yearBuilt: yearBuiltVal,
        status: "ACTIVE",
        images: formData.images,
        amenities: formData.amenities,
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert("Property Posted Successfully!")
        router.push("/listings")
      } else if (res.status === 401) {
        alert("Session expired. Please login again.")
        router.push("/login")
      } else if (res.status === 403) {
        alert("Only seller accounts can post properties. Please check your account role.")
      } else {
        const message = await getApiErrorMessage(res, "Failed to post property")
        alert(message)
      }
    } catch (err) {
      alert("Error connecting to server.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingSubscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-[#6C4EF2]" size={40} />
        <p className="text-slate-500 font-bold">Verifying subscription status...</p>
      </div>
    )
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-xl border border-slate-100 relative overflow-hidden"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-[#6C4EF2] to-amber-500"></div>
          
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building2 size={36} />
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Active Subscription Required</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            To prevent spam and keep Kanharaj.com exclusive, listing new properties is restricted to active subscribers. Please upgrade your plan to unlock property submissions.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/subscription"
              className="block w-full py-4 rounded-xl text-center font-bold text-sm bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Choose a Subscription Plan
            </Link>
            
            <Link
              href="/listings"
              className="block w-full py-4 rounded-xl text-center font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-10">

      {/* Top Decoration */}
      <div className="h-14 bg-[#B5915F] w-full hidden md:block rounded-b-3xl"></div>

      <div className="max-w-[1100px] mx-auto mt-0 md:-mt-4 px-4 flex flex-col md:flex-row gap-6 items-start relative z-10">

        {/* ── Left Sidebar ── */}
        <aside className="w-full md:w-[280px] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">

          <Link href="/listings" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Return to dashboard
          </Link>

          <h1 className="text-xl font-black text-slate-900 leading-tight">Post your property</h1>
          <p className="text-sm font-medium text-slate-500 mb-6">Sell or rent your property</p>

          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 w-[26%]" />
            </div>
            <span className="text-[10px] font-black text-slate-700 flex items-center gap-1">
              26% <Info className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          {/* Stepper */}
          <div className="relative pl-3 space-y-8 before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
            {steps.map((step, idx) => {
              const isPast = currentStep > idx
              const isActive = currentStep === idx
              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white transition-colors ${isPast ? "bg-[#6C4EF2] text-white" : isActive ? "bg-white border-[3px] border-[#6C4EF2]" : "bg-slate-100 text-slate-400"
                    }`}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-[#6C4EF2]" /> : null}
                  </div>
                  <div className="flex flex-col -mt-0.5">
                    <span className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                      {step.label}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${isActive ? "bg-purple-50 text-[#6C4EF2]" : "bg-transparent text-slate-400 border border-slate-200"
                        }`}>
                        {isActive ? "In progress" : step.status}
                      </span>
                      {step.score && (
                        <span className="text-[9px] font-black text-emerald-600">{step.score}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex items-center gap-1 text-xs font-medium text-slate-500">
            Need Help? <Phone className="w-3.5 h-3.5 text-[#6C4EF2] ml-1" /> <a href="tel:08048811281" className="font-bold text-[#6C4EF2] hover:underline">Call 08048811281</a>
          </div>
        </aside>

        {/* ── Main Form Area ── */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 w-full min-h-[600px] flex flex-col">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* STEP 0: Property Details (Consolidated Form) */}
              {currentStep === 0 && (
                <div className="space-y-12 max-w-2xl mx-auto">

                  <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50 space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-800">Add Property Details</h2>
                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Please fill in all the details of your property
                    </p>
                  </div>

                  {/* Property Type Group */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                      Property Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {["Residential", "Commercial"].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setSector(t);
                            setPropertyType(t === "Commercial" ? "Office" : "Apartment");
                            if (t === "Commercial" && lookingTo === "PG/Co-living") {
                              setLookingTo("Rent");
                            }
                          }}
                          className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${sector === t ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Looking to */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                      Looking to <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {(sector === "Commercial" ? ["Rent", "Sell"] : ["Rent", "Sell", "PG/Co-living"]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setLookingTo(t)}
                          className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${lookingTo === t ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">City <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors"
                      placeholder="City Name"
                    />
                  </div>

                  {/* Building Name */}
                  {sector !== "Commercial" && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1 transition-colors group-focus-within:text-[#6C4EF2]">
                        Building / Apartment / Society Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={buildingName}
                        onChange={e => { setBuildingName(e.target.value); setBuildingNameError("") }}
                        className={`w-full text-base font-bold text-slate-800 pb-2 border-b outline-none transition-colors ${buildingNameError ? "border-rose-500" : "border-slate-200 focus:border-[#6C4EF2]"
                          }`}
                        placeholder="e.g. DLF Phase 1"
                      />
                      {buildingNameError && (
                        <p className="text-xs font-bold text-rose-500 mt-1">{buildingNameError}</p>
                      )}
                    </div>
                  )}

                  {lookingTo === "PG/Co-living" ? (
                    <div className="space-y-8">
                      {/* Locality */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1 transition-colors group-focus-within:text-[#6C4EF2]">
                          Locality <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={locality}
                          onChange={e => setLocality(e.target.value)}
                          className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors"
                        />
                        {!locality && (
                          <p className="text-xs font-bold text-rose-500 mt-1">Please select a valid locality</p>
                        )}
                      </div>

                      <div className="pt-4">
                        <h3 className="text-sm font-black text-slate-800 mb-6 uppercase">PG DETAILS</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">PG Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={pgName} onChange={e => setPgName(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Total Beds <span className="text-rose-500">*</span></label>
                            <input type="number" value={totalBeds} onChange={e => setTotalBeds(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-3">PG is for <span className="text-rose-500">*</span></label>
                              <div className="flex gap-3">
                                {["Girls", "Boys"].map(opt => (
                                  <button key={opt} type="button" onClick={() => setPgFor(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${pgFor === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-3">Best suited for <span className="text-rose-500">*</span></label>
                              <div className="flex gap-3">
                                {["Students", "Professionals"].map(opt => (
                                  <button key={opt} type="button" onClick={() => setBestSuitedFor(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${bestSuitedFor === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-3">Meals Available <span className="text-rose-500">*</span></label>
                            <div className="flex gap-3">
                              {["Yes", "No"].map(opt => (
                                <button key={opt} type="button" onClick={() => setMealsAvailable(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${mealsAvailable === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                              ))}
                            </div>
                          </div>
                          
                          {mealsAvailable === "Yes" && (
                            <div className="space-y-6 pt-2">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 mb-3">Meal Offerings <span className="text-rose-500">*</span></label>
                                <div className="flex flex-wrap gap-3">
                                  {["Breakfast", "Lunch", "Dinner"].map(opt => {
                                    const isSelected = mealOfferings.includes(opt)
                                    return (
                                      <button key={opt} type="button" onClick={() => {
                                        if (isSelected) setMealOfferings(prev => prev.filter(a => a !== opt))
                                        else setMealOfferings(prev => [...prev, opt])
                                      }} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                    )
                                  })}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 mb-3">Meal Speciality (Optional)</label>
                                <div className="flex flex-wrap gap-3">
                                  {["Punjabi", "South Indian", "Andhra", "North Indian", "Others"].map(opt => {
                                    const isSelected = mealSpecialities.includes(opt)
                                    return (
                                      <button key={opt} type="button" onClick={() => {
                                        if (isSelected) setMealSpecialities(prev => prev.filter(a => a !== opt))
                                        else setMealSpecialities(prev => [...prev, opt])
                                      }} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Notice Period (Days) <span className="text-rose-500">*</span></label>
                              <input type="number" value={noticePeriodDays} onChange={e => setNoticePeriodDays(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Lock in Period (Days) <span className="text-rose-500">*</span></label>
                              <input type="number" value={pgLockInDays} onChange={e => setPgLockInDays(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-3">Common Areas <span className="text-rose-500">*</span></label>
                            <div className="flex flex-wrap gap-3">
                              {["Living Room", "Kitchen", "Dining Hall", "Study Room / Library", "Breakout Room"].map(opt => {
                                const isSelected = pgCommonAreas.includes(opt)
                                return (
                                  <button key={opt} type="button" onClick={() => {
                                    if (isSelected) setPgCommonAreas(prev => prev.filter(a => a !== opt))
                                    else setPgCommonAreas(prev => [...prev, opt])
                                  }} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 mb-6 uppercase">OWNER / CARETAKER DETAILS</h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-3">Property Managed By <span className="text-rose-500">*</span></label>
                            <div className="flex flex-wrap gap-3">
                              {["Landlord", "Caretaker", "Dedicated Professional"].map(opt => (
                                <button key={opt} type="button" onClick={() => setPropertyManagedBy(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${propertyManagedBy === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-3">Property Manager stays at Property <span className="text-rose-500">*</span></label>
                            <div className="flex gap-3">
                              {["Yes", "No"].map(opt => (
                                <button key={opt} type="button" onClick={() => setManagerStaysAtProperty(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${managerStaysAtProperty === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 mb-6 uppercase">PG RULES</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {(Object.entries({
                            "Non Veg Allowed": "nonVegAllowed",
                            "Opposite Sex Allowed": "oppositeSexAllowed",
                            "Any Time Allowed": "anyTimeAllowed",
                            "Visitors Allowed": "visitorsAllowed",
                            "Guardian Allowed": "guardianAllowed",
                            "Drinking Allowed": "drinkingAllowed",
                            "Smoking Allowed": "smokingAllowed"
                          })).map(([label, key]) => (
                            <div key={key}>
                              <label className="block text-xs font-bold text-slate-500 mb-3">{label} <span className="text-rose-500">*</span></label>
                              <div className="flex gap-3">
                                {["Yes", "No"].map(opt => (
                                  <button key={opt} type="button" onClick={() => setPgRules(prev => ({ ...prev, [key]: opt }))} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${pgRules[key as keyof typeof pgRules] === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-8">
                        <button
                          onClick={handleNext}
                          className="w-full py-4 rounded-xl text-base font-bold bg-[#38D39F] text-white hover:bg-[#2bc490] transition-colors shadow-lg shadow-emerald-200/50"
                        >
                          Continues
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Specific Property Type Icons */}
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-1">
                          Sub Property Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {(sector === "Commercial" ? [
                            { name: "Office", icon: Building },
                            { name: "Retail Shop", icon: Store },
                            { name: "Showroom", icon: Store },
                            { name: "Warehouse", icon: Warehouse },
                            { name: "Plot", icon: Map },
                            { name: "Others", icon: MoreHorizontal }
                          ] : [
                            { name: "Apartment", icon: Building },
                            { name: "Independent House", icon: Home },
                            { name: "Duplex", icon: Building2 },
                            { name: "Independent Floor", icon: Maximize2 },
                            { name: "Villa", icon: Home },
                            { name: "Penthouse", icon: Building2 },
                            { name: "Studio", icon: Building },
                            ...(lookingTo === "Sell" ? [
                              { name: "Plot", icon: Map },
                              { name: "Farm House", icon: Home },
                              { name: "Agricultural Land", icon: Map }
                            ] : [
                              { name: "Farm House", icon: Home }
                            ])
                          ]).map(type => (
                            <button
                              key={type.name}
                              type="button"
                              onClick={() => setPropertyType(type.name)}
                              className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl border transition-all ${propertyType === type.name
                                ? "bg-[#efe8ff] border-[#d8cdfc] text-[#6C4EF2]"
                                : "bg-white border-slate-200 text-slate-500 hover:border-[#6C4EF2] hover:text-[#6C4EF2]"
                                }`}
                            >
                              <type.icon strokeWidth={1.5} className={`w-8 h-8 mb-2 ${propertyType === type.name ? 'text-[#6C4EF2]' : 'text-slate-300'}`} />
                              <span className="text-[11px] font-bold text-center leading-tight px-1">
                                {type.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {sector !== "Commercial" ? (
                        <>
                          <hr className="border-slate-100" />

                          {/* BHK details */}
                          {propertyType !== "Apartment" && (
                            <div>
                              <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                                BHK <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-3">
                                {["1 RK", "1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "4.5 BHK", "5 BHK", "5+ BHK"].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setBhk(val)}
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${bhk === val
                                      ? "bg-[#efe8ff] border-[#d8cdfc] text-[#6C4EF2]"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Built Up Area & Age of Property */}
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                Built Up Area <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  name="area"
                                  value={formData.area}
                                  onChange={handleInputChange}
                                  type="number"
                                  className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors pr-12"
                                />
                                <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">Sq. ft.</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
                                <span>Age of Property (in years) <span className="text-rose-500">*</span></span>
                                <Info className="w-4 h-4 text-slate-400" />
                              </label>
                              <input
                                type="number"
                                value={ageOfProperty}
                                onChange={e => setAgeOfProperty(e.target.value)}
                                className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors"
                              />
                            </div>
                          </div>

                          {/* Bathroom & Balcony */}
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                                Bathroom <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-3">
                                {[1, 2, 3, 4].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setBathroomCount(val)}
                                    className={`w-12 h-12 rounded-xl border text-sm font-bold transition-all ${bathroomCount === val
                                      ? "bg-[#efe8ff] border-[#d8cdfc] text-[#6C4EF2]"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                                Balcony <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-3">
                                {[0, 1, 2, 3, 4].map(val => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setBalconyCount(val)}
                                    className={`w-12 h-12 rounded-xl border text-sm font-bold transition-all ${balconyCount === val
                                      ? "bg-[#efe8ff] border-[#d8cdfc] text-[#6C4EF2]"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Furnish Type */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Furnish Type <span className="text-rose-500">*</span></label>
                            <div className="flex gap-3">
                              {[
                                { name: "Fully Furnished", icon: Sofa },
                                { name: "Semi Furnished", icon: Sofa },
                                { name: "Unfurnished", icon: Sofa },
                              ].map(opt => {
                                const isSelected = furnishType === opt.name
                                return (
                                  <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => setFurnishType(opt.name)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${isSelected
                                      ? "bg-[#efe8ff] border-[#d8cdfc] text-[#6C4EF2]"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    <opt.icon size={16} className={isSelected ? "text-[#6C4EF2]" : "text-slate-400"} />
                                    {opt.name}
                                  </button>
                                )
                              })}
                            </div>

                            {furnishType !== "Unfurnished" && (
                              <div className="mt-4 space-y-3">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase">Select Furnishings / Amenities</label>
                                <div className="flex flex-wrap gap-2">
                                  {["Sofa", "TV", "Bed", "AC", "Refrigerator", "Wardrobe", "Geyser", "Washing Machine", "Dining Table", "Microwave"].map(item => {
                                    const isChecked = furnishings.includes(item)
                                    return (
                                      <button
                                        key={item}
                                        type="button"
                                        onClick={() => {
                                          if (isChecked) {
                                            setFurnishings(prev => prev.filter(x => x !== item))
                                          } else {
                                            setFurnishings(prev => [...prev, item])
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isChecked
                                          ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]"
                                          : "bg-white text-slate-500 border-slate-200 hover:border-[#6C4EF2]"
                                          }`}
                                      >
                                        {isChecked ? "✓ " : "+ "} {item}
                                      </button>
                                    )
                                  })}
                                </div>
                                {furnishings.length < 3 && (
                                  <p className="text-xs font-bold text-rose-500 mt-1">Please add atleast 3 flat furnishings to continue</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Parking Details */}
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Covered Parking <span className="text-rose-500">*</span></label>
                              <div className="flex gap-2">
                                {["0", "1", "2", "3", "3+"].map(num => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setCoveredParking(num)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${coveredParking === num ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Open Parking <span className="text-rose-500">*</span></label>
                              <div className="flex gap-2">
                                {["0", "1", "2", "3", "3+"].map(num => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setOpenParking(num)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${openParking === num ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Tenant Type & Pets */}
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Preferred Tenant Type</label>
                              <div className="flex gap-2">
                                {["Family", "Bachelors", "Company"].map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => setPreferredTenant(type)}
                                    className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${preferredTenant === type
                                      ? "bg-[#efe8ff] border-[#d8cdfc] text-[#6C4EF2]"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                              {preferredTenant === "Bachelors" && (
                                <div className="mt-6">
                                  <label className="block text-xs font-bold text-slate-500 mb-3">Select your preference for bachelors</label>
                                  <div className="flex gap-3">
                                    {["Open for both", "Men Only", "Women Only"].map(opt => (
                                      <button key={opt} type="button" onClick={() => setBachelorPreference(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${bachelorPreference === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                                Pet Friendly?
                                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                              </label>
                              <div className="flex gap-2">
                                {["Yes", "No"].map(opt => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setPetFriendly(opt)}
                                    className={`w-16 py-2.5 rounded-xl border text-sm font-bold transition-all ${petFriendly === opt
                                      ? "bg-[#efe8ff] border-[#d8cdfc] text-[#6C4EF2]"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Available From & Rent/Price */}
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Available From <span className="text-rose-500">*</span></label>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                  type="date"
                                  value={availableFrom}
                                  onChange={e => setAvailableFrom(e.target.value)}
                                  className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                {lookingTo === "Rent" ? "Monthly Rent (in ₹)" : "Price (in ₹)"} <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                  name="price"
                                  value={formData.price}
                                  onChange={handleInputChange}
                                  type="number"
                                  placeholder={lookingTo === "Rent" ? "25000" : "7500000"}
                                  className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Maintenance Charges */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Maintenance Charges <span className="text-rose-500">*</span></label>
                            <div className="flex gap-3">
                              {["Include in rent", "Separate"].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setMaintenanceCharges(opt)}
                                  className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${maintenanceCharges === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                                    }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            {maintenanceCharges === "Separate" && (
                              <div className="mt-6">
                                <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Maintenance Charges (per month) <span className="text-rose-500">*</span></label>
                                <input type="number" value={customMaintenance} onChange={e => setCustomMaintenance(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" />
                              </div>
                            )}
                          </div>

                          {/* Security Deposit & Lock-in Period */}
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Security Deposit <span className="text-rose-500">*</span></label>
                              <div className="flex flex-wrap gap-2">
                                {["None", "1 month", "2 month", "Custom"].map(opt => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setSecurityDeposit(opt)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${securityDeposit === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                              {securityDeposit === "Custom" && (
                                <div className="mt-6">
                                  <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Security Deposit <span className="text-rose-500">*</span></label>
                                  <input type="text" value={customSecurityDeposit} onChange={e => setCustomSecurityDeposit(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" />
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lock-in Period <span className="text-rose-500">*</span></label>
                              <div className="flex flex-wrap gap-2">
                                {["None", "1 month", "6 month", "Custom"].map(opt => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setLockInPeriod(opt)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${lockInPeriod === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                                      }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                              {lockInPeriod === "Custom" && (
                                <div className="mt-6 relative">
                                  <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Lock in Period <span className="text-rose-500">*</span></label>
                                  <input type="number" value={customLockInPeriod} onChange={e => setCustomLockInPeriod(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors pr-16" />
                                  <span className="absolute right-0 bottom-2 text-sm font-bold text-slate-400">months</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Do you charge brokerage? */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Do you charge brokerage? <span className="text-rose-500">*</span></label>
                            <div className="flex flex-wrap gap-2 items-center">
                              {["None", "15 Days", "30 Days", "Custom"].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setBrokerageCharge(opt)}
                                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${brokerageCharge === opt ? "bg-[#efe8ff] text-[#6C4EF2] border-[#d8cdfc]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2]"
                                    }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            
                            {brokerageCharge === "Custom" && (
                              <div className="mt-6 space-y-4">
                                <div>
                                  <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Brokerage (in Rupees) <span className="text-rose-500">*</span></label>
                                  <input type="number" value={customBrokerage} onChange={e => setCustomBrokerage(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer w-fit border border-slate-200 rounded-lg px-4 py-3 hover:border-[#6C4EF2] transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={brokerageNegotiable}
                                    onChange={e => setBrokerageNegotiable(e.target.checked)}
                                    className="rounded text-[#6C4EF2] focus:ring-[#6C4EF2] w-4 h-4"
                                  />
                                  <span className="text-sm font-medium text-slate-800">Brokerage Negotiable</span>
                                </label>
                              </div>
                            )}
                            {brokerageCharge !== "Custom" && brokerageCharge !== "None" && (
                              <div className="mt-4">
                                <label className="flex items-center gap-2 cursor-pointer w-fit border border-slate-200 rounded-lg px-4 py-3 hover:border-[#6C4EF2] transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={brokerageNegotiable}
                                    onChange={e => setBrokerageNegotiable(e.target.checked)}
                                    className="rounded text-[#6C4EF2] focus:ring-[#6C4EF2] w-4 h-4"
                                  />
                                  <span className="text-sm font-medium text-slate-800">Brokerage Negotiable</span>
                                </label>
                              </div>
                            )}
                          </div>

                          <hr className="border-slate-100" />

                          {/* Carpet Area & Floors */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Super Area (Sq. Ft.)</label>
                              <div className="relative">
                                <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                  name="area"
                                  value={formData.area}
                                  onChange={handleInputChange}
                                  type="number"
                                  placeholder="1500"
                                  className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Carpet Area (Sq. Ft.)</label>
                              <div className="relative">
                                <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                  type="number"
                                  value={carpetArea}
                                  onChange={e => setCarpetArea(e.target.value)}
                                  placeholder="1200"
                                  className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Floor No <span className="text-rose-500">*</span></label>
                                <input
                                  type="number"
                                  value={floorNo}
                                  onChange={e => setFloorNo(e.target.value)}
                                  placeholder="3"
                                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Floors <span className="text-rose-500">*</span></label>
                                <input
                                  type="number"
                                  value={totalFloors}
                                  onChange={e => setTotalFloors(e.target.value)}
                                  placeholder="12"
                                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Local Address & Pincode */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Local Address / Area Details</label>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  type="text"
                                  placeholder="Flat 302, Block C, near Park"
                                  className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pincode</label>
                              <input
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                type="text"
                                placeholder="110001"
                                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold transition-all"
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows={4}
                              placeholder="Tell buyers about your property..."
                              className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#6C4EF2]/20 focus:border-[#6C4EF2] outline-none text-sm font-semibold resize-none transition-all"
                            />
                          </div>

                          {/* Additional Details Accordion */}
                          <div className="border border-purple-100 rounded-xl overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                              className="w-full flex items-center justify-between p-4 bg-purple-50/40 hover:bg-purple-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">Add Additional Details</span>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Score ↑5%</span>
                              </div>
                              {showAdditionalDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                            </button>

                            <AnimatePresence>
                              {showAdditionalDetails && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "auto" }}
                                  exit={{ height: 0 }}
                                  className="overflow-hidden bg-white border-t border-purple-100/50"
                                >
                                  <div className="p-6 space-y-10">
                                    {/* Parking Charges */}
                                    <div>
                                      <label className="block text-sm font-semibold text-slate-400 mb-4">Parking Charges</label>
                                      <div className="flex flex-wrap gap-4">
                                        {["Include in rent", "Separate"].map(opt => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setParkingCharges(opt)}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${parkingCharges === opt ? "bg-white border-slate-300 text-slate-800 shadow-sm" : "bg-white border-slate-100 text-slate-800"}`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Painting Charges */}
                                    <div>
                                      <label className="block text-sm font-semibold text-slate-400 mb-4">Painting Charges</label>
                                      <div className="flex flex-wrap gap-4">
                                        {["None", "As per cost", "1 month", "Custom"].map(opt => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setPaintingCharges(opt)}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${paintingCharges === opt ? "bg-white border-slate-300 text-slate-800 shadow-sm" : "bg-white border-slate-100 text-slate-800"}`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                      {paintingCharges === "Custom" && (
                                        <div className="mt-4">
                                          <input type="text" value={customPaintingCharges} onChange={e => setCustomPaintingCharges(e.target.value)} className="w-full text-base font-semibold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#6C4EF2] outline-none transition-colors" placeholder="Enter custom amount" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Facing */}
                                    <div>
                                      <label className="block text-sm font-semibold text-slate-400 mb-4">Facing</label>
                                      <div className="flex flex-wrap gap-4">
                                        {["North", "East", "West", "South", "North - East", "North - West", "South - East", "South - West"].map(opt => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setFacing(opt)}
                                            className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${facing === opt ? "bg-white border-slate-300 text-slate-800 shadow-sm" : "bg-white border-slate-100 text-slate-800"}`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                      <label className="block text-lg font-semibold text-slate-400 mb-2">Address</label>
                                      <input
                                        type="text"
                                        value={additionalAddress}
                                        onChange={e => setAdditionalAddress(e.target.value)}
                                        className="w-full text-base font-semibold text-slate-800 pb-2 border-b border-slate-200 outline-none"
                                      />
                                    </div>

                                    {/* Servant Room */}
                                    <div>
                                      <label className="block text-sm font-semibold text-slate-400 mb-4">Servant Room</label>
                                      <div className="flex flex-wrap gap-4">
                                        {["Yes", "No"].map(opt => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setServantRoom(opt)}
                                            className={`px-8 py-2.5 rounded-xl text-sm font-medium border transition-colors ${servantRoom === opt ? "bg-white border-slate-300 text-slate-800 shadow-sm" : "bg-white border-slate-100 text-slate-800"}`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </>
                      ) : (
                        <div className="pt-4">
                          <button
                            onClick={handleNext}
                            className="w-full py-4 rounded-xl text-base font-bold bg-[#38D39F] text-white hover:bg-[#2bc490] transition-colors shadow-lg shadow-emerald-200/50"
                          >
                            Continues
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* STEP 1: Photos */}
              {currentStep === 1 && (
                <div className="space-y-6 max-w-3xl">
                  <h2 className="text-xl font-black text-slate-800 border-b border-slate-50 pb-4">Upload Photos</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl border border-slate-200 overflow-hidden relative group shadow-sm">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-1.5 rounded-lg text-rose-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#6C4EF2] hover:bg-purple-50 transition-all">
                      {uploading ? (
                        <Loader2 className="animate-spin text-[#6C4EF2]" size={24} />
                      ) : (
                        <>
                          <Upload className="text-slate-400 mb-2" size={24} />
                          <span className="text-[11px] font-bold text-slate-600">Add Photos</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100/50 flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                      Add at least 3 high-quality photos. Only images are allowed (JPG, PNG, WEBP). Properties with more photos tend to get 3x more views!
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Verify */}
              {currentStep === 2 && (
                <div className="space-y-6 max-w-2xl">
                  <h2 className="text-xl font-black text-slate-800 border-b border-slate-50 pb-4">Verify Listing</h2>
                  <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6C4EF2] text-white flex items-center justify-center font-bold">✓</div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Listing Verification Check</h3>
                        <p className="text-xs text-slate-500 font-medium">Verify your details to get a verified tag on your property listing.</p>
                      </div>
                    </div>
                    <hr className="border-purple-100" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Contact Number Verified</span>
                        <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Verified</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Ownership Status Declaration</span>
                        <span className="text-[#6C4EF2] hover:underline cursor-pointer font-bold">Declared</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6 max-w-2xl text-center py-10">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                    <Check strokeWidth={3} className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">You're all set!</h2>
                  <p className="text-slate-500 text-sm">Review your details and publish your property to reach thousands of potential buyers.</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Form Actions Footer */}
          {!(currentStep === 0 && (sector === "Commercial" || lookingTo === "PG/Co-living")) && (
            <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                Back
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold bg-[#6C4EF2] text-white hover:bg-[#5a3fd4] transition-colors shadow-lg shadow-purple-200 flex items-center gap-2"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || formData.images.length === 0}
                  className="px-8 py-2.5 rounded-lg text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Property'}
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
