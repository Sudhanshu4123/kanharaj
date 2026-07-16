"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  MapPin,
  IndianRupee,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  Edit3,
  ExternalLink,
  ImageOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingUp,
  Star,
  Phone,
  Calendar,
  Tag,
  Home,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getApiUrl, getMainSiteUrl } from "@/lib/auth"
import { computeListingQualityScore } from "@/lib/seller-data"

function lqsColor(score: number): string {
  if (score >= 7) return "#16a34a"
  if (score >= 5) return "#f59e0b"
  return "#ef4444"
}

function lqsLabel(score: number): string {
  if (score >= 7) return "Excellent"
  if (score >= 5) return "Good"
  return "Needs Work"
}

function formatPrice(price: number, purpose?: string): string {
  if (!price) return "Price not set"
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${purpose === "RENT" ? "/mo" : ""}`
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)} L${purpose === "RENT" ? "/mo" : ""}`
  return `₹${price.toLocaleString("en-IN")}${purpose === "RENT" ? "/mo" : ""}`
}

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const propertyId = resolvedParams.id

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function fetchProperty() {
      try {
        const token = localStorage.getItem("seller_token")
        if (!token) { router.push("/login"); return }

        const res = await fetch(`${getApiUrl()}/properties/${propertyId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (!res.ok) {
          setError("Property not found or you don't have access.")
          return
        }
        const data = await res.json()
        setProperty(data)
      } catch (err) {
        setError("Failed to load property details.")
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [propertyId, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#0a2540]" size={40} />
        <p className="text-slate-500 font-bold">Loading property details...</p>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400">
          <Building2 size={32} />
        </div>
        <h4 className="font-black text-slate-800 text-lg">{error || "Property not found"}</h4>
        <Link href="/listings" className="text-[#0a2540] font-bold hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>
      </div>
    )
  }

  const images: string[] = property.images || []
  const lqsNum = computeListingQualityScore(property)
  const amenities: string[] = property.amenities || []
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500",
    DEACTIVATED: "bg-orange-500",
    EXPIRED: "bg-red-500",
    REJECTED: "bg-[#0a2540]",
    INACTIVE: "bg-slate-400",
  }
  const statusKey = (property.status || "INACTIVE").toUpperCase()

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Back button + actions header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-[#0a2540] font-bold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Listings
          </button>

          <div className="flex items-center gap-3">
            <a
              href={`${getMainSiteUrl()}/property/${propertyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Site
            </a>
            <Link
              href={`/listings/edit/${propertyId}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0a2540] text-white hover:bg-[#07192c] text-xs font-bold transition-colors shadow"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Property
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Images + Title + Stats ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <div className="relative bg-slate-100 h-64 sm:h-80 overflow-hidden">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[activeImage]}
                      alt={`Property image ${activeImage + 1}`}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                    {/* Nav arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveImage(i => (i + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Counter */}
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg">
                          {activeImage + 1}/{images.length}
                        </div>
                      </>
                    )}
                    {/* Status badge */}
                    <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[11px] font-black uppercase tracking-wide ${statusColors[statusKey] || "bg-slate-400"} shadow-sm`}>
                      {statusKey}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                    <ImageOff size={48} />
                    <span className="text-sm font-bold">No photos added yet</span>
                    <Link
                      href={`/listings/edit/${propertyId}`}
                      className="mt-1 text-xs font-black text-[#0a2540] hover:underline"
                    >
                      + Add Photos
                    </Link>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none border-t border-slate-100">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? "border-[#0a2540]" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title + Location + Price */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    {property.title || "Untitled Property"}
                  </h1>
                  <p className="flex items-center gap-1 text-slate-500 text-sm font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0a2540]" />
                    {property.address || property.location || property.city || "Location not specified"}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                  ID: {property.id}
                </span>
              </div>

              <p className="text-2xl font-black text-[#0a2540] mb-4">
                {formatPrice(property.price, property.purpose)}
              </p>

              {/* Key specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {property.bedrooms && (
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <Bed className="w-4 h-4 text-[#0a2540] shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Beds</p>
                      <p className="text-sm font-black text-slate-800">{property.bedrooms} BHK</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <Bath className="w-4 h-4 text-[#0a2540] shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Baths</p>
                      <p className="text-sm font-black text-slate-800">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <Maximize2 className="w-4 h-4 text-[#0a2540] shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Area</p>
                      <p className="text-sm font-black text-slate-800">{property.area} sq.ft.</p>
                    </div>
                  </div>
                )}
                {property.propertyType && (
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <Home className="w-4 h-4 text-[#0a2540] shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                      <p className="text-xs font-black text-slate-800 leading-tight">{property.propertyType?.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description */}
            {property.description && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Description</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </motion.div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#0a2540]/5 border border-[#0a2540]/20 text-[#0a2540] text-xs font-bold rounded-full"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {a}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Stats + Details ── */}
          <div className="space-y-5">

            {/* Listing Quality Score */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Listing Quality</h2>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black shadow-md shrink-0"
                  style={{ backgroundColor: lqsColor(lqsNum) }}
                >
                  {lqsNum.toFixed(1)}
                </div>
                <div>
                  <p className="font-black text-slate-800">{lqsLabel(lqsNum)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Out of 10</p>
                  <Link
                    href={`/listings/edit/${propertyId}`}
                    className="text-[10px] font-black text-[#0a2540] hover:underline mt-1 block"
                  >
                    + Improve Score
                  </Link>
                </div>
              </div>
              {/* Score bar */}
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${(lqsNum / 10) * 100}%`, backgroundColor: lqsColor(lqsNum) }}
                />
              </div>
            </motion.div>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Performance</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                  <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-blue-700">{property.views ?? 0}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Views</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                  <Phone className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xl font-black text-emerald-700">{property.inquiryCount ?? 0}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Leads</p>
                </div>
              </div>
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Details</h2>
              <div className="space-y-3">
                {[
                  { label: "Status", value: statusKey, badge: true },
                  { label: "Purpose", value: property.purpose || property.listingType || "—" },
                  { label: "City", value: property.city || "—" },
                  { label: "State", value: property.state || "—" },
                  { label: "Pincode", value: property.pincode || "—" },
                  { label: "Furnishing", value: property.furnishingStatus || property.furnishing || "—" },
                  { label: "Floor", value: property.floor != null ? `${property.floor}` : "—" },
                  { label: "Total Floors", value: property.totalFloors != null ? `${property.totalFloors}` : "—" },
                  { label: "Facing", value: property.facing || "—" },
                  { label: "Possession", value: property.possessionStatus || property.possession || "—" },
                  { label: "Listed On", value: property.createdAt ? new Date(property.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                ].filter(d => d.value !== "—").map(({ label, value, badge }) => (
                  <div key={label} className="flex items-center justify-between gap-2 text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-500 font-medium shrink-0">{label}</span>
                    {badge ? (
                      <span className={`px-2 py-0.5 rounded text-white text-[10px] font-black uppercase ${statusColors[statusKey] || "bg-slate-400"}`}>
                        {value}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-800 text-right truncate">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Verification */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className={`rounded-2xl border p-4 shadow-sm ${property.verified ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${property.verified ? "bg-emerald-100" : "bg-amber-100"}`}>
                  {property.verified
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    : <Zap className="w-5 h-5 text-amber-600" />
                  }
                </div>
                <div>
                  <p className={`text-sm font-black ${property.verified ? "text-emerald-800" : "text-amber-800"}`}>
                    {property.verified ? "Verified Listing" : "Not Yet Verified"}
                  </p>
                  <p className={`text-xs mt-0.5 ${property.verified ? "text-emerald-600" : "text-amber-600"}`}>
                    {property.verified
                      ? "This property has been verified by Kanharaj."
                      : "Verify to get 3x more leads."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2"
            >
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Quick Actions</h2>
              <Link
                href={`/listings/edit/${propertyId}`}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#0a2540] text-white text-xs font-bold hover:bg-[#07192c] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit & Manage Listing
              </Link>
              <a
                href={`${getMainSiteUrl()}/property/${propertyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Kanharaj.com
              </a>
              <Link
                href="/leads"
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                View All Leads
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
