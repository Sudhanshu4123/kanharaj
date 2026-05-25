"use client"

import { useState, useEffect, useRef } from "react"
import {
  Users,
  Phone,
  Loader2,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  RefreshCw,
  Download,
  MapPin,
  Calendar,
  SlidersHorizontal,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  fetchSellerLeads,
  fetchSellerPaymentStatus,
  mapInquiryStatusToLabel,
  mapLabelToInquiryStatus,
} from "@/lib/seller-data"
import { getSellerAuthHeaders } from "@/lib/utils"

// ─── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const now = Date.now()
  const diff = Math.floor((now - d.getTime()) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 172800) return "yesterday"
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })
}

const PROPERTY_TYPES = [
  "Apartment", "Independent Floor", "Independent House", "Villa",
  "Plot", "Agricultural Land", "Office Space", "Shop",
  "Showroom", "Commercial Plot", "Warehouse", "Others"
]

const LEAD_STATUS_OPTIONS = ["New", "Replied", "Closed"]

// ─── Lead Card ───────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  index,
  hasSubscription,
  onStatusChange,
}: {
  lead: any
  index: number
  hasSubscription: boolean
  onStatusChange: (id: number, label: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [status, setStatus] = useState(mapInquiryStatusToLabel(lead.status))
  const [savingStatus, setSavingStatus] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)

  // Close status dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const statusColors: Record<string, string> = {
    New: "bg-[#6C4EF2] text-white",
    Replied: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Closed: "bg-slate-100 text-slate-500 border border-slate-200",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Main row */}
      <div className="p-4 flex flex-col md:flex-row gap-4">

        {/* Left: Buyer info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1 flex-wrap">
            <span className="text-sm font-black text-slate-900">{lead.name || "Unknown Buyer"}</span>
            <button className="text-slate-400 hover:text-[#6C4EF2] transition-colors ml-1" title="Share">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Contacted {timeAgo(lead.createdAt || new Date().toISOString())}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 text-xs font-bold text-[#6C4EF2] hover:underline mt-1 transition-colors"
          >
            More buyer info {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Middle: Property details */}
        <div className="flex-1 min-w-0 border-l border-slate-100 pl-4">
          <p className="text-sm font-black text-slate-900 truncate">
            {lead.propertyTitle || "General inquiry"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {lead.propertyLocation || "—"}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
              {lead.listingType === "RENT" ? "rent" : lead.listingType === "BUY" ? "buy" : "inquiry"}
            </span>
            {lead.price != null && Number(lead.price) > 0 && (
              <span className="text-[11px] font-bold text-slate-700">
                ₹{Number(lead.price).toLocaleString("en-IN")}
              </span>
            )}
            {lead.bedrooms != null && lead.bedrooms > 0 && (
              <span className="text-[11px] font-bold text-slate-500">{lead.bedrooms} BHK</span>
            )}
            {lead.area != null && lead.area > 0 && (
              <span className="text-[11px] font-bold text-slate-500">{lead.area} sq.ft.</span>
            )}
            {lead.propertyId && (
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_URL || "http://localhost:3000"}/property/${lead.propertyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#6C4EF2] transition-colors"
                title="View property"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* +Add Notes */}
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            className="text-[11px] font-bold text-[#6C4EF2] hover:underline whitespace-nowrap"
          >
            +Add Notes
          </button>

          <div className="flex flex-col gap-1.5 w-full items-end">
            {/* View Contact */}
            {hasSubscription ? (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1.5 text-xs font-bold text-[#6C4EF2] hover:underline whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                View Contact
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 cursor-not-allowed whitespace-nowrap">
                <Phone className="w-3.5 h-3.5" />
                View Contact
              </span>
            )}

            {/* Chat on WhatsApp */}
            <a
              href={hasSubscription ? `https://wa.me/${lead.phone?.replace(/\D/g, "")}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${hasSubscription ? "text-slate-700 hover:text-emerald-600" : "text-slate-400 cursor-not-allowed"}`}
              onClick={e => !hasSubscription && e.preventDefault()}
            >
              {/* WhatsApp icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
              <ChevronDown className="w-3 h-3" />
            </a>
          </div>

          {/* Status dropdown */}
          <div className="relative mt-1" ref={statusRef}>
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${statusColors[status] || statusColors.New}`}
            >
              {status}
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {statusOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden"
                >
                  {LEAD_STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      disabled={savingStatus}
                      onClick={async () => {
                        setSavingStatus(true)
                        await onStatusChange(lead.id, opt)
                        setStatus(opt)
                        setStatusOpen(false)
                        setSavingStatus(false)
                      }}
                      className={`block w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 transition-colors ${status === opt ? "text-[#6C4EF2]" : "text-slate-700"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Expandable: Buyer info details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="px-4 py-3 bg-slate-50/60 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Budget</p>
                <p className="text-sm font-black text-slate-800">
                  {lead.price != null && Number(lead.price) > 0
                    ? `₹${Number(lead.price).toLocaleString("en-IN")}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Properties Contacted</p>
                <p className="text-sm font-black text-slate-800">1</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Localities Interested In</p>
                <p className="text-sm font-black text-slate-800">{lead.locality || lead.propertyLocation || "—"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Notes panel */}
      <AnimatePresence>
        {notesOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="px-4 py-3 bg-purple-50/30">
              <p className="text-[11px] font-bold text-slate-600 mb-2">Add a note for this lead</p>
              <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 whitespace-pre-wrap">
                {lead.message?.trim() || "No message from buyer."}
              </p>
              <button
                onClick={() => setNotesOpen(false)}
                className="text-[11px] font-bold text-slate-500 mt-2 hover:underline"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [activeTab, setActiveTab] = useState("All")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filters
  const [searchId, setSearchId] = useState("")
  const [sector, setSector] = useState("All")
  const [leadStatus, setLeadStatus] = useState<string[]>([])
  const [followUpDate, setFollowUpDate] = useState("")
  const [locality, setLocality] = useState("")
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(10000000)

  const router = useRouter()

  const today = new Date()
  const monthName = today.toLocaleString("en-IN", { month: "short" }) + " '" + String(today.getFullYear()).slice(2)

  useEffect(() => {
    async function load() {
      const userData = localStorage.getItem("seller_user")
      if (!userData) {
        router.push("/login")
        return
      }
      const user = JSON.parse(userData)
      const token = localStorage.getItem("seller_token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const statusData = await fetchSellerPaymentStatus(token)
        const plan = statusData?.plan || user.subscriptionPlan
        const sub = plan && plan !== "NONE"
        setHasSubscription(!!sub)
        if (statusData?.plan) {
          localStorage.setItem("seller_user", JSON.stringify({ ...user, subscriptionPlan: plan }))
        }
        if (!sub) {
          setLoading(false)
          return
        }
        const data = await fetchSellerLeads(token, user.id)
        setLeads(data)
      } catch (err) {
        console.error("Failed to fetch leads", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleStatusChange = async (id: number, label: string) => {
    const headers = getSellerAuthHeaders()
    if (!headers) return
    const apiStatus = mapLabelToInquiryStatus(label)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inquiries/${id}/status?status=${apiStatus}`,
        { method: "PATCH", headers }
      )
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: apiStatus } : l))
        )
      }
    } catch (err) {
      console.error("Failed to update lead status", err)
    }
  }

  // Tab counts
  const now = Date.now()
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  const newLeads = leads.filter(l => mapInquiryStatusToLabel(l.status) === "New")
  const todayLeads = leads.filter(l => new Date(l.createdAt) >= todayStart)
  const monthLeads = leads.filter(l => new Date(l.createdAt) >= monthStart)
  const lastMonthLeads = leads.filter(l => {
    const d = new Date(l.createdAt)
    return d >= lastMonthStart && d < monthStart
  })

  const tabs = [
    { label: "All", count: leads.length },
    { label: "New", count: newLeads.length },
    { label: "Today", count: todayLeads.length },
    { label: monthName, count: monthLeads.length },
    { label: "Last Month", count: lastMonthLeads.length },
  ]

  // Filter leads by active tab
  let filteredLeads = leads
  if (activeTab === "New") filteredLeads = newLeads
  else if (activeTab === "Today") filteredLeads = todayLeads
  else if (activeTab === monthName) filteredLeads = monthLeads
  else if (activeTab === "Last Month") filteredLeads = lastMonthLeads

  // Apply sidebar filters
  if (sector !== "All") {
    filteredLeads = filteredLeads.filter(l =>
      sector === "Residential" ? l.propertyType !== "COMMERCIAL" : l.propertyType === "COMMERCIAL"
    )
  }
  if (leadStatus.length > 0) {
    filteredLeads = filteredLeads.filter(l => leadStatus.includes(mapInquiryStatusToLabel(l.status)))
  }
  if (locality) {
    filteredLeads = filteredLeads.filter(l =>
      (l.propertyLocation || "").toLowerCase().includes(locality.toLowerCase())
    )
  }
  if (selectedPropertyTypes.length > 0) {
    filteredLeads = filteredLeads.filter(l =>
      selectedPropertyTypes.some(t => (l.propertyTitle || "").toLowerCase().includes(t.toLowerCase()))
    )
  }

  const anyFilterActive = sector !== "All" || leadStatus.length > 0 || locality || selectedPropertyTypes.length > 0

  const resetFilters = () => {
    setSector("All")
    setLeadStatus([])
    setLocality("")
    setSelectedPropertyTypes([])
    setPriceMin(0)
    setPriceMax(10000000)
    setSearchId("")
    setFollowUpDate("")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#6C4EF2]" size={40} />
        <p className="text-slate-500 font-bold">Connecting to live inquiries...</p>
      </div>
    )
  }

  if (!hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-[#6C4EF2]">
          <Users size={32} />
        </div>
        <h4 className="font-black text-slate-800 text-lg">Subscribe to View Leads</h4>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          Purchase a subscription plan to start receiving buyer leads for your properties.
        </p>
        <a
          href="/subscription"
          className="px-6 py-3 bg-[#6C4EF2] text-white rounded-xl font-bold text-sm hover:bg-[#5a3fd4] transition-colors shadow-lg shadow-purple-200"
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

      {/* ── Left Sidebar Filters ── */}
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
              className="text-xs font-bold text-[#6C4EF2] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>

          {/* Filters Applied */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Filters Applied</p>
            {anyFilterActive ? (
              <div className="flex flex-wrap gap-1.5">
                {sector !== "All" && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6C4EF2] text-[10px] font-bold border border-purple-100 flex items-center gap-1">
                    {sector} <button onClick={() => setSector("All")}><X className="w-2.5 h-2.5" /></button>
                  </span>
                )}
                {leadStatus.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6C4EF2] text-[10px] font-bold border border-purple-100 flex items-center gap-1">
                    {s} <button onClick={() => setLeadStatus(prev => prev.filter(x => x !== s))}><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No filters selected yet</p>
            )}
          </div>

          {/* Search by Property ID */}
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder="Enter property ID"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C4EF2]/30 bg-white"
              />
            </div>
          </div>

          {/* Sector */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Sector</p>
            <div className="flex gap-4">
              {["All", "Residential", "Commercial"].map(s => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <div
                    onClick={() => setSector(s)}
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${sector === s ? "border-[#6C4EF2] bg-[#6C4EF2]" : "border-slate-300 bg-white"}`}
                  >
                    {sector === s && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lead Status */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Lead Status</p>
            <div className="flex flex-wrap gap-2">
              {LEAD_STATUS_OPTIONS.map(s => {
                const active = leadStatus.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => setLeadStatus(prev => active ? prev.filter(x => x !== s) : [...prev, s])}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${active ? "bg-[#6C4EF2] text-white border-[#6C4EF2]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2] hover:text-[#6C4EF2]"}`}
                  >{s}</button>
                )
              })}
            </div>
          </div>

          {/* Follow Up Date */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Follow Up Date</p>
            <div className="grid grid-cols-2 gap-2">
              {["Today", "Tomorrow", "Past Dated", "Custom Date"].map(d => (
                <button
                  key={d}
                  onClick={() => setFollowUpDate(followUpDate === d ? "" : d)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${followUpDate === d ? "bg-[#6C4EF2] text-white border-[#6C4EF2]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2] hover:text-[#6C4EF2]"}`}
                >{d}</button>
              ))}
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
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C4EF2]/30 bg-white"
              />
            </div>
          </div>

          {/* Property Type */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Property Type</p>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map(pt => {
                const active = selectedPropertyTypes.includes(pt)
                return (
                  <button
                    key={pt}
                    onClick={() => setSelectedPropertyTypes(prev => active ? prev.filter(x => x !== pt) : [...prev, pt])}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${active ? "bg-[#6C4EF2] text-white border-[#6C4EF2]" : "bg-white text-slate-600 border-slate-200 hover:border-[#6C4EF2] hover:text-[#6C4EF2]"}`}
                  >{pt}</button>
                )
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-5 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" placeholder="Start Date"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C4EF2]/30 text-slate-600" />
              <input type="date" placeholder="End Date"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C4EF2]/30 text-slate-600" />
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Price</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500">Min:</label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={e => setPriceMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C4EF2]/30"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold pt-4">To</span>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500">Max:</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C4EF2]/30"
                />
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={10000000}
              step={50000}
              value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#6C4EF2]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>₹ 0</span><span>Any</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 p-4 md:p-6 space-y-4">

        {/* Mobile filter toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {anyFilterActive && <span className="w-2 h-2 rounded-full bg-[#6C4EF2]" />}
          </button>
        </div>

        {/* Lead Summary Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1 overflow-x-auto">
          <span className="px-3 py-2 text-xs font-black text-slate-700 whitespace-nowrap self-center">Lead Summary</span>
          {tabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.label ? "bg-[#6C4EF2] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === tab.label ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Showing count + actions */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-bold text-slate-700">
            Showing <span className="font-black text-slate-900">{filteredLeads.length}</span> lead{filteredLeads.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs font-bold text-[#6C4EF2] hover:underline">
              <RefreshCw className="w-3.5 h-3.5" /> Sync lead status
            </button>
            <span className="text-slate-200">|</span>
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline">
              <Download className="w-3.5 h-3.5" /> Export Leads
            </button>
          </div>
        </div>

        {/* Lead Cards */}
        <div className="space-y-3">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead, i) => (
              <LeadCard
                key={lead.id || i}
                lead={lead}
                index={i}
                hasSubscription={hasSubscription}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-16 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Users size={28} />
              </div>
              <h4 className="font-black text-slate-800">No leads found</h4>
              <p className="text-slate-400 text-sm mt-1">
                {anyFilterActive ? "Try adjusting your filters." : "When buyers contact you from the website, they will appear here."}
              </p>
              {anyFilterActive && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-xs font-bold text-[#6C4EF2] border border-[#6C4EF2] rounded-xl hover:bg-purple-50 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
