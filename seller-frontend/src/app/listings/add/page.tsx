"use client"

import { useState, useEffect, useRef } from "react"
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
  MoreHorizontal,
  Video,
  Lock,
  ShieldCheck,
  Fingerprint,
  Server,
  WashingMachine,
  Microwave,
  Droplet,
  Trophy,
  Tv,
  Coffee,
  Cookie,
  Shirt,
  Brush,
  Wifi,
  Dumbbell,
  Droplets,
  Waves,
  Zap
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { topCities, otherCities } from "@/lib/cities"
import { getApiUrl } from "@/lib/auth"
import {
  getSellerAuthHeaders,
  getApiErrorMessage,
  mapSellerPropertyType,
  mapSellerListingType,
  parseBedroomsFromBhk,
} from "@/lib/utils"

export default function AddPropertyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [freePostsUsed, setFreePostsUsed] = useState(0)
  const [freePostsLimit, setFreePostsLimit] = useState(3)
  const [subscriptionPlan, setSubscriptionPlan] = useState("NONE")

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
        const res = await fetch(`${getApiUrl()}/payments/status`, {
          headers: { "Authorization": `Bearer ${token}` }
        })

        let plan = user.subscriptionPlan
        let postsUsed = 0
        let postsLimit = 3
        if (res.ok) {
          const statusData = await res.json()
          plan = statusData.plan
          postsUsed = statusData.freePostsUsed ?? 0
          postsLimit = statusData.freePostsLimit ?? 3

          setFreePostsUsed(postsUsed)
          setFreePostsLimit(postsLimit)
          setSubscriptionPlan(plan)

          // Keep local storage synchronized
          const updatedUser = { ...user, subscriptionPlan: plan }
          localStorage.setItem("seller_user", JSON.stringify(updatedUser))
        }

        if (plan === "NONE" && postsUsed >= postsLimit) {
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
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
  const [preferredTenant, setPreferredTenant] = useState<string[]>(["Family"])
  const [petFriendly, setPetFriendly] = useState("No")

  const [availableFrom, setAvailableFrom] = useState("")
  const [maintenanceCharges, setMaintenanceCharges] = useState("Include in rent")
  const [securityDeposit, setSecurityDeposit] = useState("None")
  const [lockInPeriod, setLockInPeriod] = useState("None")
  const [brokerageCharge, setBrokerageCharge] = useState("None")
  const [brokerageNegotiable, setBrokerageNegotiable] = useState(false)
  const [transactionType, setTransactionType] = useState("New Booking")
  const [possessionStatus, setPossessionStatus] = useState("")
  const [possessionDate, setPossessionDate] = useState("")
  const [constructionStatus, setConstructionStatus] = useState("Ready to Move")

  const [carpetArea, setCarpetArea] = useState("")
  const [floorNo, setFloorNo] = useState("")
  const [totalFloors, setTotalFloors] = useState("")
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false)
  const [areaUnit, setAreaUnit] = useState("Sq. Ft.")
  const [plotLength, setPlotLength] = useState("")
  const [plotWidth, setPlotWidth] = useState("")
  const [facingRoadWidth, setFacingRoadWidth] = useState("")

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
  const [customParkingCharges, setCustomParkingCharges] = useState("")
  const [paintingCharges, setPaintingCharges] = useState("None")
  const [customPaintingCharges, setCustomPaintingCharges] = useState("")
  const [facing, setFacing] = useState("")
  const [additionalAddress, setAdditionalAddress] = useState("")
  const [servantRoom, setServantRoom] = useState("No")
  const [reraId, setReraId] = useState("")

  // PG Specific State
  const [locality, setLocality] = useState("")
  const [pgName, setPgName] = useState("")
  const [totalBeds, setTotalBeds] = useState("")
  const [pgFor, setPgFor] = useState<string[]>(["Boys"])
  const [bestSuitedFor, setBestSuitedFor] = useState<string[]>(["Students"])
  const [mealsAvailable, setMealsAvailable] = useState("Yes")
  const [noticePeriodDays, setNoticePeriodDays] = useState("")
  const [pgLockInDays, setPgLockInDays] = useState("")
  const [pgCommonAreas, setPgCommonAreas] = useState<string[]>([])
  const [propertyManagedBy, setPropertyManagedBy] = useState("Landlord")
  const [managerStaysAtProperty, setManagerStaysAtProperty] = useState("Yes")
  const [onetimeMoveInCharges, setOnetimeMoveInCharges] = useState("")
  const [mealChargesPerMonth, setMealChargesPerMonth] = useState("")
  const [electricityChargesPerMonth, setElectricityChargesPerMonth] = useState("")

  const [pgRules, setPgRules] = useState({
    nonVegAllowed: "No",
    oppositeSexAllowed: "No",
    anyTimeAllowed: "No",
    visitorsAllowed: "No",
    guardianAllowed: "Yes",
    drinkingAllowed: "No",
    smokingAllowed: "No"
  })

  // Commercial Specific State
  const [zoneType, setZoneType] = useState("Commercial")
  const [locationHub, setLocationHub] = useState("Others")
  const [customLocationHub, setCustomLocationHub] = useState("")
  const [propertyCondition, setPropertyCondition] = useState("Ready to use")
  const [electricityChargesIncluded, setElectricityChargesIncluded] = useState("No")
  const [waterChargesIncluded, setWaterChargesIncluded] = useState("No")
  const [expectedRentIncrease, setExpectedRentIncrease] = useState("")
  const [dgUpsChargesIncluded, setDgUpsChargesIncluded] = useState("No")
  const [ownership, setOwnership] = useState("Freehold")
  const [priceNegotiable, setPriceNegotiable] = useState("No")

  // Room Details State
  const [rooms, setRooms] = useState<Array<{
    roomType: string;
    totalBeds: string;
    rent: string;
    securityDeposit: string;
    facilities: string[];
  }>>([
    { roomType: "Private Room", totalBeds: "", rent: "", securityDeposit: "", facilities: [] }
  ])

  const addRoom = () => {
    setRooms(prev => [...prev, { roomType: "Private Room", totalBeds: "", rent: "", securityDeposit: "", facilities: [] }])
  }

  const deleteRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(prev => prev.filter((_, i) => i !== index))
    }
  }

  const activeSteps = lookingTo === "PG/Co-living" ? [
    { id: 0, label: "Property Details", status: currentStep > 0 ? "Completed" : "In progress", score: "" },
    { id: 1, label: "Room Details", status: currentStep > 1 ? "Completed" : currentStep === 1 ? "In progress" : "Pending", score: "" },
    { id: 2, label: "Amenities", status: currentStep > 2 ? "Completed" : currentStep === 2 ? "In progress" : "Pending", score: "" },
    { id: 3, label: "Other Details", status: currentStep > 3 ? "Completed" : currentStep === 3 ? "In progress" : "Pending", score: "" },
    { id: 4, label: "Photos", status: currentStep > 4 ? "Completed" : currentStep === 4 ? "In progress" : "Pending", score: "Score ↑15%" },
    { id: 5, label: "Review", status: currentStep === 5 ? "In progress" : "Pending", score: "" },
  ] : sector === "Commercial" ? [
    { id: 0, label: "Basic Details", status: currentStep > 0 ? "Completed" : "In progress", score: "" },
    { id: 1, label: "Property Details", status: currentStep > 1 ? "Completed" : currentStep === 1 ? "In progress" : "Pending", score: "" },
    { id: 2, label: "Amenities", status: currentStep > 2 ? "Completed" : currentStep === 2 ? "In progress" : "Pending", score: "" },
    { id: 3, label: "Photos", status: currentStep > 3 ? "Completed" : currentStep === 3 ? "In progress" : "Pending", score: "Score ↑15%" },
    { id: 4, label: "Review", status: currentStep === 4 ? "In progress" : "Pending", score: "" },
  ] : [
    { id: 0, label: "Property Details", status: currentStep > 0 ? "Completed" : "In progress", score: "" },
    { id: 1, label: "Photos", status: currentStep > 1 ? "Completed" : currentStep === 1 ? "In progress" : "Pending", score: "Score ↑15%" },
    { id: 2, label: "Verify", status: currentStep > 2 ? "Completed" : currentStep === 2 ? "In progress" : "Pending", score: "Score ↑20%" },
    { id: 3, label: "Review", status: currentStep === 3 ? "In progress" : "Pending", score: "" },
  ]

  const getProgressPercent = () => {
    if (lookingTo === "PG/Co-living") {
      const percents = [5, 14, 30, 50, 75, 95];
      return percents[currentStep] || 5;
    } else if (sector === "Commercial") {
      const percents = [10, 25, 50, 75, 95];
      return percents[currentStep] || 10;
    } else {
      const percents = [26, 50, 75, 100];
      return percents[currentStep] || 26;
    }
  }
  const progressPercent = getProgressPercent()
  const currentStepName = activeSteps[currentStep]?.label || ""

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const formatHelperAmount = (numStr: string) => {
    const val = parseFloat(numStr)
    if (isNaN(val) || val <= 0) return ""
    if (val < 1000) {
      return `₹ ${val}`
    }
    if (val < 100000) {
      const k = val / 1000
      return `₹ ${Number(k.toFixed(2))}k`
    }
    if (val < 10000000) {
      const lac = val / 100000
      return `₹ ${Number(lac.toFixed(2))} Lac${lac > 1 ? "s" : ""}`
    }
    const cr = val / 10000000
    return `₹ ${Number(cr.toFixed(2))} Cr${cr > 1 ? "s" : ""}`
  }

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-" || e.key === ".") {
      e.preventDefault()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (value !== "") {
      const parsed = parseFloat(value)
      if (parsed < 0) {
        return
      }
      if (name === "price") {
        if (lookingTo === "Rent" && parsed > 100000000) {
          return
        }
        if (lookingTo === "Sell" && parsed > 10000000000) {
          return
        }
      }
      if (name === "area" && parsed > 100000) {
        return
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (lookingTo === "PG/Co-living") {
      if (currentStep === 0) {
        if (!buildingName) {
          setBuildingNameError("Please fill this to continue")
          return
        }
        if (!locality) {
          alert("Please select/enter a valid locality.")
          return
        }
        if (!pgName) {
          alert("Please enter PG Name.")
          return
        }
        if (!totalBeds) {
          alert("Please enter Total Beds.")
          return
        }
        if (!pgFor || pgFor.length === 0) {
          alert("Please select who PG is for.")
          return
        }
        if (!bestSuitedFor || bestSuitedFor.length === 0) {
          alert("Please select who PG is best suited for.")
          return
        }
        if (mealsAvailable === "Yes" && mealOfferings.length === 0) {
          alert("Please select at least one meal offering.")
          return
        }
        if (!noticePeriodDays) {
          alert("Please enter Notice Period.")
          return
        }
        if (!pgLockInDays) {
          alert("Please enter Lock-in Period.")
          return
        }
        if (pgCommonAreas.length === 0) {
          alert("Please select at least one Common Area.")
          return
        }
      } else if (currentStep === 1) {
        // Room Details Validation
        for (let i = 0; i < rooms.length; i++) {
          if (!rooms[i].rent) {
            alert(`Please enter Rent for Room ${i + 1}.`)
            return
          }
          if (!rooms[i].securityDeposit) {
            alert(`Please enter Security Deposit for Room ${i + 1}.`)
            return
          }
        }
      } else if (currentStep === 3) {
        // Other Details Validation - everything is optional
      }
    } else if (sector === "Commercial") {
      if (currentStep === 0) {
        if (!city) {
          alert("Please select or enter a city.")
          return
        }
        if (!propertyType) {
          alert("Please select a Commercial Sub Property Type.")
          return
        }
      } else if (currentStep === 1) {
        if (!locality) {
          alert("Please select or enter a valid locality.")
          return
        }
        if (!possessionStatus) {
          alert("Please select Possession Status.")
          return
        }
        if (!availableFrom) {
          alert("Please select Available From date.")
          return
        }
        if (possessionStatus === "Ready to move" && !ageOfProperty) {
          alert("Please enter Age of Property.")
          return
        }
        if (!zoneType) {
          alert("Please select Zone Type.")
          return
        }
        if (!locationHub) {
          alert("Please select Location Hub.")
          return
        }
        if (locationHub === "Others" && !customLocationHub) {
          alert("Please enter custom Location Hub.")
          return
        }
        if (!propertyCondition) {
          alert("Please select Property Condition.")
          return
        }
        if (!formData.area) {
          alert("Please enter Built Up Area.")
          return
        }
        if (!totalFloors) {
          alert("Please enter Total Floors.")
          return
        }
        if (!floorNo) {
          alert("Please select Floor Number.")
          return
        }
        if (!ownership) {
          alert("Please select Ownership.")
          return
        }
        if (!formData.price) {
          alert(lookingTo === "Rent" ? "Please enter Expected Rent." : "Please enter Expected Price.")
          return
        }
      }
    } else {
      if (currentStep === 0) {
        if (!buildingName) {
          setBuildingNameError("Please fill this to continue")
          return
        }
        if ((furnishType === "Fully Furnished" || furnishType === "Semi Furnished") && furnishings.length < 3) {
          alert("Please add at least 3 flat furnishings to continue.")
          return
        }
        if (lookingTo === "Rent" && !availableFrom) {
          alert("Please fill 'Available From' date.")
          return
        }
        if (!formData.price) {
          alert("Please enter price / rent.")
          return
        }
        if (lookingTo === "Sell" && brokerageCharge === "Yes" && !customBrokerage) {
          alert("Please enter Brokerage amount.")
          return
        }
        if (lookingTo === "Rent" && parkingCharges === "Separate" && !customParkingCharges) {
          alert("Please enter Parking Charges.")
          return
        }
        if (lookingTo === "Rent" && paintingCharges === "Custom" && !customPaintingCharges) {
          alert("Please enter Painting Charges.")
          return
        }
        const isPlotOrLand = propertyType === "Plot" || propertyType === "Agricultural Land";
        if (!isPlotOrLand && (!floorNo || !totalFloors)) {
          alert("Please enter Floor Number and Total Floors.")
          return
        }
        if (isPlotOrLand) {
          if (!formData.area) {
            alert(`Please enter ${propertyType === "Plot" ? "Plot Area" : "Land Area"}.`)
            return
          }
          if (!areaUnit) {
            alert("Please select Area Unit.")
            return
          }
          if (!plotLength) {
            alert("Please enter plot/land Length.")
            return
          }
          if (!plotWidth) {
            alert("Please enter plot/land Width.")
            return
          }
          if (!facingRoadWidth) {
            alert("Please enter Width of Facing Road.")
            return
          }
        }
      }
    }
    setBuildingNameError("")
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

    const token = localStorage.getItem("seller_token")

    try {
      const res = await fetch(`${getApiUrl()}/upload/images`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: data
      })
      const result = await res.json()
      if (result.urls) {
        const apiBase = getApiUrl()
        const absoluteUrls = result.urls.map((url: string) => {
          if (url.startsWith('http')) return url // Already absolute (Cloudinary etc.)
          if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
            // Relative URL: prefix with origin only if apiBase is absolute
            if (apiBase && apiBase.startsWith('http')) {
              const origin = apiBase.replace(/\/api$/, '')
              return `${origin}${url}`
            }
            return url // Keep relative — Next.js proxy handles it
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
      const isPlotOrLand = propertyType === "Plot" || propertyType === "Agricultural Land"
      const bedroomsCount = isPlotOrLand ? 0 : parseBedroomsFromBhk(bhk)
      const yearBuiltVal = ((lookingTo === "Rent" || sector === "Commercial") && ageOfProperty) ? (new Date().getFullYear() - parseInt(ageOfProperty)) : null

      const formatMaintenanceValue = () => {
        if (maintenanceCharges === "Separate") {
          return customMaintenance ? `Separate (₹ ${customMaintenance}/month)` : "Separate"
        }
        return "Included in rent"
      }

      const formatParkingChargesValue = () => {
        if (parkingCharges === "Separate") {
          return customParkingCharges ? `Separate (₹ ${customParkingCharges}/month)` : "Separate"
        }
        return "Included in rent"
      }

      const formatPaintingChargesValue = () => {
        if (paintingCharges === "Custom") {
          return customPaintingCharges ? `Custom (₹ ${customPaintingCharges})` : "Custom"
        }
        return paintingCharges
      }

      const formatDepositValue = () => {
        if (securityDeposit === "Custom") {
          return customSecurityDeposit ? `₹ ${customSecurityDeposit}` : "Custom"
        }
        return securityDeposit
      }

      const formatLockInValue = () => {
        if (lockInPeriod === "Custom") {
          return customLockInPeriod ? `${customLockInPeriod} months` : "Custom"
        }
        return lockInPeriod
      }

      const formatBrokerageValueRent = () => {
        const val = brokerageCharge === "Custom" ? (customBrokerage ? `₹ ${customBrokerage}` : "Custom") : brokerageCharge
        return `${val}${brokerageNegotiable ? ' (Negotiable)' : ''}`
      }

      const formatBrokerageValueSell = () => {
        const val = brokerageCharge === "Yes" ? (customBrokerage ? `₹ ${customBrokerage}` : "Yes") : (brokerageCharge === "No" || brokerageCharge === "None" ? "No" : brokerageCharge)
        return `${val}${brokerageNegotiable ? ' (Negotiable)' : ''}`
      }

      const formatCommercialDepositValue = () => {
        if (!securityDeposit) return "None"
        if (!isNaN(parseFloat(securityDeposit))) return `₹ ${parseFloat(securityDeposit).toLocaleString('en-IN')}`
        return securityDeposit
      }

      const richDescription = sector === "Commercial" ? `PROPERTY HIGHLIGHTS:
• Sub Property Type: ${propertyType}
• Locality: ${locality}
• Possession Status: ${possessionStatus}
• Available From: ${availableFrom || 'Immediately'}
${possessionStatus === "Ready to move" ? `• Age of Property: ${ageOfProperty ? ageOfProperty + ' years' : 'N/A'}\n` : ''}• Zone Type: ${zoneType}
• Location Hub: ${locationHub === "Others" ? customLocationHub : locationHub}
• Property Condition: ${propertyCondition}
• Built Up Area: ${formData.area} Sq. Ft.
• Electricity Charges Included: ${electricityChargesIncluded}
• Water Charges Included: ${waterChargesIncluded}
• Lock-in Period: ${lockInPeriod || 'None'}
• Expected Rent Increase: ${expectedRentIncrease || 'None'}
• Floor Details: Floor ${floorNo} of ${totalFloors}
• Ownership: ${ownership}
• Expected ${lookingTo === "Rent" ? "Rent" : "Price"}: ₹ ${parseFloat(formData.price || "0").toLocaleString('en-IN')}
• Security Deposit: ${formatCommercialDepositValue()}
• Price Negotiable: ${priceNegotiable}
• DG & UPS Charges Included: ${dgUpsChargesIncluded}

---

${formData.description}` : lookingTo === "PG/Co-living" ? `PROPERTY HIGHLIGHTS:
• PG Name: ${pgName}
• Locality: ${locality}
• Total Beds: ${totalBeds}
• PG is for: ${pgFor.join(', ')}
• Best Suited For: ${bestSuitedFor.join(', ')}
• Meals Available: ${mealsAvailable}
• Notice Period: ${noticePeriodDays ? noticePeriodDays + ' Days' : 'None'}
• Lock-in Period: ${pgLockInDays ? pgLockInDays + ' Days' : 'None'}
• Common Areas: ${pgCommonAreas.length > 0 ? pgCommonAreas.join(', ') : 'None'}
• Managed By: ${propertyManagedBy}
• Manager Stays At Property: ${managerStaysAtProperty}
• Non-Veg Allowed: ${pgRules.nonVegAllowed}
• Opposite Sex Allowed: ${pgRules.oppositeSexAllowed}
• Any Time Allowed: ${pgRules.anyTimeAllowed}
• Visitors Allowed: ${pgRules.visitorsAllowed}
• Guardian Allowed: ${pgRules.guardianAllowed}
• Drinking Allowed: ${pgRules.drinkingAllowed}
• Smoking Allowed: ${pgRules.smokingAllowed}
• Onetime Move-in Charges: ${onetimeMoveInCharges ? '₹' + onetimeMoveInCharges : 'None'}
• Meal Charges: ${mealChargesPerMonth ? '₹' + mealChargesPerMonth + '/month' : 'None'}
• Electricity Charges: ${electricityChargesPerMonth ? '₹' + electricityChargesPerMonth + '/month' : 'None'}
• Room Details: ${JSON.stringify(rooms)}

---

${formData.description}` : lookingTo === "Rent" ? `PROPERTY HIGHLIGHTS:
${isPlotOrLand ? `• Plot Area: ${formData.area} ${areaUnit}
• Plot Dimensions: ${plotLength} ft x ${plotWidth} ft
• Facing Road Width: ${facingRoadWidth} ft
` : `• BHK: ${bhk}
• Age of Property: ${ageOfProperty ? ageOfProperty + ' years' : 'N/A'}
• Bathrooms: ${bathroomCount}
• Balconies: ${balconyCount}
• Furnish Type: ${furnishType}
${furnishings.length > 0 ? `• Furnishings: ${furnishings.join(', ')}\n` : ''}• Covered Parking: ${coveredParking}
• Open Parking: ${openParking}\n`}• Preferred Tenant: ${preferredTenant.length === 3 ? 'All (Family, Bachelors, Company)' : (preferredTenant.join(', ') || 'None')}
• Pet Friendly: ${petFriendly}
• Available From: ${availableFrom || 'Immediately'}
• Maintenance: ${formatMaintenanceValue()}
• Parking Charges: ${formatParkingChargesValue()}
• Painting Charges: ${formatPaintingChargesValue()}
• Security Deposit: ${formatDepositValue()}
• Lock-in Period: ${formatLockInValue()}
• Brokerage Charges: ${formatBrokerageValueRent()}
${isPlotOrLand ? '' : `• Carpet Area: ${carpetArea ? carpetArea + ' Sq. Ft.' : 'N/A'}
• Floor details: Floor ${floorNo} of ${totalFloors}\n`}
---

${formData.description}` : `PROPERTY HIGHLIGHTS:
${isPlotOrLand ? '' : `• BHK: ${bhk}\n`}• Transaction Type: ${transactionType}
${isPlotOrLand ? `• Plot Area: ${formData.area} ${areaUnit}
• Plot Dimensions: ${plotLength} ft x ${plotWidth} ft
• Facing Road Width: ${facingRoadWidth} ft
` : `• Construction Status: ${constructionStatus}\n• Bathrooms: ${bathroomCount}\n• Balconies: ${balconyCount}\n• Furnish Type: ${furnishType}\n`}${isPlotOrLand ? '' : (furnishings.length > 0 ? `• Furnishings: ${furnishings.join(', ')}\n` : '')}${isPlotOrLand ? '' : `• Covered Parking: ${coveredParking}\n• Open Parking: ${openParking}\n`}• Maintenance Charges: ${customMaintenance ? `₹ ${customMaintenance}/month` : 'N/A'}
• Brokerage Charges: ${formatBrokerageValueSell()}
${isPlotOrLand ? '' : `• Carpet Area: ${carpetArea ? carpetArea + ' Sq. Ft.' : 'N/A'}\n• Floor details: Floor ${floorNo} of ${totalFloors}\n`}${facing ? `• Facing: ${facing}\n` : ''}${servantRoom ? `• Servant Room: ${servantRoom}\n` : ''}${reraId ? `• RERA ID: ${reraId}\n` : ''}

---

${formData.description}`

      const payload = {
        title: formData.title || (sector === "Commercial" ? `${propertyType} in ${buildingName || locality}` : isPlotOrLand ? `${propertyType} in ${buildingName}` : `${bhk} ${propertyType} in ${buildingName}`),
        description: richDescription,
        price: parseFloat(formData.price) || 0,
        propertyType: mappedPropertyType,
        listingType: mapSellerListingType(lookingTo),
        address: sector === "Commercial"
          ? (buildingName ? `${buildingName}, ${locality}` : locality)
          : lookingTo === "Rent"
            ? `${buildingName}, ${formData.address}`
            : (additionalAddress ? `${buildingName}, ${additionalAddress}` : buildingName),
        city: city,
        state: "Delhi",
        pincode: sector === "Commercial" ? "" : (lookingTo === "Rent" ? formData.pincode : ""),
        bedrooms: sector === "Commercial" ? 0 : bedroomsCount,
        bathrooms: (sector === "Commercial" || isPlotOrLand) ? 0 : bathroomCount,
        area: parseFloat(formData.area) || parseFloat(carpetArea) || 0,
        yearBuilt: yearBuiltVal,
        status: "ACTIVE",
        images: formData.images,
        amenities: formData.amenities,
      }

      const res = await fetch(`${getApiUrl()}/properties`, {
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
        try {
          const errData = await res.json()
          const msg = errData.message || "Is listing type ke liye aapka plan sufficient nahi hai."
          alert(msg)
          if (errData.redirect) router.push(errData.redirect)
        } catch {
          alert("Is listing type ke liye aapka plan sufficient nahi hai. Subscription page check karo.")
        }
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
        <Loader2 className="animate-spin text-[#0a2540]" size={40} />
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
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0a2540] via-[#0a2540] to-amber-500"></div>

          <div className="w-20 h-20 bg-[#0a2540]/5 text-[#0a2540] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building2 size={36} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Active Subscription Required</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            To prevent spam and keep Kanharaj.com exclusive, listing new properties is restricted to active subscribers. Please upgrade your plan to unlock property submissions.
          </p>

          <div className="space-y-4">
            <Link
              href="/subscription"
              className="block w-full py-4 rounded-xl text-center font-bold text-sm bg-gradient-to-r from-[#0a2540] to-[#07192c] hover:from-[#07192c] hover:to-[#07192c] text-white shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
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

          {subscriptionPlan === "NONE" && (
            <div className="bg-[#0a2540]/5 text-[#0a2540] text-xs font-bold p-3 rounded-xl mb-4 border border-[#0a2540]/10">
              Free Listing: {freePostsLimit - freePostsUsed} of {freePostsLimit} free posts remaining.
            </div>
          )}

          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[10px] font-black text-slate-700 flex items-center gap-1">
              {progressPercent}% <Info className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          {/* Stepper */}
          <div className="relative pl-3 space-y-8 before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
            {activeSteps.map((step) => {
              const isPast = step.status === "Completed"
              const isActive = step.status === "In progress"
              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white transition-colors ${isPast ? "bg-[#0a2540] text-white" : isActive ? "bg-white border-[3px] border-[#0a2540]" : "bg-slate-100 text-slate-400"
                    }`}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-[#0a2540]" /> : null}
                  </div>
                  <div className="flex flex-col -mt-0.5">
                    <span className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                      {step.label}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${isActive ? "bg-[#0a2540]/5 text-[#0a2540]" : "bg-transparent text-slate-400 border border-slate-200"
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
            Need Help? <Phone className="w-3.5 h-3.5 text-[#0a2540] ml-1" /> <a href="tel:9599801767" className="font-bold text-[#0a2540] hover:underline">Call 9599801767</a>
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
              {/* STEP: Basic Details (Commercial Step 0 only) */}
              {currentStepName === "Basic Details" && (
                <div className="space-y-12 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50 space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-800">Post Your Property</h2>
                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Start by filling in the basic details
                    </p>
                  </div>

                  {/* Property Type Group */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-3 block">
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
                          className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${sector === t ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Looking to */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-3 block">
                      Looking to <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {["Rent", "Sell"].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setLookingTo(t)}
                          className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${lookingTo === t ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City */}
                  <div className="relative" ref={cityDropdownRef}>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">City <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={city}
                        onChange={e => {
                          setCity(e.target.value)
                          setIsCityDropdownOpen(true)
                        }}
                        onFocus={e => {
                          setIsCityDropdownOpen(true)
                          e.target.select()
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const query = city.trim()
                            if (query) {
                              const match = topCities.concat(otherCities).find(c => c.toLowerCase() === query.toLowerCase())
                              if (match) {
                                setCity(match)
                              } else {
                                setCity(query)
                              }
                              setIsCityDropdownOpen(false)
                            }
                          }
                        }}
                        className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-8"
                        placeholder="Search or type city name..."
                      />
                      <ChevronDown
                        className={`absolute right-2 bottom-3 w-4 h-4 text-slate-400 cursor-pointer transition-transform ${isCityDropdownOpen ? "rotate-180 text-[#0a2540]" : ""}`}
                        onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                      />
                    </div>

                    <AnimatePresence>
                      {isCityDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] flex flex-col overflow-hidden max-h-60"
                        >
                          <div className="flex-1 overflow-y-auto py-1.5 text-left custom-scrollbar">
                            {city.trim() && !topCities.concat(otherCities).some(c => c.toLowerCase() === city.toLowerCase().trim()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCityDropdownOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-[#0a2540] bg-[#0a2540]/5 hover:bg-[#0a2540]/10 transition-colors border-b border-slate-100"
                              >
                                Use custom city: &ldquo;{city.trim()}&rdquo;
                              </button>
                            )}

                            {/* Top Cities */}
                            {(() => {
                              const filteredTop = topCities.filter(c => c.toLowerCase().includes(city.toLowerCase()))
                              if (filteredTop.length > 0) {
                                return (
                                  <div>
                                    <div className="px-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                      Top Cities
                                    </div>
                                    {filteredTop.map(c => (
                                      <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                          setCity(c)
                                          setIsCityDropdownOpen(false)
                                        }}
                                        className={`w-full text-left px-4 py-1.5 text-xs font-bold transition-colors flex items-center justify-between ${city === c ? "bg-[#0a2540]/5 text-[#0a2540]" : "text-slate-700 hover:bg-slate-50"}`}
                                      >
                                        <span>{c}</span>
                                        {city === c && <span className="text-[10px] font-black">✓</span>}
                                      </button>
                                    ))}
                                  </div>
                                )
                              }
                              return null
                            })()}

                            {/* Other Cities */}
                            {(() => {
                              const filteredOther = otherCities.filter(c => c.toLowerCase().includes(city.toLowerCase()))
                              if (filteredOther.length > 0) {
                                return (
                                  <div className="mt-1">
                                    <div className="px-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                      Other Cities
                                    </div>
                                    {filteredOther.map(c => (
                                      <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                          setCity(c)
                                          setIsCityDropdownOpen(false)
                                        }}
                                        className={`w-full text-left px-4 py-1.5 text-xs font-bold transition-colors flex items-center justify-between ${city === c ? "bg-[#0a2540]/5 text-[#0a2540]" : "text-slate-700 hover:bg-slate-50"}`}
                                      >
                                        <span>{c}</span>
                                        {city === c && <span className="text-[10px] font-black">✓</span>}
                                      </button>
                                    ))}
                                  </div>
                                )
                              }
                              return null
                            })()}

                            {/* No matches fallback */}
                            {city.trim() && topCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).length === 0 && otherCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).length === 0 && (
                              <div className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">
                                No matching cities found. Click custom city above to save.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sub Property Type */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-4 block">
                      Sub Property Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "Office", icon: Building },
                        { name: "Retail Shop", icon: Store },
                        { name: "Showroom", icon: Store },
                        { name: "Warehouse", icon: Warehouse },
                        { name: "Plot", icon: Map },
                        { name: "Others", icon: MoreHorizontal }
                      ].map(type => (
                        <button
                          key={type.name}
                          type="button"
                          onClick={() => setPropertyType(type.name)}
                          className={`flex flex-col items-center justify-center w-24 h-24 rounded-xl border transition-all ${propertyType === type.name
                            ? "bg-[#0a2540] border-[#0a2540] text-white"
                            : "bg-white border-slate-200 text-slate-500 hover:border-[#0a2540] hover:text-[#0a2540]"}`}
                        >
                          <type.icon strokeWidth={1.5} className={`w-8 h-8 mb-2 ${propertyType === type.name ? 'text-white' : 'text-slate-300'}`} />
                          <span className="text-[11px] font-bold text-center leading-tight px-1">
                            {type.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 rounded-xl text-base font-bold bg-[#38D39F] text-white hover:bg-[#2bc490] transition-colors shadow-lg shadow-emerald-200/50"
                    >
                      Continues
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 0: Property Details (Consolidated Form) */}
              {currentStepName === "Property Details" && (
                sector === "Commercial" ? (
                  <div className="space-y-12 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-50 space-y-2 text-center">
                      <h2 className="text-2xl font-black text-slate-800">Add Property Details</h2>
                      <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> Please fill in the details of your commercial property
                      </p>
                    </div>

                    {/* Building Name & Locality */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">
                          Building / Project / Society Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={buildingName}
                          onChange={e => setBuildingName(e.target.value)}
                          className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors placeholder:text-slate-400/70"
                          placeholder="e.g. DLF Cyber City"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">
                          Locality <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={locality}
                          onChange={e => setLocality(e.target.value)}
                          className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors placeholder:text-slate-400/70"
                          placeholder="e.g. Sector 21"
                        />
                        {!locality && (
                          <p className="text-xs font-bold text-rose-500 mt-1">Please select a valid locality</p>
                        )}
                      </div>
                    </div>

                    {/* POSSESSION INFO */}
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">POSSESSION INFO</h3>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Possession status <span className="text-rose-500">*</span></label>
                        <div className="flex gap-3">
                          {["Ready to move", "Under construction"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPossessionStatus(opt)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${possessionStatus === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {possessionStatus === "Ready to move" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">
                              Available From <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                value={availableFrom}
                                onChange={e => setAvailableFrom(e.target.value)}
                                className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-10"
                              />
                              <Calendar className="absolute right-0 bottom-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">
                              Age of Property (in years) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={ageOfProperty}
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 100)) {
                                    setAgeOfProperty(val);
                                  }
                                }}
                                min="0"
                                max="100"
                                className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-10"
                                placeholder="e.g. 5"
                              />
                              <Info className="absolute right-0 bottom-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}

                      {possessionStatus === "Under construction" && (
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">
                            Available From <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={availableFrom}
                              onChange={e => setAvailableFrom(e.target.value)}
                              className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-10"
                            />
                            <Calendar className="absolute right-0 bottom-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ABOUT THE PROPERTY */}
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">ABOUT THE PROPERTY</h3>

                      {/* Zone Type */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Zone Type <span className="text-rose-500">*</span></label>
                        <div className="flex flex-wrap gap-3">
                          {["Industrial", "Commercial", "Residential", "Special economic zone", "Open Spaces", "Agricultural zone", "Others"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setZoneType(opt)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${zoneType === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Location Hub */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Location Hub <span className="text-rose-500">*</span></label>
                        <div className="flex gap-3">
                          {["IT Park", "Business Park", "Others"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setLocationHub(opt)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${locationHub === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {locationHub === "Others" && (
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">
                            Others(Location Hub) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={customLocationHub}
                              onChange={e => setCustomLocationHub(e.target.value)}
                              className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-10"
                              placeholder="e.g. Industrial Area"
                            />
                          </div>
                        </div>
                      )}

                      {/* Property Condition */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Property Condition <span className="text-rose-500">*</span></label>
                        <div className="flex gap-3">
                          {["Ready to use", "Bare shell"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPropertyCondition(opt)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${propertyCondition === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Built Up Area */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Built Up Area <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <input
                            name="area"
                            type="number"
                            value={formData.area}
                            onChange={handleInputChange}
                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-20"
                            placeholder="e.g. 1500"
                          />
                          <span className="absolute right-0 bottom-2 text-sm font-bold text-slate-400">sq. ft.</span>
                        </div>
                      </div>
                    </div>

                    {/* Charges & Inclusions */}
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Electricity charges included?</label>
                        <div className="flex gap-3">
                          {["Yes", "No"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setElectricityChargesIncluded(opt)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${electricityChargesIncluded === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Water charges included?</label>
                        <div className="flex gap-3">
                          {["Yes", "No"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setWaterChargesIncluded(opt)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${waterChargesIncluded === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">Lock-in Period</label>
                          <input
                            type="text"
                            value={lockInPeriod}
                            onChange={e => setLockInPeriod(e.target.value)}
                            placeholder="e.g. 1 year"
                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">Expected Rent Increase</label>
                          <input
                            type="text"
                            value={expectedRentIncrease}
                            onChange={e => setExpectedRentIncrease(e.target.value)}
                            placeholder="e.g. 5% after 1 year"
                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FLOORS AVAILABLE */}
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">FLOORS AVAILABLE</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">Total Floors <span className="text-rose-500">*</span></label>
                          <input
                            type="number"
                            value={totalFloors}
                            onChange={e => setTotalFloors(e.target.value)}
                            placeholder="e.g. 5"
                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">Your Floor <span className="text-rose-500">*</span></label>
                          <div className="relative">
                            <select
                              value={floorNo}
                              onChange={e => setFloorNo(e.target.value)}
                              className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none bg-transparent appearance-none cursor-pointer"
                            >
                              <option value="">Select Floor</option>
                              <option value="Ground">Ground</option>
                              <option value="Basement">Basement</option>
                              {Array.from({ length: 100 }, (_, i) => String(i + 1)).map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-0 bottom-2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ownership details */}
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Ownership <span className="text-rose-500">*</span></label>
                        <div className="flex flex-wrap gap-3">
                          {["Freehold", "Leasehold", "Cooperative society", "Power of attorney"].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setOwnership(opt)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${ownership === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* FINANCIALS */}
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">FINANCIALS</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">
                            Expected {lookingTo === "Rent" ? "Rent" : "Price"} (in ₹) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              type="number"
                              placeholder="e.g. 50000"
                              className="w-full pl-12 pr-20 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                            />
                            {formData.price && (
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                {formatHelperAmount(formData.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {lookingTo === "Rent" && (
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Security Deposit (in ₹)</label>
                            <div className="relative">
                              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input
                                type="number"
                                value={securityDeposit}
                                onChange={e => setSecurityDeposit(e.target.value)}
                                placeholder="e.g. 150000"
                                className="w-full pl-12 pr-20 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                              />
                              {securityDeposit && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                  {formatHelperAmount(securityDeposit)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-3">Negotiable</label>
                          <div className="flex gap-3">
                            {["Yes", "No"].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setPriceNegotiable(opt)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${priceNegotiable === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-3">DG & UPS Charge included?</label>
                          <div className="flex gap-3">
                            {["Yes", "No"].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setDgUpsChargesIncluded(opt)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${dgUpsChargesIncluded === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full py-4 rounded-xl text-base font-bold bg-[#38D39F] text-white hover:bg-[#2bc490] transition-colors shadow-lg shadow-emerald-200/50"
                      >
                        Next, add amenities
                      </button>
                    </div>
                  </div>
                ) : (
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
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${sector === t ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
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
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${lookingTo === t ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                              }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* City */}
                    <div className="relative" ref={cityDropdownRef}>
                      <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">City <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          type="text"
                          value={city}
                          onChange={e => {
                            setCity(e.target.value)
                            setIsCityDropdownOpen(true)
                          }}
                          onFocus={e => {
                            setIsCityDropdownOpen(true)
                            e.target.select() // Auto-select text on focus so user can easily type and search
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              const query = city.trim()
                              if (query) {
                                const match = topCities.concat(otherCities).find(c => c.toLowerCase() === query.toLowerCase())
                                if (match) {
                                  setCity(match)
                                } else {
                                  setCity(query)
                                }
                                setIsCityDropdownOpen(false)
                              }
                            }
                          }}
                          className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-8"
                          placeholder="Search or type city name..."
                        />
                        <ChevronDown
                          className={`absolute right-2 bottom-3 w-4 h-4 text-slate-400 cursor-pointer transition-transform ${isCityDropdownOpen ? "rotate-180 text-[#0a2540]" : ""}`}
                          onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                        />
                      </div>

                      <AnimatePresence>
                        {isCityDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] flex flex-col overflow-hidden max-h-60"
                          >
                            <div className="flex-1 overflow-y-auto py-1.5 text-left custom-scrollbar">
                              {/* Custom City Fallback Option */}
                              {city.trim() && !topCities.concat(otherCities).some(c => c.toLowerCase() === city.toLowerCase().trim()) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCityDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#0a2540] bg-[#0a2540]/5 hover:bg-[#0a2540]/10 transition-colors border-b border-slate-100"
                                >
                                  Use custom city: &ldquo;{city.trim()}&rdquo;
                                </button>
                              )}

                              {/* Top Cities */}
                              {(() => {
                                const filteredTop = topCities.filter(c => c.toLowerCase().includes(city.toLowerCase()))
                                if (filteredTop.length > 0) {
                                  return (
                                    <div>
                                      <div className="px-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                        Top Cities
                                      </div>
                                      {filteredTop.map(c => (
                                        <button
                                          key={c}
                                          type="button"
                                          onClick={() => {
                                            setCity(c)
                                            setIsCityDropdownOpen(false)
                                          }}
                                          className={`w-full text-left px-4 py-1.5 text-xs font-bold transition-colors flex items-center justify-between ${city === c ? "bg-[#0a2540]/5 text-[#0a2540]" : "text-slate-700 hover:bg-slate-50"}`}
                                        >
                                          <span>{c}</span>
                                          {city === c && <span className="text-[10px] font-black">✓</span>}
                                        </button>
                                      ))}
                                    </div>
                                  )
                                }
                                return null
                              })()}

                              {/* Other Cities */}
                              {(() => {
                                const filteredOther = otherCities.filter(c => c.toLowerCase().includes(city.toLowerCase()))
                                if (filteredOther.length > 0) {
                                  return (
                                    <div className="mt-1">
                                      <div className="px-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                        Other Cities
                                      </div>
                                      {filteredOther.map(c => (
                                        <button
                                          key={c}
                                          type="button"
                                          onClick={() => {
                                            setCity(c)
                                            setIsCityDropdownOpen(false)
                                          }}
                                          className={`w-full text-left px-4 py-1.5 text-xs font-bold transition-colors flex items-center justify-between ${city === c ? "bg-[#0a2540]/5 text-[#0a2540]" : "text-slate-700 hover:bg-slate-50"}`}
                                        >
                                          <span>{c}</span>
                                          {city === c && <span className="text-[10px] font-black">✓</span>}
                                        </button>
                                      ))}
                                    </div>
                                  )
                                }
                                return null
                              })()}

                              {/* No matches fallback */}
                              {city.trim() && topCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).length === 0 && otherCities.filter(c => c.toLowerCase().includes(city.toLowerCase())).length === 0 && (
                                <div className="px-4 py-3 text-xs font-semibold text-slate-400 text-center">
                                  No matching cities found. Click custom city above to save.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Building Name */}
                    {sector !== "Commercial" && (
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1 transition-colors group-focus-within:text-[#0a2540]">
                          Building / Apartment / Society Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={buildingName}
                          onChange={e => { setBuildingName(e.target.value); setBuildingNameError("") }}
                          className={`w-full text-base font-bold text-slate-800 pb-2 border-b outline-none transition-colors ${buildingNameError ? "border-rose-500" : "border-slate-200 focus:border-[#0a2540]"
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
                          <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1 transition-colors group-focus-within:text-[#0a2540]">
                            Locality <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={locality}
                            onChange={e => setLocality(e.target.value)}
                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
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
                              <input type="text" value={pgName} onChange={e => setPgName(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors" />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Total Beds <span className="text-rose-500">*</span></label>
                              <input type="number" value={totalBeds} onChange={e => setTotalBeds(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 mb-3">PG is for <span className="text-rose-500">*</span></label>
                                <div className="flex gap-3">
                                  {["Girls", "Boys"].map(opt => {
                                    const isSelected = pgFor.includes(opt);
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                          setPgFor(prev => {
                                            if (prev.includes(opt)) {
                                              return prev.filter(x => x !== opt);
                                            } else {
                                              return [...prev, opt];
                                            }
                                          });
                                        }}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected
                                          ? "bg-[#0a2540] text-white border-[#0a2540]"
                                          : "bg-white text-slate-600 border-slate-200"
                                          }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 mb-3">Best suited for <span className="text-rose-500">*</span></label>
                                <div className="flex gap-3">
                                  {["Students", "Professionals"].map(opt => {
                                    const isSelected = bestSuitedFor.includes(opt);
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                          setBestSuitedFor(prev => {
                                            if (prev.includes(opt)) {
                                              return prev.filter(x => x !== opt);
                                            } else {
                                              return [...prev, opt];
                                            }
                                          });
                                        }}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected
                                          ? "bg-[#0a2540] text-white border-[#0a2540]"
                                          : "bg-white text-slate-600 border-slate-200"
                                          }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Meals details */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-3">Meals Available <span className="text-rose-500">*</span></label>
                          <div className="flex gap-3">
                            {["Yes", "No"].map(opt => (
                              <button key={opt} type="button" onClick={() => setMealsAvailable(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${mealsAvailable === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
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
                                    }} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
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
                                    }} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notice & Lock-in Periods */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Notice Period (Days) <span className="text-rose-500">*</span></label>
                            <input type="number" value={noticePeriodDays} onChange={e => setNoticePeriodDays(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Lock in Period (Days) <span className="text-rose-500">*</span></label>
                            <input type="number" value={pgLockInDays} onChange={e => setPgLockInDays(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors" />
                          </div>
                        </div>

                        {/* Common Areas */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-3">Common Areas <span className="text-rose-500">*</span></label>
                          <div className="flex flex-wrap gap-3">
                            {["Living Room", "Kitchen", "Dining Hall", "Study Room / Library", "Breakout Room"].map(opt => {
                              const isSelected = pgCommonAreas.includes(opt)
                              return (
                                <button key={opt} type="button" onClick={() => {
                                  if (isSelected) setPgCommonAreas(prev => prev.filter(a => a !== opt))
                                  else setPgCommonAreas(prev => [...prev, opt])
                                }} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isSelected ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Caretaker details */}
                        <div className="pt-8 border-t border-slate-100">
                          <h3 className="text-sm font-black text-slate-800 mb-6 uppercase">OWNER / CARETAKER DETAILS</h3>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-3">Property Managed By <span className="text-rose-500">*</span></label>
                              <div className="flex flex-wrap gap-3">
                                {["Landlord", "Caretaker", "Dedicated Professional"].map(opt => (
                                  <button key={opt} type="button" onClick={() => setPropertyManagedBy(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${propertyManagedBy === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-3">Property Manager stays at Property <span className="text-rose-500">*</span></label>
                              <div className="flex gap-3">
                                {["Yes", "No"].map(opt => (
                                  <button key={opt} type="button" onClick={() => setManagerStaysAtProperty(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${managerStaysAtProperty === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rules details */}
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
                                    <button key={opt} type="button" onClick={() => setPgRules(prev => ({ ...prev, [key]: opt }))} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${pgRules[key as keyof typeof pgRules] === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
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
                                  ? "bg-[#0a2540] border-[#0a2540] text-white"
                                  : "bg-white border-slate-200 text-slate-500 hover:border-[#0a2540] hover:text-[#0a2540]"
                                  }`}
                              >
                                <type.icon strokeWidth={1.5} className={`w-8 h-8 mb-2 ${propertyType === type.name ? 'text-white' : 'text-slate-300'}`} />
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
                            {propertyType !== "Plot" && propertyType !== "Agricultural Land" && (
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
                                        ? "bg-[#0a2540] border-[#0a2540] text-white"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-[#0a2540]"
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
                              {propertyType === "Plot" || propertyType === "Agricultural Land" ? (
                                <div className="space-y-6">
                                  {/* Plot Area / Land Area & Unit */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                        {propertyType === "Plot" ? "Plot Area" : "Land Area"} <span className="text-rose-0">*</span>
                                      </label>
                                      <input
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        type="number"
                                        min="0"
                                        className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                        placeholder="e.g. 0"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                        Select Area Unit <span className="text-rose-0">*</span>
                                      </label>
                                      <div className="relative">
                                        <select
                                          value={areaUnit}
                                          onChange={e => setAreaUnit(e.target.value)}
                                          className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none bg-transparent appearance-none cursor-pointer"
                                        >
                                          <option value="Sq. Ft.">Sq. Ft.</option>
                                          <option value="Sq. Yards">Sq. Yards</option>
                                          <option value="Sq. Meter">Sq. Meter</option>
                                          <option value="Acre">Acre</option>
                                          <option value="Bigha">Bigha</option>
                                          <option value="Kanal">Kanal</option>
                                        </select>
                                        <ChevronDown className="absolute right-0 bottom-3 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Length & Width */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                        Length (in ft) <span className="text-rose-0">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        value={plotLength}
                                        onChange={e => {
                                          const val = e.target.value;
                                          if (val === "" || parseFloat(val) >= 0) setPlotLength(val);
                                        }}
                                        min="0"
                                        className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                        placeholder="e.g. 50"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                        Width (in ft) <span className="text-rose-0">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        value={plotWidth}
                                        onChange={e => {
                                          const val = e.target.value;
                                          if (val === "" || parseFloat(val) >= 0) setPlotWidth(val);
                                        }}
                                        min="0"
                                        className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                        placeholder="e.g. 30"
                                      />
                                    </div>
                                  </div>

                                  {/* Facing Road Width */}
                                  <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                      Width of Facing Road (in ft) <span className="text-rose-0">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      value={facingRoadWidth}
                                      onChange={e => {
                                        const val = e.target.value;
                                        if (val === "" || parseFloat(val) >= 0) setFacingRoadWidth(val);
                                      }}
                                      min="0"
                                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                      placeholder="e.g. 40"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                    Built Up Area <span className="text-rose-0">*</span>
                                  </label>
                                  <div className="relative">
                                    <input
                                      name="area"
                                      value={formData.area}
                                      onChange={handleInputChange}
                                      type="number"
                                      min="0"
                                      max="100000"
                                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-32"
                                    />
                                    <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                      {formData.area ? `${formData.area} Sq. ft.` : 'Sq. ft.'}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {lookingTo === "Rent" && propertyType !== "Plot" && propertyType !== "Agricultural Land" ? (
                                <div>
                                  <label className="text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
                                    <span>Age of Property (in years) <span className="text-rose-500">*</span></span>
                                    <Info className="w-4 h-4 text-slate-400" />
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={ageOfProperty}
                                      onChange={e => {
                                        const val = e.target.value;
                                        if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
                                          setAgeOfProperty(val);
                                        }
                                      }}
                                      min="0"
                                      max="10"
                                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-24"
                                    />
                                    <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                      {ageOfProperty ? `${ageOfProperty} Years` : 'Years'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {/* Transaction Type */}
                                  <div>
                                    <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                                      Transaction Type <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex gap-3">
                                      {["New Booking", "Resale"].map(t => (
                                        <button
                                          key={t}
                                          type="button"
                                          onClick={() => setTransactionType(t)}
                                          className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${transactionType === t ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                                        >
                                          {t}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Possession Status - only for Plot / Agricultural Land */}
                                  {(propertyType === "Plot" || propertyType === "Agricultural Land") && (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                                          Possession Status <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex gap-3">
                                          {["Immediate", "In Future"].map(p => (
                                            <button
                                              key={p}
                                              type="button"
                                              onClick={() => setPossessionStatus(p)}
                                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${possessionStatus === p
                                                ? "bg-[#0a2540] text-white border-[#0a2540]"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                                                }`}
                                            >
                                              {p}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Immediate → Age of Property */}
                                      {possessionStatus === "Immediate" && (
                                        <div>
                                          <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                            Age of Property (in years) <span className="text-rose-500">*</span>
                                          </label>
                                          <input
                                            type="number"
                                            value={ageOfProperty}
                                            onChange={e => {
                                              const val = e.target.value;
                                              if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 200)) setAgeOfProperty(val);
                                            }}
                                            min="0"
                                            max="200"
                                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                            placeholder="e.g. 5"
                                          />
                                        </div>
                                      )}

                                      {/* In Future → Possession Date */}
                                      {possessionStatus === "In Future" && (
                                        <div>
                                          <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                            Possession Date <span className="text-rose-500">*</span>
                                          </label>
                                          <input
                                            type="date"
                                            value={possessionDate}
                                            onChange={e => setPossessionDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Construction Status */}
                                  {propertyType !== "Plot" && propertyType !== "Agricultural Land" && (
                                    <div>
                                      <label className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                                        Construction Status <span className="text-rose-500">*</span>
                                      </label>
                                      <div className="flex gap-3">
                                        {["Ready to Move", "Under Construction"].map(t => (
                                          <button
                                            key={t}
                                            type="button"
                                            onClick={() => setConstructionStatus(t)}
                                            className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${constructionStatus === t ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                                          >
                                            {t}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {propertyType !== "Plot" && propertyType !== "Agricultural Land" && (
                              <>
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
                                            ? "bg-[#0a2540] border-[#0a2540] text-white"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-[#0a2540]"
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
                                            ? "bg-[#0a2540] border-[#0a2540] text-white"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-[#0a2540]"
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
                                            ? "bg-[#0a2540] border-[#0a2540] text-white"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-[#0a2540]"
                                            }`}
                                        >
                                          <opt.icon size={16} className={isSelected ? "text-white" : "text-slate-400"} />
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
                                                ? "bg-[#0a2540] text-white border-[#0a2540]"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-[#0a2540]"
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
                                          className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${coveredParking === num ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
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
                                          className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${openParking === num ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                                            }`}
                                        >
                                          {num}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            {lookingTo === "Rent" ? (
                              <>
                                {/* Tenant Type & Pets */}
                                <div className="grid grid-cols-1 gap-6">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Preferred Tenant Type</label>
                                    <div className="flex gap-2">
                                      {["Family", "Bachelors", "Company"].map(type => {
                                        const isSelected = preferredTenant.includes(type);
                                        return (
                                          <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                              if (isSelected) {
                                                setPreferredTenant(prev => prev.filter(t => t !== type));
                                              } else {
                                                setPreferredTenant(prev => [...prev, type]);
                                              }
                                            }}
                                            className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${isSelected
                                              ? "bg-[#0a2540] border-[#0a2540] text-white"
                                              : "bg-white border-slate-200 text-slate-600 hover:border-[#0a2540]"
                                              }`}
                                          >
                                            {type}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {preferredTenant.includes("Bachelors") && (
                                      <div className="mt-6">
                                        <label className="block text-xs font-bold text-slate-500 mb-3">Select your preference for bachelors</label>
                                        <div className="flex gap-3">
                                          {["Open for both", "Men Only", "Women Only"].map(opt => (
                                            <button key={opt} type="button" onClick={() => setBachelorPreference(opt)} className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${bachelorPreference === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200"}`}>{opt}</button>
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
                                            ? "bg-[#0a2540] border-[#0a2540] text-white"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-[#0a2540]"
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
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                      Monthly Rent (in ₹) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        onKeyDown={handleAmountKeyDown}
                                        type="number"
                                        placeholder="25000"
                                        min="0"
                                        max="1000000"
                                        className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                      />
                                      {formData.price && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                          {formatHelperAmount(formData.price)}
                                        </span>
                                      )}
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
                                        className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${maintenanceCharges === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                                          }`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                  {maintenanceCharges === "Separate" && (
                                    <div className="mt-6">
                                      <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Maintenance Charges (per month) <span className="text-rose-500">*</span></label>
                                      <div className="relative">
                                        <input
                                          type="number"
                                          value={customMaintenance}
                                          onChange={e => {
                                            const val = e.target.value;
                                            if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 100000)) {
                                              setCustomMaintenance(val);
                                            }
                                          }}
                                          onKeyDown={handleAmountKeyDown}
                                          min="0"
                                          max="100000"
                                          className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-24"
                                        />
                                        <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                          {formatHelperAmount(customMaintenance)}
                                        </span>
                                      </div>
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
                                          className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${securityDeposit === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                                            }`}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                    {securityDeposit === "Custom" && (
                                      <div className="mt-6">
                                        <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Security Deposit <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={customSecurityDeposit}
                                            onChange={e => {
                                              const val = e.target.value;
                                              if (val === "" || parseFloat(val) >= 0) {
                                                setCustomSecurityDeposit(val);
                                              }
                                            }}
                                            onKeyDown={handleAmountKeyDown}
                                            min="0"
                                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-24"
                                          />
                                          <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                            {formatHelperAmount(customSecurityDeposit)}
                                          </span>
                                        </div>
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
                                          className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${lockInPeriod === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                                            }`}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                    {lockInPeriod === "Custom" && (
                                      <div className="mt-6 relative">
                                        <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">Lock in Period <span className="text-rose-500">*</span></label>
                                        <input type="number" value={customLockInPeriod} onChange={e => setCustomLockInPeriod(e.target.value)} className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-16" />
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
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${brokerageCharge === opt ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
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
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={customBrokerage}
                                            onChange={e => {
                                              const val = e.target.value;
                                              if (val === "" || parseFloat(val) >= 0) {
                                                setCustomBrokerage(val);
                                              }
                                            }}
                                            onKeyDown={handleAmountKeyDown}
                                            min="0"
                                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-24"
                                          />
                                          <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                            {formatHelperAmount(customBrokerage)}
                                          </span>
                                        </div>
                                      </div>
                                      <label className="flex items-center gap-2 cursor-pointer w-fit border border-slate-200 rounded-lg px-4 py-3 hover:border-[#0a2540] transition-colors">
                                        <input
                                          type="checkbox"
                                          checked={brokerageNegotiable}
                                          onChange={e => setBrokerageNegotiable(e.target.checked)}
                                          className="rounded text-[#0a2540] focus:ring-[#0a2540] w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-slate-800">Brokerage Negotiable</span>
                                      </label>
                                    </div>
                                  )}
                                  {brokerageCharge !== "Custom" && brokerageCharge !== "None" && (
                                    <div className="mt-4">
                                      <label className="flex items-center gap-2 cursor-pointer w-fit border border-slate-200 rounded-lg px-4 py-3 hover:border-[#0a2540] transition-colors">
                                        <input
                                          type="checkbox"
                                          checked={brokerageNegotiable}
                                          onChange={e => setBrokerageNegotiable(e.target.checked)}
                                          className="rounded text-[#0a2540] focus:ring-[#0a2540] w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-slate-800">Brokerage Negotiable</span>
                                      </label>
                                    </div>
                                  )}
                                </div>

                                <hr className="border-slate-100" />

                                {/* Carpet Area & Floors */}
                                <div className={`grid grid-cols-1 ${propertyType === "Plot" || propertyType === "Agricultural Land" ? "md:grid-cols-1" : "md:grid-cols-3"} gap-6`}>
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
                                        min="0"
                                        max="100000"
                                        className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                      />
                                      {formData.area && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                          {formData.area} Sq. ft.
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {propertyType !== "Plot" && propertyType !== "Agricultural Land" && (
                                    <>
                                      <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Carpet Area (Sq. Ft.)</label>
                                        <div className="relative">
                                          <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                          <input
                                            type="number"
                                            value={carpetArea}
                                            onChange={e => {
                                              const val = e.target.value;
                                              if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 100000)) {
                                                setCarpetArea(val);
                                              }
                                            }}
                                            placeholder="1200"
                                            min="0"
                                            max="100000"
                                            className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                          />
                                          {carpetArea && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                              {carpetArea} Sq. ft.
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Floor No <span className="text-rose-500">*</span></label>
                                          <input
                                            type="number"
                                            value={floorNo}
                                            onChange={e => {
                                              const val = e.target.value;
                                              if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 200)) {
                                                setFloorNo(val);
                                              }
                                            }}
                                            onKeyDown={handleAmountKeyDown}
                                            placeholder="3"
                                            min="0"
                                            max="200"
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Floors <span className="text-rose-500">*</span></label>
                                          <input
                                            type="number"
                                            value={totalFloors}
                                            onChange={e => {
                                              const val = e.target.value;
                                              if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 200)) {
                                                setTotalFloors(val);
                                              }
                                            }}
                                            onKeyDown={handleAmountKeyDown}
                                            placeholder="12"
                                            min="0"
                                            max="200"
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                          />
                                        </div>
                                      </div>
                                    </>
                                  )}
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
                                        className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
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
                                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
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
                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold resize-none transition-all"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                {/* COST * (Expected Price) */}
                                <div className="grid grid-cols-1 gap-6">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                      Cost <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        onKeyDown={handleAmountKeyDown}
                                        type="number"
                                        placeholder="7500000"
                                        min="0"
                                        max="10000000000"
                                        className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                      />
                                      {formData.price && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                          {formatHelperAmount(formData.price)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* MAINTENANCE CHARGES (per month) */}
                                <div className="grid grid-cols-1 gap-6">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                      Maintenance Charges (per month)
                                    </label>
                                    <div className="relative">
                                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                        type="number"
                                        value={customMaintenance}
                                        onChange={e => {
                                          const val = e.target.value;
                                          if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 100000)) {
                                            setCustomMaintenance(val);
                                          }
                                        }}
                                        onKeyDown={handleAmountKeyDown}
                                        placeholder="2000"
                                        min="0"
                                        max="100000"
                                        className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                      />
                                      {customMaintenance && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                          {formatHelperAmount(customMaintenance)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* DO YOU CHARGE BROKERAGE? * */}
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">
                                    Do you charge brokerage? <span className="text-rose-500">*</span>
                                  </label>
                                  <div className="flex gap-3">
                                    {["Yes", "No"].map(opt => {
                                      const isActive = opt === "Yes" ? brokerageCharge === "Yes" : (brokerageCharge === "No" || brokerageCharge === "None")
                                      return (
                                        <button
                                          key={opt}
                                          type="button"
                                          onClick={() => setBrokerageCharge(opt)}
                                          className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${isActive ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                                        >
                                          {opt}
                                        </button>
                                      )
                                    })}
                                  </div>

                                  {brokerageCharge === "Yes" && (
                                    <div className="mt-6 space-y-4">
                                      <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                                          Brokerage (in Rupees) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={customBrokerage}
                                            onChange={e => {
                                              const val = e.target.value;
                                              if (val === "" || parseFloat(val) >= 0) {
                                                setCustomBrokerage(val);
                                              }
                                            }}
                                            onKeyDown={handleAmountKeyDown}
                                            placeholder="50000"
                                            min="0"
                                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-24"
                                          />
                                          <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                            {formatHelperAmount(customBrokerage)}
                                          </span>
                                        </div>
                                      </div>
                                      <label className="flex items-center gap-2 cursor-pointer w-fit border border-slate-200 rounded-lg px-4 py-3 hover:border-[#0a2540] transition-colors">
                                        <input
                                          type="checkbox"
                                          checked={brokerageNegotiable}
                                          onChange={e => setBrokerageNegotiable(e.target.checked)}
                                          className="rounded text-[#0a2540] focus:ring-[#0a2540] w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-slate-800">Brokerage Negotiable</span>
                                      </label>
                                    </div>
                                  )}
                                </div>

                                {/* CARPET AREA */}
                                {propertyType !== "Plot" && propertyType !== "Agricultural Land" && (
                                  <div className="grid grid-cols-1 gap-6">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Carpet Area</label>
                                      <div className="relative">
                                        <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                          type="number"
                                          value={carpetArea}
                                          onChange={e => {
                                            const val = e.target.value;
                                            if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 100000)) {
                                              setCarpetArea(val);
                                            }
                                          }}
                                          placeholder="1200"
                                          min="0"
                                          max="100000"
                                          className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                        />
                                        {carpetArea && (
                                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {carpetArea} Sq. ft.
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* FLOOR NO. * & TOTAL FLOORS * */}
                                {propertyType !== "Plot" && propertyType !== "Agricultural Land" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Floor No. <span className="text-rose-500">*</span></label>
                                      <input
                                        type="number"
                                        value={floorNo}
                                        onChange={e => {
                                          const val = e.target.value;
                                          if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 200)) {
                                            setFloorNo(val);
                                          }
                                        }}
                                        onKeyDown={handleAmountKeyDown}
                                        placeholder="3"
                                        min="0"
                                        max="200"
                                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Floors <span className="text-rose-500">*</span></label>
                                      <input
                                        type="number"
                                        value={totalFloors}
                                        onChange={e => {
                                          const val = e.target.value;
                                          if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 200)) {
                                            setTotalFloors(val);
                                          }
                                        }}
                                        onKeyDown={handleAmountKeyDown}
                                        placeholder="12"
                                        min="0"
                                        max="200"
                                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none text-sm font-semibold transition-all"
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Additional Details Accordion */}
                            <div className="border border-[#0a2540]/10 rounded-xl overflow-hidden shadow-sm">
                              <button
                                type="button"
                                onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                                className="w-full flex items-center justify-between p-4 bg-[#0a2540]/5/40 hover:bg-[#0a2540]/5 transition-colors"
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
                                    className="overflow-hidden bg-white border-t border-[#0a2540]/10/50"
                                  >
                                    <div className="p-6 space-y-10">
                                      {lookingTo === "Rent" ? (
                                        <>
                                          {/* Parking Charges */}
                                          <div>
                                            <label className="block text-sm font-semibold text-slate-400 mb-4">Parking Charges</label>
                                            <div className="flex flex-wrap gap-4">
                                              {["Include in rent", "Separate"].map(opt => (
                                                <button
                                                  key={opt}
                                                  type="button"
                                                  onClick={() => setParkingCharges(opt)}
                                                  className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${parkingCharges === opt ? "bg-[#0a2540] border-[#0a2540] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600"}`}
                                                >
                                                  {opt}
                                                </button>
                                              ))}
                                            </div>
                                            {parkingCharges === "Separate" && (
                                              <div className="mt-4">
                                                <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                                  Parking Charges (per month) <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                  <input
                                                    type="number"
                                                    value={customParkingCharges}
                                                    onChange={e => {
                                                      const val = e.target.value;
                                                      if (val === "" || parseFloat(val) >= 0) {
                                                        setCustomParkingCharges(val);
                                                      }
                                                    }}
                                                    onKeyDown={handleAmountKeyDown}
                                                    min="0"
                                                    className="w-full text-base font-semibold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-24"
                                                  />
                                                  <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                                    {formatHelperAmount(customParkingCharges)}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
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
                                                  className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${paintingCharges === opt ? "bg-[#0a2540] border-[#0a2540] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600"}`}
                                                >
                                                  {opt}
                                                </button>
                                              ))}
                                            </div>
                                            {paintingCharges === "Custom" && (
                                              <div className="mt-4">
                                                <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                                  Painting Charges <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="relative">
                                                  <input
                                                    type="number"
                                                    value={customPaintingCharges}
                                                    onChange={e => {
                                                      const val = e.target.value;
                                                      if (val === "" || parseFloat(val) >= 0) {
                                                        setCustomPaintingCharges(val);
                                                      }
                                                    }}
                                                    onKeyDown={handleAmountKeyDown}
                                                    min="0"
                                                    className="w-full text-base font-semibold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors pr-24"
                                                  />
                                                  <span className="absolute right-0 bottom-3 text-sm font-bold text-slate-400">
                                                    {formatHelperAmount(customPaintingCharges)}
                                                  </span>
                                                </div>
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
                                                  className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${facing === opt ? "bg-[#0a2540] border-[#0a2540] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600"}`}
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
                                                  className={`px-8 py-2.5 rounded-xl text-sm font-medium border transition-colors ${servantRoom === opt ? "bg-[#0a2540] border-[#0a2540] text-white shadow-sm" : "bg-white border-slate-200 text-slate-600"}`}
                                                >
                                                  {opt}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          {/* Facing */}
                                          <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-3">Facing</label>
                                            <div className="flex flex-wrap gap-3">
                                              {["North", "East", "West", "South", "North - East", "North - West", "South - East", "South - West"].map(opt => (
                                                <button
                                                  key={opt}
                                                  type="button"
                                                  onClick={() => setFacing(opt)}
                                                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${facing === opt
                                                    ? "bg-[#0a2540] border-[#0a2540] text-white shadow-sm"
                                                    : "bg-white border-slate-200 text-slate-700 hover:border-[#0a2540]"
                                                    }`}
                                                >
                                                  {opt}
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Address */}
                                          <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-2">Address</label>
                                            <input
                                              type="text"
                                              value={additionalAddress}
                                              onChange={e => setAdditionalAddress(e.target.value)}
                                              className="w-full text-base font-semibold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                            />
                                          </div>

                                          {/* Servant Room */}
                                          <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-3">Servant Room</label>
                                            <div className="flex gap-3">
                                              {["Yes", "No"].map(opt => (
                                                <button
                                                  key={opt}
                                                  type="button"
                                                  onClick={() => setServantRoom(opt)}
                                                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all ${servantRoom === opt
                                                    ? "bg-[#0a2540] border-[#0a2540] text-white shadow-sm"
                                                    : "bg-white border-slate-200 text-slate-700 hover:border-[#0a2540]"
                                                    }`}
                                                >
                                                  {opt}
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          {/* RERA ID */}
                                          <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-2">RERA ID</label>
                                            <input
                                              type="text"
                                              value={reraId}
                                              onChange={e => setReraId(e.target.value)}
                                              className="w-full text-base font-semibold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                                            />
                                          </div>

                                          {/* Property Description */}
                                          <div>
                                            <div className="flex justify-between items-center mb-2">
                                              <label className="block text-sm font-semibold text-slate-500">Property Description</label>
                                              <span className="text-xs font-semibold text-slate-400">
                                                {(formData.description || "").length} / 1500
                                              </span>
                                            </div>
                                            <textarea
                                              name="description"
                                              value={formData.description}
                                              onChange={e => {
                                                if (e.target.value.length <= 1500) {
                                                  handleInputChange(e);
                                                }
                                              }}
                                              rows={2}
                                              className="w-full text-base font-semibold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none resize-none transition-colors"
                                            />
                                          </div>
                                        </>
                                      )}
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
                )
              )}

              {/* STEP: Room Details */}
              {currentStepName === "Room Details" && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-50 mb-6">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">Add Room Details</h2>
                      <p className="text-xs font-semibold text-slate-400">Configure room types and pricing for this PG</p>
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-wider">ROOM DETAILS</h3>

                  {rooms.map((room, idx) => (
                    <div key={idx} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 mb-6 space-y-6 relative">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-[#0a2540]">Room {idx + 1}</h4>
                        {rooms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteRoom(idx)}
                            className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* Room Type */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Room Type <span className="text-rose-500">*</span></label>
                        <div className="flex flex-wrap gap-3">
                          {["Private Room", "Double Sharing", "Triple Sharing", "3+ Sharing"].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setRooms(prev => prev.map((r, i) => i === idx ? { ...r, roomType: type } : r))
                              }}
                              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-colors ${room.roomType === type
                                ? "bg-[#0a2540] text-white border-[#0a2540]"
                                : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"
                                }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Total Beds */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Total Beds in this Room (Optional)</label>
                        <input
                          type="number"
                          value={room.totalBeds}
                          onChange={e => {
                            const val = e.target.value;
                            setRooms(prev => prev.map((r, i) => i === idx ? { ...r, totalBeds: val } : r))
                          }}
                          className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                        />
                      </div>

                      {/* Rent & Security Deposit */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Rent <span className="text-rose-500">*</span></label>
                          <input
                            type="number"
                            value={room.rent}
                            onChange={e => {
                              const val = e.target.value;
                              setRooms(prev => prev.map((r, i) => i === idx ? { ...r, rent: val } : r))
                            }}
                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Security Deposit <span className="text-rose-500">*</span></label>
                          <input
                            type="number"
                            value={room.securityDeposit}
                            onChange={e => {
                              const val = e.target.value;
                              setRooms(prev => prev.map((r, i) => i === idx ? { ...r, securityDeposit: val } : r))
                            }}
                            className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Facilities Offered */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">Facilities Offered</label>
                        <div className="flex flex-wrap gap-3">
                          {["AC", "TV in Room", "Personal Cupboard", "Table Chair", "Attached Balcony", "Attached Bathroom", "Meals Included"].map(facility => {
                            const isSelected = room.facilities.includes(facility);
                            return (
                              <button
                                key={facility}
                                type="button"
                                onClick={() => {
                                  setRooms(prev => prev.map((r, i) => {
                                    if (i === idx) {
                                      const newFac = r.facilities.includes(facility)
                                        ? r.facilities.filter(f => f !== facility)
                                        : [...r.facilities, facility];
                                      return { ...r, facilities: newFac };
                                    }
                                    return r;
                                  }))
                                }}
                                className={`px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${isSelected
                                  ? "bg-[#0a2540] border-[#0a2540] text-white"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-[#0a2540]"
                                  }`}
                              >
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-white bg-white/20" : "border-slate-300"}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                {facility}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addRoom}
                    className="w-full py-4 rounded-xl text-sm font-bold border-2 border-dashed border-[#38D39F] text-[#38D39F] hover:bg-slate-50/50 transition-colors flex items-center justify-center gap-2 mb-6"
                  >
                    + Add Another Room
                  </button>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 rounded-xl text-base font-bold bg-[#38D39F] text-white hover:bg-[#2bc490] transition-colors shadow-lg shadow-emerald-200/50"
                    >
                      Next, add amenities
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: Amenities */}
              {currentStepName === "Amenities" && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-50 mb-6">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">Add Amenities</h2>
                      <p className="text-xs font-semibold text-slate-400">Select the amenities available in this PG</p>
                    </div>
                  </div>

                  {[
                    {
                      title: "Security Amenities",
                      items: [
                        { name: "CCTV", icon: Video },
                        { name: "Gated Community", icon: Lock },
                        { name: "Security", icon: ShieldCheck },
                        { name: "Biometric", icon: Fingerprint }
                      ]
                    },
                    {
                      title: "Furnishings in Property",
                      items: [
                        { name: "Fridge", icon: Server },
                        { name: "Washing Machine", icon: WashingMachine },
                        { name: "Microwave", icon: Microwave },
                        { name: "Water Purifier", icon: Droplet },
                        { name: "TT Table", icon: Trophy },
                        { name: "TV", icon: Tv },
                        { name: "Coffee Machine", icon: Coffee },
                        { name: "Snacks Machine", icon: Cookie }
                      ]
                    },
                    {
                      title: "Services",
                      items: [
                        { name: "Laundry", icon: Shirt },
                        { name: "Housekeeping", icon: Brush },
                        { name: "Internet/Wi-Fi Connectivity", icon: Wifi }
                      ]
                    },
                    {
                      title: "Top Amenities",
                      items: [
                        { name: "Gym", icon: Dumbbell },
                        { name: "Lift", icon: Building },
                        { name: "Regular Water Supply", icon: Droplets },
                        { name: "Swimming Pool", icon: Waves },
                        { name: "Reserved Parking", icon: Car },
                        { name: "Power Backup", icon: Zap }
                      ]
                    }
                  ].map(category => (
                    <div key={category.title} className="space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">{category.title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {category.items.map(item => {
                          const isSelected = formData.amenities.includes(item.name);
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => {
                                setFormData(prev => {
                                  const newAmenities = isSelected
                                    ? prev.amenities.filter(a => a !== item.name)
                                    : [...prev.amenities, item.name];
                                  return { ...prev, amenities: newAmenities };
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${isSelected
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

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 rounded-xl text-base font-bold bg-[#38D39F] text-white hover:bg-[#2bc490] transition-colors shadow-lg shadow-emerald-200/50"
                    >
                      Next, add other details
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: Other Details */}
              {currentStepName === "Other Details" && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 pb-6 border-b border-slate-100 mb-6">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="flex items-center gap-2 text-xl font-black text-slate-800 hover:text-slate-600 transition-colors"
                    >
                      <ChevronLeft size={24} />
                      <span>Add Other Details</span>
                    </button>
                  </div>

                  <h3 className="text-xs font-black text-slate-800 mb-6 uppercase tracking-wider">OTHER PG DETAILS</h3>

                  {/* Onetime Move in Charges */}
                  <div>
                    <input
                      type="number"
                      placeholder="Onetime Move in Charges (Optional)"
                      value={onetimeMoveInCharges}
                      onChange={e => setOnetimeMoveInCharges(e.target.value)}
                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors placeholder:text-slate-400/70"
                    />
                  </div>

                  {/* Meal Charges per Month */}
                  <div>
                    <input
                      type="number"
                      placeholder="Meal Charges per Month (Optional)"
                      value={mealChargesPerMonth}
                      onChange={e => setMealChargesPerMonth(e.target.value)}
                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors placeholder:text-slate-400/70"
                    />
                  </div>

                  {/* Electricity Charges per Month */}
                  <div>
                    <input
                      type="number"
                      placeholder="Electricity Charges per Month (Optional)"
                      value={electricityChargesPerMonth}
                      onChange={e => setElectricityChargesPerMonth(e.target.value)}
                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none transition-colors placeholder:text-slate-400/70"
                    />
                  </div>

                  {/* Description details (Add Additional Information) */}
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-bold text-slate-400">Add Additional Information (Optional)</span>
                      <span className="text-sm font-bold text-slate-400">
                        {(formData.description || "").length} / 1500
                      </span>
                    </div>
                    <textarea
                      name="description"
                      placeholder="Enter details about your PG..."
                      value={formData.description}
                      onChange={e => {
                        if (e.target.value.length <= 1500) {
                          handleInputChange(e);
                        }
                      }}
                      rows={2}
                      className="w-full text-base font-bold text-slate-800 pb-2 border-b border-slate-200 focus:border-[#0a2540] outline-none resize-none transition-colors placeholder:text-slate-400/70"
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 rounded-xl text-base font-bold bg-[#38D39F] text-white hover:bg-[#2bc490] transition-colors shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2"
                    >
                      Next, upload photos
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: Photos */}
              {currentStepName === "Photos" && (
                <div className="space-y-6 max-w-3xl">
                  <h2 className="text-xl font-black text-slate-800 border-b border-slate-50 pb-4">Upload Photos</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl border border-slate-200 overflow-hidden relative group shadow-sm">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-1.5 rounded-lg text-[#0a2540] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-sm touch-target"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#0a2540] hover:bg-[#0a2540]/5 transition-all">
                      {uploading ? (
                        <Loader2 className="animate-spin text-[#0a2540]" size={24} />
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
              {currentStepName === "Verify" && (
                <div className="space-y-6 max-w-2xl">
                  <h2 className="text-xl font-black text-slate-800 border-b border-slate-50 pb-4">Verify Listing</h2>
                  <div className="p-6 bg-[#0a2540]/5/50 rounded-2xl border border-[#0a2540]/10/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0a2540] text-white flex items-center justify-center font-bold">✓</div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Listing Verification Check</h3>
                        <p className="text-xs text-slate-500 font-medium">Verify your details to get a verified tag on your property listing.</p>
                      </div>
                    </div>
                    <hr className="border-[#0a2540]/10" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Contact Number Verified</span>
                        <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Verified</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Ownership Status Declaration</span>
                        <span className="text-[#0a2540] hover:underline cursor-pointer font-bold">Declared</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review */}
              {currentStepName === "Review" && (
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
          {!(currentStepName === "Basic Details" && sector === "Commercial") &&
            !(currentStepName === "Property Details" && (sector === "Commercial" || lookingTo === "PG/Co-living")) &&
            !(lookingTo === "PG/Co-living" && (currentStepName === "Room Details" || currentStepName === "Amenities" || currentStepName === "Other Details")) && (
              <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  Back
                </button>

                {currentStep < activeSteps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-8 py-2.5 rounded-lg text-sm font-bold bg-[#0a2540] text-white hover:bg-[#07192c] transition-colors shadow-lg shadow-slate-200 flex items-center gap-2"
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
