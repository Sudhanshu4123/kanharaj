"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Plus,
  Star,
  ChevronRight,
  ChevronDown,
  Megaphone,
  CheckCircle2,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  Home,
  ShieldCheck
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  averageLqs,
  attachInquiryCounts,
  computeConversionRate,
  countInquiriesByPeriod,
  fetchMyProperties,
  fetchSellerLeads,
  fetchSellerPaymentStatus,
  formatPlanBadge,
  leadsToday,
  planListingLimit,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  type SellerLead,
  type SellerProperty,
} from "@/lib/seller-data"

// ─── Circular Progress Component ───────────────────────────────────────────────
function CircularProgress({
  value,
  max,
  label,
  color = "#0a2540",
  size = 72
}: {
  value: number
  max: number
  label: string
  color?: string
  size?: number
}) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const filled = max > 0 ? (value / max) * circ : 0
  return (
    <div className="flex flex-col items-center" style={{ width: size, minWidth: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 absolute inset-0">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth="6" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-xs font-black text-slate-800">{value}/{max}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</span>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    listings: 0,
    leads: 0,
    residentialLeads: 0,
    commercialLeads: 0,
    residentialListings: 0,
    commercialListings: 0,
    views: 0,
    conversion: "0%"
  })
  const [loading, setLoading] = useState(true)
  const [leadsFilter, setLeadsFilter] = useState<"Last Week" | "Last Month" | "Last 3 Months" | "All">("Last Week")
  const [leadsDropdown, setLeadsDropdown] = useState(false)
  const [myProperties, setMyProperties] = useState<SellerProperty[]>([])
  const [myLeads, setMyLeads] = useState<SellerLead[]>([])
  const router = useRouter()

  const isCommercialType = (p: SellerProperty) => {
    const t = (p.propertyType || "").toUpperCase()
    return t.includes("COMMERCIAL") || t.includes("OFFICE") || t.includes("SHOP")
  }

  useEffect(() => {
    async function fetchDashboardData() {
      const userData = localStorage.getItem("seller_user")
      if (!userData) {
        router.push("/login")
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      const sellerId = parsedUser.id
      const token = localStorage.getItem("seller_token")

      // If no subscription, still fetch user properties and leads to show their free post stats
      try {
        const paymentStatus = token ? await fetchSellerPaymentStatus(token) : null
        if (paymentStatus?.plan) {
          parsedUser.subscriptionPlan = paymentStatus.plan
          localStorage.setItem("seller_user", JSON.stringify(parsedUser))
        }

        const props = token ? await fetchMyProperties(token) : []
        const leads = token ? await fetchSellerLeads(token, sellerId) : []
        const withCounts = attachInquiryCounts(props, leads)

        setMyProperties(withCounts)
        setMyLeads(leads)

        const myPropsCount = withCounts.length
        const totalViews = withCounts.reduce((acc, p) => acc + (p.views || 0), 0)
        const residentialListings = withCounts.filter((p) => !isCommercialType(p)).length
        const commercialListings = withCounts.filter((p) => isCommercialType(p)).length
        const residentialLeads = leads.filter((i) => !String(i.propertyType || "").includes("COMMERCIAL")).length
        const commercialLeads = leads.filter((i) => String(i.propertyType || "").includes("COMMERCIAL")).length
        const myInqs = leads.length

        setStats({
          listings: myPropsCount,
          leads: myInqs,
          residentialLeads,
          commercialLeads,
          residentialListings,
          commercialListings,
          views: totalViews,
          conversion: computeConversionRate(myInqs, totalViews, myPropsCount),
        })
      } catch (err) {
        console.error("Failed to fetch data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="animate-spin text-[#0a2540]" size={40} />
        <p className="text-slate-500 font-bold animate-pulse">Loading Kanharaj Seller Hub...</p>
      </div>
    )
  }

  const hasSubscription = user?.subscriptionPlan && user.subscriptionPlan !== "NONE"
  const subscriptionName = formatPlanBadge(user?.subscriptionPlan)
  const avgLqsScore = averageLqs(myProperties)
  const maxListings = planListingLimit(user?.subscriptionPlan)
  const verifiedCount = myProperties.filter(
    (p) => p.featured || ((p.images?.length ?? 0) >= 3 && (p.description?.length ?? 0) >= 80)
  ).length
  const lowLqsCount = myProperties.filter((p) => (p.lqs ?? 0) < 5).length
  const expiredCount = myProperties.filter((p) => (p.status || "").toUpperCase() === "EXPIRED").length
  const filteredLeads = countInquiriesByPeriod(myLeads, leadsFilter)
  const filteredResidentialLeads = filteredLeads.filter(
    (i) => !String(i.propertyType || "").includes("COMMERCIAL")
  ).length
  const todayLeadCount = leadsToday(myLeads)

  return (
    <div className="space-y-0 bg-[#F5F7FA] min-h-screen">

      {/* ── 1. Gold Profile Banner ── */}
      <div className="bg-gradient-to-r from-[#4A3B2C] via-[#6B563F] to-[#4A3B2C] text-white pt-10 pb-24 px-4 md:px-12 relative overflow-hidden rounded-b-[40px] md:rounded-b-[48px] shadow-sm">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-600 border-2 border-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-md overflow-hidden shrink-0">
              <span className="uppercase">{user?.name?.charAt(0) || "K"}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Hi {user?.name || "KANHARAJ"} Builder</h2>
                {hasSubscription && (
                  <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm uppercase tracking-wide">
                    ★ {subscriptionName}
                  </span>
                )}
              </div>
              <p className="text-yellow-100/80 text-sm font-medium">Hope you're having a great day!</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Content Grid ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-12 -mt-12 pb-16 relative z-20 space-y-6">

        {/* ── Row A: Stat Cards (3 mini stats) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Listing Quality Score */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-[#0a2540]/5 flex items-center justify-center shrink-0 text-[#0a2540]">
                <Star className="w-6 h-6 fill-[#0a2540]/20 text-[#0a2540]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{avgLqsScore || "—"}</span>
                  <span className="text-slate-400 text-sm font-bold">/10</span>
                </div>
                <p className="text-slate-500 text-xs font-bold truncate mt-0.5">Avg Listing Quality</p>
                <Link href="/listings" className="text-[#0a2540] hover:text-[#07192c] text-xs font-bold flex items-center gap-0.5 mt-1 transition-colors">
                  {lowLqsCount > 0 ? `Improve ${lowLqsCount}` : "View"} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Verified listings */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 text-yellow-600">
                <ShieldCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-2xl font-black text-slate-800">{verifiedCount}</span>
                <p className="text-slate-500 text-xs font-bold truncate mt-0.5">Verified / Complete Listings</p>
                <Link href="/listings" className="text-[#0a2540] hover:text-blue-800 text-xs font-bold flex items-center gap-0.5 mt-1 transition-colors">
                  Manage <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Total Leads */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-2xl font-black text-slate-800">{stats.leads}</span>
                <p className="text-slate-500 text-xs font-bold truncate mt-0.5">Total Leads</p>
                <Link href="/leads" className="text-[#0a2540] hover:text-blue-800 text-xs font-bold flex items-center gap-0.5 mt-1 transition-colors">
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar widgets placeholder (spans 1) */}
          <div className="lg:col-span-1">
            {/* Widget: Manage Sub-brokers */}
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
              <div className="relative z-10 space-y-1">
                <h4 className="text-sm font-black text-slate-800 leading-tight">Manage Sub-brokers</h4>
                <p className="text-slate-500 text-[10px] font-semibold leading-normal">Onboard your employees / partners as sub-brokers</p>
              </div>
              <div className="my-4 flex justify-center py-2">
                <svg viewBox="0 0 100 45" className="w-28 h-12">
                  <circle cx="30" cy="20" r="10" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1" />
                  <path d="M20 38 C 20 28, 40 28, 40 38" fill="#F472B6" />
                  <circle cx="30" cy="18" r="3" fill="#D01C7E" />
                  <circle cx="70" cy="20" r="10" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
                  <path d="M60 38 C 60 28, 80 28, 80 38" fill="#38BDF8" />
                  <circle cx="70" cy="18" r="3" fill="#0369A1" />
                  <circle cx="50" cy="16" r="11" fill="#EEF2F6" stroke="#94A3B8" strokeWidth="1.5" />
                  <path d="M38 38 C 38 25, 62 25, 62 38" fill="#475569" />
                  <circle cx="50" cy="14" r="3" fill="#0F172A" />
                </svg>
              </div>
              <div className="flex items-center justify-between relative z-10 pt-2 border-t border-slate-50">
                <button className="text-[#0a2540] hover:underline text-xs font-black flex items-center gap-0.5 transition-colors">
                  Add Sub-broker <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row B: Leads Summary + Listings Summary ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Leads Summary Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800">Leads Summary</h3>
              <div className="relative">
                <button
                  onClick={() => setLeadsDropdown(!leadsDropdown)}
                  className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-slate-800 transition-colors"
                >
                  {leadsFilter} <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {leadsDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 text-xs font-bold text-slate-600">
                    {["Last Week", "Last Month", "Last 3 Months"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setLeadsFilter(opt as typeof leadsFilter); setLeadsDropdown(false) }}
                        className={`block w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${leadsFilter === opt ? "text-[#0a2540]" : ""}`}
                      >{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Residential Leads */}
              <div className="border border-slate-100 rounded-xl p-4 hover:border-[#0a2540]/20 transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a2540]/5 flex items-center justify-center text-[#0a2540] shrink-0 group-hover:bg-[#0a2540]/10 transition-colors">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{filteredResidentialLeads}</p>
                    <p className="text-xs font-bold text-slate-500">Residential ({leadsFilter})</p>
                  </div>
                </div>
                {todayLeadCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0a2540]/5 text-[#0a2540] border border-[#0a2540]/10">
                      {todayLeadCount} today
                    </span>
                  </div>
                )}
              </div>

              {/* Commercial Leads */}
              <div className="border border-slate-100 rounded-xl p-4 hover:border-rose-200 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a2540]/5 flex items-center justify-center text-rose-500 shrink-0 group-hover:bg-rose-100 transition-colors">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{stats.commercialLeads}</p>
                    <p className="text-xs font-bold text-slate-500">Commercial</p>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Listings Summary Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800">Listings Summary</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Residential Listings */}
              <div className="flex items-center gap-4 border border-slate-100 rounded-xl p-4 hover:border-[#0a2540]/20 transition-colors">
                <div>
                  <p className="text-3xl font-black text-slate-800">{stats.residentialListings}</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Residential</p>
                </div>
                <CircularProgress value={stats.residentialListings} max={Math.max(stats.residentialListings, 1)} label="Live" color="#0a2540" size={64} />
              </div>

              {/* Commercial Listings */}
              <div className="flex items-center gap-4 border border-slate-100 rounded-xl p-4 hover:border-amber-200 transition-colors">
                <div>
                  <p className="text-3xl font-black text-slate-800">{stats.commercialListings}</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">Commercial</p>
                </div>
                <CircularProgress value={stats.commercialListings} max={Math.max(stats.commercialListings, 1)} label="Live" color="#F59E0B" size={64} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row C: Subscription Utilization ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-base font-black text-slate-800 mb-5">Subscription Utilization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Plan Usage */}
            <div className="flex items-center justify-between border border-slate-100 rounded-2xl p-5 hover:border-[#0a2540]/20 transition-colors bg-slate-50/50">
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-800">
                  {hasSubscription ? subscriptionName.replace("_", " ") : "No Active Plan"}
                </p>
                <p className={`text-xs font-bold ${hasSubscription ? "text-emerald-600" : "text-rose-500"}`}>
                  {hasSubscription ? `${stats.listings} of ${maxListings} slots used` : "Subscribe to list properties"}
                </p>
                <Link href="/subscription">
                  <button className="mt-1 px-4 py-1.5 rounded-full border border-[#0a2540] text-[#0a2540] text-[11px] font-black hover:bg-[#0a2540]/5 transition-colors">
                    Promote Listings
                  </button>
                </Link>
              </div>
              <CircularProgress
                value={stats.listings}
                max={maxListings}
                label="Listings"
                color="#0a2540"
                size={80}
              />
            </div>

            {/* Credit Balance */}
            <div className="flex items-center justify-between border border-slate-100 rounded-2xl p-5 hover:border-amber-200 transition-colors bg-slate-50/50">
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-800">Credit Balance</p>
                <Link href="/subscription">
                  <button className="mt-1 px-4 py-1.5 rounded-full border border-[#0a2540] text-[#0a2540] text-[11px] font-black hover:bg-[#0a2540]/5 transition-colors">
                    Boost Listings
                  </button>
                </Link>
              </div>
              <CircularProgress
                value={verifiedCount}
                max={Math.max(stats.listings, 1)}
                label="Verified"
                color="#F59E0B"
                size={80}
              />
            </div>
          </div>
        </div>

        {/* ── Row D: Self Verify + Expired Warning ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Self Verify Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between gap-6 relative overflow-hidden">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5 fill-teal-50" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Self Verify</h3>
                  <p className="text-xs text-slate-500 font-medium">Get a 'Verified' tag &amp; higher visibility in searches</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0 mt-0.5">✓</div>
                  <p className="text-xs font-semibold text-slate-600">
                    {lowLqsCount > 0
                      ? `Improve ${lowLqsCount} listing${lowLqsCount !== 1 ? "s" : ""} with more photos & description`
                      : "All listings meet quality guidelines"}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0 mt-0.5">↗</div>
                  <p className="text-xs font-semibold text-slate-600">
                    {verifiedCount} of {stats.listings} listings are verified-quality on your account
                  </p>
                </div>
              </div>
              <button className="text-[#0a2540] hover:underline text-xs font-bold block pt-1">Learn More</button>
            </div>
            <div className="flex items-center gap-4 border-l border-slate-100 pl-0 sm:pl-6 shrink-0">
              <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  {stats.listings > 0
                    ? `${Math.round((verifiedCount / stats.listings) * 100)}% verified`
                    : "No listings yet"}
                </p>
                <CircularProgress value={verifiedCount} max={Math.max(stats.listings, 1)} label="Listings" color="#0a2540" size={76} />
                <button className="text-xs font-black text-[#0a2540] hover:text-[#4d2ee0] flex items-center gap-0.5">
                  Verify now <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Analytics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-slate-800 text-base">Quick Analytics</h3>
              <span className="text-xs text-[#0a2540] font-bold">Real-time Data</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Live Listings</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{stats.listings}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Property Views</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{stats.views}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Conversion</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{stats.conversion}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Low LQS</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{lowLqsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row E: Expired Listings Warning ── */}
        {expiredCount > 0 && (
        <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Megaphone className="w-6 h-6 transform -rotate-12 fill-red-100" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded tracking-wide">Listings Reduced</span>
              <h4 className="text-base font-black text-red-900 leading-tight">{expiredCount} expired listing{expiredCount !== 1 ? "s" : ""}</h4>
              <p className="text-xs text-red-700/80 font-medium">Re-activate or update expired properties from your listings page.</p>
            </div>
          </div>
          <Link href="/listings">
            <button className="bg-[#00D289] hover:bg-[#00c07d] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all whitespace-nowrap">
              Manage Listings
            </button>
          </Link>
        </div>
        )}

        {/* ── Row F: Answer Customer Questions ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-black text-slate-800">Answer the Questions raised by customers</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">These are the questions raised by users who visited your listings</p>
          </div>
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <MessageCircle className="w-7 h-7" />
            </div>
            <p className="text-slate-500 font-bold text-sm">You have not been asked any question</p>
            <p className="text-slate-400 text-xs">Questions from buyers will appear here once they visit your listings</p>
          </div>
        </div>

        {/* ── Row G: FAQ + Customer Support ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Have Questions? */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800">Have Questions?</h3>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                Explore our FAQ section for commonly asked questions
              </p>
            </div>
            <div className="mt-auto">
              <button className="px-5 py-2 rounded-full border border-[#0a2540] text-[#0a2540] text-xs font-black hover:bg-[#0a2540]/5 transition-colors">
                Explore FAQ's
              </button>
            </div>
          </div>

          {/* Customer Support */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-black text-slate-800 mb-4">Customer Support</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Call Us */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-2 hover:border-[#0a2540]/20 hover:bg-[#0a2540]/5/20 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-[#0a2540]/5 flex items-center justify-center text-[#0a2540] group-hover:bg-[#0a2540]/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Call Us</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">{SUPPORT_PHONE}</p>
                </div>
              </div>

              {/* Email Us */}
              <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-2 hover:border-[#0a2540]/20 hover:bg-[#0a2540]/5/20 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-[#0a2540]/5 flex items-center justify-center text-[#0a2540] group-hover:bg-[#0a2540]/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">Email Us</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">{SUPPORT_EMAIL}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 font-semibold border-t border-slate-50 pt-4">
              Call Support Available from 10 AM to 6 PM (Mon to Sat)
            </p>
          </div>
        </div>

        {/* ── Row H: Support & Tips ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h4 className="text-sm font-black text-slate-800 mb-4">Support &amp; Tips</h4>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0a2540]/50 mt-2 shrink-0" />
              <p className="text-xs font-semibold text-slate-600 leading-normal">Add more photos to increase views by 40%.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              <p className="text-xs font-semibold text-slate-600 leading-normal">Verify your identity to get the Trusted Badge.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
              <p className="text-xs font-semibold text-slate-600 leading-normal">Upgrade to Expert Pro plan to unlock high-intent leads.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
