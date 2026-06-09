"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Building2,
  Search,
  Plus,
  Loader2,
  ExternalLink,
  Trash2,
  SlidersHorizontal,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  ImageOff,
  Zap,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  Settings2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/auth"
import {
  attachInquiryCounts,
  computeListingQualityScore,
  fetchMyProperties,
  fetchSellerLeads,
} from "@/lib/seller-data"

// ─── Helpers ────────────────────────────────────────────────────────────────
function lqsColor(score: number): string {
  if (score >= 7) return "#16a34a"  // green
  if (score >= 5) return "#f59e0b"  // amber
  return "#ef4444"                   // red
}

const PROPERTY_TYPES = [
  "Apartment", "Independent House", "Independent Floor",
  "Plot", "Villa", "Agricultural Land", "Office Space",
  "Shop", "Showroom", "Warehouse"
]

const BHK_OPTIONS = ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "8 BHK", "10 BHK", "12 BHK", "Plot"]

// ─── Property Card ───────────────────────────────────────────────────────────
function PropertyCard({
  prop,
  index,
  onDelete,
  onEdit,
  onView
}: {
  prop: any
  index: number
  onDelete: (id: number) => void
  onEdit: (id: number) => void
  onView: (id: number) => void
}) {
  const lqsNum = prop.lqs ?? computeListingQualityScore(prop)
  const imgCount = prop.images?.length || 0
  const statusColors: Record<string, string> = {
    ACTIVE:      "bg-emerald-500",
    DEACTIVATED: "bg-orange-500",
    EXPIRED:     "bg-red-500",
    REJECTED:    "bg-[#0a2540]",
    INACTIVE:    "bg-slate-400",
  }
  const statusLabel: Record<string, string> = {
    ACTIVE:      "Active",
    DEACTIVATED: "Deactivated",
    EXPIRED:     "Expired",
    REJECTED:    "Rejected",
    INACTIVE:    "Inactive",
  }
  const statusKey = (prop.status || "INACTIVE").toUpperCase()
  const badgeBg = statusColors[statusKey] || "bg-slate-400"
  const badgeLabel = statusLabel[statusKey] || prop.status

  const deactivatedOn = prop.updatedAt
    ? new Date(prop.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : statusKey === 'INACTIVE' || statusKey === 'DEACTIVATED'
      ? '—'
      : 'Active'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-[160px] h-[130px] sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
          {imgCount > 0 ? (
            <img
              src={prop.images[0]}
              alt={prop.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300">
              <ImageOff size={28} />
              <span className="text-[10px] font-bold">NO PHOTOS</span>
            </div>
          )}
          {/* Status badge */}
          <div className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded text-white text-[10px] font-black uppercase tracking-wide ${badgeBg} shadow`}>
            {badgeLabel}
          </div>
          {/* Image count */}
          {imgCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              1/{imgCount}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 leading-tight truncate pr-2">
                {prop.title || "Untitled Property"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {prop.location || prop.address || "Location not specified"}
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">
              ID : {prop.id}
            </span>
          </div>

          {/* Price + area */}
          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
            {prop.price ? (
              <span>
                ₹{prop.price >= 10000000
                  ? `${(prop.price / 10000000).toFixed(2)} Cr`
                  : prop.price >= 100000
                    ? `${(prop.price / 100000).toFixed(0)} L`
                    : prop.price.toLocaleString("en-IN")}
                {prop.purpose === "RENT" && <span className="text-xs font-bold text-slate-500"> / month</span>}
              </span>
            ) : (
              <span className="text-slate-400 text-xs font-bold">Price not set</span>
            )}
            {prop.area && (
              <>
                <span className="text-slate-300 font-light">•</span>
                <span className="text-xs font-bold text-slate-600">{prop.area} sq.ft.</span>
              </>
            )}
          </div>

          {/* Metrics row */}
          <div className="flex items-center gap-4 flex-wrap text-xs">
            {/* Listing Quality Score */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm"
                style={{ backgroundColor: lqsColor(lqsNum) }}
              >
                {lqsNum.toFixed(1)}
              </div>
              <button className="flex items-center gap-0.5 text-[11px] font-bold text-[#0a2540] hover:underline">
                Improve <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200" />

            {/* Deactivated On */}
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deactivated On</span>
              <span className="text-xs font-black text-slate-800 mt-0.5">{deactivatedOn}</span>
            </div>

            <div className="w-px h-6 bg-slate-200" />

            {/* Leads */}
            <div className="flex flex-col items-center min-w-[40px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Leads</span>
              <span className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-0.5">
                {prop.inquiryCount ?? 0}
                {(prop.inquiryCount ?? 0) > 0 && (
                  <ExternalLink className="w-2.5 h-2.5 text-[#0a2540]" />
                )}
              </span>
            </div>

            <div className="w-px h-6 bg-slate-200" />

            {/* Views */}
            <div className="flex flex-col items-center min-w-[48px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Views</span>
              <span className="text-xs font-black text-slate-800 mt-0.5">{prop.views ?? 0}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100 flex-wrap">
            <button
              onClick={() => onEdit(prop.id)}
              className="text-xs font-black text-[#0a2540] hover:underline transition-colors"
            >
              Manage
            </button>
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-black border border-emerald-400 text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              Verify
            </button>
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-black bg-[#0a2540]/5 border border-[#0a2540] text-[#0a2540] hover:bg-[#0a2540]/10 transition-colors"
            >
              Repost
            </button>
            <button
              onClick={() => onView(prop.id)}
              className="ml-auto flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
              title="View on site"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(prop.id)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[#0a2540] transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Tabs
  const [activeTab, setActiveTab] = useState("All")

  // Filters
  const [searchId, setSearchId] = useState("")
  const [sector, setSector] = useState("Residential")
  const [service, setService] = useState<string[]>([])
  const [listingStatus, setListingStatus] = useState<string[]>([])
  const [locality, setLocality] = useState("")
  const [projectName, setProjectName] = useState("")
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [bhk, setBhk] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(35000000)
  const [furnishing, setFurnishing] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("High to Low")
  const [sortDropdown, setSortDropdown] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  useEffect(() => {
    async function loadListings() {
      const userData = localStorage.getItem("seller_user")
      if (!userData) { router.push("/login"); return }
      const user = JSON.parse(userData)
      const token = localStorage.getItem("seller_token")

      try {
        // Fetch active payment status from backend to ensure real-time accuracy
        const statusRes = await fetch(`${getApiUrl()}/payments/status`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        let activePlan = user.subscriptionPlan;
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          activePlan = statusData.plan;
          
          // Keep local storage synchronized
          const updatedUser = { ...user, subscriptionPlan: activePlan }
          localStorage.setItem("seller_user", JSON.stringify(updatedUser))
        }

        setHasSubscription(true)

        const rawProps = await fetchMyProperties(token!)
        const leads = await fetchSellerLeads(token!, user.id)
        setProperties(attachInquiryCounts(rawProps, leads))
      } catch (err) {
        console.error("Failed to fetch properties", err)
      } finally {
        setLoading(false)
      }
    }
    loadListings()
  }, [router])

  // Close sort dropdown on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortDropdown(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const handleDelete = (id: number) => setDeleteConfirmId(id)

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    setIsDeleting(true)
    const token = localStorage.getItem("seller_token")
    try {
      const res = await fetch(`${getApiUrl()}/properties/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== deleteConfirmId))
      } else {
        alert("Failed to delete property.")
      }
    } catch (err) {
      alert("Error connecting to server.")
    } finally {
      setIsDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  const handleEdit = (id: number) => router.push(`/listings/edit/${id}`)
  const handleView = (id: number) =>
    window.open(`${process.env.NEXT_PUBLIC_MAIN_URL || "https://kanharaj.com"}/property/${id}`, "_blank")

  const resetFilters = () => {
    setSector("Residential"); setService([]); setListingStatus([])
    setLocality(""); setProjectName(""); setPropertyTypes([])
    setBhk([]); setPriceMin(0); setPriceMax(35000000); setFurnishing([])
    setSearchId(""); setActiveTab("All")
  }

  // Derived tab counts
  const activeProps     = properties.filter(p => (p.status || "").toUpperCase() === "ACTIVE")
  const lowLqsProps     = properties.filter(p => (p.lqs ?? computeListingQualityScore(p)) < 5)
  const noImagesProps   = properties.filter(p => !p.images || p.images.length === 0)
  const deactivatedProps= properties.filter(p => (p.status || "").toUpperCase() === "DEACTIVATED")
  const expiredProps    = properties.filter(p => (p.status || "").toUpperCase() === "EXPIRED")
  const rejectedProps   = properties.filter(p => (p.status || "").toUpperCase() === "REJECTED")

  const tabs = [
    { label: "All",                  count: properties.length },
    { label: "Low LQS",              count: lowLqsProps.length,      dotColor: "#ef4444" },
    { label: "No Images",            count: noImagesProps.length },
    { label: "Active",               count: activeProps.length },
    { label: "Deactivated", count: deactivatedProps.length },
    { label: "Expired", count: expiredProps.length },
  ]

  // Apply tab filter
  let filtered = [...properties]
  if (activeTab === "Low LQS")              filtered = lowLqsProps
  else if (activeTab === "No Images")       filtered = noImagesProps
  else if (activeTab === "Active")          filtered = activeProps
  else if (activeTab === "Deactivated") filtered = deactivatedProps
  else if (activeTab === "Expired")     filtered = expiredProps

  // Apply sidebar filters
  if (listingStatus.length > 0) {
    filtered = filtered.filter(p => listingStatus.includes((p.status || "").toUpperCase()))
  }
  if (locality) {
    filtered = filtered.filter(p =>
      (p.location || p.address || "").toLowerCase().includes(locality.toLowerCase())
    )
  }
  if (propertyTypes.length > 0) {
    filtered = filtered.filter(p =>
      propertyTypes.some(t => (p.propertyType || p.title || "").toLowerCase().includes(t.toLowerCase()))
    )
  }

  // Sort
  if (sortBy === "High to Low") filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0))
  else if (sortBy === "Low to High") filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0))
  else if (sortBy === "Newest") filtered = [...filtered].sort((a, b) => b.id - a.id)

  const anyFilterActive = sector !== "Residential" || service.length > 0 ||
    listingStatus.length > 0 || locality || propertyTypes.length > 0 || bhk.length > 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#0a2540]" size={40} />
        <p className="text-slate-500 font-bold">Fetching your properties...</p>
      </div>
    )
  }

  if (!hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 bg-[#0a2540]/5 rounded-full flex items-center justify-center text-[#0a2540]">
          <Building2 size={32} />
        </div>
        <h4 className="font-black text-slate-800 text-lg">Subscribe to Post Listings</h4>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          Purchase a subscription plan to start listing properties on Kanharaj.com.
        </p>
        <a
          href="/subscription"
          className="px-6 py-3 bg-[#0a2540] text-white rounded-xl font-bold text-sm hover:bg-[#07192c] transition-colors shadow-lg shadow-slate-200"
        >
          View Subscription Plans
        </a>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">

      {/* ── Sidebar Overlay (mobile) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Left Sidebar ── */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-full md:h-auto z-50 md:z-auto
        w-72 bg-white border-r border-slate-200 flex-shrink-0
        transform transition-transform duration-300 overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:flex md:flex-col
      `} style={{ maxHeight: "100vh" }}>
        <div className="p-5">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-black text-slate-800">Filters</h3>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-[#0a2540] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>

          {/* Filters Applied */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Filters Applied</p>
            {anyFilterActive ? (
              <div className="flex flex-wrap gap-1.5">
                {listingStatus.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-[#0a2540]/5 text-[#0a2540] text-[10px] font-bold border border-[#0a2540]/10 flex items-center gap-1">
                    {s} <button onClick={() => setListingStatus(p => p.filter(x => x !== s))}><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No filters selected yet</p>
            )}
          </div>

          {/* Search */}
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder="Enter property IDs"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0a2540]/30 bg-white"
              />
            </div>
          </div>

          {/* Sector */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Sector</p>
            <div className="flex gap-5">
              {["Residential", "Commercial"].map(s => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <div
                    onClick={() => setSector(s)}
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${sector === s ? "border-[#0a2540] bg-[#0a2540]" : "border-slate-300 bg-white"}`}
                  >
                    {sector === s && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Service */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Service</p>
            <div className="flex gap-2">
              {["Buy", "Rent", "PG"].map(s => {
                const active = service.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => setService(p => active ? p.filter(x => x !== s) : [...p, s])}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${active ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540] hover:text-[#0a2540]"}`}
                  >{s}</button>
                )
              })}
            </div>
          </div>

          {/* Listing Status */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Listing Status</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "ACTIVE",      label: `Active (${activeProps.length})` },
                { key: "EXPIRED",     label: `Expired (${expiredProps.length})` },
                { key: "REJECTED",    label: `Rejected (${rejectedProps.length})` },
                { key: "DEACTIVATED", label: `Deactivated (${deactivatedProps.length})` },
              ].map(({ key, label }) => {
                const active = listingStatus.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => setListingStatus(p => active ? p.filter(x => x !== key) : [...p, key])}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${active ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540] hover:text-[#0a2540]"}`}
                  >{label}</button>
                )
              })}
            </div>
          </div>

          {/* Locality */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Locality</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={locality}
                onChange={e => setLocality(e.target.value)}
                placeholder="Enter Locality here"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0a2540]/30 bg-white"
              />
            </div>
          </div>

          {/* Project */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Project</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Enter Project Name here"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0a2540]/30 bg-white"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Property Type</p>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map(pt => {
                const active = propertyTypes.includes(pt)
                return (
                  <button
                    key={pt}
                    onClick={() => setPropertyTypes(p => active ? p.filter(x => x !== pt) : [...p, pt])}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${active ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540] hover:text-[#0a2540]"}`}
                  >{pt}</button>
                )
              })}
            </div>
          </div>

          {/* BHK */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">BHK</p>
            <div className="flex flex-wrap gap-1.5">
              {BHK_OPTIONS.map(b => {
                const active = bhk.includes(b)
                return (
                  <button
                    key={b}
                    onClick={() => setBhk(p => active ? p.filter(x => x !== b) : [...p, b])}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${active ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540] hover:text-[#0a2540]"}`}
                  >{b}</button>
                )
              })}
            </div>
          </div>

          {/* Listed By */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Listed By</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Sub Broker Name here"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0a2540]/30 bg-white"
              />
            </div>
          </div>

          {/* Price */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Price</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500">Min:</label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={e => setPriceMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0a2540]/30"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold pt-4">To</span>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500">Max:</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#0a2540]/30"
                />
              </div>
            </div>
            <input
              type="range"
              min={0} max={35000000} step={100000}
              value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#0a2540]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>₹ {priceMin.toLocaleString("en-IN")}</span>
              <span>₹ {priceMax >= 35000000 ? "Any" : priceMax.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Furnishing */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Furnishing</p>
            <div className="flex flex-wrap gap-2">
              {["Unfurnished", "Semi Furnished", "Fully Furnished"].map(f => {
                const active = furnishing.includes(f)
                return (
                  <button
                    key={f}
                    onClick={() => setFurnishing(p => active ? p.filter(x => x !== f) : [...p, f])}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${active ? "bg-[#0a2540] text-white border-[#0a2540]" : "bg-white text-slate-600 border-slate-200 hover:border-[#0a2540]"}`}
                  >{f}</button>
                )
              })}
            </div>
          </div>

          {/* Verification Status */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Verification Status</p>
            <div className="flex gap-2">
              {["Unverified", "Verified"].map(v => (
                <button key={v} className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-slate-600 border border-slate-200 hover:border-[#0a2540] hover:text-[#0a2540] transition-all">{v}</button>
              ))}
            </div>
          </div>

          {/* Possession Status */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Possession Status</p>
            <div className="flex flex-wrap gap-2">
              {["Ready to move", "Under Construction"].map(p => (
                <button key={p} className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-slate-600 border border-slate-200 hover:border-[#0a2540] hover:text-[#0a2540] transition-all">{p}</button>
              ))}
            </div>
          </div>

          {/* Show Archived */}
          <div className="mb-5 flex items-center gap-2">
            <input type="checkbox" id="archived" className="w-3.5 h-3.5 accent-[#0a2540] rounded" />
            <label htmlFor="archived" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Show archived listings
            </label>
          </div>

        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 p-4 md:p-6 space-y-4">

        {/* Mobile filter toggle + Add Property */}
        <div className="flex items-center justify-between md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {anyFilterActive && <span className="w-2 h-2 rounded-full bg-[#0a2540]" />}
          </button>
          <Link
            href="/listings/add"
            className="flex items-center gap-1.5 bg-[#0a2540] text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
          >
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        </div>

        {/* Tabs bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.label
                  ? "border border-[#0a2540] text-[#0a2540] bg-[#0a2540]/5"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.dotColor && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.dotColor }} />
              )}
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  activeTab === tab.label ? "bg-[#0a2540] text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}

          {/* Add Property desktop */}
          <div className="hidden md:flex ml-auto items-center">
            <Link
              href="/listings/add"
              className="flex items-center gap-1.5 bg-[#0a2540] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#07192c] transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Property
            </Link>
          </div>
        </div>

        {/* Info bar: count + credits + sort */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-bold text-slate-700">
            Showing <span className="font-black text-slate-900">{filtered.length}</span> properties
          </p>

          <div className="flex items-center gap-3">
            {/* Sort By dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortDropdown(!sortDropdown)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white rounded-lg px-3 py-1.5 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort by
                <span className="text-[#0a2540] font-black">{sortBy}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {sortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden"
                  >
                    {["High to Low", "Low to High", "Newest"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortDropdown(false) }}
                        className={`block w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 transition-colors ${sortBy === opt ? "text-[#0a2540]" : "text-slate-700"}`}
                      >{opt}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="flex items-center gap-1.5 text-xs font-bold text-[#0a2540] hover:underline">
              <RefreshCw className="w-3.5 h-3.5" /> Sync
            </button>
          </div>
        </div>

        {/* Property Cards */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((prop, i) => (
              <PropertyCard
                key={prop.id}
                prop={prop}
                index={i}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onView={handleView}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Building2 size={28} />
              </div>
              <h4 className="font-black text-slate-800">No properties found</h4>
              <p className="text-slate-400 text-sm mt-1">
                {anyFilterActive
                  ? "Try adjusting your filters."
                  : "Start by adding your first property to reach buyers."}
              </p>
              {!anyFilterActive && (
                <Link
                  href="/listings/add"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#0a2540] text-white rounded-xl text-sm font-bold hover:bg-[#07192c] transition-colors shadow"
                >
                  <Plus className="w-4 h-4" /> Post Your First Property
                </Link>
              )}
              {anyFilterActive && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-xs font-bold text-[#0a2540] border border-[#0a2540] rounded-xl hover:bg-[#0a2540]/5 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
            onClick={() => !isDeleting && setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-[#0a2540]/5 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                {isDeleting ? <Loader2 className="animate-spin" size={32} /> : <Trash2 size={32} />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Permanently Delete?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                Are you sure you want to remove this property? This action is irreversible.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-14 bg-[#0a2540] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#07192c] transition-all disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Keep Asset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
